
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import db from '../config/db.js'
import { z } from 'zod'

// ==========================================
// LOGIN VALIDATION
// ==========================================

const loginSchema = z.object({
  email: z.string().trim().email('Please provide a valid email'),
  password: z.string().min(1, 'Password is required'),
})

// ==========================================
// ADMIN LOGIN
// ==========================================

export const loginUser = async (req, res) => {
  try {
    // 1. Validate login information
    const validation = loginSchema.safeParse(req.body)

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed.',
        errors: validation.error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      })
    }

    const { email, password } = validation.data
    const normalizedEmail = email.toLowerCase()

    // 2. Find account by email
    const [users] = await db.execute(
      `SELECT id, name, email, phone, password, role, status, token_version
       FROM users
       WHERE email = ?
       LIMIT 1`,
      [normalizedEmail]
    )

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      })
    }

    const user = users[0]

    // 3. Only Admin can access the system
    if (user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only administrators can log in.',
      })
    }

    // 4. Verify password
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    )

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      })
    }

    // 5. Check Admin account status
    if (user.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Your administrator account is not active.',
      })
    }

    // 6. Validate JWT secret
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
      throw new Error('JWT_SECRET must be at least 32 characters long.')
    }

    // 7. Generate JWT token with token version
    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role,
        tokenVersion: user.token_version,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || '1d',
      }
    )

    // 8. Store token in HttpOnly cookie
    res.cookie('fishery_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000,
      path: '/',
    })

    // 9. Send successful response
    return res.status(200).json({
      success: true,
      message: 'Admin login successful.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
      },
    })
  } catch (error) {
    console.error('Admin Login Error:', error)

    return res.status(500).json({
      success: false,
      message: 'Internal server error during login.',
    })
  }
}

// ==========================================
// GET CURRENT LOGGED-IN ADMIN
// ==========================================

export const getCurrentUser = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      user: req.user,
    })
  } catch (error) {
    console.error('Get Current Admin Error:', error)

    return res.status(500).json({
      success: false,
      message: 'Unable to retrieve administrator information.',
    })
  }
}

// ==========================================
// ADMIN LOGOUT
// ==========================================

export const logoutUser = async (req, res) => {
  try {
    res.clearCookie('fishery_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    })

    return res.status(200).json({
      success: true,
      message: 'Logout successful.',
    })
  } catch (error) {
    console.error('Admin Logout Error:', error)

    return res.status(500).json({
      success: false,
      message: 'Unable to logout.',
    })
  }
}
