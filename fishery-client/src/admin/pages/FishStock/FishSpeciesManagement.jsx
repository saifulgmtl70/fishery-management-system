
import { useEffect, useState } from 'react'
import {
  Fish,
  Plus,
  Search,
  RefreshCw,
  Pencil,
  Power,
  X,
  Save,
  LoaderCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import api from '../../../services/api'

function FishSpeciesManagement() {
  const [species, setSpecies] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingSpecies, setEditingSpecies] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    species_name: '',
    scientific_name: '',
    description: '',
  })

  const fetchSpecies = async () => {
    try {
      setLoading(true)
      const response = await api.get('/fish-species')
      setSpecies(response.data.species || [])
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load fish species.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSpecies()
  }, [])

  const filteredSpecies = species.filter((item) =>
    `${item.species_name} ${item.scientific_name || ''}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  )

  const openAddForm = () => {
    setEditingSpecies(null)
    setFormData({
      species_name: '',
      scientific_name: '',
      description: '',
    })
    setShowForm(true)
  }

  const openEditForm = (item) => {
    setEditingSpecies(item)
    setFormData({
      species_name: item.species_name,
      scientific_name: item.scientific_name || '',
      description: item.description || '',
    })
    setShowForm(true)
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.species_name.trim()) {
      toast.error('Please enter a fish species name.')
      return
    }

    try {
      setSubmitting(true)

      if (editingSpecies) {
        await api.put(`/fish-species/${editingSpecies.id}`, formData)
        toast.success('Fish species updated successfully.')
      } else {
        await api.post('/fish-species', formData)
        toast.success('New fish species added successfully.')
      }

      setShowForm(false)
      fetchSpecies()
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Something went wrong.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  const toggleStatus = async (item) => {
    const newStatus = item.status === 'active' ? 'inactive' : 'active'

    try {
      await api.patch(`/fish-species/${item.id}/status`, {
        status: newStatus,
      })

      toast.success(`Species ${newStatus} successfully.`)
      fetchSpecies()
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Failed to update status.'
      )
    }
  }

  const activeCount = species.filter((item) => item.status === 'active').length
  const inactiveCount = species.length - activeCount

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-medium text-emerald-700">Fishery Operations</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">
            Fish Species Management
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage the fish species available in your fishery.
          </p>
        </div>

        <button
          onClick={openAddForm}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
        >
          <Plus size={18} />
          Add Fish Species
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Total Species</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{species.length}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Active Species</p>
          <p className="mt-2 text-3xl font-bold text-emerald-700">{activeCount}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Inactive Species</p>
          <p className="mt-2 text-3xl font-bold text-slate-500">{inactiveCount}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white">
        <div className="flex flex-col justify-between gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-semibold text-slate-900">Species Directory</h2>
            <p className="mt-1 text-sm text-slate-500">
              All registered fish species
            </p>
          </div>

          <div className="flex gap-2">
            <div className="relative flex-1 sm:w-64">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search species..."
                className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-emerald-600"
              />
            </div>

            <button
              onClick={fetchSpecies}
              className="rounded-xl border border-slate-200 px-3 text-slate-600 transition hover:bg-slate-50"
              title="Refresh"
            >
              <RefreshCw size={17} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <LoaderCircle className="animate-spin text-emerald-700" size={28} />
          </div>
        ) : filteredSpecies.length === 0 ? (
          <div className="py-16 text-center">
            <Fish className="mx-auto text-slate-300" size={38} />
            <p className="mt-3 font-medium text-slate-700">No species found</p>
            <p className="mt-1 text-sm text-slate-500">
              Add a fish species or try another search.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-4">Species</th>
                  <th className="px-5 py-4">Scientific Name</th>
                  <th className="px-5 py-4">Description</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredSpecies.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-5 py-4 font-semibold text-slate-800">
                      {item.species_name}
                    </td>
                    <td className="px-5 py-4 italic text-slate-500">
                      {item.scientific_name || '—'}
                    </td>
                    <td className="max-w-xs px-5 py-4 text-slate-500">
                      {item.description || '—'}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          item.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEditForm(item)}
                          className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-100"
                          title="Edit"
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          onClick={() => toggleStatus(item)}
                          className={`rounded-lg border p-2 ${
                            item.status === 'active'
                              ? 'border-red-100 text-red-600 hover:bg-red-50'
                              : 'border-emerald-100 text-emerald-700 hover:bg-emerald-50'
                          }`}
                          title={item.status === 'active' ? 'Deactivate' : 'Activate'}
                        >
                          <Power size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 p-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {editingSpecies ? 'Edit Fish Species' : 'Add Fish Species'}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Enter the species information below.
                </p>
              </div>

              <button
                onClick={() => setShowForm(false)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={19} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 p-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Species Name *
                </label>
                <input
                  name="species_name"
                  value={formData.species_name}
                  onChange={handleChange}
                  placeholder="e.g. Pangash"
                  required
                  maxLength={100}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Scientific Name
                </label>
                <input
                  name="scientific_name"
                  value={formData.scientific_name}
                  onChange={handleChange}
                  placeholder="e.g. Pangasianodon hypophthalmus"
                  maxLength={150}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Short description about this fish..."
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-600"
                />
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60"
                >
                  <Save size={16} />
                  {submitting ? 'Saving...' : 'Save Species'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default FishSpeciesManagement
