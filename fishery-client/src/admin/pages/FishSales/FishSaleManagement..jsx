
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ShoppingCart,
  Fish,
  Wallet,
  Banknote,
  ReceiptText,
  Plus,
  Trash2,
  Eye,
  CreditCard,
  CalendarDays,
  Search,
  RefreshCw,
  LoaderCircle,
  X,
  Save,
  CheckCircle2,
  Clock3,
  AlertCircle,
  Waves,
  Package,
  ClipboardList,
  ArrowDownRight,
} from 'lucide-react'
import { toast } from 'sonner'
import api from '../../../services/api'

const today = () => {
  const date = new Date()
  const localDate = new Date(
    date.getTime() - date.getTimezoneOffset() * 60000
  )

  return localDate.toISOString().slice(0, 10)
}

const formatMoney = (amount) =>
  `৳${Number(amount || 0).toLocaleString('en-BD', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`

const formatNumber = (number) =>
  Number(number || 0).toLocaleString('en-BD', {
    maximumFractionDigits: 2,
  })

const formatDate = (date) => {
  if (!date) return '—'

  const value = new Date(date)
  if (Number.isNaN(value.getTime())) return date

  return value.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

const getList = (data, keys) => {
  for (const key of keys) {
    if (Array.isArray(data?.[key])) return data[key]
  }

  return []
}

const emptyItem = () => ({
  species_id: '',
  quantity_kg: '',
  unit_price_per_kg: '',
  notes: '',
})

const paymentMethods = [
  { value: 'cash', label: 'Cash' },
  { value: 'bank', label: 'Bank Transfer' },
  { value: 'mobile_banking', label: 'Mobile Banking' },
  { value: 'other', label: 'Other' },
]

const statusStyles = {
  paid: {
    label: 'Paid',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: CheckCircle2,
  },
  partial: {
    label: 'Partial',
    className: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: Clock3,
  },
  unpaid: {
    label: 'Unpaid',
    className: 'bg-rose-50 text-rose-700 border-rose-200',
    icon: AlertCircle,
  },
}

function FishSaleManagement() {
  const [sales, setSales] = useState([])
  const [dealers, setDealers] = useState([])
  const [ponds, setPonds] = useState([])
  const [species, setSpecies] = useState([])

  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  const [showSaleModal, setShowSaleModal] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedSale, setSelectedSale] = useState(null)
  const [detailsSale, setDetailsSale] = useState(null)

  const [submitting, setSubmitting] = useState(false)

  const [saleForm, setSaleForm] = useState({
    dealer_id: '',
    pond_id: '',
    sale_date: today(),
    paid_amount: '0',
    payment_method: 'cash',
    notes: '',
    items: [emptyItem()],
  })

  const [paymentForm, setPaymentForm] = useState({
    payment_date: today(),
    amount: '',
    payment_method: 'cash',
    reference_number: '',
    notes: '',
  })

  const fetchData = useCallback(async () => {
    setLoading(true)

    try {
      const [salesRes, dealersRes, pondsRes, speciesRes] =
        await Promise.all([
          api.get('/fish-sales'),
          api.get('/dealers'),
          api.get('/ponds'),
          api.get('/fish-species'),
        ])

      setSales(getList(salesRes.data, ['sales']))
      setDealers(
        getList(dealersRes.data, ['dealers']).filter(
          (dealer) => dealer.status === 'active'
        )
      )
      setPonds(
        getList(pondsRes.data, ['ponds']).filter(
          (pond) => pond.status === 'active'
        )
      )
      setSpecies(
        getList(speciesRes.data, ['species', 'fishSpecies', 'fish_species'])
          .filter((item) => item.status === 'active')
      )
    } catch (error) {
      console.error('Failed to load sales data:', error)
      toast.error(
        error.response?.data?.message || 'Failed to load sales information.'
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const filteredSales = useMemo(() => {
    const search = searchTerm.trim().toLowerCase()

    if (!search) return sales

    return sales.filter((sale) =>
      [
        sale.invoice_number,
        sale.dealer_name,
        sale.pond_name,
        sale.payment_status,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(search))
    )
  }, [sales, searchTerm])

  const overview = useMemo(() => {
    return sales.reduce(
      (total, sale) => {
        total.salesAmount += Number(sale.total_amount || 0)
        total.received += Number(sale.paid_amount || 0)
        total.due += Number(sale.due_amount || 0)

        for (const item of sale.items || []) {
          total.soldKg += Number(item.quantity_kg || 0)
        }

        return total
      },
      {
        salesAmount: 0,
        received: 0,
        due: 0,
        soldKg: 0,
      }
    )
  }, [sales])

  const itemTotal = (item) =>
    Number(item.quantity_kg || 0) * Number(item.unit_price_per_kg || 0)

  const saleTotal = saleForm.items.reduce(
    (total, item) => total + itemTotal(item),
    0
  )

  const paidAmount = Number(saleForm.paid_amount || 0)
  const saleDue = saleTotal - paidAmount

  const updateSaleField = (field, value) => {
    setSaleForm((previous) => ({
      ...previous,
      [field]: value,
    }))
  }

  const updateSaleItem = (index, field, value) => {
    setSaleForm((previous) => ({
      ...previous,
      items: previous.items.map((item, itemIndex) =>
        itemIndex === index
          ? { ...item, [field]: value }
          : item
      ),
    }))
  }

  const addItemRow = () => {
    setSaleForm((previous) => ({
      ...previous,
      items: [...previous.items, emptyItem()],
    }))
  }

  const removeItemRow = (index) => {
    if (saleForm.items.length === 1) {
      toast.error('At least one fish item is required.')
      return
    }

    setSaleForm((previous) => ({
      ...previous,
      items: previous.items.filter((_, itemIndex) => itemIndex !== index),
    }))
  }

  const resetSaleForm = () => {
    setSaleForm({
      dealer_id: '',
      pond_id: '',
      sale_date: today(),
      paid_amount: '0',
      payment_method: 'cash',
      notes: '',
      items: [emptyItem()],
    })
  }

  const handleCreateSale = async (event) => {
    event.preventDefault()

    if (!saleForm.dealer_id || !saleForm.pond_id) {
      toast.error('Please select a dealer and pond.')
      return
    }

    if (!saleForm.sale_date) {
      toast.error('Please select a sale date.')
      return
    }

    if (saleForm.items.some(
      (item) =>
        !item.species_id ||
        Number(item.quantity_kg) <= 0 ||
        Number(item.unit_price_per_kg) <= 0
    )) {
      toast.error('Please complete all fish item information.')
      return
    }

    const speciesIds = saleForm.items.map((item) => item.species_id)

    if (new Set(speciesIds).size !== speciesIds.length) {
      toast.error('A fish species can only appear once in an invoice.')
      return
    }

    if (paidAmount < 0 || paidAmount > saleTotal) {
      toast.error('Paid amount cannot exceed the invoice total.')
      return
    }

    setSubmitting(true)

    try {
      const payload = {
        dealer_id: Number(saleForm.dealer_id),
        pond_id: Number(saleForm.pond_id),
        sale_date: saleForm.sale_date,
        paid_amount: paidAmount,
        payment_method: saleForm.payment_method,
        notes: saleForm.notes.trim() || null,
        items: saleForm.items.map((item) => ({
          species_id: Number(item.species_id),
          quantity_kg: Number(item.quantity_kg),
          unit_price_per_kg: Number(item.unit_price_per_kg),
          notes: item.notes.trim() || null,
        })),
      }

      const response = await api.post('/fish-sales', payload)

      toast.success(
        response.data?.message || 'Sale created successfully.'
      )

      setShowSaleModal(false)
      resetSaleForm()
      await fetchData()
    } catch (error) {
      console.error('Failed to create sale:', error)
      toast.error(
        error.response?.data?.message || 'Failed to create sale.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  const openPaymentModal = (sale) => {
    setSelectedSale(sale)
    setPaymentForm({
      payment_date: today(),
      amount: Number(sale.due_amount || 0).toString(),
      payment_method: 'cash',
      reference_number: '',
      notes: '',
    })
    setShowPaymentModal(true)
  }

  const handleAddPayment = async (event) => {
    event.preventDefault()

    if (!selectedSale) return

    const amount = Number(paymentForm.amount)

    if (!paymentForm.payment_date || amount <= 0) {
      toast.error('Please enter a valid payment date and amount.')
      return
    }

    if (amount > Number(selectedSale.due_amount || 0)) {
      toast.error('Payment cannot exceed the remaining due.')
      return
    }

    setSubmitting(true)

    try {
      const payload = {
        payment_date: paymentForm.payment_date,
        amount,
        payment_method: paymentForm.payment_method,
        reference_number: paymentForm.reference_number.trim() || null,
        notes: paymentForm.notes.trim() || null,
      }

      const response = await api.post(
        `/fish-sales/${selectedSale.id}/payments`,
        payload
      )

      toast.success(
        response.data?.message || 'Payment recorded successfully.'
      )

      setShowPaymentModal(false)
      setSelectedSale(null)
      await fetchData()
    } catch (error) {
      console.error('Failed to record payment:', error)
      toast.error(
        error.response?.data?.message || 'Failed to record payment.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  const openDetails = (sale) => {
    setDetailsSale(sale)
  }

  const StatusBadge = ({ status }) => {
    const config = statusStyles[status] || statusStyles.unpaid
    const Icon = config.icon

    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${config.className}`}
      >
        <Icon size={13} />
        {config.label}
      </span>
    )
  }

  const StatCard = ({ title, value, description, icon: Icon, accent }) => (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            {value}
          </p>
          <p className="mt-1 text-xs text-slate-500">{description}</p>
        </div>

        <div className={`rounded-xl p-3 ${accent}`}>
          <Icon size={22} />
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-6 pb-8">
      {/* Page Heading */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-emerald-700">
            <Waves size={16} />
            Fishery Operations
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Sales Management
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage fish sales, dealer invoices and payment collections.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={fetchData}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>

          <button
            onClick={() => setShowSaleModal(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-[#123D35] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1B5146]"
          >
            <Plus size={18} />
            Create New Sale
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Sales"
          value={formatMoney(overview.salesAmount)}
          description={`${sales.length} recorded invoices`}
          icon={ShoppingCart}
          accent="bg-emerald-50 text-emerald-700"
        />

        <StatCard
          title="Fish Sold"
          value={`${formatNumber(overview.soldKg)} KG`}
          description="Total quantity sold"
          icon={Fish}
          accent="bg-sky-50 text-sky-700"
        />

        <StatCard
          title="Amount Received"
          value={formatMoney(overview.received)}
          description="Payments collected"
          icon={Wallet}
          accent="bg-violet-50 text-violet-700"
        />

        <StatCard
          title="Total Due"
          value={formatMoney(overview.due)}
          description="Outstanding dealer payments"
          icon={ArrowDownRight}
          accent="bg-amber-50 text-amber-700"
        />
      </div>

      {/* Sales Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
              <ClipboardList size={20} className="text-emerald-700" />
              Sales Records
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              View invoices and manage dealer payments.
            </p>
          </div>

          <div className="relative w-full sm:max-w-xs">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search invoice, dealer, pond..."
              className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-64 items-center justify-center">
            <LoaderCircle size={30} className="animate-spin text-emerald-700" />
          </div>
        ) : filteredSales.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center px-5 text-center">
            <div className="rounded-2xl bg-emerald-50 p-4 text-emerald-700">
              <Package size={30} />
            </div>
            <h3 className="mt-4 text-base font-bold text-slate-800">
              {searchTerm ? 'No matching sales found' : 'No sales recorded yet'}
            </h3>
            <p className="mt-1 max-w-sm text-sm text-slate-500">
              {searchTerm
                ? 'Try searching with another invoice number, dealer or pond.'
                : 'Create your first fish sale to start tracking invoices and payments.'}
            </p>

            {!searchTerm && (
              <button
                onClick={() => setShowSaleModal(true)}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#123D35] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1B5146]"
              >
                <Plus size={16} />
                Create First Sale
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-4 font-semibold">Invoice</th>
                  <th className="px-5 py-4 font-semibold">Dealer</th>
                  <th className="px-5 py-4 font-semibold">Pond</th>
                  <th className="px-5 py-4 font-semibold">Date</th>
                  <th className="px-5 py-4 text-right font-semibold">Total</th>
                  <th className="px-5 py-4 text-right font-semibold">Paid</th>
                  <th className="px-5 py-4 text-right font-semibold">Due</th>
                  <th className="px-5 py-4 font-semibold">Status</th>
                  <th className="px-5 py-4 text-center font-semibold">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredSales.map((sale) => (
                  <tr
                    key={sale.id}
                    className="transition hover:bg-slate-50/80"
                  >
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-900">
                        {sale.invoice_number}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        {sale.items?.length || 0} fish item(s)
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <p className="font-medium text-slate-800">
                        {sale.dealer_name}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-600">
                      {sale.pond_name}
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-600">
                      {formatDate(sale.sale_date)}
                    </td>

                    <td className="px-5 py-4 text-right text-sm font-semibold text-slate-900">
                      {formatMoney(sale.total_amount)}
                    </td>

                    <td className="px-5 py-4 text-right text-sm font-medium text-emerald-700">
                      {formatMoney(sale.paid_amount)}
                    </td>

                    <td className="px-5 py-4 text-right text-sm font-medium text-rose-600">
                      {formatMoney(sale.due_amount)}
                    </td>

                    <td className="px-5 py-4">
                      <StatusBadge status={sale.payment_status} />
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openDetails(sale)}
                          title="View invoice details"
                          className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                        >
                          <Eye size={16} />
                        </button>

                        {Number(sale.due_amount) > 0 && (
                          <button
                            onClick={() => openPaymentModal(sale)}
                            title="Collect payment"
                            className="rounded-lg border border-emerald-200 bg-emerald-50 p-2 text-emerald-700 transition hover:bg-emerald-100"
                          >
                            <CreditCard size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && filteredSales.length > 0 && (
          <div className="border-t border-slate-100 px-5 py-3 text-xs text-slate-500">
            Showing {filteredSales.length} of {sales.length} sales records
          </div>
        )}
      </div>

      {/* Create Sale Modal */}
      {showSaleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-3 backdrop-blur-sm sm:p-6">
          <div className="flex max-h-[94vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Create New Sale
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Create one invoice with multiple fish species.
                </p>
              </div>

              <button
                onClick={() => {
                  setShowSaleModal(false)
                  resetSaleForm()
                }}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleCreateSale}
              className="flex min-h-0 flex-1 flex-col"
            >
              <div className="space-y-6 overflow-y-auto p-5 sm:p-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Dealer <span className="text-rose-500">*</span>
                    </label>
                    <select
                      required
                      value={saleForm.dealer_id}
                      onChange={(event) =>
                        updateSaleField('dealer_id', event.target.value)
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                    >
                      <option value="">Select dealer</option>
                      {dealers.map((dealer) => (
                        <option key={dealer.id} value={dealer.id}>
                          {dealer.dealer_name}
                        </option>
                      ))}
                    </select>
                    {dealers.length === 0 && (
                      <p className="mt-1 text-xs text-rose-500">
                        No active dealers found.
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Pond <span className="text-rose-500">*</span>
                    </label>
                    <select
                      required
                      value={saleForm.pond_id}
                      onChange={(event) =>
                        updateSaleField('pond_id', event.target.value)
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                    >
                      <option value="">Select pond</option>
                      {ponds.map((pond) => (
                        <option key={pond.id} value={pond.id}>
                          {pond.pond_name}
                        </option>
                      ))}
                    </select>
                    {ponds.length === 0 && (
                      <p className="mt-1 text-xs text-rose-500">
                        No active ponds found.
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Sale Date <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      max={today()}
                      value={saleForm.sale_date}
                      onChange={(event) =>
                        updateSaleField('sale_date', event.target.value)
                      }
                      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                    />
                  </div>
                </div>

                {/* Fish Items */}
                <div className="overflow-hidden rounded-xl border border-slate-200">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50 px-4 py-3">
                    <div>
                      <h3 className="flex items-center gap-2 text-sm font-bold text-slate-800">
                        <Fish size={17} className="text-emerald-700" />
                        Fish Sale Items
                      </h3>
                      <p className="mt-1 text-xs text-slate-500">
                        Add each species once with its total sold quantity.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={addItemRow}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-white px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50"
                    >
                      <Plus size={15} />
                      Add Species
                    </button>
                  </div>

                  <div className="space-y-4 p-4">
                    {saleForm.items.map((item, index) => (
                      <div
                        key={index}
                        className="rounded-xl border border-slate-200 bg-white p-3"
                      >
                        <div className="mb-3 flex items-center justify-between">
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                            Item {index + 1}
                          </span>

                          <button
                            type="button"
                            onClick={() => removeItemRow(index)}
                            className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50"
                            title="Remove item"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                          <div>
                            <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                              Fish Species
                            </label>
                            <select
                              required
                              value={item.species_id}
                              onChange={(event) =>
                                updateSaleItem(
                                  index,
                                  'species_id',
                                  event.target.value
                                )
                              }
                              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-600"
                            >
                              <option value="">Select species</option>
                              {species.map((fish) => (
                                <option key={fish.id} value={fish.id}>
                                  {fish.species_name}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                              Quantity (KG)
                            </label>
                            <input
                              type="number"
                              required
                              min="0.01"
                              step="0.01"
                              value={item.quantity_kg}
                              onChange={(event) =>
                                updateSaleItem(
                                  index,
                                  'quantity_kg',
                                  event.target.value
                                )
                              }
                              placeholder="e.g. 100"
                              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-600"
                            />
                          </div>

                          <div>
                            <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                              Price Per KG (৳)
                            </label>
                            <input
                              type="number"
                              required
                              min="0.01"
                              step="0.01"
                              value={item.unit_price_per_kg}
                              onChange={(event) =>
                                updateSaleItem(
                                  index,
                                  'unit_price_per_kg',
                                  event.target.value
                                )
                              }
                              placeholder="e.g. 180"
                              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-600"
                            />
                          </div>

                          <div>
                            <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                              Subtotal
                            </label>
                            <div className="flex h-[42px] items-center rounded-lg bg-emerald-50 px-3 text-sm font-bold text-emerald-800">
                              {formatMoney(itemTotal(item))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    {species.length === 0 && (
                      <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-700">
                        No active fish species found. Please add a fish species first.
                      </p>
                    )}
                  </div>
                </div>

                {/* Payment and Summary */}
                <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                  <div className="space-y-4">
                    <h3 className="flex items-center gap-2 text-sm font-bold text-slate-800">
                      <Banknote size={17} className="text-emerald-700" />
                      Initial Payment
                    </h3>

                    <div>
                      <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                        Amount Paid (৳)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={saleForm.paid_amount}
                        onChange={(event) =>
                          updateSaleField('paid_amount', event.target.value)
                        }
                        placeholder="0"
                        className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-600"
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                        Payment Method
                      </label>
                      <select
                        value={saleForm.payment_method}
                        onChange={(event) =>
                          updateSaleField('payment_method', event.target.value)
                        }
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-600"
                      >
                        {paymentMethods.map((method) => (
                          <option key={method.value} value={method.value}>
                            {method.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                        Notes
                      </label>
                      <textarea
                        rows="2"
                        value={saleForm.notes}
                        onChange={(event) =>
                          updateSaleField('notes', event.target.value)
                        }
                        placeholder="Optional sale notes..."
                        className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-600"
                      />
                    </div>
                  </div>

                  <div className="h-fit rounded-xl bg-[#123D35] p-5 text-white">
                    <h3 className="mb-4 flex items-center gap-2 text-sm font-bold">
                      <ReceiptText size={18} />
                      Invoice Summary
                    </h3>

                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between text-emerald-100">
                        <span>Total Fish Items</span>
                        <span>{saleForm.items.length}</span>
                      </div>

                      <div className="flex justify-between text-emerald-100">
                        <span>Total Quantity</span>
                        <span>
                          {formatNumber(
                            saleForm.items.reduce(
                              (sum, item) =>
                                sum + Number(item.quantity_kg || 0),
                              0
                            )
                          )}{' '}
                          KG
                        </span>
                      </div>

                      <div className="flex justify-between border-t border-white/15 pt-3">
                        <span>Invoice Total</span>
                        <span className="font-bold">
                          {formatMoney(saleTotal)}
                        </span>
                      </div>

                      <div className="flex justify-between text-emerald-200">
                        <span>Paid Amount</span>
                        <span>{formatMoney(paidAmount)}</span>
                      </div>

                      <div className="flex justify-between border-t border-white/15 pt-3 text-base font-bold">
                        <span>Remaining Due</span>
                        <span className={saleDue < 0 ? 'text-rose-300' : 'text-amber-300'}>
                          {formatMoney(saleDue)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col-reverse justify-end gap-2 border-t border-slate-100 bg-white px-5 py-4 sm:flex-row sm:px-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowSaleModal(false)
                    resetSaleForm()
                  }}
                  className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    submitting ||
                    dealers.length === 0 ||
                    ponds.length === 0 ||
                    species.length === 0 ||
                    saleTotal <= 0 ||
                    saleDue < 0
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#123D35] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#1B5146] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting ? (
                    <LoaderCircle size={17} className="animate-spin" />
                  ) : (
                    <Save size={17} />
                  )}
                  {submitting ? 'Saving...' : 'Create Sale'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Collection Modal */}
      {showPaymentModal && selectedSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-3 backdrop-blur-sm">
          <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Collect Payment
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Invoice: {selectedSale.invoice_number}
                </p>
              </div>

              <button
                onClick={() => setShowPaymentModal(false)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddPayment} className="space-y-5 p-5">
              <div className="rounded-xl bg-amber-50 p-4">
                <p className="text-xs font-semibold text-amber-700">
                  Remaining Due
                </p>
                <p className="mt-1 text-2xl font-bold text-amber-900">
                  {formatMoney(selectedSale.due_amount)}
                </p>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Payment Date
                </label>
                <input
                  type="date"
                  required
                  max={today()}
                  min={String(selectedSale.sale_date).slice(0, 10)}
                  value={paymentForm.payment_date}
                  onChange={(event) =>
                    setPaymentForm((previous) => ({
                      ...previous,
                      payment_date: event.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Payment Amount (৳)
                </label>
                <input
                  type="number"
                  required
                  min="0.01"
                  max={selectedSale.due_amount}
                  step="0.01"
                  value={paymentForm.amount}
                  onChange={(event) =>
                    setPaymentForm((previous) => ({
                      ...previous,
                      amount: event.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Payment Method
                </label>
                <select
                  value={paymentForm.payment_method}
                  onChange={(event) =>
                    setPaymentForm((previous) => ({
                      ...previous,
                      payment_method: event.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-600"
                >
                  {paymentMethods.map((method) => (
                    <option key={method.value} value={method.value}>
                      {method.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Reference Number
                </label>
                <input
                  type="text"
                  value={paymentForm.reference_number}
                  onChange={(event) =>
                    setPaymentForm((previous) => ({
                      ...previous,
                      reference_number: event.target.value,
                    }))
                  }
                  placeholder="Optional transaction/reference number"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Notes
                </label>
                <textarea
                  rows="2"
                  value={paymentForm.notes}
                  onChange={(event) =>
                    setPaymentForm((previous) => ({
                      ...previous,
                      notes: event.target.value,
                    }))
                  }
                  placeholder="Optional payment notes..."
                  className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-600"
                />
              </div>

              <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    submitting ||
                    Number(paymentForm.amount) <= 0 ||
                    Number(paymentForm.amount) > Number(selectedSale.due_amount)
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#123D35] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1B5146] disabled:opacity-50"
                >
                  {submitting ? (
                    <LoaderCircle size={17} className="animate-spin" />
                  ) : (
                    <CreditCard size={17} />
                  )}
                  {submitting ? 'Saving...' : 'Record Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invoice Details Modal */}
      {detailsSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-3 backdrop-blur-sm sm:p-6">
          <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="sticky top-0 flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4 sm:px-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Invoice Details
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  {detailsSale.invoice_number}
                </p>
              </div>

              <button
                onClick={() => setDetailsSale(null)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-5 p-5 sm:p-6">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">Dealer</p>
                  <p className="mt-1 font-bold text-slate-900">
                    {detailsSale.dealer_name}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">Pond</p>
                  <p className="mt-1 font-bold text-slate-900">
                    {detailsSale.pond_name}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">Sale Date</p>
                  <p className="mt-1 font-bold text-slate-900">
                    {formatDate(detailsSale.sale_date)}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-800">
                  <Fish size={17} className="text-emerald-700" />
                  Sold Fish Items
                </h3>

                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full min-w-[550px] text-left text-sm">
                    <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                      <tr>
                        <th className="px-4 py-3">Species</th>
                        <th className="px-4 py-3 text-right">Quantity</th>
                        <th className="px-4 py-3 text-right">Price / KG</th>
                        <th className="px-4 py-3 text-right">Subtotal</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {(detailsSale.items || []).map((item) => (
                        <tr key={item.id}>
                          <td className="px-4 py-3 font-medium text-slate-800">
                            {item.species_name}
                          </td>
                          <td className="px-4 py-3 text-right text-slate-600">
                            {formatNumber(item.quantity_kg)} KG
                          </td>
                          <td className="px-4 py-3 text-right text-slate-600">
                            {formatMoney(item.unit_price_per_kg)}
                          </td>
                          <td className="px-4 py-3 text-right font-semibold text-slate-900">
                            {formatMoney(item.subtotal)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div>
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-800">
                    <Wallet size={17} className="text-emerald-700" />
                    Payment History
                  </h3>

                  {(detailsSale.payments || []).length === 0 ? (
                    <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
                      No payment records available.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {detailsSale.payments.map((payment) => (
                        <div
                          key={payment.id}
                          className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 p-3"
                        >
                          <div>
                            <p className="text-sm font-semibold text-slate-800">
                              {formatDate(payment.payment_date)}
                            </p>
                            <p className="mt-1 text-xs capitalize text-slate-500">
                              {payment.payment_method?.replace('_', ' ')}
                              {payment.reference_number
                                ? ` · ${payment.reference_number}`
                                : ''}
                            </p>
                          </div>

                          <p className="whitespace-nowrap text-sm font-bold text-emerald-700">
                            +{formatMoney(payment.amount)}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="h-fit rounded-xl bg-[#123D35] p-5 text-white">
                  <h3 className="mb-4 text-sm font-bold">Payment Summary</h3>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between text-emerald-100">
                      <span>Total Amount</span>
                      <span>{formatMoney(detailsSale.total_amount)}</span>
                    </div>

                    <div className="flex justify-between text-emerald-200">
                      <span>Amount Paid</span>
                      <span>{formatMoney(detailsSale.paid_amount)}</span>
                    </div>

                    <div className="flex justify-between border-t border-white/15 pt-3 font-bold">
                      <span>Remaining Due</span>
                      <span className="text-amber-300">
                        {formatMoney(detailsSale.due_amount)}
                      </span>
                    </div>

                    <div className="pt-2">
                      <StatusBadge status={detailsSale.payment_status} />
                    </div>
                  </div>

                  {Number(detailsSale.due_amount) > 0 && (
                    <button
                      onClick={() => {
                        const sale = detailsSale
                        setDetailsSale(null)
                        openPaymentModal(sale)
                      }}
                      className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-[#123D35] transition hover:bg-emerald-50"
                    >
                      <CreditCard size={16} />
                      Collect Due Payment
                    </button>
                  )}
                </div>
              </div>

              {detailsSale.notes && (
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase text-slate-500">
                    Notes
                  </p>
                  <p className="mt-1 text-sm text-slate-700">
                    {detailsSale.notes}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default FishSaleManagement
