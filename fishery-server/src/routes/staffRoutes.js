
import express from 'express'

import {
  getAllStaff,
  createStaff,
  updateStaff,
  updateStaffStatus,
  generateMonthlySalaryRecords,
  getMonthlySalaryRecords,
  getAllSalaryRecords
} from '../controllers/staffController.js'

import {
  verifyToken,
  authorizeRoles,
} from '../middlewares/authMiddleware.js'

const router = express.Router()

// Admin only
router.use(verifyToken, authorizeRoles('admin'))

// Staff Management
router.get('/salaries/all', getAllSalaryRecords)
router.get('/', getAllStaff)
router.post('/', createStaff)
router.put('/:id', updateStaff)
router.patch('/:id/status', updateStaffStatus)

// Monthly Salary
router.get('/salaries', getMonthlySalaryRecords)
router.post('/salaries/generate', generateMonthlySalaryRecords)

export default router
