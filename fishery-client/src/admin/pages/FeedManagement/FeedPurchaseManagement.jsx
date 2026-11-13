import { useEffect, useState } from 'react'
import {
  Plus,
  Search,
  RefreshCw,
  Pencil,
  ShoppingBag,
  Package,
  Wallet,
  X,
  LoaderCircle,
  CalendarDays,
  Truck,
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
  feed_type_id: '',
  supplier_id: '',
  purchase_date: getToday(),
  quantity_kg: '',
  unit_price: '',
  invoice_number: '',
  notes: '',
}

const formatMoney = (amount) => {
  return `৳${Number(amount || 0).toLocaleString('en-BD', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

const FeedPurchaseManagement = () => {
  const [purchases, setPurchases] = useState([])
  const [feedTypes, setFeedTypes] = useState([])
  const [suppliers, setSuppliers] = useState([])

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingPurchase, setEditingPurchase] = useState(null)

  const [form, setForm] = useState(initialForm)

  const fetchData = async () => {
    try {
      setLoading(true)

      const [purchaseResponse, feedResponse, supplierResponse] =
        await Promise.all([
          api.get('/feed-purchases'),
          api.get('/feed-types'),
          api.get('/feed-suppliers'),
        ])

      setPurchases(purchaseResponse.data.purchases || [])
      setFeedTypes(
        (feedResponse.data.feedTypes || []).filter(
          (item) => item.status === 'active'
        )
      )
      setSuppliers(
        (supplierResponse.data.suppliers || []).filter(
          (item) => item.status === 'active'
        )
      )
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          'Failed to load purchase information.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const filteredPurchases = purchases.filter((purchase) => {
    const searchText = search.toLowerCase()

    return (
      purchase.feed_name?.toLowerCase().includes(searchText) ||
      purchase.brand?.toLowerCase().includes(searchText) ||
      purchase.supplier_name?.toLowerCase().includes(searchText) ||
      purchase.invoice_number?.toLowerCase().includes(searchText)
    )
  })

  const totalPurchased = purchases.reduce(
    (sum, item) => sum + Number(item.quantity_kg || 0),
    0
  )

  const totalPurchaseCost = purchases.reduce(
    (sum, item) => sum + Number(item.total_cost || 0),
    0
  )

  const calculatedTotal =
    Number(form.quantity_kg || 0) *
    Number(form.unit_price || 0)

  const openAddModal = () => {
    setEditingPurchase(null)
    setForm({
      ...initialForm,
      purchase_date: getToday(),
    })
    setShowModal(true)
  }

  const openEditModal = (purchase) => {
    setEditingPurchase(purchase)

    setForm({
      feed_type_id: String(purchase.feed_type_id),
      supplier_id: purchase.supplier_id
        ? String(purchase.supplier_id)
        : '',
      purchase_date: purchase.purchase_date
        ? String(purchase.purchase_date).slice(0, 10)
        : getToday(),
      quantity_kg: String(purchase.quantity_kg || ''),
      unit_price: String(purchase.unit_price || ''),
      invoice_number: purchase.invoice_number || '',
      notes: purchase.notes || '',
    })

    setShowModal(true)
  }

  const handleChange = (e) => {
    const { name, value } = e.target

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!form.feed_type_id) {
      toast.error('Please select a feed type.')
      return
    }

    if (!form.quantity_kg || Number(form.quantity_kg) <= 0) {
      toast.error('Quantity must be greater than zero.')
      return
    }

    if (
      form.unit_price === '' ||
      Number(form.unit_price) < 0
    ) {
      toast.error('Please enter a valid unit price.')
      return
    }

    const payload = {
      ...form,
      feed_type_id: Number(form.feed_type_id),
      supplier_id: form.supplier_id
        ? Number(form.supplier_id)
        : null,
      quantity_kg: Number(form.quantity_kg),
      unit_price: Number(form.unit_price),
    }

    try {
      setSaving(true)

      if (editingPurchase) {
        await api.put(
          `/feed-purchases/${editingPurchase.id}`,
          payload
        )

        toast.success('Purchase updated successfully.')
      } else {
        await api.post('/feed-purchases', payload)

        toast.success('Feed purchase recorded successfully.')
      }

      setShowModal(false)
      setEditingPurchase(null)
      setForm(initialForm)

      await fetchData()
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          'Failed to save feed purchase.'
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="mb-1 text-sm font-medium text-emerald-700">
            Feed Management / Purchases
          </p>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Feed Purchases
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Record and manage all purchased fish feed.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800"
        >
          <Plus size={18} />
          Record Purchase
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">
              Total Purchase Records
            </p>
            <ShoppingBag size={21} className="text-emerald-700" />
          </div>

          <h2 className="mt-3 text-3xl font-bold text-slate-900">
            {purchases.length}
          </h2>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">
              Total Feed Purchased
            </p>
            <Package size={21} className="text-emerald-700" />
          </div>

          <h2 className="mt-3 text-3xl font-bold text-slate-900">
            {totalPurchased.toLocaleString('en-BD', {
              maximumFractionDigits: 3,
            })}{' '}
            <span className="text-base font-medium text-slate-500">
              kg
            </span>
          </h2>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">
              Total Purchase Cost
            </p>
            <Wallet size={21} className="text-emerald-700" />
          </div>

          <h2 className="mt-3 text-2xl font-bold text-slate-900">
            {formatMoney(totalPurchaseCost)}
          </h2>
        </div>
      </div>

      {/* Purchase History */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="flex flex-col justify-between gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-bold text-slate-900">
              Purchase History
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              All recorded feed purchases
            </p>
          </div>

          <div className="flex gap-2">
            <div className="relative">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search purchases..."
                className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-emerald-600 sm:w-64"
              />
            </div>

            <button
              onClick={fetchData}
              disabled={loading}
              title="Refresh"
              className="rounded-xl border border-slate-200 p-2.5 text-slate-600 transition hover:bg-slate-50"
            >
              <RefreshCw
                size={17}
                className={loading ? 'animate-spin' : ''}
              />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-4 font-semibold">Feed Type</th>
                <th className="px-5 py-4 font-semibold">Supplier</th>
                <th className="px-5 py-4 font-semibold">Date</th>
                <th className="px-5 py-4 font-semibold">Quantity</th>
                <th className="px-5 py-4 font-semibold">Unit Price</th>
                <th className="px-5 py-4 font-semibold">Total Cost</th>
                <th className="px-5 py-4 font-semibold">Invoice</th>
                <th className="px-5 py-4 text-right font-semibold">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-5 py-16 text-center">
                    <LoaderCircle
                      className="mx-auto animate-spin text-emerald-700"
                      size={26}
                    />

                    <p className="mt-2 text-sm text-slate-500">
                      Loading purchase records...
                    </p>
                  </td>
                </tr>
              ) : filteredPurchases.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-5 py-16 text-center">
                    <ShoppingBag
                      size={34}
                      className="mx-auto text-slate-300"
                    />

                    <p className="mt-3 font-semibold text-slate-700">
                      {search
                        ? 'No matching purchases found'
                        : 'No purchase records yet'}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      {search
                        ? 'Try another search term.'
                        : 'Record your first feed purchase to get started.'}
                    </p>

                    {!search && (
                      <button
                        onClick={openAddModal}
                        className="mt-4 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
                      >
                        + Record First Purchase
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                filteredPurchases.map((purchase) => (
                  <tr
                    key={purchase.id}
                    className="transition hover:bg-slate-50/70"
                  >
                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-800">
                        {purchase.feed_name}
                      </div>

                      {purchase.brand && (
                        <div className="mt-1 text-xs text-slate-400">
                          {purchase.brand}
                        </div>
                      )}
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {purchase.supplier_name || 'Not specified'}
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {purchase.purchase_date
                        ? new Date(
                            `${String(purchase.purchase_date).slice(0, 10)}T00:00:00`
                          ).toLocaleDateString('en-GB')
                        : '—'}
                    </td>

                    <td className="px-5 py-4 font-medium text-slate-700">
                      {Number(purchase.quantity_kg).toLocaleString('en-BD', {
                        maximumFractionDigits: 3,
                      })}{' '}
                      kg
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {formatMoney(purchase.unit_price)}
                    </td>

                    <td className="px-5 py-4 font-semibold text-slate-900">
                      {formatMoney(purchase.total_cost)}
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {purchase.invoice_number || '—'}
                    </td>

                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => openEditModal(purchase)}
                        title="Edit purchase"
                        className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                      >
                        <Pencil size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && purchases.length > 0 && (
          <div className="border-t border-slate-100 px-5 py-3 text-xs text-slate-500">
            Showing {filteredPurchases.length} of {purchases.length} purchase records
          </div>
        )}
      </div>

      {/* Add/Edit Purchase Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {editingPurchase
                    ? 'Edit Feed Purchase'
                    : 'Record New Feed Purchase'}
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Enter the purchased feed information.
                </p>
              </div>

              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={19} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 p-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Feed Type */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Feed Type *
                  </label>

                  <select
                    name="feed_type_id"
                    value={form.feed_type_id}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-600"
                  >
                    <option value="">Select Feed Type</option>

                    {feedTypes.map((feed) => (
                      <option key={feed.id} value={feed.id}>
                        {feed.feed_name}
                        {feed.brand ? ` - ${feed.brand}` : ''}
                      </option>
                    ))}
                  </select>

                  {feedTypes.length === 0 && (
                    <p className="mt-1 text-xs text-amber-600">
                      Add an active feed type first.
                    </p>
                  )}
                </div>

                {/* Supplier */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Supplier
                  </label>

                  <select
                    name="supplier_id"
                    value={form.supplier_id}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-600"
                  >
                    <option value="">Select Supplier (Optional)</option>

                    {suppliers.map((supplier) => (
                      <option key={supplier.id} value={supplier.id}>
                        {supplier.supplier_name}
                      </option>
                    ))}
                  </select>

                  {suppliers.length === 0 && (
                    <p className="mt-1 text-xs text-slate-400">
                      No active suppliers available.
                    </p>
                  )}
                </div>

                {/* Purchase Date */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Purchase Date *
                  </label>

                  <div className="relative">
                    <CalendarDays
                      size={17}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="date"
                      name="purchase_date"
                      value={form.purchase_date}
                      onChange={handleChange}
                      required
                      className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>

                {/* Quantity */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Quantity (kg) *
                  </label>

                  <input
                    type="number"
                    name="quantity_kg"
                    value={form.quantity_kg}
                    onChange={handleChange}
                    min="0.001"
                    step="0.001"
                    required
                    placeholder="e.g. 100"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-600"
                  />
                </div>

                {/* Unit Price */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Unit Price (৳/kg) *
                  </label>

                  <input
                    type="number"
                    name="unit_price"
                    value={form.unit_price}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    required
                    placeholder="e.g. 65"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-600"
                  />
                </div>

                {/* Invoice */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Invoice Number
                  </label>

                  <input
                    type="text"
                    name="invoice_number"
                    value={form.invoice_number}
                    onChange={handleChange}
                    maxLength={100}
                    placeholder="e.g. INV-2026-001"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              {/* Total Cost Preview */}
              <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-emerald-800">
                      Estimated Total Cost
                    </p>

                    <p className="mt-1 text-xs text-emerald-700">
                      Quantity × Unit Price
                    </p>
                  </div>

                  <h3 className="text-xl font-bold text-emerald-900">
                    {formatMoney(calculatedTotal)}
                  </h3>
                </div>

                <p className="mt-2 text-xs text-emerald-700">
                  Final total will be calculated and saved by the backend.
                </p>
              </div>

              {/* Notes */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Notes
                </label>

                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Additional purchase information..."
                  className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-600"
                />
              </div>

              {/* Actions */}
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
                  disabled={saving || feedTypes.length === 0}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving && (
                    <LoaderCircle
                      size={16}
                      className="animate-spin"
                    />
                  )}

                  {editingPurchase
                    ? 'Save Changes'
                    : 'Record Purchase'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default FeedPurchaseManagement