
import express from 'express'

import {
  getDashboardOverview,
} from '../controllers/dashboardController.js'

import {
  verifyToken,
  authorizeRoles,
} from '../middlewares/authMiddleware.js'

const router = express.Router()

// Admin only
router.use(verifyToken, authorizeRoles('admin'))

// Dashboard Overview
router.get('/overview', getDashboardOverview)

export default router
