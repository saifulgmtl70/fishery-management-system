
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import {
  UserRound,
  Mail,
  Phone,
  ShieldCheck,
  LockKeyhole,
  Eye,
  EyeOff,
  Save,
  Loader2,
  KeyRound,
  RefreshCw,
  Camera,
  Upload,
  Trash2,
  ImagePlus,
  X,
} from 'lucide-react'

import api from '../../../services/api'
import { useAuth } from '../../../context/AuthContext'

// ==========================================
// PASSWORD INPUT COMPONENT
// Keep this OUTSIDE Profile to prevent focus loss.
// ==========================================

const PasswordInput = ({
  label,
  name,
  value,
  placeholder,
  visible,
  toggleVisibility,
  autoComplete,
  onChange,
  inputClass,
  labelClass,
}) => (
  <div>
    <label htmlFor={name} className={labelClass}>
      {label}
    </label>

    <div className="relative">
      <input
        id={name}
        type={visible ? 'text' : 'password'}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={`${inputClass} pr-12`}
        required
      />

      <button
        type="button"
        onClick={toggleVisibility}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-[#159B60]"
        aria-label={visible ? 'Hide password' : 'Show password'}
      >
        {visible ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  </div>
)

// ==========================================
// PROFILE PAGE
// ==========================================

function Profile() {
  const navigate = useNavigate()
  const { user, checkAuth, logout } = useAuth()

  const fileInputRef = useRef(null)

  // Profile information
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
  })

  // Password information
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  // Profile image
  const [selectedImage, setSelectedImage] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')

  const [imageUploading, setImageUploading] = useState(false)
  const [imageRemoving, setImageRemoving] = useState(false)

  // Loading states
  const [profileLoading, setProfileLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)

  // Password visibility
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // ==========================================
  // LOAD USER INFORMATION
  // ==========================================

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
      })
    }
  }, [user])

  // ==========================================
  // CLEANUP IMAGE PREVIEW
  // ==========================================

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  // ==========================================
  // INPUT HANDLERS
  // ==========================================

  const handleProfileChange = (event) => {
    const { name, value } = event.target

    setProfileData((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

  const handlePasswordChange = (event) => {
    const { name, value } = event.target

    setPasswordData((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

  // ==========================================
  // PROFILE IMAGE SELECTION
  // ==========================================

  const handleImageSelect = (event) => {
    const file = event.target.files?.[0]

    if (!file) return

    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
    ]

    if (!allowedTypes.includes(file.type)) {
      toast.error('Only JPG, PNG and WebP images are allowed.')
      event.target.value = ''
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size must be less than 2MB.')
      event.target.value = ''
      return
    }

    setSelectedImage(file)

    const newPreviewUrl = URL.createObjectURL(file)
    setPreviewUrl(newPreviewUrl)
  }

  // ==========================================
  // UPLOAD PROFILE IMAGE
  // ==========================================

  const handleImageUpload = async () => {
    if (!selectedImage) {
      toast.error('Please select an image first.')
      return
    }

    try {
      setImageUploading(true)

      const formData = new FormData()
      formData.append('image', selectedImage)

      await api.patch('/auth/profile-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      await checkAuth()

      setSelectedImage(null)
      setPreviewUrl('')

      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

      toast.success('Profile picture updated successfully.')
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          'Failed to upload profile picture.'
      )
    } finally {
      setImageUploading(false)
    }
  }

  // ==========================================
  // REMOVE PROFILE IMAGE
  // ==========================================

  const handleImageRemove = async () => {
    if (!user?.profile_image) {
      toast.error('No profile picture to remove.')
      return
    }

    const confirmed = window.confirm(
      'Are you sure you want to remove your profile picture?'
    )

    if (!confirmed) return

    try {
      setImageRemoving(true)

      await api.delete('/auth/profile-image')

      await checkAuth()

      setSelectedImage(null)
      setPreviewUrl('')

      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

      toast.success('Profile picture removed successfully.')
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          'Failed to remove profile picture.'
      )
    } finally {
      setImageRemoving(false)
    }
  }

  // ==========================================
  // UPDATE PROFILE INFORMATION
  // ==========================================

  const handleProfileSubmit = async (event) => {
    event.preventDefault()

    try {
      setProfileLoading(true)

      await api.put('/auth/profile', profileData)

      await checkAuth()

      toast.success('Profile information updated successfully.')
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          'Failed to update profile information.'
      )
    } finally {
      setProfileLoading(false)
    }
  }

  // ==========================================
  // CHANGE PASSWORD
  // ==========================================

  const handlePasswordSubmit = async (event) => {
    event.preventDefault()

    if (
      passwordData.newPassword !== passwordData.confirmPassword
    ) {
      toast.error('New password and confirm password do not match.')
      return
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters.')
      return
    }

    try {
      setPasswordLoading(true)

      await api.patch('/auth/change-password', passwordData)

      toast.success(
        'Password changed successfully. Please log in again.'
      )

      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })

      await logout()
      navigate('/login')
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          'Failed to change password.'
      )
    } finally {
      setPasswordLoading(false)
    }
  }

  // ==========================================
  // STYLES
  // ==========================================

  const inputClass =
    'w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-[#159B60] focus:ring-4 focus:ring-[#159B60]/10'

  const labelClass =
    'mb-2 block text-sm font-semibold text-gray-700'

  const currentImage = previewUrl || user?.profile_image || ''

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="space-y-6 pb-8">

      {/* PAGE HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-[#123D35]">
          Account Settings
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Manage your administrator information and account security.
        </p>
      </div>

      {/* PROFILE SUMMARY */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="h-28 bg-gradient-to-r from-[#123D35] to-[#159B60]" />

        <div className="px-6 pb-6">
          <div className="-mt-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

            <div className="flex items-end gap-4">
              <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-[#EAF3ED] shadow-md">
                {currentImage ? (
                  <img
                    src={currentImage}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <UserRound size={42} className="text-[#159B60]" />
                )}
              </div>

              <div className="pb-1">
                <h2 className="text-xl font-bold text-[#123D35]">
                  {user?.name || 'Administrator'}
                </h2>

                <p className="text-sm text-gray-500">
                  {user?.email || ''}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 pb-1">
              <span className="rounded-full bg-[#EAF3ED] px-3 py-1 text-xs font-semibold capitalize text-[#159B60]">
                {user?.role || 'Admin'}
              </span>

              <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                Active Account
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* PROFILE IMAGE */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EAF3ED] text-[#159B60]">
            <Camera size={20} />
          </div>

          <div>
            <h2 className="font-bold text-[#123D35]">
              Profile Picture
            </h2>

            <p className="text-xs text-gray-500">
              Upload or update your administrator photo.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">

          <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-gray-200 bg-gray-50">
            {currentImage ? (
              <img
                src={currentImage}
                alt="Profile preview"
                className="h-full w-full object-cover"
              />
            ) : (
              <ImagePlus size={32} className="text-gray-400" />
            )}
          </div>

          <div className="flex-1">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageSelect}
              className="hidden"
            />

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={imageUploading || imageRemoving}
                className="inline-flex items-center gap-2 rounded-xl bg-[#123D35] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#159B60] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Upload size={16} />
                Choose Photo
              </button>

              {selectedImage && (
                <>
                  <button
                    type="button"
                    onClick={handleImageUpload}
                    disabled={imageUploading}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#159B60] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#12834F] disabled:opacity-50"
                  >
                    {imageUploading ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Save size={16} />
                    )}

                    {imageUploading ? 'Uploading...' : 'Save Photo'}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedImage(null)
                      setPreviewUrl('')

                      if (fileInputRef.current) {
                        fileInputRef.current.value = ''
                      }
                    }}
                    disabled={imageUploading}
                    className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
                  >
                    <X size={16} />
                    Cancel
                  </button>
                </>
              )}

              {user?.profile_image && !selectedImage && (
                <button
                  type="button"
                  onClick={handleImageRemove}
                  disabled={imageRemoving}
                  className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                >
                  {imageRemoving ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Trash2 size={16} />
                  )}

                  {imageRemoving ? 'Removing...' : 'Remove Photo'}
                </button>
              )}
            </div>

            <p className="mt-3 text-xs text-gray-400">
              JPG, PNG or WebP. Maximum file size: 2MB.
            </p>
          </div>
        </div>
      </div>

      {/* PROFILE INFORMATION */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EAF3ED] text-[#159B60]">
            <UserRound size={20} />
          </div>

          <div>
            <h2 className="font-bold text-[#123D35]">
              Profile Information
            </h2>

            <p className="text-xs text-gray-500">
              Update your personal account information.
            </p>
          </div>
        </div>

        <form onSubmit={handleProfileSubmit} className="space-y-5">

          <div>
            <label htmlFor="name" className={labelClass}>
              Full Name
            </label>

            <div className="relative">
              <UserRound
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                id="name"
                type="text"
                name="name"
                value={profileData.name}
                onChange={handleProfileChange}
                placeholder="Enter your full name"
                className={`${inputClass} pl-11`}
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className={labelClass}>
              Email Address
            </label>

            <div className="relative">
              <Mail
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                id="email"
                type="email"
                name="email"
                value={profileData.email}
                onChange={handleProfileChange}
                placeholder="Enter your email address"
                className={`${inputClass} pl-11`}
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="phone" className={labelClass}>
              Phone Number
            </label>

            <div className="relative">
              <Phone
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                id="phone"
                type="tel"
                name="phone"
                value={profileData.phone}
                onChange={handleProfileChange}
                placeholder="Enter your phone number"
                className={`${inputClass} pl-11`}
              />
            </div>
          </div>

          <div className="flex justify-end border-t border-gray-100 pt-5">
            <button
              type="submit"
              disabled={profileLoading}
              className="inline-flex items-center gap-2 rounded-xl bg-[#159B60] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#12834F] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {profileLoading ? (
                <Loader2 size={17} className="animate-spin" />
              ) : (
                <Save size={17} />
              )}

              {profileLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* CHANGE PASSWORD */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EAF3ED] text-[#159B60]">
            <LockKeyhole size={20} />
          </div>

          <div>
            <h2 className="font-bold text-[#123D35]">
              Change Password
            </h2>

            <p className="text-xs text-gray-500">
              Update your password to keep your account secure.
            </p>
          </div>
        </div>

        <form onSubmit={handlePasswordSubmit} className="space-y-5">

          <PasswordInput
            label="Current Password"
            name="currentPassword"
            value={passwordData.currentPassword}
            placeholder="Enter your current password"
            visible={showCurrentPassword}
            toggleVisibility={() =>
              setShowCurrentPassword((previous) => !previous)
            }
            autoComplete="current-password"
            onChange={handlePasswordChange}
            inputClass={inputClass}
            labelClass={labelClass}
          />

          <PasswordInput
            label="New Password"
            name="newPassword"
            value={passwordData.newPassword}
            placeholder="Enter new password"
            visible={showNewPassword}
            toggleVisibility={() =>
              setShowNewPassword((previous) => !previous)
            }
            autoComplete="new-password"
            onChange={handlePasswordChange}
            inputClass={inputClass}
            labelClass={labelClass}
          />

          <PasswordInput
            label="Confirm New Password"
            name="confirmPassword"
            value={passwordData.confirmPassword}
            placeholder="Confirm new password"
            visible={showConfirmPassword}
            toggleVisibility={() =>
              setShowConfirmPassword((previous) => !previous)
            }
            autoComplete="new-password"
            onChange={handlePasswordChange}
            inputClass={inputClass}
            labelClass={labelClass}
          />

          <div className="flex justify-end border-t border-gray-100 pt-5">
            <button
              type="submit"
              disabled={passwordLoading}
              className="inline-flex items-center gap-2 rounded-xl bg-[#123D35] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#159B60] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {passwordLoading ? (
                <Loader2 size={17} className="animate-spin" />
              ) : (
                <KeyRound size={17} />
              )}

              {passwordLoading ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>

      {/* SECURITY NOTICE */}
      <div className="flex gap-3 rounded-2xl border border-[#159B60]/15 bg-[#EAF3ED] p-5">
        <ShieldCheck
          size={22}
          className="mt-0.5 shrink-0 text-[#159B60]"
        />

        <div>
          <h3 className="text-sm font-bold text-[#123D35]">
            Account Security
          </h3>

          <p className="mt-1 text-xs leading-6 text-gray-600">
            Keep your account information updated and use a strong,
            unique password. Never share your password with anyone.
          </p>
        </div>
      </div>

    </div>
  )
}

export default Profile
