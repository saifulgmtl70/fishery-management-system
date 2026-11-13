
import express from 'express'
import { getAllFishMortalities, createFishMortality,} from '../controllers/fishMortalityController.js'

import { verifyToken,authorizeRoles,} from '../middlewares/authMiddleware.js'

const router = express.Router()

// All mortality routes are admin-only
router.use(verifyToken, authorizeRoles('admin'))

// Get all mortality records
router.get('/', getAllFishMortalities)

// Create a new mortality record
router.post('/', createFishMortality)

export default router
