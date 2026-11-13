import { useEffect, useState } from 'react'
import axios from 'axios'
import {
  Package,
  ShoppingBag,
  Utensils,
  Warehouse,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react'
import { toast } from 'sonner'

const API_URL = 'http://localhost:5000'

const formatNumber = (value) =>
  Number(value || 0).toLocaleString('en-US', {
    maximumFractionDigits: 2,
  })

const FeedStockManagement = () => {
  const [stocks, setStocks] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchStocks = async () => {
    try {
      setLoading(true)

      const response = await axios.get(`${API_URL}/feed-stock`, {
        withCredentials: true,
      })

      setStocks(response.data.stocks || [])
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Failed to load feed stock.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStocks()
  }, [])

  const totalPurchased = stocks.reduce(
    (total, item) => total + Number(item.total_purchased_kg || 0),
    0
  )

  const totalUsed = stocks.reduce(
    (total, item) => total + Number(item.total_used_kg || 0),
    0
  )

  const availableStock = stocks.reduce(
    (total, item) => total + Number(item.available_stock_kg || 0),
    0
  )

  const summaryCards = [
    {
      title: 'Total Purchased',
      value: totalPurchased,
      icon: ShoppingBag,
      description: 'Feed purchased from suppliers',
    },
    {
      title: 'Total Feed Used',
      value: totalUsed,
      icon: Utensils,
      description: 'Feed consumed by ponds',
    },
    {
      title: 'Available Stock',
      value: availableStock,
      icon: Warehouse,
      description: 'Remaining feed in inventory',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-emerald-700">
            <Package size={17} />
            Inventory Management
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Feed Stock
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Monitor purchased feed, daily consumption and remaining inventory.
          </p>
        </div>

        <button
          onClick={fetchStocks}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Refresh Stock
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {summaryCards.map((card) => {
          const Icon = card.icon

          return (
            <div
              key={card.title}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    {card.title}
                  </p>

                  <h2 className="mt-3 text-2xl font-bold text-slate-900">
                    {loading ? '—' : `${formatNumber(card.value)} kg`}
                  </h2>
                </div>

                <div className="rounded-xl bg-emerald-50 p-3 text-emerald-700">
                  <Icon size={21} />
                </div>
              </div>

              <p className="mt-3 text-xs text-slate-500">
                {card.description}
              </p>
            </div>
          )
        })}
      </div>

      {/* Stock Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="font-semibold text-slate-900">
            Feed Inventory Details
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Feed-wise purchase, consumption and available quantity.
          </p>
        </div>

        {loading ? (
          <div className="p-10 text-center text-sm text-slate-500">
            Loading feed inventory...
          </div>
        ) : stocks.length === 0 ? (
          <div className="p-10 text-center">
            <Package className="mx-auto mb-3 text-slate-300" size={35} />
            <p className="font-medium text-slate-700">
              No feed stock found
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Add a feed purchase to see inventory details.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[750px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-4 font-semibold">Feed Type</th>
                  <th className="px-5 py-4 font-semibold">Brand</th>
                  <th className="px-5 py-4 font-semibold text-right">
                    Purchased
                  </th>
                  <th className="px-5 py-4 font-semibold text-right">
                    Used
                  </th>
                  <th className="px-5 py-4 font-semibold text-right">
                    Available
                  </th>
                  <th className="px-5 py-4 font-semibold text-center">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {stocks.map((item) => {
                  const available = Number(item.available_stock_kg || 0)
                  const purchased = Number(item.total_purchased_kg || 0)

                  const stockPercentage =
                    purchased > 0
                      ? Math.max(0, (available / purchased) * 100)
                      : 0

                  const isLowStock = available <= 100

                  return (
                    <tr
                      key={item.feed_type_id}
                      className="transition hover:bg-slate-50/70"
                    >
                      <td className="px-5 py-4 font-semibold text-slate-800">
                        {item.feed_name}
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {item.brand || '—'}
                      </td>

                      <td className="px-5 py-4 text-right font-medium text-slate-700">
                        {formatNumber(item.total_purchased_kg)} kg
                      </td>

                      <td className="px-5 py-4 text-right font-medium text-slate-700">
                        {formatNumber(item.total_used_kg)} kg
                      </td>

                      <td className="px-5 py-4 text-right">
                        <div className="font-bold text-slate-900">
                          {formatNumber(available)} kg
                        </div>

                        <div className="ml-auto mt-2 h-1.5 w-24 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className={`h-full rounded-full ${
                              isLowStock ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{
                              width: `${Math.min(stockPercentage, 100)}%`,
                            }}
                          />
                        </div>
                      </td>

                      <td className="px-5 py-4 text-center">
                        {isLowStock ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                            <AlertTriangle size={13} />
                            Low Stock
                          </span>
                        ) : (
                          <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                            In Stock
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default FeedStockManagement