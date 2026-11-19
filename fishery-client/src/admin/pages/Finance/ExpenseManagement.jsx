
import { useEffect, useMemo, useState } from 'react'
import {
  Plus,
  Search,
  Wallet,
  ShoppingBag,
  Receipt,
  CalendarDays,
  Filter,
  Pencil,
  X,
  LoaderCircle,
  RefreshCw,
  Save,
  Users,
} from 'lucide-react'
import { toast } from 'sonner'
import api from '../../../services/api'

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

const getDateString = (date) => {
  if (!date) return ''

  if (typeof date === 'string') {
    return date.slice(0, 10)
  }

  return new Date(date).toLocaleDateString('en-CA')
}

function ExpenseManagement() {
  const [expenses, setExpenses] = useState([])
  const [feedPurchases, setFeedPurchases] = useState([])
  const [fishStockings, setFishStockings] = useState([])
  const [salaryRecords, setSalaryRecords] = useState([])
  const [categories, setCategories] = useState([])

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedSource, setSelectedSource] = useState('All')

  const [showModal, setShowModal] = useState(false)
  const [editingExpense, setEditingExpense] = useState(null)
  const [formData, setFormData] = useState(initialFormData)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // ==========================================
  // FETCH ALL EXPENSE SOURCES
  // ==========================================

  const fetchExpenses = async () => {
    try {
      setLoading(true)

      const results = await Promise.allSettled([
        api.get('/expenses'),
        api.get('/feed-purchases'),
        api.get('/fish-stockings'),
        api.get('/staff/salaries/all'),
      ])

      const [
        manualResult,
        feedResult,
        stockingResult,
        salaryResult,
      ] = results

      // Manual expenses
      if (manualResult.status === 'fulfilled') {
        setExpenses(manualResult.value.data.data || [])
      } else {
        setExpenses([])
        console.error('Manual Expenses Error:', manualResult.reason)
        toast.error('Failed to load manual expenses.')
      }

      // Feed purchases
      if (feedResult.status === 'fulfilled') {
        setFeedPurchases(feedResult.value.data.purchases || [])
      } else {
        setFeedPurchases([])
        console.error('Feed Purchases Error:', feedResult.reason)
        toast.error('Failed to load feed purchases.')
      }

      // Fish stocking purchases
      if (stockingResult.status === 'fulfilled') {
        setFishStockings(stockingResult.value.data.stockings || [])
      } else {
        setFishStockings([])
        console.error('Fish Stockings Error:', stockingResult.reason)
        toast.error('Failed to load fish stocking purchases.')
      }

      // Staff salary snapshots
      if (salaryResult.status === 'fulfilled') {
        const data = salaryResult.value.data?.data

        setSalaryRecords(
          Array.isArray(data?.records) ? data.records : []
        )
      } else {
        setSalaryRecords([])
        console.error('Staff Salary Error:', salaryResult.reason)
        toast.error('Failed to load staff salary records.')
      }
    } catch (error) {
      console.error('Fetch Expenses Error:', error)
      toast.error('Failed to load expense records.')
    } finally {
      setLoading(false)
    }
  }

  // ==========================================
  // FETCH EXPENSE CATEGORIES
  // ==========================================

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

  // ==========================================
  // NORMALIZE ALL EXPENSE SOURCES
  // ==========================================

  const allExpenses = useMemo(() => {
    // Manual expenses
    const manualRecords = expenses.map((expense) => ({
      ...expense,
      record_id: `manual-${expense.id}`,
      source: 'Manual',
      category_name: expense.category_name || 'Other Expenses',
      expense_date: getDateString(expense.expense_date),
      amount: Number(expense.amount || 0),
      description: expense.description || 'Manual expense',
      reference_number: expense.reference_number || '',
    }))

    // Feed purchases
    const feedRecords = feedPurchases.map((purchase) => ({
      ...purchase,
      record_id: `feed-${purchase.id}`,
      source: 'Feed Purchase',
      category_name: 'Feed Purchase',
      expense_date: getDateString(purchase.purchase_date),
      amount: Number(purchase.total_cost || 0),
      description: [
        purchase.feed_name || 'Feed',
        purchase.brand ? `(${purchase.brand})` : '',
        purchase.quantity_kg
          ? `${purchase.quantity_kg} kg`
          : '',
      ]
        .filter(Boolean)
        .join(' '),
      reference_number: purchase.invoice_number || '',
    }))

    // Fish stocking purchases
    const stockingRecords = fishStockings.map((stocking) => ({
      ...stocking,
      record_id: `stocking-${stocking.id}`,
      source: 'Fish Stocking',
      category_name: 'Fish Stocking Purchase',
      expense_date: getDateString(stocking.stocking_date),
      amount: Number(stocking.total_cost || 0),
      description: [
        stocking.species_name || 'Fish',
        stocking.pond_name ? `- ${stocking.pond_name}` : '',
        stocking.total_weight_kg
          ? `${stocking.total_weight_kg} kg`
          : '',
      ]
        .filter(Boolean)
        .join(' '),
      reference_number: '',
    }))

    // Staff salary snapshots (READ-ONLY)
    const salaryExpenseRecords = salaryRecords.map((record) => ({
      ...record,
      record_id: `salary-${record.id}`,
      source: 'Staff Salary',
      category_name: 'Staff Salary',
      expense_date: getDateString(record.salary_month),
      amount: Number(record.salary_amount || 0),
      description: `${record.name || 'Staff'} - ${record.designation || 'Staff'}`,
      reference_number: `SAL-${getDateString(
        record.salary_month
      )
        .slice(0, 7)
        .replace('-', '')}`,
    }))

    // Combine all sources
    return [
      ...manualRecords,
      ...feedRecords,
      ...stockingRecords,
      ...salaryExpenseRecords,
    ].sort((a, b) => {
      return b.expense_date.localeCompare(a.expense_date)
    })
  }, [expenses, feedPurchases, fishStockings, salaryRecords])

  // ==========================================
  // CATEGORY FILTER OPTIONS
  // ==========================================

  const categoryOptions = useMemo(() => {
    const names = allExpenses
      .map((expense) => expense.category_name)
      .filter(Boolean)

    return [...new Set(names)].sort()
  }, [allExpenses])

  // ==========================================
  // FILTER ALL EXPENSE RECORDS
  // ==========================================

  const filteredExpenses = useMemo(() => {
    return allExpenses.filter((expense) => {
      const search = searchTerm.toLowerCase()

      const searchableFields = [
        expense.description,
        expense.category_name,
        expense.reference_number,
        expense.supplier_name,
        expense.feed_name,
        expense.species_name,
        expense.pond_name,
        expense.brand,
        expense.invoice_number,
        expense.source,
        expense.name,
        expense.designation,
      ]

      const matchesSearch = searchableFields.some((field) =>
        String(field || '').toLowerCase().includes(search)
      )

      const matchesCategory =
        selectedCategory === 'All' ||
        expense.category_name === selectedCategory

      const matchesSource =
        selectedSource === 'All' ||
        expense.source === selectedSource

      return matchesSearch && matchesCategory && matchesSource
    })
  }, [allExpenses, searchTerm, selectedCategory, selectedSource])

  // ==========================================
  // CALCULATE TOTALS
  // ==========================================

  const summary = useMemo(() => {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    // Total expenses from all sources
    const totalExpenses = allExpenses.reduce(
      (total, expense) =>
        total + Number(expense.amount || 0),
      0
    )

    // Current month expenses
    const monthlyExpenses = allExpenses
      .filter((expense) => {
        const date = new Date(
          `${expense.expense_date}T00:00:00`
        )

        return (
          date.getMonth() === currentMonth &&
          date.getFullYear() === currentYear
        )
      })
      .reduce(
        (total, expense) =>
          total + Number(expense.amount || 0),
        0
      )

    // Feed purchases
    const totalFeedPurchases = feedPurchases.reduce(
      (total, purchase) =>
        total + Number(purchase.total_cost || 0),
      0
    )

    // Fish stocking purchases
    const totalStockingPurchases = fishStockings.reduce(
      (total, stocking) =>
        total + Number(stocking.total_cost || 0),
      0
    )

    // Manual expenses
    const totalManualExpenses = expenses.reduce(
      (total, expense) =>
        total + Number(expense.amount || 0),
      0
    )

    // Staff salaries
    const totalSalaryExpenses = salaryRecords.reduce(
      (total, record) =>
        total + Number(record.salary_amount || 0),
      0
    )

    return {
      totalExpenses,
      monthlyExpenses,
      totalFeedPurchases,
      totalStockingPurchases,
      totalManualExpenses,
      totalSalaryExpenses,
    }
  }, [allExpenses, feedPurchases, fishStockings, expenses, salaryRecords])

  // ==========================================
  // SUMMARY CARDS
  // ==========================================

  const summaryCards = [
    {
      title: 'Total Expenses',
      value: formatCurrency(summary.totalExpenses),
      description: 'Combined expenses from all sources',
      icon: Wallet,
      color: 'text-rose-600',
      bg: 'bg-rose-50',
    },
    {
      title: "This Month's Expenses",
      value: formatCurrency(summary.monthlyExpenses),
      description: 'All sources recorded this month',
      icon: CalendarDays,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      title: 'Feed Purchase',
      value: formatCurrency(summary.totalFeedPurchases),
      description: `${feedPurchases.length} feed purchase records`,
      icon: ShoppingBag,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
    {
      title: 'Fish Stocking',
      value: formatCurrency(summary.totalStockingPurchases),
      description: `${fishStockings.length} stocking purchase records`,
      icon: Receipt,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      title: 'Staff Salary',
      value: formatCurrency(summary.totalSalaryExpenses),
      description: `${salaryRecords.length} salary records`,
      icon: Users,
      color: 'text-violet-600',
      bg: 'bg-violet-50',
    },
  ]

  // ==========================================
  // OPEN ADD MODAL
  // ==========================================

  const handleAddExpense = () => {
    setEditingExpense(null)
    setFormData(initialFormData)
    setShowModal(true)
  }

  // ==========================================
  // OPEN EDIT MODAL
  // ==========================================

  const handleEditExpense = (expense) => {
    if (expense.source !== 'Manual') return

    setEditingExpense(expense)

    setFormData({
      category_id: String(expense.category_id),
      expense_date: getDateString(expense.expense_date),
      amount: String(expense.amount),
      description: expense.description || '',
      reference_number: expense.reference_number || '',
      payment_method: expense.payment_method || 'cash',
      notes: expense.notes || '',
    })

    setShowModal(true)
  }

  // ==========================================
  // FORM INPUT HANDLER
  // ==========================================

  const handleChange = (event) => {
    const { name, value } = event.target

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

  // ==========================================
  // SAVE OR UPDATE MANUAL EXPENSE
  // ==========================================

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
        await api.put(`/expenses/${editingExpense.id}`, payload)

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
        error.response?.data?.message ||
          'Failed to save expense.'
      )
    } finally {
      setSaving(false)
    }
  }

  // ==========================================
  // CLOSE MODAL
  // ==========================================

  const closeModal = () => {
    if (saving) return

    setShowModal(false)
    setEditingExpense(null)
    setFormData(initialFormData)
  }

  // ==========================================
  // UI
  // ==========================================

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
            Track manual expenses, feed purchases, fish stocking and staff salaries.
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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
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

      {/* Expense Source Summary */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="font-bold text-[#123D35]">
          Expense Source Summary
        </h2>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {/* Manual */}
          <div className="rounded-lg bg-gray-50 p-4">
            <p className="text-xs font-medium text-gray-500">
              Manual Expenses
            </p>

            <p className="mt-2 text-lg font-bold text-gray-800">
              {formatCurrency(summary.totalManualExpenses)}
            </p>

            <p className="mt-1 text-xs text-gray-400">
              {expenses.length} records
            </p>
          </div>

          {/* Feed */}
          <div className="rounded-lg bg-amber-50 p-4">
            <p className="text-xs font-medium text-amber-700">
              Feed Purchases
            </p>

            <p className="mt-2 text-lg font-bold text-gray-800">
              {formatCurrency(summary.totalFeedPurchases)}
            </p>

            <p className="mt-1 text-xs text-gray-400">
              {feedPurchases.length} records
            </p>
          </div>

          {/* Stocking */}
          <div className="rounded-lg bg-emerald-50 p-4">
            <p className="text-xs font-medium text-emerald-700">
              Fish Stocking Purchases
            </p>

            <p className="mt-2 text-lg font-bold text-gray-800">
              {formatCurrency(summary.totalStockingPurchases)}
            </p>

            <p className="mt-1 text-xs text-gray-400">
              {fishStockings.length} records
            </p>
          </div>

          {/* Staff Salary */}
          <div className="rounded-lg bg-violet-50 p-4">
            <p className="text-xs font-medium text-violet-700">
              Staff Salary
            </p>

            <p className="mt-2 text-lg font-bold text-gray-800">
              {formatCurrency(summary.totalSalaryExpenses)}
            </p>

            <p className="mt-1 text-xs text-gray-400">
              {salaryRecords.length} records
            </p>
          </div>
        </div>
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
                All expenses from manual records, feed, fish stocking and staff salaries.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              {/* Search */}
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

              {/* Category Filter */}
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

                  {categoryOptions.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Source Filter */}
              <select
                value={selectedSource}
                onChange={(event) =>
                  setSelectedSource(event.target.value)
                }
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-600 sm:w-44"
              >
                <option value="All">All Sources</option>
                <option value="Manual">Manual</option>
                <option value="Feed Purchase">Feed Purchase</option>
                <option value="Fish Stocking">Fish Stocking</option>
                <option value="Staff Salary">Staff Salary</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[950px] text-left">
            <thead className="bg-[#F7F9F7]">
              <tr className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                <th className="px-5 py-4">Date</th>
                <th className="px-5 py-4">Category</th>
                <th className="px-5 py-4">Description</th>
                <th className="px-5 py-4">Amount</th>
                <th className="px-5 py-4">Source</th>
                <th className="px-5 py-4">Reference</th>
                <th className="px-5 py-4 text-center">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-5 py-16 text-center">
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
                  <tr
                    key={expense.record_id}
                    className="transition hover:bg-gray-50/70"
                  >
                    <td className="px-5 py-4 text-sm text-gray-600">
                      {expense.expense_date || '—'}
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
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          expense.source === 'Manual'
                            ? 'bg-emerald-50 text-emerald-700'
                            : expense.source === 'Feed Purchase'
                              ? 'bg-amber-50 text-amber-700'
                              : expense.source === 'Fish Stocking'
                                ? 'bg-blue-50 text-blue-700'
                                : 'bg-violet-50 text-violet-700'
                        }`}
                      >
                        {expense.source}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-500">
                      {expense.reference_number || '—'}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-center">
                        {expense.source === 'Manual' ? (
                          <button
                            type="button"
                            title="Edit"
                            onClick={() => handleEditExpense(expense)}
                            className="rounded-lg p-2 text-gray-500 transition hover:bg-emerald-50 hover:text-emerald-700"
                          >
                            <Pencil size={17} />
                          </button>
                        ) : (
                          <span className="text-xs text-gray-400">
                            {expense.source === 'Staff Salary'
                              ? 'Managed in Staff Management'
                              : 'Managed in module'}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-5 py-16 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                      <Receipt size={26} />
                    </div>

                    <h3 className="mt-4 text-sm font-semibold text-gray-700">
                      No expense records found
                    </h3>

                    <p className="mt-1 text-xs text-gray-400">
                      Try changing the search or filters.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="border-t border-gray-100 px-5 py-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-gray-400">
              Showing {filteredExpenses.length} of {allExpenses.length} records
            </p>

            <p className="text-sm font-semibold text-gray-700">
              Filtered Total:{' '}
              {formatCurrency(
                filteredExpenses.reduce(
                  (total, expense) =>
                    total + Number(expense.amount || 0),
                  0
                )
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Add / Edit Expense Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">
          <div className="my-auto w-full max-w-lg rounded-2xl bg-white shadow-2xl">
            <form onSubmit={handleSubmit}>
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-gray-100 p-5">
                <div>
                  <h2 className="font-bold text-[#123D35]">
                    {editingExpense
                      ? 'Edit Expense'
                      : 'Add New Expense'}
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

              {/* Modal Body */}
              <div className="space-y-4 p-5">
                {/* Category */}
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
                      <option
                        key={category.id}
                        value={category.id}
                      >
                        {category.category_name}
                      </option>
                    ))}
                  </select>

                  <p className="mt-1.5 text-xs text-gray-400">
                    Feed, fish stocking and staff salary expenses
                    are automatically recorded from their
                    respective modules.
                  </p>
                </div>

                {/* Date */}
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

                {/* Amount */}
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

                {/* Description */}
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

                {/* Reference */}
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

                {/* Payment Method */}
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
                    <option value="mobile_banking">
                      Mobile Banking
                    </option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Notes */}
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

                {/* Modal Footer */}
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
                      <LoaderCircle
                        size={17}
                        className="animate-spin"
                      />
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
