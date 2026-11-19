
import { useEffect, useState } from 'react'
import { RefreshCw, TrendingUp, TrendingDown, Wallet, Receipt, CalendarDays } from 'lucide-react'
import { toast } from 'sonner'
import api from '../../../services/api'

const formatMoney = (amount) =>
  `৳${Number(amount || 0).toLocaleString('en-BD', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`

const ProfitLoss = () => {
  const [report, setReport] = useState({
    total_income: 0,
    total_expenses: 0,
    net_profit: 0,
    net_loss: 0,
    expense_breakdown: [],
  })

  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [loading, setLoading] = useState(true)

  const fetchReport = async (filters = {}) => {
    try {
      setLoading(true)

      const params = {}
      if (filters.start_date) params.start_date = filters.start_date
      if (filters.end_date) params.end_date = filters.end_date

      const response = await api.get('/finance/profit-loss', { params })

      setReport(response.data.data)
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Failed to load profit and loss report'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReport()
  }, [])

  const handleFilter = () => {
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

  const cards = [
    {
      title: 'Total Income',
      value: report.total_income,
      icon: TrendingUp,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-100',
    },
    {
      title: 'Total Expenses',
      value: report.total_expenses,
      icon: Receipt,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
      border: 'border-orange-100',
    },
    {
      title: 'Net Profit',
      value: report.net_profit,
      icon: Wallet,
      color: 'text-green-700',
      bg: 'bg-green-50',
      border: 'border-green-100',
    },
    {
      title: 'Net Loss',
      value: report.net_loss,
      icon: TrendingDown,
      color: 'text-red-600',
      bg: 'bg-red-50',
      border: 'border-red-100',
    },
  ]

  const income = Number(report.total_income || 0)
  const expenses = Number(report.total_expenses || 0)
  const total = income + expenses

  const incomePercentage = total > 0 ? (income / total) * 100 : 0
  const expensePercentage = total > 0 ? (expenses / total) * 100 : 0

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
            Analyze income, expenses and financial performance.
          </p>
        </div>

        <button
          onClick={() => fetchReport({ start_date: startDate, end_date: endDate })}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Date Filter */}
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <CalendarDays size={18} className="text-emerald-600" />
          <h2 className="font-semibold text-gray-800">Filter Report</h2>
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
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
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
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleFilter}
              className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              Apply Filter
            </button>

            <button
              onClick={handleReset}
              className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
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
                    {formatMoney(card.value)}
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
        <h2 className="text-lg font-bold text-gray-800">
          Financial Summary
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Income versus operating expenses
        </p>

        {loading ? (
          <div className="py-12 text-center text-gray-500">
            Loading financial summary...
          </div>
        ) : (
          <div className="mt-6 space-y-5">
            {/* Income */}
            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-gray-700">
                  Income
                </span>
                <span className="text-sm font-bold text-emerald-600">
                  {formatMoney(income)}
                </span>
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all"
                  style={{ width: `${incomePercentage}%` }}
                />
              </div>
            </div>

            {/* Expenses */}
            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-gray-700">
                  Expenses
                </span>
                <span className="text-sm font-bold text-orange-600">
                  {formatMoney(expenses)}
                </span>
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-orange-500 transition-all"
                  style={{ width: `${expensePercentage}%` }}
                />
              </div>
            </div>

            {/* Result */}
            <div className="mt-6 border-t border-gray-100 pt-5">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <span className="font-medium text-gray-600">
                  Financial Result
                </span>

                <span
                  className={`text-xl font-bold ${
                    Number(report.net_profit) > 0
                      ? 'text-emerald-600'
                      : Number(report.net_loss) > 0
                        ? 'text-red-600'
                        : 'text-gray-800'
                  }`}
                >
                  {Number(report.net_profit) > 0
                    ? `Profit: ${formatMoney(report.net_profit)}`
                    : Number(report.net_loss) > 0
                      ? `Loss: ${formatMoney(report.net_loss)}`
                      : 'Break-even'}
                </span>
              </div>
            </div>
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
            Expenses grouped by category
          </p>
        </div>

        {loading ? (
          <div className="py-8 text-center text-gray-500">
            Loading expenses...
          </div>
        ) : report.expense_breakdown?.length > 0 ? (
          <div className="space-y-4">
            {report.expense_breakdown.map((item, index) => {
              const amount = Number(item.total_amount || 0)
              const percentage =
                expenses > 0 ? (amount / expenses) * 100 : 0

              return (
                <div key={`${item.category_name}-${index}`}>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <span className="text-sm font-medium text-gray-700">
                      {item.category_name}
                    </span>
                    <span className="text-sm font-semibold text-gray-800">
                      {formatMoney(amount)}
                    </span>
                  </div>

                  <div className="h-2.5 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-orange-400"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>

                  <p className="mt-1 text-xs text-gray-400">
                    {percentage.toFixed(1)}% of total expenses
                  </p>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="rounded-xl bg-gray-50 py-10 text-center">
            <Receipt size={32} className="mx-auto text-gray-300" />
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
