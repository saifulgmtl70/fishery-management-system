
import { useEffect, useState } from 'react'
import {
  Users,
  UserRoundPlus,
  Search,
  RefreshCw,
  Pencil,
  Power,
  X,
  Save,
  LoaderCircle,
  Phone,
  Mail,
  MapPin,
  Building2,
  UserRound,
  Store,
  UsersRound,
} from 'lucide-react'
import { toast } from 'sonner'
import api from '../../../services/api'

function DealerManagement() {
  const [dealers, setDealers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingDealer, setEditingDealer] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    dealer_name: '',
    contact_person: '',
    phone: '',
    email: '',
    address: '',
    notes: '',
  })

  // ==========================================
  // FETCH ALL DEALERS
  // ==========================================

  const fetchDealers = async () => {
    try {
      setLoading(true)

      const response = await api.get('/dealers')

      setDealers(response.data.dealers || [])
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Failed to load dealers.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDealers()
  }, [])

  // ==========================================
  // SEARCH DEALERS
  // ==========================================

  const filteredDealers = dealers.filter((item) =>
    [
      item.dealer_name,
      item.contact_person,
      item.phone,
      item.email,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  )

  // ==========================================
  // OPEN ADD FORM
  // ==========================================

  const openAddForm = () => {
    setEditingDealer(null)

    setFormData({
      dealer_name: '',
      contact_person: '',
      phone: '',
      email: '',
      address: '',
      notes: '',
    })

    setShowForm(true)
  }

  // ==========================================
  // OPEN EDIT FORM
  // ==========================================

  const openEditForm = (item) => {
    setEditingDealer(item)

    setFormData({
      dealer_name: item.dealer_name || '',
      contact_person: item.contact_person || '',
      phone: item.phone || '',
      email: item.email || '',
      address: item.address || '',
      notes: item.notes || '',
    })

    setShowForm(true)
  }

  // ==========================================
  // HANDLE FORM CHANGE
  // ==========================================

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  // ==========================================
  // CREATE / UPDATE DEALER
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.dealer_name.trim()) {
      toast.error('Please enter a dealer name.')
      return
    }

    if (formData.dealer_name.trim().length < 2) {
      toast.error('Dealer name must contain at least 2 characters.')
      return
    }

    try {
      setSubmitting(true)

      const dealerData = {
        dealer_name: formData.dealer_name.trim(),
        contact_person: formData.contact_person.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        address: formData.address.trim(),
        notes: formData.notes.trim(),
      }

      if (editingDealer) {
        await api.put(
          `/dealers/${editingDealer.id}`,
          dealerData
        )

        toast.success('Dealer updated successfully.')
      } else {
        await api.post('/dealers', dealerData)

        toast.success('New dealer added successfully.')
      }

      setShowForm(false)
      setEditingDealer(null)

      await fetchDealers()
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Something went wrong.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  // ==========================================
  // TOGGLE DEALER STATUS
  // ==========================================

  const toggleStatus = async (item) => {
    const newStatus =
      item.status === 'active' ? 'inactive' : 'active'

    try {
      await api.patch(`/dealers/${item.id}/status`, {
        status: newStatus,
      })

      toast.success(`Dealer ${newStatus} successfully.`)

      await fetchDealers()
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Failed to update dealer status.'
      )
    }
  }

  // ==========================================
  // DEALER STATISTICS
  // ==========================================

  const activeCount = dealers.filter(
    (item) => item.status === 'active'
  ).length

  const inactiveCount = dealers.length - activeCount

  // ==========================================
  // INPUT FIELD COMPONENT
  // ==========================================

  const inputClass =
    'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100'

  return (
    <div className="space-y-6">

      {/* ======================================
          PAGE HEADER
      ====================================== */}

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-emerald-700">
              Business Operations
            </p>

            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
              Admin
            </span>
          </div>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            Dealer Management
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage your wholesale fish dealers and business contacts.
          </p>
        </div>

        <button
          onClick={openAddForm}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800"
        >
          <UserRoundPlus size={18} />
          Add New Dealer
        </button>
      </div>

      {/* ======================================
          STATISTICS
      ====================================== */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Total Dealers
              </p>

              <p className="mt-2 text-3xl font-bold text-slate-900">
                {dealers.length}
              </p>
            </div>

            <div className="rounded-xl bg-blue-50 p-3 text-blue-700">
              <Users size={23} />
            </div>
          </div>

          <p className="mt-3 text-xs text-slate-400">
            All registered business contacts
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Active Dealers
              </p>

              <p className="mt-2 text-3xl font-bold text-emerald-700">
                {activeCount}
              </p>
            </div>

            <div className="rounded-xl bg-emerald-50 p-3 text-emerald-700">
              <UserRound size={23} />
            </div>
          </div>

          <p className="mt-3 text-xs text-slate-400">
            Currently available for business
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:col-span-2 xl:col-span-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Inactive Dealers
              </p>

              <p className="mt-2 text-3xl font-bold text-slate-500">
                {inactiveCount}
              </p>
            </div>

            <div className="rounded-xl bg-slate-100 p-3 text-slate-500">
              <UsersRound size={23} />
            </div>
          </div>

          <p className="mt-3 text-xs text-slate-400">
            Temporarily unavailable dealers
          </p>
        </div>

      </div>

      {/* ======================================
          DEALER DIRECTORY
      ====================================== */}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">

        <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center">

          <div>
            <h2 className="font-semibold text-slate-900">
              Dealer Directory
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              View and manage all registered dealers.
            </p>
          </div>

          <div className="flex gap-2">

            <div className="relative flex-1 sm:w-72">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search dealer, phone or email..."
                className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-emerald-600"
              />
            </div>

            <button
              onClick={fetchDealers}
              disabled={loading}
              className="rounded-xl border border-slate-200 px-3 text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
              title="Refresh dealers"
            >
              <RefreshCw
                size={17}
                className={loading ? 'animate-spin' : ''}
              />
            </button>

          </div>
        </div>

        {/* ======================================
            LOADING STATE
        ====================================== */}

        {loading ? (
          <div className="flex justify-center py-20">
            <LoaderCircle
              className="animate-spin text-emerald-700"
              size={30}
            />
          </div>

        ) : filteredDealers.length === 0 ? (

          /* ======================================
              EMPTY STATE
          ====================================== */

          <div className="px-5 py-20 text-center">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
              <Store size={30} />
            </div>

            <h3 className="mt-4 font-semibold text-slate-800">
              {searchTerm ? 'No dealers found' : 'No dealers registered yet'}
            </h3>

            <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">
              {searchTerm
                ? 'Try another search term.'
                : 'Start building your dealer network by adding your first wholesale dealer.'}
            </p>

            {!searchTerm && (
              <button
                onClick={openAddForm}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800"
              >
                <UserRoundPlus size={17} />
                Add First Dealer
              </button>
            )}

          </div>

        ) : (

          /* ======================================
              DEALER TABLE
          ====================================== */

          <div className="overflow-x-auto">

            <table className="w-full min-w-[850px] text-left text-sm">

              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-4">Dealer Information</th>
                  <th className="px-5 py-4">Contact Details</th>
                  <th className="px-5 py-4">Address</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">

                {filteredDealers.map((item) => (

                  <tr
                    key={item.id}
                    className="transition hover:bg-slate-50/80"
                  >

                    {/* Dealer Information */}

                    <td className="px-5 py-4">

                      <div className="flex items-center gap-3">

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                          <Building2 size={19} />
                        </div>

                        <div>
                          <p className="font-semibold text-slate-800">
                            {item.dealer_name}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            Dealer ID: #{item.id}
                          </p>
                        </div>

                      </div>

                    </td>

                    {/* Contact Details */}

                    <td className="px-5 py-4">

                      <div className="space-y-1.5">

                        {item.contact_person && (
                          <p className="flex items-center gap-2 text-slate-700">
                            <UserRound size={14} className="text-slate-400" />
                            {item.contact_person}
                          </p>
                        )}

                        {item.phone && (
                          <p className="flex items-center gap-2 text-slate-500">
                            <Phone size={14} className="text-slate-400" />
                            {item.phone}
                          </p>
                        )}

                        {item.email && (
                          <p className="flex items-center gap-2 text-xs text-slate-500">
                            <Mail size={14} className="text-slate-400" />
                            {item.email}
                          </p>
                        )}

                        {!item.contact_person && !item.phone && !item.email && (
                          <span className="text-slate-400">—</span>
                        )}

                      </div>

                    </td>

                    {/* Address */}

                    <td className="max-w-[220px] px-5 py-4">

                      <div className="flex items-start gap-2 text-slate-500">
                        <MapPin
                          size={15}
                          className="mt-0.5 shrink-0 text-slate-400"
                        />

                        <span className="line-clamp-2">
                          {item.address || 'Not provided'}
                        </span>
                      </div>

                    </td>

                    {/* Status */}

                    <td className="px-5 py-4">

                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                          item.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            item.status === 'active'
                              ? 'bg-emerald-600'
                              : 'bg-slate-400'
                          }`}
                        />

                        {item.status}
                      </span>

                    </td>

                    {/* Actions */}

                    <td className="px-5 py-4">

                      <div className="flex justify-end gap-2">

                        <button
                          onClick={() => openEditForm(item)}
                          className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                          title="Edit dealer"
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          onClick={() => toggleStatus(item)}
                          className={`rounded-lg border p-2 transition ${
                            item.status === 'active'
                              ? 'border-red-100 text-red-600 hover:bg-red-50'
                              : 'border-emerald-100 text-emerald-700 hover:bg-emerald-50'
                          }`}
                          title={
                            item.status === 'active'
                              ? 'Deactivate dealer'
                              : 'Activate dealer'
                          }
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

        {/* TABLE FOOTER */}

        {!loading && filteredDealers.length > 0 && (
          <div className="border-t border-slate-100 px-5 py-3">
            <p className="text-xs text-slate-500">
              Showing {filteredDealers.length} of {dealers.length} dealers
            </p>
          </div>
        )}

      </div>

      {/* ======================================
          ADD / EDIT DEALER MODAL
      ====================================== */}

      {showForm && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-[2px]">

          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">

            {/* Modal Header */}

            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white p-5">

              <div className="flex items-center gap-3">

                <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-700">
                  <Building2 size={21} />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    {editingDealer ? 'Edit Dealer' : 'Add New Dealer'}
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Enter the dealer's business information.
                  </p>
                </div>

              </div>

              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100"
                title="Close"
              >
                <X size={19} />
              </button>

            </div>

            {/* Modal Form */}

            <form
              onSubmit={handleSubmit}
              className="space-y-5 p-5"
            >

              {/* Business Information */}

              <div>

                <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-emerald-700">
                  Business Information
                </h3>

                <div className="grid gap-4 sm:grid-cols-2">

                  <div className="sm:col-span-2">

                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Dealer / Business Name *
                    </label>

                    <input
                      name="dealer_name"
                      value={formData.dealer_name}
                      onChange={handleChange}
                      placeholder="e.g. Rahman Fish Traders"
                      required
                      minLength={2}
                      maxLength={150}
                      className={inputClass}
                    />

                  </div>

                  <div>

                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Contact Person
                    </label>

                    <input
                      name="contact_person"
                      value={formData.contact_person}
                      onChange={handleChange}
                      placeholder="Person's full name"
                      maxLength={150}
                      className={inputClass}
                    />

                  </div>

                  <div>

                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Phone Number
                    </label>

                    <input
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="01XXXXXXXXX"
                      maxLength={20}
                      className={inputClass}
                    />

                  </div>

                  <div className="sm:col-span-2">

                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Email Address
                    </label>

                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="dealer@example.com"
                      maxLength={150}
                      className={inputClass}
                    />

                  </div>

                </div>

              </div>

              <div className="border-t border-slate-100" />

              {/* Address */}

              <div>

                <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-emerald-700">
                  Location & Additional Information
                </h3>

                <div className="space-y-4">

                  <div>

                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Business Address
                    </label>

                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      rows={2}
                      placeholder="Dealer's business address..."
                      className={inputClass}
                    />

                  </div>

                  <div>

                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Notes
                    </label>

                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      rows={3}
                      placeholder="Additional information about this dealer..."
                      className={inputClass}
                    />

                  </div>

                </div>

              </div>

              {/* Modal Footer */}

              <div className="flex flex-col-reverse justify-end gap-3 border-t border-slate-100 pt-4 sm:flex-row">

                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  disabled={submitting}
                  className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? (
                    <LoaderCircle size={17} className="animate-spin" />
                  ) : (
                    <Save size={17} />
                  )}

                  {submitting
                    ? 'Saving...'
                    : editingDealer
                      ? 'Update Dealer'
                      : 'Save Dealer'}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  )
}

export default DealerManagement
