
import express from 'express'

import { getAllFishSales, createFishSale, addFishSalePayment,} from '../controllers/fishSaleController.js'

import { verifyToken,authorizeRoles,} from '../middlewares/authMiddleware.js'

const router = express.Router()

// Admin authentication and authorization
router.use(verifyToken, authorizeRoles('admin'))

// Get all fish sales
router.get('/', getAllFishSales)

// Create a new fish sale
router.post('/', createFishSale)

// Add payment to an existing sale
router.post('/:id/payments', addFishSalePayment)

export default router
