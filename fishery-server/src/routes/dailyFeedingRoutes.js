
import express from 'express'

import {getAllDailyFeedings, createDailyFeeding,} from '../controllers/dailyFeedingController.js'

import { verifyToken, authorizeRoles } from '../middlewares/authMiddleware.js'

const router = express.Router()

// Admin only
router.use(verifyToken, authorizeRoles('admin'))

// Get all daily feeding records
router.get('/', getAllDailyFeedings)

// Create a daily feeding record
router.post('/', createDailyFeeding)

export default router
