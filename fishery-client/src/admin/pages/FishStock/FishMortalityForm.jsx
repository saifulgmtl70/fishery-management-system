
import { useEffect, useState } from 'react'
import {
  X,
  Skull,
  CalendarDays,
  Fish,
  Scale,
  FileText,
  AlertCircle,
  LoaderCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import api from '../../../services/api'

function FishMortalityForm({ onClose, onSubmit, submitting }) {
  const [stockings, setStockings] = useState([])
  const [loading, setLoading] = useState(true)

  const [formData, setFormData] = useState({
    stocking_id: '',
    mortality_date: new Date().toLocaleDateString('en-CA'),
    quantity: '',
    average_weight_gram: '',
    reason: '',
    notes: '',
  })

  useEffect(() => {
    const fetchStockings = async () => {
      try {
        setLoading(true)

        const response = await api.get('/fish-stockings')

        setStockings(response.data.stockings || [])
      } catch (error) {
        console.error('Fetch Stockings Error:', error)

        toast.error(
          error.response?.data?.message ||
          'Failed to load stocking records.'
        )
      } finally {
        setLoading(false)
      }
    }

    fetchStockings()
  }, [])

  const selectedStocking = stockings.find(
    (item) => String(item.id) === String(formData.stocking_id)
  )

  const handleChange = (e) => {
    const { name, value } = e.target

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!formData.stocking_id) {
      toast.error('Please select a stocking record.')
      return
    }

    if (!formData.quantity || Number(formData.quantity) <= 0) {
      toast.error('Please enter a valid mortality quantity.')
      return
    }

    if (
      formData.average_weight_gram !== '' &&
      Number(formData.average_weight_gram) <= 0
    ) {
      toast.error('Average weight must be greater than zero.')
      return
    }

    onSubmit({
      ...formData,
      stocking_id: Number(formData.stocking_id),
      quantity: Number(formData.quantity),
      average_weight_gram:
        formData.average_weight_gram === ''
          ? null
          : Number(formData.average_weight_gram),
    })
  }

  const totalWeight =
    formData.quantity && formData.average_weight_gram
      ? (
          (Number(formData.quantity) *
            Number(formData.average_weight_gram)) /
          1000
        ).toFixed(3)
      : null

  const remainingFish = selectedStocking
    ? Number(selectedStocking.quantity)
    : null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/50 p-3 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">

        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-red-50 p-3 text-red-600">
              <Skull size={22} />
            </div>

            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Record Fish Mortality
              </h2>

              <p className="text-sm text-gray-500">
                Record fish deaths from a stocking batch.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
          >
            <X size={21} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5 p-6">

          {/* Stocking Selection */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Stocking Record <span className="text-red-500">*</span>
            </label>

            <div className="relative">
              <Fish
                size={17}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <select
                name="stocking_id"
                value={formData.stocking_id}
                onChange={handleChange}
                required
                disabled={loading || submitting}
                className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-emerald-500 disabled:bg-gray-50"
              >
                <option value="">
                  {loading
                    ? 'Loading stocking records...'
                    : 'Select stocking record'}
                </option>

                {stockings.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.pond_name} — {item.species_name} —{' '}
                    {Number(item.quantity).toLocaleString()} fish
                  </option>
                ))}
              </select>
            </div>

            {!loading && stockings.length === 0 && (
              <p className="mt-2 text-xs text-amber-600">
                No stocking records available. Add fish stock first.
              </p>
            )}
          </div>

          {/* Selected Stocking Information */}
          {selectedStocking && (
            <div className="grid grid-cols-2 gap-3 rounded-xl border border-emerald-100 bg-emerald-50/70 p-4 sm:grid-cols-3">
              <div>
                <p className="text-xs text-gray-500">Pond</p>
                <p className="mt-1 text-sm font-semibold text-gray-800">
                  {selectedStocking.pond_name}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">Fish Species</p>
                <p className="mt-1 text-sm font-semibold text-gray-800">
                  {selectedStocking.species_name}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">Originally Stocked</p>
                <p className="mt-1 text-sm font-semibold text-emerald-700">
                  {remainingFish?.toLocaleString()} pcs
                </p>
              </div>
            </div>
          )}

          {/* Mortality Date and Quantity */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Mortality Date <span className="text-red-500">*</span>
              </label>

              <div className="relative">
                <CalendarDays
                  size={17}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="date"
                  name="mortality_date"
                  value={formData.mortality_date}
                  onChange={handleChange}
                  min={
                    selectedStocking?.stocking_date
                        ? new Date(selectedStocking.stocking_date).toLocaleDateString(
                            'en-CA',
                            { timeZone: 'Asia/Dhaka' }
                        )
                        : undefined
                    }
                  max={new Date().toLocaleDateString('en-CA')}
                  required
                  disabled={submitting}
                  className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-3 text-sm outline-none transition focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Dead Fish Quantity <span className="text-red-500">*</span>
              </label>

              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                min="1"
                step="1"
                required
                disabled={submitting}
                placeholder="Enter number of dead fish"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Average Weight */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Average Weight per Fish (gram)
            </label>

            <div className="relative">
              <Scale
                size={17}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="number"
                name="average_weight_gram"
                value={formData.average_weight_gram}
                onChange={handleChange}
                min="0.01"
                step="0.01"
                disabled={submitting}
                placeholder="Optional average weight"
                className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-emerald-500"
              />
            </div>

            {totalWeight !== null && (
              <p className="mt-2 text-sm font-medium text-emerald-700">
                Calculated Total Weight: {totalWeight} kg
              </p>
            )}
          </div>

          {/* Reason */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Reason of Mortality
            </label>

            <div className="relative">
              <AlertCircle
                size={17}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <select
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                disabled={submitting}
                className="w-full appearance-none rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-emerald-500"
              >
                <option value="">Select reason (optional)</option>
                <option value="Disease">Disease</option>
                <option value="Poor water quality">Poor water quality</option>
                <option value="Low oxygen">Low oxygen</option>
                <option value="Temperature change">Temperature change</option>
                <option value="Transport stress">Transport stress</option>
                <option value="Unknown">Unknown</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Additional Notes
            </label>

            <div className="relative">
              <FileText
                size={17}
                className="pointer-events-none absolute left-3 top-4 text-gray-400"
              />

              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="3"
                disabled={submitting}
                placeholder="Write additional information..."
                className="w-full resize-none rounded-xl border border-gray-200 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting || loading || stockings.length === 0}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <LoaderCircle size={17} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Skull size={17} />
                  Save Mortality Record
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default FishMortalityForm
