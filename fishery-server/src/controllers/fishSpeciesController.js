
import { z } from 'zod'
import db from '../config/db.js'

// ==========================================
// VALIDATION SCHEMA
// ==========================================

const speciesSchema = z.object({
  species_name: z.string()
    .trim()
    .min(2, 'Species name is required.')
    .max(100),

  scientific_name: z.preprocess(
    (value) => value === '' || value === undefined ? null : value,
    z.string().trim().max(150).nullable()
  ),

  description: z.preprocess(
    (value) => value === '' || value === undefined ? null : value,
    z.string().trim().nullable()
  ),
})

const statusSchema = z.object({
  status: z.enum(['active', 'inactive']),
})

// ==========================================
// GET ALL FISH SPECIES
// ==========================================

export const getAllFishSpecies = async (req, res) => {
  try {
    const [species] = await db.query(`
      SELECT id, species_name, scientific_name, description, status, created_at, updated_at
      FROM fish_species
      ORDER BY species_name ASC
    `)

    return res.status(200).json({
      success: true,
      total: species.length,
      species,
    })
  } 
  catch (error) {
    console.error('Get Fish Species Error:', error)

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch fish species.',
    })
  }
}

// ==========================================
// CREATE FISH SPECIES
// ==========================================

export const createFishSpecies = async (req, res) => {
  try {
    const validation = speciesSchema.safeParse(req.body)

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid species information.',
        errors: validation.error.flatten().fieldErrors,
      })
    }

    const { species_name, scientific_name, description, } = validation.data

    const [result] = await db.query(
      `INSERT INTO fish_species (species_name, scientific_name, description)
       VALUES (?, ?, ?)`,
      [species_name, scientific_name, description]
    )

    return res.status(201).json({
      success: true,
      message: 'Fish species added successfully.',
      speciesId: result.insertId,
    })
  } 
  catch (error) {
    console.error('Create Fish Species Error:', error)

    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        message: 'This fish species already exists.',
      })
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to add fish species.',
    })
  }
}

// ==========================================
// UPDATE FISH SPECIES
// ==========================================

export const updateFishSpecies = async (req, res) => {
  try {
    const speciesId = Number(req.params.id)

    if (!Number.isInteger(speciesId) || speciesId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid species ID.',
      })
    }

    const validation = speciesSchema.safeParse(req.body)

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid species information.',
        errors: validation.error.flatten().fieldErrors,
      })
    }

    const { species_name, scientific_name, description, } = validation.data

    const [existing] = await db.query(
      'SELECT id FROM fish_species WHERE id = ?',
      [speciesId]
    )

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Fish species not found.',
      })
    }

    await db.query(
      `UPDATE fish_species
       SET species_name = ?, scientific_name = ?,description = ?
       WHERE id = ?`,
      [ species_name, scientific_name, description, speciesId,
      ]
    )

    return res.status(200).json({
      success: true,
      message: 'Fish species updated successfully.',
    })
  } 
  catch (error) {
    console.error('Update Fish Species Error:', error)

    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        message: 'This fish species name already exists.',
      })
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to update fish species.',
    })
  }
}

// ==========================================
// UPDATE SPECIES STATUS
// ==========================================

export const updateFishSpeciesStatus = async (req, res) => {
  try {
    const speciesId = Number(req.params.id)

    if (!Number.isInteger(speciesId) || speciesId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid species ID.',
      })
    }

    const validation = statusSchema.safeParse(req.body)

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Status must be active or inactive.',
      })
    }

    const [existing] = await db.query(
      'SELECT id FROM fish_species WHERE id = ?',
      [speciesId]
    )

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Fish species not found.',
      })
    }

    await db.query(
      'UPDATE fish_species SET status = ? WHERE id = ?',
      [validation.data.status, speciesId]
    )

    return res.status(200).json({
      success: true,
      message: 'Fish species status updated successfully.',
    })
  } 
  catch (error) {
    console.error('Update Fish Species Status Error:', error)

    return res.status(500).json({
      success: false,
      message: 'Failed to update species status.',
    })
  }
}
