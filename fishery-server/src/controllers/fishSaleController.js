import { randomUUID } from 'crypto'
import { z } from 'zod'

import db from '../config/db.js'

// ==========================================
// VALIDATION SCHEMAS
// ==========================================

const saleSchema = z.object({
  dealer_id: z.coerce.number().int().positive(),

  pond_id: z.coerce.number().int().positive(),

  sale_date: z.string().min(1),

  paid_amount: z.preprocess(
    (value) =>
      value === '' || value === null || value === undefined
        ? 0
        : value,
    z.coerce.number().min(0)
  ),

  payment_method: z.enum([
    'cash',
    'bank',
    'mobile_banking',
    'other',
  ]).default('cash'),

  notes: z.preprocess(
    (value) =>
      value === '' || value === null || value === undefined
        ? null
        : value,
    z.string().nullable()
  ),

  items: z.array(
    z.object({
      species_id: z.coerce.number().int().positive(),

      quantity_kg: z.coerce.number().positive(),

      unit_price_per_kg: z.coerce.number().positive(),

      notes: z.preprocess(
        (value) =>
          value === '' || value === null || value === undefined
            ? null
            : value,
        z.string().nullable()
      ),
    })
  ).min(1),
})

const paymentSchema = z.object({
  payment_date: z.string().min(1),

  amount: z.coerce.number().positive(),

  payment_method: z.enum([
    'cash',
    'bank',
    'mobile_banking',
    'other',
  ]).default('cash'),

  reference_number: z.preprocess(
    (value) =>
      value === '' || value === null || value === undefined
        ? null
        : value,
    z.string().nullable()
  ),

  notes: z.preprocess(
    (value) =>
      value === '' || value === null || value === undefined
        ? null
        : value,
    z.string().nullable()
  ),
})

// ==========================================
// DATE HELPERS
// ==========================================

const getDhakaDate = () => {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Dhaka',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
}

const isValidDate = (date) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return false
  }

  const parsedDate = new Date(`${date}T00:00:00Z`)

  return (
    !Number.isNaN(parsedDate.getTime()) &&
    parsedDate.toISOString().slice(0, 10) === date
  )
}

// ==========================================
// GET ALL FISH SALES
// ==========================================

export const getAllFishSales = async (req, res) => {
  try {
    const [sales] = await db.execute(`
      SELECT
        fs.id,
        fs.invoice_number,
        fs.dealer_id,
        d.dealer_name,
        fs.pond_id,
        p.pond_name,
        fs.sale_date,
        fs.total_amount,
        fs.paid_amount,
        fs.due_amount,
        fs.payment_status,
        fs.notes,
        fs.created_at
      FROM fish_sales fs
      INNER JOIN dealers d
        ON fs.dealer_id = d.id
      LEFT JOIN ponds p
        ON fs.pond_id = p.id
      ORDER BY fs.sale_date DESC, fs.id DESC
    `)

    const [items] = await db.execute(`
      SELECT
        fsi.id,
        fsi.sale_id,
        fsi.species_id,
        sp.species_name,
        fsi.harvest_id,
        fsi.quantity_kg,
        fsi.unit_price_per_kg,
        fsi.subtotal,
        fsi.notes
      FROM fish_sale_items fsi
      LEFT JOIN fish_species sp
        ON fsi.species_id = sp.id
      ORDER BY fsi.id ASC
    `)

    const [payments] = await db.execute(`
      SELECT
        id,
        sale_id,
        payment_date,
        amount,
        payment_method,
        reference_number,
        notes,
        created_at
      FROM fish_sale_payments
      ORDER BY payment_date ASC, id ASC
    `)

    const itemsBySale = {}
    const paymentsBySale = {}

    for (const item of items) {
      if (!itemsBySale[item.sale_id]) {
        itemsBySale[item.sale_id] = []
      }

      itemsBySale[item.sale_id].push(item)
    }

    for (const payment of payments) {
      if (!paymentsBySale[payment.sale_id]) {
        paymentsBySale[payment.sale_id] = []
      }

      paymentsBySale[payment.sale_id].push(payment)
    }

    const salesWithDetails = sales.map((sale) => ({
      ...sale,
      items: itemsBySale[sale.id] || [],
      payments: paymentsBySale[sale.id] || [],
    }))

    return res.status(200).json({
      success: true,
      total: salesWithDetails.length,
      sales: salesWithDetails,
    })
  }
  catch (error) {
    console.error('Get Fish Sales Error:', error)

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch fish sales records.',
    })
  }
}

