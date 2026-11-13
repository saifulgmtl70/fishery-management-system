import { Link } from 'react-router-dom'
import { ArrowUpRight, Camera, MessageCircle } from 'lucide-react'

function GalleryCTA() {
  return (
    <section className="bg-[#F7F8F5] px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24">
      <div className="mx-auto max-w-[1440px]">

        <div className="relative isolate overflow-hidden bg-[#123D35] px-7 py-14 text-white sm:px-12 sm:py-16 lg:px-20 lg:py-20">

          {/* Decorative elements */}
          <div className="pointer-events-none absolute -right-20 -top-24 -z-10 h-80 w-80 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -right-8 -top-12 -z-10 h-60 w-60 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -bottom-32 -left-20 -z-10 h-72 w-72 rounded-full border border-[#72C99A]/15" />

          <div className="relative grid items-center gap-10 lg:grid-cols-[1fr_auto] lg:gap-16">

            {/* Content */}
            <div className="max-w-2xl">

              <div className="mb-6 flex items-center gap-3">
                <span className="h-px w-9 bg-[#72C99A]" />

                <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[#9BD9B3]">
                  Beyond The Pictures
                </span>
              </div>

              <h2 className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
                Interested in Knowing More About Our{' '}
                <span className="text-[#9BD9B3]">Fishery?</span>
              </h2>

              <p className="mt-6 max-w-xl text-sm leading-7 text-white/70 sm:text-base sm:leading-8">
                The pictures are just a glimpse of our everyday activities.
                Connect with our team to learn more about our fish production,
                wholesale supply, and lake operations.
              </p>

            </div>

            {/* Actions */}
            <div className="flex flex-col gap-4 sm:flex-row lg:flex-col">

              <Link
                to="/contact"
                className="group inline-flex items-center justify-center gap-3 bg-[#72C99A] px-7 py-4 text-sm font-semibold text-[#123D35] transition-all duration-300 hover:bg-white"
              >
                <MessageCircle size={18} />
                Contact Our Team

                <ArrowUpRight
                  size={18}
                  className="transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1"
                />
              </Link>

              <Link
                to="/fishery"
                className="group inline-flex items-center justify-center gap-3 border border-white/25 px-7 py-4 text-sm font-semibold text-white transition-all duration-300 hover:border-white hover:bg-white/10"
              >
                <Camera size={18} />
                Explore Our Fishery

                <ArrowUpRight
                  size={18}
                  className="transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1"
                />
              </Link>

            </div>

          </div>

          {/* Bottom detail */}
          <div className="mt-12 border-t border-white/15 pt-6">
            <p className="text-xs tracking-wide text-white/50">
              Our Ponds · Fish Production · Harvesting · Lake Activities
            </p>
          </div>

        </div>
      </div>
    </section>
  )
}

export default GalleryCTA