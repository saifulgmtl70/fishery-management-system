
import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

import db from '../config/db.js'
import emailTransporter from '../config/email.js'

// ==========================================
// VALIDATION SCHEMAS
// ==========================================

const emailSchema = z.object({
  email: z.string().trim().email('Please enter a valid email address'),
})

// ==========================================
// SEND PASSWORD RESET OTP
// ==========================================

export const sendPasswordResetOTP = async (req, res) => {
  let connection
  let transactionStarted = false

  try {
    const validation = emailSchema.safeParse(req.body)

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.',
      })
    }

    const email = validation.data.email.toLowerCase()

    connection = await db.getConnection()

    // Find active administrator
    const [users] = await connection.execute(
      `SELECT id, name, email
       FROM users
       WHERE email = ?
         AND role = 'admin'
         AND status = 'active'
       LIMIT 1`,
      [email]
    )

    // Prevent account enumeration
    if (users.length === 0) {
      return res.status(200).json({
        success: true,
        message:
          'If an active administrator account exists with this email, an OTP will be sent.',
      })
    }

    const user = users[0]

    // Generate secure 6-digit OTP
    const otp = crypto.randomInt(100000, 1000000).toString()

    // Hash OTP before storing it
    const otpHash = crypto
      .createHash('sha256')
      .update(otp)
      .digest('hex')

    // OTP expires after 5 minutes
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000)

    await connection.beginTransaction()
    transactionStarted = true

    // Invalidate previous OTPs and reset tokens
    await connection.execute(
      `UPDATE password_reset_otps
       SET is_used = 1
       WHERE user_id = ? AND is_used = 0`,
      [user.id]
    )

    // Store new hashed OTP
    await connection.execute(
      `INSERT INTO password_reset_otps
       (user_id, otp_hash, expires_at)
       VALUES (?, ?, ?)`,
      [user.id, otpHash, expiresAt]
    )

    await connection.commit()
    transactionStarted = false

    // Send OTP email
    try {
      await emailTransporter.sendMail({
        from: {
          name: 'Fishery Management System',
          address: process.env.SMTP_USER,
        },

        to: user.email,

        subject: 'Password Reset OTP - Fishery Management System',

        text: `Your password reset OTP is ${otp}. It is valid for 5 minutes. Do not share this OTP with anyone.`,

        html: `
          <div style="font-family: Arial, sans-serif; max-width: 520px; margin: auto; padding: 28px; color: #24352f;">

            <h2 style="color: #167D62;">
              Password Reset Request
            </h2>

            <p>Hello Administrator,</p>

            <p>
              We received a request to reset your
              Fishery Management System password.
            </p>

            <div style="background: #f0f7f3; padding: 20px; text-align: center; border-radius: 10px; margin: 24px 0;">

              <p style="margin: 0 0 8px; font-size: 13px;">
                Your verification code
              </p>

              <h1 style="letter-spacing: 10px; color: #167D62; margin: 0;">
                ${otp}
              </h1>

            </div>

            <p>
              This OTP will expire in
              <strong>5 minutes</strong>.
            </p>

            <p>
              If you did not request a password reset,
              please ignore this email.
            </p>

            <p style="margin-top: 28px;">
              Regards,<br />
              <strong>Fishery Management System</strong>
            </p>

          </div>
        `,
      })
    } 
    catch (emailError) {
      // Invalidate OTP if email delivery fails
      await connection.execute(
        `UPDATE password_reset_otps
         SET is_used = 1
         WHERE user_id = ? AND otp_hash = ?`,
        [user.id, otpHash]
      )

      console.error(
        'Password reset email delivery failed:',
        emailError.message
      )

      return res.status(500).json({
        success: false,
        message:
          'Unable to send the verification email. Please try again later.',
      })
    }

    return res.status(200).json({
      success: true,
      message:
        'If an active administrator account exists with this email, an OTP will be sent.',
    })
  } 
  catch (error) {
    if (connection && transactionStarted) {
      await connection.rollback().catch(() => {})
    }

    console.error('Send Password Reset OTP Error:', error.message)

    return res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again later.',
    })
  } 
  finally {
    if (connection) {
      connection.release()
    }
  }
}

