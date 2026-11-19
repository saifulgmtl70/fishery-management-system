
import mysql from 'mysql2/promise'
import dotenv from 'dotenv'

dotenv.config()

const createUser = async () => {
  let connection

  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      user: 'root',
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      connectTimeout: 30000,
    })

    const newPassword = process.env.NEW_DB_PASSWORD

    if (!newPassword) {
      throw new Error('NEW_DB_PASSWORD is missing')
    }

    await connection.query(
      `CREATE USER IF NOT EXISTS 'fishery_app'@'%' IDENTIFIED BY ${connection.escape(newPassword)}`
    )

    await connection.query(
      "ALTER USER 'fishery_app'@'%' IDENTIFIED BY " + connection.escape(newPassword)
    )

    await connection.query(
      "GRANT ALL PRIVILEGES ON `railway`.* TO 'fishery_app'@'%'"
    )

    await connection.query('FLUSH PRIVILEGES')

    console.log('New database user created successfully!')
    console.log('Username: fishery_app')
    console.log('Keep your new password private.')
  } catch (error) {
    console.error('Error:', error.message)
  } finally {
    if (connection) await connection.end()
  }
}

createUser()
