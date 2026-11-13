
import express from 'express'

import { getAllFishStockings, createFishStocking, } from '../controllers/fishStockingController.js'

import { verifyToken, authorizeRoles,} from '../middlewares/authMiddleware.js'

const router = express.Router()

// Admin only
router.use(verifyToken, authorizeRoles('admin'))

// Get all fish stocking records
router.get('/', getAllFishStockings)

// Create a new fish stocking record
router.post('/', createFishStocking)

export default router
