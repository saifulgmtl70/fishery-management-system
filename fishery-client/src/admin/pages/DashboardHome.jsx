
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

  const parsedDate = new Date(`${String(date).slice(0, 10)}T00:00:00`)

  if (Number.isNaN(parsedDate.getTime())) return '—'

  return parsedDate.toLocaleDateString('en-GB', {
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
        label: 'Fish Sale',
        amountLabel: 'Sale Value',
        format: 'money',
      }

    case 'Fish Stocking':
      return {
        icon: Fish,
        color: 'text-emerald-600',
        bg: 'bg-emerald-50',
        label: 'Fish Stocking',
        amountLabel: 'Stocking Cost',
        format: 'money',
      }

    case 'Fish Mortality':
      return {
        icon: AlertCircle,
        color: 'text-red-600',
        bg: 'bg-red-50',
        label: 'Fish Mortality',
        amountLabel: 'Weight',
        format: 'kg',
      }

    case 'Daily Feeding':
      return {
        icon: Utensils,
        color: 'text-amber-600',
        bg: 'bg-amber-50',
        label: 'Daily Feeding',
        amountLabel: 'Feed Quantity',
        format: 'kg',
      }

    case 'Expense':
      return {
        icon: Receipt,
        color: 'text-orange-600',
        bg: 'bg-orange-50',
        label: 'Expense',
        amountLabel: 'Expense Amount',
        format: 'money',
      }

    default:
      return {
        icon: Activity,
        color: 'text-gray-600',
        bg: 'bg-gray-100',
        label: type || 'Activity',
        amountLabel: 'Amount',
        format: 'money',
      }
  }
}

const formatActivityAmount = (activity) => {
  if (activity.amount === null || activity.amount === undefined) {
    return 'Not available'
  }

  const details = getActivityDetails(activity.activity_type)

  if (details.format === 'kg') {
    return `${formatNumber(activity.amount)} kg`
  }

  return formatMoney(activity.amount)
}

// ==========================================
// REUSABLE COMPONENTS
// ==========================================

function SectionHeading({ title, subtitle, action }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
      <div>
        <h2 className="text-lg font-bold text-[#123D35]">{title}</h2>
        {subtitle && (
          <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
        )}
      </div>

      {action}
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
  loading,
}) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-500">{title}</p>

          {loading ? (
            <div className="h-9 w-28 bg-gray-100 rounded-lg animate-pulse mt-3" />
          ) : (
            <h3 className="text-2xl font-bold text-[#123D35] mt-3 break-words">
              {value}
            </h3>
          )}

          {subtitle && (
            <p className="text-xs text-gray-400 mt-2">{subtitle}</p>
          )}
        </div>

        <div className={`w-11 h-11 shrink-0 rounded-xl flex items-center justify-center ${iconBg}`}>
          <Icon size={21} className={iconColor} />
        </div>
      </div>
    </div>
  )
}

function ActivityStat({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
  bg,
  loading,
}) {
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-4">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${bg}`}>
          <Icon size={19} className={color} />
        </div>

        <div className="min-w-0">
          <p className="text-xs text-gray-500">{title}</p>

          {loading ? (
            <div className="h-6 w-20 bg-gray-100 rounded mt-1 animate-pulse" />
          ) : (
            <h3 className="text-lg font-bold text-[#123D35] mt-0.5">
              {value}
            </h3>
          )}
        </div>
      </div>

      {subtitle && (
        <p className="text-xs text-gray-400 mt-3">{subtitle}</p>
      )}
    </div>
  )
}

function EmptyState({ message }) {
  return (
    <div className="py-10 text-center">
      <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-3">
        <Activity size={22} className="text-gray-400" />
      </div>
      <p className="text-sm text-gray-500">{message}</p>
    </div>
  )
}

