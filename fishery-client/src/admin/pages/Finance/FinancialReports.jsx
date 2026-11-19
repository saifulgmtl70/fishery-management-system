
import { useEffect, useMemo, useState } from 'react'
import {
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Wallet,
  Receipt,
  CalendarDays,
  Printer,
  BarChart3,
  FileText,
  Fish,
  Waves,
  Anchor,
} from 'lucide-react'
import { toast } from 'sonner'
import api from '../../../services/api'

const formatMoney = (amount) =>
  `৳ ${Number(amount || 0).toLocaleString('en-BD', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`

const formatDate = (date) => {
  if (!date) return '-'

  return new Date(`${String(date).slice(0, 10)}T00:00:00`).toLocaleDateString(
    'en-GB',
    {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }
  )
}

const formatMonth = (month) =>
  new Date(`${month}-01T00:00:00`).toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric',
  })

const getToday = () => {
  const date = new Date()
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

const FinancialReports = () => {
  const [report, setReport] = useState({
    income_by_date: [],
    expenses_by_date: [],
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

      const response = await api.get('/finance/reports', { params })

      setReport({
        income_by_date: response.data.data?.income_by_date || [],
        expenses_by_date: response.data.data?.expenses_by_date || [],
      })
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          'Failed to load financial reports'
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

  // DAILY REPORTS

  const dailyReports = useMemo(() => {
    const reportMap = new Map()

    report.income_by_date.forEach((item) => {
      const date = String(item.report_date).slice(0, 10)

      reportMap.set(date, {
        date,
        fishSales: Number(item.fish_sales_income || 0),
        localFishing: Number(item.local_fishing_income || 0),
        rodFishing: Number(item.rod_fishing_income || 0),
        income: Number(item.total_income || 0),
        expenses: 0,
      })
    })

    report.expenses_by_date.forEach((item) => {
      const date = String(item.report_date).slice(0, 10)

      const existing = reportMap.get(date) || {
        date,
        fishSales: 0,
        localFishing: 0,
        rodFishing: 0,
        income: 0,
        expenses: 0,
      }

      existing.expenses = Number(item.total_expenses || 0)
      reportMap.set(date, existing)
    })

    return Array.from(reportMap.values())
      .map((item) => ({
        ...item,
        net: item.income - item.expenses,
      }))
      .sort((a, b) => b.date.localeCompare(a.date))
  }, [report])

  // TOTALS

  const totals = useMemo(
    () =>
      dailyReports.reduce(
        (result, item) => ({
          fishSales: result.fishSales + item.fishSales,
          localFishing: result.localFishing + item.localFishing,
          rodFishing: result.rodFishing + item.rodFishing,
          income: result.income + item.income,
          expenses: result.expenses + item.expenses,
        }),
        {
          fishSales: 0,
          localFishing: 0,
          rodFishing: 0,
          income: 0,
          expenses: 0,
        }
      ),
    [dailyReports]
  )

  const totalIncome = totals.income
  const totalExpenses = totals.expenses
  const netResult = totalIncome - totalExpenses

  // MONTHLY REPORTS

  const monthlyReports = useMemo(() => {
    const monthMap = new Map()

    dailyReports.forEach((item) => {
      const month = item.date.slice(0, 7)

      const existing = monthMap.get(month) || {
        month,
        fishSales: 0,
        localFishing: 0,
        rodFishing: 0,
        income: 0,
        expenses: 0,
      }

      existing.fishSales += item.fishSales
      existing.localFishing += item.localFishing
      existing.rodFishing += item.rodFishing
      existing.income += item.income
      existing.expenses += item.expenses

      monthMap.set(month, existing)
    })

    return Array.from(monthMap.values())
      .map((item) => ({
        ...item,
        net: item.income - item.expenses,
      }))
      .sort((a, b) => b.month.localeCompare(a.month))
  }, [dailyReports])

  // SUMMARY CARDS

  const cards = [
    {
      title: 'Total Income',
      value: totalIncome,
      icon: TrendingUp,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-100',
    },
    {
      title: 'Total Expenses',
      value: totalExpenses,
      icon: Receipt,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
      border: 'border-orange-100',
    },
    {
      title: netResult >= 0 ? 'Net Profit' : 'Net Loss',
      value: Math.abs(netResult),
      icon: netResult >= 0 ? Wallet : TrendingDown,
      color: netResult >= 0 ? 'text-green-700' : 'text-red-600',
      bg: netResult >= 0 ? 'bg-green-50' : 'bg-red-50',
      border: netResult >= 0 ? 'border-green-100' : 'border-red-100',
    },
    {
      title: 'Report Days',
      value: dailyReports.length,
      icon: CalendarDays,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-100',
      isCount: true,
    },
  ]

  const incomeBreakdown = [
    {
      title: 'Fish Sales Income',
      value: totals.fishSales,
      icon: Fish,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      description: 'Income from fish sales',
    },
    {
      title: 'Local Fishing Income',
      value: totals.localFishing,
      icon: Waves,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      description: "Owner's 50% share",
    },
    {
      title: 'Rod Fishing Income',
      value: totals.rodFishing,
      icon: Anchor,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      description: 'Full rod fishing collection',
    },
  ]

  const handlePrint = () => window.print()

  const incomePercentage =
    totalIncome + totalExpenses > 0
      ? (totalIncome / (totalIncome + totalExpenses)) * 100
      : 0

  const expensePercentage =
    totalIncome + totalExpenses > 0
      ? (totalExpenses / (totalIncome + totalExpenses)) * 100
      : 0

  return (
    <div className="space-y-6">
      {/* HEADER */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between print:hidden">
        <div>
          <p className="text-sm text-gray-500">
            Finance / Financial Reports
          </p>

          <h1 className="mt-1 text-2xl font-bold text-gray-800">
            Financial Reports
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Review daily and monthly financial performance of your fishery.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={handlePrint}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:opacity-50"
          >
            <Printer size={16} />
            Print Report
          </button>

          <button
            onClick={() => fetchReport({ start_date: startDate, end_date: endDate })}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={loading ? 'animate-spin' : ''}
            />
            Refresh
          </button>
        </div>
      </div>

      {/* DATE FILTER */}

      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm print:hidden">
        <div className="mb-4 flex items-center gap-2">
          <CalendarDays size={18} className="text-emerald-600" />

          <h2 className="font-semibold text-gray-800">
            Filter Financial Report
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
              max={getToday()}
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
              max={getToday()}
              min={startDate || undefined}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
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

      {/* SUMMARY CARDS */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 print:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon

          return (
            <div
              key={card.title}
              className={`rounded-2xl border ${card.border} bg-white p-5 shadow-sm`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    {card.title}
                  </p>

                  <h2 className="mt-3 text-2xl font-bold text-gray-800">
                    {card.isCount
                      ? card.value.toLocaleString('en-BD')
                      : formatMoney(card.value)}
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

      {/* INCOME BREAKDOWN */}

      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-5">
          <h2 className="text-lg font-bold text-gray-800">
            Income Breakdown
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Income contribution from each business source
          </p>
        </div>

        {loading ? (
          <div className="py-8 text-center text-gray-500">
            Loading income breakdown...
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {incomeBreakdown.map((item) => {
              const Icon = item.icon

              return (
                <div
                  key={item.title}
                  className="rounded-xl border border-gray-100 p-5"
                >
                  <div className="flex items-center justify-between">
                    <div className={`rounded-xl ${item.bg} p-3`}>
                      <Icon size={21} className={item.color} />
                    </div>
                  </div>

                  <p className="mt-4 text-sm font-medium text-gray-500">
                    {item.title}
                  </p>

                  <h3 className="mt-2 text-xl font-bold text-gray-800">
                    {formatMoney(item.value)}
                  </h3>

                  <p className="mt-1 text-xs text-gray-400">
                    {item.description}
                  </p>
                </div>
              )
            })}
          </div>
        )}

        <div className="mt-5 flex flex-col gap-2 border-t border-gray-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <span className="font-semibold text-gray-600">
            Total Income
          </span>

          <span className="text-xl font-bold text-emerald-600">
            {formatMoney(totalIncome)}
          </span>
        </div>
      </div>

      {/* FINANCIAL SUMMARY */}

      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2">
          <BarChart3 size={20} className="text-emerald-600" />

          <h2 className="text-lg font-bold text-gray-800">
            Financial Summary
          </h2>
        </div>

        <p className="mt-1 text-sm text-gray-500">
          Income versus total operating expenses
        </p>

        {loading ? (
          <div className="py-12 text-center text-gray-500">
            Loading financial summary...
          </div>
        ) : (
          <div className="mt-6 space-y-5">
            {/* INCOME */}

            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-gray-700">
                  Income
                </span>

                <span className="text-sm font-bold text-emerald-600">
                  {formatMoney(totalIncome)}
                </span>
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-emerald-500"
                  style={{ width: `${incomePercentage}%` }}
                />
              </div>
            </div>

            {/* EXPENSES */}

            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-gray-700">
                  Expenses
                </span>

                <span className="text-sm font-bold text-orange-600">
                  {formatMoney(totalExpenses)}
                </span>
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-orange-500"
                  style={{ width: `${expensePercentage}%` }}
                />
              </div>
            </div>

            {/* NET RESULT */}

            <div className="mt-6 border-t border-gray-100 pt-5">
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
            </div>
          </div>
        )}
      </div>

      {/* MONTHLY REPORT */}

      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-2">
          <CalendarDays size={20} className="text-emerald-600" />

          <div>
            <h2 className="text-lg font-bold text-gray-800">
              Monthly Financial Report
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Monthly income, expenses and net results
            </p>
          </div>
        </div>

        {loading ? (
          <div className="py-8 text-center text-gray-500">
            Loading monthly reports...
          </div>
        ) : monthlyReports.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px] text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-gray-500">
                  <th className="px-4 py-3 font-semibold">Month</th>
                  <th className="px-4 py-3 text-right font-semibold">Fish Sales</th>
                  <th className="px-4 py-3 text-right font-semibold">Local Fishing</th>
                  <th className="px-4 py-3 text-right font-semibold">Rod Fishing</th>
                  <th className="px-4 py-3 text-right font-semibold">Total Income</th>
                  <th className="px-4 py-3 text-right font-semibold">Expenses</th>
                  <th className="px-4 py-3 text-right font-semibold">Net Result</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-50">
                {monthlyReports.map((item) => (
                  <tr key={item.month} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-700">
                      {formatMonth(item.month)}
                    </td>

                    <td className="px-4 py-3 text-right">
                      {formatMoney(item.fishSales)}
                    </td>

                    <td className="px-4 py-3 text-right">
                      {formatMoney(item.localFishing)}
                    </td>

                    <td className="px-4 py-3 text-right">
                      {formatMoney(item.rodFishing)}
                    </td>

                    <td className="px-4 py-3 text-right font-semibold text-emerald-600">
                      {formatMoney(item.income)}
                    </td>

                    <td className="px-4 py-3 text-right font-medium text-orange-600">
                      {formatMoney(item.expenses)}
                    </td>

                    <td
                      className={`px-4 py-3 text-right font-bold ${
                        item.net >= 0 ? 'text-emerald-600' : 'text-red-600'
                      }`}
                    >
                      {item.net < 0 ? '-' : ''}
                      {formatMoney(Math.abs(item.net))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-xl bg-gray-50 py-10 text-center">
            <FileText size={32} className="mx-auto text-gray-300" />

            <p className="mt-3 text-sm font-medium text-gray-500">
              No monthly reports available
            </p>
          </div>
        )}
      </div>

      {/* DAILY REPORT */}

      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-5">
          <h2 className="text-lg font-bold text-gray-800">
            Daily Financial Report
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Daily income and expenses from all recorded transactions,
            including salary expense records.
          </p>
        </div>

        {loading ? (
          <div className="py-10 text-center text-gray-500">
            Loading daily reports...
          </div>
        ) : dailyReports.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px] text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-gray-500">
                  <th className="px-4 py-3 font-semibold">Date</th>
                  <th className="px-4 py-3 text-right font-semibold">Fish Sales</th>
                  <th className="px-4 py-3 text-right font-semibold">Local Fishing</th>
                  <th className="px-4 py-3 text-right font-semibold">Rod Fishing</th>
                  <th className="px-4 py-3 text-right font-semibold">Total Income</th>
                  <th className="px-4 py-3 text-right font-semibold">Expenses</th>
                  <th className="px-4 py-3 text-right font-semibold">Net Result</th>
                  <th className="px-4 py-3 text-center font-semibold">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-50">
                {dailyReports.map((item) => (
                  <tr key={item.date} className="transition hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-700">
                      {formatDate(item.date)}
                    </td>

                    <td className="px-4 py-3 text-right">
                      {formatMoney(item.fishSales)}
                    </td>

                    <td className="px-4 py-3 text-right">
                      {formatMoney(item.localFishing)}
                    </td>

                    <td className="px-4 py-3 text-right">
                      {formatMoney(item.rodFishing)}
                    </td>

                    <td className="px-4 py-3 text-right font-semibold text-emerald-600">
                      {formatMoney(item.income)}
                    </td>

                    <td className="px-4 py-3 text-right font-medium text-orange-600">
                      {formatMoney(item.expenses)}
                    </td>

                    <td
                      className={`px-4 py-3 text-right font-bold ${
                        item.net >= 0 ? 'text-emerald-600' : 'text-red-600'
                      }`}
                    >
                      {item.net < 0 ? '-' : ''}
                      {formatMoney(Math.abs(item.net))}
                    </td>

                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          item.net > 0
                            ? 'bg-emerald-50 text-emerald-700'
                            : item.net < 0
                              ? 'bg-red-50 text-red-600'
                              : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {item.net > 0
                          ? 'Profit'
                          : item.net < 0
                            ? 'Loss'
                            : 'Break-even'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>

              <tfoot>
                <tr className="border-t-2 border-gray-200 bg-gray-50 font-bold">
                  <td className="px-4 py-4 text-gray-800">Total</td>

                  <td className="px-4 py-4 text-right">
                    {formatMoney(totals.fishSales)}
                  </td>

                  <td className="px-4 py-4 text-right">
                    {formatMoney(totals.localFishing)}
                  </td>

                  <td className="px-4 py-4 text-right">
                    {formatMoney(totals.rodFishing)}
                  </td>

                  <td className="px-4 py-4 text-right text-emerald-700">
                    {formatMoney(totalIncome)}
                  </td>

                  <td className="px-4 py-4 text-right text-orange-700">
                    {formatMoney(totalExpenses)}
                  </td>

                  <td
                    className={`px-4 py-4 text-right ${
                      netResult >= 0 ? 'text-emerald-700' : 'text-red-600'
                    }`}
                  >
                    {netResult < 0 ? '-' : ''}
                    {formatMoney(Math.abs(netResult))}
                  </td>

                  <td className="px-4 py-4 text-center text-gray-600">
                    {dailyReports.length} Days
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        ) : (
          <div className="rounded-xl bg-gray-50 py-12 text-center">
            <Receipt size={34} className="mx-auto text-gray-300" />

            <p className="mt-3 text-sm font-semibold text-gray-600">
              No financial records found
            </p>

            <p className="mt-1 text-xs text-gray-400">
              Income and expense records will appear here when available.
            </p>
          </div>
        )}
      </div>

      {/* REPORT NOTE */}

      <div className="rounded-xl border border-gray-100 bg-white p-4 print:hidden">
        <p className="text-xs leading-5 text-gray-500">
          Report expenses are based on the backend financial report
          aggregation. Staff salaries, feed purchases, fish stocking
          purchases and manual expenses must be included in that
          aggregation to appear in these reports. Salary is not added
          separately in this page to prevent duplicate calculation.
        </p>
      </div>

      {/* PRINT FOOTER */}

      <div className="hidden print:block border-t border-gray-200 pt-4 text-center text-xs text-gray-500">
        <p>Fishery Management System</p>
        <p>Financial Report generated on {formatDate(getToday())}</p>
      </div>
    </div>
  )
}

export default FinancialReports
