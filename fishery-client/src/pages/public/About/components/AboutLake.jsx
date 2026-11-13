import { Link } from 'react-router-dom'
import {
  ArrowRight,
  ArrowUpRight,
  Waves,
  Fish,
  Users,
  Wallet,
  CircleCheck,
} from 'lucide-react'

const lakeFeatures = [
  {
    icon: Users,
    title: 'Local Fishermen',
    description:
      'Local fishermen participate in traditional net fishing activities and contribute to the lake operation.',
  },
  {
    icon: Wallet,
    title: 'Shared Catch Value',
    description:
      'The value of fish caught through local net fishing is shared equally between the fisherman and the owner.',
  },
  {
    icon: Fish,
    title: 'Recreational Fishing',
    description:
      'Visitors can enjoy fishing with a rod through a flexible fee-based recreational experience.',
  },
]

const AboutLake = () => {
  return (
    <section className="relative overflow-hidden bg-[#EAF3ED] px-5 py-20 sm:px-8 sm:py-24 lg:px-16 lg:py-28">

      {/* Decorative Background */}
      <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full border border-[#167D62]/10" />
      <div className="pointer-events-none absolute -bottom-40 -left-28 h-96 w-96 rounded-full border border-[#167D62]/10" />

      <div className="relative mx-auto max-w-[1440px]">

        {/* Section Heading */}
        <div className="mb-14 max-w-3xl">

          <div className="mb-5 flex items-center gap-3">
            <span className="h-[2px] w-9 bg-[#167D62]" />

            <span className="text-xs font-bold tracking-[0.22em] text-[#167D62]">
              OUR LAKE
            </span>
          </div>

          <h2 className="text-3xl leading-tight font-semibold tracking-tight text-[#123D35] sm:text-4xl lg:text-[46px]">
            A Place for Fishing,
            <span className="text-[#167D62]">
              {' '}Recreation & Community.
            </span>
          </h2>

          <p className="mt-6 max-w-2xl text-[15px] leading-8 text-[#64766C]">
            Beyond our fish production activities, our lake brings
            together traditional fishing practices and recreational
            opportunities for local people and visitors.
          </p>
        </div>

        {/* Main Content */}
        <div className="grid overflow-hidden bg-white shadow-sm lg:grid-cols-[1fr_1fr]">

          {/* Image */}
          <div className="group relative min-h-[320px] overflow-hidden sm:min-h-[440px]">

            <img
              src="/images/lake-experience.jpg"
              alt="Freshwater lake surrounded by natural greenery"
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-[#0B2922]/80 via-[#0B2922]/15 to-transparent" />

            <div className="absolute bottom-8 left-6 right-6 sm:bottom-10 sm:left-9">

              <div className="mb-3 flex items-center gap-2 text-sm font-medium text-[#B7E6CA]">
                <Waves size={18} />
                A NATURAL FISHING ENVIRONMENT
              </div>

              <h3 className="max-w-md text-2xl leading-snug font-semibold text-white sm:text-3xl">
                Experience the
                <span className="block text-[#B7E6CA]">
                  Beauty of Our Lake.
                </span>
              </h3>

            </div>
          </div>

          {/* Information */}
          <div className="flex flex-col justify-center p-6 sm:p-10 lg:p-12">

            <span className="text-xs font-bold tracking-[0.2em] text-[#167D62]">
              TWO DISTINCT ACTIVITIES
            </span>

            <h3 className="mt-4 text-2xl font-semibold text-[#123D35] sm:text-3xl">
              More Than Just a Waterbody
            </h3>

            <p className="mt-4 text-sm leading-7 text-[#718178]">
              Our lake supports different activities, each with
              its own purpose and participation model.
            </p>

            {/* Features */}
            <div className="mt-8 space-y-7">

              {lakeFeatures.map((feature, index) => {
                const Icon = feature.icon

                return (
                  <div
                    key={feature.title}
                    className={`flex items-start gap-4 ${
                      index !== lakeFeatures.length - 1
                        ? 'border-b border-[#E7EEE8] pb-7'
                        : ''
                    }`}
                  >

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center bg-[#EAF3ED] text-[#167D62]">
                      <Icon size={21} strokeWidth={1.7} />
                    </div>

                    <div>
                      <h4 className="text-base font-semibold text-[#123D35]">
                        {feature.title}
                      </h4>

                      <p className="mt-2 text-sm leading-7 text-[#718178]">
                        {feature.description}
                      </p>
                    </div>

                  </div>
                )
              })}

            </div>

            {/* Link */}
            <Link
              to="/fishery"
              className="group mt-9 inline-flex w-fit items-center gap-3 bg-[#167D62] px-6 py-4 text-sm font-semibold text-white transition-all duration-300 hover:bg-[#123D35]"
            >
              Explore Our Fishery

              <ArrowRight
                size={18}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>

          </div>
        </div>

        

      </div>
    </section>
  )
}

export default AboutLake