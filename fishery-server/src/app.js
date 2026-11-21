
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

import authRoutes from './routes/authRoutes.js'
import passwordResetRoutes from './routes/passwordResetRoutes.js'

import pondRoutes from './routes/pondRoutes.js'

import fishSpeciesRoutes from './routes/fishSpeciesRoutes.js'
import fishStockingRoutes from './routes/fishStockingRoutes.js'

import feedTypeRoutes from './routes/feedTypeRoutes.js'
import feedSupplierRoutes from './routes/feedSupplierRoutes.js'
import feedPurchaseRoutes from './routes/feedPurchaseRoutes.js'
import dailyFeedingRoutes from './routes/dailyFeedingRoutes.js'
import feedStockRoutes from './routes/feedStockRoutes.js'

import fishMortalityRoutes from './routes/fishMortalityRoutes.js'
import fishSaleRoutes from './routes/fishSaleRoutes.js'

import dealerRoutes from './routes/dealerRoutes.js'

import expenseRoutes from './routes/expenseRoutes.js'

import financeRoutes from './routes/financeRoutes.js'

import lakeRoutes from './routes/lakeRoutes.js'

import dashboardRoutes from './routes/dashboardRoutes.js'


import staffRoutes from './routes/staffRoutes.js'

import db from './config/db.js'

const app = express()

// ==========================================
// MIDDLEWARE
// ==========================================

app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
}))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

// ==========================================
// AUTHENTICATION ROUTES
// ==========================================

app.use('/auth', authRoutes)

app.use('/password-reset', passwordResetRoutes)

// ==========================================
// POND MANAGEMENT ROUTES
// ==========================================

app.use('/ponds', pondRoutes)

app.use('/lake', lakeRoutes)

// ==========================================
// FISH MANAGEMENT ROUTES
// ==========================================

app.use('/fish-species', fishSpeciesRoutes)

app.use('/fish-stockings', fishStockingRoutes)

app.use('/fish-mortalities', fishMortalityRoutes)


app.use('/fish-sales', fishSaleRoutes)

// ==========================================
// FEED MANAGEMENT ROUTES
// ==========================================

app.use('/feed-types', feedTypeRoutes)

app.use('/feed-suppliers', feedSupplierRoutes)

app.use('/feed-purchases', feedPurchaseRoutes)

app.use('/daily-feedings', dailyFeedingRoutes)

app.use('/feed-stock', feedStockRoutes)

// ==========================================
// DEALER MANAGEMENT ROUTES
// ==========================================

app.use('/dealers', dealerRoutes)


app.use('/staff', staffRoutes)



// ==========================================
// EXPENSE MANAGEMENT ROUTES
// ==========================================

app.use('/expenses', expenseRoutes)

app.use('/finance', financeRoutes)


app.use('/dashboard', dashboardRoutes)

// ==========================================
// ROOT ROUTE
// ==========================================

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Fishery Management System API is running!',
    environment: process.env.NODE_ENV,
  })
})

// ==========================================
// HEALTH CHECK ROUTE
// ==========================================

app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Fishery API is healthy.',
    timestamp: new Date().toISOString(),
  })
})

app.get('/health/db', async (req, res) => {
  try {
    await db.query('SELECT 1')

    res.status(200).json({
      success: true,
      message: 'TiDB Database Connected Successfully!',
    })
  } catch (error) {
    console.error('Database Health Check Failed:', error.message)

    res.status(500).json({
      success: false,
      message: 'Database Connection Failed.',
    })
  }
})

export default app
