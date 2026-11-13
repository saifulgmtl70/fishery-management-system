
import { useState } from 'react'
import { X, Waves, Save } from 'lucide-react'

function PondForm({ onClose, onSubmit, initialData = null, submitting = false }) {
  const [formData, setFormData] = useState({
    pond_code: initialData?.pond_code || '',
    pond_name: initialData?.pond_name || '',
    area: initialData?.area ?? '',
    area_unit: initialData?.area_unit || 'decimal',
    depth: initialData?.depth ?? '',
    water_source: initialData?.water_source || '',
    description: initialData?.description || '',
  })

  const [errors, setErrors] = useState({})

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

  const handleSubmit = (e) => {
    e.preventDefault()

    const newErrors = {}

    if (!formData.pond_code.trim()) {
      newErrors.pond_code = 'Pond code is required.'
    }

    if (!formData.pond_name.trim()) {
      newErrors.pond_name = 'Pond name is required.'
    } else if (formData.pond_name.trim().length < 2) {
      newErrors.pond_name = 'Pond name must be at least 2 characters.'
    }

    if (formData.area && Number(formData.area) <= 0) {
      newErrors.area = 'Area must be greater than zero.'
    }

    if (formData.depth && Number(formData.depth) <= 0) {
      newErrors.depth = 'Depth must be greater than zero.'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    onSubmit({
      ...formData,
      pond_code: formData.pond_code.trim(),
      pond_name: formData.pond_name.trim(),
      area: formData.area || null,
      depth: formData.depth || null,
      water_source: formData.water_source.trim() || null,
      description: formData.description.trim() || null,
    })
  }

  const inputClass =
    'w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100'

  const labelClass = 'mb-2 block text-sm font-medium text-gray-700'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-emerald-50 p-3 text-emerald-700">
              <Waves size={22} />
            </div>

            <div>
              <h2 className="text-lg font-bold text-[#123D35]">
                {initialData ? 'Edit Pond' : 'Add New Pond'}
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                Enter the pond information below.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-800"
          >
            <X size={21} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5 p-6">

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

            {/* Pond Code */}
            <div>
              <label className={labelClass}>
                Pond Code <span className="text-red-500">*</span>
              </label>

              <input
                type="text"
                name="pond_code"
                value={formData.pond_code}
                onChange={handleChange}
                placeholder="Example: POND-001"
                maxLength={30}
                className={inputClass}
              />

              {errors.pond_code && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.pond_code}
                </p>
              )}
            </div>

            {/* Pond Name */}
            <div>
              <label className={labelClass}>
                Pond Name <span className="text-red-500">*</span>
              </label>

              <input
                type="text"
                name="pond_name"
                value={formData.pond_name}
                onChange={handleChange}
                placeholder="Example: North Pond"
                maxLength={100}
                className={inputClass}
              />

              {errors.pond_name && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.pond_name}
                </p>
              )}
            </div>

            {/* Area */}
            <div>
              <label className={labelClass}>Pond Area</label>

              <input
                type="number"
                name="area"
                value={formData.area}
                onChange={handleChange}
                placeholder="Enter pond area"
                min="0"
                step="0.01"
                className={inputClass}
              />

              {errors.area && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.area}
                </p>
              )}
            </div>

            {/* Area Unit */}
            <div>
              <label className={labelClass}>Area Unit</label>

              <select
                name="area_unit"
                value={formData.area_unit}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="decimal">Decimal</option>
                <option value="acre">Acre</option>
                <option value="hectare">Hectare</option>
              </select>
            </div>

            {/* Depth */}
            <div>
              <label className={labelClass}>Pond Depth (Feet)</label>

              <input
                type="number"
                name="depth"
                value={formData.depth}
                onChange={handleChange}
                placeholder="Enter depth"
                min="0"
                step="0.01"
                className={inputClass}
              />

              {errors.depth && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.depth}
                </p>
              )}
            </div>

            {/* Water Source */}
            <div>
              <label className={labelClass}>Water Source</label>

              <input
                type="text"
                name="water_source"
                value={formData.water_source}
                onChange={handleChange}
                placeholder="Example: Rainwater / Canal"
                maxLength={100}
                className={inputClass}
              />
            </div>

          </div>

          {/* Description */}
          <div>
            <label className={labelClass}>Description</label>

            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Write additional information about this pond..."
              rows={4}
              maxLength={2000}
              className={`${inputClass} resize-none`}
            />
          </div>

          {/* Footer Buttons */}
          <div className="flex flex-col-reverse justify-end gap-3 border-t border-gray-100 pt-5 sm:flex-row">

            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-lg border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="flex items-center justify-center gap-2 rounded-lg bg-[#123D35] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1B5749] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save size={17} />
              {submitting
                ? 'Saving...'
                : initialData
                  ? 'Update Pond'
                  : 'Save Pond'}
            </button>

          </div>

        </form>
      </div>
    </div>
  )
}

export default PondForm
