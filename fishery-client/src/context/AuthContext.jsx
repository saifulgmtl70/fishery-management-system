
import { createContext, useContext, useEffect, useState } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Check existing admin session
  const checkAuth = async () => {
    try {
      const response = await api.get('/auth/me')

      if (
        response.data.success &&
        response.data.user?.role === 'admin'
      ) {
        setUser(response.data.user)
      } else {
        setUser(null)
      }
    } catch (error) {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkAuth()
  }, [])

  // Admin Login
  const login = async (credentials) => {
    const response = await api.post('/auth/login', credentials)

    if (
      response.data.success &&
      response.data.user?.role === 'admin'
    ) {
      setUser(response.data.user)
    } else {
      setUser(null)
      throw new Error('Only administrators can log in.')
    }

    return response.data
  }

  // Admin Logout
  const logout = async () => {
    try {
      await api.post('/auth/logout')
    } finally {
      setUser(null)
    }
  }

  // Update current user information
  const updateUser = (updatedUser) => {
    setUser(updatedUser)
  }

  // Clear current user session
  const clearUser = () => {
    setUser(null)
  }

  const value = {
    user,
    loading,
    isAuthenticated: Boolean(user && user.role === 'admin'),
    login,
    logout,
    checkAuth,
    updateUser,
    clearUser,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom Hook
export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }

  return context
}
