import { useEffect, useState } from 'react'
import {
  Users,
  Plus,
  RefreshCw,
  Search,
  Pencil,
  UserCheck,
  UserX,
  Wallet,
  CalendarDays,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import api from '../../../services/api'

// ==========================================
// HELPERS
// ==========================================

const formatMoney = (amount) =>
  `৳${Number(amount || 0).toLocaleString('en-BD', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`

const emptyForm = {
  name: '',
  phone: '',
  address: '',
  designation: '',
  joining_date: '',
  monthly_salary: '',
}

const currentMonth = () => {
  const date = new Date()

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

const getErrorMessage = (error) =>
  error?.response?.data?.message ||
  error?.response?.data?.errors?.[0]?.message ||
  error?.message ||
  'Something went wrong.'

// ==========================================
// MAIN COMPONENT
// ==========================================

function StaffManagement() {
  const [staff, setStaff] = useState([])
  const [salaryRecords, setSalaryRecords] = useState([])

  const [salarySummary, setSalarySummary] = useState({
    total_salary: 0,
    total_records: 0,
  })

  const [loading, setLoading] = useState(true)
  const [salaryLoading, setSalaryLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [generating, setGenerating] = useState(false)

  const [search, setSearch] = useState('')
  const [month, setMonth] = useState(currentMonth())
  const [activeTab, setActiveTab] = useState('staff')

  const [modalOpen, setModalOpen] = useState(false)
  const [editingStaff, setEditingStaff] = useState(null)
  const [form, setForm] = useState(emptyForm)

  // ==========================================
  // STAFF
  // ==========================================

  const fetchStaff = async () => {
    try {
      setLoading(true)

      const response = await api.get('/staff', {
        params: search ? { search } : {},
      })

      setStaff(response.data?.data || [])
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStaff()
  }, [search])

  // ==========================================
  // SALARY RECORDS
  // ==========================================

  const fetchSalaryRecords = async () => {
    try {
      setSalaryLoading(true)

      const response = await api.get('/staff/salaries', {
        params: { month },
      })

      const data = response.data?.data

      const records = Array.isArray(data?.records)
        ? data.records
        : Array.isArray(data)
          ? data
          : []

      setSalaryRecords(records)

      setSalarySummary({
        total_salary: Number(
          data?.total_salary ??
            records.reduce(
              (sum, item) => sum + Number(item.salary_amount || 0),
              0
            )
        ),

        // Backend sends total_staff, not total_records.
        total_records: Number(data?.total_staff ?? records.length),
      })
    } catch (error) {
      setSalaryRecords([])

      setSalarySummary({
        total_salary: 0,
        total_records: 0,
      })

      toast.error(getErrorMessage(error))
    } finally {
      setSalaryLoading(false)
    }
  }

  useEffect(() => {
    fetchSalaryRecords()
  }, [month])

  // ==========================================
  // FORM
  // ==========================================

  const openCreateModal = () => {
    setEditingStaff(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  const openEditModal = (person) => {
    setEditingStaff(person)

    setForm({
      name: person.name || '',
      phone: person.phone || '',
      address: person.address || '',
      designation: person.designation || '',
      joining_date: person.joining_date
        ? String(person.joining_date).slice(0, 10)
        : '',
      monthly_salary: person.monthly_salary ?? '',
    })

    setModalOpen(true)
  }

  const handleFormChange = (event) => {
    const { name, value } = event.target

    setForm((current) => ({
      ...current,
      [name]: value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (
      !form.name.trim() ||
      !form.designation.trim() ||
      !form.joining_date ||
      form.monthly_salary === ''
    ) {
      toast.error('Please complete all required fields.')
      return
    }

    if (Number(form.monthly_salary) < 0) {
      toast.error('Salary cannot be negative.')
      return
    }

    try {
      setSaving(true)

      const payload = {
        ...form,
        name: form.name.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        designation: form.designation.trim(),
        monthly_salary: Number(form.monthly_salary),
      }

      if (editingStaff) {
        await api.put(`/staff/${editingStaff.id}`, payload)

        toast.success('Staff updated successfully.')
      } else {
        await api.post('/staff', payload)

        toast.success('Staff added successfully.')
      }

      setModalOpen(false)
      setForm(emptyForm)
      setEditingStaff(null)

      await fetchStaff()
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setSaving(false)
    }
  }

  // ==========================================
  // STAFF STATUS
  // ==========================================

  const handleStatusChange = async (person) => {
    const nextStatus =
      person.status === 'active' ? 'inactive' : 'active'

    try {
      await api.patch(`/staff/${person.id}/status`, {
        status: nextStatus,
      })

      toast.success(
        nextStatus === 'active'
          ? 'Staff activated successfully.'
          : 'Staff deactivated successfully.'
      )

      await fetchStaff()
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  // ==========================================
  // GENERATE MONTHLY SALARY
  // ==========================================

  const handleGenerateSalary = async () => {
    if (!month) {
      toast.error('Select a salary month.')
      return
    }

    try {
      setGenerating(true)

      const response = await api.post('/staff/salaries/generate', {
        month,
      })

      toast.success(
        response.data?.message || 'Monthly salary records generated.'
      )

      // Fetch saved records after generation.
      await fetchSalaryRecords()
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setGenerating(false)
    }
  }

  // ==========================================
  // HELPERS
  // ==========================================

  const activeStaffCount = staff.filter(
    (person) => person.status === 'active'
  ).length

  const inactiveStaffCount = staff.filter(
    (person) => person.status === 'inactive'
  ).length

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="space-y-6">

      {/* Header */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#123D35]">
            Staff Management
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage farm staff and monthly salary records.
          </p>
        </div>

        {activeTab === 'staff' && (
          <button
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#123D35] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#195448]"
          >
            <Plus size={18} />
            Add Staff
          </button>
        )}
      </div>

      {/* Summary */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

        {/* Total Staff */}

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Total Staff
              </p>

              <p className="mt-2 text-2xl font-bold text-[#123D35]">
                {staff.length}
              </p>
            </div>

            <div className="rounded-xl bg-[#E8F3ED] p-3 text-[#159B60]">
              <Users size={22} />
            </div>
          </div>
        </div>

        {/* Active Staff */}

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Active Staff
              </p>

              <p className="mt-2 text-2xl font-bold text-emerald-600">
                {activeStaffCount}
              </p>
            </div>

            <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
              <UserCheck size={22} />
            </div>
          </div>
        </div>

        {/* Inactive Staff */}

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Inactive Staff
              </p>

              <p className="mt-2 text-2xl font-bold text-gray-500">
                {inactiveStaffCount}
              </p>
            </div>

            <div className="rounded-xl bg-gray-100 p-3 text-gray-500">
              <UserX size={22} />
            </div>
          </div>
        </div>

      </div>

      {/* Tabs */}

      <div className="flex gap-2 border-b border-gray-200">

        <button
          onClick={() => setActiveTab('staff')}
          className={`border-b-2 px-4 py-3 text-sm font-semibold transition ${
            activeTab === 'staff'
              ? 'border-[#159B60] text-[#123D35]'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Staff Directory
        </button>

        <button
          onClick={() => setActiveTab('salary')}
          className={`border-b-2 px-4 py-3 text-sm font-semibold transition ${
            activeTab === 'salary'
              ? 'border-[#159B60] text-[#123D35]'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Salary Management
        </button>

      </div>

      {/* ========================================== */}
      {/* STAFF TAB */}
      {/* ========================================== */}

      {activeTab === 'staff' && (
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">

          {/* Search & Refresh */}

          <div className="flex flex-col gap-3 border-b border-gray-100 p-4 sm:flex-row sm:items-center sm:justify-between">

            <div className="relative w-full sm:max-w-sm">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search staff..."
                className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-[#159B60]"
              />
            </div>

            <button
              onClick={fetchStaff}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 transition hover:bg-gray-50"
            >
              <RefreshCw size={15} />
              Refresh
            </button>

          </div>

          {/* Staff Table */}

          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left">

              <thead className="bg-[#F8FAF8]">
                <tr className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  <th className="px-5 py-4">Staff</th>
                  <th className="px-5 py-4">Designation</th>
                  <th className="px-5 py-4">Phone</th>
                  <th className="px-5 py-4">Joining Date</th>
                  <th className="px-5 py-4">Monthly Salary</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">

                {loading ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="py-12 text-center text-sm text-gray-500"
                    >
                      Loading staff...
                    </td>
                  </tr>
                ) : staff.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-14 text-center">
                      <Users
                        className="mx-auto mb-3 text-gray-300"
                        size={35}
                      />

                      <p className="font-medium text-gray-600">
                        No staff records found
                      </p>

                      <p className="mt-1 text-sm text-gray-400">
                        Add your first staff member to get started.
                      </p>
                    </td>
                  </tr>
                ) : (
                  staff.map((person) => (
                    <tr
                      key={person.id}
                      className="transition hover:bg-gray-50/70"
                    >

                      {/* Staff */}

                      <td className="px-5 py-4">
                        <p className="font-semibold text-gray-800">
                          {person.name}
                        </p>

                        <p className="mt-1 max-w-[200px] truncate text-xs text-gray-400">
                          {person.address || 'No address'}
                        </p>
                      </td>

                      {/* Designation */}

                      <td className="px-5 py-4 text-sm text-gray-600">
                        {person.designation}
                      </td>

                      {/* Phone */}

                      <td className="px-5 py-4 text-sm text-gray-600">
                        {person.phone || '—'}
                      </td>

                      {/* Joining Date */}

                      <td className="px-5 py-4 text-sm text-gray-600">
                        {person.joining_date
                          ? String(person.joining_date).slice(0, 10)
                          : '—'}
                      </td>

                      {/* Salary */}

                      <td className="px-5 py-4 text-sm font-semibold text-[#123D35]">
                        {formatMoney(person.monthly_salary)}
                      </td>

                      {/* Status */}

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                            person.status === 'active'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {person.status}
                        </span>
                      </td>

                      {/* Actions */}

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">

                          <button
                            onClick={() => openEditModal(person)}
                            title="Edit staff"
                            className="rounded-lg border border-gray-200 p-2 text-gray-500 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-[#159B60]"
                          >
                            <Pencil size={16} />
                          </button>

                          <button
                            onClick={() => handleStatusChange(person)}
                            title={
                              person.status === 'active'
                                ? 'Deactivate staff'
                                : 'Activate staff'
                            }
                            className={`rounded-lg border p-2 transition ${
                              person.status === 'active'
                                ? 'border-gray-200 text-gray-500 hover:bg-gray-100'
                                : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                            }`}
                          >
                            {person.status === 'active' ? (
                              <UserX size={16} />
                            ) : (
                              <UserCheck size={16} />
                            )}
                          </button>

                        </div>
                      </td>

                    </tr>
                  ))
                )}

              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* ========================================== */}
      {/* SALARY TAB */}
      {/* ========================================== */}

      {activeTab === 'salary' && (
        <div className="space-y-5">

          {/* Month Selection & Generation */}

          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">

            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Select Salary Month
                </label>

                <input
                  type="month"
                  value={month}
                  onChange={(event) => setMonth(event.target.value)}
                  className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-[#159B60]"
                />
              </div>

              <button
                onClick={handleGenerateSalary}
                disabled={generating}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#123D35] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#195448] disabled:opacity-50"
              >
                <CalendarDays size={17} />

                {generating
                  ? 'Generating...'
                  : 'Generate Monthly Salary'}
              </button>

            </div>

            <p className="mt-3 text-xs leading-5 text-gray-400">
              Generates salary snapshots for active staff for the selected month.
              Existing records are not overwritten.
            </p>

          </div>

          {/* Salary Summary */}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

            {/* Salary Records Count */}

            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">

                <div>
                  <p className="text-sm text-gray-500">
                    Salary Records
                  </p>

                  <p className="mt-2 text-2xl font-bold text-[#123D35]">
                    {salaryLoading ? '...' : salarySummary.total_records}
                  </p>
                </div>

                <div className="rounded-xl bg-[#E8F3ED] p-3 text-[#159B60]">
                  <Users size={22} />
                </div>

              </div>
            </div>

            {/* Total Salary */}

            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">

                <div>
                  <p className="text-sm text-gray-500">
                    Total Salary for {month}
                  </p>

                  <p className="mt-2 text-2xl font-bold text-[#123D35]">
                    {formatMoney(salarySummary.total_salary)}
                  </p>
                </div>

                <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
                  <Wallet size={22} />
                </div>

              </div>
            </div>

          </div>

          {/* Monthly Salary Table */}

          <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">

            <div className="border-b border-gray-100 px-5 py-4">
              <h3 className="font-bold text-[#123D35]">
                Monthly Salary Records
              </h3>

              <p className="mt-1 text-xs text-gray-400">
                Salary snapshots for the selected month.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[550px] text-left">

                <thead className="bg-[#F8FAF8]">
                  <tr className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    <th className="px-5 py-4">Staff</th>
                    <th className="px-5 py-4">Designation</th>
                    <th className="px-5 py-4">Salary Month</th>
                    <th className="px-5 py-4">Salary Amount</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">

                  {salaryLoading ? (
                    <tr>
                      <td
                        colSpan="4"
                        className="py-12 text-center text-sm text-gray-500"
                      >
                        Loading salary records...
                      </td>
                    </tr>
                  ) : salaryRecords.length === 0 ? (
                    <tr>
                      <td
                        colSpan="4"
                        className="py-12 text-center text-sm text-gray-400"
                      >
                        No salary records for this month.
                      </td>
                    </tr>
                  ) : (
                    salaryRecords.map((record) => (
                      <tr
                        key={record.id}
                        className="transition hover:bg-gray-50/70"
                      >

                        {/* Staff */}

                        <td className="px-5 py-4">
                          <p className="font-semibold text-gray-800">
                            {record.name || record.staff_name || 'Staff'}
                          </p>
                        </td>

                        {/* Designation */}

                        <td className="px-5 py-4 text-sm text-gray-600">
                          {record.designation || '—'}
                        </td>

                        {/* Salary Month */}

                        <td className="px-5 py-4 text-sm text-gray-600">
                          {record.salary_month
                            ? String(record.salary_month).slice(0, 10)
                            : month}
                        </td>

                        {/* Salary Amount */}

                        <td className="px-5 py-4 text-sm font-semibold text-[#123D35]">
                          {formatMoney(record.salary_amount)}
                        </td>

                      </tr>
                    ))
                  )}

                </tbody>
              </table>
            </div>

          </div>

        </div>
      )}

      {/* ========================================== */}
      {/* ADD / EDIT STAFF MODAL */}
      {/* ========================================== */}

      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-[2px]">

          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white shadow-2xl">

            {/* Modal Header */}

            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">

              <div>
                <h2 className="font-bold text-[#123D35]">
                  {editingStaff ? 'Edit Staff' : 'Add Staff Member'}
                </h2>

                <p className="mt-1 text-xs text-gray-400">
                  Enter staff information below.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
              >
                <X size={20} />
              </button>

            </div>

            {/* Modal Form */}

            <form onSubmit={handleSubmit} className="space-y-4 p-5">

              {/* Name */}

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Full Name *
                </label>

                <input
                  name="name"
                  value={form.name}
                  onChange={handleFormChange}
                  required
                  placeholder="Staff full name"
                  className="w-full rounded-xl border border-gray-200 px-3.5 py-3 text-sm outline-none focus:border-[#159B60]"
                />
              </div>

              {/* Designation & Phone */}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Designation *
                  </label>

                  <input
                    name="designation"
                    value={form.designation}
                    onChange={handleFormChange}
                    required
                    placeholder="e.g. Farm Worker"
                    className="w-full rounded-xl border border-gray-200 px-3.5 py-3 text-sm outline-none focus:border-[#159B60]"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Phone
                  </label>

                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleFormChange}
                    placeholder="Phone number"
                    className="w-full rounded-xl border border-gray-200 px-3.5 py-3 text-sm outline-none focus:border-[#159B60]"
                  />
                </div>

              </div>

              {/* Address */}

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Address
                </label>

                <textarea
                  name="address"
                  value={form.address}
                  onChange={handleFormChange}
                  rows="2"
                  placeholder="Staff address"
                  className="w-full resize-none rounded-xl border border-gray-200 px-3.5 py-3 text-sm outline-none focus:border-[#159B60]"
                />
              </div>

              {/* Joining Date & Salary */}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Joining Date *
                  </label>

                  <input
                    type="date"
                    name="joining_date"
                    value={form.joining_date}
                    onChange={handleFormChange}
                    required
                    className="w-full rounded-xl border border-gray-200 px-3.5 py-3 text-sm outline-none focus:border-[#159B60]"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Monthly Salary (৳) *
                  </label>

                  <input
                    type="number"
                    name="monthly_salary"
                    value={form.monthly_salary}
                    onChange={handleFormChange}
                    required
                    min="0"
                    step="0.01"
                    placeholder="12000"
                    className="w-full rounded-xl border border-gray-200 px-3.5 py-3 text-sm outline-none focus:border-[#159B60]"
                  />
                </div>

              </div>

              {/* Buttons */}

              <div className="flex flex-col-reverse gap-3 pt-3 sm:flex-row sm:justify-end">

                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-[#123D35] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#195448] disabled:opacity-50"
                >
                  {saving
                    ? 'Saving...'
                    : editingStaff
                      ? 'Update Staff'
                      : 'Add Staff'}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  )
}

export default StaffManagement