// ==========================================
// MAIN DASHBOARD
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

  // Income breakdown
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

  const netIsLoss = Number(finance?.net_loss || 0) > 0

  return (
    <div className="space-y-8 pb-8">

      {/* ======================================
          HEADER
      ====================================== */}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#123D35]">
            Dashboard Overview
          </h1>

          <p className="text-sm text-gray-500 mt-2">
            Welcome to your Fishery Management System.
          </p>
        </div>

        <button
          type="button"
          onClick={() => fetchDashboard(true)}
          disabled={loading || refreshing}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-[#123D35] hover:bg-gray-50 transition disabled:opacity-50"
        >
          <RefreshCw
            size={16}
            className={refreshing ? 'animate-spin' : ''}
          />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* ======================================
          ERROR STATE
      ====================================== */}

      {error && !dashboard && (
        <div className="bg-red-50 border border-red-100 rounded-xl p-5">
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="text-red-500 mt-0.5" />

            <div className="flex-1">
              <h3 className="font-semibold text-red-700">
                Unable to load dashboard
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

      {/* ======================================
          FARM OVERVIEW
      ====================================== */}

      <section>
        <SectionHeading
          title="Farm Overview"
          subtitle="Current status of your fish farm"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            title="Total Ponds"
            value={formatNumber(farm?.total_ponds, 0)}
            subtitle={`${formatNumber(farm?.active_ponds, 0)} Active Ponds`}
            icon={Waves}
            iconColor="text-blue-600"
            iconBg="bg-blue-50"
            loading={loading}
          />

          <StatCard
            title="Current Fish Stock"
            value={`${formatNumber(farm?.current_fish_stock_kg)} kg`}
            subtitle="Estimated remaining stock"
            icon={Fish}
            iconColor="text-emerald-600"
            iconBg="bg-emerald-50"
            loading={loading}
          />

          <StatCard
            title="Feed Inventory"
            value={`${formatNumber(farm?.total_feed_inventory_kg)} kg`}
            subtitle="Available feed stock"
            icon={Package}
            iconColor="text-amber-600"
            iconBg="bg-amber-50"
            loading={loading}
          />

          <StatCard
            title="Outstanding Due"
            value={formatMoney(finance?.outstanding_due)}
            subtitle="Unpaid fish sales balance"
            icon={Wallet}
            iconColor="text-purple-600"
            iconBg="bg-purple-50"
            loading={loading}
          />
        </div>

        {!loading && farm && (
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 bg-[#EAF3ED] rounded-xl px-4 py-3">
            <p className="text-sm text-[#123D35]">
              <span className="font-semibold">
                {formatNumber(farm.active_ponds, 0)}
              </span>{' '}
              Active
            </p>

            <p className="text-sm text-gray-600">
              <span className="font-semibold">
                {formatNumber(farm.inactive_ponds, 0)}
              </span>{' '}
              Inactive
            </p>

            <p className="text-sm text-gray-600">
              <span className="font-semibold">
                {formatNumber(farm.maintenance_ponds, 0)}
              </span>{' '}
              Under Maintenance
            </p>
          </div>
        )}

        {!loading && farm && (
          <p className="text-xs text-gray-400 mt-3">
            Note: Current fish stock is calculated using recorded stocking,
            mortality weight and sales data. Records without mortality weight
            may affect the accuracy of this estimate.
          </p>
        )}
      </section>

      {/* ======================================
          FINANCIAL OVERVIEW
      ====================================== */}

      <section>
        <SectionHeading
          title="Financial Overview"
          subtitle="Overall income, expenses and financial position"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            title="Total Income"
            value={formatMoney(finance?.total_income)}
            subtitle="Fish sales + Lake income"
            icon={TrendingUp}
            iconColor="text-emerald-600"
            iconBg="bg-emerald-50"
            loading={loading}
          />

          <StatCard
            title="Total Expenses"
            value={formatMoney(finance?.total_expenses)}
            subtitle="All recorded expenses"
            icon={TrendingDown}
            iconColor="text-red-600"
            iconBg="bg-red-50"
            loading={loading}
          />

          <StatCard
            title={netIsLoss ? 'Net Loss' : 'Net Profit'}
            value={formatMoney(
              netIsLoss ? finance?.net_loss : finance?.net_profit
            )}
            subtitle="Income minus expenses"
            icon={netIsLoss ? ArrowDownRight : ArrowUpRight}
            iconColor={netIsLoss ? 'text-red-600' : 'text-emerald-600'}
            iconBg={netIsLoss ? 'bg-red-50' : 'bg-emerald-50'}
            loading={loading}
          />

          <StatCard
            title="Manual Expenses"
            value={formatMoney(finance?.manual_expenses)}
            subtitle="Expenses recorded manually"
            icon={Receipt}
            iconColor="text-orange-600"
            iconBg="bg-orange-50"
            loading={loading}
          />
        </div>

        {/* Income Breakdown */}

        <div className="bg-white border border-gray-100 rounded-2xl p-5 sm:p-6 shadow-sm mt-5">
          <div className="flex items-center justify-between gap-3 mb-6">
            <div>
              <h3 className="font-bold text-[#123D35]">
                Income Breakdown
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Income contribution by source
              </p>
            </div>

            <div className="text-right">
              <p className="text-xs text-gray-500">Total Income</p>
              <p className="text-lg font-bold text-[#123D35] mt-1">
                {loading ? '—' : formatMoney(finance?.total_income)}
              </p>
            </div>
          </div>

          <div className="space-y-5">
            {incomeBreakdown.map((item) => {
              const percentage =
                maximumIncome > 0
                  ? (Number(item.value) / maximumIncome) * 100
                  : 0

              return (
                <div key={item.label}>
                  <div className="flex justify-between items-center gap-3 mb-2">
                    <span className="text-sm font-medium text-gray-600">
                      {item.label}
                    </span>

                    <span className="text-sm font-semibold text-[#123D35]">
                      {loading ? '—' : formatMoney(item.value)}
                    </span>
                  </div>

                  <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${item.color}`}
                      style={{
                        width: loading ? '0%' : `${percentage}%`,
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>

          {!loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-gray-100 mt-6 pt-5">
              <div>
                <p className="text-xs text-gray-500">Feed Expenses</p>
                <p className="font-bold text-[#123D35] mt-1">
                  {formatMoney(finance?.feed_expenses)}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">Fish Stocking Expenses</p>
                <p className="font-bold text-[#123D35] mt-1">
                  {formatMoney(finance?.stocking_expenses)}
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ======================================
          TODAY'S ACTIVITY
      ====================================== */}

      <section>
        <SectionHeading
          title="Today's Activity"
          subtitle="Today's farm operations at a glance"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <ActivityStat
            title="Fish Sales"
            value={formatMoney(today?.fish_sales?.total_amount)}
            subtitle={`${formatNumber(today?.fish_sales?.total_transactions, 0)} Transactions`}
            icon={ShoppingCart}
            color="text-blue-600"
            bg="bg-blue-50"
            loading={loading}
          />

          <ActivityStat
            title="Fish Stocking"
            value={`${formatNumber(today?.fish_stocking?.total_weight_kg)} kg`}
            subtitle={`${formatNumber(today?.fish_stocking?.total_records, 0)} Records`}
            icon={Fish}
            color="text-emerald-600"
            bg="bg-emerald-50"
            loading={loading}
          />

          <ActivityStat
            title="Fish Mortality"
            value={`${formatNumber(today?.fish_mortality?.total_weight_kg)} kg`}
            subtitle={`${formatNumber(today?.fish_mortality?.total_records, 0)} Records`}
            icon={Scale}
            color="text-red-600"
            bg="bg-red-50"
            loading={loading}
          />

          <ActivityStat
            title="Daily Feeding"
            value={`${formatNumber(today?.daily_feeding?.total_quantity_kg)} kg`}
            subtitle={`${formatNumber(today?.daily_feeding?.total_records, 0)} Records`}
            icon={Utensils}
            color="text-amber-600"
            bg="bg-amber-50"
            loading={loading}
          />
        </div>
      </section>

      {/* ======================================
          RECENT ACTIVITIES
      ====================================== */}

      <section>
        <SectionHeading
          title="Recent Activities"
          subtitle="Latest 10 recorded farm activities"
          action={
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 bg-gray-100 px-3 py-2 rounded-lg">
              <Clock3 size={14} />
              Latest Records
            </span>
          }
        />

        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-5 space-y-5">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="flex items-center gap-4 animate-pulse">
                  <div className="w-10 h-10 rounded-xl bg-gray-100" />
                  <div className="flex-1">
                    <div className="h-3 w-32 bg-gray-100 rounded" />
                    <div className="h-3 w-24 bg-gray-100 rounded mt-2" />
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
                    className="flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-4 hover:bg-gray-50/70 transition"
                  >
                    <div className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center ${details.bg}`}>
                      <Icon size={19} className={details.color} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-[#123D35]">
                          {details.label}
                        </p>

                        <span className={`text-[10px] font-semibold px-2 py-1 rounded-full ${details.bg} ${details.color}`}>
                          {details.label}
                        </span>
                      </div>

                      <p className="text-xs text-gray-500 mt-1 truncate">
                        {activity.description || 'No description'}
                      </p>

                      <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                        <CalendarDays size={12} />
                        {formatDate(activity.activity_date)}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-[#123D35]">
                        {formatActivityAmount(activity)}
                      </p>

                      <p className="text-[10px] text-gray-400 mt-1">
                        {details.amountLabel}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {!loading && activities.length > 0 && (
            <div className="border-t border-gray-100 px-5 py-3 bg-gray-50/50">
              <p className="text-xs text-gray-500 text-center">
                Showing {activities.length} recent activities
              </p>
            </div>
          )}
        </div>
      </section>

    </div>
  )
}

export default DashboardHome
