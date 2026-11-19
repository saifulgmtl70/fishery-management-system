
import express from 'express'

import {
  createFisherman,
  getFishermen,
  createFishingRecord,
  getFishingRecords,
  createRodFishingEntry,
  getRodFishingEntries,
  getLakeDailySummary,
  updateRodFishingEntry,
  updateFishingRecord,
} from '../controllers/lakeController.js'

import {
  verifyToken,
  authorizeRoles,
} from '../middlewares/authMiddleware.js'

const router = express.Router()

// Admin only
router.use(verifyToken, authorizeRoles('admin'))

// ==========================================
// Fishermen
// ==========================================
router.post('/fishermen', createFisherman)
router.get('/fishermen', getFishermen)

// ==========================================
// Local Fishing
// ==========================================
router.post('/fishing-records', createFishingRecord)
router.get('/fishing-records', getFishingRecords)

// Update Local Fishing Record
router.put('/fishing-records/:id', updateFishingRecord)

// ==========================================
// Rod Fishing
// ==========================================
router.post('/rod-fishing', createRodFishingEntry)
router.get('/rod-fishing', getRodFishingEntries)

// Update Rod Fishing Entry
router.put('/rod-fishing/:id', updateRodFishingEntry)

// ==========================================
// Daily Summary
// ==========================================
router.get('/daily-summary', getLakeDailySummary)

export default router
