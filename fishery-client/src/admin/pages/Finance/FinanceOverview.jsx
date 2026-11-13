
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  ChartNoAxesCombined,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'

const summaryCards = [
  {
    title: 'Total Income',
    value: '৳ 0.00',
    description: 'Total money received',
    icon: TrendingUp,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
  },
  {
    title: 'Total Expenses',
    value: '৳ 0.00',
    description: 'Total money spent',
    icon: TrendingDown,
    color: 'text-rose-600',
    bg: 'bg-rose-50',
  },
  {
    title: 'Net Profit',
    value: '৳ 0.00',
    description: 'Income minus expenses',
    icon: ChartNoAxesCombined,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  {
    title: 'Net Loss',
    value: '৳ 0.00',
    description: 'Current financial loss',
    icon: Wallet,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
  },
]

function FinanceOverview() {
  return (
    <div className="space-y-6">
      {/* Page Heading */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-emerald-700">
            Financial Management
          </p>
          <h1 className="mt-1 text-2xl font-bold text-[#123D35]">
            Finance Overview
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Monitor your fishery income, expenses and overall financial
            performance.
          </p>
        </div>

        <div className="rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-800">
          Financial Summary
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
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    {card.title}
                  </p>
                  <h2 className="mt-3 text-2xl font-bold text-gray-800">
                    {card.value}
                  </h2>
                </div>

                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.bg} ${card.color}`}
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

      {/* Financial Activity */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5 xl:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-[#123D35]">
                Financial Performance
              </h3>
              <p className="mt-1 text-xs text-gray-500">
                Income and expense overview
              </p>
            </div>

            <ChartNoAxesCombined
              size={21}
              className="text-emerald-600"
            />
          </div>

          <div className="flex min-h-[220px] flex-col items-center justify-center text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
              <ChartNoAxesCombined size={27} />
            </div>

            <p className="mt-4 text-sm font-semibold text-gray-700">
              Financial data will appear here
            </p>
            <p className="mt-1 max-w-sm text-xs text-gray-400">
              Your income and expense trends will be displayed after
              connecting the financial records.
            </p>
          </div>
        </div>

        {/* Quick Information */}
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h3 className="font-bold text-[#123D35]">
            Finance Summary
          </h3>

          <div className="mt-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
                <ArrowUpRight size={19} />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700">
                  Income Sources
                </p>
                <p className="text-xs text-gray-400">
                  Fish sales and other income
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-rose-50 p-2 text-rose-600">
                <ArrowDownRight size={19} />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700">
                  Expense Sources
                </p>
                <p className="text-xs text-gray-400">
                  Feed purchases and operating costs
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-lg bg-[#F5F7F4] p-4">
            <p className="text-xs leading-5 text-gray-500">
              Financial figures will be calculated automatically from
              recorded income and expenses.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FinanceOverview
