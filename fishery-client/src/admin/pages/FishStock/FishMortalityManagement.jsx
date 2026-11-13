
import { useEffect, useMemo, useState } from 'react'
import {
  Plus,
  Search,
  Skull,
  Fish,
  Scale,
  CalendarDays,
  RefreshCw,
  Filter,
  AlertTriangle,
} from 'lucide-react'
import { toast } from 'sonner'
import api from '../../../services/api'

import FishMortalityForm from './FishMortalityForm'

function FishMortalityManagement() {
  const [mortalities, setMortalities] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [pondFilter, setPondFilter] = useState('all')

  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Fetch mortality records
  const fetchMortalities = async () => {
    try {
      setLoading(true)

      const response = await api.get('/fish-mortalities')

      setMortalities(response.data.mortalities || [])
    } catch (error) {
      console.error('Failed to fetch mortality records:', error)

      toast.error(
        error.response?.data?.message ||
        'Failed to load fish mortality records.'
      )
    } finally {
      setLoading(false)
    }
  }

  // Create mortality record
  const handleCreateMortality = async (formData) => {
    try {
      setSubmitting(true)

      const response = await api.post('/fish-mortalities', formData)

      toast.success(
        response.data.message ||
        'Fish mortality recorded successfully.'
      )

      setShowForm(false)

      await fetchMortalities()
    } catch (error) {
      console.error('Create Mortality Error:', error)

      toast.error(
        error.response?.data?.message ||
        'Failed to create mortality record.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  // Close form
  const handleCloseForm = () => {
    if (submitting) return

    setShowForm(false)
  }

  useEffect(() => {
    fetchMortalities()
  }, [])

  // Unique pond list
  const ponds = useMemo(() => {
    return [
      ...new Set(
        mortalities
          .map((item) => item.pond_name)
          .filter(Boolean)
      ),
    ]
  }, [mortalities])

  // Filter mortality records
  const filteredMortalities = useMemo(() => {
    return mortalities.filter((item) => {
      const search = searchTerm.toLowerCase()

      const matchesSearch =
        item.pond_name?.toLowerCase().includes(search) ||
        item.species_name?.toLowerCase().includes(search) ||
        item.reason?.toLowerCase().includes(search)

      const matchesPond =
        pondFilter === 'all' ||
        item.pond_name === pondFilter

      return matchesSearch && matchesPond
    })
  }, [mortalities, searchTerm, pondFilter])

  // Summary calculations
  const totalDeadFish = mortalities.reduce(
    (total, item) =>
      total + Number(item.mortality_quantity || 0),
    0
  )

  const totalMortalityWeight = mortalities.reduce(
    (total, item) =>
      total + Number(item.total_weight_kg || 0),
    0
  )

  const affectedPonds = new Set(
    mortalities.map((item) => item.pond_id)
  ).size

  const summaryCards = [
    {
      title: 'Mortality Records',
      value: mortalities.length,
      icon: Skull,
      color: 'bg-red-50 text-red-600',
    },
    {
      title: 'Total Dead Fish',
      value: totalDeadFish.toLocaleString(),
      icon: Fish,
      color: 'bg-amber-50 text-amber-600',
    },
    {
      title: 'Total Mortality Weight',
      value: `${totalMortalityWeight.toFixed(3)} kg`,
      icon: Scale,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      title: 'Affected Ponds',
      value: affectedPonds,
      icon: WavesIcon,
      color: 'bg-purple-50 text-purple-600',
    },
  ]

  // Format MySQL DATE without timezone shifting
  const formatDate = (value) => {
  if (!value) return '—'

  return new Date(value).toLocaleDateString('en-GB', {
    timeZone: 'Asia/Dhaka',
  })
}
  return (
    <div className="space-y-7">

      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="mb-1 text-sm font-medium text-red-600">
            Farm Operations / Fish Health
          </p>

          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Fish Mortality Management
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Monitor fish mortality and track losses across your ponds.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
        >
          <Plus size={18} />
          Record Mortality
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => {
          const Icon = card.icon

          return (
            <div
              key={card.title}
              className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    {card.title}
                  </p>

                  <h2 className="mt-3 text-2xl font-bold text-gray-900">
                    {card.value}
                  </h2>
                </div>

                <div className={`rounded-xl p-3 ${card.color}`}>
                  <Icon size={23} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Mortality Records */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">

        {/* Table Header and Filters */}
        <div className="flex flex-col justify-between gap-4 border-b border-gray-100 p-5 lg:flex-row lg:items-center">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Mortality Records
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Track fish deaths by pond, species and date.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            {/* Search */}
            <div className="relative">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search pond, fish, reason..."
                className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-emerald-500 sm:w-64"
              />
            </div>

            {/* Pond Filter */}
            <div className="relative">
              <Filter
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <select
                value={pondFilter}
                onChange={(e) => setPondFilter(e.target.value)}
                className="w-full appearance-none rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-8 text-sm outline-none focus:border-emerald-500 sm:w-44"
              >
                <option value="all">All Ponds</option>

                {ponds.map((pond) => (
                  <option key={pond} value={pond}>
                    {pond}
                  </option>
                ))}
              </select>
            </div>

            {/* Refresh */}
            <button
              type="button"
              onClick={fetchMortalities}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px] text-left">
            <thead className="bg-gray-50">
              <tr className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                <th className="px-5 py-4">Pond</th>
                <th className="px-5 py-4">Fish Species</th>
                <th className="px-5 py-4">Mortality Date</th>
                <th className="px-5 py-4">Dead Quantity</th>
                <th className="px-5 py-4">Average Weight</th>
                <th className="px-5 py-4">Total Weight</th>
                <th className="px-5 py-4">Reason</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-5 py-16 text-center">
                    <RefreshCw
                      size={22}
                      className="mx-auto animate-spin text-emerald-600"
                    />

                    <p className="mt-3 text-sm text-gray-500">
                      Loading mortality records...
                    </p>
                  </td>
                </tr>
              ) : filteredMortalities.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-5 py-16 text-center">
                    <Skull
                      size={34}
                      className="mx-auto text-gray-300"
                    />

                    <p className="mt-3 font-semibold text-gray-700">
                      No mortality records found
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      Fish mortality records will appear here.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredMortalities.map((item) => (
                  <tr
                    key={item.id}
                    className="transition hover:bg-gray-50"
                  >
                    <td className="px-5 py-4 text-sm font-semibold text-gray-800">
                      {item.pond_name}
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-700">
                      {item.species_name}
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-600">
                      {formatDate(item.mortality_date)}
                    </td>

                    <td className="px-5 py-4 text-sm font-semibold text-red-600">
                      {Number(item.mortality_quantity).toLocaleString()} pcs
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-600">
                      {item.average_weight_gram
                        ? `${item.average_weight_gram} g`
                        : '—'}
                    </td>

                    <td className="px-5 py-4 text-sm font-semibold text-gray-800">
                      {item.total_weight_kg
                        ? `${item.total_weight_kg} kg`
                        : '—'}
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-600">
                      {item.reason || 'Not specified'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 px-5 py-4">
          <p className="text-xs text-gray-500">
            Showing {filteredMortalities.length} of {mortalities.length} records
          </p>
        </div>
      </div>

      {/* Mortality Form Modal */}
      {showForm && (
        <FishMortalityForm
          onClose={handleCloseForm}
          onSubmit={handleCreateMortality}
          submitting={submitting}
        />
      )}
    </div>
  )
}

// Icon component for affected ponds
function WavesIcon(props) {
  return <AlertTriangle {...props} />
}

export default FishMortalityManagement
