
import mysql from 'mysql2/promise'
import dotenv from 'dotenv'

dotenv.config()

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT) || 4000,

  ssl: {
    minVersion: 'TLSv1.2',
  },

  dateStrings: ['DATE'],
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0,
  enableKeepAlive: true,
})

export const testDatabaseConnection = async () => {
  try {
    const connection = await db.getConnection()
    console.log('MySQL Database Connected Successfully!')
    console.log(`Database: ${process.env.DB_NAME}`)
    connection.release()
    return true
  } catch (error) {
    console.error('MySQL Database Connection Failed!')
    console.error(error.message)
    return false
  }
}

export default db
