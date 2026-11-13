import db from '../config/db.js'
import { z } from 'zod'

const purchaseSchema = z.object({
  feed_type_id: z.coerce.number().int().positive(),
  supplier_id: z.union([
    z.coerce.number().int().positive(),
    z.literal(''),
    z.null(),
  ]).optional(),
  purchase_date: z.string().min(1, 'Purchase date is required'),
  quantity_kg: z.coerce.number().positive(),
  unit_price: z.coerce.number().min(0),
  invoice_number: z.string().trim().max(100).optional(),
  notes: z.string().trim().optional(),
})

// Get all feed purchases
export const getAllFeedPurchases = async (req, res) => {
  try {
    const [purchases] = await db.query(`
      SELECT fp.*, ft.feed_name, ft.brand, fs.supplier_name
      FROM feed_purchases fp
      INNER JOIN feed_types ft ON fp.feed_type_id = ft.id
      LEFT JOIN feed_suppliers fs ON fp.supplier_id = fs.id
      ORDER BY fp.purchase_date DESC, fp.id DESC
    `)

    res.status(200).json({
      success: true,
      total: purchases.length,
      purchases,
    })
  } catch (error) {
    console.error('Get Feed Purchases Error:', error.message)

    res.status(500).json({
      success: false,
      message: 'Failed to fetch feed purchases.',
    })
  }
}

// Create feed purchase
export const createFeedPurchase = async (req, res) => {
  try {
    const validation = purchaseSchema.safeParse(req.body)

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: validation.error.issues[0].message,
      })
    }

    const { feed_type_id, supplier_id, purchase_date, quantity_kg, unit_price, invoice_number, notes} = validation.data

    const connection = await db.getConnection()

    try {
      await connection.beginTransaction()

      // Check active feed type
      const [feedTypes] = await connection.query(
        `SELECT id FROM feed_types
         WHERE id = ? AND status = 'active'
         FOR UPDATE`,
        [feed_type_id]
      )

      if (feedTypes.length === 0) {
        await connection.rollback()

        return res.status(400).json({
          success: false,
          message: 'Selected feed type is not active or does not exist.',
        })
      }

      // Check supplier if selected
      if (supplier_id) {
        const [suppliers] = await connection.query(
          `SELECT id FROM feed_suppliers
           WHERE id = ? AND status = 'active'`,
          [supplier_id]
        )

        if (suppliers.length === 0) {
          await connection.rollback()

          return res.status(400).json({
            success: false,
            message: 'Selected supplier is not active or does not exist.',
          })
        }
      }

      const total_cost = Number(
        (quantity_kg * unit_price).toFixed(2)
      )

      const [result] = await connection.query(
        `INSERT INTO feed_purchases ( feed_type_id, supplier_id, purchase_date, quantity_kg, unit_price, total_cost, invoice_number, notes, created_by ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [ feed_type_id, supplier_id || null, purchase_date, quantity_kg, unit_price, total_cost, invoice_number || null, notes || null, req.user.id, ])

      await connection.commit()

      res.status(201).json({
        success: true,
        message: 'Feed purchase recorded successfully.',
        purchaseId: result.insertId,
        total_cost,
      })
    } 
    catch (error) {
      await connection.rollback()
      throw error
    } 
    finally {
      connection.release()
    }
  } 
  catch (error) {
    console.error('Create Feed Purchase Error:', error.message)

    res.status(500).json({
      success: false,
      message: 'Failed to record feed purchase.',
    })
  }
}

// Update feed purchase
export const updateFeedPurchase = async (req, res) => {
  try {
    const id = Number(req.params.id)

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid purchase ID.',
      })
    }

    const validation = purchaseSchema.safeParse(req.body)

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: validation.error.issues[0].message,
      })
    }

    const { feed_type_id, supplier_id, purchase_date, quantity_kg, unit_price, invoice_number, notes} = validation.data

    const connection = await db.getConnection()

    try {
      await connection.beginTransaction()

      const [existing] = await connection.query(
        'SELECT id FROM feed_purchases WHERE id = ? FOR UPDATE',
        [id]
      )

      if (existing.length === 0) {
        await connection.rollback()

        return res.status(404).json({
          success: false,
          message: 'Feed purchase not found.',
        })
      }

      const [feedTypes] = await connection.query(
        `SELECT id FROM feed_types
         WHERE id = ? AND status = 'active'`,
        [feed_type_id]
      )

      if (feedTypes.length === 0) {
        await connection.rollback()

        return res.status(400).json({
          success: false,
          message: 'Selected feed type is not active or does not exist.',
        })
      }

      if (supplier_id) {
        const [suppliers] = await connection.query(
          `SELECT id FROM feed_suppliers
           WHERE id = ? AND status = 'active'`,
          [supplier_id]
        )

        if (suppliers.length === 0) {
          await connection.rollback()

          return res.status(400).json({
            success: false,
            message: 'Selected supplier is not active or does not exist.',
          })
        }
      }

      const total_cost = Number(
        (quantity_kg * unit_price).toFixed(2)
      )

      await connection.query(
        `UPDATE feed_purchases
         SET feed_type_id = ?,supplier_id = ?, purchase_date = ?, quantity_kg = ?, unit_price = ?,total_cost = ?,
         invoice_number = ?, notes = ?
         WHERE id = ?`,
        [ feed_type_id, supplier_id || null, purchase_date, quantity_kg, unit_price, total_cost, invoice_number || null,
          notes || null, id] )

      await connection.commit()

      res.status(200).json({
        success: true,
        message: 'Feed purchase updated successfully.',
        total_cost,
      })
    } 
    catch (error) {
      await connection.rollback()
      throw error
    } 
    finally {
      connection.release()
    }
  } 
  catch (error) {
    console.error('Update Feed Purchase Error:', error.message)

    res.status(500).json({
      success: false,
      message: 'Failed to update feed purchase.',
    })
  }
}