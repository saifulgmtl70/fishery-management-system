
function DashboardHome() {
  const stats = [
    { title: 'Total Ponds', value: '11' },
    { title: 'Active Fish Cycles', value: '—' },
    { title: 'Feed Inventory', value: '—' },
    { title: 'Outstanding Dues', value: '—' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#123D35]">
        Overview
      </h1>

      <p className="text-gray-500 mt-2 mb-8">
        Welcome to your Fishery Management System.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {stats.map((item) => (
          <div key={item.title} className="bg-white border border-gray-200 rounded-lg p-6">
            <p className="text-sm text-gray-500">{item.title}</p>
            <h2 className="text-3xl font-bold text-[#123D35] mt-3">
              {item.value}
            </h2>
          </div>
        ))}
      </div>
    </div>
  )
}

export default DashboardHome
