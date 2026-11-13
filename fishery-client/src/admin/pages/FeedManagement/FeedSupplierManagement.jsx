import { useEffect, useState } from 'react'
import {
  Plus,
  Search,
  RefreshCw,
  Pencil,
  Truck,
  Phone,
  Mail,
  MapPin,
  X,
  LoaderCircle,
  Users,
} from 'lucide-react'
import { toast } from 'sonner'
import api from '../../../services/api'

const initialForm = {
  supplier_name: '',
  phone: '',
  email: '',
  address: '',
}

const FeedSupplierManagement = () => {
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(initialForm)

  const fetchSuppliers = async () => {
    try {
      setLoading(true)

      const { data } = await api.get('/feed-suppliers')

      setSuppliers(data.suppliers || [])
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Failed to load suppliers.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSuppliers()
  }, [])

  const filteredSuppliers = suppliers.filter((supplier) => {
    const searchText = search.toLowerCase()

    return (
      supplier.supplier_name?.toLowerCase().includes(searchText) ||
      supplier.phone?.toLowerCase().includes(searchText) ||
      supplier.email?.toLowerCase().includes(searchText)
    )
  })

  const openAddModal = () => {
    setEditingSupplier(null)
    setForm(initialForm)
    setShowModal(true)
  }

  const openEditModal = (supplier) => {
    setEditingSupplier(supplier)

    setForm({
      supplier_name: supplier.supplier_name || '',
      phone: supplier.phone || '',
      email: supplier.email || '',
      address: supplier.address || '',
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

    try {
      setSaving(true)

      if (editingSupplier) {
        await api.put(
          `/feed-suppliers/${editingSupplier.id}`,
          form
        )

        toast.success('Supplier updated successfully.')
      } else {
        await api.post('/feed-suppliers', form)

        toast.success('Supplier added successfully.')
      }

      setShowModal(false)
      setForm(initialForm)
      setEditingSupplier(null)

      await fetchSuppliers()
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Something went wrong.'
      )
    } finally {
      setSaving(false)
    }
  }

  const handleStatusChange = async (supplier) => {
    const newStatus =
      supplier.status === 'active' ? 'inactive' : 'active'

    try {
      await api.patch(`/feed-suppliers/${supplier.id}/status`, {
        status: newStatus,
      })

      toast.success(`Supplier ${newStatus} successfully.`)

      await fetchSuppliers()
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Failed to update status.'
      )
    }
  }

  const activeCount = suppliers.filter(
    (supplier) => supplier.status === 'active'
  ).length

  const inactiveCount = suppliers.length - activeCount

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="mb-1 text-sm font-medium text-emerald-700">
            Feed Management / Suppliers
          </p>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Feed Suppliers
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage the businesses and people supplying fish feed.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800"
        >
          <Plus size={18} />
          Add Supplier
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">
              Total Suppliers
            </p>
            <Users className="text-emerald-700" size={21} />
          </div>

          <h2 className="mt-3 text-3xl font-bold text-slate-900">
            {suppliers.length}
          </h2>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">
              Active Suppliers
            </p>
            <Truck className="text-emerald-700" size={21} />
          </div>

          <h2 className="mt-3 text-3xl font-bold text-slate-900">
            {activeCount}
          </h2>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">
              Inactive Suppliers
            </p>
            <Users className="text-slate-400" size={21} />
          </div>

          <h2 className="mt-3 text-3xl font-bold text-slate-900">
            {inactiveCount}
          </h2>
        </div>
      </div>

      {/* Supplier Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="flex flex-col justify-between gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-bold text-slate-900">
              Supplier Directory
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              All registered feed suppliers
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
                placeholder="Search suppliers..."
                className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-emerald-600 sm:w-64"
              />
            </div>

            <button
              onClick={fetchSuppliers}
              disabled={loading}
              className="rounded-xl border border-slate-200 p-2.5 text-slate-600 transition hover:bg-slate-50"
              title="Refresh"
            >
              <RefreshCw
                size={17}
                className={loading ? 'animate-spin' : ''}
              />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[750px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-4 font-semibold">Supplier</th>
                <th className="px-5 py-4 font-semibold">Phone</th>
                <th className="px-5 py-4 font-semibold">Email</th>
                <th className="px-5 py-4 font-semibold">Address</th>
                <th className="px-5 py-4 font-semibold">Status</th>
                <th className="px-5 py-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-5 py-16 text-center">
                    <LoaderCircle
                      className="mx-auto animate-spin text-emerald-700"
                      size={26}
                    />
                    <p className="mt-2 text-sm text-slate-500">
                      Loading suppliers...
                    </p>
                  </td>
                </tr>
              ) : filteredSuppliers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-5 py-16 text-center">
                    <Truck
                      size={34}
                      className="mx-auto text-slate-300"
                    />

                    <p className="mt-3 font-semibold text-slate-700">
                      {search
                        ? 'No matching suppliers found'
                        : 'No suppliers added yet'}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      {search
                        ? 'Try another search term.'
                        : 'Add your first feed supplier to get started.'}
                    </p>

                    {!search && (
                      <button
                        onClick={openAddModal}
                        className="mt-4 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
                      >
                        + Add First Supplier
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                filteredSuppliers.map((supplier) => (
                  <tr
                    key={supplier.id}
                    className="transition hover:bg-slate-50/70"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                          <Truck size={19} />
                        </div>

                        <span className="font-semibold text-slate-800">
                          {supplier.supplier_name}
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {supplier.phone || '—'}
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {supplier.email || '—'}
                    </td>

                    <td className="max-w-[200px] px-5 py-4 text-slate-600">
                      <span className="line-clamp-2">
                        {supplier.address || '—'}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <button
                        onClick={() => handleStatusChange(supplier)}
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          supplier.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {supplier.status}
                      </button>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => openEditModal(supplier)}
                        className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                        title="Edit supplier"
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

        {!loading && suppliers.length > 0 && (
          <div className="border-t border-slate-100 px-5 py-3 text-xs text-slate-500">
            Showing {filteredSuppliers.length} of {suppliers.length} suppliers
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Enter the supplier's contact information.
                </p>
              </div>

              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={19} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 p-6">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Supplier Name *
                </label>

                <input
                  type="text"
                  name="supplier_name"
                  value={form.supplier_name}
                  onChange={handleChange}
                  placeholder="e.g. Rahman Fish Feed Traders"
                  required
                  maxLength={150}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Phone Number
                </label>

                <div className="relative">
                  <Phone
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="01XXXXXXXXX"
                    maxLength={20}
                    className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Email Address
                </label>

                <div className="relative">
                  <Mail
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="supplier@example.com"
                    maxLength={150}
                    className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Address
                </label>

                <div className="relative">
                  <MapPin
                    size={17}
                    className="absolute left-3 top-3 text-slate-400"
                  />

                  <textarea
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Supplier's business address..."
                    className="w-full resize-none rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-emerald-600"
                  />
                </div>
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
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving && (
                    <LoaderCircle size={16} className="animate-spin" />
                  )}

                  {editingSupplier ? 'Save Changes' : 'Add Supplier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default FeedSupplierManagement