// ==========================================
// CREATE FISH SALE
// ==========================================

export const createFishSale = async (req, res) => {
  const parsed = saleSchema.safeParse(req.body)

  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: 'Invalid fish sale information.',
      errors: parsed.error.flatten().fieldErrors,
    })
  }

  const {
    dealer_id,
    pond_id,
    sale_date,
    paid_amount,
    payment_method,
    notes,
    items,
  } = parsed.data

  // Validate sale date
  if (!isValidDate(sale_date)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid sale date.',
    })
  }

  if (sale_date > getDhakaDate()) {
    return res.status(400).json({
      success: false,
      message: 'Sale date cannot be in the future.',
    })
  }

  // Prevent duplicate species in the same invoice
  const speciesIds = items.map((item) => item.species_id)

  if (new Set(speciesIds).size !== speciesIds.length) {
    return res.status(400).json({
      success: false,
      message: 'A fish species cannot be repeated in the same invoice.',
    })
  }

  let connection
  let transactionStarted = false

  try {
    connection = await db.getConnection()

    await connection.beginTransaction()
    transactionStarted = true

    // ==========================================
    // CHECK DEALER
    // ==========================================

    const [dealers] = await connection.execute(
      `SELECT id, dealer_name, status
       FROM dealers
       WHERE id = ?
       FOR UPDATE`,
      [dealer_id]
    )

    if (dealers.length === 0) {
      await connection.rollback()
      transactionStarted = false

      return res.status(404).json({
        success: false,
        message: 'Dealer not found.',
      })
    }

    if (dealers[0].status !== 'active') {
      await connection.rollback()
      transactionStarted = false

      return res.status(400).json({
        success: false,
        message: 'Cannot create a sale for an inactive dealer.',
      })
    }

    // ==========================================
    // CHECK AND LOCK POND
    // ==========================================

    const [ponds] = await connection.execute(
      `SELECT id, pond_name
       FROM ponds
       WHERE id = ?
       FOR UPDATE`,
      [pond_id]
    )

    if (ponds.length === 0) {
      await connection.rollback()
      transactionStarted = false

      return res.status(404).json({
        success: false,
        message: 'Pond not found.',
      })
    }

    // ==========================================
    // CHECK FISH SPECIES, STOCK AND SALE AMOUNT
    // ==========================================

    const validatedItems = []
    let totalAmount = 0

    for (const item of items) {
      // Check species
      const [species] = await connection.execute(
        `SELECT id, species_name, status
         FROM fish_species
         WHERE id = ?`,
        [item.species_id]
      )

      if (species.length === 0) {
        await connection.rollback()
        transactionStarted = false

        return res.status(404).json({
          success: false,
          message: `Fish species ${item.species_id} not found.`,
        })
      }

      if (species[0].status !== 'active') {
        await connection.rollback()
        transactionStarted = false

        return res.status(400).json({
          success: false,
          message: `${species[0].species_name} is inactive.`,
        })
      }

      // ==========================================
      // CHECK AVAILABLE FISH STOCK
      // ==========================================

      const [stockRows] = await connection.execute(
        `SELECT
          COALESCE((
            SELECT SUM(fs.total_weight_kg)
            FROM fish_stockings fs
            WHERE fs.pond_id = ?
              AND fs.species_id = ?
          ), 0) AS total_stocked,

          COALESCE((
            SELECT SUM(fm.total_weight_kg)
            FROM fish_mortalities fm
            INNER JOIN fish_stockings fs
              ON fm.stocking_id = fs.id
            WHERE fs.pond_id = ?
              AND fs.species_id = ?
          ), 0) AS total_mortality,

          COALESCE((
            SELECT SUM(fsi.quantity_kg)
            FROM fish_sale_items fsi
            INNER JOIN fish_sales fss
              ON fsi.sale_id = fss.id
            WHERE fss.pond_id = ?
              AND fsi.species_id = ?
          ), 0) AS total_sold`,
        [
          pond_id,
          item.species_id,
          pond_id,
          item.species_id,
          pond_id,
          item.species_id,
        ]
      )

      const totalStocked = Number(
        stockRows[0].total_stocked
      )

      const totalMortality = Number(
        stockRows[0].total_mortality
      )

      const totalSold = Number(
        stockRows[0].total_sold
      )

      const availableStock = Number(
        (totalStocked - totalMortality - totalSold).toFixed(3)
      )

      // Prevent selling more fish than available stock
      if (item.quantity_kg > availableStock) {
        await connection.rollback()
        transactionStarted = false

        return res.status(400).json({
          success: false,
          message: `Insufficient fish stock for ${species[0].species_name}.`,
          stock_details: {
            total_stocked_kg: totalStocked,
            total_mortality_kg: totalMortality,
            total_sold_kg: totalSold,
            available_stock_kg: availableStock,
            requested_quantity_kg: item.quantity_kg,
          },
        })
      }

      // ==========================================
      // CALCULATE SUBTOTAL
      // ==========================================

      const subtotal = Number(
        (item.quantity_kg * item.unit_price_per_kg).toFixed(2)
      )

      totalAmount += subtotal

      validatedItems.push({
        ...item,
        subtotal,
      })
    }

    totalAmount = Number(totalAmount.toFixed(2))

    // ==========================================
    // CHECK PAYMENT AMOUNT
    // ==========================================

    if (paid_amount > totalAmount) {
      await connection.rollback()
      transactionStarted = false

      return res.status(400).json({
        success: false,
        message: 'Paid amount cannot exceed the total sale amount.',
        calculations: {
          total_amount: totalAmount,
          paid_amount,
        },
      })
    }

    // ==========================================
    // CALCULATE PAYMENT SUMMARY
    // ==========================================

    const dueAmount = Number(
      (totalAmount - paid_amount).toFixed(2)
    )

    let paymentStatus = 'unpaid'

    if (paid_amount > 0 && dueAmount > 0) {
      paymentStatus = 'partial'
    }
    else if (dueAmount === 0) {
      paymentStatus = 'paid'
    }

    // ==========================================
    // GENERATE INVOICE NUMBER
    // ==========================================

    const invoiceNumber =
      `FS-${sale_date.replaceAll('-', '')}-${randomUUID().slice(0, 8).toUpperCase()}`

    // ==========================================
    // INSERT FISH SALE
    // ==========================================

    const [saleResult] = await connection.execute(
      `INSERT INTO fish_sales (
        invoice_number,
        dealer_id,
        pond_id,
        sale_date,
        total_amount,
        paid_amount,
        due_amount,
        payment_status,
        notes,
        created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        invoiceNumber,
        dealer_id,
        pond_id,
        sale_date,
        totalAmount,
        paid_amount,
        dueAmount,
        paymentStatus,
        notes,
        req.user?.id || null,
      ]
    )

    const saleId = saleResult.insertId

    // ==========================================
    // INSERT SALE ITEMS
    // ==========================================

    for (const item of validatedItems) {
      await connection.execute(
        `INSERT INTO fish_sale_items (
          sale_id,
          species_id,
          harvest_id,
          quantity_kg,
          unit_price_per_kg,
          subtotal,
          notes
        ) VALUES (?, ?, NULL, ?, ?, ?, ?)`,
        [
          saleId,
          item.species_id,
          item.quantity_kg,
          item.unit_price_per_kg,
          item.subtotal,
          item.notes,
        ]
      )
    }

    // ==========================================
    // SAVE INITIAL PAYMENT
    // ==========================================

    if (paid_amount > 0) {
      await connection.execute(
        `INSERT INTO fish_sale_payments (
          sale_id,
          payment_date,
          amount,
          payment_method
        ) VALUES (?, ?, ?, ?)`,
        [
          saleId,
          sale_date,
          paid_amount,
          payment_method,
        ]
      )
    }

    // ==========================================
    // COMMIT TRANSACTION
    // ==========================================

    await connection.commit()
    transactionStarted = false

    return res.status(201).json({
      success: true,
      message: 'Fish sale created successfully.',
      sale: {
        id: saleId,
        invoice_number: invoiceNumber,
        dealer_id,
        pond_id,
        sale_date,
        total_amount: totalAmount,
        paid_amount,
        due_amount: dueAmount,
        payment_status: paymentStatus,
        items: validatedItems,
      },
    })
  }
  catch (error) {
    if (connection && transactionStarted) {
      await connection.rollback()
    }

    console.error('Create Fish Sale Error:', error)

    return res.status(500).json({
      success: false,
      message: 'Failed to create fish sale.',
    })
  }
  finally {
    if (connection) {
      connection.release()
    }
  }
}

// ==========================================
// ADD PAYMENT TO EXISTING SALE
// ==========================================

export const addFishSalePayment = async (req, res) => {
  const saleId = Number(req.params.id)

  const parsed = paymentSchema.safeParse(req.body)

  if (!Number.isInteger(saleId) || saleId <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Invalid sale ID.',
    })
  }

  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: 'Invalid payment information.',
      errors: parsed.error.flatten().fieldErrors,
    })
  }

  const {
    payment_date,
    amount,
    payment_method,
    reference_number,
    notes,
  } = parsed.data

  // Validate payment date
  if (!isValidDate(payment_date)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid payment date.',
    })
  }

  if (payment_date > getDhakaDate()) {
    return res.status(400).json({
      success: false,
      message: 'Payment date cannot be in the future.',
    })
  }

  let connection
  let transactionStarted = false

  try {
    connection = await db.getConnection()

    await connection.beginTransaction()
    transactionStarted = true

    // ==========================================
    // FIND SALE AND LOCK RECORD
    // ==========================================

    const [sales] = await connection.execute(
      `SELECT
        id,
        DATE_FORMAT(sale_date, '%Y-%m-%d') AS sale_date,
        total_amount,
        paid_amount,
        due_amount
      FROM fish_sales
      WHERE id = ?
      FOR UPDATE`,
      [saleId]
    )

    if (sales.length === 0) {
      await connection.rollback()
      transactionStarted = false

      return res.status(404).json({
        success: false,
        message: 'Sale record not found.',
      })
    }

    const sale = sales[0]

    // ==========================================
    // VALIDATE PAYMENT DATE
    // ==========================================

    if (payment_date < String(sale.sale_date).slice(0, 10)) {
      await connection.rollback()
      transactionStarted = false

      return res.status(400).json({
        success: false,
        message: 'Payment date cannot be earlier than sale date.',
      })
    }

    // ==========================================
    // CHECK REMAINING DUE
    // ==========================================

    const currentDue = Number(sale.due_amount)

    if (currentDue <= 0) {
      await connection.rollback()
      transactionStarted = false

      return res.status(400).json({
        success: false,
        message: 'This sale has no remaining due amount.',
      })
    }

    if (amount > currentDue) {
      await connection.rollback()
      transactionStarted = false

      return res.status(400).json({
        success: false,
        message: 'Payment cannot exceed the remaining due amount.',
        remaining_due: currentDue,
      })
    }

    // ==========================================
    // CALCULATE UPDATED PAYMENT SUMMARY
    // ==========================================

    const newPaidAmount = Number(
      (Number(sale.paid_amount) + amount).toFixed(2)
    )

    const newDueAmount = Number(
      (Number(sale.total_amount) - newPaidAmount).toFixed(2)
    )

    const paymentStatus = newDueAmount === 0
      ? 'paid'
      : 'partial'

    // ==========================================
    // INSERT PAYMENT HISTORY
    // ==========================================

    const [paymentResult] = await connection.execute(
      `INSERT INTO fish_sale_payments (
        sale_id,
        payment_date,
        amount,
        payment_method,
        reference_number,
        notes
      ) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        saleId,
        payment_date,
        amount,
        payment_method,
        reference_number,
        notes,
      ]
    )

    // ==========================================
    // UPDATE SALE PAYMENT SUMMARY
    // ==========================================

    await connection.execute(
      `UPDATE fish_sales
       SET paid_amount = ?,
           due_amount = ?,
           payment_status = ?
       WHERE id = ?`,
      [
        newPaidAmount,
        newDueAmount,
        paymentStatus,
        saleId,
      ]
    )

    // ==========================================
    // COMMIT TRANSACTION
    // ==========================================

    await connection.commit()
    transactionStarted = false

    return res.status(201).json({
      success: true,
      message: 'Payment added successfully.',
      payment: {
        id: paymentResult.insertId,
        sale_id: saleId,
        payment_date,
        amount,
        payment_method,
        reference_number,
        notes,
      },
      sale: {
        total_amount: Number(sale.total_amount),
        paid_amount: newPaidAmount,
        due_amount: newDueAmount,
        payment_status: paymentStatus,
      },
    })
  }
  catch (error) {
    if (connection && transactionStarted) {
      await connection.rollback()
    }

    console.error('Add Fish Sale Payment Error:', error)

    return res.status(500).json({
      success: false,
      message: 'Failed to add payment.',
    })
  }
  finally {
    if (connection) {
      connection.release()
    }
  }
}