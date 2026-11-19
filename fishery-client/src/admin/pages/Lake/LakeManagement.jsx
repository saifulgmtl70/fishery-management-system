
import { useEffect, useState } from 'react'
import {
  Waves,
  Users,
  Fish,
  Wallet,
  Plus,
  RefreshCw,
  Sun,
  Sunset,
  Pencil,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import api from '../../../services/api'

// ==========================================
// REUSABLE COMPONENTS
// ==========================================

const Input = ({ label, ...props }) => (
  <label className="block space-y-1.5">
    <span className="text-sm font-medium text-gray-600">
      {label}
    </span>

    <input
      {...props}
      className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
    />
  </label>
)

const Select = ({ label, children, ...props }) => (
  <label className="block space-y-1.5">
    <span className="text-sm font-medium text-gray-600">
      {label}
    </span>

    <select
      {...props}
      className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
    >
      {children}
    </select>
  </label>
)

const Card = ({ title, value, icon: Icon, color }) => (
  <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500">{title}</p>

        <h2 className={`mt-2 text-2xl font-bold ${color}`}>
          {value}
        </h2>
      </div>

      <div className="rounded-xl bg-gray-50 p-3">
        <Icon size={23} className={color} />
      </div>
    </div>
  </div>
)

// ==========================================
// DATE HELPER
// ==========================================

const today = () => {
  const date = new Date()
  const offset = date.getTimezoneOffset()

  return new Date(date.getTime() - offset * 60000)
    .toISOString()
    .slice(0, 10)
}

const formatDate = (date) => {
  if (!date) return today()

  return String(date).slice(0, 10)
}

// ==========================================
// MONEY FORMATTER
// ==========================================

const money = (value) =>
  `৳${Number(value || 0).toLocaleString('en-BD', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`

// ==========================================
// LAKE MANAGEMENT
// ==========================================

const LakeManagement = () => {
  // ==========================================
  // STATES
  // ==========================================

  const [activeTab, setActiveTab] = useState('overview')
  const [selectedDate, setSelectedDate] = useState(today())
  const [loading, setLoading] = useState(false)
  const [savingEdit, setSavingEdit] = useState(false)

  const [fishermen, setFishermen] = useState([])
  const [species, setSpecies] = useState([])
  const [fishingRecords, setFishingRecords] = useState([])
  const [rodRecords, setRodRecords] = useState([])
  const [summary, setSummary] = useState(null)

  // Edit States
  const [editingFishingId, setEditingFishingId] = useState(null)
  const [editingRodId, setEditingRodId] = useState(null)

  // Fisherman Form
  const [fishermanForm, setFishermanForm] = useState({
    fisherman_name: '',
    phone: '',
    address: '',
  })

  // Local Fishing Form
  const [fishingForm, setFishingForm] = useState({
    fisherman_id: '',
    fish_species_id: '',
    fishing_date: today(),
    session: 'morning',
    quantity_kg: '',
    price_per_kg: '',
    notes: '',
  })

  // Rod Fishing Form
  const [rodForm, setRodForm] = useState({
    fishing_date: today(),
    visitor_name: '',
    amount: '',
    payment_method: 'cash',
    reference_number: '',
    notes: '',
  })

  // ==========================================
  // FETCH DATA
  // ==========================================

  const fetchData = async () => {
    try {
      setLoading(true)

      const [
        fishermenRes,
        recordsRes,
        rodRes,
        summaryRes,
        speciesRes,
      ] = await Promise.all([
        api.get('/lake/fishermen'),

        api.get('/lake/fishing-records', {
          params: { date: selectedDate },
        }),

        api.get('/lake/rod-fishing', {
          params: { date: selectedDate },
        }),

        api.get('/lake/daily-summary', {
          params: { date: selectedDate },
        }),

        api.get('/fish-species'),
      ])

      setFishermen(fishermenRes.data.data || [])
      setFishingRecords(recordsRes.data.data || [])
      setRodRecords(rodRes.data.data || [])
      setSummary(summaryRes.data.data || null)
      setSpecies(speciesRes.data.species || [])
    } catch (error) {
      console.error('Lake Data Error:', error)

      toast.error(
        error.response?.data?.message ||
          'Failed to load lake management data.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [selectedDate])

  // ==========================================
  // ADD FISHERMAN
  // ==========================================

  const addFisherman = async (e) => {
    e.preventDefault()

    try {
      await api.post('/lake/fishermen', fishermanForm)

      toast.success('Fisherman added successfully.')

      setFishermanForm({
        fisherman_name: '',
        phone: '',
        address: '',
      })

      fetchData()
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          'Failed to add fisherman.'
      )
    }
  }

  // ==========================================
  // ADD LOCAL FISHING RECORD
  // ==========================================

  const addFishingRecord = async (e) => {
    e.preventDefault()

    try {
      await api.post('/lake/fishing-records', fishingForm)

      toast.success('Fishing record added successfully.')

      setFishingForm({
        fisherman_id: '',
        fish_species_id: '',
        fishing_date: selectedDate,
        session: 'morning',
        quantity_kg: '',
        price_per_kg: '',
        notes: '',
      })

      fetchData()
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          'Failed to add fishing record.'
      )
    }
  }

  // ==========================================
  // ADD ROD FISHING ENTRY
  // ==========================================

  const addRodEntry = async (e) => {
    e.preventDefault()

    try {
      await api.post('/lake/rod-fishing', rodForm)

      toast.success('Rod fishing entry added successfully.')

      setRodForm({
        fishing_date: selectedDate,
        visitor_name: '',
        amount: '',
        payment_method: 'cash',
        reference_number: '',
        notes: '',
      })

      fetchData()
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          'Failed to add rod fishing entry.'
      )
    }
  }

  // ==========================================
  // EDIT LOCAL FISHING RECORD
  // ==========================================

  const startEditingFishing = (record) => {
    setEditingFishingId(record.id)

    setFishingForm({
      fisherman_id: String(record.fisherman_id || ''),
      fish_species_id: String(record.fish_species_id || ''),
      fishing_date: formatDate(record.fishing_date),
      session: record.session || 'morning',
      quantity_kg: String(record.quantity_kg ?? ''),
      price_per_kg: String(record.price_per_kg ?? ''),
      notes: record.notes || '',
    })
  }

  const cancelFishingEdit = () => {
    setEditingFishingId(null)

    setFishingForm({
      fisherman_id: '',
      fish_species_id: '',
      fishing_date: selectedDate,
      session: 'morning',
      quantity_kg: '',
      price_per_kg: '',
      notes: '',
    })
  }

  const updateFishingRecord = async (e) => {
    e.preventDefault()

    if (!editingFishingId) return

    try {
      setSavingEdit(true)

      await api.put(
        `/lake/fishing-records/${editingFishingId}`,
        fishingForm
      )

      toast.success('Fishing record updated successfully.')

      cancelFishingEdit()
      await fetchData()
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          'Failed to update fishing record.'
      )
    } finally {
      setSavingEdit(false)
    }
  }

  // ==========================================
  // EDIT ROD FISHING ENTRY
  // ==========================================

  const startEditingRod = (record) => {
    setEditingRodId(record.id)

    setRodForm({
      fishing_date: formatDate(record.fishing_date),
      visitor_name: record.visitor_name || '',
      amount: String(record.amount ?? ''),
      payment_method: record.payment_method || 'cash',
      reference_number: record.reference_number || '',
      notes: record.notes || '',
    })
  }

  const cancelRodEdit = () => {
    setEditingRodId(null)

    setRodForm({
      fishing_date: selectedDate,
      visitor_name: '',
      amount: '',
      payment_method: 'cash',
      reference_number: '',
      notes: '',
    })
  }

  const updateRodEntry = async (e) => {
    e.preventDefault()

    if (!editingRodId) return

    try {
      setSavingEdit(true)

      await api.put(
        `/lake/rod-fishing/${editingRodId}`,
        rodForm
      )

      toast.success('Rod fishing entry updated successfully.')

      cancelRodEdit()
      await fetchData()
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          'Failed to update rod fishing entry.'
      )
    } finally {
      setSavingEdit(false)
    }
  }

  // ==========================================
  // TABS
  // ==========================================

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Waves },
    { id: 'fishermen', label: 'Fishermen', icon: Users },
    { id: 'fishing', label: 'Local Fishing', icon: Fish },
    { id: 'rod', label: 'Rod Fishing', icon: Wallet },
  ]

  // ==========================================
  // SUMMARY CALCULATIONS
  // ==========================================

  const totalLocalValue =
    Number(summary?.fishing?.morning?.total_fish_value || 0) +
    Number(summary?.fishing?.afternoon?.total_fish_value || 0)

  const totalRodIncome = Number(
    summary?.rod_fishing?.total_income || 0
  )

  const ownerIncome = Number(
    summary?.local_fishermen_owner_income || 0
  )

  const totalLakeIncome = Number(
    summary?.total_lake_income || 0
  )

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="space-y-6">

      {/* HEADER */}

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <Waves className="text-emerald-600" size={25} />

            <h1 className="text-2xl font-bold text-gray-800">
              Lake Management
            </h1>
          </div>

          <p className="mt-1 text-sm text-gray-500">
            Manage local fishermen, rod fishing and lake income.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm"
          />

          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={loading ? 'animate-spin' : ''}
            />

            Refresh
          </button>
        </div>
      </div>

      {/* TABS */}

      <div className="flex gap-2 overflow-x-auto rounded-xl border border-gray-100 bg-white p-2">
        {tabs.map((tab) => {
          const Icon = tab.icon

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex shrink-0 items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                activeTab === tab.id
                  ? 'bg-emerald-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Icon size={17} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* OVERVIEW */}

      {activeTab === 'overview' && (
        <div className="space-y-6">

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

            <Card
              title="Total Fish Value"
              value={money(totalLocalValue)}
              icon={Fish}
              color="text-blue-600"
            />

            <Card
              title="Owner Share (50%)"
              value={money(ownerIncome)}
              icon={Wallet}
              color="text-emerald-600"
            />

            <Card
              title="Rod Fishing Income"
              value={money(totalRodIncome)}
              icon={Users}
              color="text-purple-600"
            />

            <Card
              title="Total Lake Income"
              value={money(totalLakeIncome)}
              icon={Waves}
              color="text-emerald-700"
            />

          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">

            {[
              {
                title: 'Morning Fishing',
                icon: Sun,
                data: summary?.fishing?.morning,
              },
              {
                title: 'Afternoon Fishing',
                icon: Sunset,
                data: summary?.fishing?.afternoon,
              },
            ].map((item) => {
              const Icon = item.icon

              return (
                <div
                  key={item.title}
                  className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
                >
                  <div className="mb-4 flex items-center gap-2">
                    <Icon className="text-emerald-600" size={20} />

                    <h2 className="font-semibold text-gray-800">
                      {item.title}
                    </h2>
                  </div>

                  <div className="space-y-3 text-sm">

                    <div className="flex justify-between">
                      <span className="text-gray-500">
                        Total Fish Value
                      </span>

                      <strong>
                        {money(item.data?.total_fish_value)}
                      </strong>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-500">
                        Owner Share
                      </span>

                      <strong className="text-emerald-600">
                        {money(item.data?.owner_share)}
                      </strong>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-500">
                        Fishermen Share
                      </span>

                      <strong>
                        {money(item.data?.fisherman_share)}
                      </strong>
                    </div>

                  </div>
                </div>
              )
            })}

          </div>

          {/* DAILY LAKE INCOME */}

          <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">

            <div className="border-b border-gray-100 px-5 py-4">
              <h2 className="font-semibold text-gray-800">
                Daily Lake Income
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                Summary for {selectedDate}
              </p>
            </div>

            <div className="space-y-3 p-5 text-sm">

              <div className="flex justify-between">
                <span className="text-gray-500">
                  Local Fishermen Owner Share
                </span>

                <strong>{money(ownerIncome)}</strong>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">
                  Rod Fishing Fees
                </span>

                <strong>{money(totalRodIncome)}</strong>
              </div>

              <div className="flex justify-between border-t border-gray-100 pt-3 text-base">
                <strong>Total Lake Income</strong>

                <strong className="text-emerald-600">
                  {money(totalLakeIncome)}
                </strong>
              </div>

            </div>
          </div>

        </div>
      )}

      {/* FISHERMEN */}

      {activeTab === 'fishermen' && (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">

          <form
            onSubmit={addFisherman}
            className="h-fit space-y-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
          >
            <h2 className="font-semibold text-gray-800">
              Add New Fisherman
            </h2>

            <Input
              label="Fisherman Name"
              value={fishermanForm.fisherman_name}
              onChange={(e) =>
                setFishermanForm((prev) => ({
                  ...prev,
                  fisherman_name: e.target.value,
                }))
              }
              placeholder="Enter name"
              required
            />

            <Input
              label="Phone Number"
              value={fishermanForm.phone}
              onChange={(e) =>
                setFishermanForm((prev) => ({
                  ...prev,
                  phone: e.target.value,
                }))
              }
              placeholder="01XXXXXXXXX"
            />

            <Input
              label="Address"
              value={fishermanForm.address}
              onChange={(e) =>
                setFishermanForm((prev) => ({
                  ...prev,
                  address: e.target.value,
                }))
              }
              placeholder="Enter address"
            />

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              <Plus size={17} />
              Add Fisherman
            </button>
          </form>

          {/* FISHERMEN LIST */}

          <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm lg:col-span-2">

            <div className="border-b border-gray-100 px-5 py-4">
              <h2 className="font-semibold text-gray-800">
                Fishermen List ({fishermen.length})
              </h2>
            </div>

            {fishermen.length === 0 ? (
              <p className="py-12 text-center text-sm text-gray-400">
                No fishermen added yet.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">

                  <thead className="bg-gray-50 text-xs text-gray-500">
                    <tr>
                      <th className="px-5 py-3">Name</th>
                      <th className="px-5 py-3">Phone</th>
                      <th className="px-5 py-3">Address</th>
                      <th className="px-5 py-3">Status</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {fishermen.map((person) => (
                      <tr key={person.id}>
                        <td className="px-5 py-4 font-medium text-gray-800">
                          {person.fisherman_name}
                        </td>

                        <td className="px-5 py-4 text-gray-600">
                          {person.phone || '—'}
                        </td>

                        <td className="px-5 py-4 text-gray-600">
                          {person.address || '—'}
                        </td>

                        <td className="px-5 py-4">
                          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs text-emerald-700">
                            {person.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>

                </table>
              </div>
            )}

          </div>
        </div>
      )}

      {/* LOCAL FISHING */}

      {activeTab === 'fishing' && (
        <div className="space-y-5">

          <form
            onSubmit={addFishingRecord}
            className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
          >
            <h2 className="mb-5 font-semibold text-gray-800">
              Add Local Fishing Record
            </h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">

              <Select
                label="Fisherman"
                value={fishingForm.fisherman_id}
                onChange={(e) =>
                  setFishingForm((prev) => ({
                    ...prev,
                    fisherman_id: e.target.value,
                  }))
                }
                required
              >
                <option value="">Select fisherman</option>

                {fishermen
                  .filter((f) => f.status === 'active')
                  .map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.fisherman_name}
                    </option>
                  ))}
              </Select>

              <Select
                label="Fish Species"
                value={fishingForm.fish_species_id}
                onChange={(e) =>
                  setFishingForm((prev) => ({
                    ...prev,
                    fish_species_id: e.target.value,
                  }))
                }
                required
              >
                <option value="">Select species</option>

                {species
                  .filter((s) => s.status === 'active')
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.species_name}
                    </option>
                  ))}
              </Select>

              <Select
                label="Fishing Session"
                value={fishingForm.session}
                onChange={(e) =>
                  setFishingForm((prev) => ({
                    ...prev,
                    session: e.target.value,
                  }))
                }
              >
                <option value="morning">Morning</option>
                <option value="afternoon">Afternoon</option>
              </Select>

              <Input
                label="Fishing Date"
                type="date"
                value={fishingForm.fishing_date}
                onChange={(e) =>
                  setFishingForm((prev) => ({
                    ...prev,
                    fishing_date: e.target.value,
                  }))
                }
                required
              />

              <Input
                label="Quantity (KG)"
                type="number"
                min="0.01"
                step="0.01"
                value={fishingForm.quantity_kg}
                onChange={(e) =>
                  setFishingForm((prev) => ({
                    ...prev,
                    quantity_kg: e.target.value,
                  }))
                }
                placeholder="e.g. 5"
                required
              />

              <Input
                label="Price Per KG (৳)"
                type="number"
                min="0"
                step="0.01"
                value={fishingForm.price_per_kg}
                onChange={(e) =>
                  setFishingForm((prev) => ({
                    ...prev,
                    price_per_kg: e.target.value,
                  }))
                }
                placeholder="e.g. 160"
                required
              />

            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">

              <Input
                label="Notes (Optional)"
                value={fishingForm.notes}
                onChange={(e) =>
                  setFishingForm((prev) => ({
                    ...prev,
                    notes: e.target.value,
                  }))
                }
                placeholder="Additional information"
              />

              <div className="flex items-end">
                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
                >
                  <Plus size={17} />
                  Save Fishing Record
                </button>
              </div>

            </div>

            {fishingForm.quantity_kg && fishingForm.price_per_kg && (
              <div className="mt-4 rounded-xl bg-emerald-50 p-4 text-sm">

                <p className="text-gray-600">
                  Total Fish Value:{' '}
                  <strong>
                    {money(
                      Number(fishingForm.quantity_kg) *
                        Number(fishingForm.price_per_kg)
                    )}
                  </strong>
                </p>

                <p className="mt-1 text-emerald-700">
                  Owner Share (50%):{' '}
                  <strong>
                    {money(
                      (Number(fishingForm.quantity_kg) *
                        Number(fishingForm.price_per_kg)) /
                        2
                    )}
                  </strong>
                </p>

              </div>
            )}

          </form>

          {/* FISHING RECORDS */}

          <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">

            <div className="border-b border-gray-100 px-5 py-4">
              <h2 className="font-semibold text-gray-800">
                Fishing Records — {selectedDate}
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[950px] text-left text-sm">

                <thead className="bg-gray-50 text-xs text-gray-500">
                  <tr>
                    <th className="px-5 py-3">Fisherman</th>
                    <th className="px-5 py-3">Session</th>
                    <th className="px-5 py-3">Species</th>
                    <th className="px-5 py-3 text-right">KG</th>
                    <th className="px-5 py-3 text-right">Rate/KG</th>
                    <th className="px-5 py-3 text-right">Total</th>
                    <th className="px-5 py-3 text-right">Owner 50%</th>
                    <th className="px-5 py-3 text-center">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {fishingRecords.map((record) => (
                    <tr key={record.id}>
                      <td className="px-5 py-4 font-medium">
                        {record.fisherman_name}
                      </td>

                      <td className="px-5 py-4 capitalize">
                        {record.session}
                      </td>

                      <td className="px-5 py-4">
                        {record.species_name}
                      </td>

                      <td className="px-5 py-4 text-right">
                        {record.quantity_kg}
                      </td>

                      <td className="px-5 py-4 text-right">
                        {money(record.price_per_kg)}
                      </td>

                      <td className="px-5 py-4 text-right font-medium">
                        {money(record.total_value)}
                      </td>

                      <td className="px-5 py-4 text-right font-semibold text-emerald-600">
                        {money(record.owner_share)}
                      </td>

                      <td className="px-5 py-4 text-center">
                        <button
                          type="button"
                          onClick={() => startEditingFishing(record)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 px-3 py-2 text-xs font-medium text-emerald-700 transition hover:bg-emerald-50"
                        >
                          <Pencil size={14} />
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>

              </table>

              {fishingRecords.length === 0 && (
                <p className="py-10 text-center text-sm text-gray-400">
                  No fishing records for this date.
                </p>
              )}

            </div>
          </div>

        </div>
      )}

      {/* ROD FISHING */}

      {activeTab === 'rod' && (
        <div className="space-y-5">

          <form
            onSubmit={addRodEntry}
            className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
          >
            <h2 className="mb-5 font-semibold text-gray-800">
              Add Rod Fishing Entry
            </h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">

              <Input
                label="Date"
                type="date"
                value={rodForm.fishing_date}
                onChange={(e) =>
                  setRodForm((prev) => ({
                    ...prev,
                    fishing_date: e.target.value,
                  }))
                }
                required
              />

              <Input
                label="Visitor Name (Optional)"
                value={rodForm.visitor_name}
                onChange={(e) =>
                  setRodForm((prev) => ({
                    ...prev,
                    visitor_name: e.target.value,
                  }))
                }
                placeholder="Visitor name"
              />

              <Input
                label="Received Amount (৳)"
                type="number"
                min="0.01"
                step="0.01"
                value={rodForm.amount}
                onChange={(e) =>
                  setRodForm((prev) => ({
                    ...prev,
                    amount: e.target.value,
                  }))
                }
                placeholder="300 / 400 / 500 / 1000"
                required
              />

              <Select
                label="Payment Method"
                value={rodForm.payment_method}
                onChange={(e) =>
                  setRodForm((prev) => ({
                    ...prev,
                    payment_method: e.target.value,
                  }))
                }
              >
                <option value="cash">Cash</option>
                <option value="bkash">bKash</option>
                <option value="nagad">Nagad</option>
                <option value="bank">Bank</option>
                <option value="other">Other</option>
              </Select>

              <Input
                label="Reference Number (Optional)"
                value={rodForm.reference_number}
                onChange={(e) =>
                  setRodForm((prev) => ({
                    ...prev,
                    reference_number: e.target.value,
                  }))
                }
                placeholder="Transaction reference"
              />

              <Input
                label="Notes (Optional)"
                value={rodForm.notes}
                onChange={(e) =>
                  setRodForm((prev) => ({
                    ...prev,
                    notes: e.target.value,
                  }))
                }
                placeholder="Additional information"
              />

            </div>

            <button
              type="submit"
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700 sm:w-auto"
            >
              <Plus size={17} />
              Save Rod Fishing Entry
            </button>

          </form>

          {/* ROD FISHING ENTRIES */}

          <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">

            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <h2 className="font-semibold text-gray-800">
                Rod Fishing Entries
              </h2>

              <strong className="text-emerald-600">
                {money(totalRodIncome)}
              </strong>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[750px] text-left text-sm">

                <thead className="bg-gray-50 text-xs text-gray-500">
                  <tr>
                    <th className="px-5 py-3">Visitor</th>
                    <th className="px-5 py-3">Payment Method</th>
                    <th className="px-5 py-3">Reference</th>
                    <th className="px-5 py-3 text-right">Amount</th>
                    <th className="px-5 py-3 text-center">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {rodRecords.map((record) => (
                    <tr key={record.id}>
                      <td className="px-5 py-4 font-medium">
                        {record.visitor_name || 'Walk-in Visitor'}
                      </td>

                      <td className="px-5 py-4 capitalize">
                        {record.payment_method}
                      </td>

                      <td className="px-5 py-4 text-gray-500">
                        {record.reference_number || '—'}
                      </td>

                      <td className="px-5 py-4 text-right font-semibold text-emerald-600">
                        {money(record.amount)}
                      </td>

                      <td className="px-5 py-4 text-center">
                        <button
                          type="button"
                          onClick={() => startEditingRod(record)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 px-3 py-2 text-xs font-medium text-emerald-700 transition hover:bg-emerald-50"
                        >
                          <Pencil size={14} />
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>

              </table>

              {rodRecords.length === 0 && (
                <p className="py-10 text-center text-sm text-gray-400">
                  No rod fishing entries for this date.
                </p>
              )}

            </div>
          </div>

        </div>
      )}

      {/* ========================================== */}
      {/* EDIT LOCAL FISHING MODAL */}
      {/* ========================================== */}

      {editingFishingId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-xl">

            <div className="sticky top-0 flex items-center justify-between border-b border-gray-100 bg-white px-5 py-4">

              <div>
                <h2 className="font-semibold text-gray-800">
                  Edit Local Fishing Record
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  Record ID: {editingFishingId}
                </p>
              </div>

              <button
                type="button"
                onClick={cancelFishingEdit}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
              >
                <X size={20} />
              </button>

            </div>

            <form
              onSubmit={updateFishingRecord}
              className="space-y-5 p-5"
            >

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                <Select
                  label="Fisherman"
                  value={fishingForm.fisherman_id}
                  onChange={(e) =>
                    setFishingForm((prev) => ({
                      ...prev,
                      fisherman_id: e.target.value,
                    }))
                  }
                  required
                >
                  <option value="">Select fisherman</option>

                  {fishermen.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.fisherman_name}
                    </option>
                  ))}
                </Select>

                <Select
                  label="Fish Species"
                  value={fishingForm.fish_species_id}
                  onChange={(e) =>
                    setFishingForm((prev) => ({
                      ...prev,
                      fish_species_id: e.target.value,
                    }))
                  }
                  required
                >
                  <option value="">Select species</option>

                  {species.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.species_name}
                    </option>
                  ))}
                </Select>

                <Select
                  label="Fishing Session"
                  value={fishingForm.session}
                  onChange={(e) =>
                    setFishingForm((prev) => ({
                      ...prev,
                      session: e.target.value,
                    }))
                  }
                  required
                >
                  <option value="morning">Morning</option>
                  <option value="afternoon">Afternoon</option>
                </Select>

                <Input
                  label="Fishing Date"
                  type="date"
                  value={fishingForm.fishing_date}
                  onChange={(e) =>
                    setFishingForm((prev) => ({
                      ...prev,
                      fishing_date: e.target.value,
                    }))
                  }
                  required
                />

                <Input
                  label="Quantity (KG)"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={fishingForm.quantity_kg}
                  onChange={(e) =>
                    setFishingForm((prev) => ({
                      ...prev,
                      quantity_kg: e.target.value,
                    }))
                  }
                  required
                />

                <Input
                  label="Price Per KG (৳)"
                  type="number"
                  min="0"
                  step="0.01"
                  value={fishingForm.price_per_kg}
                  onChange={(e) =>
                    setFishingForm((prev) => ({
                      ...prev,
                      price_per_kg: e.target.value,
                    }))
                  }
                  required
                />

              </div>

              <Input
                label="Notes (Optional)"
                value={fishingForm.notes}
                onChange={(e) =>
                  setFishingForm((prev) => ({
                    ...prev,
                    notes: e.target.value,
                  }))
                }
                placeholder="Additional information"
              />

              {/* LIVE CALCULATION */}

              <div className="rounded-xl bg-emerald-50 p-4 text-sm">

                <p className="text-gray-600">
                  Total Fish Value:{' '}
                  <strong>
                    {money(
                      Number(fishingForm.quantity_kg || 0) *
                        Number(fishingForm.price_per_kg || 0)
                    )}
                  </strong>
                </p>

                <p className="mt-1 text-emerald-700">
                  Owner Share (50%):{' '}
                  <strong>
                    {money(
                      (Number(fishingForm.quantity_kg || 0) *
                        Number(fishingForm.price_per_kg || 0)) /
                        2
                    )}
                  </strong>
                </p>

                <p className="mt-1 text-gray-600">
                  Fisherman Share (50%):{' '}
                  <strong>
                    {money(
                      (Number(fishingForm.quantity_kg || 0) *
                        Number(fishingForm.price_per_kg || 0)) /
                        2
                    )}
                  </strong>
                </p>

              </div>

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

                <button
                  type="button"
                  onClick={cancelFishingEdit}
                  disabled={savingEdit}
                  className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={savingEdit}
                  className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  <RefreshCw
                    size={16}
                    className={savingEdit ? 'animate-spin' : ''}
                  />

                  {savingEdit ? 'Updating...' : 'Update Fishing Record'}
                </button>

              </div>

            </form>

          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* EDIT ROD FISHING MODAL */}
      {/* ========================================== */}

      {editingRodId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl">

            <div className="sticky top-0 flex items-center justify-between border-b border-gray-100 bg-white px-5 py-4">

              <div>
                <h2 className="font-semibold text-gray-800">
                  Edit Rod Fishing Entry
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  Record ID: {editingRodId}
                </p>
              </div>

              <button
                type="button"
                onClick={cancelRodEdit}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
              >
                <X size={20} />
              </button>

            </div>

            <form
              onSubmit={updateRodEntry}
              className="space-y-5 p-5"
            >

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                <Input
                  label="Date"
                  type="date"
                  value={rodForm.fishing_date}
                  onChange={(e) =>
                    setRodForm((prev) => ({
                      ...prev,
                      fishing_date: e.target.value,
                    }))
                  }
                  required
                />

                <Input
                  label="Visitor Name (Optional)"
                  value={rodForm.visitor_name}
                  onChange={(e) =>
                    setRodForm((prev) => ({
                      ...prev,
                      visitor_name: e.target.value,
                    }))
                  }
                  placeholder="Visitor name"
                />

                <Input
                  label="Received Amount (৳)"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={rodForm.amount}
                  onChange={(e) =>
                    setRodForm((prev) => ({
                      ...prev,
                      amount: e.target.value,
                    }))
                  }
                  required
                />

                <Select
                  label="Payment Method"
                  value={rodForm.payment_method}
                  onChange={(e) =>
                    setRodForm((prev) => ({
                      ...prev,
                      payment_method: e.target.value,
                    }))
                  }
                  required
                >
                  <option value="cash">Cash</option>
                  <option value="bkash">bKash</option>
                  <option value="nagad">Nagad</option>
                  <option value="bank">Bank</option>
                  <option value="other">Other</option>
                </Select>

                <Input
                  label="Reference Number (Optional)"
                  value={rodForm.reference_number}
                  onChange={(e) =>
                    setRodForm((prev) => ({
                      ...prev,
                      reference_number: e.target.value,
                    }))
                  }
                  placeholder="Transaction reference"
                />

                <Input
                  label="Notes (Optional)"
                  value={rodForm.notes}
                  onChange={(e) =>
                    setRodForm((prev) => ({
                      ...prev,
                      notes: e.target.value,
                    }))
                  }
                  placeholder="Additional information"
                />

              </div>

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

                <button
                  type="button"
                  onClick={cancelRodEdit}
                  disabled={savingEdit}
                  className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={savingEdit}
                  className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  <RefreshCw
                    size={16}
                    className={savingEdit ? 'animate-spin' : ''}
                  />

                  {savingEdit ? 'Updating...' : 'Update Rod Fishing Entry'}
                </button>

              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  )
}

export default LakeManagement
