import dotenv from 'dotenv'
import bcrypt from 'bcryptjs'
import db from '../src/config/db.js'

dotenv.config()

const createAdmin = async () => {
  try {
    const name = process.env.ADMIN_NAME
    const email = process.env.ADMIN_EMAIL?.toLowerCase().trim()
    const password = process.env.ADMIN_PASSWORD

    // Validate Admin Information
    if (!name || !email || !password) {
      throw new Error('Admin information is missing in .env file.')
    }

    if (password.length < 12) {
      throw new Error('Admin password must be at least 12 characters.')
    }

    // Check Existing Email
    const [existingUsers] = await db.execute(
      'SELECT id, role FROM users WHERE email = ?',
      [email]
    )

    if (existingUsers.length > 0) {
      throw new Error(
        `This email already belongs to an existing ${existingUsers[0].role} account.`
      )
    }

    // Hash Password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create Admin
    const [result] = await db.execute(
      `INSERT INTO users (name, email, password, role, status)
       VALUES (?, ?, ?, 'admin', 'active')`,
      [name, email, hashedPassword]
    )

    console.log('====================================')
    console.log('Admin Account Created Successfully!')
    console.log(`Admin ID: ${result.insertId}`)
    console.log(`Admin Name: ${name}`)
    console.log(`Admin Email: ${email}`)
    console.log('Role: admin')
    console.log('Status: active')
    console.log('Password: Securely Hashed')
    console.log('====================================')

  } catch (error) {
    console.error('Admin Creation Failed!')
    console.error(error.message)

    process.exitCode = 1
  } finally {
    await db.end()
  }
}

createAdmin()