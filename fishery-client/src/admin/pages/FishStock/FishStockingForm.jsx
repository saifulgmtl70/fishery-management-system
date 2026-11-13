
import { useEffect, useMemo, useState } from 'react'
import { X, Fish, Waves, Save, Scale, Calculator } from 'lucide-react'
import api from '../../../services/api'

function FishStockingForm({
  onClose,
  onSubmit,
  submitting = false,
}) {
  const [ponds, setPonds] = useState([])
  const [species, setSpecies] = useState([])
  const [loadingOptions, setLoadingOptions] = useState(true)

  const [formData, setFormData] = useState({
    pond_id: '',
    species_id: '',
    stocking_date: new Date().toISOString().split('T')[0],
    total_weight_kg: '',
    sample_weight_kg: '',
    sample_fish_count: '',
    unit_price: '',
    supplier_name: '',
    notes: '',
  })

  const [errors, setErrors] = useState({})

  // ==========================================
  // LOAD PONDS AND FISH SPECIES
  // ==========================================

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setLoadingOptions(true)

        const [pondResponse, speciesResponse] = await Promise.all([
          api.get('/ponds'),
          api.get('/fish-species'),
        ])

        setPonds(
          (pondResponse.data.ponds || []).filter(
            (pond) => pond.status === 'active'
          )
        )

        setSpecies(
          (speciesResponse.data.species || []).filter(
            (item) => item.status === 'active'
          )
        )
      } catch (error) {
        console.error('Failed to load stocking form options:', error)
      } finally {
        setLoadingOptions(false)
      }
    }

    fetchOptions()
  }, [])

  // ==========================================
  // FORM INPUT HANDLER
  // ==========================================

  const handleChange = (e) => {
    const { name, value } = e.target

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    setErrors((prev) => ({
      ...prev,
      [name]: '',
    }))
  }

  // ==========================================
  // AUTOMATIC CALCULATIONS
  // ==========================================

  const calculations = useMemo(() => {
    const totalWeight = Number(formData.total_weight_kg)
    const sampleWeight = Number(formData.sample_weight_kg)
    const sampleFishCount = Number(formData.sample_fish_count)
    const unitPrice = Number(formData.unit_price)

    const validSample =
      sampleWeight > 0 &&
      sampleFishCount > 0

    const fishPerKg = validSample
      ? sampleFishCount / sampleWeight
      : 0

    const estimatedQuantity =
      totalWeight > 0 && validSample
        ? Math.round(totalWeight * fishPerKg)
        : 0

    const averageWeightGram = validSample
      ? (sampleWeight * 1000) / sampleFishCount
      : 0

    const totalCost =
      totalWeight > 0 && formData.unit_price !== ''
        ? totalWeight * unitPrice
        : 0

    return {
      fishPerKg,
      estimatedQuantity,
      averageWeightGram,
      totalCost,
    }
  }, [
    formData.total_weight_kg,
    formData.sample_weight_kg,
    formData.sample_fish_count,
    formData.unit_price,
  ])

  // ==========================================
  // FORM VALIDATION
  // ==========================================

  const validateForm = () => {
    const newErrors = {}

    if (!formData.pond_id) {
      newErrors.pond_id = 'Please select a pond.'
    }

    if (!formData.species_id) {
      newErrors.species_id = 'Please select a fish species.'
    }

    if (!formData.stocking_date) {
      newErrors.stocking_date = 'Stocking date is required.'
    }

    if (
      !formData.total_weight_kg ||
      Number(formData.total_weight_kg) <= 0
    ) {
      newErrors.total_weight_kg =
        'Enter a valid total stocking weight.'
    }

    if (
      !formData.sample_weight_kg ||
      Number(formData.sample_weight_kg) <= 0
    ) {
      newErrors.sample_weight_kg =
        'Enter a valid sample weight.'
    }

    if (
      !formData.sample_fish_count ||
      Number(formData.sample_fish_count) <= 0 ||
      !Number.isInteger(Number(formData.sample_fish_count))
    ) {
      newErrors.sample_fish_count =
        'Enter a valid whole number of sample fish.'
    }

    if (
      Number(formData.sample_weight_kg) >
      Number(formData.total_weight_kg)
    ) {
      newErrors.sample_weight_kg =
        'Sample weight cannot exceed total stocking weight.'
    }

    if (
      formData.unit_price === '' ||
      Number(formData.unit_price) < 0
    ) {
      newErrors.unit_price =
        'Enter a valid price per kg.'
    }

    setErrors(newErrors)

    return Object.keys(newErrors).length === 0
  }

  // ==========================================
  // FORM SUBMISSION
  // ==========================================

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!validateForm()) return

    onSubmit({
      pond_id: Number(formData.pond_id),
      species_id: Number(formData.species_id),
      stocking_date: formData.stocking_date,

      total_weight_kg: Number(formData.total_weight_kg),
      sample_weight_kg: Number(formData.sample_weight_kg),
      sample_fish_count: Number(formData.sample_fish_count),

      unit_price: Number(formData.unit_price),

      supplier_name: formData.supplier_name.trim() || null,
      notes: formData.notes.trim() || null,
    })
  }

  // ==========================================
  // STYLING
  // ==========================================

  const inputClass =
    'w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100'

  const labelClass =
    'mb-2 block text-sm font-semibold text-gray-700'

  const errorClass =
    'mt-1 text-xs text-red-500'

  const formatNumber = (value, digits = 2) =>
    Number(value || 0).toLocaleString('en-US', {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/50 p-4 backdrop-blur-sm">
      <div className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

        {/* HEADER */}

        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
          <div>
            <div className="flex items-center gap-2">
              <div className="rounded-xl bg-emerald-50 p-2 text-emerald-600">
                <Fish size={20} />
              </div>

              <h2 className="text-xl font-bold text-gray-900">
                Add Fish Stocking
              </h2>
            </div>

            <p className="mt-2 text-sm text-gray-500">
              Record a new fish stocking batch using sample measurement.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        {/* FORM */}

        <form
          onSubmit={handleSubmit}
          className="space-y-6 overflow-y-auto p-6"
        >
          {loadingOptions ? (
            <div className="py-10 text-center text-sm text-gray-500">
              Loading ponds and fish species...
            </div>
          ) : (
            <>

              {/* POND AND SPECIES */}

              <div>
                <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-gray-800">
                  <Waves size={17} className="text-emerald-600" />
                  Stocking Location & Species
                </h3>

                <div className="grid gap-5 sm:grid-cols-2">

                  <div>
                    <label className={labelClass}>
                      Select Pond <span className="text-red-500">*</span>
                    </label>

                    <select
                      name="pond_id"
                      value={formData.pond_id}
                      onChange={handleChange}
                      className={inputClass}
                    >
                      <option value="">Choose a pond</option>

                      {ponds.map((pond) => (
                        <option key={pond.id} value={pond.id}>
                          {pond.pond_code} - {pond.pond_name}
                        </option>
                      ))}
                    </select>

                    {errors.pond_id && (
                      <p className={errorClass}>{errors.pond_id}</p>
                    )}
                  </div>

                  <div>
                    <label className={labelClass}>
                      Fish Species <span className="text-red-500">*</span>
                    </label>

                    <select
                      name="species_id"
                      value={formData.species_id}
                      onChange={handleChange}
                      className={inputClass}
                    >
                      <option value="">Choose fish species</option>

                      {species.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.species_name}
                        </option>
                      ))}
                    </select>

                    {errors.species_id && (
                      <p className={errorClass}>{errors.species_id}</p>
                    )}
                  </div>

                </div>
              </div>

              {/* STOCKING DATE */}

              <div>
                <label className={labelClass}>
                  Stocking Date <span className="text-red-500">*</span>
                </label>

                <input
                  type="date"
                  name="stocking_date"
                  value={formData.stocking_date}
                  onChange={handleChange}
                  className={inputClass}
                />

                {errors.stocking_date && (
                  <p className={errorClass}>{errors.stocking_date}</p>
                )}
              </div>

              {/* ACTUAL STOCKING MEASUREMENT */}

              <div>
                <h3 className="mb-2 flex items-center gap-2 text-sm font-bold text-gray-800">
                  <Scale size={17} className="text-emerald-600" />
                  Stocking Measurement
                </h3>

                <p className="mb-4 text-xs leading-5 text-gray-500">
                  Enter the total weight of all stocked fingerlings and
                  the weight and fish count of the final sample container.
                </p>

                <div className="grid gap-5 sm:grid-cols-2">

                  <div>
                    <label className={labelClass}>
                      Total Stocking Weight (KG) <span className="text-red-500">*</span>
                    </label>

                    <input
                      type="number"
                      name="total_weight_kg"
                      min="0.001"
                      step="0.001"
                      value={formData.total_weight_kg}
                      onChange={handleChange}
                      placeholder="e.g. 350"
                      className={inputClass}
                    />

                    {errors.total_weight_kg && (
                      <p className={errorClass}>
                        {errors.total_weight_kg}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className={labelClass}>
                      Sample Weight (KG) <span className="text-red-500">*</span>
                    </label>

                    <input
                      type="number"
                      name="sample_weight_kg"
                      min="0.001"
                      step="0.001"
                      value={formData.sample_weight_kg}
                      onChange={handleChange}
                      placeholder="e.g. 20"
                      className={inputClass}
                    />

                    {errors.sample_weight_kg && (
                      <p className={errorClass}>
                        {errors.sample_weight_kg}
                      </p>
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <label className={labelClass}>
                      Fish Count in Sample (Pieces) <span className="text-red-500">*</span>
                    </label>

                    <input
                      type="number"
                      name="sample_fish_count"
                      min="1"
                      step="1"
                      value={formData.sample_fish_count}
                      onChange={handleChange}
                      placeholder="e.g. 350"
                      className={inputClass}
                    />

                    {errors.sample_fish_count && (
                      <p className={errorClass}>
                        {errors.sample_fish_count}
                      </p>
                    )}
                  </div>

                </div>
              </div>

              {/* PRICE */}

              <div>
                <h3 className="mb-4 text-sm font-bold text-gray-800">
                  Purchase Information
                </h3>

                <div className="grid gap-5 sm:grid-cols-2">

                  <div>
                    <label className={labelClass}>
                      Unit Price (Per KG) <span className="text-red-500">*</span>
                    </label>

                    <input
                      type="number"
                      name="unit_price"
                      min="0"
                      step="0.01"
                      value={formData.unit_price}
                      onChange={handleChange}
                      placeholder="e.g. 200"
                      className={inputClass}
                    />

                    {errors.unit_price && (
                      <p className={errorClass}>{errors.unit_price}</p>
                    )}
                  </div>

                  <div>
                    <label className={labelClass}>
                      Supplier Name
                    </label>

                    <input
                      type="text"
                      name="supplier_name"
                      value={formData.supplier_name}
                      onChange={handleChange}
                      placeholder="Enter supplier name"
                      className={inputClass}
                    />
                  </div>

                </div>
              </div>

              {/* AUTOMATIC CALCULATIONS */}

              <div className="overflow-hidden rounded-2xl border border-emerald-100 bg-emerald-50/50">

                <div className="flex items-center gap-2 border-b border-emerald-100 px-5 py-4">
                  <Calculator size={18} className="text-emerald-700" />

                  <h3 className="text-sm font-bold text-emerald-900">
                    Automatic Stocking Calculation
                  </h3>
                </div>

                <div className="grid gap-4 p-5 sm:grid-cols-2">

                  <div className="rounded-xl bg-white p-4">
                    <p className="text-xs font-medium text-gray-500">
                      Fish Per KG
                    </p>

                    <p className="mt-2 text-xl font-bold text-emerald-700">
                      {formatNumber(calculations.fishPerKg, 4)}
                      <span className="ml-1 text-xs font-medium text-gray-500">
                        pcs/kg
                      </span>
                    </p>
                  </div>

                  <div className="rounded-xl bg-white p-4">
                    <p className="text-xs font-medium text-gray-500">
                      Estimated Total Fish Quantity
                    </p>

                    <p className="mt-2 text-xl font-bold text-emerald-700">
                      {calculations.estimatedQuantity.toLocaleString('en-US')}
                      <span className="ml-1 text-xs font-medium text-gray-500">
                        pcs
                      </span>
                    </p>
                  </div>

                  <div className="rounded-xl bg-white p-4">
                    <p className="text-xs font-medium text-gray-500">
                      Average Weight Per Fish
                    </p>

                    <p className="mt-2 text-xl font-bold text-gray-900">
                      {formatNumber(calculations.averageWeightGram, 2)}
                      <span className="ml-1 text-xs font-medium text-gray-500">
                        gram
                      </span>
                    </p>
                  </div>

                  <div className="rounded-xl bg-white p-4">
                    <p className="text-xs font-medium text-gray-500">
                      Total Purchase Cost
                    </p>

                    <p className="mt-2 text-xl font-bold text-gray-900">
                      ৳{formatNumber(calculations.totalCost)}
                    </p>
                  </div>

                </div>

                <div className="border-t border-emerald-100 px-5 py-3">
                  <p className="text-xs leading-5 text-gray-500">
                    Fish quantity is an estimate based on the sample.
                    Actual quantity may vary slightly.
                  </p>
                </div>

              </div>

              {/* NOTES */}

              <div>
                <label className={labelClass}>
                  Notes
                </label>

                <textarea
                  name="notes"
                  rows="3"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Additional stocking information..."
                  className={inputClass}
                />
              </div>

            </>
          )}

          {/* FOOTER */}

          <div className="flex flex-col-reverse justify-end gap-3 border-t border-gray-100 pt-5 sm:flex-row">

            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                submitting ||
                loadingOptions ||
                ponds.length === 0 ||
                species.length === 0
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save size={17} />

              {submitting ? 'Saving...' : 'Save Stocking Record'}
            </button>

          </div>

        </form>
      </div>
    </div>
  )
}

export default FishStockingForm
