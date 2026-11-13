import { ArrowUpRight, Waves, Fish, Sprout, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'

const farmHighlights = [
  {
    icon: Waves,
    title: 'Pond-Based Farming',
    description: 'Organized fish farming across multiple production ponds.',
  },
  {
    icon: Fish,
    title: 'Multiple Fish Species',
    description: 'Cultivating species such as Pangash, Rui, Katla and Tilapia.',
  },
  {
    icon: Sprout,
    title: 'Production & Care',
    description: 'Managing stocking, feeding, growth and harvesting activities.',
  },
]

function FarmOverview() {
  return (
    <section className="bg-[#F7F8F5] px-5 py-20 sm:px-8 lg:px-16 lg:py-28">
      <div className="mx-auto grid max-w-[1440px] items-center gap-12 lg:grid-cols-2 lg:gap-20">

        {/* Image Side */}
        <div className="relative">
          <div className="relative aspect-[5/4] overflow-hidden rounded-xl">
            <img
              src="/images/about-fishery.jpg"
              alt="Freshwater fish farming pond"
              className="h-full w-full object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-[#102F29]/55 via-transparent to-transparent" />

            <div className="absolute bottom-6 left-6 right-6">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#B7E6CA]">
                Our Farming Environment
              </span>
              <h3 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">
                Built Around Our Ponds
              </h3>
            </div>
          </div>

          {/* Pond Count Detail */}
          <div className="absolute -bottom-6 right-5 flex items-center gap-4 rounded-lg border border-[#E7EEE8] bg-white p-5 shadow-lg sm:right-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#EAF3ED] text-[#167D62]">
              <Waves size={24} />
            </div>

            <div>
              <p className="text-2xl font-bold text-[#123D35]">11+</p>
              <p className="text-xs font-medium text-[#64766C]">
                Production Ponds
              </p>
            </div>
          </div>
        </div>

        {/* Content Side */}
        <div className="pt-5 lg:pt-0">
          <span className="mb-4 block text-xs font-bold uppercase tracking-[0.22em] text-[#167D62]">
            FARM OVERVIEW
          </span>

          <h2 className="text-3xl font-semibold leading-tight tracking-tight text-[#123D35] sm:text-4xl lg:text-5xl">
            A Fishery Built on
            <span className="text-[#167D62]"> Organized Operations.</span>
          </h2>

          <p className="mt-6 text-sm leading-8 text-[#64766C] sm:text-base">
            Our fishery operates through a pond-based farming system where
            fish production, feeding, growth monitoring and harvesting are
            managed as connected activities.
          </p>

          <p className="mt-4 text-sm leading-8 text-[#64766C] sm:text-base">
            Alongside our production ponds, we also maintain a separate lake
            operation that supports local fishing activities and recreational
            angling experiences.
          </p>

          {/* Highlights */}
          <div className="mt-9 space-y-6">
            {farmHighlights.map((item) => {
              const Icon = item.icon

              return (
                <div key={item.title} className="flex gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#EAF3ED] text-[#167D62]">
                    <Icon size={21} strokeWidth={1.7} />
                  </div>

                  <div>
                    <h3 className="text-base font-semibold text-[#123D35]">
                      {item.title}
                    </h3>

                    <p className="mt-1 text-sm leading-6 text-[#64766C]">
                      {item.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>

          <Link
            to="/about"
            className="mt-9 inline-flex items-center gap-3 border-b border-[#167D62] pb-2 text-sm font-semibold text-[#167D62] transition-colors hover:text-[#123D35]"
          >
            Learn More About Us
            <ArrowUpRight size={17} />
          </Link>
        </div>
      </div>
    </section>
  )
}

export default FarmOverview