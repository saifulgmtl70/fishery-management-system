import { useEffect, useState } from 'react'
import api from '../../../services/api'
import { toast } from 'sonner'
import {
  Wallet,
  RefreshCw,
  Search,
  TrendingUp,
  Receipt,
  Waves,
} from 'lucide-react'

// ==========================================
// HELPERS
// ==========================================

const formatCurrency = (amount) =>
  `৳${Number(amount || 0).toLocaleString('en-BD', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`

const formatDate = (date) => {
  if (!date) return '—'
  return String(date).slice(0, 10)
}

// ==========================================
// COMPONENT
// ==========================================

const IncomeManagement = () => {
  const [records, setRecords] = useState([])

  const [totalIncome, setTotalIncome] = useState(0)
  const [fishSalesIncome, setFishSalesIncome] = useState(0)
  const [lakeIncome, setLakeIncome] = useState(0)
  const [totalTransactions, setTotalTransactions] = useState(0)

  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  // ==========================================
  // FETCH INCOME
  // ==========================================

  const fetchIncome = async () => {
    try {
      setLoading(true)

      const { data } = await api.get('/finance/income')

      if (!data.success) {
        throw new Error(data.message || 'Failed to load income.')
      }

      const incomeData = data.data

      setTotalIncome(Number(incomeData.total_income || 0))
      setFishSalesIncome(Number(incomeData.fish_sales_income || 0))
      setLakeIncome(Number(incomeData.lake_income || 0))
      setTotalTransactions(
        Number(incomeData.total_transactions || 0)
      )

      setRecords(incomeData.records || [])
    } catch (error) {
      console.error('Income Fetch Error:', error)

      toast.error(
        error.response?.data?.message ||
          'Failed to load income records.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchIncome()
  }, [])

  // ==========================================
  // GROUP LAKE INCOME BY DATE
  // FISH SALES REMAIN INDIVIDUAL
  // ==========================================

  const groupedRecords = (() =>    {
    const dailyGroups = {}

    records.forEach((record) => {
      if (
        record.source_type !== 'Local Fishing' &&
        record.source_type !== 'Rod Fishing'
      ) {
        return
      }

      const date = formatDate(record.fishing_date)
      const groupKey = `${record.source_type}-${date}`

      if (!dailyGroups[groupKey]) {
        dailyGroups[groupKey] = {
          id: groupKey,
          source_type: record.source_type,
          fishing_date: date,
          income_amount: 0,
          records_count: 0,
        }
      }

      dailyGroups[groupKey].income_amount += Number(
        record.income_amount || 0
      )

      dailyGroups[groupKey].records_count += 1
    })

    const dailyRecords = Object.values(dailyGroups)

    const fishSalesRecords = records.filter(
      (record) => record.source_type === 'Fish Sales'
    )

    return [...fishSalesRecords, ...dailyRecords].sort(
      (a, b) => {
        const dateA = a.sale_date || a.fishing_date || ''
        const dateB = b.sale_date || b.fishing_date || ''

        return String(dateB).localeCompare(String(dateA))
      }
    )
  })()

  // ==========================================
  // SEARCH
  // ==========================================

  const filteredRecords = groupedRecords.filter((record) => {
    const search = searchTerm.toLowerCase().trim()

    if (!search) return true

    return (
      String(record.invoice_number || '')
        .toLowerCase()
        .includes(search) ||
      String(record.dealer_name || '')
        .toLowerCase()
        .includes(search) ||
      String(record.source_type || '')
        .toLowerCase()
        .includes(search) ||
      String(record.payment_status || '')
        .toLowerCase()
        .includes(search) ||
      String(record.payment_method || '')
        .toLowerCase()
        .includes(search) ||
      String(record.sale_date || record.fishing_date || '')
        .toLowerCase()
        .includes(search)
    )
  })

  // ==========================================
  // STATUS STYLE
  // ==========================================

  const getStatusStyle = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-emerald-50 text-emerald-700'

      case 'partial':
        return 'bg-amber-50 text-amber-700'

      case 'unpaid':
        return 'bg-red-50 text-red-700'

      default:
        return 'bg-gray-100 text-gray-600'
    }
  }

  // ==========================================
  // SOURCE STYLE
  // ==========================================

  const getSourceStyle = (source) => {
    switch (source) {
      case 'Fish Sales':
        return 'bg-blue-50 text-blue-700'

      case 'Local Fishing':
        return 'bg-emerald-50 text-emerald-700'

      case 'Rod Fishing':
        return 'bg-teal-50 text-teal-700'

      default:
        return 'bg-gray-100 text-gray-600'
    }
  }

  // ==========================================
  // RECORD DETAILS
  // ==========================================

  const getRecordDetails = (record) => {
    switch (record.source_type) {
      // --------------------------------------
      // FISH SALES
      // --------------------------------------

      case 'Fish Sales':
        return (
          <div className="space-y-1">
            <p className="font-medium text-gray-800">
              {record.dealer_name || 'Unknown Dealer'}
            </p>

            <p className="text-xs text-gray-500">
              {record.invoice_number || `Sale #${record.id}`}
            </p>
          </div>
        )

      // --------------------------------------
      // LOCAL FISHING - DAILY SUMMARY
      // --------------------------------------

      case 'Local Fishing':
        return (
          <div className="space-y-1">
            <p className="font-medium text-gray-800">
              Daily Local Fishing Income
            </p>

            <p className="text-xs text-gray-500">
              {record.records_count}{' '}
                {record.records_count === 1
                  ? 'fishing record'
                  : 'fishing records'}
            </p>

            <p className="text-xs text-gray-500">
              Owner share (50%)
            </p>
          </div>
        )

      // --------------------------------------
      // ROD FISHING - DAILY SUMMARY
      // --------------------------------------

      case 'Rod Fishing':
        return (
          <div className="space-y-1">
            <p className="font-medium text-gray-800">
              Daily Rod Fishing Income
            </p>

            <p className="text-xs text-gray-500">
              {record.records_count} visitor{' '}
              {record.records_count === 1 ? 'record' : 'records'}
            </p>

            <p className="text-xs text-gray-500">
              Full owner income
            </p>
          </div>
        )

      default:
        return '—'
    }
  }

  // ==========================================
  // PAID / DUE
  // ==========================================

  const getPaidAmount = (record) => {
    if (record.source_type === 'Fish Sales') {
      return Number(record.paid_amount || 0)
    }

    return Number(record.income_amount || 0)
  }

  const getDueAmount = (record) => {
    if (record.source_type === 'Fish Sales') {
      return Number(record.due_amount || 0)
    }

    return 0
  }

  const getStatus = (record) => {
    if (record.source_type === 'Fish Sales') {
      return record.payment_status || 'unknown'
    }

    return 'received'
  }

  const getStatusStyleForRecord = (record) => {
    if (record.source_type === 'Fish Sales') {
      return getStatusStyle(record.payment_status)
    }

    return 'bg-emerald-50 text-emerald-700'
  }

  // ==========================================
  // NOTES
  // ==========================================

  const getRecordNotes = (record) => {
    if (record.source_type === 'Fish Sales') {
      return record.notes || '—'
    }

    return 'Daily income summary'
  }

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="space-y-6">

      {/* HEADER */}

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Income Management
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Track income from fish sales and lake activities.
          </p>
        </div>

        <button
          onClick={fetchIncome}
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw
            size={16}
            className={loading ? 'animate-spin' : ''}
          />

          Refresh
        </button>
      </div>

      {/* SUMMARY CARDS */}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">

        {/* TOTAL INCOME */}

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Total Income
              </p>

              <h2 className="mt-2 text-2xl font-bold text-gray-800">
                {formatCurrency(totalIncome)}
              </h2>
            </div>

            <div className="rounded-xl bg-gray-100 p-3 text-gray-700">
              <Wallet size={22} />
            </div>
          </div>
        </div>

        {/* FISH SALES */}

        <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Fish Sales Income
              </p>

              <h2 className="mt-2 text-2xl font-bold text-blue-700">
                {formatCurrency(fishSalesIncome)}
              </h2>
            </div>

            <div className="rounded-xl bg-blue-100 p-3 text-blue-700">
              <Receipt size={22} />
            </div>
          </div>
        </div>

        {/* LAKE INCOME */}

        <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Lake Income
              </p>

              <h2 className="mt-2 text-2xl font-bold text-emerald-700">
                {formatCurrency(lakeIncome)}
              </h2>
            </div>

            <div className="rounded-xl bg-emerald-100 p-3 text-emerald-700">
              <Waves size={22} />
            </div>
          </div>
        </div>

        {/* TRANSACTIONS */}

        <div className="rounded-2xl border border-purple-100 bg-gradient-to-br from-purple-50 to-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Total Transactions
              </p>

              <h2 className="mt-2 text-2xl font-bold text-purple-700">
                {totalTransactions.toLocaleString('en-BD')}
              </h2>
            </div>

            <div className="rounded-xl bg-purple-100 p-3 text-purple-700">
              <TrendingUp size={22} />
            </div>
          </div>
        </div>

      </div>

      {/* SEARCH */}

      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="text"
            placeholder="Search dealer, invoice, source or date..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          />
        </div>
      </div>

      {/* INCOME HISTORY */}

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

        {/* TABLE HEADER */}

        <div className="flex items-center gap-2 border-b border-gray-100 px-5 py-4">
          <TrendingUp size={19} className="text-emerald-600" />

          <h2 className="font-semibold text-gray-800">
            Income History
          </h2>
        </div>

        {/* LOADING */}

        {loading ? (
          <div className="py-16 text-center text-sm text-gray-500">
            Loading income records...
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="py-16 text-center">
            <Wallet size={40} className="mx-auto text-gray-300" />

            <p className="mt-3 font-medium text-gray-600">
              No income records found
            </p>

            <p className="mt-1 text-sm text-gray-400">
              Fish sales and lake income will appear here.
            </p>
          </div>
        ) : (

          /* TABLE */

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1200px] text-left text-sm">

              <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-5 py-4">
                    Date
                  </th>

                  <th className="px-5 py-4">
                    Source
                  </th>

                  <th className="px-5 py-4">
                    Details
                  </th>

                  <th className="px-5 py-4 text-right">
                    Amount
                  </th>

                  <th className="px-5 py-4 text-right">
                    Paid
                  </th>

                  <th className="px-5 py-4 text-right">
                    Due
                  </th>

                  <th className="px-5 py-4">
                    Status
                  </th>

                  <th className="px-5 py-4">
                    Notes
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">

                {filteredRecords.map((record, index) => (
                  <tr
                    key={`${record.source_type}-${record.id}-${index}`}
                    className="transition hover:bg-gray-50"
                  >

                    {/* DATE */}

                    <td className="whitespace-nowrap px-5 py-4 text-gray-600">
                      {formatDate(
                        record.sale_date || record.fishing_date
                      )}
                    </td>

                    {/* SOURCE */}

                    <td className="whitespace-nowrap px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${getSourceStyle(
                          record.source_type
                        )}`}
                      >
                        {record.source_type}
                      </span>
                    </td>

                    {/* DETAILS */}

                    <td className="px-5 py-4">
                      {getRecordDetails(record)}
                    </td>

                    {/* AMOUNT */}

                    <td className="whitespace-nowrap px-5 py-4 text-right font-semibold text-emerald-700">
                      {formatCurrency(record.income_amount)}
                    </td>

                    {/* PAID */}

                    <td className="whitespace-nowrap px-5 py-4 text-right font-medium text-blue-700">
                      {formatCurrency(getPaidAmount(record))}
                    </td>

                    {/* DUE */}

                    <td className="whitespace-nowrap px-5 py-4 text-right font-medium text-red-600">
                      {formatCurrency(getDueAmount(record))}
                    </td>

                    {/* STATUS */}

                    <td className="whitespace-nowrap px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${getStatusStyleForRecord(
                          record
                        )}`}
                      >
                        {getStatus(record)}
                      </span>
                    </td>

                    {/* NOTES */}

                    <td className="max-w-[220px] px-5 py-4">
                      <p
                        className="truncate text-gray-500"
                        title={getRecordNotes(record)}
                      >
                        {getRecordNotes(record)}
                      </p>
                    </td>

                  </tr>
                ))}

              </tbody>
            </table>
          </div>
        )}

        {/* FOOTER */}

        {!loading && filteredRecords.length > 0 && (
          <div className="border-t border-gray-100 px-5 py-4 text-xs text-gray-500">
            Showing {filteredRecords.length} of {groupedRecords.length} income records
          </div>
        )}

      </div>
    </div>
  )
}

export default IncomeManagement