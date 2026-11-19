
import express from 'express'

import {
  getFinanceOverview,
  getIncomeSummary,
  getProfitLoss,
  getFinancialReports,
} from '../controllers/financeController.js'

import {
  verifyToken,
  authorizeRoles,
} from '../middlewares/authMiddleware.js'

const router = express.Router()

// Admin only
router.use(verifyToken, authorizeRoles('admin'))

// Finance Overview
router.get('/overview', getFinanceOverview)

// Income Management
router.get('/income', getIncomeSummary)

// Profit & Loss
router.get('/profit-loss', getProfitLoss)

// Financial Reports
router.get('/reports', getFinancialReports)

export default router
