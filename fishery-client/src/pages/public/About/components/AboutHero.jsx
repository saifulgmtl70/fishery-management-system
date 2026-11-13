import { Link } from 'react-router-dom'
import { ArrowRight, Home, Waves } from 'lucide-react'

const AboutHero = () => {
  return (
    <section className="relative isolate flex min-h-[340px] items-center overflow-hidden bg-[#123D35] text-white sm:min-h-[390px] lg:min-h-[430px]">

      {/* Background Image */}
      <img
        src="/images/about-hero.jpg"
        alt="A peaceful freshwater fish farming landscape"
        className="absolute inset-0 -z-20 h-full w-full object-cover"
      />

      {/* Dark Overlay */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#0B2922]/95 via-[#0B2922]/75 to-[#0B2922]/25" />

      {/* Decorative Element */}
      <div className="pointer-events-none absolute -right-20 top-1/2 hidden h-[430px] w-[430px] -translate-y-1/2 rounded-full border border-white/10 lg:block" />

      <div className="mx-auto w-full max-w-[1440px] px-5 py-20 sm:px-8 lg:px-16">

        <div className="max-w-3xl">

          {/* Breadcrumb */}
          <div className="mb-8 flex items-center gap-2 text-sm text-white/65">
            <Link
              to="/"
              className="flex items-center gap-2 transition-colors hover:text-[#B7E6CA]"
            >
              <Home size={15} />
              Home
            </Link>

            <span className="text-white/40">/</span>

            <span className="font-medium text-[#B7E6CA]">
              About Us
            </span>
          </div>

          {/* Eyebrow */}
          <div className="mb-5 flex items-center gap-3">
            <Waves size={19} className="text-[#8DD5A8]" />

            <span className="text-xs font-bold tracking-[0.22em] text-[#B7E6CA]">
              GET TO KNOW US
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl leading-tight font-semibold tracking-tight sm:text-5xl lg:text-[58px]">
            Growing with Nature,
            <span className="mt-2 block text-[#8DD5A8]">
              Guided by Experience.
            </span>
          </h1>

          {/* Description */}
          <p className="mt-6 max-w-2xl text-sm leading-8 text-white/75 sm:text-base">
            Discover our approach to fish farming, pond management,
            harvesting and wholesale fish supply — all connected
            through a commitment to responsible fishery operations.
          </p>

          {/* CTA */}
          <div className="mt-9">
            <Link
              to="/contact"
              className="group inline-flex items-center gap-3 bg-[#8DD5A8] px-7 py-4 text-sm font-semibold text-[#123D35] transition-all duration-300 hover:bg-white"
            >
              Get in Touch

              <ArrowRight
                size={18}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>
          </div>

        </div>
      </div>
    </section>
  )
}

export default AboutHero