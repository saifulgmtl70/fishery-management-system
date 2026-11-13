
import db from '../config/db.js'
import { z } from 'zod'

const dailyFeedingSchema = z.object({
  pond_id: z.coerce.number().int().positive(),
  feed_type_id: z.coerce.number().int().positive(),
  feeding_date: z.string().min(1),
  quantity_kg: z.coerce.number().positive(),
  feeding_time: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
})

// Get all daily feeding records
export const getAllDailyFeedings = async (req, res) => {
  try {
    const [feedings] = await db.query(`
      SELECT df.id, df.pond_id, p.pond_name, df.feed_type_id, ft.feed_name, ft.brand, DATE_FORMAT(df.feeding_date, '%Y-%m-%d') AS feeding_date, df.quantity_kg, df.feeding_time, df.notes, df.created_at
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
  } 
  catch (error) {
    console.error('Get Daily Feedings Error:', error)
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch daily feeding records.',
    })
  }
}

// Create a daily feeding record
export const createDailyFeeding = async (req, res) => {
  const validation = dailyFeedingSchema.safeParse(req.body)

  if (!validation.success) {
    return res.status(400).json({
      success: false,
      message: 'Invalid feeding information.',
      errors: validation.error.flatten().fieldErrors,
    })
  }

  const { pond_id, feed_type_id, feeding_date, quantity_kg, feeding_time, notes } = validation.data

  let connection

  try {
    connection = await db.getConnection()
    await connection.beginTransaction()

    // Verify and lock the active pond
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

    // Lock the feed type to prevent simultaneous stock deductions
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

    // Calculate available stock
    // Total purchases - Total previous feed consumption
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

    // Save feeding record
    const [result] = await connection.query(
      `INSERT INTO daily_feedings ( pond_id, feed_type_id, feeding_date, quantity_kg, feeding_time, notes, created_by ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [ pond_id, feed_type_id, feeding_date, quantity_kg, feeding_time || null, notes || null, req.user.id ])

    await connection.commit()

    return res.status(201).json({
      success: true,
      message: 'Daily feeding record saved successfully.',
      feeding: {
        id: result.insertId,
        pond_id,
        feed_type_id,
        feeding_date,
        quantity_kg,
        feeding_time,
        notes,
      },
      available_stock: Number(
        (availableStock - quantity_kg).toFixed(3)
      ),
    })
  } catch (error) {
    if (connection) {
      await connection.rollback()
    }

    console.error('Create Daily Feeding Error:', error)

    return res.status(500).json({
      success: false,
      message: 'Failed to save daily feeding record.',
    })
  } finally {
    if (connection) connection.release()
  }
}
