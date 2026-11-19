
import { useEffect, useRef, useState } from 'react'
import {
  NavLink,
  Link,
  Outlet,
  useLocation,
  useNavigate,
} from 'react-router-dom'

import {
  LayoutDashboard,
  Fish,
  Waves,
  Package,
  ShoppingCart,
  Users,
  Wallet,
  LogOut,
  UserRound,
  ShoppingBag,
  Utensils,
  Warehouse,
  ChevronDown,
  Menu,
  X,
  Home,
  Settings,
  Skull,
  CircleUserRound,
  TrendingUp,
  TrendingDown,
  ChartNoAxesCombined,
  FileBarChart,
} from 'lucide-react'

import { useAuth } from '../../context/AuthContext'

// ==========================================
// ADMIN NAVIGATION
// ==========================================

const navigation = [
  {
    name: 'Dashboard',
    path: '/dashboard',
    icon: LayoutDashboard,
    type: 'link',
  },
  {
    name: 'Pond Management',
    path: '/dashboard/ponds',
    icon: Waves,
    type: 'link',
  },
  {
    name: 'Lake Management',
    path: '/dashboard/lake',
    icon: Waves,
    type: 'link',
  },
  {
    name: 'Fish Management',
    icon: Fish,
    type: 'group',
    id: 'fish',
    children: [
      {
        name: 'Fish Stock',
        path: '/dashboard/fish',
        icon: Fish,
      },
      {
        name: 'Fish Species',
        path: '/dashboard/fish-species',
        icon: Package,
      },
      {
        name: 'Fish Mortality',
        path: '/dashboard/fish-mortality',
        icon: Skull,
      },
    ],
  },
  {
    name: 'Feed Management',
    icon: Package,
    type: 'group',
    id: 'feed',
    children: [
      {
        name: 'Feed Overview',
        path: '/dashboard/feed',
        icon: LayoutDashboard,
      },
      {
        name: 'Feed Purchases',
        path: '/dashboard/feed-purchases',
        icon: ShoppingBag,
      },
      {
        name: 'Daily Feeding',
        path: '/dashboard/daily-feeding',
        icon: Utensils,
      },
      {
        name: 'Feed Stock',
        path: '/dashboard/feed-stock',
        icon: Warehouse,
      },
    ],
  },
  {
    name: 'Harvesting',
    path: '/dashboard/harvesting',
    icon: ShoppingCart,
    type: 'link',
  },
  {
    name: 'Dealers',
    path: '/dashboard/dealers',
    icon: Users,
    type: 'link',
  },
  {
    name: 'Staff Management',
    path: '/dashboard/staff',
    icon: Users,
    type: 'link',
  },
  {
    name: 'Sales Management',
    path: '/dashboard/fish-sales',
    icon: ShoppingCart,
    type: 'link',
  },
  {
    name: 'Finance',
    icon: Wallet,
    type: 'group',
    id: 'finance',
    children: [
      {
        name: 'Finance Overview',
        path: '/dashboard/finance',
        icon: LayoutDashboard,
      },
      {
        name: 'Income Management',
        path: '/dashboard/income',
        icon: TrendingUp,
      },
      {
        name: 'Expense Management',
        path: '/dashboard/expenses',
        icon: TrendingDown,
      },
      {
        name: 'Profit & Loss',
        path: '/dashboard/profit-loss',
        icon: ChartNoAxesCombined,
      },
      {
        name: 'Financial Reports',
        path: '/dashboard/financial-reports',
        icon: FileBarChart,
      },
    ],
  },
]

// ==========================================
// HELPER FUNCTIONS
// ==========================================

const getActiveGroup = (pathname) => {
  const activeGroup = navigation.find(
    (item) =>
      item.type === 'group' &&
      item.children.some((child) => child.path === pathname)
  )

  return activeGroup?.id || null
}

// ==========================================
// DASHBOARD LAYOUT
// ==========================================

