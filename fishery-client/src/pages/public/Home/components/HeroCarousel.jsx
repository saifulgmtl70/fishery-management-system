
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Fish,
  Waves,
  Truck,
} from 'lucide-react'

const slides = [
  {
    number: '01',
    eyebrow: 'RESPONSIBLE AQUACULTURE',
    title: 'A Better Way to Manage',
    highlight: 'Aquaculture.',
    description:
      'Bringing pond management, fish farming and daily operations together through a more organized approach to sustainable aquaculture.',
    image: '/images/Hero_01.png',
    icon: Waves,
    label: 'Pond Management',
    button: 'Discover Our Fishery',
    link: '/fishery',
    position: 'center',
  },
  {
    number: '02',
    eyebrow: 'QUALITY FISH PRODUCTION',
    title: 'Growing Healthy Fish,',
    highlight: 'Growing Value.',
    description:
      'From careful stocking and feeding to growth monitoring and harvesting, every stage matters in responsible fish production.',
    image: '/images/Hero_02.png',
    icon: Fish,
    label: 'Fish Production',
    button: 'Explore Our Operations',
    link: '/fishery',
    position: 'center',
  },
  {
    number: '03',
    eyebrow: 'FARM TO MARKET',
    title: 'Connecting Harvests',
    highlight: 'With Markets.',
    description:
      'Building reliable wholesale connections through organized harvesting, dealer relationships and efficient fish distribution.',
    image: '/images/Hero_03.png',
    icon: Truck,
    label: 'Wholesale Supply',
    button: 'Get in Touch',
    link: '/contact',
    position: 'center',
  },
]

function HeroCarousel() {
  const [activeIndex, setActiveIndex] = useState(0)

  const activeSlide = slides[activeIndex]
  const ActiveIcon = activeSlide.icon

  const goToNext = () => {
    setActiveIndex((current) => (current + 1) % slides.length)
  }

  const goToPrevious = () => {
    setActiveIndex(
      (current) => (current - 1 + slides.length) % slides.length,
    )
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length)
    }, 6500)

    return () => clearInterval(interval)
  }, [activeIndex])

  return (
    <section
      aria-label="Fishery highlights"
      className="relative isolate min-h-[400px] overflow-hidden bg-[#102F29] text-white sm:min-h-[450px] lg:min-h-[500px]"
    >
      {/* Background slides */}
      {slides.map((slide, index) => (
        <div
          key={slide.number}
          aria-hidden="true"
          className={`absolute inset-0 -z-20 bg-cover bg-no-repeat transition-opacity duration-1000 ease-in-out motion-reduce:transition-none ${
            activeIndex === index ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            backgroundImage: `url("${slide.image}")`,
            backgroundPosition: slide.position,
          }}
        />
      ))}

      {/* Image overlays */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#071F1A]/95 via-[#0C3028]/75 to-[#0C3028]/25" />

      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#071F1A]/75 via-transparent to-[#071F1A]/15" />

      {/* Subtle decorative pattern */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.12]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
          backgroundSize: '34px 34px',
        }}
      />

      {/* Main content */}
      <div className="mx-auto flex min-h-[400px] max-w-[1440px] flex-col justify-center px-5 pb-24 pt-16 sm:min-h-[450px] sm:px-8 sm:pb-28 lg:min-h-[500px] lg:px-16">
        <div className="max-w-3xl">

          {/* Eyebrow */}
          <div className="mb-5 flex items-center gap-3 sm:mb-6">
            <span className="h-px w-10 bg-[#76C7A2]" />

            <p
              key={`eyebrow-${activeIndex}`}
              className="animate-[fadeIn_.6s_ease] text-[10px] font-bold tracking-[0.24em] text-[#A8E2C5] sm:text-xs"
            >
              {activeSlide.eyebrow}
            </p>
          </div>

          {/* Main heading */}
          <div
            key={`heading-${activeIndex}`}
            className="animate-[fadeIn_.7s_ease]"
          >
            <h1 className="max-w-3xl text-[2.1rem] font-semibold leading-[1.12] tracking-[-0.045em] sm:text-5xl lg:text-[68px]">
              {activeSlide.title}

              <span className="mt-1 block text-[#8FD5B3]">
                {activeSlide.highlight}
              </span>
            </h1>

            <p className="mt-4 max-w-xl text-xs leading-6 text-white/75 sm:mt-5 sm:text-sm sm:leading-7 lg:text-base lg:leading-8">
              {activeSlide.description}
            </p>
          </div>

          {/* Buttons */}
          <div className="mt-6 flex flex-wrap items-center gap-3 sm:mt-7 sm:gap-4">
            <Link
              to={activeSlide.link}
              className="group inline-flex min-h-11 items-center justify-center gap-3 bg-[#16845F] px-5 py-3 text-xs font-semibold text-white transition-colors duration-300 hover:bg-[#1B9B70] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white sm:px-6 sm:text-sm"
            >
              {activeSlide.button}

              <ArrowRight
                size={17}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>

            <Link
              to="/contact"
              className="inline-flex min-h-11 items-center justify-center border border-white/45 px-5 py-3 text-xs font-semibold text-white transition-colors duration-300 hover:border-white hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white sm:px-6 sm:text-sm"
            >
              Contact Us
            </Link>
          </div>

          {/* Current slide identity */}
          <div
            key={`identity-${activeIndex}`}
            className="mt-7 flex animate-[fadeIn_.7s_ease] items-center gap-3 border-l-2 border-[#8FD5B3] pl-4 sm:mt-8"
          >
            <ActiveIcon size={21} className="text-[#A8E2C5]" />

            <div>
              <p className="text-xs font-semibold text-white">
                {activeSlide.label}
              </p>

              <p className="mt-1 text-[9px] tracking-wide text-white/55 sm:text-[10px]">
                FISHERY MANAGEMENT SYSTEM
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Slide controls */}
      <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between sm:bottom-7 sm:left-8 sm:right-8 lg:bottom-8 lg:left-16 lg:right-16">

        {/* Numbered pagination */}
        <div className="flex items-center gap-3 sm:gap-6">
          {slides.map((slide, index) => (
            <button
              key={slide.number}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`Go to slide ${slide.number}`}
              aria-current={activeIndex === index ? 'true' : undefined}
              className="group flex items-center gap-2 py-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              <span
                className={`text-xs font-semibold transition-colors ${
                  activeIndex === index
                    ? 'text-white'
                    : 'text-white/45 group-hover:text-white/80'
                }`}
              >
                {slide.number}
              </span>

              <span
                className={`h-[2px] transition-all duration-300 ${
                  activeIndex === index
                    ? 'w-8 bg-[#8FD5B3] sm:w-12'
                    : 'w-4 bg-white/35 group-hover:bg-white/70 sm:w-6'
                }`}
              />
            </button>
          ))}

          <span className="ml-1 text-[10px] tracking-wider text-white/45 sm:text-xs">
            / 03
          </span>
        </div>

        {/* Previous / Next */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={goToPrevious}
            aria-label="Previous slide"
            className="flex h-9 w-9 items-center justify-center border border-white/35 text-white transition-colors hover:border-white hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:h-11 sm:w-11"
          >
            <ChevronLeft size={20} />
          </button>

          <button
            type="button"
            onClick={goToNext}
            aria-label="Next slide"
            className="flex h-9 w-9 items-center justify-center border border-white/35 text-white transition-colors hover:border-white hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:h-11 sm:w-11"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </section>
  )
}

export default HeroCarousel
