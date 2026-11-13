
import express from 'express'

import { sendPasswordResetOTP, verifyPasswordResetOTP, resetAdminPassword,} from '../controllers/passwordResetController.js'

const router = express.Router()

// ==========================================
// PASSWORD RESET ROUTES
// ==========================================

// Send OTP to Admin Email
router.post('/send-otp', sendPasswordResetOTP)

// Verify OTP and Generate Reset Token
router.post('/verify-otp', verifyPasswordResetOTP)

// Set New Admin Password
router.post('/reset-password', resetAdminPassword)

export default router
