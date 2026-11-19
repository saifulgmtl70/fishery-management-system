
import { Routes, Route } from 'react-router-dom'

// Public Layout
import PublicLayout from '../layouts/PublicLayout'

// Admin Dashboard Layout
import AdminDashboardLayout from '../admin/layouts/AdminDashboardLayout'

// Public Pages
import Home from '../pages/public/Home/Home'
import About from '../pages/public/About/About'
import Fishery from '../pages/public/Fishery/Fishery'
import Gallery from '../pages/public/Gallery/Gallery'
import Contact from '../pages/public/Contact/Contact'

// Authentication Pages
import Login from '../pages/auth/Login'
import ForgotPassword from '../pages/auth/ForgotPassword'

// Admin Pages
import DashboardHome from '../admin/pages/DashboardHome'
import PondManagement from '../admin/pages/ponds/PondManagement'
import FishStockManagement from '../admin/pages/FishStock/FishStockManagement'
import FishSpeciesManagement from '../admin/pages/FishStock/FishSpeciesManagement'
import FishMortalityManagement from '../admin/pages/FishStock/FishMortalityManagement'
import FishHarvestManagement from '../admin/pages/Harvesting/FishHarvestManagement'

import FeedTypeManagement from '../admin/pages/FeedManagement/FeedTypeManagement'
import FeedManagement from '../admin/pages/FeedManagement/FeedManagement'
import FeedSupplierManagement from '../admin/pages/FeedManagement/FeedSupplierManagement'
import FeedPurchaseManagement from '../admin/pages/FeedManagement/FeedPurchaseManagement'
import DailyFeedingManagement from '../admin/pages/FeedManagement/DailyFeedingManagement'
import FeedStockManagement from '../admin/pages/FeedManagement/FeedStockManagement'
import DealerManagement from '../admin/pages/dealers/DealerManagement'

import FishSaleManagement from '../admin/pages/FishSales/FishSaleManagement.'

import FinanceOverview from '../admin/pages/Finance/FinanceOverview'
import ExpenseManagement from '../admin/pages/Finance/ExpenseManagement'
import IncomeManagement from '../admin/pages/Finance/IncomeManagement'
import ProfitLoss from '../admin/pages/Finance/ProfitLoss'


// Route Protection
import ProtectedRoute from './ProtectedRoute'
import GuestRoute from './GuestRoute'
import FinancialReports from '../admin/pages/Finance/FinancialReports'
import LakeManagement from '../admin/pages/Lake/LakeManagement'



function AppRoutes() {

  return (
    <Routes>

      {/* Public Website */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/fishery" element={<Fishery />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/contact" element={<Contact />} />
      </Route>

      {/* Admin Authentication */}
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Route>

      {/* Admin Dashboard */}
      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route path="/dashboard" element={<AdminDashboardLayout />}>

          <Route index element={<DashboardHome />} />

          {/* Pond Management */}
          <Route path="ponds" element={<PondManagement />} />

          {/* Lake Management */}
          <Route path="lake" element={<LakeManagement />} />

          {/* Fish Management */}
          <Route path="fish" element={<FishStockManagement />} />
          <Route path="fish-species" element={<FishSpeciesManagement />} />
          <Route path="fish-mortality" element={<FishMortalityManagement />} />
          <Route path="harvesting" element={<FishHarvestManagement />} />

          {/* Feed Management */}
          <Route path="feed" element={<FeedManagement />} />
          <Route path="feed-types" element={<FeedTypeManagement />} />
          <Route path="feed-suppliers" element={<FeedSupplierManagement />} />
          <Route path="feed-purchases" element={<FeedPurchaseManagement />} />
          <Route path="daily-feeding" element={<DailyFeedingManagement />} />
          <Route path="feed-stock" element={<FeedStockManagement />} />

          {/* Dealer Management */}

          <Route path="dealers" element={<DealerManagement />} />
          {/* Sales Management */}
          <Route path="fish-sales" element={<FishSaleManagement />} />

          {/* Finance Management */}
          <Route path="finance" element={<FinanceOverview />} />
          <Route path="income" element={<IncomeManagement />} />
          <Route path="expenses" element={<ExpenseManagement />} />
          <Route path="profit-loss" element={<ProfitLoss />} />
          <Route path="financial-reports" element={<FinancialReports />} />

        </Route>
      </Route>

    </Routes>
  )
}

export default AppRoutes
