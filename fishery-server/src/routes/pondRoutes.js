
import express from 'express'

import { getAllPonds, createPond, updatePond, updatePondStatus,} from '../controllers/pondController.js'

import { verifyToken, authorizeRoles, } from '../middlewares/authMiddleware.js'

const router = express.Router()

// All routes require Admin authentication
router.use(verifyToken, authorizeRoles('admin'))

// Get all ponds
router.get('/', getAllPonds)

// Create a new pond
router.post('/', createPond)

// Update pond information
router.put('/:id', updatePond)

// Update pond status
router.patch('/:id/status', updatePondStatus)

export default router
