
import { useEffect, useMemo, useState } from 'react'
import {
  Waves,
  Plus,
  Search,
  RefreshCw,
  MapPin,
  Ruler,
  AlertCircle,
  Pencil,
  ChevronDown
} from 'lucide-react'
import { toast } from 'sonner'

import api from '../../../services/api'
import PondForm from './PondForm'

function PondManagement() {
  const [ponds, setPonds] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const [showForm, setShowForm] = useState(false)
  const [editingPond, setEditingPond] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const fetchPonds = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await api.get('/ponds')
      setPonds(response.data.ponds || [])
    } catch (err) {
      console.error('Failed to load ponds:', err)

      setError(
        err.response?.data?.message || 'Failed to load pond information.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPonds()
  }, [])

  // Create New Pond
  const handleCreatePond = async (formData) => {
    try {
      setSubmitting(true)

      const response = await api.post('/ponds', formData)

      toast.success(
        response.data.message || 'Pond created successfully.'
      )

      setShowForm(false)
      await fetchPonds()
    } catch (err) {
      console.error('Failed to create pond:', err)

      toast.error(
        err.response?.data?.message || 'Failed to create pond.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  // Open Edit Form
  const handleEditClick = (pond) => {
    setEditingPond(pond)
    setShowForm(true)
  }

  // Update Existing Pond
  const handleUpdatePond = async (formData) => {
    try {
      setSubmitting(true)

      const response = await api.put(
        `/ponds/${editingPond.id}`,
        formData
      )

      toast.success(
        response.data.message || 'Pond updated successfully.'
      )

      setShowForm(false)
      setEditingPond(null)

      await fetchPonds()
    } catch (err) {
      console.error('Failed to update pond:', err)

      toast.error(
        err.response?.data?.message || 'Failed to update pond.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  // Update Pond Status
const handleStatusChange = async (pond, newStatus) => {
  if (pond.status === newStatus) return

  try {
    const response = await api.patch(
      `/ponds/${pond.id}/status`,
      { status: newStatus }
    )

    toast.success(
      response.data.message || 'Pond status updated successfully.'
    )

    await fetchPonds()
  } catch (err) {
    console.error('Failed to update pond status:', err)

    toast.error(
      err.response?.data?.message || 'Failed to update pond status.'
    )
  }
}

  // Close Form
  const handleCloseForm = () => {
    if (submitting) return

    setShowForm(false)
    setEditingPond(null)
  }

  const statistics = useMemo(() => ({
    total: ponds.length,
    active: ponds.filter((pond) => pond.status === 'active').length,
    inactive: ponds.filter((pond) => pond.status === 'inactive').length,
    maintenance: ponds.filter((pond) => pond.status === 'maintenance').length,
  }), [ponds])

  const filteredPonds = useMemo(() => {
    return ponds.filter((pond) => {
      const matchesSearch =
        pond.pond_name.toLowerCase().includes(search.toLowerCase()) ||
        pond.pond_code.toLowerCase().includes(search.toLowerCase())

      const matchesStatus =
        statusFilter === 'all' || pond.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [ponds, search, statusFilter])

  const statusStyle = {
    active: 'bg-emerald-50 text-emerald-700',
    inactive: 'bg-gray-100 text-gray-600',
    maintenance: 'bg-amber-50 text-amber-700',
  }

  return (
    <div className="space-y-7">

      {/* Page Heading */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-medium text-emerald-700">
            Farm Operations / Pond Management
          </p>

          <h1 className="mt-2 text-2xl font-bold text-[#123D35]">
            Pond Management
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage your ponds, monitor their condition and maintain pond records.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingPond(null)
            setShowForm(true)
          }}
          className="flex items-center justify-center gap-2 rounded-lg bg-[#123D35] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1B5749]"
        >
          <Plus size={18} />
          Add New Pond
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        {[
          {
            label: 'Total Ponds',
            value: statistics.total,
            icon: Waves,
            color: 'bg-emerald-50 text-emerald-700',
          },
          {
            label: 'Active Ponds',
            value: statistics.active,
            icon: Waves,
            color: 'bg-green-50 text-green-700',
          },
          {
            label: 'Inactive Ponds',
            value: statistics.inactive,
            icon: MapPin,
            color: 'bg-gray-100 text-gray-600',
          },
          {
            label: 'Maintenance',
            value: statistics.maintenance,
            icon: AlertCircle,
            color: 'bg-amber-50 text-amber-700',
          },
        ].map((item) => {
          const Icon = item.icon

          return (
            <div
              key={item.label}
              className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{item.label}</p>

                  <h2 className="mt-2 text-3xl font-bold text-[#123D35]">
                    {item.value}
                  </h2>
                </div>

                <div className={`rounded-xl p-3 ${item.color}`}>
                  <Icon size={23} />
                </div>
              </div>
            </div>
          )
        })}

      </div>

      {/* Pond List */}
      <section className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">

        <div className="flex flex-col justify-between gap-4 border-b border-gray-100 p-5 lg:flex-row lg:items-center">
          <div>
            <h2 className="font-bold text-[#123D35]">All Ponds</h2>

            <p className="mt-1 text-xs text-gray-500">
              View and manage your registered ponds.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search pond..."
                className="w-full rounded-lg border border-gray-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-emerald-600 sm:w-56"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-600"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="maintenance">Maintenance</option>
            </select>

            <button
              type="button"
              onClick={fetchPonds}
              className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-600 transition hover:bg-gray-50"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>
        </div>

        {error && (
          <div className="m-5 rounded-lg bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="p-12 text-center text-sm text-gray-500">
            Loading pond information...
          </div>
        ) : filteredPonds.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
              <Waves size={30} />
            </div>

            <h3 className="mt-4 font-semibold text-[#123D35]">
              {ponds.length === 0 ? 'No Ponds Added Yet' : 'No Matching Ponds'}
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
              {ponds.length === 0
                ? 'Start by adding your first pond to the fishery management system.'
                : 'Try changing your search keyword or status filter.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px] text-left">
              <thead className="bg-[#F7F9F7] text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-5 py-4">Pond Information</th>
                  <th className="px-5 py-4">Area</th>
                  <th className="px-5 py-4">Depth</th>
                  <th className="px-5 py-4">Water Source</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-center">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {filteredPonds.map((pond) => (
                  <tr key={pond.id} className="transition hover:bg-gray-50">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-[#123D35]">
                        {pond.pond_name}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        {pond.pond_code}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-600">
                      <span className="flex items-center gap-2">
                        <Ruler size={15} />
                        {pond.area
                          ? `${pond.area} ${pond.area_unit}`
                          : 'Not specified'}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-600">
                      {pond.depth ? `${pond.depth} ft` : 'Not specified'}
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-600">
                      {pond.water_source || 'Not specified'}
                    </td>

                    <td className="px-5 py-4">
  <div className="relative inline-block">
    <select
      value={pond.status}
      onChange={(e) =>
        handleStatusChange(pond, e.target.value)
      }
      className={`appearance-none cursor-pointer rounded-full py-2 pl-3 pr-8 text-xs font-semibold capitalize outline-none ${
        statusStyle[pond.status] || 'bg-gray-100 text-gray-600'
      }`}
    >
      <option value="active">Active</option>
      <option value="inactive">Inactive</option>
      <option value="maintenance">Maintenance</option>
    </select>

    <ChevronDown
      size={13}
      className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2"
    />
  </div>
</td>

                    <td className="px-5 py-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleEditClick(pond)}
                        className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 px-3 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-50"
                      >
                        <Pencil size={14} />
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="border-t border-gray-100 px-5 py-4 text-xs text-gray-500">
          Showing {filteredPonds.length} of {ponds.length} ponds
        </div>

      </section>

      {/* Add / Edit Pond Modal */}
      {showForm && (
        <PondForm
          key={editingPond ? editingPond.id : 'new-pond'}
          initialData={editingPond}
          onClose={handleCloseForm}
          onSubmit={editingPond ? handleUpdatePond : handleCreatePond}
          submitting={submitting}
        />
      )}

    </div>
  )
}

export default PondManagement
