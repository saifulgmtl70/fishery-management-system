import { Link } from 'react-router-dom'
import {
  ArrowUpRight,
  ArrowRight,
  CheckCircle2,
  Waves,
  Fish,
  Sprout,
} from 'lucide-react'

const highlights = [
  {
    icon: Waves,
    title: 'Pond-Based Operations',
    description: 'Organized fish farming with pond-wise production management.',
  },
  {
    icon: Fish,
    title: 'Quality Fish Production',
    description: 'Focused on fish growth, proper care and responsible harvesting.',
  },
  {
    icon: Sprout,
    title: 'Sustainable Practices',
    description: 'A practical approach to maintaining healthy aquatic environments.',
  },
]

const AboutPreview = () => {
  return (
    <section className="relative overflow-hidden bg-[#F7F8F5] py-20 sm:py-24 lg:py-28">
      <div className="mx-auto grid max-w-[1440px] items-center gap-14 px-5 sm:px-8 lg:grid-cols-2 lg:gap-20 lg:px-16">

        {/* Image Section */}
        <div className="relative">
          <div className="relative overflow-hidden rounded-sm">
            <img
              src="/images/about-fishery.jpg"
              alt="Fish farming and aquaculture operation"
              className="h-[350px] w-full object-cover sm:h-[440px] lg:h-[510px]"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-[#102F29]/45 via-transparent to-transparent" />
          </div>

          {/* Image Label */}
          <div className="absolute bottom-5 left-5 flex items-center gap-3 bg-white px-5 py-4 shadow-lg sm:bottom-8 sm:left-8">
            <div className="flex h-11 w-11 items-center justify-center bg-[#E8F3ED] text-[#167D62]">
              <Waves size={23} />
            </div>

            <div>
              <p className="text-sm font-semibold text-[#123D35]">
                Responsible Aquaculture
              </p>
              <p className="mt-1 text-xs text-[#7B8B80]">
                Growing with care and purpose
              </p>
            </div>
          </div>

          {/* Decorative Element */}
          <div className="absolute -right-3 -top-3 -z-0 h-24 w-24 border-r-2 border-t-2 border-[#167D62]/30 sm:-right-5 sm:-top-5 sm:h-32 sm:w-32" />
        </div>

        {/* Content Section */}
        <div>
          <div className="mb-5 flex items-center gap-3">
            <span className="h-[2px] w-9 bg-[#167D62]" />
            <span className="text-xs font-bold tracking-[0.22em] text-[#167D62]">
              ABOUT OUR FISHERY
            </span>
          </div>

          <h2 className="max-w-xl text-3xl leading-tight font-semibold tracking-tight text-[#123D35] sm:text-4xl lg:text-[46px]">
            Building a Better Approach to
            <span className="text-[#167D62]"> Fish Farming.</span>
          </h2>

          <p className="mt-6 text-[15px] leading-8 text-[#66766D]">
            Our fishery brings together pond management, fish production,
            harvesting and wholesale operations through an organized approach.
            We focus on maintaining production records, monitoring fish growth
            and managing everyday activities efficiently.
          </p>

          <p className="mt-4 text-[15px] leading-8 text-[#66766D]">
            From stocking fingerlings to delivering harvested fish to the
            market, our goal is to make every stage of fishery operations
            more organized, transparent and manageable.
          </p>

          {/* Highlights */}
          <div className="mt-8 space-y-5">
            {highlights.map((item, index) => {
              const Icon = item.icon

              return (
                <div key={index} className="flex gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center bg-[#E8F3ED] text-[#167D62]">
                    <Icon size={21} strokeWidth={1.8} />
                  </div>

                  <div>
                    <h3 className="text-[15px] font-semibold text-[#243B32]">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-[#7B8B80]">
                      {item.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Button */}
          <Link
            to="/about"
            className="group mt-9 inline-flex items-center gap-3 bg-[#123D35] px-6 py-4 text-sm font-semibold text-white transition-colors duration-300 hover:bg-[#167D62]"
          >
            Discover Our Fishery
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

export default AboutPreview