import {
  Waves,
  Fish,
  Wheat,
  Activity,
  Scale,
  Truck,
  ArrowRight,
} from 'lucide-react'

const journeySteps = [
  {
    number: '01',
    icon: Waves,
    title: 'Pond Preparation',
    description:
      'Prepare and maintain pond conditions before starting a new fish production cycle.',
  },
  {
    number: '02',
    icon: Fish,
    title: 'Fish Stocking',
    description:
      'Introduce healthy fingerlings into selected ponds and record stocking details.',
  },
  {
    number: '03',
    icon: Wheat,
    title: 'Feeding & Care',
    description:
      'Maintain regular feeding schedules and provide proper care throughout the cycle.',
  },
  {
    number: '04',
    icon: Activity,
    title: 'Growth Monitoring',
    description:
      'Observe fish growth, monitor pond conditions and maintain production records.',
  },
  {
    number: '05',
    icon: Scale,
    title: 'Fish Harvesting',
    description:
      'Harvest mature fish, measure actual quantities and prepare them for selling.',
  },
  {
    number: '06',
    icon: Truck,
    title: 'Wholesale Supply',
    description:
      'Organize bulk orders and deliver harvested fish to dealers and markets.',
  },
]

const ProductionJourney = () => {
  return (
    <section className="overflow-hidden bg-[#F7F8F5] py-20 sm:py-24 lg:py-28">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-16">

        {/* Heading */}
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <div className="mb-5 flex items-center justify-center gap-3">
            <span className="h-[2px] w-9 bg-[#167D62]" />
            <span className="text-xs font-bold tracking-[0.22em] text-[#167D62]">
              FROM POND TO MARKET
            </span>
            <span className="h-[2px] w-9 bg-[#167D62]" />
          </div>

          <h2 className="text-3xl leading-tight font-semibold tracking-tight text-[#123D35] sm:text-4xl lg:text-[46px]">
            Every Step Matters in
            <span className="text-[#167D62]"> Fish Production.</span>
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-[15px] leading-8 text-[#718078]">
            A well-organized production journey connects every stage of fish
            farming, from preparing ponds and raising healthy fish to
            harvesting and delivering quality products.
          </p>
        </div>

        {/* Journey Timeline */}
        <div className="relative">

          {/* Desktop Connecting Line */}
          <div className="absolute left-[8.33%] right-[8.33%] top-8 hidden h-px bg-[#C9DCD0] lg:block" />

          <div className="grid grid-cols-1 gap-9 sm:grid-cols-2 lg:grid-cols-6 lg:gap-5">
            {journeySteps.map((step) => {
              const Icon = step.icon

              return (
                <div key={step.number} className="relative group">

                  {/* Icon and Number */}
                  <div className="relative z-10 mb-6 flex items-center gap-4 lg:flex-col lg:items-center">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center border border-[#D8E8DC] bg-white text-[#167D62] shadow-sm transition-all duration-300 group-hover:border-[#167D62] group-hover:bg-[#123D35] group-hover:text-white">
                      <Icon size={25} strokeWidth={1.7} />
                    </div>

                    <span className="text-xs font-bold tracking-widest text-[#A1B1A6] lg:mt-1">
                      STEP {step.number}
                    </span>
                  </div>

                  {/* Text */}
                  <div className="lg:text-center">
                    <h3 className="text-lg font-semibold text-[#193E32]">
                      {step.title}
                    </h3>

                    <p className="mt-3 text-sm leading-7 text-[#7B8B80]">
                      {step.description}
                    </p>
                  </div>

                </div>
              )
            })}
          </div>
        </div>

        {/* Bottom Note */}
        <div className="mt-16 flex flex-col items-center justify-between gap-5 border-t border-[#DFE9E0] pt-8 sm:flex-row">
          <p className="max-w-xl text-sm leading-7 text-[#718078]">
            Each production stage contributes to a more organized and
            manageable fishery operation.
          </p>

          <div className="flex items-center gap-3 text-sm font-semibold text-[#167D62]">
            <span>From stocking to supply</span>
            <ArrowRight size={18} />
          </div>
        </div>

      </div>
    </section>
  )
}

export default ProductionJourney