import db from '../config/db.js'
import { z } from 'zod'

// Validation schema
const supplierSchema = z.object({
  supplier_name: z
    .string()
    .trim()
    .min(2, 'Supplier name must be at least 2 characters')
    .max(150),

  phone: z
    .string()
    .trim()
    .max(20)
    .optional()
    .or(z.literal('')),

  address: z
    .string()
    .trim()
    .optional()
    .or(z.literal('')),

  email: z
    .string()
    .trim()
    .email('Invalid email address')
    .max(150)
    .optional()
    .or(z.literal('')),
})

const statusSchema = z.object({
  status: z.enum(['active', 'inactive']),
})

// Get all suppliers
export const getAllFeedSuppliers = async (req, res) => {
  try {
    const [suppliers] = await db.query(`
      SELECT *
      FROM feed_suppliers
      ORDER BY id DESC
    `)

    res.status(200).json({
      success: true,
      total: suppliers.length,
      suppliers,
    })
  } catch (error) {
    console.error('Get Feed Suppliers Error:', error.message)

    res.status(500).json({
      success: false,
      message: 'Failed to fetch feed suppliers.',
    })
  }
}

// Create supplier
export const createFeedSupplier = async (req, res) => {
  try {
    const validation = supplierSchema.safeParse(req.body)

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: validation.error.issues[0].message,
      })
    }

    const { supplier_name, phone, address, email } = validation.data

    const [result] = await db.query(
      `INSERT INTO feed_suppliers
       (supplier_name, phone, address, email)
       VALUES (?, ?, ?, ?)`,
      [
        supplier_name,
        phone || null,
        address || null,
        email || null,
      ]
    )

    res.status(201).json({
      success: true,
      message: 'Feed supplier created successfully.',
      supplierId: result.insertId,
    })
  } catch (error) {
    console.error('Create Feed Supplier Error:', error.message)

    res.status(500).json({
      success: false,
      message: 'Failed to create feed supplier.',
    })
  }
}

// Update supplier
export const updateFeedSupplier = async (req, res) => {
  try {
    const id = Number(req.params.id)

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid supplier ID.',
      })
    }

    const validation = supplierSchema.safeParse(req.body)

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: validation.error.issues[0].message,
      })
    }

    const { supplier_name, phone, address, email } = validation.data

    const [result] = await db.query(
      `UPDATE feed_suppliers
       SET supplier_name = ?,
           phone = ?,
           address = ?,
           email = ?
       WHERE id = ?`,
      [
        supplier_name,
        phone || null,
        address || null,
        email || null,
        id,
      ]
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Feed supplier not found.',
      })
    }

    res.status(200).json({
      success: true,
      message: 'Feed supplier updated successfully.',
    })
  } catch (error) {
    console.error('Update Feed Supplier Error:', error.message)

    res.status(500).json({
      success: false,
      message: 'Failed to update feed supplier.',
    })
  }
}

// Update supplier status
export const updateFeedSupplierStatus = async (req, res) => {
  try {
    const id = Number(req.params.id)

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid supplier ID.',
      })
    }

    const validation = statusSchema.safeParse(req.body)

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: validation.error.issues[0].message,
      })
    }

    const [result] = await db.query(
      `UPDATE feed_suppliers
       SET status = ?
       WHERE id = ?`,
      [validation.data.status, id]
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Feed supplier not found.',
      })
    }

    res.status(200).json({
      success: true,
      message: 'Supplier status updated successfully.',
    })
  } catch (error) {
    console.error('Update Feed Supplier Status Error:', error.message)

    res.status(500).json({
      success: false,
      message: 'Failed to update supplier status.',
    })
  }
}