// ==========================================
// VERIFY PASSWORD RESET OTP
// ==========================================

export const verifyPasswordResetOTP = async (req, res) => {
  let connection
  let transactionStarted = false

  try {
    const schema = z.object({
      email: z.string().trim().email(),
      otp: z.string().regex(/^\d{6}$/, 'OTP must be 6 digits'),
    })

    const validation = schema.safeParse(req.body)

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email and 6-digit OTP.',
      })
    }

    const email = validation.data.email.toLowerCase()
    const { otp } = validation.data

    connection = await db.getConnection()

    // Find active administrator
    const [users] = await connection.execute(
      `SELECT id
       FROM users
       WHERE email = ?
         AND role = 'admin'
         AND status = 'active'
       LIMIT 1`,
      [email]
    )

    if (users.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP.',
      })
    }

    const userId = users[0].id

    await connection.beginTransaction()
    transactionStarted = true

    // Get latest unused OTP and lock the record
    const [records] = await connection.execute(
      `SELECT id, otp_hash, attempts, expires_at
       FROM password_reset_otps
       WHERE user_id = ? AND is_used = 0
       ORDER BY id DESC
       LIMIT 1
       FOR UPDATE`,
      [userId]
    )

    if (records.length === 0) {
      await connection.rollback()
      transactionStarted = false

      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP.',
      })
    }

    const record = records[0]

    // Check expiration and maximum attempts
    if (
      record.attempts >= 5 ||
      new Date(record.expires_at).getTime() <= Date.now()
    ) {
      await connection.execute(
        `UPDATE password_reset_otps
         SET is_used = 1
         WHERE id = ?`,
        [record.id]
      )

      await connection.commit()
      transactionStarted = false

      return res.status(400).json({
        success: false,
        message: 'OTP has expired or exceeded the maximum attempts.',
      })
    }

    // Hash submitted OTP
    const submittedHash = crypto
      .createHash('sha256')
      .update(otp)
      .digest('hex')

    const storedHash = Buffer.from(record.otp_hash, 'hex')
    const submittedHashBuffer = Buffer.from(submittedHash, 'hex')

    const isValid =
      storedHash.length === submittedHashBuffer.length &&
      crypto.timingSafeEqual(storedHash, submittedHashBuffer)

    // Handle incorrect OTP
    if (!isValid) {
      const newAttempts = record.attempts + 1

      await connection.execute(
        `UPDATE password_reset_otps
         SET attempts = ?,
             is_used = ?
         WHERE id = ?`,
        [newAttempts, newAttempts >= 5 ? 1 : 0, record.id]
      )

      await connection.commit()
      transactionStarted = false

      return res.status(400).json({
        success: false,
        message:
          newAttempts >= 5
            ? 'Maximum OTP attempts exceeded. Request a new OTP.'
            : `Incorrect OTP. ${5 - newAttempts} attempts remaining.`,
      })
    }

    // Generate temporary password reset token
    const resetToken = crypto.randomBytes(32).toString('hex')

    const resetTokenHash = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex')

    // Replace OTP hash with reset token hash
    // Extend reset-token validity to 10 minutes
    await connection.execute(
      `UPDATE password_reset_otps
       SET otp_hash = ?,
           expires_at = DATE_ADD(NOW(), INTERVAL 10 MINUTE),
           attempts = 0
       WHERE id = ?`,
      [resetTokenHash, record.id]
    )

    await connection.commit()
    transactionStarted = false

    return res.status(200).json({
      success: true,
      message: 'OTP verified successfully.',
      resetToken,
    })
  } 
  catch (error) {
    if (connection && transactionStarted) {
      await connection.rollback().catch(() => {})
    }

    console.error('Verify Password Reset OTP Error:', error.message)

    return res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again later.',
    })
  } 
  finally {
    if (connection) {
      connection.release()
    }
  }
}

