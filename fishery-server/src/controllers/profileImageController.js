
import db from '../config/db.js'

// ==========================================
// UPLOAD ADMIN PROFILE IMAGE
// ==========================================

export const uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please select an image to upload.',
      })
    }

    const apiKey = process.env.IMGBB_API_KEY

    if (!apiKey) {
      return res.status(500).json({
        success: false,
        message: 'Image upload configuration is missing.',
      })
    }

    const userId = req.user.id

    // Convert image buffer to Base64
    const base64Image = req.file.buffer.toString('base64')

    const formData = new URLSearchParams()
    formData.append('image', base64Image)

    // Upload image to ImgBB
    const uploadResponse = await fetch(
      `https://api.imgbb.com/1/upload?key=${encodeURIComponent(apiKey)}`,
      {
        method: 'POST',
        body: formData,
      }
    )

    const imageResult = await uploadResponse.json()

    if (!uploadResponse.ok || !imageResult.success) {
      console.error('ImgBB Upload Error:', imageResult)

      return res.status(500).json({
        success: false,
        message: 'Failed to upload image to ImgBB.',
      })
    }

    const imageUrl = imageResult.data.display_url
    const deleteUrl = imageResult.data.delete_url || null

    // Check existing admin account
    const [users] = await db.execute(
      `SELECT id, profile_image_delete_url
       FROM users
       WHERE id = ?
       LIMIT 1`,
      [userId]
    )

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Admin account not found.',
      })
    }

    const oldDeleteUrl = users[0].profile_image_delete_url

    // Save new image URL
    await db.execute(
      `UPDATE users
       SET profile_image = ?, profile_image_delete_url = ?
       WHERE id = ?`,
      [imageUrl, deleteUrl, userId]
    )

    // Delete previous image if available
    if (oldDeleteUrl && oldDeleteUrl !== deleteUrl) {
      try {
        await fetch(oldDeleteUrl)
      } catch (deleteError) {
        console.error('Old ImgBB Image Delete Error:', deleteError)
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Profile picture uploaded successfully.',
      profile_image: imageUrl,
    })
  } catch (error) {
    console.error('Upload Profile Image Error:', error)

    return res.status(500).json({
      success: false,
      message: 'Failed to upload profile picture.',
    })
  }
}

// ==========================================
// DELETE ADMIN PROFILE IMAGE
// ==========================================

export const deleteProfileImage = async (req, res) => {
  try {
    const userId = req.user.id

    const [users] = await db.execute(
      `SELECT profile_image, profile_image_delete_url
       FROM users
       WHERE id = ?
       LIMIT 1`,
      [userId]
    )

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Admin account not found.',
      })
    }

    const oldDeleteUrl = users[0].profile_image_delete_url

    if (!users[0].profile_image) {
      return res.status(400).json({
        success: false,
        message: 'No profile picture found.',
      })
    }

    // Remove image information from database
    await db.execute(
      `UPDATE users
       SET profile_image = NULL,
           profile_image_delete_url = NULL
       WHERE id = ?`,
      [userId]
    )

    // Request deletion from ImgBB
    if (oldDeleteUrl) {
      try {
        const deleteResponse = await fetch(oldDeleteUrl)

        if (!deleteResponse.ok) {
          console.error(
            'ImgBB returned an unsuccessful delete response:',
            deleteResponse.status
          )
        }
      } catch (deleteError) {
        console.error('ImgBB Image Delete Error:', deleteError)
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Profile picture removed successfully.',
    })
  } catch (error) {
    console.error('Delete Profile Image Error:', error)

    return res.status(500).json({
      success: false,
      message: 'Failed to remove profile picture.',
    })
  }
}
