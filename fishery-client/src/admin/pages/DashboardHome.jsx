
import { useCallback, useEffect, useState } from 'react'
import {
  Waves,
  Fish,
  Package,
  Wallet,
  TrendingUp,
  TrendingDown,
  Receipt,
  ShoppingCart,
  Scale,
  AlertCircle,
  RefreshCw,
  CalendarDays,
  Utensils,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Clock3,
  Users,
} from 'lucide-react'
import { toast } from 'sonner'
import api from '../../services/api'

// ==========================================
// HELPERS
// ==========================================

const formatMoney = (value) =>
  `৳${Number(value || 0).toLocaleString('en-BD', {
    maximumFractionDigits: 2,
  })}`

const formatNumber = (value, decimals = 2) =>
  Number(value || 0).toLocaleString('en-BD', {
    maximumFractionDigits: decimals,
  })

const formatDate = (date) => {
  if (!date) return '—'

  const parsed = new Date(`${String(date).slice(0, 10)}T00:00:00`)

  if (Number.isNaN(parsed.getTime())) return '—'

  return parsed.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

const getActivityDetails = (type) => {
  switch (type) {
    case 'Fish Sale':
      return {
        icon: ShoppingCart,
        color: 'text-blue-600',
        bg: 'bg-blue-50',
        border: 'border-blue-100',
        format: 'money',
      }

    case 'Fish Stocking':
      return {
        icon: Fish,
        color: 'text-emerald-600',
        bg: 'bg-emerald-50',
        border: 'border-emerald-100',
        format: 'money',
      }

    case 'Fish Mortality':
      return {
        icon: AlertCircle,
        color: 'text-red-600',
        bg: 'bg-red-50',
        border: 'border-red-100',
        format: 'kg',
      }

    case 'Daily Feeding':
      return {
        icon: Utensils,
        color: 'text-amber-600',
        bg: 'bg-amber-50',
        border: 'border-amber-100',
        format: 'kg',
      }

    case 'Expense':
      return {
        icon: Receipt,
        color: 'text-orange-600',
        bg: 'bg-orange-50',
        border: 'border-orange-100',
        format: 'money',
      }

    case 'Staff Salary':
      return {
        icon: Users,
        color: 'text-purple-600',
        bg: 'bg-purple-50',
        border: 'border-purple-100',
        format: 'money',
      }

    default:
      return {
        icon: Activity,
        color: 'text-gray-600',
        bg: 'bg-gray-50',
        border: 'border-gray-100',
        format: 'money',
      }
  }
}

const formatActivityAmount = (activity) => {
  if (activity.amount === null || activity.amount === undefined) {
    return 'N/A'
  }

  const details = getActivityDetails(activity.activity_type)

  return details.format === 'kg'
    ? `${formatNumber(activity.amount)} kg`
    : formatMoney(activity.amount)
}

// ==========================================
// COMPONENTS
// ==========================================

function SectionHeader({ title, subtitle, icon: Icon }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      {Icon && (
        <div className="w-10 h-10 rounded-xl bg-[#EAF3ED] flex items-center justify-center shrink-0">
          <Icon size={19} className="text-[#159B60]" />
        </div>
      )}

      <div>
        <h2 className="text-lg font-bold text-[#123D35]">{title}</h2>
        {subtitle && (
          <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>
        )}
      </div>
    </div>
  )
}

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor,
  iconBg,
  accent,
  loading,
}) {
  return (
    <div className="relative overflow-hidden bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      <div className={`absolute top-0 left-0 w-full h-1 ${accent}`} />

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-gray-500">{title}</p>

          {loading ? (
            <div className="h-8 w-28 bg-gray-100 rounded-md animate-pulse mt-3" />
          ) : (
            <h3 className="text-2xl font-bold text-[#123D35] tracking-tight mt-3 break-words">
              {value}
            </h3>
          )}

          {subtitle && (
            <p className="text-xs text-gray-400 mt-2">{subtitle}</p>
          )}
        </div>

        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
          <Icon size={21} className={iconColor} />
        </div>
      </div>
    </div>
  )
}

function ActivityCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
  bg,
  loading,
}) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${bg}`}>
          <Icon size={19} className={color} />
        </div>

        <div className="min-w-0">
          <p className="text-sm text-gray-500">{title}</p>

          {loading ? (
            <div className="h-6 w-24 bg-gray-100 rounded animate-pulse mt-1" />
          ) : (
            <h3 className="text-xl font-bold text-[#123D35] mt-1">
              {value}
            </h3>
          )}
        </div>
      </div>

      <p className="text-xs text-gray-400 mt-3">{subtitle}</p>
    </div>
  )
}

function EmptyState({ message }) {
  return (
    <div className="py-12 text-center">
      <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-3">
        <Activity size={22} className="text-gray-400" />
      </div>
      <p className="text-sm text-gray-500">{message}</p>
    </div>
  )
}

// ==========================================
// MAIN
// ==========================================

function DashboardHome() {
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')

  const fetchDashboard = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }

      setError('')

      const response = await api.get('/dashboard/overview')
      const result = response.data

      if (!result?.success || !result?.data) {
        throw new Error(
          result?.message || 'Unable to retrieve dashboard information.'
        )
      }

      setDashboard(result.data)
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        'Failed to load dashboard information.'

      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchDashboard()
  }, [fetchDashboard])

  const farm = dashboard?.farm_overview
  const finance = dashboard?.financial_overview
  const today = dashboard?.today_activity
  const activities = dashboard?.recent_activities || []

  // ==========================================
  // INCOME BREAKDOWN
  // ==========================================

  const incomeBreakdown = [
    {
      label: 'Fish Sales',
      value: finance?.fish_sales_income || 0,
      color: 'bg-emerald-500',
    },
    {
      label: 'Local Fishing',
      value: finance?.local_fishing_income || 0,
      color: 'bg-blue-500',
    },
    {
      label: 'Rod Fishing',
      value: finance?.rod_fishing_income || 0,
      color: 'bg-amber-500',
    },
  ]

  const maximumIncome = Math.max(
    ...incomeBreakdown.map((item) => Number(item.value)),
    1
  )

  // ==========================================
  // EXPENSE BREAKDOWN
  // ==========================================

  const expenseBreakdown = [
    {
      label: 'Manual Expenses',
      value: finance?.manual_expenses || 0,
      icon: Receipt,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
      accent: 'bg-orange-500',
    },
    {
      label: 'Feed Expenses',
      value: finance?.feed_expenses || 0,
      icon: Package,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      accent: 'bg-amber-500',
    },
    {
      label: 'Fish Stocking Expenses',
      value: finance?.stocking_expenses || 0,
      icon: Fish,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      accent: 'bg-emerald-500',
    },
    {
      label: 'Staff Salary Expenses',
      value: finance?.staff_salary_expenses || 0,
      icon: Users,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      accent: 'bg-purple-500',
    },
  ]

  const isLoss = Number(finance?.net_loss || 0) > 0

  return (
    <div className="space-y-8 lg:space-y-10 pb-8">

      {/* HEADER */}

      <div className="bg-gradient-to-br from-[#123D35] to-[#17694D] rounded-2xl p-5 sm:p-7 text-white shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 text-emerald-200 text-xs font-semibold uppercase tracking-wider mb-2">
              <Activity size={14} />
              Farm Management
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Dashboard Overview
            </h1>

            <p className="text-sm text-white/70 mt-2">
              Monitor your farm operations, inventory and finances.
            </p>
          </div>

          <button
            type="button"
            onClick={() => fetchDashboard(true)}
            disabled={loading || refreshing}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 transition text-sm font-semibold disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={refreshing ? 'animate-spin' : ''}
            />
            {refreshing ? 'Refreshing...' : 'Refresh Data'}
          </button>
        </div>
      </div>

      {/* ERROR */}

      {error && !dashboard && (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-red-500 mt-0.5" size={20} />

            <div>
              <h3 className="font-semibold text-red-700">
                Dashboard unavailable
              </h3>
              <p className="text-sm text-red-600 mt-1">{error}</p>

              <button
                onClick={() => fetchDashboard()}
                className="text-sm font-semibold text-red-700 underline mt-3"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FARM OVERVIEW */}

      <section>
        <SectionHeader
          title="Farm Overview"
          subtitle="Current status of your fish farm"
          icon={Waves}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            title="Total Ponds"
            value={formatNumber(farm?.total_ponds, 0)}
            subtitle={`${formatNumber(farm?.active_ponds, 0)} active ponds`}
            icon={Waves}
            iconColor="text-blue-600"
            iconBg="bg-blue-50"
            accent="bg-blue-500"
            loading={loading}
          />

          <StatCard
            title="Current Fish Stock"
            value={`${formatNumber(farm?.current_fish_stock_kg)} kg`}
            subtitle="Estimated remaining stock"
            icon={Fish}
            iconColor="text-emerald-600"
            iconBg="bg-emerald-50"
            accent="bg-emerald-500"
            loading={loading}
          />

          <StatCard
            title="Feed Inventory"
            value={`${formatNumber(farm?.total_feed_inventory_kg)} kg`}
            subtitle="Available feed stock"
            icon={Package}
            iconColor="text-amber-600"
            iconBg="bg-amber-50"
            accent="bg-amber-500"
            loading={loading}
          />

          <StatCard
            title="Outstanding Due"
            value={formatMoney(finance?.outstanding_due)}
            subtitle="Unpaid sales balance"
            icon={Wallet}
            iconColor="text-purple-600"
            iconBg="bg-purple-50"
            accent="bg-purple-500"
            loading={loading}
          />
        </div>

        {!loading && farm && (
          <div className="flex flex-wrap gap-3 mt-4">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-100">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-xs text-gray-600">Active</span>
              <span className="text-sm font-bold text-[#123D35]">
                {formatNumber(farm.active_ponds, 0)}
              </span>
            </div>

            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50 border border-gray-100">
              <span className="w-2 h-2 rounded-full bg-gray-400" />
              <span className="text-xs text-gray-600">Inactive</span>
              <span className="text-sm font-bold text-[#123D35]">
                {formatNumber(farm.inactive_ponds, 0)}
              </span>
            </div>

            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-50 border border-amber-100">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="text-xs text-gray-600">Maintenance</span>
              <span className="text-sm font-bold text-[#123D35]">
                {formatNumber(farm.maintenance_ponds, 0)}
              </span>
            </div>
          </div>
        )}

        {!loading && farm && (
          <p className="text-xs text-gray-400 mt-3 leading-relaxed">
            Current fish stock is based on recorded stocking, mortality
            weight and sales. Mortality records without weight may
            affect the accuracy of this estimate.
          </p>
        )}
      </section>

      {/* FINANCIAL OVERVIEW */}

      <section>
        <SectionHeader
          title="Financial Overview"
          subtitle="Farm income, expenses and financial position"
          icon={Wallet}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            title="Total Income"
            value={formatMoney(finance?.total_income)}
            subtitle="All income sources"
            icon={TrendingUp}
            iconColor="text-emerald-600"
            iconBg="bg-emerald-50"
            accent="bg-emerald-500"
            loading={loading}
          />

          <StatCard
            title="Total Expenses"
            value={formatMoney(finance?.total_expenses)}
            subtitle="Manual, feed, stocking and salaries"
            icon={TrendingDown}
            iconColor="text-red-600"
            iconBg="bg-red-50"
            accent="bg-red-500"
            loading={loading}
          />

          <StatCard
            title={isLoss ? 'Net Loss' : 'Net Profit'}
            value={formatMoney(isLoss ? finance?.net_loss : finance?.net_profit)}
            subtitle="Income minus expenses"
            icon={isLoss ? ArrowDownRight : ArrowUpRight}
            iconColor={isLoss ? 'text-red-600' : 'text-emerald-600'}
            iconBg={isLoss ? 'bg-red-50' : 'bg-emerald-50'}
            accent={isLoss ? 'bg-red-500' : 'bg-emerald-500'}
            loading={loading}
          />

          <StatCard
            title="Staff Salary"
            value={formatMoney(finance?.staff_salary_expenses)}
            subtitle="Recorded salary expenses"
            icon={Users}
            iconColor="text-purple-600"
            iconBg="bg-purple-50"
            accent="bg-purple-500"
            loading={loading}
          />
        </div>

        {/* INCOME BREAKDOWN */}

        <div className="bg-white border border-gray-100 rounded-2xl p-5 sm:p-6 shadow-sm mt-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-7">
            <div>
              <h3 className="text-base font-bold text-[#123D35]">
                Income Breakdown
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Revenue contribution by source
              </p>
            </div>

            <div className="bg-[#EAF3ED] px-4 py-3 rounded-xl">
              <p className="text-xs text-gray-500">Total Income</p>
              <p className="text-lg font-bold text-[#123D35] mt-1">
                {loading ? '—' : formatMoney(finance?.total_income)}
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {incomeBreakdown.map((item) => {
              const percentage =
                (Number(item.value) / maximumIncome) * 100

              return (
                <div key={item.label}>
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <span className="text-sm font-medium text-gray-600">
                      {item.label}
                    </span>

                    <span className="text-sm font-bold text-[#123D35]">
                      {loading ? '—' : formatMoney(item.value)}
                    </span>
                  </div>

                  <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${item.color} transition-all duration-500`}
                      style={{ width: loading ? '0%' : `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* EXPENSE BREAKDOWN */}

        <div className="bg-white border border-gray-100 rounded-2xl p-5 sm:p-6 shadow-sm mt-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
            <div>
              <h3 className="text-base font-bold text-[#123D35]">
                Expense Breakdown
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Expense contribution by category
              </p>
            </div>

            <div className="bg-red-50 px-4 py-3 rounded-xl">
              <p className="text-xs text-gray-500">Total Expenses</p>
              <p className="text-lg font-bold text-red-600 mt-1">
                {loading ? '—' : formatMoney(finance?.total_expenses)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {expenseBreakdown.map((item) => {
              const Icon = item.icon

              return (
                <div
                  key={item.label}
                  className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 bg-gray-50/70"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${item.bg}`}>
                    <Icon size={19} className={item.color} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-gray-500">
                      {item.label}
                    </p>

                    <p className="text-lg font-bold text-[#123D35] mt-1">
                      {loading ? '—' : formatMoney(item.value)}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* TODAY'S ACTIVITY */}

      <section>
        <SectionHeader
          title="Today's Activity"
          subtitle="Daily farm operations summary"
          icon={Activity}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <ActivityCard
            title="Fish Sales"
            value={formatMoney(today?.fish_sales?.total_amount)}
            subtitle={`${formatNumber(today?.fish_sales?.total_transactions, 0)} transactions`}
            icon={ShoppingCart}
            color="text-blue-600"
            bg="bg-blue-50"
            loading={loading}
          />

          <ActivityCard
            title="Fish Stocking"
            value={`${formatNumber(today?.fish_stocking?.total_weight_kg)} kg`}
            subtitle={`${formatNumber(today?.fish_stocking?.total_records, 0)} records`}
            icon={Fish}
            color="text-emerald-600"
            bg="bg-emerald-50"
            loading={loading}
          />

          <ActivityCard
            title="Fish Mortality"
            value={`${formatNumber(today?.fish_mortality?.total_weight_kg)} kg`}
            subtitle={`${formatNumber(today?.fish_mortality?.total_records, 0)} records`}
            icon={Scale}
            color="text-red-600"
            bg="bg-red-50"
            loading={loading}
          />

          <ActivityCard
            title="Daily Feeding"
            value={`${formatNumber(today?.daily_feeding?.total_quantity_kg)} kg`}
            subtitle={`${formatNumber(today?.daily_feeding?.total_records, 0)} records`}
            icon={Utensils}
            color="text-amber-600"
            bg="bg-amber-50"
            loading={loading}
          />
        </div>
      </section>

      {/* RECENT ACTIVITIES */}

      <section>
        <SectionHeader
          title="Recent Activities"
          subtitle="Latest recorded operations across your farm"
          icon={Clock3}
        />

        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50/70">
            <p className="text-sm font-semibold text-[#123D35]">
              Activity Timeline
            </p>

            <span className="text-xs text-gray-500">
              {loading ? '—' : `${activities.length} records`}
            </span>
          </div>

          {loading ? (
            <div className="p-5 space-y-5">
              {[1, 2, 3, 4, 5].map((item) => (
                <div key={item} className="flex gap-4 animate-pulse">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 shrink-0" />
                  <div className="flex-1">
                    <div className="h-3 w-32 bg-gray-100 rounded" />
                    <div className="h-3 w-48 bg-gray-100 rounded mt-2" />
                  </div>
                  <div className="h-4 w-20 bg-gray-100 rounded" />
                </div>
              ))}
            </div>
          ) : activities.length === 0 ? (
            <EmptyState message="No recent activities found." />
          ) : (
            <div className="divide-y divide-gray-100">
              {activities.map((activity, index) => {
                const details = getActivityDetails(activity.activity_type)
                const Icon = details.icon

                return (
                  <div
                    key={`${activity.activity_type}-${activity.id}-${index}`}
                    className="flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-4 hover:bg-[#F8FBF9] transition-colors"
                  >
                    <div className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center border ${details.bg} ${details.border}`}>
                      <Icon size={18} className={details.color} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#123D35]">
                        {activity.activity_type}
                      </p>

                      <p className="text-xs text-gray-500 mt-1 truncate">
                        {activity.description || 'No description'}
                      </p>

                      <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-1.5">
                        <CalendarDays size={12} />
                        {formatDate(activity.activity_date)}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-[#123D35]">
                        {formatActivityAmount(activity)}
                      </p>

                      <p className="text-[10px] text-gray-400 mt-1">
                        {details.format === 'kg' ? 'Weight / Quantity' : 'Amount'}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {!loading && activities.length > 0 && (
            <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/50">
              <p className="text-xs text-gray-400 text-center">
                Showing the latest {activities.length} activities
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default DashboardHome