// ==========================================
// RESET ADMIN PASSWORD
// ==========================================

export const resetAdminPassword = async (req, res) => {
  let connection
  let transactionStarted = false

  try {
    // Validate request data
    const schema = z.object({
      email: z.string().trim().email(),

      resetToken: z.string().regex(/^[a-f0-9]{64}$/i),

      password: z.string()
        .min(8, 'Password must be at least 8 characters')
        .refine(
          (value) => Buffer.byteLength(value, 'utf8') <= 72,
          'Password must not exceed 72 bytes'
        ),

      confirmPassword: z.string(),
    }).refine(
      (data) => data.password === data.confirmPassword,
      {
        message: 'Passwords do not match.',
        path: ['confirmPassword'],
      }
    )

    const validation = schema.safeParse(req.body)

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Please provide valid password reset information.',
        errors: validation.error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      })
    }

    const email = validation.data.email.toLowerCase()

    const { resetToken, password } = validation.data

    // Hash submitted reset token
    const resetTokenHash = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex')

    connection = await db.getConnection()

    await connection.beginTransaction()
    transactionStarted = true

    // Find active administrator
    const [users] = await connection.execute(
      `SELECT id
       FROM users
       WHERE email = ?
         AND role = 'admin'
         AND status = 'active'
       LIMIT 1`,
      [email]
    )

    if (users.length === 0) {
      await connection.rollback()
      transactionStarted = false

      return res.status(400).json({
        success: false,
        message: 'Invalid or expired password reset session.',
      })
    }

    const userId = users[0].id

    // Find and lock the verified reset token
    const [records] = await connection.execute(
      `SELECT id, otp_hash, expires_at
       FROM password_reset_otps
       WHERE user_id = ?
         AND is_used = 0
       ORDER BY id DESC
       LIMIT 1
       FOR UPDATE`,
      [userId]
    )

    if (records.length === 0) {
      await connection.rollback()
      transactionStarted = false

      return res.status(400).json({
        success: false,
        message: 'Invalid or expired password reset session.',
      })
    }

    const record = records[0]

    // Check token expiration
    if (new Date(record.expires_at).getTime() <= Date.now()) {
      await connection.execute(
        `UPDATE password_reset_otps
         SET is_used = 1
         WHERE id = ?`,
        [record.id]
      )

      await connection.commit()
      transactionStarted = false

      return res.status(400).json({
        success: false,
        message:
          'Password reset session has expired. Request a new OTP.',
      })
    }

    // Verify temporary reset token
    const storedHash = Buffer.from(record.otp_hash, 'hex')
    const submittedHash = Buffer.from(resetTokenHash, 'hex')

    const isValidToken =
      storedHash.length === submittedHash.length &&
      crypto.timingSafeEqual(storedHash, submittedHash)

    if (!isValidToken) {
      await connection.rollback()
      transactionStarted = false

      return res.status(400).json({
        success: false,
        message: 'Invalid or expired password reset session.',
      })
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Update password and invalidate all previous JWT sessions
    await connection.execute(
      `UPDATE users
       SET password = ?,
           token_version = token_version + 1
       WHERE id = ?`,
      [hashedPassword, userId]
    )

    // Mark reset token as used
    await connection.execute(
      `UPDATE password_reset_otps
       SET is_used = 1
       WHERE id = ?`,
      [record.id]
    )

    await connection.commit()
    transactionStarted = false

    // Clear any existing authentication cookie
    res.clearCookie('fishery_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    })

    return res.status(200).json({
      success: true,
      message:
        'Password reset successful. Please log in with your new password.',
    })
  } 
  catch (error) {
    if (connection && transactionStarted) {
      await connection.rollback().catch(() => {})
    }

    console.error('Reset Admin Password Error:', error.message)

    return res.status(500).json({
      success: false,
      message: 'Unable to reset password. Please try again later.',
    })
  } 
  finally {
    if (connection) {
      connection.release()
    }
  }
}
