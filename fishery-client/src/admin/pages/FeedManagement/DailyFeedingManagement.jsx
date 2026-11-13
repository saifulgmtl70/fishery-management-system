
import { useEffect, useState } from 'react'
import {
  Plus,
  Search,
  RefreshCw,
  X,
  LoaderCircle,
  CalendarDays,
  Fish,
  Package,
  Clock,
  Utensils,
} from 'lucide-react'
import { toast } from 'sonner'
import api from '../../../services/api'

const getToday = () => {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const initialForm = {
  pond_id: '',
  feed_type_id: '',
  feeding_date: getToday(),
  quantity_kg: '',
  feeding_time: '',
  notes: '',
}

const formatDate = (date) => {
  if (!date) return '—'

  const value = String(date).slice(0, 10)
  const [year, month, day] = value.split('-')

  return `${day}/${month}/${year}`
}

const DailyFeedingManagement = () => {
  const [feedings, setFeedings] = useState([])
  const [ponds, setPonds] = useState([])
  const [feedTypes, setFeedTypes] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [search, setSearch] = useState('')
  const [form, setForm] = useState(initialForm)

  const fetchData = async () => {
    try {
      setLoading(true)

      const [feedingRes, pondRes, feedTypeRes] = await Promise.all([
        api.get('/daily-feedings'),
        api.get('/ponds'),
        api.get('/feed-types'),
      ])

      setFeedings(feedingRes.data.feedings || [])
      setPonds(
        (pondRes.data.ponds || []).filter(
          (pond) => pond.status === 'active'
        )
      )
      setFeedTypes(
        (feedTypeRes.data.feedTypes || []).filter(
          (feed) => feed.status === 'active'
        )
      )
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Failed to load feeding data.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (
      !form.pond_id ||
      !form.feed_type_id ||
      !form.feeding_date ||
      !form.quantity_kg
    ) {
      toast.error('Please fill in all required fields.')
      return
    }

    try {
      setSaving(true)

      const payload = {
        ...form,
        pond_id: Number(form.pond_id),
        feed_type_id: Number(form.feed_type_id),
        quantity_kg: Number(form.quantity_kg),
        feeding_time: form.feeding_time || null,
        notes: form.notes || null,
      }

      const response = await api.post('/daily-feedings', payload)

      toast.success(
        response.data.message || 'Feeding record saved successfully.'
      )

      setShowModal(false)
      setForm(initialForm)
      await fetchData()
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Failed to save feeding record.'
      )
    } finally {
      setSaving(false)
    }
  }

  const filteredFeedings = feedings.filter((item) => {
    const query = search.toLowerCase()

    return (
      item.pond_name?.toLowerCase().includes(query) ||
      item.feed_name?.toLowerCase().includes(query) ||
      item.brand?.toLowerCase().includes(query)
    )
  })

  const totalUsed = feedings.reduce(
    (total, item) => total + Number(item.quantity_kg || 0),
    0
  )

  const todayUsed = feedings
    .filter((item) => String(item.feeding_date).slice(0, 10) === getToday())
    .reduce((total, item) => total + Number(item.quantity_kg || 0), 0)

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-emerald-700">
            Feed Management / Daily Feeding
          </p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">
            Daily Feeding
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Record and monitor daily fish feeding activities across ponds.
          </p>
        </div>

        <button
          onClick={() => {
            setForm(initialForm)
            setShowModal(true)
          }}
          disabled={!ponds.length || !feedTypes.length}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus size={18} />
          Record Feeding
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Feeding Records</p>
            <Utensils className="text-emerald-700" size={21} />
          </div>
          <h2 className="mt-3 text-3xl font-bold text-slate-900">
            {feedings.length}
          </h2>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Total Feed Used</p>
            <Package className="text-emerald-700" size={21} />
          </div>
          <h2 className="mt-3 text-3xl font-bold text-slate-900">
            {totalUsed.toLocaleString('en-US', {
              maximumFractionDigits: 3,
            })}{' '}
            <span className="text-base font-medium text-slate-500">kg</span>
          </h2>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Today's Feed Used</p>
            <CalendarDays className="text-emerald-700" size={21} />
          </div>
          <h2 className="mt-3 text-3xl font-bold text-slate-900">
            {todayUsed.toLocaleString('en-US', {
              maximumFractionDigits: 3,
            })}{' '}
            <span className="text-base font-medium text-slate-500">kg</span>
          </h2>
        </div>
      </div>

      {/* Feeding History */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-bold text-slate-900">Feeding History</h2>
            <p className="mt-1 text-xs text-slate-500">
              All recorded daily feeding activities
            </p>
          </div>

          <div className="flex gap-2">
            <div className="relative">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search feeding..."
                className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-emerald-600 sm:w-56"
              />
            </div>

            <button
              onClick={fetchData}
              className="rounded-xl border border-slate-200 p-2.5 text-slate-600 transition hover:bg-slate-50"
              title="Refresh"
            >
              <RefreshCw size={18} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-4">Pond</th>
                <th className="px-5 py-4">Feed Type</th>
                <th className="px-5 py-4">Date</th>
                <th className="px-5 py-4">Time</th>
                <th className="px-5 py-4">Quantity Used</th>
                <th className="px-5 py-4">Notes</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center">
                    <LoaderCircle
                      className="mx-auto animate-spin text-emerald-700"
                      size={25}
                    />
                    <p className="mt-2 text-slate-500">Loading records...</p>
                  </td>
                </tr>
              ) : filteredFeedings.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center">
                    <Fish
                      className="mx-auto text-slate-300"
                      size={32}
                    />
                    <p className="mt-2 font-medium text-slate-600">
                      No feeding records found
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      Your daily feeding records will appear here.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredFeedings.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70">
                    <td className="px-5 py-4 font-semibold text-slate-800">
                      {item.pond_name}
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-medium text-slate-800">
                        {item.feed_name}
                      </p>
                      {item.brand && (
                        <p className="mt-1 text-xs text-slate-400">
                          {item.brand}
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {formatDate(item.feeding_date)}
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {item.feeding_time || '—'}
                    </td>
                    <td className="px-5 py-4 font-semibold text-emerald-700">
                      {Number(item.quantity_kg).toLocaleString('en-US', {
                        maximumFractionDigits: 3,
                      })}{' '}
                      kg
                    </td>
                    <td className="max-w-48 truncate px-5 py-4 text-slate-500">
                      {item.notes || '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-100 px-5 py-3 text-xs text-slate-500">
          Showing {filteredFeedings.length} of {feedings.length} feeding records
        </div>
      </div>

      {/* Add Feeding Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4">
          <div className="my-auto w-full max-w-xl rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Record Daily Feeding
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Enter the feed consumption details.
                </p>
              </div>

              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 p-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Pond *
                </label>
                <select
                  name="pond_id"
                  value={form.pond_id}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-600"
                >
                  <option value="">Select a pond</option>
                  {ponds.map((pond) => (
                    <option key={pond.id} value={pond.id}>
                      {pond.pond_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Feed Type *
                </label>
                <select
                  name="feed_type_id"
                  value={form.feed_type_id}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-600"
                >
                  <option value="">Select feed type</option>
                  {feedTypes.map((feed) => (
                    <option key={feed.id} value={feed.id}>
                      {feed.feed_name}
                      {feed.brand ? ` - ${feed.brand}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Feeding Date *
                  </label>
                  <input
                    type="date"
                    name="feeding_date"
                    value={form.feeding_date}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Feeding Time
                  </label>
                  <div className="relative">
                    <Clock
                      size={17}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="time"
                      name="feeding_time"
                      value={form.feeding_time}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-3 text-sm outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Feed Quantity (kg) *
                </label>
                <input
                  type="number"
                  name="quantity_kg"
                  value={form.quantity_kg}
                  onChange={handleChange}
                  min="0.001"
                  step="0.001"
                  placeholder="e.g. 25"
                  required
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-600"
                />
                <p className="mt-1 text-xs text-slate-400">
                  The system will check available feed stock before saving.
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Notes
                </label>
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Optional feeding notes..."
                  className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-600"
                />
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60"
                >
                  {saving && (
                    <LoaderCircle size={17} className="animate-spin" />
                  )}
                  Save Feeding
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default DailyFeedingManagement
