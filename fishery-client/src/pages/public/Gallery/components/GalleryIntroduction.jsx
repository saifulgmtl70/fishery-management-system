import { Camera, Waves, Fish, Truck } from 'lucide-react'

const galleryHighlights = [
  {
    icon: Waves,
    title: 'Our Ponds',
    description: 'The natural environment behind our fish production.',
  },
  {
    icon: Fish,
    title: 'Fish Production',
    description: 'A closer look at our fish farming activities.',
  },
  {
    icon: Truck,
    title: 'Our Operations',
    description: 'Harvesting, handling and wholesale activities.',
  },
]

function GalleryIntroduction() {
  return (
    <section className="bg-[#F7F8F5] px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24">
      <div className="mx-auto max-w-[1440px]">

        {/* Introduction */}
        <div className="grid gap-8 lg:grid-cols-2 lg:items-end lg:gap-16">

          <div>
            <div className="mb-5 flex items-center gap-3">
              <span className="h-px w-9 bg-[#167D62]" />

              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[#167D62]">
                Explore Our Gallery
              </span>
            </div>

            <h2 className="max-w-xl text-3xl font-semibold leading-tight tracking-tight text-[#123D35] sm:text-4xl lg:text-5xl">
              Moments That Tell the Story of Our{' '}
              <span className="text-[#167D62]">Fishery.</span>
            </h2>
          </div>

          <div className="lg:pb-1">
            <p className="text-sm leading-8 text-[#64766C] sm:text-base">
              Every part of our fishery has a story to tell. From pond
              preparation and fish care to harvesting, wholesale supply,
              and lake activities, this gallery brings together moments
              from our everyday operations.
            </p>

            <div className="mt-6 flex items-center gap-3 text-sm font-semibold text-[#167D62]">
              <Camera size={18} />
              <span>A visual journey through our fishery</span>
            </div>
          </div>

        </div>

        {/* Highlights */}
        <div className="mt-14 grid gap-5 border-t border-[#E3EBE4] pt-9 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">

          {galleryHighlights.map((item, index) => {
            const Icon = item.icon

            return (
              <div key={item.title} className="flex gap-4">

                <div className="flex h-12 w-12 shrink-0 items-center justify-center bg-[#EAF3ED] text-[#167D62]">
                  <Icon size={21} strokeWidth={1.7} />
                </div>

                <div>
                  <span className="text-[10px] font-semibold tracking-[0.15em] text-[#9AA99E]">
                    0{index + 1}
                  </span>

                  <h3 className="mt-1 text-base font-semibold text-[#123D35]">
                    {item.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-[#748379]">
                    {item.description}
                  </p>
                </div>

              </div>
            )
          })}

        </div>

      </div>
    </section>
  )
}

export default GalleryIntroduction