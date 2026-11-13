import {
  Fish,
  Users,
  Scale,
  ClipboardCheck,
  ArrowUpRight,
  CheckCircle2,
} from 'lucide-react'
import { Link } from 'react-router-dom'

const harvestingActivities = [
  {
    icon: Users,
    title: 'Professional Harvesting Team',
    description:
      'Experienced external fishing teams are engaged to carry out pond harvesting operations.',
  },
  {
    icon: Fish,
    title: 'Organized Fish Collection',
    description:
      'Harvested fish are carefully collected and organized according to their species.',
  },
  {
    icon: Scale,
    title: 'Weighing & Measurement',
    description:
      'Our team weighs the actual harvested fish to determine quantities accurately.',
  },
  {
    icon: ClipboardCheck,
    title: 'Harvest Records',
    description:
      'Harvest quantities are recorded to support inventory tracking and wholesale sales.',
  },
]

function HarvestingProcess() {
  return (
    <section className="bg-[#F7F8F5] px-5 py-20 sm:px-8 lg:px-16 lg:py-28">
      <div className="mx-auto max-w-[1440px]">

        {/* Section Heading */}
        <div className="mb-12 max-w-3xl">
          <span className="mb-4 block text-xs font-bold uppercase tracking-[0.22em] text-[#167D62]">
            HARVESTING OPERATIONS
          </span>

          <h2 className="text-3xl font-semibold leading-tight tracking-tight text-[#123D35] sm:text-4xl lg:text-5xl">
            From Pond to
            <span className="text-[#167D62]"> Harvest.</span>
          </h2>

          <p className="mt-5 max-w-2xl text-sm leading-8 text-[#64766C] sm:text-base">
            Harvesting is an important stage of fish production. We organize
            harvesting activities with professional teams and maintain
            accurate records of the fish collected from our ponds.
          </p>
        </div>

        {/* Main Content */}
        <div className="grid overflow-hidden rounded-xl border border-[#E1EAE2] bg-white lg:grid-cols-2">

          {/* Image Side */}
          <div className="relative min-h-[300px] overflow-hidden sm:min-h-[380px] lg:min-h-[520px]">
            <img
              src="/images/harvesting-process.jpg"
              alt="Fish harvesting operation in a freshwater pond"
              className="absolute inset-0 h-full w-full object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-[#102F29]/80 via-[#102F29]/10 to-transparent" />

            <div className="absolute bottom-7 left-6 right-6 sm:bottom-9 sm:left-9">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#B7E6CA]">
                HARVESTING DAY
              </span>

              <h3 className="mt-3 max-w-md text-2xl font-semibold leading-snug text-white sm:text-3xl">
                Careful Collection.
                Accurate Weighing.
              </h3>
            </div>
          </div>

          {/* Information Side */}
          <div className="flex flex-col justify-center p-6 sm:p-9 lg:p-12">

            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#167D62]">
              HOW WE WORK
            </span>

            <h3 className="mt-3 text-2xl font-semibold leading-snug text-[#123D35] sm:text-3xl">
              An Organized Harvesting Process
            </h3>

            <p className="mt-4 text-sm leading-7 text-[#64766C]">
              Our harvesting operations involve coordinated teamwork.
              Professional fishing teams handle fish collection, while
              our own team supervises weighing and records the actual
              harvested quantities.
            </p>

            <div className="mt-8 space-y-6">
              {harvestingActivities.map((activity, index) => {
                const Icon = activity.icon

                return (
                  <div key={activity.title} className="flex gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#EAF3ED] text-[#167D62]">
                      <Icon size={21} strokeWidth={1.7} />
                    </div>

                    <div>
                      <h4 className="text-base font-semibold text-[#123D35]">
                        {activity.title}
                      </h4>

                      <p className="mt-1 text-sm leading-6 text-[#64766C]">
                        {activity.description}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="mt-9 border-t border-[#E7EEE8] pt-6">
              <div className="flex items-start gap-3">
                <CheckCircle2
                  size={19}
                  className="mt-0.5 shrink-0 text-[#167D62]"
                />

                <p className="text-sm leading-6 text-[#52695C]">
                  Actual harvested quantities are recorded separately
                  from estimated live fish stock.
                </p>
              </div>
            </div>

            <Link
              to="/contact"
              className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-[#167D62] transition-colors hover:text-[#123D35]"
            >
              Contact Us
              <ArrowUpRight size={17} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HarvestingProcess