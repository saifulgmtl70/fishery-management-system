import express from 'express'

import { getAllFeedPurchases, createFeedPurchase, updateFeedPurchase,} from '../controllers/feedPurchaseController.js'

import {
  verifyToken,
  authorizeRoles,
} from '../middlewares/authMiddleware.js'

const router = express.Router()

// Admin only
router.use(verifyToken, authorizeRoles('admin'))

// Get all purchases
router.get('/', getAllFeedPurchases)

// Create purchase
router.post('/', createFeedPurchase)

// Update purchase
router.put('/:id', updateFeedPurchase)

export default router