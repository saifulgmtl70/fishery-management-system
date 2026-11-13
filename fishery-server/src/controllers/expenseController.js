
import db from '../config/db.js'
import { z } from 'zod'

// Expense validation
const expenseSchema = z.object({
  category_id: z.coerce.number().int().positive(),
  expense_date: z.string().min(1, 'Expense date is required'),
  amount: z.coerce.number().positive('Amount must be greater than 0'),
  description: z.string().max(500).optional().nullable(),
  reference_number: z.string().max(100).optional().nullable(),
  payment_method: z.enum([
    'cash',
    'bank',
    'mobile_banking',
    'other',
  ]).default('cash'),
  notes: z.string().optional().nullable(),
})

// Get all expenses
export const getAllExpenses = async (req, res) => {
  try{
    const { category_id, start_date, end_date, search } = req.query

    let query = `
      SELECT e.id, e.category_id, ec.category_name, e.expense_date, e.amount, e.description, e.reference_number,
      e.payment_method, e.notes, e.created_at, e.updated_at
      FROM expenses e
      INNER JOIN expense_categories ec
        ON e.category_id = ec.id
      WHERE 1 = 1
    `
    const values = []
    if (category_id) {
      query += ' AND e.category_id = ?'
      values.push(category_id)
    }

    if (start_date){
      query += ' AND e.expense_date >= ?'
      values.push(start_date)
    }

    if (end_date){
      query += ' AND e.expense_date <= ?'
      values.push(end_date)
    }

    if (search){
      query += `
        AND (
          ec.category_name LIKE ?
          OR e.description LIKE ?
          OR e.reference_number LIKE ?
        )
      `
      const keyword = `%${search}%`
      values.push(keyword, keyword, keyword)
    }

    query += ' ORDER BY e.expense_date DESC, e.id DESC'

    const [expenses] = await db.query(query, values)

    res.status(200).json({
      success: true,
      message: 'Expenses retrieved successfully',
      data: expenses,
    })
  } 
  catch (error){
    console.error('Get Expenses Error:', error)

    res.status(500).json({
      success: false,
      message: 'Failed to retrieve expenses',
    })
  }
}

// Create expense
export const createExpense = async (req, res) => {
  try {
    const validation = expenseSchema.safeParse(req.body)

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.error.flatten().fieldErrors,
      })
    }

    const { category_id, expense_date, amount, description, reference_number, payment_method, notes } = validation.data

    // Check category
    const [categories] = await db.query(
      `SELECT id FROM expense_categories
       WHERE id = ? AND status = 'active'`,
      [category_id]
    )

    if (categories.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Selected expense category is not available',
      })
    }

    // Check date
    const selectedDate = new Date(`${expense_date} T00:00:00`)
    const today = new Date()
    today.setHours(23, 59, 59, 999)

    if ( Number.isNaN(selectedDate.getTime()) || selectedDate > today ) {
      return res.status(400).json({
        success: false,
        message: 'Expense date cannot be in the future',
      })
    }

    const [result] = await db.query(
      `INSERT INTO expenses ( category_id, expense_date, amount, description, reference_number, payment_method, notes ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [ category_id, expense_date, amount, description || null, reference_number || null, payment_method, notes || null] )

    res.status(201).json({
      success: true,
      message: 'Expense created successfully',
      data: {
        id: result.insertId,
      },
    })
  } 
  catch(error) {
    console.error('Create Expense Error:', error)

    res.status(500).json({
      success: false,
      message: 'Failed to create expense',
    })
  }
}

// Update expense
export const updateExpense = async (req, res) => {
  try {
    const expenseId = Number(req.params.id)

    if (!Number.isInteger(expenseId) || expenseId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid expense ID',
      })
    }

    const validation = expenseSchema.safeParse(req.body)

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.error.flatten().fieldErrors,
      })
    }

    const { category_id, expense_date, amount, description, reference_number, payment_method, notes} = validation.data

    const selectedDate = new Date(`${expense_date}T00:00:00`)
    const today = new Date()
    today.setHours(23, 59, 59, 999)

    if ( Number.isNaN(selectedDate.getTime()) || selectedDate > today ) {
      return res.status(400).json({
        success: false,
        message: 'Expense date cannot be in the future',
      })
    }

    const [categories] = await db.query(
      `SELECT id FROM expense_categories
       WHERE id = ? AND status = 'active'`,
      [category_id]
    )

    if (categories.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Selected expense category is not available',
      })
    }

    const [existingExpenses] = await db.query(
      'SELECT id FROM expenses WHERE id = ?',
      [expenseId]
    )

    if (existingExpenses.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found',
      })
    }

    await db.query(
      `UPDATE expenses SET
        category_id = ?,
        expense_date = ?,
        amount = ?,
        description = ?,
        reference_number = ?,
        payment_method = ?,
        notes = ?
      WHERE id = ?`,
      [
        category_id,
        expense_date,
        amount,
        description || null,
        reference_number || null,
        payment_method,
        notes || null,
        expenseId,
      ]
    )

    res.status(200).json({
      success: true,
      message: 'Expense updated successfully',
    })
  } catch (error) {
    console.error('Update Expense Error:', error)

    res.status(500).json({
      success: false,
      message: 'Failed to update expense',
    })
  }
}


// Get all active expense categories
export const getExpenseCategories = async (req, res) => {
  try {
    const [categories] = await db.query(`
      SELECT id, category_name, description
      FROM expense_categories
      WHERE status = 'active'
      ORDER BY id ASC
    `)

    return res.status(200).json({
      success: true,
      message: 'Expense categories retrieved successfully',
      data: categories,
    })
  } 
  catch (error) {
    console.error('Get Expense Categories Error:', error)

    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve expense categories.',
    })
  }
}