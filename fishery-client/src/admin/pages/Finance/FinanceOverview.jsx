import { useEffect, useState } from 'react'
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  ChartNoAxesCombined,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Fish,
  Waves,
  Banknote,
} from 'lucide-react'
import api from '../../../services/api'

// ==========================================
// HELPERS
// ==========================================

const formatCurrency = (amount) =>
  `৳ ${Number(amount || 0).toLocaleString('en-BD', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`

// ==========================================
// COMPONENT
// ==========================================

function FinanceOverview() {
  const [finance, setFinance] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // ==========================================
  // FETCH FINANCE
  // ==========================================

  const fetchFinance = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await api.get('/finance/overview')

      setFinance(response.data.data)
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to load financial overview.',
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFinance()
  }, [])

  // ==========================================
  // SUMMARY CARDS
  // ==========================================

  const summaryCards = [
    {
      title: 'Total Income',
      value: formatCurrency(finance?.total_income),
      description: 'Fish sales and lake income',
      icon: TrendingUp,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      title: 'Total Expenses',
      value: formatCurrency(finance?.total_expenses),
      description: 'Total recorded expenses',
      icon: TrendingDown,
      color: 'text-rose-600',
      bg: 'bg-rose-50',
    },
    {
      title: 'Net Profit',
      value: formatCurrency(finance?.net_profit),
      description: 'Income minus expenses',
      icon: ChartNoAxesCombined,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      title: 'Net Loss',
      value: formatCurrency(finance?.net_loss),
      description: 'Current financial loss',
      icon: Wallet,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
  ]

  // ==========================================
  // INCOME BREAKDOWN
  // ==========================================

  const incomeSources = [
    {
      title: 'Fish Sales Income',
      value: finance?.fish_sales_income,
      description: 'Income from fish sales',
      icon: Fish,
      color: 'text-blue-700',
      bg: 'bg-blue-50',
      border: 'border-blue-100',
    },
    {
      title: 'Local Fishing Income',
      value: finance?.local_fishing_income,
      description: 'Owner share (50%)',
      icon: Waves,
      color: 'text-emerald-700',
      bg: 'bg-emerald-50',
      border: 'border-emerald-100',
    },
    {
      title: 'Rod Fishing Income',
      value: finance?.rod_fishing_income,
      description: 'Full fishing fee income',
      icon: Banknote,
      color: 'text-teal-700',
      bg: 'bg-teal-50',
      border: 'border-teal-100',
    },
  ]

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="space-y-6">

      {/* PAGE HEADING */}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-emerald-700">
            Financial Management
          </p>

          <h1 className="mt-1 text-2xl font-bold text-[#123D35]">
            Finance Overview
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Monitor your fishery income, expenses and overall financial
            performance.
          </p>
        </div>

        <button
          onClick={fetchFinance}
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-800 transition hover:bg-emerald-100 disabled:opacity-50"
        >
          <RefreshCw
            size={16}
            className={loading ? 'animate-spin' : ''}
          />

          Refresh
        </button>
      </div>

      {/* ERROR MESSAGE */}

      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {error}
        </div>
      )}

      {/* LOADING */}

      {loading && !finance && (
        <div className="rounded-xl border border-gray-200 bg-white p-10 text-center text-sm text-gray-500">
          Loading financial data...
        </div>
      )}

      {/* FINANCE DATA */}

      {finance && (
        <>

          {/* SUMMARY CARDS */}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {summaryCards.map((card) => {
              const Icon = card.icon

              return (
                <div
                  key={card.title}
                  className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        {card.title}
                      </p>

                      <h2 className="mt-3 text-xl font-bold text-gray-800 sm:text-2xl">
                        {card.value}
                      </h2>
                    </div>

                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.bg} ${card.color}`}
                    >
                      <Icon size={23} />
                    </div>
                  </div>

                  <p className="mt-3 text-xs text-gray-400">
                    {card.description}
                  </p>
                </div>
              )
            })}
          </div>

          {/* INCOME BREAKDOWN */}

          <div className="space-y-4">

            <div>
              <h2 className="text-lg font-bold text-[#123D35]">
                Income Breakdown
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Income generated from all fishery activities.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {incomeSources.map((source) => {
                const Icon = source.icon

                return (
                  <div
                    key={source.title}
                    className={`rounded-xl border ${source.border} bg-white p-5 shadow-sm`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          {source.title}
                        </p>

                        <h2
                          className={`mt-3 text-xl font-bold sm:text-2xl ${source.color}`}
                        >
                          {formatCurrency(source.value)}
                        </h2>
                      </div>

                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-xl ${source.bg} ${source.color}`}
                      >
                        <Icon size={23} />
                      </div>
                    </div>

                    <p className="mt-3 text-xs text-gray-400">
                      {source.description}
                    </p>
                  </div>
                )
              })}
            </div>

          </div>

          {/* ADDITIONAL FINANCIAL CARDS */}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

            {/* TOTAL SALES */}

            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-medium text-gray-500">
                Total Sales
              </p>

              <h2 className="mt-3 text-2xl font-bold text-[#123D35]">
                {formatCurrency(finance.total_sales)}
              </h2>

              <p className="mt-2 text-xs text-gray-400">
                Total recorded fish sales
              </p>
            </div>

            {/* OUTSTANDING DUE */}

            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-medium text-gray-500">
                Outstanding Due
              </p>

              <h2 className="mt-3 text-2xl font-bold text-amber-600">
                {formatCurrency(finance.outstanding_due)}
              </h2>

              <p className="mt-2 text-xs text-gray-400">
                Unpaid amount from dealers
              </p>
            </div>

          </div>

          {/* FINANCIAL ACTIVITY */}

          <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">

            {/* FINANCIAL PERFORMANCE */}

            <div className="rounded-xl border border-gray-200 bg-white p-5 xl:col-span-2">

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-[#123D35]">
                    Financial Performance
                  </h3>

                  <p className="mt-1 text-xs text-gray-500">
                    Income and expense overview
                  </p>
                </div>

                <ChartNoAxesCombined
                  size={21}
                  className="text-emerald-600"
                />
              </div>

              <div className="mt-6 space-y-5">

                {/* INCOME */}

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">
                      Total Income
                    </span>

                    <span className="text-sm font-semibold text-emerald-600">
                      {formatCurrency(finance.total_income)}
                    </span>
                  </div>

                  <div className="h-3 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-emerald-500"
                      style={{
                        width: `${
                          finance.total_income +
                            finance.total_expenses >
                          0
                            ? (finance.total_income /
                                (finance.total_income +
                                  finance.total_expenses)) *
                              100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>

                {/* EXPENSES */}

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">
                      Total Expenses
                    </span>

                    <span className="text-sm font-semibold text-rose-600">
                      {formatCurrency(finance.total_expenses)}
                    </span>
                  </div>

                  <div className="h-3 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-rose-500"
                      style={{
                        width: `${
                          finance.total_income +
                            finance.total_expenses >
                          0
                            ? (finance.total_expenses /
                                (finance.total_income +
                                  finance.total_expenses)) *
                              100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>

                {/* NET RESULT */}

                <div className="rounded-lg bg-[#F5F7F4] p-4">
                  <p className="text-sm font-medium text-gray-500">
                    Net Financial Result
                  </p>

                  <p
                    className={`mt-2 text-xl font-bold ${
                      Number(finance.net_loss || 0) > 0
                        ? 'text-rose-600'
                        : 'text-emerald-600'
                    }`}
                  >
                    {Number(finance.net_loss || 0) > 0
                      ? `Loss: ${formatCurrency(finance.net_loss)}`
                      : `Profit: ${formatCurrency(finance.net_profit)}`}
                  </p>
                </div>

              </div>
            </div>

            {/* QUICK INFORMATION */}

            <div className="rounded-xl border border-gray-200 bg-white p-5">

              <h3 className="font-bold text-[#123D35]">
                Finance Summary
              </h3>

              <div className="mt-5 space-y-4">

                {/* INCOME SOURCES */}

                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
                    <ArrowUpRight size={19} />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-gray-700">
                      Income Sources
                    </p>

                    <p className="text-xs text-gray-400">
                      Fish sales, local fishing and rod fishing
                    </p>
                  </div>
                </div>

                {/* EXPENSE SOURCES */}

                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-rose-50 p-2 text-rose-600">
                    <ArrowDownRight size={19} />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-gray-700">
                      Expense Sources
                    </p>

                    <p className="text-xs text-gray-400">
                      Recorded operating expenses
                    </p>
                  </div>
                </div>

              </div>

              {/* FINANCIAL NOTE */}

              <div className="mt-6 rounded-lg bg-[#F5F7F4] p-4">
                <p className="text-xs leading-5 text-gray-500">
                  Income includes fish sales, local fishing owner
                  share and rod fishing revenue. Local fishing
                  income includes only the owner's 50% share.
                  Expenses are calculated from recorded expenses.
                  Outstanding dealer payments are not counted
                  as received income.
                </p>
              </div>

            </div>

          </div>

        </>
      )}
    </div>
  )
}

export default FinanceOverview