
import jwt from 'jsonwebtoken'
import db from '../config/db.js'

// ==========================================
// AUTHENTICATION MIDDLEWARE
// ==========================================

export const verifyToken = async (req, res, next) => {
  try{
    // 1. Get token from HttpOnly cookie
    const token = req.cookies?.fishery_token
    if (!token){
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please log in.',
      })
    }

    // 2. Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // 3. Get latest user information from database
    const [users] = await db.execute(
      `SELECT id, name, email, phone, role, status, token_version
       FROM users
       WHERE id = ?
       LIMIT 1`,
      [decoded.userId]
    )

    if (users.length === 0){
      return res.status(401).json({
        success: false,
        message: 'User account not found.',
      })
    }

    const user = users[0]

    // 4. Check current account status
    if (user.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Your account is not active.',
      })
    }

    // 5. Verify token version
    if( decoded.tokenVersion === undefined || Number(decoded.tokenVersion) !== Number(user.token_version) ){
      res.clearCookie('fishery_token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      })

      return res.status(401).json({
        success: false,
        message: 'Your session is no longer valid. Please log in again.',
      })
    }

    // 6. Attach authenticated user to request
    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
    }

    next()
  } 
  catch (error){
    if (error.name === 'TokenExpiredError'){
      return res.status(401).json({
        success: false,
        message: 'Your session has expired. Please log in again.',
      })
    }

    if (error.name === 'JsonWebTokenError'){
      return res.status(401).json({
        success: false,
        message: 'Invalid authentication token.',
      })
    }

    console.error('Authentication Error:', error)

    return res.status(500).json({
      success: false,
      message: 'Authentication failed.',
    })
  }
}

// ==========================================
// ROLE-BASED AUTHORIZATION MIDDLEWARE
// ==========================================

export const authorizeRoles = (...allowedRoles) =>{
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
      })
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to access this resource.',
      })
    }

    next()
  }
}
