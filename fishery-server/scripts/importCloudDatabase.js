
import mysql from 'mysql2/promise'
import fs from 'node:fs'
import path from 'node:path'

const importDatabase = async () => {
  let connection

  try {
    const sqlPath = path.resolve('../fishery_db.sql')
    const sql = fs.readFileSync(sqlPath, 'utf8')

    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      multipleStatements: true,
      connectTimeout: 30000,
    })

    console.log('Connected to Railway MySQL!')

    await connection.query(sql)

    const [tables] = await connection.query('SHOW TABLES')

    console.log('Database imported successfully!')
    console.log(`Total tables imported: ${tables.length}`)

  } catch (error) {
    console.error('Database Import Failed:', error.message)
  } finally {
    if (connection) await connection.end()
  }
}

importDatabase()
