import express from 'express'

import { getAllFeedSuppliers, createFeedSupplier, updateFeedSupplier, updateFeedSupplierStatus, } from '../controllers/feedSupplierController.js'

import {
  verifyToken,
  authorizeRoles,
} from '../middlewares/authMiddleware.js'

const router = express.Router()

// Admin only
router.use(verifyToken, authorizeRoles('admin'))

// Get all suppliers
router.get('/', getAllFeedSuppliers)

// Create supplier
router.post('/', createFeedSupplier)

// Update supplier
router.put('/:id', updateFeedSupplier)

// Update supplier status
router.patch('/:id/status', updateFeedSupplierStatus)

export default router