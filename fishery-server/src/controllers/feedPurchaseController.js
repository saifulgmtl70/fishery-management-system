import db from '../config/db.js'
import { z } from 'zod'

const purchaseSchema = z.object({
  feed_name: z.string().trim().min(1, 'Feed name is required').max(120),
  brand: z.string().trim().max(100).optional().default(''),
  supplier_name: z.string().trim().max(150).optional().default(''),
  purchase_date: z.string().min(1, 'Purchase date is required'),
  quantity_kg: z.coerce.number().positive('Quantity must be greater than 0'),
  unit_price: z.coerce.number().min(0, 'Unit price cannot be negative'),
  invoice_number: z.string().trim().max(100).optional().default(''),
  notes: z.string().trim().optional().default(''),
})

const getOrCreateFeedType = async (connection, feedName, brand) => {
  const [existing] = await connection.execute(
    'SELECT id, brand FROM feed_types WHERE feed_name = ? FOR UPDATE',
    [feedName]
  )

  if (existing.length > 0) {
    const feedTypeId = existing[0].id

    if (brand && existing[0].brand !== brand) {
      await connection.execute(
        'UPDATE feed_types SET brand = ? WHERE id = ?',
        [brand, feedTypeId]
      )
    }

    return feedTypeId
  }

  const [result] = await connection.execute(
    `INSERT INTO feed_types (feed_name, brand, status)
     VALUES (?, ?, 'active')`,
    [feedName, brand || null]
  )

  return result.insertId
}

const getOrCreateSupplier = async (connection, supplierName) => {
  if (!supplierName) return null

  const [existing] = await connection.execute(
    'SELECT id FROM feed_suppliers WHERE supplier_name = ? FOR UPDATE',
    [supplierName]
  )

  if (existing.length > 0) {
    return existing[0].id
  }

  const [result] = await connection.execute(
    `INSERT INTO feed_suppliers (supplier_name, status)
     VALUES (?, 'active')`,
    [supplierName]
  )

  return result.insertId
}

// GET ALL PURCHASES
export const getAllFeedPurchases = async (req, res) => {
  try {
    const [purchases] = await db.execute(
      `SELECT
          fp.*,
          ft.feed_name,
          ft.brand,
          fs.supplier_name
       FROM feed_purchases fp
       INNER JOIN feed_types ft ON fp.feed_type_id = ft.id
       LEFT JOIN feed_suppliers fs ON fp.supplier_id = fs.id
       ORDER BY fp.purchase_date DESC, fp.id DESC`
    )

    return res.status(200).json({
      success: true,
      purchases,
    })
  } catch (error) {
    console.error('Get Feed Purchases Error:', error)

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch feed purchases.',
    })
  }
}

// CREATE PURCHASE
export const createFeedPurchase = async (req, res) => {
  const validation = purchaseSchema.safeParse(req.body)

  if (!validation.success) {
    return res.status(400).json({
      success: false,
      message: validation.error.issues[0]?.message || 'Invalid purchase data.',
    })
  }

  let connection

  try {
    connection = await db.getConnection()
    await connection.beginTransaction()

    const data = validation.data

    const feedTypeId = await getOrCreateFeedType(
      connection,
      data.feed_name,
      data.brand
    )

    const supplierId = await getOrCreateSupplier(
      connection,
      data.supplier_name
    )

    const totalCost = Number(
      (data.quantity_kg * data.unit_price).toFixed(2)
    )

    const [result] = await connection.execute(
      `INSERT INTO feed_purchases
       (
         feed_type_id,
         supplier_id,
         purchase_date,
         quantity_kg,
         unit_price,
         total_cost,
         invoice_number,
         notes,
         created_by
       )
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        feedTypeId,
        supplierId,
        data.purchase_date,
        data.quantity_kg,
        data.unit_price,
        totalCost,
        data.invoice_number || null,
        data.notes || null,
        req.user?.id || null,
      ]
    )

    await connection.commit()

    return res.status(201).json({
      success: true,
      message: 'Feed purchase recorded successfully.',
      purchaseId: result.insertId,
    })
  } catch (error) {
    if (connection) await connection.rollback()

    console.error('Create Feed Purchase Error:', error)

    return res.status(500).json({
      success: false,
      message: 'Failed to record feed purchase.',
    })
  } finally {
    if (connection) connection.release()
  }
}

// UPDATE PURCHASE
export const updateFeedPurchase = async (req, res) => {
  const purchaseId = Number(req.params.id)

  if (!Number.isInteger(purchaseId) || purchaseId <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Invalid purchase ID.',
    })
  }

  const validation = purchaseSchema.safeParse(req.body)

  if (!validation.success) {
    return res.status(400).json({
      success: false,
      message: validation.error.issues[0]?.message || 'Invalid purchase data.',
    })
  }

  let connection

  try {
    connection = await db.getConnection()
    await connection.beginTransaction()

    const [existingPurchase] = await connection.execute(
      'SELECT id FROM feed_purchases WHERE id = ? FOR UPDATE',
      [purchaseId]
    )

    if (existingPurchase.length === 0) {
      await connection.rollback()

      return res.status(404).json({
        success: false,
        message: 'Feed purchase not found.',
      })
    }

    const data = validation.data

    const feedTypeId = await getOrCreateFeedType(
      connection,
      data.feed_name,
      data.brand
    )

    const supplierId = await getOrCreateSupplier(
      connection,
      data.supplier_name
    )

    const totalCost = Number(
      (data.quantity_kg * data.unit_price).toFixed(2)
    )

    await connection.execute(
      `UPDATE feed_purchases
       SET
         feed_type_id = ?,
         supplier_id = ?,
         purchase_date = ?,
         quantity_kg = ?,
         unit_price = ?,
         total_cost = ?,
         invoice_number = ?,
         notes = ?
       WHERE id = ?`,
      [
        feedTypeId,
        supplierId,
        data.purchase_date,
        data.quantity_kg,
        data.unit_price,
        totalCost,
        data.invoice_number || null,
        data.notes || null,
        purchaseId,
      ]
    )

    await connection.commit()

    return res.status(200).json({
      success: true,
      message: 'Feed purchase updated successfully.',
    })
  } catch (error) {
    if (connection) await connection.rollback()

    console.error('Update Feed Purchase Error:', error)

    return res.status(500).json({
      success: false,
      message: 'Failed to update feed purchase.',
    })
  } finally {
    if (connection) connection.release()
  }
}