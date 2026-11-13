
import { z } from 'zod'
import db from '../config/db.js'

// ==========================================
// VALIDATION HELPERS
// ==========================================

const emptyToNull = (value) =>
  value === '' || value === undefined ? null : value

// ==========================================
// DEALER VALIDATION SCHEMA
// ==========================================

const dealerSchema = z.object({
  dealer_name: z.string()
    .trim()
    .min(2, 'Dealer name is required.')
    .max(150),

  contact_person: z.preprocess(
    emptyToNull,
    z.string().trim().max(150).nullable()
  ),

  phone: z.preprocess(
    emptyToNull,
    z.string().trim().max(20).nullable()
  ),

  email: z.preprocess(
    emptyToNull,
    z.string().trim().email('Invalid email address.').max(150).nullable()
  ),

  address: z.preprocess(
    emptyToNull,
    z.string().trim().nullable()
  ),

  notes: z.preprocess(
    emptyToNull,
    z.string().trim().nullable()
  ),
})

const statusSchema = z.object({
  status: z.enum(['active', 'inactive']),
})

// ==========================================
// GET ALL DEALERS
// ==========================================

export const getAllDealers = async (req, res) => {
  try {
    const [dealers] = await db.query(`
      SELECT id, dealer_name, contact_person, phone, email, address, notes, status, created_at, updated_at
      FROM dealers
      ORDER BY dealer_name ASC
    `)

    return res.status(200).json({
      success: true,
      total: dealers.length,
      dealers,
    })
  } 
  catch (error) {
    console.error('Get Dealers Error:', error)

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch dealers.',
    })
  }
}

// ==========================================
// GET SINGLE DEALER
// ==========================================

export const getDealerById = async (req, res) => {
  try{
    const dealerId = Number(req.params.id)

    if (!Number.isInteger(dealerId) || dealerId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid dealer ID.',
      })
    }

    const [dealers] = await db.query(
      `SELECT id, dealer_name, contact_person, phone, email, address, notes, status, created_at, updated_at
      FROM dealers
      WHERE id = ?`,
      [dealerId]
    )

    if (dealers.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Dealer not found.',
      })
    }

    return res.status(200).json({
      success: true,
      dealer: dealers[0],
    })
  } 
  catch (error) {
    console.error('Get Dealer Error:', error)

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch dealer.',
    })
  }
}

// ==========================================
// CREATE DEALER
// ==========================================

export const createDealer = async (req, res) => {
  try {
    const validation = dealerSchema.safeParse(req.body)

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid dealer information.',
        errors: validation.error.flatten().fieldErrors,
      })
    }

    const { dealer_name, contact_person, phone, email, address, notes } = validation.data

    const [result] = await db.query(
      `INSERT INTO dealers (dealer_name, contact_person, phone, email, address, notes)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [ dealer_name, contact_person, phone, email, address, notes, ])

    return res.status(201).json({
      success: true,
      message: 'Dealer added successfully.',
      dealerId: result.insertId,
    })
  } 
  catch (error) {
    console.error('Create Dealer Error:', error)

    return res.status(500).json({
      success: false,
      message: 'Failed to add dealer.',
    })
  }
}

// ==========================================
// UPDATE DEALER
// ==========================================

export const updateDealer = async (req, res) => {
  try{
    const dealerId = Number(req.params.id)

    if (!Number.isInteger(dealerId) || dealerId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid dealer ID.',
      })
    }

    const validation = dealerSchema.safeParse(req.body)

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid dealer information.',
        errors: validation.error.flatten().fieldErrors,
      })
    }

    const { dealer_name, contact_person, phone, email, address, notes } = validation.data

    const [existing] = await db.query(
      'SELECT id FROM dealers WHERE id = ?',
      [dealerId]
    )

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Dealer not found.',
      })
    }

    await db.query(
      `UPDATE dealers
       SET dealer_name = ?, contact_person = ?, phone = ?, email = ?, address = ?, notes = ?
       WHERE id = ?`,
      [ dealer_name, contact_person, phone, email, address, notes, dealerId, ])

    return res.status(200).json({
      success: true,
      message: 'Dealer updated successfully.',
    })
  } 
  catch (error) {
    console.error('Update Dealer Error:', error)

    return res.status(500).json({
      success: false,
      message: 'Failed to update dealer.',
    })
  }
}

// ==========================================
// UPDATE DEALER STATUS
// ==========================================

export const updateDealerStatus = async (req, res) => {
  try {
    const dealerId = Number(req.params.id)

    if (!Number.isInteger(dealerId) || dealerId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid dealer ID.',
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
      'SELECT id FROM dealers WHERE id = ?',
      [dealerId]
    )

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Dealer not found.',
      })
    }

    await db.query(
      'UPDATE dealers SET status = ? WHERE id = ?',
      [validation.data.status, dealerId]
    )

    return res.status(200).json({
      success: true,
      message: 'Dealer status updated successfully.',
    })
  } 
  catch (error) {
    console.error('Update Dealer Status Error:', error)

    return res.status(500).json({
      success: false,
      message: 'Failed to update dealer status.',
    })
  }
}
