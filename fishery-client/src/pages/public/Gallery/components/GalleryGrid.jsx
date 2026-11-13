import { useState } from 'react'
import { X, ArrowUpRight, Camera } from 'lucide-react'

const categories = [
  'All',
  'Pond & Farm',
  'Fish Production',
  'Harvesting',
  'Wholesale',
  'Lake Activities',
]

const galleryItems = [
  {
    id: 1,
    title: 'Our Aquaculture Farm',
    category: 'Pond & Farm',
    image: '/images/about-fishery.jpg',
    size: 'large',
  },
  {
    id: 2,
    title: 'Freshwater Fish Farming',
    category: 'Fish Production',
    image: '/images/Hero_02.png',
    size: 'normal',
  },
  {
    id: 3,
    title: 'Pangash Fish',
    category: 'Fish Production',
    image: '/images/fish/Pangash.png',
    size: 'normal',
  },
  {
    id: 4,
    title: 'Organized Fish Harvesting',
    category: 'Harvesting',
    image: '/images/harvesting-process.jpg',
    size: 'tall',
  },
  {
    id: 5,
    title: 'Wholesale Fish Distribution',
    category: 'Wholesale',
    image: '/images/wholesale-supply.jpg',
    size: 'normal',
  },
  {
    id: 6,
    title: 'Our Natural Fishery Landscape',
    category: 'Pond & Farm',
    image: '/images/Hero_01.png',
    size: 'normal',
  },
  {
    id: 7,
    title: 'Lake and Recreational Fishing',
    category: 'Lake Activities',
    image: '/images/lake-experience.jpg',
    size: 'large',
  },
  {
    id: 8,
    title: 'Rui Fish',
    category: 'Fish Production',
    image: '/images/fish/Rui.png',
    size: 'normal',
  },
  {
    id: 9,
    title: 'Fishery Operations',
    category: 'Wholesale',
    image: '/images/Hero_03.png',
    size: 'normal',
  },
  {
    id: 10,
    title: 'Katla Fish',
    category: 'Fish Production',
    image: '/images/fish/Katla.png',
    size: 'normal',
  },
  {
    id: 11,
    title: 'Tilapia Fish',
    category: 'Fish Production',
    image: '/images/fish/Tilapia.png',
    size: 'normal',
  },
]

function GalleryGrid() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [selectedImage, setSelectedImage] = useState(null)

  const filteredItems =
    activeCategory === 'All'
      ? galleryItems
      : galleryItems.filter(
          (item) => item.category === activeCategory
        )

  return (
    <section className="bg-[#EAF3ED] px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24">
      <div className="mx-auto max-w-[1440px]">

        {/* Section Heading */}
        <div className="mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end">

          <div>
            <div className="mb-4 flex items-center gap-3">
              <span className="h-px w-9 bg-[#167D62]" />

              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[#167D62]">
                Photo Collection
              </span>
            </div>

            <h2 className="text-3xl font-semibold tracking-tight text-[#123D35] sm:text-4xl">
              Explore Our <span className="text-[#167D62]">Moments</span>
            </h2>
          </div>

          <p className="max-w-md text-sm leading-7 text-[#64766C]">
            Browse through different aspects of our fishery and discover
            the activities that take place throughout our operations.
          </p>

        </div>

        {/* Category Filters */}
        <div className="mb-10 flex flex-wrap gap-2">
          {categories.map((category) => {
            const isActive = activeCategory === category

            return (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-5 py-3 text-xs font-semibold transition-all duration-300 sm:text-sm ${
                  isActive
                    ? 'bg-[#123D35] text-white'
                    : 'border border-[#D6E5D9] bg-white text-[#64766C] hover:border-[#167D62] hover:text-[#167D62]'
                }`}
              >
                {category}
              </button>
            )
          })}
        </div>

        {/* Image Grid */}
        <div className="grid auto-rows-[220px] grid-cols-1 gap-4 sm:grid-cols-2 lg:auto-rows-[250px] lg:grid-cols-3 xl:grid-cols-4">

          {filteredItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setSelectedImage(item)}
              aria-label={`View ${item.title}`}
              className={`group relative isolate overflow-hidden bg-[#DCE9DF] text-left ${
                item.size === 'large'
                  ? 'sm:col-span-2'
                  : item.size === 'tall'
                    ? 'sm:row-span-2'
                    : ''
              }`}
            >

              <img
                src={item.image}
                alt={item.title}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#102F29]/85 via-[#102F29]/10 to-transparent opacity-70 transition-opacity duration-300 group-hover:opacity-100" />

              {/* Image Information */}
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-5 sm:p-6">

                <div className="translate-y-2 transition-transform duration-300 group-hover:translate-y-0">

                  <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.17em] text-[#9BD9B3]">
                    {item.category}
                  </span>

                  <h3 className="text-lg font-semibold text-white">
                    {item.title}
                  </h3>

                </div>

                <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-white text-[#123D35] opacity-0 transition-all duration-300 group-hover:opacity-100">
                  <ArrowUpRight size={19} />
                </span>

              </div>

            </button>
          ))}

        </div>

        {/* Empty State */}
        {filteredItems.length === 0 && (
          <div className="py-16 text-center">
            <Camera size={35} className="mx-auto text-[#167D62]" />

            <p className="mt-4 text-sm text-[#64766C]">
              No images found in this category.
            </p>
          </div>
        )}

        {/* Image Count */}
        <div className="mt-8 flex items-center justify-between border-t border-[#D6E5D9] pt-6">
          <p className="text-xs text-[#748379]">
            Showing {filteredItems.length} photographs
          </p>

          <span className="text-xs font-semibold uppercase tracking-wider text-[#167D62]">
            Our Fishery Collection
          </span>
        </div>

      </div>

      {/* Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#081C17]/95 p-4 sm:p-8"
          onClick={() => setSelectedImage(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Image preview"
        >

          <button
            onClick={() => setSelectedImage(null)}
            aria-label="Close image preview"
            className="absolute right-5 top-5 z-10 flex h-11 w-11 items-center justify-center border border-white/20 text-white transition-colors hover:bg-white hover:text-[#123D35]"
          >
            <X size={22} />
          </button>

          <div
            className="w-full max-w-5xl"
            onClick={(event) => event.stopPropagation()}
          >

            <img
              src={selectedImage.image}
              alt={selectedImage.title}
              className="max-h-[75vh] w-full object-contain"
            />

            <div className="mt-5 text-center">
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9BD9B3]">
                {selectedImage.category}
              </span>

              <h3 className="mt-2 text-xl font-semibold text-white">
                {selectedImage.title}
              </h3>
            </div>

          </div>

        </div>
      )}

    </section>
  )
}

export default GalleryGrid