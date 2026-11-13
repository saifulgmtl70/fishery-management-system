
import { z } from 'zod'
import db from '../config/db.js'

const harvestSchema = z.object({
  stocking_id: z.coerce.number().int().positive(),
  harvest_date: z.string().min(1),
  quantity: z.coerce.number().int().positive(),
  average_weight_gram: z.preprocess(
    (value) => value === '' || value === null || value === undefined
      ? null
      : value,
    z.coerce.number().positive().nullable()
  ),
  fishing_team: z.preprocess(
    (value) => value === '' || value === null ? null : value,
    z.string().max(150).nullable()
  ),
  notes: z.preprocess(
    (value) => value === '' || value === null ? null : value,
    z.string().nullable()
  ),
})

const getDhakaDate = () =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Dhaka',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())

export const getAllFishHarvests = async (req, res) => {
  try {
    const [harvests] = await db.execute(`
      SELECT
        fh.id,
        fh.stocking_id,
        fs.pond_id,
        p.pond_name,
        fs.species_id,
        sp.species_name,
        fs.stocking_date,
        fs.quantity AS stocked_quantity,
        fh.harvest_date,
        fh.quantity AS harvest_quantity,
        fh.average_weight_gram,
        fh.total_weight_kg,
        fh.fishing_team,
        fh.notes,
        fh.created_at
      FROM fish_harvests fh
      INNER JOIN fish_stockings fs
        ON fh.stocking_id = fs.id
      INNER JOIN ponds p
        ON fs.pond_id = p.id
      INNER JOIN fish_species sp
        ON fs.species_id = sp.id
      ORDER BY fh.harvest_date DESC, fh.id DESC
    `)

    return res.status(200).json({
      success: true,
      total: harvests.length,
      harvests,
    })
  } catch (error) {
    console.error('Get Fish Harvests Error:', error)

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch fish harvest records.',
    })
  }
}

export const createFishHarvest = async (req, res) => {
  const parsed = harvestSchema.safeParse(req.body)

  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: 'Invalid harvest information.',
      errors: parsed.error.flatten().fieldErrors,
    })
  }

  const {
    stocking_id,
    harvest_date,
    quantity,
    average_weight_gram,
    fishing_team,
    notes,
  } = parsed.data

  if (!/^\d{4}-\d{2}-\d{2}$/.test(harvest_date)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid harvest date.',
    })
  }

  const parsedDate = new Date(`${harvest_date}T00:00:00Z`)

  if (
    Number.isNaN(parsedDate.getTime()) ||
    parsedDate.toISOString().slice(0, 10) !== harvest_date
  ) {
    return res.status(400).json({
      success: false,
      message: 'Invalid harvest date.',
    })
  }

  const today = getDhakaDate()

  if (harvest_date > today) {
    return res.status(400).json({
      success: false,
      message: 'Harvest date cannot be in the future.',
    })
  }

  let connection

  try {
    connection = await db.getConnection()
    await connection.beginTransaction()

    const [stockings] = await connection.execute(
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
        message: 'Stocking record not found.',
      })
    }

    const stocking = stockings[0]

    const stockingDate =
      stocking.stocking_date instanceof Date
        ? stocking.stocking_date.toISOString().slice(0, 10)
        : String(stocking.stocking_date).slice(0, 10)

    if (harvest_date < stockingDate) {
      await connection.rollback()

      return res.status(400).json({
        success: false,
        message: 'Harvest date cannot be earlier than stocking date.',
      })
    }

    const [mortalityRows] = await connection.execute(
      `SELECT COALESCE(SUM(quantity), 0) AS total_mortality
       FROM fish_mortalities
       WHERE stocking_id = ?`,
      [stocking_id]
    )

    const [harvestRows] = await connection.execute(
      `SELECT COALESCE(SUM(quantity), 0) AS total_harvest
       FROM fish_harvests
       WHERE stocking_id = ?`,
      [stocking_id]
    )

    const previousMortality = Number(
      mortalityRows[0].total_mortality
    )

    const previousHarvest = Number(
      harvestRows[0].total_harvest
    )

    const stockedQuantity = Number(stocking.quantity)

    const remainingFish =
      stockedQuantity - previousMortality - previousHarvest

    if (quantity > remainingFish) {
      await connection.rollback()

      return res.status(400).json({
        success: false,
        message: `Only ${remainingFish} fish remain available for harvest.`,
        calculations: {
          stocked_quantity: stockedQuantity,
          previous_mortality: previousMortality,
          previous_harvest: previousHarvest,
          remaining_fish: remainingFish,
          requested_harvest: quantity,
        },
      })
    }

    const totalWeightKg =
      average_weight_gram !== null
        ? (quantity * average_weight_gram / 1000).toFixed(3)
        : null

    const [result] = await connection.execute(
      `INSERT INTO fish_harvests (
        stocking_id,
        harvest_date,
        quantity,
        average_weight_gram,
        total_weight_kg,
        fishing_team,
        notes,
        created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        stocking_id,
        harvest_date,
        quantity,
        average_weight_gram,
        totalWeightKg,
        fishing_team,
        notes,
        req.user.id,
      ]
    )

    await connection.commit()

    return res.status(201).json({
      success: true,
      message: 'Fish harvest record created successfully.',
      harvestId: result.insertId,
      calculations: {
        stocked_quantity: stockedQuantity,
        previous_mortality: previousMortality,
        previous_harvest: previousHarvest,
        harvest_quantity: quantity,
        remaining_fish: remainingFish - quantity,
        total_weight_kg: totalWeightKg,
      },
    })
  } catch (error) {
    if (connection) {
      await connection.rollback()
    }

    console.error('Create Fish Harvest Error:', error)

    return res.status(500).json({
      success: false,
      message: 'Failed to create fish harvest record.',
    })
  } finally {
    if (connection) {
      connection.release()
    }
  }
}
