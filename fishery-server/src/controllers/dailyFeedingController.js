import db from '../config/db.js'
import { z } from 'zod'

// ==========================================
// VALIDATION SCHEMA
// ==========================================

const dailyFeedingSchema = z.object({
  pond_id: z.coerce.number().int().positive(),
  feed_type_id: z.coerce.number().int().positive(),
  feeding_date: z.string().min(1),
  quantity_kg: z.coerce.number().positive(),
  feeding_time: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
})

// ==========================================
// GET ALL DAILY FEEDING RECORDS
// ==========================================

export const getAllDailyFeedings = async (req, res) => {
  try {
    const [feedings] = await db.query(`
      SELECT
        df.id,
        df.pond_id,
        p.pond_name,
        df.feed_type_id,
        ft.feed_name,
        ft.brand,
        DATE_FORMAT(df.feeding_date, '%Y-%m-%d') AS feeding_date,
        df.quantity_kg,
        df.feeding_time,
        df.notes,
        df.created_at
      FROM daily_feedings df
      INNER JOIN ponds p ON df.pond_id = p.id
      INNER JOIN feed_types ft ON df.feed_type_id = ft.id
      ORDER BY df.feeding_date DESC, df.id DESC
    `)

    return res.status(200).json({
      success: true,
      total: feedings.length,
      feedings,
    })
  } catch (error) {
    console.error('Get Daily Feedings Error:', error)

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch daily feeding records.',
    })
  }
}

// ==========================================
// CREATE DAILY FEEDING
// ==========================================

