import {
  Waves,
  Users,
  Wallet,
  ArrowUpRight,
  CheckCircle2,
    Anchor
} from 'lucide-react'
import { Link } from 'react-router-dom'

const lakeActivities = [
  {
    number: '01',
    icon: Users,
    label: 'LOCAL FISHING',
    title: 'Traditional Net Fishing',
    description:
      'Local fishermen participate in regular fishing activities using nets. Each fishing trip is recorded with fish species, quantities and market values.',
    features: [
      'Multiple fishing trips',
      'Species-wise catch records',
      '50:50 value sharing',
    ],
    highlight: '50 : 50',
    highlightLabel: 'Catch Value Sharing',
  },
  {
    number: '02',
    icon: Anchor,
    label: 'RECREATIONAL EXPERIENCE',
    title: 'Rod Fishing Experience',
    description:
      'Visitors can enjoy recreational fishing with a rod in a peaceful lake environment by paying a flexible entry fee.',
    features: [
      'Visitor-based fishing access',
      'Flexible entry fees',
      '100% fee belongs to the business',
    ],
    highlight: '100%',
    highlightLabel: 'Business Revenue',
  },
]

function LakeOperations() {
  return (
    <section className="bg-[#EAF3ED] px-5 py-20 sm:px-8 lg:px-16 lg:py-28">
      <div className="mx-auto max-w-[1440px]">

        {/* Heading */}
        <div className="mb-12 grid gap-6 lg:grid-cols-[1fr_0.75fr] lg:items-end">
          <div>
            <span className="mb-4 block text-xs font-bold uppercase tracking-[0.22em] text-[#167D62]">
              OUR LAKE OPERATIONS
            </span>

            <h2 className="max-w-2xl text-3xl font-semibold leading-tight tracking-tight text-[#123D35] sm:text-4xl lg:text-5xl">
              More Than Just
              <span className="text-[#167D62]"> Fish Farming.</span>
            </h2>
          </div>

          <p className="max-w-xl text-sm leading-8 text-[#64766C] sm:text-base lg:justify-self-end">
            Our separate lake supports both traditional local fishing
            activities and recreational experiences, creating two
            distinct sources of business activity.
          </p>
        </div>

        {/* Lake Image */}
        <div className="relative mb-8 h-[250px] overflow-hidden rounded-xl sm:h-[350px] lg:h-[410px]">
          <img
            src="/images/lake-experience.jpg"
            alt="A peaceful freshwater lake surrounded by greenery"
            className="h-full w-full object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-[#102F29]/75 via-transparent to-transparent" />

          <div className="absolute bottom-6 left-6 right-6 sm:bottom-9 sm:left-9">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#B7E6CA]">
              A SEPARATE LAKE OPERATION
            </span>

            <h3 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">
              Fishing, Recreation & Opportunity.
            </h3>
          </div>
        </div>

        {/* Two Activities */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {lakeActivities.map((activity) => {
            const Icon = activity.icon

            return (
              <article
                key={activity.number}
                className="flex flex-col border border-[#D8E6DB] bg-white p-6 sm:p-8 lg:p-9"
              >
                <div className="mb-7 flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#EAF3ED] text-[#167D62]">
                    <Icon size={23} strokeWidth={1.7} />
                  </div>

                  <span className="text-sm font-semibold tracking-widest text-[#91A69A]">
                    {activity.number}
                  </span>
                </div>

                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#167D62]">
                  {activity.label}
                </span>

                <h3 className="mt-2 text-2xl font-semibold text-[#123D35]">
                  {activity.title}
                </h3>

                <p className="mt-4 text-sm leading-7 text-[#64766C]">
                  {activity.description}
                </p>

                <div className="my-7 space-y-3 border-t border-[#E7EEE8] pt-6">
                  {activity.features.map((feature) => (
                    <div
                      key={feature}
                      className="flex items-center gap-3 text-sm text-[#52695C]"
                    >
                      <CheckCircle2
                        size={17}
                        className="shrink-0 text-[#167D62]"
                      />
                      {feature}
                    </div>
                  ))}
                </div>

                <div className="mt-auto flex items-center justify-between gap-4 border-t border-[#E7EEE8] pt-6">
                  <div>
                    <p className="text-2xl font-bold text-[#167D62]">
                      {activity.highlight}
                    </p>
                    <p className="mt-1 text-xs text-[#64766C]">
                      {activity.highlightLabel}
                    </p>
                  </div>

                  <Waves
                    size={28}
                    strokeWidth={1.3}
                    className="text-[#A8C8B2]"
                  />
                </div>
              </article>
            )
          })}
        </div>

        {/* Bottom Information */}
        <div className="mt-10 flex flex-col gap-5 border-t border-[#D6E5D9] pt-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <Wallet
              size={20}
              className="mt-1 shrink-0 text-[#167D62]"
            />

            <p className="max-w-2xl text-sm leading-7 text-[#64766C]">
              Both activities are managed separately, allowing fishing
              income, visitor fees and related expenses to be tracked
              independently.
            </p>
          </div>

          <Link
            to="/contact"
            className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-[#167D62] transition-colors hover:text-[#123D35]"
          >
            Contact Us
            <ArrowUpRight size={17} />
          </Link>
        </div>

      </div>
    </section>
  )
}

export default LakeOperations