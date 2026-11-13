
import { useEffect, useMemo, useState } from 'react'
import {
  Plus,
  Search,
  Fish,
  Waves,
  Scale,
  CalendarDays,
  RefreshCw,
  Filter,
  Wallet,
  Calculator,
} from 'lucide-react'
import { toast } from 'sonner'
import api from '../../../services/api'

import FishStockingForm from './FishStockingForm'

function FishStockManagement() {
  const [stockings, setStockings] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [pondFilter, setPondFilter] = useState('all')

  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // ==========================================
  // FETCH FISH STOCKING RECORDS
  // ==========================================

  const fetchStockings = async () => {
    try {
      setLoading(true)

      const response = await api.get('/fish-stockings')

      setStockings(response.data.stockings || [])
    } catch (error) {
      console.error('Failed to fetch fish stockings:', error)

      toast.error(
        error.response?.data?.message ||
        'Failed to load fish stock records.'
      )
    } finally {
      setLoading(false)
    }
  }

  // ==========================================
  // CREATE FISH STOCKING RECORD
  // ==========================================

  const handleCreateStocking = async (formData) => {
    try {
      setSubmitting(true)

      const response = await api.post('/fish-stockings', formData)

      toast.success(
        response.data.message || 'Fish stocking added successfully.'
      )

      setShowForm(false)

      await fetchStockings()
    } catch (error) {
      console.error('Create Fish Stocking Error:', error)

      const fieldErrors = error.response?.data?.errors

      if (fieldErrors) {
        const firstError = Object.values(fieldErrors)
          .flat()
          .find(Boolean)

        toast.error(
          firstError ||
          error.response?.data?.message ||
          'Failed to add fish stocking record.'
        )
      } else {
        toast.error(
          error.response?.data?.message ||
          'Failed to add fish stocking record.'
        )
      }
    } finally {
      setSubmitting(false)
    }
  }

  // ==========================================
  // CLOSE FORM
  // ==========================================

  const handleCloseForm = () => {
    if (submitting) return

    setShowForm(false)
  }

  useEffect(() => {
    fetchStockings()
  }, [])

  // ==========================================
  // UNIQUE POND LIST
  // ==========================================

  const ponds = useMemo(() => {
    return [
      ...new Set(
        stockings
          .map((item) => item.pond_name)
          .filter(Boolean)
      ),
    ]
  }, [stockings])

  // ==========================================
  // FILTER STOCKING RECORDS
  // ==========================================

  const filteredStockings = useMemo(() => {
    return stockings.filter((item) => {
      const search = searchTerm.toLowerCase()

      const matchesSearch =
        item.pond_name?.toLowerCase().includes(search) ||
        item.species_name?.toLowerCase().includes(search) ||
        item.supplier_name?.toLowerCase().includes(search)

      const matchesPond =
        pondFilter === 'all' ||
        item.pond_name === pondFilter

      return matchesSearch && matchesPond
    })
  }, [stockings, searchTerm, pondFilter])

  // ==========================================
  // SUMMARY CALCULATIONS
  // ==========================================

  const totalQuantity = stockings.reduce(
    (total, item) => total + Number(item.quantity || 0),
    0
  )

  const totalWeight = stockings.reduce(
    (total, item) => total + Number(item.total_weight_kg || 0),
    0
  )

  const totalCost = stockings.reduce(
    (total, item) => total + Number(item.total_cost || 0),
    0
  )

  const uniquePonds = ponds.length

  // ==========================================
  // SUMMARY CARDS
  // ==========================================

  const summaryCards = [
    {
      title: 'Total Stocking Records',
      value: stockings.length.toLocaleString(),
      icon: Fish,
      color: 'bg-emerald-50 text-emerald-600',
    },
    {
      title: 'Estimated Fish Stocked',
      value: totalQuantity.toLocaleString(),
      suffix: 'pcs',
      icon: Waves,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      title: 'Total Stocking Weight',
      value: `${totalWeight.toLocaleString('en-US', {
        maximumFractionDigits: 3,
      })} kg`,
      icon: Scale,
      color: 'bg-amber-50 text-amber-600',
    },
    {
      title: 'Total Purchase Cost',
      value: `৳${totalCost.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      icon: Wallet,
      color: 'bg-purple-50 text-purple-600',
    },
  ]

  // ==========================================
  // FORMAT HELPERS
  // ==========================================

  const formatNumber = (value, digits = 2) => {
    if (value === null || value === undefined || value === '') {
      return '—'
    }

    return Number(value).toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: digits,
    })
  }

  const formatDate = (date) => {
    if (!date) return '—'

    const dateValue = new Date(date)

    if (Number.isNaN(dateValue.getTime())) return '—'

    return dateValue.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      timeZone: 'UTC',
    })
  }

  return (
    <div className="space-y-7">

      {/* ========================================== */}
      {/* PAGE HEADER */}
      {/* ========================================== */}

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="mb-1 text-sm font-medium text-emerald-600">
            Farm Operations / Inventory
          </p>

          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Fish Stock Management
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Monitor fish stocking activities and estimated quantities across your ponds.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
        >
          <Plus size={18} />
          Add Stocking
        </button>
      </div>

      {/* ========================================== */}
      {/* SUMMARY CARDS */}
      {/* ========================================== */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => {
          const Icon = card.icon

          return (
            <div
              key={card.title}
              className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-500">
                    {card.title}
                  </p>

                  <h2 className="mt-3 break-words text-2xl font-bold text-gray-900">
                    {card.value}
                  </h2>

                  {card.suffix && (
                    <p className="mt-1 text-xs text-gray-400">
                      {card.suffix}
                    </p>
                  )}
                </div>

                <div className={`shrink-0 rounded-xl p-3 ${card.color}`}>
                  <Icon size={23} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* ========================================== */}
      {/* ADDITIONAL INFORMATION */}
      {/* ========================================== */}

      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-gray-100 bg-white px-5 py-4 shadow-sm">
        <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
          <CalendarDays size={19} />
        </div>

        <div>
          <p className="text-sm font-semibold text-gray-800">
            Ponds with Stocking Records
          </p>

          <p className="text-xs text-gray-500">
            {uniquePonds} {uniquePonds === 1 ? 'pond' : 'ponds'} currently represented in stocking history
          </p>
        </div>
      </div>

      {/* ========================================== */}
      {/* STOCKING RECORDS */}
      {/* ========================================== */}

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">

        {/* TABLE HEADER */}

        <div className="flex flex-col justify-between gap-4 border-b border-gray-100 p-5 lg:flex-row lg:items-center">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Fish Stocking Records
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              View sample measurements, estimated fish quantities and stocking costs.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">

            {/* SEARCH */}

            <div className="relative">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search pond, fish or supplier..."
                className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-emerald-500 sm:w-64"
              />
            </div>

            {/* POND FILTER */}

            <div className="relative">
              <Filter
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <select
                value={pondFilter}
                onChange={(e) => setPondFilter(e.target.value)}
                className="w-full appearance-none rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-8 text-sm outline-none focus:border-emerald-500 sm:w-48"
              >
                <option value="all">All Ponds</option>

                {ponds.map((pond) => (
                  <option key={pond} value={pond}>
                    {pond}
                  </option>
                ))}
              </select>
            </div>

            {/* REFRESH */}

            <button
              type="button"
              onClick={fetchStockings}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:opacity-60"
            >
              <RefreshCw
                size={16}
                className={loading ? 'animate-spin' : ''}
              />
              Refresh
            </button>
          </div>
        </div>

        {/* TABLE */}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1450px] text-left">

            <thead className="bg-gray-50">
              <tr className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                <th className="px-5 py-4">Pond / Species</th>
                <th className="px-5 py-4">Stocking Date</th>
                <th className="px-5 py-4">Total Weight</th>
                <th className="px-5 py-4">Sample Measurement</th>
                <th className="px-5 py-4">Fish Per KG</th>
                <th className="px-5 py-4">Estimated Quantity</th>
                <th className="px-5 py-4">Average Weight</th>
                <th className="px-5 py-4">Price / KG</th>
                <th className="px-5 py-4">Total Cost</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">

              {loading ? (
                <tr>
                  <td colSpan="9" className="px-5 py-16 text-center">
                    <RefreshCw
                      size={22}
                      className="mx-auto animate-spin text-emerald-600"
                    />

                    <p className="mt-3 text-sm text-gray-500">
                      Loading fish stock records...
                    </p>
                  </td>
                </tr>
              ) : filteredStockings.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-5 py-16 text-center">
                    <Fish
                      size={34}
                      className="mx-auto text-gray-300"
                    />

                    <p className="mt-3 font-semibold text-gray-700">
                      No stocking records found
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      Fish stocking records will appear here.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredStockings.map((item) => (
                  <tr
                    key={item.id}
                    className="transition hover:bg-gray-50"
                  >

                    {/* POND AND SPECIES */}

                    <td className="px-5 py-4">
                      <p className="text-sm font-semibold text-gray-800">
                        {item.pond_name}
                      </p>

                      <p className="mt-1 text-xs text-emerald-600">
                        {item.species_name}
                      </p>
                    </td>

                    {/* DATE */}

                    <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-600">
                      {formatDate(item.stocking_date)}
                    </td>

                    {/* TOTAL WEIGHT */}

                    <td className="whitespace-nowrap px-5 py-4">
                      <p className="text-sm font-semibold text-emerald-700">
                        {formatNumber(item.total_weight_kg, 3)} kg
                      </p>
                    </td>

                    {/* SAMPLE MEASUREMENT */}

                    <td className="px-5 py-4">
                      {item.sample_weight_kg && item.sample_fish_count ? (
                        <>
                          <p className="text-sm font-medium text-gray-800">
                            {formatNumber(item.sample_weight_kg, 3)} kg
                          </p>

                          <p className="mt-1 text-xs text-gray-500">
                            {formatNumber(item.sample_fish_count, 0)} pcs
                          </p>
                        </>
                      ) : (
                        <span className="text-sm text-gray-400">—</span>
                      )}
                    </td>

                    {/* FISH PER KG */}

                    <td className="whitespace-nowrap px-5 py-4">
                      <p className="text-sm font-medium text-gray-800">
                        {formatNumber(item.fish_per_kg, 4)}
                      </p>

                      <p className="text-xs text-gray-400">
                        pcs/kg
                      </p>
                    </td>

                    {/* ESTIMATED QUANTITY */}

                    <td className="whitespace-nowrap px-5 py-4">
                      <p className="text-sm font-bold text-blue-700">
                        {formatNumber(item.quantity, 0)}
                      </p>

                      <p className="text-xs text-gray-400">
                        pieces
                      </p>
                    </td>

                    {/* AVERAGE WEIGHT */}

                    <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-700">
                      {item.average_weight_gram
                        ? `${formatNumber(item.average_weight_gram, 2)} g`
                        : '—'}
                    </td>

                    {/* PRICE PER KG */}

                    <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-700">
                      {item.unit_price !== null &&
                      item.unit_price !== undefined
                        ? `৳${formatNumber(item.unit_price, 2)}`
                        : '—'}
                    </td>

                    {/* TOTAL COST */}

                    <td className="whitespace-nowrap px-5 py-4">
                      <p className="text-sm font-bold text-gray-900">
                        {item.total_cost !== null &&
                        item.total_cost !== undefined
                          ? `৳${formatNumber(item.total_cost, 2)}`
                          : '—'}
                      </p>
                    </td>

                  </tr>
                ))
              )}

            </tbody>
          </table>
        </div>

        {/* TABLE FOOTER */}

        <div className="flex flex-col justify-between gap-2 border-t border-gray-100 px-5 py-4 sm:flex-row sm:items-center">
          <p className="text-xs text-gray-500">
            Showing {filteredStockings.length} of {stockings.length} records
          </p>

          <p className="flex items-center gap-1.5 text-xs text-gray-400">
            <Calculator size={14} />
            Fish quantity is estimated from sample measurement
          </p>
        </div>

      </div>

      {/* ========================================== */}
      {/* STOCKING FORM MODAL */}
      {/* ========================================== */}

      {showForm && (
        <FishStockingForm
          onClose={handleCloseForm}
          onSubmit={handleCreateStocking}
          submitting={submitting}
        />
      )}

    </div>
  )
}

export default FishStockManagement
