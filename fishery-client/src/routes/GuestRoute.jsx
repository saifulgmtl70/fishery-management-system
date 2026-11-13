
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function GuestRoute() {
  const { user, loading, isAuthenticated } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F7F8F5]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#E1E9E2] border-t-[#167D62]" />
      </div>
    )
  }

  if (isAuthenticated) {
    const dashboardRoutes = {
      admin: '/dashboard',
      dealer: '/dealer/dashboard',
      customer: '/customer/dashboard',
    }

    return (
      <Navigate
        to={dashboardRoutes[user.role] || '/'}
        replace
      />
    )
  }

  return <Outlet />
}

export default GuestRoute
