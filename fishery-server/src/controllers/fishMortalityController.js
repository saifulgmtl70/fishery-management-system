
import { z } from 'zod'
import db from '../config/db.js'

// ==========================================
// VALIDATION SCHEMA
// ==========================================

const mortalitySchema = z.object({
  stocking_id: z.coerce.number().int().positive(),

  mortality_date: z.string().min(1, 'Mortality date is required.'),

  quantity: z.coerce.number().int().positive(),

  average_weight_gram: z.preprocess(
    (value) =>
      value === '' || value === null || value === undefined
        ? null
        : Number(value),
    z.number().positive().nullable()
  ),

  reason: z.preprocess(
    (value) =>
      value === '' || value === undefined || value === null
        ? null
        : value,
    z.string().trim().max(255).nullable()
  ),

  notes: z.preprocess(
    (value) =>
      value === '' || value === undefined || value === null
        ? null
        : value,
    z.string().trim().nullable()
  ),
})

// ==========================================
// GET ALL FISH MORTALITY RECORDS
// ==========================================

export const getAllFishMortalities = async (req, res) => {
  try {
    const [mortalities] = await db.query(`
      SELECT
        fm.id,
        fm.stocking_id,
        fs.pond_id,
        p.pond_name,
        fs.species_id,
        sp.species_name,
        fs.stocking_date,
        fs.quantity AS stocked_quantity,
        fm.mortality_date,
        fm.quantity AS mortality_quantity,
        fm.average_weight_gram,
        fm.total_weight_kg,
        fm.reason,
        fm.notes,
        fm.created_at
      FROM fish_mortalities fm
      INNER JOIN fish_stockings fs
        ON fm.stocking_id = fs.id
      INNER JOIN ponds p
        ON fs.pond_id = p.id
      INNER JOIN fish_species sp
        ON fs.species_id = sp.id
      ORDER BY fm.mortality_date DESC, fm.id DESC
    `)

    return res.status(200).json({
      success: true,
      total: mortalities.length,
      mortalities,
    })
  } catch (error) {
    console.error('Get Fish Mortalities Error:', error)

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch fish mortality records.',
    })
  }
}

// ==========================================
// CREATE FISH MORTALITY RECORD
// ==========================================

export const createFishMortality = async (req, res) => {
  let connection

  try {
    const validation = mortalitySchema.safeParse(req.body)

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid fish mortality information.',
        errors: validation.error.flatten().fieldErrors,
      })
    }

    const {
      stocking_id,
      mortality_date,
      quantity,
      average_weight_gram,
      reason,
      notes,
    } = validation.data

    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(mortality_date)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid mortality date format. Use YYYY-MM-DD.',
      })
    }

    const parsedDate = new Date(`${mortality_date}T00:00:00Z`)

    if (
      Number.isNaN(parsedDate.getTime()) ||
      parsedDate.toISOString().slice(0, 10) !== mortality_date
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid mortality date.',
      })
    }

    connection = await db.getConnection()

    await connection.beginTransaction()

    // Lock stocking record to prevent concurrent over-recording
    const [stockings] = await connection.query(
      `SELECT id, quantity, stocking_date
       FROM fish_stockings
       WHERE id = ?
       FOR UPDATE`,
      [stocking_id]
    )

    if (stockings.length === 0) {
      await connection.rollback()

      return res.status(404).json({
        success: false,
        message: 'Selected fish stocking record not found.',
      })
    }

    const stocking = stockings[0]

    // Mortality date cannot be before stocking date
    const stockingDate = new Date(stocking.stocking_date)
      .toISOString()
      .slice(0, 10)

    if (mortality_date < stockingDate) {
      await connection.rollback()

      return res.status(400).json({
        success: false,
        message: 'Mortality date cannot be before stocking date.',
      })
    }

    // Future mortality date is not allowed
    const today = new Date().toISOString().slice(0, 10)

    if (mortality_date > today) {
      await connection.rollback()

      return res.status(400).json({
        success: false,
        message: 'Mortality date cannot be in the future.',
      })
    }

    // Calculate previous mortality quantity
    const [previousMortalities] = await connection.query(
      `SELECT COALESCE(SUM(quantity), 0) AS total_mortality
       FROM fish_mortalities
       WHERE stocking_id = ?`,
      [stocking_id]
    )

    const totalMortality = Number(
      previousMortalities[0].total_mortality
    )

    const stockedQuantity = Number(stocking.quantity)

    const remainingFish = stockedQuantity - totalMortality

    // Prevent mortality quantity from exceeding remaining fish
    if (quantity > remainingFish) {
      await connection.rollback()

      return res.status(400).json({
        success: false,
        message: `Only ${remainingFish} fish remain in this stocking record.`,
        calculations: {
          stocked_quantity: stockedQuantity,
          previous_mortality: totalMortality,
          remaining_fish: remainingFish,
          requested_mortality: quantity,
        },
      })
    }

    // Calculate total mortality weight
    const totalWeightKg =
      average_weight_gram !== null
        ? Number(((quantity * average_weight_gram) / 1000).toFixed(3))
        : null

    // Insert mortality record
    const [result] = await connection.query(
      `INSERT INTO fish_mortalities (
        stocking_id,
        mortality_date,
        quantity,
        average_weight_gram,
        total_weight_kg,
        reason,
        notes,
        created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        stocking_id,
        mortality_date,
        quantity,
        average_weight_gram,
        totalWeightKg,
        reason,
        notes,
        req.user.id,
      ]
    )

    await connection.commit()

    return res.status(201).json({
      success: true,
      message: 'Fish mortality record created successfully.',
      mortalityId: result.insertId,
      calculations: {
        stocked_quantity: stockedQuantity,
        previous_mortality: totalMortality,
        mortality_quantity: quantity,
        remaining_fish: remainingFish - quantity,
        total_weight_kg: totalWeightKg,
      },
    })
  } catch (error) {
    if (connection) {
      await connection.rollback()
    }

    console.error('Create Fish Mortality Error:', error)

    return res.status(500).json({
      success: false,
      message: 'Failed to create fish mortality record.',
    })
  } finally {
    if (connection) {
      connection.release()
    }
  }
}
