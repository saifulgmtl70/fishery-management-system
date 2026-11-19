
import express from 'express'

import {
  loginUser,
  getCurrentUser,
  updateProfile,
  changePassword,
  logoutUser,
} from '../controllers/authController.js'

import upload from '../middlewares/profileUpload.js'

import {
  uploadProfileImage,
  deleteProfileImage,
} from '../controllers/profileImageController.js'

import {
  verifyToken,
  authorizeRoles,
} from '../middlewares/authMiddleware.js'

const router = express.Router()

// Admin Login
router.post('/login', loginUser)

// Get Current Admin
router.get(
  '/me',
  verifyToken,
  authorizeRoles('admin'),
  getCurrentUser
)

// Update Admin Profile
router.put(
  '/profile',
  verifyToken,
  authorizeRoles('admin'),
  updateProfile
)

// Upload Admin Profile Image
router.patch(
  '/profile-image',
  verifyToken,
  authorizeRoles('admin'),
  upload.single('image'),
  uploadProfileImage
)

// Delete Admin Profile Image
router.delete(
  '/profile-image',
  verifyToken,
  authorizeRoles('admin'),
  deleteProfileImage
)

// Change Admin Password
router.patch(
  '/change-password',
  verifyToken,
  authorizeRoles('admin'),
  changePassword
)

// Admin Logout
router.post(
  '/logout',
  verifyToken,
  authorizeRoles('admin'),
  logoutUser
)

export default router
