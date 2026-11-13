import { Link } from 'react-router-dom'
import { ArrowRight, Home } from 'lucide-react'

function GalleryHero() {
  return (
    <section className="relative isolate flex min-h-[340px] items-center overflow-hidden bg-[#123D35] text-white sm:min-h-[390px] lg:min-h-[440px]">

      {/* Background Image */}
      <div
        className="absolute inset-0 -z-20 bg-cover bg-center"
        style={{
          backgroundImage: "url('/images/gallery-hero.jpg')",
        }}
      />

      {/* Overlay */}
      <div className="absolute inset-0 -z-10 bg-[#102F29]/70" />

      {/* Decorative pattern */}
      <div className="pointer-events-none absolute -right-20 top-1/2 h-80 w-80 -translate-y-1/2 rounded-full border border-white/10" />

      <div className="pointer-events-none absolute -right-10 top-1/2 h-60 w-60 -translate-y-1/2 rounded-full border border-white/10" />

      {/* Content */}
      <div className="fishery-container w-full py-16 text-center">

        {/* Breadcrumb */}
        <div className="mb-7 flex items-center justify-center gap-2 text-xs font-medium text-white/65">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 transition-colors hover:text-[#9BD9B3]"
          >
            <Home size={13} />
            Home
          </Link>

          <ArrowRight size={12} />

          <span className="text-[#9BD9B3]">Gallery</span>
        </div>

        {/* Heading */}
        <span className="mb-5 inline-block text-xs font-semibold uppercase tracking-[0.25em] text-[#9BD9B3]">
          Life Around Our Fishery
        </span>

        <h1 className="mx-auto max-w-4xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
          A Closer Look at Our{' '}
          <span className="text-[#9BD9B3]">Fishery</span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-white/75 sm:text-base sm:leading-8">
          Explore moments from our ponds, fish production, harvesting
          operations, wholesale activities, and lake experiences.
        </p>

        {/* Bottom indicator */}
        <div className="mt-9 flex items-center justify-center gap-3">
          <span className="h-px w-10 bg-[#9BD9B3]" />
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/60">
            Our Visual Story
          </span>
          <span className="h-px w-10 bg-[#9BD9B3]" />
        </div>

      </div>
    </section>
  )
}

export default GalleryHero