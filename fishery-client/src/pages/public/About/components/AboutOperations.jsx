import {
  Waves,
  Fish,
  Sprout,
  Truck,
  ArrowUpRight,
} from 'lucide-react'
import { Link } from 'react-router-dom'

const operations = [
  {
    number: '01',
    icon: Waves,
    title: 'Pond Management',
    description:
      'Managing multiple fish farming ponds, maintaining pond conditions and organizing production activities throughout different farming cycles.',
    tags: ['Pond Operations', 'Production Cycles'],
  },
  {
    number: '02',
    icon: Fish,
    title: 'Fish Production & Care',
    description:
      'Managing fish stocking, daily feeding, growth monitoring and routine care to support healthy fish production.',
    tags: ['Fish Stocking', 'Feeding & Care'],
  },
  {
    number: '03',
    icon: Sprout,
    title: 'Harvesting Operations',
    description:
      'Organizing harvesting activities with professional fishing teams, weighing harvested fish and preparing them for distribution.',
    tags: ['Fish Harvesting', 'Weighing'],
  },
  {
    number: '04',
    icon: Truck,
    title: 'Wholesale Distribution',
    description:
      'Coordinating harvested fish sales, working with wholesale dealers and managing fish supply and delivery activities.',
    tags: ['Dealer Relations', 'Fish Supply'],
  },
]

const AboutOperations = () => {
  return (
    <section className="relative overflow-hidden bg-[#F7F8F5] px-5 py-20 sm:px-8 sm:py-24 lg:px-16 lg:py-28">

      <div className="mx-auto grid max-w-[1440px] gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">

        {/* Left Introduction */}
        <div className="lg:sticky lg:top-28 lg:h-fit">

          <div className="mb-5 flex items-center gap-3">
            <span className="h-[2px] w-9 bg-[#167D62]" />

            <span className="text-xs font-bold tracking-[0.22em] text-[#167D62]">
              WHAT WE DO
            </span>
          </div>

          <h2 className="max-w-lg text-3xl leading-tight font-semibold tracking-tight text-[#123D35] sm:text-4xl lg:text-[46px]">
            Managing Every Stage of
            <span className="text-[#167D62]">
              {' '}Our Fishery.
            </span>
          </h2>

          <p className="mt-6 max-w-lg text-[15px] leading-8 text-[#64766C]">
            Our fishery brings together several important
            activities under one operation. From managing
            production ponds to supplying harvested fish
            to wholesale buyers, each activity has a role
            in keeping the business organized.
          </p>

          <p className="mt-4 max-w-lg text-[15px] leading-8 text-[#64766C]">
            Alongside fish production, our operations also
            include feed management, harvesting coordination
            and dealer relationships.
          </p>

          {/* Bottom Link */}
          <Link
            to="/fishery"
            className="group mt-9 inline-flex items-center gap-3 border-b border-[#167D62]/30 pb-2 text-sm font-semibold text-[#123D35] transition-colors hover:border-[#167D62] hover:text-[#167D62]"
          >
            Discover Our Fishery

            <ArrowUpRight
              size={18}
              className="transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1"
            />
          </Link>

        </div>

        {/* Right Operations */}
        <div className="divide-y divide-[#E3EBE4] border-y border-[#E3EBE4]">

          {operations.map((operation) => {
            const Icon = operation.icon

            return (
              <article
                key={operation.number}
                className="group py-8 sm:py-9"
              >

                <div className="flex items-start gap-5 sm:gap-7">

                  {/* Icon */}
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center bg-[#EAF3ED] text-[#167D62] transition-all duration-300 group-hover:bg-[#167D62] group-hover:text-white sm:h-14 sm:w-14">
                    <Icon size={24} strokeWidth={1.7} />
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">

                    <div className="mb-2 flex items-center justify-between gap-3">
                      <span className="text-[10px] font-bold tracking-[0.18em] text-[#167D62]">
                        OPERATION {operation.number}
                      </span>

                      <ArrowUpRight
                        size={17}
                        className="shrink-0 text-[#A0B1A5] transition-all duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-[#167D62]"
                      />
                    </div>

                    <h3 className="text-xl font-semibold text-[#123D35] sm:text-2xl">
                      {operation.title}
                    </h3>

                    <p className="mt-3 max-w-xl text-sm leading-7 text-[#718178]">
                      {operation.description}
                    </p>

                    {/* Tags */}
                    <div className="mt-4 flex flex-wrap gap-2">
                      {operation.tags.map((tag) => (
                        <span
                          key={tag}
                          className="border border-[#E3EBE4] bg-white px-3 py-1.5 text-[11px] font-medium text-[#64766C]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                  </div>
                </div>

              </article>
            )
          })}

        </div>
      </div>
    </section>
  )
}

export default AboutOperations