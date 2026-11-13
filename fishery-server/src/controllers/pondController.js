
import { z } from 'zod'
import db from '../config/db.js'

// ==========================================
// VALIDATION SCHEMAS
// ==========================================

const optionalPositiveNumber = z.preprocess(
  (value) => {
    if (value === '' || value === null || value === undefined) {
      return null
    }

    return Number(value)
  },
  z.number().positive().nullable()
)

const optionalText = (maxLength) =>
  z.preprocess(
    (value) => value === '' || value === undefined ? null : value,
    z.string().trim().max(maxLength).nullable()
  )

const pondSchema = z.object({
  pond_code: z.string().trim().min(1).max(30),
  pond_name: z.string().trim().min(2).max(100),
  area: optionalPositiveNumber,
  area_unit: z.enum(['decimal', 'acre', 'hectare']),
  depth: optionalPositiveNumber,
  water_source: optionalText(100),
  description: optionalText(2000),
})

const statusSchema = z.object({
  status: z.enum(['active', 'inactive', 'maintenance']),
})

// ==========================================
// GET ALL PONDS
// ==========================================

export const getAllPonds = async (req, res) => {
  try {
    const { status } = req.query

    if (
      status &&
      !['active', 'inactive', 'maintenance'].includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid pond status.',
      })
    }

    let sql = `
      SELECT id, pond_code, pond_name, area, area_unit, depth, water_source, status, description, created_at, updated_at
      FROM ponds
    `

    const values = []

    if (status) {
      sql += ' WHERE status = ?'
      values.push(status)
    }

    sql += ' ORDER BY created_at DESC'

    const [ponds] = await db.execute(sql, values)

    return res.status(200).json({
      success: true,
      total: ponds.length,
      ponds,
    })
  } 
  catch (error) {
    console.error('Get All Ponds Error:', error)

    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve ponds.',
    })
  }
}

// ==========================================
// CREATE NEW POND
// ==========================================

export const createPond = async (req, res) => {
  try{
    const validation = pondSchema.safeParse(req.body)

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Please provide valid pond information.',
        errors: validation.error.flatten().fieldErrors,
      })
    }

    const { pond_code, pond_name, area, area_unit, depth, water_source, description } = validation.data

    const sql = `
      INSERT INTO ponds ( pond_code, pond_name, area, area_unit, depth, water_source, description, created_by ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `

    const [result] = await db.execute(sql, [ pond_code, pond_name, area, area_unit, depth, water_source, description,req.user.id, ])

    return res.status(201).json({
      success: true,
      message: 'Pond created successfully.',
      pondId: result.insertId,
    })
  } 
  catch (error) {
    console.error('Create Pond Error:', error)

    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        message: 'This pond code already exists.',
      })
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to create pond.',
    })
  }
}

// ==========================================
// UPDATE POND INFORMATION
// ==========================================

export const updatePond = async (req, res) => {
  try {
    const pondId = Number(req.params.id)

    if (!Number.isInteger(pondId) || pondId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid pond ID.',
      })
    }

    const validation = pondSchema.safeParse(req.body)

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Please provide valid pond information.',
        errors: validation.error.flatten().fieldErrors,
      })
    }

    const [existingPond] = await db.execute(
      'SELECT id FROM ponds WHERE id = ?',
      [pondId]
    )

    if (existingPond.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Pond not found.',
      })
    }

    const { pond_code, pond_name, area, area_unit, depth, water_source, description } = validation.data

    await db.execute(
      `UPDATE ponds SET pond_code = ?, pond_name = ?, area = ?, area_unit = ?, depth = ?, water_source = ?, description = ?
       WHERE id = ?`,
      [ pond_code, pond_name, area, area_unit, depth, water_source, description, pondId, ] )

    return res.status(200).json({
      success: true,
      message: 'Pond updated successfully.',
    })
  } 
  catch (error) {
    console.error('Update Pond Error:', error)

    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        message: 'This pond code already exists.',
      })
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to update pond.',
    })
  }
}

// ==========================================
// UPDATE POND STATUS
// ==========================================

export const updatePondStatus = async (req, res) => {
  try {
    const pondId = Number(req.params.id)

    if (!Number.isInteger(pondId) || pondId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid pond ID.',
      })
    }

    const validation = statusSchema.safeParse(req.body)

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid pond status.',
      })
    }

    const [existingPond] = await db.execute(
      'SELECT id FROM ponds WHERE id = ?',
      [pondId]
    )

    if (existingPond.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Pond not found.',
      })
    }

    await db.execute(
      'UPDATE ponds SET status = ? WHERE id = ?',
      [validation.data.status, pondId]
    )

    return res.status(200).json({
      success: true,
      message: 'Pond status updated successfully.',
    })
  } 
  catch (error) {
    console.error('Update Pond Status Error:', error)

    return res.status(500).json({
      success: false,
      message: 'Failed to update pond status.',
    })
  }
}
