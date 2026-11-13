import { ArrowRight, Images, Fish } from 'lucide-react'
import { Link } from 'react-router-dom'

function ContactCTA() {
  return (
    <section className="bg-[#F7F8F5] px-5 py-16 sm:px-8 md:py-20 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="relative overflow-hidden rounded-2xl bg-[#123D35] px-7 py-14 sm:px-12 md:py-16 lg:px-16">

          {/* Decorative Elements */}
          <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -right-8 -top-12 h-52 w-52 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -bottom-28 left-1/3 h-64 w-64 rounded-full border border-white/10" />

          <div className="relative z-10 flex flex-col items-start justify-between gap-10 lg:flex-row lg:items-center">

            {/* Content */}
            <div className="max-w-2xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#9BD9B3]/30 bg-white/5 px-4 py-2">
                <Fish size={15} className="text-[#9BD9B3]" />

                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#B8E5C9]">
                  Let's Connect
                </span>
              </div>

              <h2 className="text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
                Have More Questions?
                <span className="mt-2 block text-[#9BD9B3]">
                  We're Ready to Help.
                </span>
              </h2>

              <p className="mt-5 max-w-xl text-sm leading-7 text-white/65 sm:text-base">
                Whether you're interested in our fish production, wholesale
                supply or lake activities, we'd be happy to hear from you.
                Explore our fishery and discover what we offer.
              </p>
            </div>

            {/* Actions */}
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row lg:flex-col">

              <Link
                to="/fishery"
                className="inline-flex items-center justify-center gap-3 rounded-lg bg-[#9BD9B3] px-7 py-4 text-sm font-semibold text-[#123D35] transition-all duration-300 hover:bg-white"
              >
                Explore Our Fishery
                <ArrowRight size={17} />
              </Link>

              <Link
                to="/gallery"
                className="inline-flex items-center justify-center gap-3 rounded-lg border border-white/25 px-7 py-4 text-sm font-semibold text-white transition-all duration-300 hover:border-white hover:bg-white/10"
              >
                <Images size={17} />
                View Gallery
              </Link>

            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ContactCTA