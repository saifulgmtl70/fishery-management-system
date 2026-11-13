
import express from 'express'

import { getAllFeedTypes, createFeedType, updateFeedType, updateFeedTypeStatus} from '../controllers/feedTypeController.js'

import { verifyToken, authorizeRoles} from '../middlewares/authMiddleware.js'

const router = express.Router()

// Only authenticated admin can manage feed types
router.use(verifyToken, authorizeRoles('admin'))

router.get('/', getAllFeedTypes)

router.post('/', createFeedType)

router.put('/:id', updateFeedType)

router.patch('/:id/status', updateFeedTypeStatus)

export default router
