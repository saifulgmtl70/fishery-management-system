import {
  Fish,
  Sprout,
  Scale,
  ClipboardCheck,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react'
import { Link } from 'react-router-dom'

const productionStages = [
  {
    number: '01',
    icon: Fish,
    title: 'Fish Stocking',
    description:
      'Introducing healthy fingerlings into prepared ponds and organizing each production cycle.',
    details: ['Species Selection', 'Stocking Records'],
  },
  {
    number: '02',
    icon: Sprout,
    title: 'Feeding & Care',
    description:
      'Providing regular feed and maintaining daily care routines to support fish development.',
    details: ['Scheduled Feeding', 'Feed Management'],
  },
  {
    number: '03',
    icon: Scale,
    title: 'Growth Monitoring',
    description:
      'Observing fish growth through periodic sampling and keeping track of production progress.',
    details: ['Weight Sampling', 'Growth Records'],
  },
  {
    number: '04',
    icon: ClipboardCheck,
    title: 'Production Tracking',
    description:
      'Monitoring mortality, pond conditions and production activities throughout the farming cycle.',
    details: ['Mortality Records', 'Cycle Monitoring'],
  },
]

function FishProduction() {
  return (
    <section className="bg-[#EAF3ED] px-5 py-20 sm:px-8 lg:px-16 lg:py-28">
      <div className="mx-auto max-w-[1440px]">

        {/* Heading */}
        <div className="mb-14 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <span className="mb-4 block text-xs font-bold uppercase tracking-[0.22em] text-[#167D62]">
              FISH PRODUCTION
            </span>

            <h2 className="text-3xl font-semibold leading-tight tracking-tight text-[#123D35] sm:text-4xl lg:text-5xl">
              Growing Fish with
              <span className="text-[#167D62]"> Care & Attention.</span>
            </h2>
          </div>

          <p className="max-w-xl text-sm leading-8 text-[#64766C] sm:text-base">
            Fish production is a continuous process. Proper stocking,
            feeding, growth observation and production records help us
            manage each farming cycle more effectively.
          </p>
        </div>

        {/* Production Stages */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {productionStages.map((stage) => {
            const Icon = stage.icon

            return (
              <article
                key={stage.number}
                className="group relative flex flex-col border border-[#D8E6DB] bg-white p-7 transition-all duration-300 hover:-translate-y-1 hover:border-[#167D62]/40 hover:shadow-lg sm:p-8"
              >
                <div className="mb-8 flex items-center justify-between">
                  <span className="text-sm font-semibold tracking-widest text-[#91A69A]">
                    {stage.number}
                  </span>

                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#EAF3ED] text-[#167D62] transition-colors duration-300 group-hover:bg-[#167D62] group-hover:text-white">
                    <Icon size={22} strokeWidth={1.7} />
                  </div>
                </div>

                <h3 className="text-xl font-semibold text-[#123D35]">
                  {stage.title}
                </h3>

                <p className="mt-3 flex-1 text-sm leading-7 text-[#64766C]">
                  {stage.description}
                </p>

                <div className="mt-7 space-y-3 border-t border-[#E7EEE8] pt-5">
                  {stage.details.map((detail) => (
                    <div
                      key={detail}
                      className="flex items-center gap-2 text-xs font-medium text-[#52695C]"
                    >
                      <CheckCircle2
                        size={15}
                        className="shrink-0 text-[#167D62]"
                      />
                      {detail}
                    </div>
                  ))}
                </div>
              </article>
            )
          })}
        </div>

        {/* Bottom Message */}
        <div className="mt-12 flex flex-col items-start justify-between gap-6 border-t border-[#D6E5D9] pt-8 sm:flex-row sm:items-center">
          <div>
            <h3 className="text-lg font-semibold text-[#123D35]">
              Every production cycle matters.
            </h3>

            <p className="mt-2 text-sm leading-7 text-[#64766C]">
              Consistent care and organized monitoring support better
              fish production.
            </p>
          </div>

          <Link
            to="/contact"
            className="inline-flex items-center gap-3 text-sm font-semibold text-[#167D62] transition-colors hover:text-[#123D35]"
          >
            Get in Touch
            <ArrowRight size={17} />
          </Link>
        </div>

      </div>
    </section>
  )
}

export default FishProduction