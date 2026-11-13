
import {
  Waves,
  Fish,
  Sprout,
  Truck,
  ArrowUpRight,
} from 'lucide-react'

const statistics = [
  {
    icon: Waves,
    value: 'Pond',
    label: 'Management',
    description: 'Organized pond operations',
  },
  {
    icon: Fish,
    value: 'Fresh',
    label: 'Fish Production',
    description: 'Focused on quality and growth',
  },
  {
    icon: Sprout,
    value: 'Sustainable',
    label: 'Aquaculture',
    description: 'Responsible farming practices',
  },
  {
    icon: Truck,
    value: 'Wholesale',
    label: 'Distribution',
    description: 'Connecting harvests to markets',
  },
]

function FisheryStats() {
  return (
    <section className="relative border-b border-[#E5ECE6] bg-white">
      <div className="mx-auto max-w-[1440px] px-5 py-12 sm:px-8 sm:py-14 lg:px-16 lg:py-16">

        <div className="grid gap-10 lg:grid-cols-[0.85fr_2fr] lg:items-center lg:gap-14">

          {/* Section Introduction */}
          <div className="max-w-sm">
            <div className="mb-4 flex items-center gap-2">
              <span className="h-px w-8 bg-[#16845F]" />

              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#16845F]">
                Our Capabilities
              </span>
            </div>

            <h2 className="text-2xl font-semibold leading-tight tracking-[-0.04em] text-[#183F35] sm:text-3xl">
              A Connected Approach to
              <span className="text-[#16845F]"> Fishery Management.</span>
            </h2>

            <p className="mt-4 text-sm leading-7 text-[#718078]">
              Bringing essential fishery operations together through
              organized management, responsible production and reliable
              distribution.
            </p>
          </div>

          {/* Statistics / Highlights */}
          <div className="grid grid-cols-2 border-l border-[#E8EEE9] sm:grid-cols-4">

            {statistics.map((item, index) => {
              const Icon = item.icon

              return (
                <div
                  key={item.label}
                  className={`group relative flex flex-col border-[#E8EEE9] px-4 py-5 transition-colors duration-300 hover:bg-[#F5F9F6] sm:px-5 sm:py-6 ${
                    index % 2 === 0 ? 'border-r' : 'border-r-0'
                  } ${
                    index < 2 ? 'border-b sm:border-b-0' : ''
                  } ${
                    index === 1 ? 'sm:border-r' : ''
                  }`}
                >
                  <div className="mb-5 flex h-10 w-10 items-center justify-center bg-[#EAF4ED] text-[#16845F] transition-colors duration-300 group-hover:bg-[#183F35] group-hover:text-white">
                    <Icon size={19} strokeWidth={1.7} />
                  </div>

                  <h3 className="text-lg font-semibold tracking-tight text-[#183F35] sm:text-xl">
                    {item.value}
                  </h3>

                  <p className="mt-1 text-xs font-semibold text-[#16845F] sm:text-sm">
                    {item.label}
                  </p>

                  <p className="mt-3 text-[11px] leading-5 text-[#859189] sm:text-xs">
                    {item.description}
                  </p>

                  <ArrowUpRight
                    size={15}
                    className="absolute right-3 top-4 text-[#A8B8AD] opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100"
                  />
                </div>
              )
            })}

          </div>
        </div>
      </div>
    </section>
  )
}

export default FisheryStats
