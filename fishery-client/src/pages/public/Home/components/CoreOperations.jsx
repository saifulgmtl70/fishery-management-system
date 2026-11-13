import {
  ArrowUpRight,
  Waves,
  Fish,
  Sprout,
  Package,
  Truck,
  Leaf,
} from 'lucide-react'

const operations = [
  {
    number: '01',
    icon: Waves,
    title: 'Pond Management',
    description:
      'Manage individual ponds, monitor production cycles and keep pond activities organized.',
  },
  {
    number: '02',
    icon: Fish,
    title: 'Fish Production',
    description:
      'Track fish species, stocking quantities, growth progress and production records.',
  },
  {
    number: '03',
    icon: Sprout,
    title: 'Feed & Fish Care',
    description:
      'Organize feed purchases, daily feeding activities and essential fish care records.',
  },
  {
    number: '04',
    icon: Package,
    title: 'Harvesting Operations',
    description:
      'Coordinate harvesting activities and maintain accurate records of harvested fish.',
  },
  {
    number: '05',
    icon: Truck,
    title: 'Wholesale Supply',
    description:
      'Manage dealer relationships, bulk fish sales, deliveries and payment records.',
  },
  {
    number: '06',
    icon: Leaf,
    title: 'Lake Management',
    description:
      'Organize lake fishing activities, visitor services and recreational fishing operations.',
  },
]

const CoreOperations = () => {
  return (
    <section className="bg-white py-20 sm:py-24 lg:py-28">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-16">

        {/* Section Heading */}
        <div className="mb-12 flex flex-col justify-between gap-6 lg:mb-16 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <div className="mb-5 flex items-center gap-3">
              <span className="h-[2px] w-9 bg-[#167D62]" />
              <span className="text-xs font-bold tracking-[0.22em] text-[#167D62]">
                WHAT WE DO
              </span>
            </div>

            <h2 className="text-3xl leading-tight font-semibold tracking-tight text-[#123D35] sm:text-4xl lg:text-[46px]">
              Everything Behind a
              <span className="text-[#167D62]"> Well-Managed Fishery.</span>
            </h2>
          </div>

          <p className="max-w-md text-[15px] leading-8 text-[#718078]">
            From pond preparation to wholesale distribution, every operation
            plays an important role in maintaining an organized and productive
            fishery.
          </p>
        </div>

        {/* Operations Grid */}
        <div className="grid grid-cols-1 border-l border-t border-[#E7EEE8] sm:grid-cols-2 lg:grid-cols-3">
          {operations.map((item) => {
            const Icon = item.icon

            return (
              <div
                key={item.number}
                className="group relative border-b border-r border-[#E7EEE8] p-7 transition-colors duration-300 hover:bg-[#F7FAF7] sm:p-8 lg:p-9"
              >
                {/* Number and Icon */}
                <div className="mb-9 flex items-start justify-between">
                  <span className="text-xs font-semibold tracking-widest text-[#A2B1A7]">
                    / {item.number}
                  </span>

                  <div className="flex h-12 w-12 items-center justify-center bg-[#EAF4ED] text-[#167D62] transition-all duration-300 group-hover:bg-[#123D35] group-hover:text-white">
                    <Icon size={22} strokeWidth={1.7} />
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold text-[#193E32]">
                  {item.title}
                </h3>

                <p className="mt-3 max-w-sm text-sm leading-7 text-[#7B8B80]">
                  {item.description}
                </p>

                {/* Bottom Accent */}
                <div className="mt-7 flex items-center justify-between">
                  <span className="h-[2px] w-9 bg-[#D5E5D9] transition-all duration-300 group-hover:w-16 group-hover:bg-[#167D62]" />

                  <ArrowUpRight
                    size={18}
                    className="text-[#9BAAA0] transition-all duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-[#167D62]"
                  />
                </div>
              </div>
            )
          })}
        </div>

      </div>
    </section>
  )
}

export default CoreOperations