
import express from 'express'

import {
  getAllDailyFeedings,
  createDailyFeeding,
  updateDailyFeeding,
  deleteDailyFeeding,
} from '../controllers/dailyFeedingController.js'

import {
  verifyToken,
  authorizeRoles,
} from '../middlewares/authMiddleware.js'

const router = express.Router()

// Admin only
router.use(verifyToken, authorizeRoles('admin'))

// Get all daily feeding records
router.get('/', getAllDailyFeedings)

// Create daily feeding record
router.post('/', createDailyFeeding)

// Update daily feeding record
router.put('/:id', updateDailyFeeding)

// Delete daily feeding record
router.delete('/:id', deleteDailyFeeding)

export default router
