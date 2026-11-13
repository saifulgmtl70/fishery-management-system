
import dotenv from 'dotenv'

dotenv.config()

import app from './app.js'
import { testDatabaseConnection } from './config/db.js'

const PORT = process.env.PORT || 5000

const startServer = async () => {
  try {
    // Test Database Connection
    const isDatabaseConnected = await testDatabaseConnection()

    if (!isDatabaseConnected) {
      console.error(
        'Server startup cancelled due to database connection failure.'
      )
      process.exit(1)
    }

    // Test Gmail SMTP Connection
    const { verifyEmailConnection } = await import('./config/email.js')

    const isEmailConnected = await verifyEmailConnection()

    if (!isEmailConnected) {
      console.warn(
        'Warning: Password recovery emails may not work until Gmail SMTP is configured.'
      )
    }

    // Start Express Server
    app.listen(PORT, () => {
      console.log('====================================')
      console.log('Fishery Management System')
      console.log(`Server running on port ${PORT}`)
      console.log('====================================')
    })
  } catch (error) {
    console.error('Server startup failed:', error.message)
    process.exit(1)
  }
}

startServer()
