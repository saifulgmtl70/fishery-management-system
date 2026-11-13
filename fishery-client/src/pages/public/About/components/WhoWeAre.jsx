import { Link } from 'react-router-dom'
import {
  ArrowUpRight,
  Waves,
  Fish,
  Sprout,
  ShieldCheck,
} from 'lucide-react'

const highlights = [
  {
    icon: Waves,
    title: 'Pond-Based Operations',
    description: 'Organized fish farming and pond management.',
  },
  {
    icon: Fish,
    title: 'Quality Fish Production',
    description: 'Focused on fish growth, care and harvesting.',
  },
  {
    icon: Sprout,
    title: 'Responsible Practices',
    description: 'A thoughtful approach to aquaculture operations.',
  },
  {
    icon: ShieldCheck,
    title: 'Connected Management',
    description: 'Coordinated activities from production to supply.',
  },
]

const WhoWeAre = () => {
  return (
    <section className="bg-[#F7F8F5] px-5 py-20 sm:px-8 sm:py-24 lg:px-16 lg:py-28">

      <div className="mx-auto grid max-w-[1440px] items-center gap-14 lg:grid-cols-2 lg:gap-20">

        {/* Image Side */}
        <div className="relative">

          <div className="relative min-h-[340px] overflow-hidden sm:min-h-[460px]">
            <img
              src="/images/about-fishery.jpg"
              alt="Freshwater fish farming pond surrounded by greenery"
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-[#0B2922]/45 via-transparent to-transparent" />
          </div>

          {/* Image Label */}
          <div className="absolute -bottom-5 right-4 flex items-center gap-3 bg-[#123D35] px-5 py-4 text-white shadow-lg sm:right-8 sm:px-7">
            <Waves size={25} className="shrink-0 text-[#8DD5A8]" />

            <div>
              <p className="text-sm font-semibold">
                Connected with Nature
              </p>
              <p className="mt-1 text-xs text-white/65">
                Our approach to fishery operations
              </p>
            </div>
          </div>

        </div>

        {/* Content Side */}
        <div className="pt-3 lg:pt-0">

          {/* Eyebrow */}
          <div className="mb-5 flex items-center gap-3">
            <span className="h-[2px] w-9 bg-[#167D62]" />

            <span className="text-xs font-bold tracking-[0.22em] text-[#167D62]">
              WHO WE ARE
            </span>
          </div>

          {/* Heading */}
          <h2 className="max-w-xl text-3xl leading-tight font-semibold tracking-tight text-[#123D35] sm:text-4xl lg:text-[46px]">
            A Fishery Built Around
            <span className="text-[#167D62]">
              {' '}Nature & Operations.
            </span>
          </h2>

          {/* Description */}
          <div className="mt-6 space-y-4 text-[15px] leading-8 text-[#64766C]">
            <p>
              We are a fishery operation focused on freshwater
              aquaculture, pond management and fish production.
              Our activities bring together different stages of
              fish farming within one connected operation.
            </p>

            <p>
              From fish stocking and daily care to harvesting
              and wholesale distribution, we aim to maintain
              an organized approach to managing our fishery.
              We also operate a lake that supports traditional
              fishing and recreational experiences.
            </p>
          </div>

          {/* Highlights */}
          <div className="mt-9 grid gap-x-7 gap-y-7 sm:grid-cols-2">

            {highlights.map((item) => {
              const Icon = item.icon

              return (
                <div key={item.title} className="flex items-start gap-3">

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center bg-[#EAF3ED] text-[#167D62]">
                    <Icon size={21} strokeWidth={1.7} />
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-[#123D35]">
                      {item.title}
                    </h3>

                    <p className="mt-1 text-xs leading-6 text-[#7B8B80]">
                      {item.description}
                    </p>
                  </div>

                </div>
              )
            })}

          </div>

          {/* Link */}
          <Link
            to="/fishery"
            className="group mt-10 inline-flex items-center gap-3 border-b border-[#167D62]/30 pb-2 text-sm font-semibold text-[#123D35] transition-colors hover:border-[#167D62] hover:text-[#167D62]"
          >
            Explore Our Operations

            <ArrowUpRight
              size={18}
              className="transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1"
            />
          </Link>

        </div>
      </div>
    </section>
  )
}

export default WhoWeAre