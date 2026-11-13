
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function ProtectedRoute({ allowedRoles }) {
  const { user, loading, isAuthenticated } = useAuth()

  // Wait until authentication check finishes
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F7F8F5]">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#E1E9E2] border-t-[#167D62]" />
          <p className="mt-4 text-sm font-medium text-[#718078]">
            Checking authentication...
          </p>
        </div>
      </div>
    )
  }

  // Redirect unauthenticated users to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Check user role
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}

export default ProtectedRoute
