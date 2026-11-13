
import { useEffect, useMemo, useState } from 'react'
import {
  Plus,
  Search,
  Wallet,
  TrendingDown,
  ShoppingBag,
  Receipt,
  CalendarDays,
  Filter,
  Pencil,
  X,
  LoaderCircle,
  RefreshCw,
  Save,
} from 'lucide-react'
import { toast } from 'sonner'
import api from '../../../services/api'

const expenseCategories = [
  'Labor Wages',
  'Transportation',
  'Medicine',
  'Pond Maintenance',
  'Electricity',
  'Equipment',
  'Other',
]

const initialFormData = {
  category_id: '',
  expense_date: new Date().toLocaleDateString('en-CA'),
  amount: '',
  description: '',
  reference_number: '',
  payment_method: 'cash',
  notes: '',
}

const formatCurrency = (amount) =>
  `৳ ${Number(amount || 0).toLocaleString('en-BD', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`

function ExpenseManagement() {
  const [expenses, setExpenses] = useState([])
  const [categories, setCategories] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')

  const [showModal, setShowModal] = useState(false)
  const [editingExpense, setEditingExpense] = useState(null)
  const [formData, setFormData] = useState(initialFormData)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Fetch expense records
  const fetchExpenses = async () => {
    try {
      setLoading(true)

      const response = await api.get('/expenses')

      setExpenses(response.data.data || [])
    } catch (error) {
      console.error('Fetch Expenses Error:', error)

      toast.error(
        error.response?.data?.message || 'Failed to load expenses.'
      )
    } finally {
      setLoading(false)
    }
  }

  // Fetch expense categories
  const fetchCategories = async () => {
    try {
      const response = await api.get('/expenses/categories')

      setCategories(response.data.data || [])
    } catch (error) {
      console.error('Fetch Categories Error:', error)

      toast.error(
        error.response?.data?.message ||
          'Failed to load expense categories.'
      )
    }
  }

  useEffect(() => {
    fetchExpenses()
    fetchCategories()
  }, [])

  // Filter expenses
  const filteredExpenses = useMemo(() => {
    return expenses.filter((expense) => {
      const description = expense.description || ''
      const category = expense.category_name || ''

      const matchesSearch =
        description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(expense.reference_number || '')
          .toLowerCase()
          .includes(searchTerm.toLowerCase())

      const matchesCategory =
        selectedCategory === 'All' ||
        category === selectedCategory

      return matchesSearch && matchesCategory
    })
  }, [expenses, searchTerm, selectedCategory])

  // Calculate summary
  const summary = useMemo(() => {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    const totalExpenses = expenses.reduce(
      (total, expense) => total + Number(expense.amount),
      0
    )

    const monthlyExpenses = expenses
      .filter((expense) => {
        const date = new Date(`${expense.expense_date}T00:00:00`)

        return (
          date.getMonth() === currentMonth &&
          date.getFullYear() === currentYear
        )
      })
      .reduce((total, expense) => total + Number(expense.amount), 0)

    return {
      totalExpenses,
      monthlyExpenses,
      otherExpenses: totalExpenses,
    }
  }, [expenses])

  const summaryCards = [
    {
      title: 'Total Expenses',
      value: formatCurrency(summary.totalExpenses),
      description: 'All manually recorded expenses',
      icon: Wallet,
      color: 'text-rose-600',
      bg: 'bg-rose-50',
    },
    {
      title: "This Month's Expenses",
      value: formatCurrency(summary.monthlyExpenses),
      description: 'Expenses recorded this month',
      icon: CalendarDays,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      title: 'Feed Purchase',
      value: 'Managed Separately',
      description: 'Automatically derived from Feed Purchases',
      icon: ShoppingBag,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
    {
      title: 'Other Expenses',
      value: formatCurrency(summary.otherExpenses),
      description: 'Manually recorded operating costs',
      icon: Receipt,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
  ]

  // Open Add Modal
  const handleAddExpense = () => {
    setEditingExpense(null)
    setFormData(initialFormData)
    setShowModal(true)
  }

  // Open Edit Modal
  const handleEditExpense = (expense) => {
    setEditingExpense(expense)

    setFormData({
      category_id: String(expense.category_id),
      expense_date:
        typeof expense.expense_date === 'string'
          ? expense.expense_date.slice(0, 10)
          : '',
      amount: String(expense.amount),
      description: expense.description || '',
      reference_number: expense.reference_number || '',
      payment_method: expense.payment_method || 'cash',
      notes: expense.notes || '',
    })

    setShowModal(true)
  }

  // Form input handler
  const handleChange = (event) => {
    const { name, value } = event.target

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

  // Save or update expense
  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!formData.category_id) {
      return toast.error('Please select an expense category.')
    }

    if (!formData.expense_date) {
      return toast.error('Please select an expense date.')
    }

    if (!formData.amount || Number(formData.amount) <= 0) {
      return toast.error('Please enter a valid amount.')
    }

    try {
      setSaving(true)

      const payload = {
        ...formData,
        category_id: Number(formData.category_id),
        amount: Number(formData.amount),
      }

      if (editingExpense) {
        await api.put(
          `/expenses/${editingExpense.id}`,
          payload
        )

        toast.success('Expense updated successfully.')
      } else {
        await api.post('/expenses', payload)

        toast.success('Expense added successfully.')
      }

      setShowModal(false)
      setEditingExpense(null)
      setFormData(initialFormData)

      await fetchExpenses()
    } catch (error) {
      console.error('Save Expense Error:', error)

      toast.error(
        error.response?.data?.message || 'Failed to save expense.'
      )
    } finally {
      setSaving(false)
    }
  }

  const closeModal = () => {
    if (saving) return

    setShowModal(false)
    setEditingExpense(null)
    setFormData(initialFormData)
  }

  return (
    <div className="space-y-6">
      {/* Heading */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-emerald-700">
            Finance / Expenses
          </p>

          <h1 className="mt-1 text-2xl font-bold text-[#123D35]">
            Expense Management
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Track feed purchases and other fishery operating expenses.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={fetchExpenses}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw
              size={17}
              className={loading ? 'animate-spin' : ''}
            />
            Refresh
          </button>

          <button
            type="button"
            onClick={handleAddExpense}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#123D35] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1B5749]"
          >
            <Plus size={18} />
            Add Expense
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => {
          const Icon = card.icon

          return (
            <div
              key={card.title}
              className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-500">
                    {card.title}
                  </p>

                  <h2 className="mt-3 text-xl font-bold text-gray-800">
                    {card.value}
                  </h2>
                </div>

                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${card.bg} ${card.color}`}
                >
                  <Icon size={23} />
                </div>
              </div>

              <p className="mt-3 text-xs text-gray-400">
                {card.description}
              </p>
            </div>
          )
        })}
      </div>

      {/* Expense Records */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="font-bold text-[#123D35]">
                Expense Records
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                View and manage all recorded expenses.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative">
                <Search
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search expenses..."
                  className="w-full rounded-lg border border-gray-200 py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-emerald-600 sm:w-56"
                />
              </div>

              <div className="relative">
                <Filter
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <select
                  value={selectedCategory}
                  onChange={(event) =>
                    setSelectedCategory(event.target.value)
                  }
                  className="w-full appearance-none rounded-lg border border-gray-200 bg-white py-2.5 pl-9 pr-8 text-sm outline-none focus:border-emerald-600 sm:w-48"
                >
                  <option value="All">All Categories</option>

                  {categories.map((category) => (
                    <option
                      key={category.id}
                      value={category.category_name}
                    >
                      {category.category_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[750px] text-left">
            <thead className="bg-[#F7F9F7]">
              <tr className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                <th className="px-5 py-4">Date</th>
                <th className="px-5 py-4">Category</th>
                <th className="px-5 py-4">Description</th>
                <th className="px-5 py-4">Amount</th>
                <th className="px-5 py-4">Source</th>
                <th className="px-5 py-4 text-center">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-5 py-16 text-center">
                    <LoaderCircle
                      size={28}
                      className="mx-auto animate-spin text-emerald-700"
                    />

                    <p className="mt-3 text-sm text-gray-500">
                      Loading expenses...
                    </p>
                  </td>
                </tr>
              ) : filteredExpenses.length > 0 ? (
                filteredExpenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-gray-50/70">
                    <td className="px-5 py-4 text-sm text-gray-600">
                      {String(expense.expense_date).slice(0, 10)}
                    </td>

                    <td className="px-5 py-4 text-sm font-medium text-gray-700">
                      {expense.category_name}
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-600">
                      {expense.description || '—'}
                    </td>

                    <td className="px-5 py-4 text-sm font-bold text-gray-800">
                      {formatCurrency(expense.amount)}
                    </td>

                    <td className="px-5 py-4">
                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                        Manual
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-center gap-2">
                        <button
                          type="button"
                          title="Edit"
                          onClick={() => handleEditExpense(expense)}
                          className="rounded-lg p-2 text-gray-500 transition hover:bg-emerald-50 hover:text-emerald-700"
                        >
                          <Pencil size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-5 py-16 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                      <Receipt size={26} />
                    </div>

                    <h3 className="mt-4 text-sm font-semibold text-gray-700">
                      No expense records found
                    </h3>

                    <p className="mt-1 text-xs text-gray-400">
                      Your recorded expenses will appear here.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-gray-100 px-5 py-4">
          <p className="text-xs text-gray-400">
            Showing {filteredExpenses.length} expense records
          </p>
        </div>
      </div>

      {/* Add / Edit Expense Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">
          <div className="my-auto w-full max-w-lg rounded-2xl bg-white shadow-2xl">
            <form onSubmit={handleSubmit}>
              <div className="flex items-center justify-between border-b border-gray-100 p-5">
                <div>
                  <h2 className="font-bold text-[#123D35]">
                    {editingExpense ? 'Edit Expense' : 'Add New Expense'}
                  </h2>

                  <p className="mt-1 text-xs text-gray-500">
                    Record a fishery operating expense.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 disabled:opacity-50"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4 p-5">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Expense Category *
                  </label>

                  <select
                    name="category_id"
                    value={formData.category_id}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-600"
                  >
                    <option value="" disabled>
                      Select category
                    </option>

                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.category_name}
                      </option>
                    ))}
                  </select>

                  <p className="mt-1.5 text-xs text-gray-400">
                    Feed purchases are recorded automatically from Feed Management.
                  </p>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Expense Date *
                  </label>

                  <input
                    type="date"
                    name="expense_date"
                    value={formData.expense_date}
                    onChange={handleChange}
                    max={new Date().toLocaleDateString('en-CA')}
                    required
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Amount (৳) *
                  </label>

                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    min="0.01"
                    step="0.01"
                    placeholder="Enter amount"
                    required
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Description
                  </label>

                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="2"
                    maxLength="500"
                    placeholder="Write expense details..."
                    className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Reference Number
                  </label>

                  <input
                    type="text"
                    name="reference_number"
                    value={formData.reference_number}
                    onChange={handleChange}
                    maxLength="100"
                    placeholder="Optional reference number"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Payment Method
                  </label>

                  <select
                    name="payment_method"
                    value={formData.payment_method}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-600"
                  >
                    <option value="cash">Cash</option>
                    <option value="bank">Bank</option>
                    <option value="mobile_banking">Mobile Banking</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Notes
                  </label>

                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows="2"
                    placeholder="Additional notes (optional)"
                    className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-600"
                  />
                </div>

                <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    disabled={saving}
                    className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-lg bg-[#123D35] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1B5749] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving ? (
                      <LoaderCircle size={17} className="animate-spin" />
                    ) : (
                      <Save size={17} />
                    )}

                    {saving
                      ? 'Saving...'
                      : editingExpense
                        ? 'Update Expense'
                        : 'Save Expense'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default ExpenseManagement
