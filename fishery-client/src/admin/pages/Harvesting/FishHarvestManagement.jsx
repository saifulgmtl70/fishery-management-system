
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Fish,
  Plus,
  Search,
  Scale,
  Waves,
  ClipboardList,
  CalendarDays,
  Users,
  RefreshCw,
  LoaderCircle,
  AlertCircle,
  ChevronDown,
} from 'lucide-react'
import { toast } from 'sonner'
import api from '../../../services/api'
import FishHarvestForm from './FishHarvestForm'

const formatDate = (value) => {
  if (!value) return '—'

  return new Date(value).toLocaleDateString('en-GB', {
    timeZone: 'Asia/Dhaka',
  })
}

const formatNumber = (value) =>
  Number(value || 0).toLocaleString('en-US', {
    maximumFractionDigits: 3,
  })

function FishHarvestManagement() {
  const [harvests, setHarvests] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedPond, setSelectedPond] = useState('all')

  const fetchHarvests = useCallback(async () => {
    try {
      setLoading(true)

      const response = await api.get('/fish-harvests')

      setHarvests(response.data.harvests || [])
    } catch (error) {
      console.error('Fetch Harvests Error:', error)

      toast.error(
        error.response?.data?.message ||
        'Failed to load harvest records.'
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchHarvests()
  }, [fetchHarvests])

  const ponds = useMemo(() => {
    const uniquePonds = new Map()

    harvests.forEach((item) => {
      uniquePonds.set(item.pond_id, item.pond_name)
    })

    return Array.from(uniquePonds, ([id, name]) => ({
      id,
      name,
    }))
  }, [harvests])

  const summary = useMemo(() => {
    const totalFish = harvests.reduce(
      (sum, item) => sum + Number(item.harvest_quantity || 0),
      0
    )

    const totalWeight = harvests.reduce(
      (sum, item) => sum + Number(item.total_weight_kg || 0),
      0
    )

    const affectedPonds = new Set(
      harvests.map((item) => item.pond_id)
    ).size

    const fishingTeams = new Set(
      harvests
        .map((item) => item.fishing_team?.trim())
        .filter(Boolean)
    ).size

    return {
      totalRecords: harvests.length,
      totalFish,
      totalWeight,
      affectedPonds,
      fishingTeams,
    }
  }, [harvests])

  const filteredHarvests = useMemo(() => {
    const keyword = search.trim().toLowerCase()

    return harvests.filter((item) => {
      const matchesPond =
        selectedPond === 'all' ||
        String(item.pond_id) === selectedPond

      const matchesSearch =
        !keyword ||
        [
          item.pond_name,
          item.species_name,
          item.fishing_team,
          item.notes,
        ]
          .filter(Boolean)
          .some((value) =>
            String(value).toLowerCase().includes(keyword)
          )

      return matchesPond && matchesSearch
    })
  }, [harvests, search, selectedPond])

  const summaryCards = [
    {
      title: 'Harvest Records',
      value: formatNumber(summary.totalRecords),
      subtitle: 'Total recorded harvests',
      icon: ClipboardList,
      iconStyle: 'bg-emerald-50 text-emerald-700',
    },
    {
      title: 'Fish Harvested',
      value: formatNumber(summary.totalFish),
      subtitle: 'Total harvested pieces',
      icon: Fish,
      iconStyle: 'bg-blue-50 text-blue-700',
    },
    {
      title: 'Total Harvest Weight',
      value: `${formatNumber(summary.totalWeight)} kg`,
      subtitle: 'Recorded harvested weight',
      icon: Scale,
      iconStyle: 'bg-amber-50 text-amber-700',
    },
    {
      title: 'Harvesting Ponds',
      value: formatNumber(summary.affectedPonds),
      subtitle: 'Ponds with harvest records',
      icon: Waves,
      iconStyle: 'bg-purple-50 text-purple-700',
    },
  ]

  return (
    <div className="space-y-6">

      {/* Page Heading */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-700">
            <Waves size={15} />
            Fishery Operations
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-800 sm:text-3xl">
            Harvesting Management
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Monitor harvested fish, fishing teams and pond-wise harvest records.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={fetchHarvests}
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={loading ? 'animate-spin' : ''}
            />
            Refresh
          </button>

          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800"
          >
            <Plus size={18} />
            New Harvest
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => {
          const Icon = card.icon

          return (
            <div
              key={card.title}
              className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    {card.title}
                  </p>

                  <h3 className="mt-3 text-2xl font-bold text-slate-800">
                    {card.value}
                  </h3>
                </div>

                <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${card.iconStyle}`}>
                  <Icon size={21} />
                </div>
              </div>

              <p className="mt-3 text-xs text-slate-400">
                {card.subtitle}
              </p>
            </div>
          )
        })}
      </div>

      {/* Additional Information */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/60 px-5 py-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-emerald-700">
          <Users size={20} />
        </div>

        <div>
          <p className="text-sm font-semibold text-emerald-900">
            Fishing Team Overview
          </p>
          <p className="mt-0.5 text-xs text-emerald-700">
            {summary.fishingTeams} different fishing teams recorded in the harvest history.
          </p>
        </div>
      </div>

      {/* Harvest Records */}
      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">

        {/* Table Header */}
        <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                Harvest Records
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                View and search all recorded fish harvesting activities.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              {/* Search */}
              <div className="relative">
                <Search
                  size={17}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search pond, fish, team..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-emerald-500 focus:bg-white sm:w-64"
                />
              </div>

              {/* Pond Filter */}
              <div className="relative">
                <select
                  value={selectedPond}
                  onChange={(e) => setSelectedPond(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-4 pr-10 text-sm text-slate-600 outline-none transition focus:border-emerald-500 sm:w-48"
                >
                  <option value="all">All Ponds</option>

                  {ponds.map((pond) => (
                    <option key={pond.id} value={pond.id}>
                      {pond.name}
                    </option>
                  ))}
                </select>

                <ChevronDown
                  size={16}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex min-h-64 flex-col items-center justify-center gap-3">
            <LoaderCircle
              size={30}
              className="animate-spin text-emerald-600"
            />
            <p className="text-sm text-slate-500">
              Loading harvest records...
            </p>
          </div>
        ) : filteredHarvests.length === 0 ? (
          <div className="flex min-h-72 flex-col items-center justify-center px-5 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 text-slate-400">
              {harvests.length === 0 ? (
                <Fish size={30} />
              ) : (
                <AlertCircle size={28} />
              )}
            </div>

            <h3 className="mt-4 text-base font-bold text-slate-700">
              {harvests.length === 0
                ? 'No Harvest Records Yet'
                : 'No Matching Records Found'}
            </h3>

            <p className="mt-1 max-w-sm text-sm text-slate-400">
              {harvests.length === 0
                ? 'Start recording harvested fish from your ponds to see them here.'
                : 'Try changing your search keyword or pond filter.'}
            </p>

            {harvests.length === 0 && (
              <button
                type="button"
                onClick={() => setShowForm(true)}
                className="mt-5 flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800"
              >
                <Plus size={17} />
                Record First Harvest
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1050px] text-left">
                <thead className="bg-slate-50">
                  <tr className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <th className="px-5 py-4">Harvest Details</th>
                    <th className="px-5 py-4">Pond / Species</th>
                    <th className="px-5 py-4">Quantity</th>
                    <th className="px-5 py-4">Average Weight</th>
                    <th className="px-5 py-4">Total Weight</th>
                    <th className="px-5 py-4">Fishing Team</th>
                    <th className="px-5 py-4">Notes</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredHarvests.map((item) => (
                    <tr
                      key={item.id}
                      className="transition hover:bg-slate-50/70"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                            <CalendarDays size={19} />
                          </div>

                          <div>
                            <p className="text-sm font-semibold text-slate-800">
                              {formatDate(item.harvest_date)}
                            </p>
                            <p className="mt-0.5 text-xs text-slate-400">
                              Harvest #{item.id}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-sm font-semibold text-slate-800">
                          {item.pond_name}
                        </p>
                        <p className="mt-1 text-xs text-emerald-700">
                          {item.species_name}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-sm font-bold text-slate-800">
                          {formatNumber(item.harvest_quantity)} pcs
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-sm text-slate-700">
                          {item.average_weight_gram
                            ? `${formatNumber(item.average_weight_gram)} g`
                            : '—'}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <span className="inline-flex rounded-lg bg-blue-50 px-3 py-1.5 text-sm font-bold text-blue-700">
                          {item.total_weight_kg
                            ? `${formatNumber(item.total_weight_kg)} kg`
                            : '—'}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-sm text-slate-700">
                          {item.fishing_team || '—'}
                        </p>
                      </td>

                      <td className="max-w-48 px-5 py-4">
                        <p
                          title={item.notes || ''}
                          className="truncate text-sm text-slate-500"
                        >
                          {item.notes || '—'}
                        </p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            <div className="flex flex-col gap-2 border-t border-slate-100 px-5 py-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
              <p>
                Showing{' '}
                <span className="font-semibold text-slate-700">
                  {filteredHarvests.length}
                </span>{' '}
                of{' '}
                <span className="font-semibold text-slate-700">
                  {harvests.length}
                </span>{' '}
                harvest records
              </p>

              <p className="font-medium text-emerald-700">
                Total: {formatNumber(
                  filteredHarvests.reduce(
                    (sum, item) =>
                      sum + Number(item.harvest_quantity || 0),
                    0
                  )
                )} pcs harvested
              </p>
            </div>
          </>
        )}
      </div>

      {/* New Harvest Modal */}
      {showForm && (
        <FishHarvestForm
          onClose={() => setShowForm(false)}
          onSuccess={fetchHarvests}
        />
      )}
    </div>
  )
}

export default FishHarvestManagement
