import {
  Waves,
  Droplets,
  Fish,
  Sprout,
  ArrowUpRight,
} from 'lucide-react'
import { Link } from 'react-router-dom'

const managementSteps = [
  {
    number: '01',
    icon: Waves,
    title: 'Pond Preparation',
    description:
      'Preparing pond environments before introducing fish, with attention to pond conditions and farming requirements.',
    tag: 'Before Stocking',
  },
  {
    number: '02',
    icon: Droplets,
    title: 'Water Management',
    description:
      'Observing water conditions and maintaining a suitable aquatic environment for healthy fish growth.',
    tag: 'Regular Observation',
  },
  {
    number: '03',
    icon: Fish,
    title: 'Fish Stock Monitoring',
    description:
      'Keeping track of stocked fish, growth progress and mortality throughout each production cycle.',
    tag: 'Production Tracking',
  },
  {
    number: '04',
    icon: Sprout,
    title: 'Pond Maintenance',
    description:
      'Maintaining pond surroundings and monitoring daily farming activities to support organized operations.',
    tag: 'Ongoing Care',
  },
]

function PondManagement() {
  return (
    <section className="bg-white px-5 py-20 sm:px-8 lg:px-16 lg:py-28">
      <div className="mx-auto max-w-[1440px]">

        {/* Section Heading */}
        <div className="mb-14 grid gap-6 lg:grid-cols-[1fr_0.75fr] lg:items-end">
          <div>
            <span className="mb-4 block text-xs font-bold uppercase tracking-[0.22em] text-[#167D62]">
              POND MANAGEMENT
            </span>

            <h2 className="max-w-2xl text-3xl font-semibold leading-tight tracking-tight text-[#123D35] sm:text-4xl lg:text-5xl">
              Every Pond Needs
              <span className="text-[#167D62]"> Proper Care.</span>
            </h2>
          </div>

          <p className="max-w-xl text-sm leading-8 text-[#64766C] sm:text-base lg:justify-self-end">
            Effective fish production begins with proper pond management.
            From preparation to regular monitoring, every stage contributes
            to a well-organized farming environment.
          </p>
        </div>

        {/* Management Process */}
        <div className="grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-[#E7EEE8] bg-[#E7EEE8] sm:grid-cols-2 lg:grid-cols-4">
          {managementSteps.map((step) => {
            const Icon = step.icon

            return (
              <article
                key={step.number}
                className="group bg-white p-7 transition-colors duration-300 hover:bg-[#F7F8F5] sm:p-8 lg:p-7 xl:p-9"
              >
                <div className="mb-9 flex items-center justify-between">
                  <span className="text-sm font-semibold tracking-widest text-[#91A69A]">
                    {step.number}
                  </span>

                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#EAF3ED] text-[#167D62] transition-all duration-300 group-hover:bg-[#167D62] group-hover:text-white">
                    <Icon size={22} strokeWidth={1.7} />
                  </div>
                </div>

                <span className="mb-3 inline-block text-[10px] font-bold uppercase tracking-[0.16em] text-[#167D62]">
                  {step.tag}
                </span>

                <h3 className="mb-3 text-xl font-semibold text-[#123D35]">
                  {step.title}
                </h3>

                <p className="text-sm leading-7 text-[#64766C]">
                  {step.description}
                </p>

                <div className="mt-8 h-px w-full bg-[#E7EEE8] transition-colors duration-300 group-hover:bg-[#167D62]/40" />
              </article>
            )
          })}
        </div>

        

      </div>
    </section>
  )
}

export default PondManagement