export const createDailyFeeding = async (req, res) => {
  const validation = dailyFeedingSchema.safeParse(req.body)

  if (!validation.success) {
    return res.status(400).json({
      success: false,
      message: 'Invalid feeding information.',
      errors: validation.error.flatten().fieldErrors,
    })
  }

  const {
    pond_id,
    feed_type_id,
    feeding_date,
    quantity_kg,
    feeding_time,
    notes,
  } = validation.data

  let connection

  try {
    connection = await db.getConnection()
    await connection.beginTransaction()

    const [ponds] = await connection.query(
      `SELECT id FROM ponds
       WHERE id = ? AND status = 'active'
       FOR UPDATE`,
      [pond_id]
    )

    if (ponds.length === 0) {
      await connection.rollback()

      return res.status(400).json({
        success: false,
        message: 'Selected pond is not active or does not exist.',
      })
    }

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

    const [stockRows] = await connection.query(
      `SELECT
        COALESCE((
          SELECT SUM(quantity_kg)
          FROM feed_purchases
          WHERE feed_type_id = ?
        ), 0) -
        COALESCE((
          SELECT SUM(quantity_kg)
          FROM daily_feedings
          WHERE feed_type_id = ?
        ), 0) AS available_stock`,
      [feed_type_id, feed_type_id]
    )

    const availableStock = Number(stockRows[0].available_stock)

    if (quantity_kg > availableStock) {
      await connection.rollback()

      return res.status(400).json({
        success: false,
        message: `Insufficient feed stock. Available: ${availableStock.toFixed(3)} kg.`,
        available_stock: availableStock,
      })
    }

    const [result] = await connection.query(
      `INSERT INTO daily_feedings (
        pond_id,
        feed_type_id,
        feeding_date,
        quantity_kg,
        feeding_time,
        notes,
        created_by
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        pond_id,
        feed_type_id,
        feeding_date,
        quantity_kg,
        feeding_time || null,
        notes || null,
        req.user.id,
      ]
    )

    await connection.commit()

    return res.status(201).json({
      success: true,
      message: 'Daily feeding record saved successfully.',
      feedingId: result.insertId,
      available_stock: Number(
        (availableStock - quantity_kg).toFixed(3)
      ),
    })
  } catch (error) {
    if (connection) await connection.rollback()

    console.error('Create Daily Feeding Error:', error)

    return res.status(500).json({
      success: false,
      message: 'Failed to save daily feeding record.',
    })
  } finally {
    if (connection) connection.release()
  }
}

// ==========================================
// UPDATE DAILY FEEDING
// ==========================================

export const updateDailyFeeding = async (req, res) => {
  const id = Number(req.params.id)

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Invalid feeding record ID.',
    })
  }

  const validation = dailyFeedingSchema.safeParse(req.body)

  if (!validation.success) {
    return res.status(400).json({
      success: false,
      message: 'Invalid feeding information.',
      errors: validation.error.flatten().fieldErrors,
    })
  }

  const {
    pond_id,
    feed_type_id,
    feeding_date,
    quantity_kg,
    feeding_time,
    notes,
  } = validation.data

  let connection

  try {
    connection = await db.getConnection()
    await connection.beginTransaction()

    // Lock existing feeding record
    const [existingRows] = await connection.query(
      `SELECT id, feed_type_id, quantity_kg
       FROM daily_feedings
       WHERE id = ?
       FOR UPDATE`,
      [id]
    )

    if (existingRows.length === 0) {
      await connection.rollback()

      return res.status(404).json({
        success: false,
        message: 'Daily feeding record not found.',
      })
    }

    const oldRecord = existingRows[0]
    const oldFeedTypeId = Number(oldRecord.feed_type_id)
    const oldQuantity = Number(oldRecord.quantity_kg)

    // Lock feed types in consistent order
    const feedTypeIds = [...new Set([
      oldFeedTypeId,
      feed_type_id,
    ])].sort((a, b) => a - b)

    const [feedTypes] = await connection.query(
      `SELECT id
       FROM feed_types
       WHERE id IN (${feedTypeIds.map(() => '?').join(',')})
       AND status = 'active'
       ORDER BY id
       FOR UPDATE`,
      feedTypeIds
    )

    if (feedTypes.length !== feedTypeIds.length) {
      await connection.rollback()

      return res.status(400).json({
        success: false,
        message: 'Selected feed type is not active or does not exist.',
      })
    }

    // Verify active pond
    const [ponds] = await connection.query(
      `SELECT id FROM ponds
       WHERE id = ? AND status = 'active'
       FOR UPDATE`,
      [pond_id]
    )

    if (ponds.length === 0) {
      await connection.rollback()

      return res.status(400).json({
        success: false,
        message: 'Selected pond is not active or does not exist.',
      })
    }

    // Calculate stock excluding current record
    const [stockRows] = await connection.query(
      `SELECT
        COALESCE((
          SELECT SUM(quantity_kg)
          FROM feed_purchases
          WHERE feed_type_id = ?
        ), 0) -
        COALESCE((
          SELECT SUM(quantity_kg)
          FROM daily_feedings
          WHERE feed_type_id = ?
          AND id != ?
        ), 0) AS available_stock`,
      [feed_type_id, feed_type_id, id]
    )

    const availableStock = Number(stockRows[0].available_stock)

    if (quantity_kg > availableStock) {
      await connection.rollback()

      return res.status(400).json({
        success: false,
        message: `Insufficient feed stock. Available: ${availableStock.toFixed(3)} kg.`,
        available_stock: availableStock,
      })
    }

    await connection.query(
      `UPDATE daily_feedings
       SET
         pond_id = ?,
         feed_type_id = ?,
         feeding_date = ?,
         quantity_kg = ?,
         feeding_time = ?,
         notes = ?
       WHERE id = ?`,
      [
        pond_id,
        feed_type_id,
        feeding_date,
        quantity_kg,
        feeding_time || null,
        notes || null,
        id,
      ]
    )

    await connection.commit()

    return res.status(200).json({
      success: true,
      message: 'Daily feeding record updated successfully.',
      available_stock: Number(
        (availableStock - quantity_kg).toFixed(3)
      ),
    })
  } catch (error) {
    if (connection) await connection.rollback()

    console.error('Update Daily Feeding Error:', error)

    return res.status(500).json({
      success: false,
      message: 'Failed to update daily feeding record.',
    })
  } finally {
    if (connection) connection.release()
  }
}

// ==========================================
// DELETE DAILY FEEDING
// ==========================================

export const deleteDailyFeeding = async (req, res) => {
  const id = Number(req.params.id)

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Invalid feeding record ID.',
    })
  }

  let connection

  try {
    connection = await db.getConnection()
    await connection.beginTransaction()

    const [existingRows] = await connection.query(
      `SELECT id, feed_type_id
       FROM daily_feedings
       WHERE id = ?
       FOR UPDATE`,
      [id]
    )

    if (existingRows.length === 0) {
      await connection.rollback()

      return res.status(404).json({
        success: false,
        message: 'Daily feeding record not found.',
      })
    }

    const feedTypeId = Number(existingRows[0].feed_type_id)

    // Lock feed type
    const [feedTypes] = await connection.query(
      `SELECT id FROM feed_types
       WHERE id = ?
       FOR UPDATE`,
      [feedTypeId]
    )

    if (feedTypes.length === 0) {
      await connection.rollback()

      return res.status(404).json({
        success: false,
        message: 'Feed type not found.',
      })
    }

    await connection.query(
      'DELETE FROM daily_feedings WHERE id = ?',
      [id]
    )

    await connection.commit()

    return res.status(200).json({
      success: true,
      message: 'Daily feeding record deleted successfully.',
    })
  } catch (error) {
    if (connection) await connection.rollback()

    console.error('Delete Daily Feeding Error:', error)

    return res.status(500).json({
      success: false,
      message: 'Failed to delete daily feeding record.',
    })
  } finally {
    if (connection) connection.release()
  }
}
