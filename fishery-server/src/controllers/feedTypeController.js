
import { z } from 'zod'
import db from '../config/db.js'

const feedTypeSchema = z.object({
  feed_name: z.string().trim().min(2).max(120),
  brand: z.string().trim().max(100).optional().nullable(),
  description: z.string().trim().optional().nullable(),
})

const statusSchema = z.object({
  status: z.enum(['active', 'inactive']),
})

// Get all feed types
export const getAllFeedTypes = async (req, res) => {
  try {
    const [feedTypes] = await db.query(`
      SELECT *
      FROM feed_types
      ORDER BY feed_name ASC
    `)

    return res.status(200).json({
      success: true,
      total: feedTypes.length,
      feedTypes,
    })
  } catch (error) {
    console.error('Get Feed Types Error:', error)

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch feed types.',
    })
  }
}

// Create a new feed type
export const createFeedType = async (req, res) => {
  try {
    const validation = feedTypeSchema.safeParse(req.body)

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: validation.error.issues[0].message,
      })
    }

    const { feed_name, brand, description } = validation.data

    const [result] = await db.query(
      `INSERT INTO feed_types (feed_name, brand, description)
       VALUES (?, ?, ?)`,
      [feed_name, brand || null, description || null]
    )

    return res.status(201).json({
      success: true,
      message: 'Feed type created successfully.',
      feedTypeId: result.insertId,
    })
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        message: 'This feed type already exists.',
      })
    }

    console.error('Create Feed Type Error:', error)

    return res.status(500).json({
      success: false,
      message: 'Failed to create feed type.',
    })
  }
}

// Update feed type
export const updateFeedType = async (req, res) => {
  try {
    const id = Number(req.params.id)

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid feed type ID.',
      })
    }

    const validation = feedTypeSchema.safeParse(req.body)

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: validation.error.issues[0].message,
      })
    }

    const { feed_name, brand, description } = validation.data

    const [existing] = await db.query(
      'SELECT id FROM feed_types WHERE id = ?',
      [id]
    )

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Feed type not found.',
      })
    }

    await db.query(
      `UPDATE feed_types
       SET feed_name = ?, brand = ?, description = ?
       WHERE id = ?`,
      [feed_name, brand || null, description || null, id]
    )

    return res.status(200).json({
      success: true,
      message: 'Feed type updated successfully.',
    })
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        message: 'This feed type name already exists.',
      })
    }

    console.error('Update Feed Type Error:', error)

    return res.status(500).json({
      success: false,
      message: 'Failed to update feed type.',
    })
  }
}

// Activate or deactivate feed type
export const updateFeedTypeStatus = async (req, res) => {
  try {
    const id = Number(req.params.id)

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid feed type ID.',
      })
    }

    const validation = statusSchema.safeParse(req.body)

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: validation.error.issues[0].message,
      })
    }

    const [existing] = await db.query(
      'SELECT id FROM feed_types WHERE id = ?',
      [id]
    )

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Feed type not found.',
      })
    }

    await db.query(
      'UPDATE feed_types SET status = ? WHERE id = ?',
      [validation.data.status, id]
    )

    return res.status(200).json({
      success: true,
      message: 'Feed type status updated successfully.',
    })
  } catch (error) {
    console.error('Update Feed Type Status Error:', error)

    return res.status(500).json({
      success: false,
      message: 'Failed to update feed type status.',
    })
  }
}
