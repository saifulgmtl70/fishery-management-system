import express from 'express'
import { getFeedStock } from '../controllers/feedStockController.js'
import { verifyToken, authorizeRoles, } from '../middlewares/authMiddleware.js'

const router = express.Router()

router.use(verifyToken, authorizeRoles('admin'))

router.get('/', getFeedStock)

export default router