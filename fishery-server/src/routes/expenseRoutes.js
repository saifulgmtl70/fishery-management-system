
import express from 'express'
import { getAllExpenses, createExpense, updateExpense, getExpenseCategories} from '../controllers/expenseController.js'

import { verifyToken, authorizeRoles } from '../middlewares/authMiddleware.js'

const router = express.Router()

// Admin only
router.use(verifyToken, authorizeRoles('admin'))

// Get all expenses
router.get('/', getAllExpenses)

router.get('/categories', getExpenseCategories)
// Create new expense
router.post('/', createExpense)

// Update expense
router.put('/:id', updateExpense)

export default router
