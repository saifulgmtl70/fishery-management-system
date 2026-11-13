
import express from 'express'

import { getAllFishHarvests, createFishHarvest,} from '../controllers/fishHarvestController.js'

import { verifyToken,authorizeRoles, } from '../middlewares/authMiddleware.js'

const router = express.Router()

// Admin authentication and authorization
router.use(verifyToken, authorizeRoles('admin'))

// Get all fish harvest records
router.get('/', getAllFishHarvests)

// Create a new fish harvest record
router.post('/', createFishHarvest)

export default router
