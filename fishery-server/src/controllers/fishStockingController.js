
import { z } from 'zod'
import db from '../config/db.js'

// ==========================================
// VALIDATION SCHEMA
// ==========================================

const stockingSchema = z.object({
  pond_id: z.coerce.number().int().positive(),

  species_id: z.coerce.number().int().positive(),

  stocking_date: z.string().min(1, 'Stocking date is required.'),

  total_weight_kg: z.coerce.number().positive(
    'Total stocking weight must be greater than 0.'
  ),

  sample_weight_kg: z.coerce.number().positive(
    'Sample weight must be greater than 0.'
  ),

  sample_fish_count: z.coerce.number().int().positive(
    'Sample fish count must be greater than 0.'
  ),

  unit_price: z.coerce.number().nonnegative(
    'Price per kg cannot be negative.'
  ),

  supplier_name: z.preprocess(
    (value) => value === '' || value === undefined
      ? null
      : value,
    z.string().trim().max(150).nullable()
  ),

  notes: z.preprocess(
    (value) => value === '' || value === undefined
      ? null
      : value,
    z.string().trim().nullable()
  ),
})

// ==========================================
// GET ALL FISH STOCKING RECORDS
// ==========================================

export const getAllFishStockings = async (req, res) => {
  try {
    const [stockings] = await db.query(`
      SELECT
        fs.id,
        fs.pond_id,
        p.pond_name,
        fs.species_id,
        sp.species_name,
        fs.stocking_date,

        fs.quantity,
        fs.average_weight_gram,
        fs.total_weight_kg,

        fs.sample_weight_kg,
        fs.sample_fish_count,

        COALESCE(
          fs.fish_per_kg,
          CASE
            WHEN fs.sample_weight_kg > 0
            THEN ROUND(
              fs.sample_fish_count / fs.sample_weight_kg,
              4
            )
            ELSE NULL
          END
        ) AS fish_per_kg,

        fs.unit_price,
        fs.total_cost,

        fs.supplier_name,
        fs.notes,
        fs.created_at

      FROM fish_stockings fs

      INNER JOIN ponds p
        ON fs.pond_id = p.id

      INNER JOIN fish_species sp
        ON fs.species_id = sp.id

      ORDER BY fs.stocking_date DESC, fs.id DESC
    `)

    return res.status(200).json({
      success: true,
      total: stockings.length,
      stockings,
    })
  } 
  catch (error) {
    console.error('Get Fish Stockings Error:', error)

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch fish stocking records.',
    })
  }
}

// ==========================================
// CREATE FISH STOCKING
// ==========================================

export const createFishStocking = async (req, res) => {
  try {
    const validation = stockingSchema.safeParse(req.body)

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid fish stocking information.',
        errors: validation.error.flatten().fieldErrors,
      })
    }

    const { pond_id, species_id, stocking_date, total_weight_kg, sample_weight_kg, sample_fish_count, unit_price, supplier_name, notes } = validation.data

    // ==========================================
    // CHECK SAMPLE WEIGHT
    // ==========================================

    if (sample_weight_kg > total_weight_kg) {
      return res.status(400).json({
        success: false,
        message: 'Sample weight cannot exceed total stocking weight.',
      })
    }

    // ==========================================
    // CHECK POND
    // ==========================================

    const [ponds] = await db.query(
      'SELECT id, status FROM ponds WHERE id = ?',
      [pond_id]
    )

    if (ponds.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Selected pond not found.',
      })
    }

    if (ponds[0].status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Fish cannot be stocked in an inactive or maintenance pond.',
      })
    }

    // ==========================================
    // CHECK FISH SPECIES
    // ==========================================

    const [species] = await db.query(
      'SELECT id FROM fish_species WHERE id = ? AND status = ?',
      [species_id, 'active']
    )

    if (species.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Selected fish species not found or inactive.',
      })
    }

    // ==========================================
    // CALCULATE FISH PER KG
    // ==========================================

    const fishPerKg = Number(
      (sample_fish_count / sample_weight_kg).toFixed(4)
    )

    // ==========================================
    // CALCULATE ESTIMATED TOTAL FISH COUNT
    // ==========================================

    const quantity = Math.round(
      total_weight_kg * fishPerKg
    )

    // ==========================================
    // CALCULATE AVERAGE FISH WEIGHT
    // ==========================================

    const averageWeightGram = Number(
      ((sample_weight_kg * 1000) / sample_fish_count).toFixed(2)
    )

    // ==========================================
    // CALCULATE TOTAL PURCHASE COST
    // ==========================================

    const totalCost = Number(
      (total_weight_kg * unit_price).toFixed(2)
    )

    // ==========================================
    // INSERT STOCKING RECORD
    // ==========================================

    const [result] = await db.query(
      `
        INSERT INTO fish_stockings ( pond_id, species_id, stocking_date, quantity, average_weight_gram, total_weight_kg,sample_weight_kg, sample_fish_count, fish_per_kg, unit_price, total_cost, supplier_name,notes, created_by )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [ pond_id, species_id, stocking_date, quantity, averageWeightGram, total_weight_kg, sample_weight_kg, sample_fish_count, fishPerKg, unit_price, totalCost, supplier_name, notes, req.user.id, ] )

    // ==========================================
    // SUCCESS RESPONSE
    // ==========================================

    return res.status(201).json({
      success: true,
      message: 'Fish stocking record created successfully.',

      stockingId: result.insertId,

      calculations: {
        total_weight_kg: Number(total_weight_kg.toFixed(3)),
        unit_price: Number(unit_price.toFixed(2)),
        total_cost: totalCost,

        sample_weight_kg,
        sample_fish_count,

        fish_per_kg: fishPerKg,

        quantity,
        average_weight_gram: averageWeightGram,
      },
    })
  } 
  catch (error) {
    console.error('Create Fish Stocking Error:', error)

    return res.status(500).json({
      success: false,
      message: 'Failed to create fish stocking record.',
    })
  }
}
