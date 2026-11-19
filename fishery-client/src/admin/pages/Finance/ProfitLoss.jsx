
import { useEffect, useState } from 'react'
import {
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Wallet,
  Receipt,
  CalendarDays,
  Users,
  Fish,
  Waves,
  ChartNoAxesCombined,
} from 'lucide-react'
import { toast } from 'sonner'
import api from '../../../services/api'

// ==========================================
// HELPERS
// ==========================================

const formatMoney = (amount) =>
  `৳${Number(amount || 0).toLocaleString('en-BD', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`

const ProfitLoss = () => {
  const [report, setReport] = useState({
    total_income: 0,
    fish_sales_income: 0,
    lake_income: 0,
    local_fishing_income: 0,
    rod_fishing_income: 0,
    total_expenses: 0,
    staff_salary_expenses: 0,
    net_profit: 0,
    net_loss: 0,
    expense_breakdown: [],
  })

  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [loading, setLoading] = useState(true)

  // ==========================================
  // FETCH PROFIT & LOSS REPORT
  // ==========================================

  const fetchReport = async (filters = {}) => {
    try {
      setLoading(true)

      const params = {}

      if (filters.start_date) {
        params.start_date = filters.start_date
      }

      if (filters.end_date) {
        params.end_date = filters.end_date
      }

      const response = await api.get('/finance/profit-loss', {
        params,
      })

      if (!response.data?.success || !response.data?.data) {
        throw new Error('Invalid profit and loss response.')
      }

      const data = response.data.data

      setReport({
        total_income: Number(data.total_income || 0),
        fish_sales_income: Number(data.fish_sales_income || 0),
        lake_income: Number(data.lake_income || 0),
        local_fishing_income: Number(
          data.local_fishing_income || 0
        ),
        rod_fishing_income: Number(
          data.rod_fishing_income || 0
        ),
        total_expenses: Number(data.total_expenses || 0),
        staff_salary_expenses: Number(
          data.staff_salary_expenses || 0
        ),
        net_profit: Number(data.net_profit || 0),
        net_loss: Number(data.net_loss || 0),
        expense_breakdown: Array.isArray(data.expense_breakdown)
          ? data.expense_breakdown
          : [],
      })
    } catch (error) {
      console.error('Profit Loss Fetch Error:', error)

      toast.error(
        error.response?.data?.message ||
          error.message ||
          'Failed to load profit and loss report'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReport()
  }, [])

  // ==========================================
  // DATE FILTER
  // ==========================================

  const handleFilter = () => {
    if (!startDate && !endDate) {
      toast.error('Please select at least one date')
      return
    }

    if (startDate && endDate && startDate > endDate) {
      toast.error('Start date cannot be later than end date')
      return
    }

    fetchReport({
      start_date: startDate,
      end_date: endDate,
    })
  }

  const handleReset = () => {
    setStartDate('')
    setEndDate('')
    fetchReport()
  }

  const handleRefresh = () => {
    fetchReport({
      start_date: startDate,
      end_date: endDate,
    })
  }

  // ==========================================
  // FINANCIAL VALUES
  // ==========================================

  const income = Number(report.total_income || 0)
  const expenses = Number(report.total_expenses || 0)
  const salary = Number(report.staff_salary_expenses || 0)

  const netResult = income - expenses

  const total = income + expenses

  const incomePercentage =
    total > 0 ? (income / total) * 100 : 0

  const expensePercentage =
    total > 0 ? (expenses / total) * 100 : 0

  const salaryPercentage =
    expenses > 0
      ? Math.min((salary / expenses) * 100, 100)
      : 0

  // ==========================================
  // SUMMARY CARDS
  // ==========================================

  const cards = [
    {
      title: 'Total Income',
      value: income,
      icon: TrendingUp,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-100',
    },
    {
      title: 'Total Expenses',
      value: expenses,
      icon: Receipt,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
      border: 'border-orange-100',
    },
    {
      title: 'Staff Salary',
      value: salary,
      icon: Users,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      border: 'border-purple-100',
    },
    {
      title: netResult > 0 ? 'Net Profit' : 'Net Loss',
      value: Math.abs(netResult),
      icon: netResult >= 0 ? Wallet : TrendingDown,
      color:
        netResult > 0
          ? 'text-green-700'
          : netResult < 0
            ? 'text-red-600'
            : 'text-gray-600',
      bg:
        netResult > 0
          ? 'bg-green-50'
          : netResult < 0
            ? 'bg-red-50'
            : 'bg-gray-50',
      border:
        netResult > 0
          ? 'border-green-100'
          : netResult < 0
            ? 'border-red-100'
            : 'border-gray-100',
    },
  ]

  // ==========================================
  // INCOME BREAKDOWN
  // ==========================================

  const incomeSources = [
    {
      name: 'Fish Sales',
      amount: report.fish_sales_income,
      icon: Fish,
    },
    {
      name: 'Local Fishing',
      amount: report.local_fishing_income,
      icon: Waves,
    },
    {
      name: 'Rod Fishing',
      amount: report.rod_fishing_income,
      icon: Wallet,
    },
  ]

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="space-y-6">
      {/* Header */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-500">
            Finance / Profit & Loss
          </p>

          <h1 className="mt-1 text-2xl font-bold text-gray-800">
            Profit & Loss
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Analyze farm income, expenses and financial performance.
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw
            size={16}
            className={loading ? 'animate-spin' : ''}
          />
          Refresh
        </button>
      </div>

      {/* Date Filter */}

      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <CalendarDays
            size={18}
            className="text-emerald-600"
          />

          <h2 className="font-semibold text-gray-800">
            Filter Report
          </h2>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="mb-2 block text-sm font-medium text-gray-600">
              Start Date
            </label>

            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          <div className="flex-1">
            <label className="mb-2 block text-sm font-medium text-gray-600">
              End Date
            </label>

            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleFilter}
              disabled={loading}
              className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
            >
              Apply Filter
            </button>

            <button
              onClick={handleReset}
              disabled={loading}
              className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon

          return (
            <div
              key={card.title}
              className={`rounded-2xl border ${card.border} bg-white p-5 shadow-sm`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    {card.title}
                  </p>

                  <h2 className="mt-3 text-2xl font-bold text-gray-800">
                    {loading ? '—' : formatMoney(card.value)}
                  </h2>
                </div>

                <div className={`rounded-xl ${card.bg} p-3`}>
                  <Icon size={22} className={card.color} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Financial Summary */}

      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-gray-800">
            Financial Summary
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Income versus total operating expenses
          </p>
        </div>

        {loading ? (
          <div className="py-12 text-center text-gray-500">
            Loading financial summary...
          </div>
        ) : (
          <div className="mt-6 space-y-6">
            {/* Income */}

            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-gray-700">
                  Total Income
                </span>

                <span className="text-sm font-bold text-emerald-600">
                  {formatMoney(income)}
                </span>
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all"
                  style={{
                    width: `${incomePercentage}%`,
                  }}
                />
              </div>
            </div>

            {/* Expenses */}

            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-gray-700">
                  Total Expenses
                </span>

                <span className="text-sm font-bold text-orange-600">
                  {formatMoney(expenses)}
                </span>
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-orange-500 transition-all"
                  style={{
                    width: `${expensePercentage}%`,
                  }}
                />
              </div>
            </div>

            {/* Financial Result */}

            <div className="border-t border-gray-100 pt-5">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <span className="font-medium text-gray-600">
                  Financial Result
                </span>

                <span
                  className={`text-xl font-bold ${
                    netResult > 0
                      ? 'text-emerald-600'
                      : netResult < 0
                        ? 'text-red-600'
                        : 'text-gray-800'
                  }`}
                >
                  {netResult > 0
                    ? `Profit: ${formatMoney(netResult)}`
                    : netResult < 0
                      ? `Loss: ${formatMoney(Math.abs(netResult))}`
                      : 'Break-even'}
                </span>
              </div>

              <p className="mt-2 text-xs text-gray-400">
                Net Result = Total Income − Total Expenses
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Income Breakdown */}

      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-5">
          <h2 className="text-lg font-bold text-gray-800">
            Income Breakdown
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Revenue contribution by source
          </p>
        </div>

        {loading ? (
          <div className="py-8 text-center text-gray-500">
            Loading income...
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {incomeSources.map((item) => {
              const Icon = item.icon

              const percentage =
                income > 0
                  ? (Number(item.amount || 0) / income) * 100
                  : 0

              return (
                <div
                  key={item.name}
                  className="rounded-xl border border-gray-100 bg-gray-50 p-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">
                      {item.name}
                    </span>

                    <Icon
                      size={19}
                      className="text-emerald-600"
                    />
                  </div>

                  <h3 className="mt-3 text-xl font-bold text-gray-800">
                    {formatMoney(item.amount)}
                  </h3>

                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-200">
                    <div
                      className="h-full rounded-full bg-emerald-500"
                      style={{
                        width: `${percentage}%`,
                      }}
                    />
                  </div>

                  <p className="mt-2 text-xs text-gray-400">
                    {percentage.toFixed(1)}% of total income
                  </p>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Expense Breakdown */}

      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-5">
          <h2 className="text-lg font-bold text-gray-800">
            Expense Breakdown
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Expenses grouped by category and source
          </p>
        </div>

        {loading ? (
          <div className="py-8 text-center text-gray-500">
            Loading expenses...
          </div>
        ) : report.expense_breakdown.length > 0 ? (
          <div className="space-y-5">
            {report.expense_breakdown.map((item, index) => {
              const amount = Number(item.total_amount || 0)

              const percentage =
                expenses > 0
                  ? (amount / expenses) * 100
                  : 0

              const isSalary =
                item.category_name === 'Staff Salary'

              return (
                <div
                  key={`${item.category_name}-${index}`}
                >
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      {isSalary ? (
                        <Users
                          size={17}
                          className="text-purple-600"
                        />
                      ) : (
                        <Receipt
                          size={17}
                          className="text-orange-500"
                        />
                      )}

                      <span className="text-sm font-medium text-gray-700">
                        {item.category_name}
                      </span>
                    </div>

                    <span className="text-sm font-semibold text-gray-800">
                      {formatMoney(amount)}
                    </span>
                  </div>

                  <div className="h-2.5 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isSalary
                          ? 'bg-purple-500'
                          : 'bg-orange-400'
                      }`}
                      style={{
                        width: `${Math.min(percentage, 100)}%`,
                      }}
                    />
                  </div>

                  <p className="mt-1 text-xs text-gray-400">
                    {percentage.toFixed(1)}% of total expenses
                  </p>
                </div>
              )
            })}

            {/* Total Expenses */}

            <div className="flex items-center justify-between border-t border-gray-100 pt-5">
              <span className="font-semibold text-gray-700">
                Total Expenses
              </span>

              <span className="text-lg font-bold text-orange-600">
                {formatMoney(expenses)}
              </span>
            </div>

            {/* Staff Salary Summary */}

            <div className="rounded-xl border border-purple-100 bg-purple-50 p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Users
                    size={19}
                    className="text-purple-600"
                  />

                  <span className="text-sm font-semibold text-purple-800">
                    Staff Salary Expenses
                  </span>
                </div>

                <span className="font-bold text-purple-800">
                  {formatMoney(salary)}
                </span>
              </div>

              <div className="mt-3 h-2 overflow-hidden rounded-full bg-purple-100">
                <div
                  className="h-full rounded-full bg-purple-500"
                  style={{
                    width: `${salaryPercentage}%`,
                  }}
                />
              </div>

              <p className="mt-2 text-xs text-purple-600">
                {salaryPercentage.toFixed(1)}% of total expenses
              </p>
            </div>
          </div>
        ) : (
          <div className="rounded-xl bg-gray-50 py-10 text-center">
            <Receipt
              size={32}
              className="mx-auto text-gray-300"
            />

            <p className="mt-3 text-sm font-medium text-gray-500">
              No expenses found
            </p>

            <p className="mt-1 text-xs text-gray-400">
              Expense categories will appear here when records are available.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProfitLoss
