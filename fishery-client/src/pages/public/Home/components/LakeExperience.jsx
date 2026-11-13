import { Link } from 'react-router-dom'
import {
  ArrowUpRight,
  ArrowRight,
  Waves,
  Fish,
  Users,
  CalendarDays,
  CircleCheck,
} from 'lucide-react'

const lakeActivities = [
  {
    icon: Fish,
    number: '01',
    title: 'Recreational Fishing',
    description:
      'Enjoy a peaceful fishing experience with a fishing rod. Visitors can participate through a flexible entry fee.',
    features: ['Visitor-friendly experience', 'Flexible fishing fees'],
  },
  {
    icon: Users,
    number: '02',
    title: 'Local Net Fishing',
    description:
      'Local fishermen catch fish using traditional nets, with the catch value shared equally between the fisherman and the owner.',
    features: ['Traditional fishing activities', '50:50 revenue sharing'],
  },
]

const LakeExperience = () => {
  return (
    <section className="relative overflow-hidden bg-[#EAF3ED] py-20 text-[#123D35] sm:py-24 lg:py-28">

      {/* Decorative Background */}
      <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full border border-[#167D62]/10" />
      <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full border border-[#167D62]/10" />
      <div className="pointer-events-none absolute -bottom-40 -left-32 h-96 w-96 rounded-full border border-[#167D62]/10" />

      <div className="relative mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-16">

        {/* Heading */}
        <div className="mb-14 grid gap-8 lg:grid-cols-2 lg:items-end">

          <div>
            <div className="mb-5 flex items-center gap-3">
              <span className="h-[2px] w-9 bg-[#167D62]" />
              <span className="text-xs font-bold tracking-[0.22em] text-[#167D62]">
                BEYOND FISH FARMING
              </span>
            </div>

            <h2 className="max-w-xl text-3xl leading-tight font-semibold tracking-tight text-[#123D35] sm:text-4xl lg:text-[46px]">
              A Lake for Fishing,
              <span className="text-[#167D62]"> Recreation & Community.</span>
            </h2>
          </div>

          <p className="max-w-lg text-[15px] leading-8 text-[#64766C] lg:justify-self-end">
            Our lake creates opportunities for both traditional fishing
            activities and recreational experiences, bringing together
            local fishermen and fishing enthusiasts.
          </p>
        </div>

        {/* Lake Image and Information */}
        <div className="grid overflow-hidden bg-white shadow-sm lg:grid-cols-[1.15fr_0.85fr]">

          {/* Image */}
          <div className="relative min-h-[260px] overflow-hidden sm:min-h-[280px] lg:min-h-[280px]">
            <img
              src="/images/lake-experience.jpg"
              alt="Peaceful freshwater fishing lake"
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-[#0B2922]/80 via-transparent to-[#0B2922]/10" />

            <div className="absolute bottom-5 left-5 right-5 sm:bottom-7 sm:left-7">
              <div className="mb-3 flex items-center gap-2 text-sm font-medium text-[#B7E6CA]">
                <Waves size={17} />
                A UNIQUE FISHERY EXPERIENCE
              </div>

              <h3 className="max-w-md text-2xl font-semibold leading-snug text-white sm:text-3xl">
                More Than a Lake,
                A Place for Fishing & Enjoyment.
              </h3>
            </div>
          </div>

          {/* Activity Information */}
          <div className="flex flex-col justify-center bg-white p-6 sm:p-8 lg:p-9">

            <span className="mb-7 text-xs font-bold tracking-[0.2em] text-[#167D62]">
              TWO WAYS TO EXPERIENCE OUR LAKE
            </span>

            <div className="space-y-7">
              {lakeActivities.map((activity, index) => {
                const Icon = activity.icon

                return (
                  <div
                    key={activity.number}
                    className={
                      index === 0
                        ? 'border-b border-[#E7EEE8] pb-8'
                        : ''
                    }
                  >
                    <div className="mb-4 flex items-center gap-4">

                      <div className="flex h-12 w-12 shrink-0 items-center justify-center bg-[#EAF3ED] text-[#167D62]">
                        <Icon size={23} strokeWidth={1.7} />
                      </div>

                      <div>
                        <span className="text-[10px] font-bold tracking-widest text-[#167D62]">
                          ACTIVITY {activity.number}
                        </span>

                        <h3 className="mt-1 text-xl font-semibold text-[#123D35]">
                          {activity.title}
                        </h3>
                      </div>
                    </div>

                    <p className="text-sm leading-7 text-[#66786E]">
                      {activity.description}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
                      {activity.features.map((feature) => (
                        <div
                          key={feature}
                          className="flex items-center gap-2 text-xs font-medium text-[#167D62]"
                        >
                          <CircleCheck
                            size={14}
                            className="shrink-0 text-[#167D62]"
                          />
                          {feature}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Button */}
            <Link
              to="/fishery"
              className="group mt-9 inline-flex w-fit items-center gap-3 border border-[#D9E6DC] px-6 py-4 text-sm font-semibold text-[#123D35] transition-all duration-300 hover:border-[#123D35] hover:bg-[#123D35] hover:text-white"
            >
              Discover Lake Activities

              <ArrowUpRight
                size={18}
                className="transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1"
              />
            </Link>
          </div>
        </div>

        

      </div>
    </section>
  )
}

export default LakeExperience