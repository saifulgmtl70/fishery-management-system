
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'

import api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // ==========================================
  // CHECK EXISTING ADMIN SESSION
  // ==========================================

  const checkAuth = useCallback(async () => {
    try {
      const response = await api.get('/auth/me')

      if (
        response.data.success &&
        response.data.user?.role === 'admin'
      ) {
        setUser(response.data.user)
        return response.data.user
      }

      setUser(null)
      return null
    } catch (error) {
      console.error('Authentication Check Error:', error)
      setUser(null)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  // ==========================================
  // INITIAL AUTHENTICATION
  // ==========================================

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  // ==========================================
  // ADMIN LOGIN
  // ==========================================

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

  // ==========================================
  // ADMIN LOGOUT
  // ==========================================

  const logout = async () => {
    try {
      await api.post('/auth/logout')
    } finally {
      setUser(null)
    }
  }

  // ==========================================
  // UPDATE CURRENT USER
  // ==========================================

  const updateUser = (updatedUser) => {
    setUser((previousUser) => ({
      ...previousUser,
      ...updatedUser,
    }))
  }

  // ==========================================
  // CLEAR USER SESSION
  // ==========================================

  const clearUser = () => {
    setUser(null)
  }

  // ==========================================
  // CONTEXT VALUE
  // ==========================================

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

// ==========================================
// CUSTOM AUTH HOOK
// ==========================================

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }

  return context
}
