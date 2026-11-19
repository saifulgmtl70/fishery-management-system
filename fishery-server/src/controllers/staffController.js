
import db from '../config/db.js'
import { z } from 'zod'

// ==========================================
// VALIDATION
// ==========================================

const staffSchema = z.object({
  name: z.string().trim().min(1, 'Staff name is required').max(150),
  phone: z.string().max(30).optional().nullable(),
  address: z.string().max(2000).optional().nullable(),
  designation: z.string().trim().min(1, 'Designation is required').max(100),
  joining_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid joining date'),
  monthly_salary: z.coerce.number().min(0, 'Salary cannot be negative'),
})

const isValidDate = (date) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false

  const parsed = new Date(`${date}T00:00:00Z`)

  return (
    !Number.isNaN(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === date
  )
}

const isValidMonth = (month) => {
  if (typeof month !== 'string' || !/^\d{4}-\d{2}$/.test(month)) {
    return false
  }

  const [year, monthNumber] = month.split('-').map(Number)

  return year >= 1000 && monthNumber >= 1 && monthNumber <= 12
}

// ==========================================
// GET ALL STAFF
// ==========================================

export const getAllStaff = async (req, res) => {
  try {
    const { status, search } = req.query

    let query = `
      SELECT
        id,
        name,
        phone,
        address,
        designation,
        joining_date,
        monthly_salary,
        status,
        created_at,
        updated_at
      FROM staff
      WHERE 1 = 1
    `

    const values = []

    if (status && ['active', 'inactive'].includes(status)) {
      query += ' AND status = ?'
      values.push(status)
    }

    if (search) {
      query += `
        AND (
          name LIKE ?
          OR phone LIKE ?
          OR designation LIKE ?
        )
      `

      const keyword = `%${search}%`
      values.push(keyword, keyword, keyword)
    }

    query += ' ORDER BY status ASC, id DESC'

    const [staff] = await db.execute(query, values)

    return res.status(200).json({
      success: true,
      message: 'Staff retrieved successfully.',
      data: staff,
    })
  } catch (error) {
    console.error('Get Staff Error:', error)

    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve staff.',
    })
  }
}

// ==========================================
// CREATE STAFF
// ==========================================

