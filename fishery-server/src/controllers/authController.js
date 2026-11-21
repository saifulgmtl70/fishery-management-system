
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import db from '../config/db.js'
import { z } from 'zod'

// ==========================================
// VALIDATION SCHEMAS
// ==========================================

const loginSchema = z.object({
  email: z.string().trim().email('Please provide a valid email'),
  password: z.string().min(1, 'Password is required'),
})

const updateProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name cannot exceed 100 characters')
    .optional(),

  email: z
    .string()
    .trim()
    .email('Please provide a valid email')
    .max(150, 'Email cannot exceed 150 characters')
    .optional(),

  phone: z
    .string()
    .trim()
    .max(20, 'Phone number cannot exceed 20 characters')
    .optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: 'Please provide at least one field to update.' }
)

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),

  newPassword: z
    .string()
    .min(8, 'New password must be at least 8 characters')
    .max(72, 'New password is too long'),

  confirmPassword: z
    .string()
    .min(1, 'Please confirm your new password'),
}).refine(
  (data) => data.newPassword === data.confirmPassword,
  {
    message: 'New password and confirm password do not match.',
    path: ['confirmPassword'],
  }
).refine(
  (data) => data.currentPassword !== data.newPassword,
  {
    message: 'New password must be different from current password.',
    path: ['newPassword'],
  }
)

// ==========================================
// COOKIE OPTIONS
// ==========================================

const cookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: 'none',
  path: '/',
}

const clearAuthCookie = (res) => {
  res.clearCookie('fishery_token', cookieOptions)
}

// ==========================================
// ADMIN LOGIN
// ==========================================

export const loginUser = async (req, res) => {
  try {
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

    const [users] = await db.execute(
      `SELECT
        id,
        name,
        email,
        phone,
        password,
        role,
        status,
        token_version,
        profile_image
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

    if (user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only administrators can log in.',
      })
    }

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

    if (user.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Your administrator account is not active.',
      })
    }

    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
      throw new Error('JWT_SECRET must be at least 32 characters long.')
    }

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

    res.cookie('fishery_token', token, {
      ...cookieOptions,
      maxAge: 24 * 60 * 60 * 1000,
    })

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
        profile_image: user.profile_image,
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
    const [users] = await db.execute(
      `SELECT
        id,
        name,
        email,
        phone,
        role,
        status,
        profile_image
       FROM users
       WHERE id = ?
       LIMIT 1`,
      [req.user.id]
    )

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Admin account not found.',
      })
    }

    return res.status(200).json({
      success: true,
      user: users[0],
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
// UPDATE ADMIN PROFILE
// ==========================================

export const updateProfile = async (req, res) => {
  try {
    const validation = updateProfileSchema.safeParse(req.body)

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

    const updates = validation.data
    const userId = req.user.id

    const [existingUsers] = await db.execute(
      `SELECT id, name, email, phone
       FROM users
       WHERE id = ?
       LIMIT 1`,
      [userId]
    )

    if (existingUsers.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Admin account not found.',
      })
    }

    const currentUser = existingUsers[0]

    const updatedName = updates.name ?? currentUser.name

    const updatedEmail = updates.email
      ? updates.email.toLowerCase()
      : currentUser.email

    const updatedPhone = updates.phone ?? currentUser.phone

    if (updatedEmail.toLowerCase() !== currentUser.email.toLowerCase()) {
      const [emailUsers] = await db.execute(
        `SELECT id
         FROM users
         WHERE email = ?
         AND id != ?
         LIMIT 1`,
        [updatedEmail, userId]
      )

      if (emailUsers.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'This email address is already registered.',
        })
      }
    }

    await db.execute(
      `UPDATE users
       SET name = ?, email = ?, phone = ?
       WHERE id = ?`,
      [updatedName, updatedEmail, updatedPhone, userId]
    )

    const [updatedUsers] = await db.execute(
      `SELECT
        id,
        name,
        email,
        phone,
        role,
        status,
        profile_image
       FROM users
       WHERE id = ?
       LIMIT 1`,
      [userId]
    )

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user: updatedUsers[0],
    })
  } catch (error) {
    console.error('Update Admin Profile Error:', error)

    return res.status(500).json({
      success: false,
      message: 'Failed to update administrator profile.',
    })
  }
}

// ==========================================
// CHANGE ADMIN PASSWORD
// ==========================================

export const changePassword = async (req, res) => {
  try {
    const validation = changePasswordSchema.safeParse(req.body)

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

    const {
      currentPassword,
      newPassword,
    } = validation.data

    const [users] = await db.execute(
      `SELECT id, password
       FROM users
       WHERE id = ?
       LIMIT 1`,
      [req.user.id]
    )

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Admin account not found.',
      })
    }

    const user = users[0]

    const isCurrentPasswordCorrect = await bcrypt.compare(
      currentPassword,
      user.password
    )

    if (!isCurrentPasswordCorrect) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect.',
      })
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12)

    await db.execute(
      `UPDATE users
       SET password = ?, token_version = token_version + 1
       WHERE id = ?`,
      [hashedPassword, req.user.id]
    )

    clearAuthCookie(res)

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully. Please log in again.',
      requiresLogin: true,
    })
  } catch (error) {
    console.error('Change Admin Password Error:', error)

    return res.status(500).json({
      success: false,
      message: 'Failed to change password.',
    })
  }
}

// ==========================================
// ADMIN LOGOUT
// ==========================================

export const logoutUser = async (req, res) => {
  try {
    clearAuthCookie(res)

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
