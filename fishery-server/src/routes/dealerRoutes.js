
import express from 'express'

import { getAllDealers, getDealerById, createDealer, updateDealer,updateDealerStatus,} from '../controllers/dealerController.js'

import {
  verifyToken,
  authorizeRoles,
} from '../middlewares/authMiddleware.js'

const router = express.Router()

// All Dealer Routes Require Admin Authentication
router.use(verifyToken, authorizeRoles('admin'))

// Get All Dealers
router.get('/', getAllDealers)

// Get Single Dealer
router.get('/:id', getDealerById)

// Create Dealer
router.post('/', createDealer)

// Update Dealer Information
router.put('/:id', updateDealer)

// Update Dealer Status
router.patch('/:id/status', updateDealerStatus)

export default router