export const createStaff = async (req, res) => {
  try {
    const validation = staffSchema.safeParse(req.body)

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed.',
        errors: validation.error.flatten().fieldErrors,
      })
    }

    const data = validation.data

    if (!isValidDate(data.joining_date)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid joining date.',
      })
    }

    const [result] = await db.execute(
      `
        INSERT INTO staff (
          name,
          phone,
          address,
          designation,
          joining_date,
          monthly_salary
        )
        VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        data.name,
        data.phone || null,
        data.address || null,
        data.designation,
        data.joining_date,
        data.monthly_salary,
      ]
    )

    return res.status(201).json({
      success: true,
      message: 'Staff created successfully.',
      data: {
        id: result.insertId,
      },
    })
  } catch (error) {
    console.error('Create Staff Error:', error)

    return res.status(500).json({
      success: false,
      message: 'Failed to create staff.',
    })
  }
}

// ==========================================
// UPDATE STAFF
// ==========================================

export const updateStaff = async (req, res) => {
  try {
    const staffId = Number(req.params.id)

    if (!Number.isInteger(staffId) || staffId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid staff ID.',
      })
    }

    const validation = staffSchema.safeParse(req.body)

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed.',
        errors: validation.error.flatten().fieldErrors,
      })
    }

    const data = validation.data

    if (!isValidDate(data.joining_date)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid joining date.',
      })
    }

    const [existing] = await db.execute(
      'SELECT id FROM staff WHERE id = ?',
      [staffId]
    )

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Staff not found.',
      })
    }

    await db.execute(
      `
        UPDATE staff
        SET
          name = ?,
          phone = ?,
          address = ?,
          designation = ?,
          joining_date = ?,
          monthly_salary = ?
        WHERE id = ?
      `,
      [
        data.name,
        data.phone || null,
        data.address || null,
        data.designation,
        data.joining_date,
        data.monthly_salary,
        staffId,
      ]
    )

    return res.status(200).json({
      success: true,
      message: 'Staff updated successfully.',
    })
  } catch (error) {
    console.error('Update Staff Error:', error)

    return res.status(500).json({
      success: false,
      message: 'Failed to update staff.',
    })
  }
}

// ==========================================
// UPDATE STAFF STATUS
// ==========================================

export const updateStaffStatus = async (req, res) => {
  try {
    const staffId = Number(req.params.id)
    const { status } = req.body

    if (!Number.isInteger(staffId) || staffId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid staff ID.',
      })
    }

    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid staff status.',
      })
    }

    const [result] = await db.execute(
      'UPDATE staff SET status = ? WHERE id = ?',
      [status, staffId]
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Staff not found.',
      })
    }

    return res.status(200).json({
      success: true,
      message: 'Staff status updated successfully.',
    })
  } catch (error) {
    console.error('Update Staff Status Error:', error)

    return res.status(500).json({
      success: false,
      message: 'Failed to update staff status.',
    })
  }
}

// ==========================================
// GENERATE MONTHLY SALARY RECORDS
// ==========================================

export const generateMonthlySalaryRecords = async (req, res) => {
  let connection

  try {
    const { month } = req.body

    if (!isValidMonth(month)) {
      return res.status(400).json({
        success: false,
        message: 'Month must be in YYYY-MM format.',
      })
    }

    const salaryMonth = `${month}-01`

    connection = await db.getConnection()
    await connection.beginTransaction()

    // Snapshot the current salary for active staff.
    // Existing monthly records are never overwritten.

    await connection.execute(
      `
        INSERT IGNORE INTO staff_salary_records (
          staff_id,
          salary_month,
          salary_amount
        )
        SELECT
          id,
          ?,
          monthly_salary
        FROM staff
        WHERE status = 'active'
          AND joining_date < DATE_ADD(?, INTERVAL 1 MONTH)
      `,
      [salaryMonth, salaryMonth]
    )

    const [records] = await connection.execute(
      `
        SELECT
          ssr.id,
          ssr.staff_id,
          s.name,
          s.designation,
          ssr.salary_month,
          ssr.salary_amount,
          ssr.created_at
        FROM staff_salary_records ssr
        INNER JOIN staff s
          ON ssr.staff_id = s.id
        WHERE ssr.salary_month = ?
        ORDER BY s.name ASC
      `,
      [salaryMonth]
    )

    await connection.commit()

    return res.status(200).json({
      success: true,
      message: 'Monthly salary records generated successfully.',
      data: records,
    })
  } catch (error) {
    if (connection) {
      await connection.rollback()
    }

    console.error('Generate Salary Records Error:', error)

    return res.status(500).json({
      success: false,
      message: 'Failed to generate salary records.',
    })
  } finally {
    if (connection) connection.release()
  }
}

// ==========================================
// GET MONTHLY SALARY RECORDS
// ==========================================

export const getMonthlySalaryRecords = async (req, res) => {
  try {
    const { month } = req.query

    if (!isValidMonth(month)) {
      return res.status(400).json({
        success: false,
        message: 'Month must be in YYYY-MM format.',
      })
    }

    const salaryMonth = `${month}-01`

    const [records] = await db.execute(
      `
        SELECT
          ssr.id,
          ssr.staff_id,
          s.name,
          s.phone,
          s.designation,
          ssr.salary_month,
          ssr.salary_amount,
          ssr.created_at
        FROM staff_salary_records ssr
        INNER JOIN staff s
          ON ssr.staff_id = s.id
        WHERE ssr.salary_month = ?
        ORDER BY s.name ASC
      `,
      [salaryMonth]
    )

    const totalSalary = records.reduce(
      (total, record) => total + Number(record.salary_amount || 0),
      0
    )

    return res.status(200).json({
      success: true,
      message: 'Monthly salary records retrieved successfully.',
      data: {
        month,
        total_salary: Number(totalSalary.toFixed(2)),
        total_staff: records.length,
        records,
      },
    })
  } catch (error) {
    console.error('Get Monthly Salary Error:', error)

    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve salary records.',
    })
  }
}

// ==========================================
// GET ALL STAFF SALARY RECORDS (FINANCE)
// ==========================================

export const getAllSalaryRecords = async (req, res) => {
  try {
    const [records] = await db.execute(`
      SELECT
        ssr.id,
        ssr.staff_id,
        s.name,
        s.designation,
        ssr.salary_month,
        ssr.salary_amount,
        ssr.created_at
      FROM staff_salary_records ssr
      INNER JOIN staff s
        ON ssr.staff_id = s.id
      ORDER BY ssr.salary_month DESC, s.name ASC
    `)

    const totalSalary = records.reduce(
      (total, record) => total + Number(record.salary_amount || 0),
      0
    )

    return res.status(200).json({
      success: true,
      message: 'All staff salary records retrieved successfully.',
      data: {
        total_salary: Number(totalSalary.toFixed(2)),
        total_records: records.length,
        records,
      },
    })
  } catch (error) {
    console.error('Get All Salary Records Error:', error)

    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve all salary records.',
    })
  }
}
