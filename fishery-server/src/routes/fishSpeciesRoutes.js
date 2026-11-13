
import express from 'express'

import { getAllFishSpecies, createFishSpecies, updateFishSpecies, updateFishSpeciesStatus,} from '../controllers/fishSpeciesController.js'

import { verifyToken, authorizeRoles,} from '../middlewares/authMiddleware.js'

const router = express.Router()

// All routes are restricted to Admin
router.use(verifyToken, authorizeRoles('admin'))

// Get all fish species
router.get('/', getAllFishSpecies)

// Add new fish species
router.post('/', createFishSpecies)

// Update fish species information
router.put('/:id', updateFishSpecies)

// Update fish species status
router.patch('/:id/status', updateFishSpeciesStatus)

export default router