function DashboardLayout() {
  const navigate = useNavigate()
  const location = useLocation()

  const { user, logout } = useAuth()

  const [openGroup, setOpenGroup] = useState(() =>
    getActiveGroup(location.pathname)
  )

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  const profileRef = useRef(null)

  // Automatically open the group of the active route
  useEffect(() => {
    setOpenGroup(getActiveGroup(location.pathname))
    setProfileOpen(false)
  }, [location.pathname])

  // Close mobile sidebar after navigation
  useEffect(() => {
    setMobileSidebarOpen(false)
  }, [location.pathname])

  // Close profile dropdown when clicking outside or pressing Escape
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setProfileOpen(false)
      }
    }

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setProfileOpen(false)
        setMobileSidebarOpen(false)
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  // Sidebar group toggle
  const handleGroupToggle = (groupId) => {
    setOpenGroup((current) =>
      current === groupId ? null : groupId
    )
  }

  // Admin logout
  const handleLogout = async () => {
    try {
      setLoggingOut(true)
      await logout()
      navigate('/login', { replace: true })
    } catch (error) {
      console.error('Logout failed:', error)
      setLoggingOut(false)
    }
  }

  // Current page title
  const currentPage = navigation
    .flatMap((item) =>
      item.type === 'group' ? item.children : [item]
    )
    .find((item) => item.path === location.pathname)

  const pageTitle =
    location.pathname === '/dashboard/profile'
      ? 'My Profile'
      : currentPage?.name || 'Management Dashboard'

  // ==========================================
  // REUSABLE SIDEBAR CONTENT
  // ==========================================

  const renderSidebarContent = () => (
    <>
      {/* Brand */}
      <Link to="/">
        <div className="flex h-[82px] shrink-0 items-center gap-3 border-b border-white/[0.08] px-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#80D5B2] text-[#123D35]">
            <Fish size={25} strokeWidth={2.3} />
          </div>

          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-white">
              Fishery<span className="text-[#80D5B2]">.</span>
            </h1>

            <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[2px] text-emerald-100/50">
              Management System
            </p>
          </div>
        </div>
      </Link>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <p className="mb-4 px-3 text-[10px] font-bold uppercase tracking-[1.8px] text-emerald-100/40">
          Main Menu
        </p>

        <div className="space-y-1.5">
          {navigation.map((item) => {
            const Icon = item.icon

            if (item.type === 'link') {
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/dashboard'}
                  className={({ isActive }) =>
                    `group relative flex items-center gap-3 rounded-lg px-3.5 py-3 text-[13px] transition-all duration-200 ${
                      isActive
                        ? 'bg-[#80D5B2] font-semibold text-[#123D35] shadow-sm'
                        : 'text-emerald-50/70 hover:bg-white/[0.08] hover:text-white'
                    }`
                  }
                >
                  <Icon size={19} strokeWidth={2} />
                  <span>{item.name}</span>
                </NavLink>
              )
            }

            const isOpen = openGroup === item.id

            const isChildActive = item.children.some(
              (child) => child.path === location.pathname
            )

            return (
              <div key={item.id}>
                <button
                  type="button"
                  onClick={() => handleGroupToggle(item.id)}
                  aria-expanded={isOpen}
                  className={`flex w-full items-center gap-3 rounded-lg px-3.5 py-3 text-left text-[13px] font-medium transition-all duration-200 ${
                    isOpen || isChildActive
                      ? 'bg-white/[0.08] text-white'
                      : 'text-emerald-50/70 hover:bg-white/[0.08] hover:text-white'
                  }`}
                >
                  <Icon
                    size={19}
                    strokeWidth={2}
                    className={isChildActive ? 'text-[#80D5B2]' : ''}
                  />

                  <span className="flex-1">{item.name}</span>

                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-[#80D5B2]' : ''
                    }`}
                  />
                </button>

                <div
                  className={`grid transition-all duration-300 ease-in-out ${
                    isOpen
                      ? 'grid-rows-[1fr] opacity-100'
                      : 'grid-rows-[0fr] opacity-0'
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="ml-[22px] mt-1 space-y-1 border-l border-white/15 py-1 pl-4">
                      {item.children.map((child) => {
                        const ChildIcon = child.icon

                        return (
                          <NavLink
                            key={child.path}
                            to={child.path}
                            end
                            className={({ isActive }) =>
                              `flex items-center gap-3 rounded-md px-3 py-2.5 text-[12px] transition-all duration-200 ${
                                isActive
                                  ? 'bg-[#80D5B2]/15 font-semibold text-[#80D5B2]'
                                  : 'text-emerald-50/55 hover:bg-white/[0.08] hover:text-white'
                              }`
                            }
                          >
                            <ChildIcon size={16} />
                            <span>{child.name}</span>
                          </NavLink>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </nav>

      {/* Sidebar Bottom Branding */}
      <div className="shrink-0 border-t border-white/[0.08] px-6 py-4">
        <div className="flex items-center gap-2 text-[10px] text-emerald-100/40">
          <span className="h-1.5 w-1.5 rounded-full bg-[#80D5B2]" />
          <span>Fishery Operations Platform</span>
        </div>
      </div>
    </>
  )

  // ==========================================
  // MAIN RENDER
  // ==========================================

  return (
    <div className="min-h-screen bg-[#F5F7F4] text-gray-800">

      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[260px] flex-col bg-[#123D35] text-white md:flex">
        {renderSidebarContent()}
      </aside>

      {/* Mobile Sidebar */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[2px] md:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        >
          <aside
            className="flex h-full w-[280px] max-w-[85vw] flex-col bg-[#123D35] text-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex justify-end px-4 pt-3">
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="rounded-lg p-2 text-white/70 transition hover:bg-white/10 hover:text-white"
                aria-label="Close sidebar"
              >
                <X size={21} />
              </button>
            </div>

            <div className="flex min-h-0 flex-1 flex-col">
              {renderSidebarContent()}
            </div>
          </aside>
        </div>
      )}

      {/* Main Area */}
      <div className="min-h-screen min-w-0 md:ml-[260px]">

        {/* Top Navbar */}
        <header className="sticky top-0 z-30 border-b border-gray-200/80 bg-white/95 shadow-sm shadow-gray-200/30 backdrop-blur-xl">
          <div className="flex min-h-[76px] items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">

            {/* Header Left */}
            <div className="flex min-w-0 items-center gap-3">
              <button
                onClick={() => setMobileSidebarOpen(true)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-gray-200 text-[#123D35] transition hover:bg-[#E8F3ED] md:hidden"
                aria-label="Open sidebar"
              >
                <Menu size={21} />
              </button>

              <div className="min-w-0">
                <div className="mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[1.4px] text-gray-400">
                  <Home size={12} />
                  <span>Admin Panel</span>
                  <span>/</span>
                  <span className="truncate text-[#159B60]">
                    {pageTitle}
                  </span>
                </div>

                <h2 className="truncate text-lg font-bold tracking-tight text-[#123D35] sm:text-xl">
                  {pageTitle}
                </h2>
              </div>
            </div>

            {/* Header Right */}
            <div className="flex shrink-0 items-center gap-3 sm:gap-5">

              {/* System Status */}
              <div className="hidden items-center gap-2 rounded-full border border-emerald-100 bg-[#E8F3ED] px-3.5 py-2 lg:flex">
                <span className="h-2 w-2 rounded-full bg-[#159B60]" />
                <span className="text-[11px] font-semibold text-[#123D35]">
                  System Active
                </span>
              </div>

              {/* Profile Dropdown */}
              <div
                className="relative border-l border-gray-200 pl-3 sm:pl-5"
                ref={profileRef}
              >
                <button
                  type="button"
                  onClick={() =>
                    setProfileOpen((current) => !current)
                  }
                  aria-expanded={profileOpen}
                  className="flex items-center gap-2.5 rounded-xl px-2 py-1.5 transition hover:bg-gray-50"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#123D35] text-[#80D5B2]">
                    <UserRound size={19} />
                  </div>

                  <div className="hidden min-w-0 text-left sm:block">
                    <p className="max-w-[130px] truncate text-xs font-bold text-gray-800">
                      {user?.name || 'Admin'}
                    </p>

                    <p className="mt-0.5 text-[10px] capitalize text-gray-400">
                      {user?.role || 'Administrator'}
                    </p>
                  </div>

                  <ChevronDown
                    size={15}
                    className={`hidden text-gray-400 transition-transform sm:block ${
                      profileOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Dropdown Menu */}
                {profileOpen && (
                  <div className="absolute right-0 top-full z-50 mt-3 w-[260px] overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xl shadow-gray-900/10">

                    {/* Profile Details */}
                    <div className="border-b border-gray-100 bg-[#F8FAF8] p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#123D35] text-[#80D5B2]">
                          <UserRound size={22} />
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-gray-800">
                            {user?.name || 'Admin'}
                          </p>

                          <p className="mt-0.5 truncate text-xs text-gray-500">
                            {user?.email || 'Administrator'}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#E8F3ED] px-2.5 py-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#159B60]" />

                        <span className="text-[10px] font-semibold capitalize text-[#123D35]">
                          {user?.role || 'Administrator'}
                        </span>
                      </div>
                    </div>

                    {/* Dropdown Actions */}
                    <div className="p-2">

                      {/* Signed in account */}
                      <div className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs text-gray-500">
                        <CircleUserRound size={17} />
                        <span>Signed in account</span>
                      </div>

                      {/* My Profile */}
                      <Link
                        to="/dashboard/profile"
                        onClick={() => setProfileOpen(false)}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-[#E8F3ED] hover:text-[#123D35]"
                      >
                        <Settings size={17} />
                        My Profile
                      </Link>

                      {/* Sign Out */}
                      <button
                        type="button"
                        onClick={handleLogout}
                        disabled={loggingOut}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                      >
                        <LogOut size={17} />
                        {loggingOut
                          ? 'Signing out...'
                          : 'Sign Out'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="min-w-0 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-200/70 px-4 py-5 text-center sm:px-6">
          <p className="text-[11px] text-gray-400">
            © {new Date().getFullYear()} Fishery Management System.
            <span className="ml-1 text-[#159B60]">
              Built for smarter fishery operations.
            </span>
          </p>
        </footer>
      </div>
    </div>
  )
}

export default DashboardLayout
