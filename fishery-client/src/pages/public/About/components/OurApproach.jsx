import {
  Sprout,
  Fish,
  ClipboardCheck,
  Scale,
  Truck,
  ArrowUpRight,
} from 'lucide-react'

const approachSteps = [
  {
    number: '01',
    icon: Sprout,
    title: 'Pond Preparation',
    description:
      'Preparing and maintaining ponds to create a suitable environment for fish farming.',
  },
  {
    number: '02',
    icon: Fish,
    title: 'Fish Stocking',
    description:
      'Introducing selected fish species into ponds and managing their production cycles.',
  },
  {
    number: '03',
    icon: ClipboardCheck,
    title: 'Feeding & Care',
    description:
      'Managing daily feeding, fish health, water conditions and overall pond activities.',
  },
  {
    number: '04',
    icon: Scale,
    title: 'Growth & Harvesting',
    description:
      'Monitoring fish growth and organizing harvesting based on production requirements.',
  },
  {
    number: '05',
    icon: Truck,
    title: 'Wholesale Supply',
    description:
      'Coordinating harvested fish distribution and supply to wholesale buyers.',
  },
]

const OurApproach = () => {
  return (
    <section className="relative overflow-hidden bg-[#EAF3ED] px-5 py-20 sm:px-8 sm:py-24 lg:px-16 lg:py-28">

      {/* Decorative Background */}
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full border border-[#167D62]/10" />
      <div className="pointer-events-none absolute -bottom-40 -right-24 h-96 w-96 rounded-full border border-[#167D62]/10" />

      <div className="relative mx-auto max-w-[1440px]">

        {/* Heading */}
        <div className="mx-auto mb-16 max-w-3xl text-center">

          <div className="mb-5 flex items-center justify-center gap-3">
            <span className="h-[2px] w-8 bg-[#167D62]" />

            <span className="text-xs font-bold tracking-[0.22em] text-[#167D62]">
              OUR APPROACH
            </span>

            <span className="h-[2px] w-8 bg-[#167D62]" />
          </div>

          <h2 className="text-3xl leading-tight font-semibold tracking-tight text-[#123D35] sm:text-4xl lg:text-[46px]">
            A Connected Approach to
            <span className="block text-[#167D62]">
              Fishery Operations.
            </span>
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-sm leading-8 text-[#64766C] sm:text-base">
            Every stage of fish production plays an important role.
            Our approach connects pond preparation, fish care,
            harvesting and wholesale supply into an organized process.
          </p>
        </div>

        {/* Process Steps */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">

          {approachSteps.map((step, index) => {
            const Icon = step.icon

            return (
              <div
                key={step.number}
                className="group relative border border-[#DCE9DF] bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#167D62]/40 hover:shadow-lg hover:shadow-[#123D35]/5 sm:p-7"
              >

                {/* Number & Icon */}
                <div className="mb-8 flex items-center justify-between">

                  <span className="text-sm font-bold tracking-wider text-[#167D62]/65">
                    {step.number}
                  </span>

                  <div className="flex h-12 w-12 items-center justify-center bg-[#EAF3ED] text-[#167D62] transition-colors duration-300 group-hover:bg-[#167D62] group-hover:text-white">
                    <Icon size={23} strokeWidth={1.7} />
                  </div>

                </div>

                {/* Content */}
                <h3 className="text-lg font-semibold text-[#123D35]">
                  {step.title}
                </h3>

                <p className="mt-3 text-sm leading-7 text-[#718178]">
                  {step.description}
                </p>

                {/* Bottom Accent */}
                <div className="mt-7 flex items-center justify-between border-t border-[#E7EEE8] pt-5">

                  <span className="text-[10px] font-bold tracking-[0.16em] text-[#167D62]">
                    PROCESS STEP
                  </span>

                  <ArrowUpRight
                    size={17}
                    className="text-[#167D62] transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1"
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

export default OurApproach