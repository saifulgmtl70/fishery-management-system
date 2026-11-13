
import { useEffect, useState } from 'react'
import {
  Package,
  ShoppingBag,
  Warehouse,
  Utensils,
  ArrowRight,
  RefreshCw,
  CalendarDays,
  Wallet,
  LoaderCircle,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import api from '../../../services/api'

function FeedManagement() {
  const navigate = useNavigate()

  const [summary, setSummary] = useState({
    totalPurchased: 0,
    totalUsed: 0,
    availableStock: 0,
    totalPurchaseCost: 0,
  })

  const [loading, setLoading] = useState(true)

  const fetchSummary = async () => {
    try {
      setLoading(true)

      const [
        stockResponse,
        purchaseResponse,
        feedingResponse,
      ] = await Promise.all([
        api.get('/feed-stock'),
        api.get('/feed-purchases'),
        api.get('/daily-feedings'),
      ])

      const stocks = stockResponse.data.stocks || []
      const purchases = purchaseResponse.data.purchases || []
      const feedings = feedingResponse.data.feedings || []

      const totalPurchased = stocks.reduce(
        (total, item) =>
          total + Number(item.total_purchased_kg || 0),
        0
      )

      const totalUsed = stocks.reduce(
        (total, item) =>
          total + Number(item.total_used_kg || 0),
        0
      )

      const availableStock = stocks.reduce(
        (total, item) =>
          total + Number(item.available_stock_kg || 0),
        0
      )

      const totalPurchaseCost = purchases.reduce(
        (total, item) =>
          total + Number(item.total_cost || 0),
        0
      )

      setSummary({
        totalPurchased,
        totalUsed,
        availableStock,
        totalPurchaseCost,
      })
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          'Failed to load feed information.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSummary()
  }, [])

  const formatNumber = (value) =>
    Number(value || 0).toLocaleString('en-US', {
      maximumFractionDigits: 3,
    })

  const summaryCards = [
    {
      title: 'Total Feed Purchased',
      value: `${formatNumber(summary.totalPurchased)} kg`,
      description: 'Total quantity purchased',
      icon: ShoppingBag,
      iconStyle: 'bg-blue-50 text-blue-700',
    },
    {
      title: 'Total Feed Used',
      value: `${formatNumber(summary.totalUsed)} kg`,
      description: 'Total quantity given to ponds',
      icon: Utensils,
      iconStyle: 'bg-amber-50 text-amber-700',
    },
    {
      title: 'Available Feed Stock',
      value: `${formatNumber(summary.availableStock)} kg`,
      description: 'Current remaining quantity',
      icon: Warehouse,
      iconStyle: 'bg-emerald-50 text-emerald-700',
    },
    {
      title: 'Total Purchase Cost',
      value: `৳ ${formatNumber(summary.totalPurchaseCost)}`,
      description: 'Total feed purchase amount',
      icon: Wallet,
      iconStyle: 'bg-purple-50 text-purple-700',
    },
  ]

  const managementModules = [
    {
      title: 'Feed Types',
      description: 'Manage feed categories, names and brands.',
      icon: Package,
      path: '/dashboard/feed-types',
      iconStyle: 'bg-emerald-50 text-emerald-700',
    },
    {
      title: 'Feed Suppliers',
      description: 'Manage supplier contact information.',
      icon: ShoppingBag,
      path: '/dashboard/feed-suppliers',
      iconStyle: 'bg-blue-50 text-blue-700',
    },
    {
      title: 'Feed Purchases',
      description: 'Record purchased feed quantity and cost.',
      icon: Warehouse,
      path: '/dashboard/feed-purchases',
      iconStyle: 'bg-amber-50 text-amber-700',
    },
    {
      title: 'Daily Feeding',
      description: 'Record daily feed usage for each pond.',
      icon: Utensils,
      path: '/dashboard/daily-feeding',
      iconStyle: 'bg-purple-50 text-purple-700',
    },
    {
      title: 'Feed Stock',
      description: 'Monitor available feed inventory.',
      icon: Package,
      path: '/dashboard/feed-stock',
      iconStyle: 'bg-teal-50 text-teal-700',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-medium text-emerald-700">
            Fishery Operations
          </p>

          <h1 className="mt-1 text-2xl font-bold text-slate-900">
            Feed Management
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Monitor feed purchases, inventory and daily pond feeding.
          </p>
        </div>

        <button
          onClick={fetchSummary}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-60"
        >
          <RefreshCw
            size={17}
            className={loading ? 'animate-spin' : ''}
          />
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => {
          const Icon = card.icon

          return (
            <div
              key={card.title}
              className="rounded-2xl border border-slate-200 bg-white p-5"
            >
              <div className="flex items-center justify-between">
                <div className={`rounded-xl p-3 ${card.iconStyle}`}>
                  <Icon size={21} />
                </div>
              </div>

              <p className="mt-4 text-sm text-slate-500">
                {card.title}
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                {loading ? (
                  <LoaderCircle
                    size={21}
                    className="animate-spin text-emerald-700"
                  />
                ) : (
                  card.value
                )}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                {card.description}
              </p>
            </div>
          )
        })}
      </div>

      {/* Management Modules */}
      <div>
        <div className="mb-4">
          <h2 className="text-lg font-bold text-slate-900">
            Feed Operations
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Select a module to manage your feed operations.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {managementModules.map((module) => {
            const Icon = module.icon

            return (
              <button
                key={module.title}
                onClick={() => navigate(module.path)}
                className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 text-left transition hover:border-emerald-300 hover:shadow-md"
              >
                <div className={`rounded-xl p-3 ${module.iconStyle}`}>
                  <Icon size={24} />
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-slate-900">
                    {module.title}
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    {module.description}
                  </p>
                </div>

                <ArrowRight
                  size={19}
                  className="shrink-0 text-slate-400 transition group-hover:translate-x-1 group-hover:text-emerald-700"
                />
              </button>
            )
          })}
        </div>
      </div>

      {/* Information */}
      <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-5">
        <div className="flex gap-3">
          <CalendarDays
            size={21}
            className="mt-0.5 shrink-0 text-emerald-700"
          />

          <div>
            <h3 className="font-semibold text-slate-900">
              Feed Inventory Tracking
            </h3>

            <p className="mt-1 text-sm leading-6 text-slate-600">
              Feed inventory is calculated automatically from
              purchase records and daily feeding records.
              When feed is given to a pond, available stock
              decreases automatically.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FeedManagement
