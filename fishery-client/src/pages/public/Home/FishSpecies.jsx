import { ArrowUpRight, Fish } from 'lucide-react'
import { Link } from 'react-router-dom'

const fishSpecies = [
  {
    name: 'Pangash',
    scientificName: 'Pangasius',
    description:
      'A popular freshwater farmed fish known for its growth and commercial value.',
    image: '/images/fish/Pangash.png',
    number: '01',
  },
  {
    name: 'Rui',
    scientificName: 'Rohu',
    description:
      'A widely cultivated freshwater carp valued for its taste and market demand.',
    image: '/images/fish/Rui.png',
    number: '02',
  },
  {
    name: 'Katla',
    scientificName: 'Catla',
    description:
      'A major freshwater carp species commonly raised in pond aquaculture.',
    image: '/images/fish/Katla.png',
    number: '03',
  },
  {
    name: 'Tilapia',
    scientificName: 'Oreochromis',
    description:
      'A fast-growing freshwater fish suitable for organized commercial farming.',
    image: '/images/fish/Tilapia.png',
    number: '04',
  },
]

const FishSpecies = () => {
  return (
    <section className="overflow-hidden bg-white py-20 sm:py-24 lg:py-28">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-16">

        {/* Section Heading */}
        <div className="mb-12 flex flex-col justify-between gap-6 lg:mb-14 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <div className="mb-5 flex items-center gap-3">
              <span className="h-[2px] w-9 bg-[#167D62]" />
              <span className="text-xs font-bold tracking-[0.22em] text-[#167D62]">
                OUR FISH SPECIES
              </span>
            </div>

            <h2 className="text-3xl leading-tight font-semibold tracking-tight text-[#123D35] sm:text-4xl lg:text-[46px]">
              Freshwater Species,
              <span className="text-[#167D62]"> Carefully Raised.</span>
            </h2>
          </div>

          <p className="max-w-md text-[15px] leading-8 text-[#718078]">
            Explore some of the freshwater fish species associated with our
            aquaculture operations.
          </p>
        </div>

        {/* Fish Species Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {fishSpecies.map((fish) => (
            <article key={fish.number} className="group">

              {/* Image */}
              <div className="relative overflow-hidden bg-[#F1F5F1]">
                <img
                  src={fish.image}
                  alt={`${fish.name} fish`}
                  loading="lazy"
                  className="h-[250px] w-full object-cover transition-transform duration-700 group-hover:scale-105 sm:h-[280px]"
                />

                <span className="absolute left-4 top-4 bg-white/95 px-3 py-1.5 text-xs font-semibold tracking-wider text-[#167D62]">
                  {fish.number}
                </span>

                <div className="absolute bottom-4 right-4 flex h-10 w-10 items-center justify-center bg-[#123D35] text-white transition-colors duration-300 group-hover:bg-[#167D62]">
                  <Fish size={19} />
                </div>
              </div>

              {/* Details */}
              <div className="border-b border-[#E7EEE8] pb-6 pt-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-semibold text-[#193E32]">
                      {fish.name}
                    </h3>

                    <p className="mt-1 text-xs italic text-[#91A096]">
                      {fish.scientificName}
                    </p>
                  </div>

                  <ArrowUpRight
                    size={19}
                    className="mt-1 shrink-0 text-[#A0B0A5] transition-all duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-[#167D62]"
                  />
                </div>

                <p className="mt-4 text-sm leading-7 text-[#7B8B80]">
                  {fish.description}
                </p>
              </div>
            </article>
          ))}
        </div>

        {/* Bottom Link */}
        <div className="mt-10 flex justify-center">
          <Link
            to="/fishery"
            className="group inline-flex items-center gap-3 border border-[#D9E6DC] px-6 py-4 text-sm font-semibold text-[#123D35] transition-all duration-300 hover:border-[#123D35] hover:bg-[#123D35] hover:text-white"
          >
            Explore Our Fishery
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

export default FishSpecies