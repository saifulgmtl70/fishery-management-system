import { ArrowRight, Home, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'

function FisheryHero() {
  return (
    <section className="relative isolate flex min-h-[360px] items-center overflow-hidden bg-[#123D35] text-white sm:min-h-[410px] lg:min-h-[460px]">

      {/* Background Image */}
      <div
        className="absolute inset-0 -z-20 bg-cover bg-center"
        style={{
          backgroundImage: "url('/images/fishery-hero.jpg')",
        }}
      />

      {/* Dark Overlay */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#102F29]/95 via-[#102F29]/75 to-[#102F29]/25" />

      <div className="mx-auto w-full max-w-[1440px] px-5 py-16 sm:px-8 lg:px-16">

        {/* Breadcrumb */}
        <div className="mb-8 flex items-center gap-2 text-xs font-medium text-white/70 sm:text-sm">
          <Link
            to="/"
            className="flex items-center gap-1.5 transition-colors hover:text-white"
          >
            <Home size={14} />
            Home
          </Link>

          <ChevronRight size={14} />

          <span className="text-[#B7E6CA]">Our Fishery</span>
        </div>

        {/* Content */}
        <div className="max-w-3xl">

          <span className="mb-5 inline-block text-xs font-bold uppercase tracking-[0.24em] text-[#B7E6CA]">
            OUR FISHERY OPERATIONS
          </span>

          <h1 className="text-4xl font-semibold leading-[1.15] tracking-tight sm:text-5xl lg:text-6xl">
            From Our Ponds
            <br />
            <span className="text-[#B7E6CA]">
              To the Market.
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-sm leading-7 text-white/80 sm:text-base sm:leading-8">
            Discover how we manage our ponds, care for fish, organize
            harvesting operations and connect our production with
            wholesale markets.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-4">

            <Link
              to="/contact"
              className="inline-flex items-center gap-3 rounded-md bg-[#167D62] px-6 py-3.5 text-sm font-semibold text-white transition-colors duration-300 hover:bg-white hover:text-[#123D35]"
            >
              Get in Touch
              <ArrowRight size={17} />
            </Link>

            <Link
              to="/about"
              className="inline-flex items-center gap-2 text-sm font-semibold text-white transition-colors hover:text-[#B7E6CA]"
            >
              About Our Fishery
              <ArrowRight size={16} />
            </Link>

          </div>
        </div>
      </div>
    </section>
  )
}

export default FisheryHero