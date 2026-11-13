
import { useEffect, useMemo, useState } from 'react'
import {
  X,
  Fish,
  CalendarDays,
  Scale,
  Users,
  FileText,
  LoaderCircle,
  AlertCircle,
  Waves,
} from 'lucide-react'
import { toast } from 'sonner'
import api from '../../../services/api'

const getDhakaDate = () =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Dhaka',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())

const formatDate = (value) => {
  if (!value) return ''

  return new Date(value).toLocaleDateString('en-CA', {
    timeZone: 'Asia/Dhaka',
  })
}

function FishHarvestForm({ onClose, onSuccess }) {
  const [stockings, setStockings] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    stocking_id: '',
    harvest_date: getDhakaDate(),
    quantity: '',
    average_weight_gram: '',
    fishing_team: '',
    notes: '',
  })

  useEffect(() => {
    fetchStockings()
  }, [])

  const fetchStockings = async () => {
    try {
      setLoading(true)

      const [stockingRes, mortalityRes, harvestRes] =
        await Promise.all([
          api.get('/fish-stockings'),
          api.get('/fish-mortalities'),
          api.get('/fish-harvests'),
        ])

      const stockingRecords = stockingRes.data.stockings || []
      const mortalities = mortalityRes.data.mortalities || []
      const harvests = harvestRes.data.harvests || []

      const mortalityMap = {}
      const harvestMap = {}

      mortalities.forEach((item) => {
        const id = item.stocking_id

        mortalityMap[id] =
          (mortalityMap[id] || 0) +
          Number(item.mortality_quantity || 0)
      })

      harvests.forEach((item) => {
        const id = item.stocking_id

        harvestMap[id] =
          (harvestMap[id] || 0) +
          Number(item.harvest_quantity || 0)
      })

      const updatedStockings = stockingRecords.map((item) => {
        const stocked = Number(item.quantity || 0)
        const dead = mortalityMap[item.id] || 0
        const harvested = harvestMap[item.id] || 0

        return {
          ...item,
          remaining_fish: stocked - dead - harvested,
        }
      })

      setStockings(
        updatedStockings.filter((item) => item.remaining_fish > 0)
      )
    } catch (error) {
      console.error('Fetch Harvest Stockings Error:', error)

      toast.error(
        error.response?.data?.message ||
        'Failed to load stocking records.'
      )
    } finally {
      setLoading(false)
    }
  }

  const selectedStocking = useMemo(
    () =>
      stockings.find(
        (item) => String(item.id) === String(formData.stocking_id)
      ),
    [stockings, formData.stocking_id]
  )

  const totalWeight = useMemo(() => {
    if (!formData.quantity || !formData.average_weight_gram) {
      return 0
    }

    return (
      (Number(formData.quantity) *
        Number(formData.average_weight_gram)) /
      1000
    )
  }, [formData.quantity, formData.average_weight_gram])

  const handleChange = (e) => {
    const { name, value } = e.target

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!selectedStocking) {
      toast.error('Please select a stocking record.')
      return
    }

    const quantity = Number(formData.quantity)

    if (quantity > selectedStocking.remaining_fish) {
      toast.error(
        `Only ${selectedStocking.remaining_fish} fish are available.`
      )
      return
    }

    if (formData.harvest_date < formatDate(selectedStocking.stocking_date)) {
      toast.error('Harvest date cannot be earlier than stocking date.')
      return
    }

    if (formData.harvest_date > getDhakaDate()) {
      toast.error('Harvest date cannot be in the future.')
      return
    }

    try {
      setSubmitting(true)

      const payload = {
        stocking_id: Number(formData.stocking_id),
        harvest_date: formData.harvest_date,
        quantity,
        average_weight_gram: formData.average_weight_gram
          ? Number(formData.average_weight_gram)
          : null,
        fishing_team: formData.fishing_team.trim() || null,
        notes: formData.notes.trim() || null,
      }

      const response = await api.post('/fish-harvests', payload)

      toast.success(
        response.data.message || 'Harvest record created successfully.'
      )

      onSuccess?.()
      onClose?.()
    } catch (error) {
      console.error('Create Harvest Error:', error)

      toast.error(
        error.response?.data?.message ||
        'Failed to create harvest record.'
      )

      if (error.response?.status === 400) {
        fetchStockings()
      }
    } finally {
      setSubmitting(false)
    }
  }

  const inputClass =
    'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10'

  const labelClass =
    'mb-2 block text-sm font-semibold text-slate-700'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-3 backdrop-blur-sm sm:p-5">
      <div className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-7">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <Fish size={22} />
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-800">
                Record Fish Harvest
              </h2>
              <p className="text-xs text-slate-500">
                Record harvested fish from a pond
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <div className="overflow-y-auto px-5 py-5 sm:px-7">
          {loading ? (
            <div className="flex min-h-64 flex-col items-center justify-center gap-3">
              <LoaderCircle
                size={30}
                className="animate-spin text-emerald-600"
              />
              <p className="text-sm text-slate-500">
                Loading stocking records...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Stocking Selection */}
              <div>
                <label className={labelClass}>
                  Select Pond & Fish Stocking
                  <span className="ml-1 text-red-500">*</span>
                </label>

                <select
                  name="stocking_id"
                  value={formData.stocking_id}
                  onChange={handleChange}
                  required
                  className={inputClass}
                >
                  <option value="">Choose a stocking record</option>

                  {stockings.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.pond_name} — {item.species_name}
                      {' | '}
                      {item.remaining_fish.toLocaleString()} fish available
                    </option>
                  ))}
                </select>

                {stockings.length === 0 && (
                  <p className="mt-2 flex items-center gap-2 text-xs text-amber-600">
                    <AlertCircle size={14} />
                    No fish are currently available for harvesting.
                  </p>
                )}
              </div>

              {/* Selected Stock Information */}
              {selectedStocking && (
                <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-4">
                  <div className="mb-3 flex items-center gap-2 text-sm font-bold text-emerald-800">
                    <Waves size={17} />
                    Selected Stocking Information
                  </div>

                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    <div>
                      <p className="text-xs text-slate-500">Pond</p>
                      <p className="mt-1 text-sm font-semibold text-slate-800">
                        {selectedStocking.pond_name}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-500">Fish Species</p>
                      <p className="mt-1 text-sm font-semibold text-slate-800">
                        {selectedStocking.species_name}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-500">Originally Stocked</p>
                      <p className="mt-1 text-sm font-semibold text-slate-800">
                        {Number(selectedStocking.quantity).toLocaleString()} pcs
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-500">Stocking Date</p>
                      <p className="mt-1 text-sm font-semibold text-slate-800">
                        {formatDate(selectedStocking.stocking_date)}
                      </p>
                    </div>

                    <div className="col-span-2 rounded-lg bg-white p-3 sm:col-span-2">
                      <p className="text-xs text-slate-500">
                        Remaining Fish Available
                      </p>
                      <p className="mt-1 text-xl font-bold text-emerald-700">
                        {selectedStocking.remaining_fish.toLocaleString()} pcs
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Harvest Date & Quantity */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>
                    <CalendarDays size={15} className="mr-1 inline" />
                    Harvest Date *
                  </label>

                  <input
                    type="date"
                    name="harvest_date"
                    value={formData.harvest_date}
                    onChange={handleChange}
                    min={
                      selectedStocking
                        ? formatDate(selectedStocking.stocking_date)
                        : undefined
                    }
                    max={getDhakaDate()}
                    required
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    Harvest Quantity (Pieces) *
                  </label>

                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    min="1"
                    max={selectedStocking?.remaining_fish || undefined}
                    placeholder="e.g. 200"
                    required
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Average Weight */}
              <div>
                <label className={labelClass}>
                  <Scale size={15} className="mr-1 inline" />
                  Average Fish Weight (Gram)
                </label>

                <input
                  type="number"
                  name="average_weight_gram"
                  value={formData.average_weight_gram}
                  onChange={handleChange}
                  min="0.01"
                  step="0.01"
                  placeholder="e.g. 500"
                  className={inputClass}
                />
                <p className="mt-1.5 text-xs text-slate-400">
                  Optional. Used to calculate total harvested weight.
                </p>
              </div>

              {/* Weight Calculation */}
              {totalWeight > 0 && (
                <div className="flex items-center justify-between rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
                  <div>
                    <p className="text-xs font-medium text-blue-600">
                      Estimated Total Harvest Weight
                    </p>
                    <p className="mt-1 text-xl font-bold text-blue-800">
                      {totalWeight.toFixed(3)} kg
                    </p>
                  </div>

                  <Scale size={25} className="text-blue-500" />
                </div>
              )}

              {/* Fishing Team */}
              <div>
                <label className={labelClass}>
                  <Users size={15} className="mr-1 inline" />
                  Fishing Team
                </label>

                <input
                  type="text"
                  name="fishing_team"
                  value={formData.fishing_team}
                  onChange={handleChange}
                  maxLength={150}
                  placeholder="e.g. Team A"
                  className={inputClass}
                />
              </div>

              {/* Notes */}
              <div>
                <label className={labelClass}>
                  <FileText size={15} className="mr-1 inline" />
                  Notes
                </label>

                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Additional harvest information..."
                  className={`${inputClass} resize-none`}
                />
              </div>

              {/* Actions */}
              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={submitting}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    submitting ||
                    !selectedStocking ||
                    stockings.length === 0
                  }
                  className="flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <LoaderCircle size={17} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Fish size={17} />
                      Save Harvest Record
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default FishHarvestForm
