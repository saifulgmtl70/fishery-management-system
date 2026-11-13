
import express from 'express'

import {
  loginUser,
  getCurrentUser,
  logoutUser,
} from '../controllers/authController.js'

import {
  verifyToken,
  authorizeRoles,
} from '../middlewares/authMiddleware.js'

const router = express.Router()

// Admin Login
router.post('/login', loginUser)

// Authenticated Admin Routes
router.get(
  '/me',
  verifyToken,
  authorizeRoles('admin'),
  getCurrentUser
)

router.post(
  '/logout',
  verifyToken,
  authorizeRoles('admin'),
  logoutUser
)

export default router
