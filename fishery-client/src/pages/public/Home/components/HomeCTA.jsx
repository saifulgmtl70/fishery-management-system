import { Link } from 'react-router-dom'
import { ArrowRight, ArrowUpRight, Waves } from 'lucide-react'

const HomeCTA = () => {
  return (
    <section className="relative overflow-hidden border-t border-[#E7EEE8] bg-[#F7F8F5] px-5 py-16 text-[#123D35] sm:px-8 sm:py-20 lg:px-16 lg:py-24">

      {/* Decorative Background */}
      <div className="pointer-events-none absolute -right-20 -top-32 h-96 w-96 rounded-full border border-[#167D62]/10" />
      <div className="pointer-events-none absolute -right-10 -top-20 h-72 w-72 rounded-full border border-[#167D62]/10" />
      <div className="pointer-events-none absolute -bottom-40 -left-20 h-96 w-96 rounded-full border border-[#167D62]/10" />

      <div className="relative mx-auto grid max-w-[1440px] gap-10 lg:grid-cols-[1fr_auto] lg:items-center">

        {/* Content */}
        <div className="max-w-3xl">

          {/* Eyebrow */}
          <div className="mb-5 flex items-center gap-3">
            <Waves size={19} className="text-[#167D62]" />

            <span className="text-xs font-bold tracking-[0.22em] text-[#167D62]">
              LET'S CONNECT
            </span>
          </div>

          {/* Heading */}
          <h2 className="text-3xl leading-tight font-semibold tracking-tight text-[#123D35] sm:text-4xl lg:text-[48px]">
            Interested in Our Fishery?

            <span className="block text-[#167D62]">
              Let's Start a Conversation.
            </span>
          </h2>

          {/* Description */}
          <p className="mt-6 max-w-2xl text-sm leading-8 text-[#64766C] sm:text-base">
            Whether you want to learn about our fish production,
            wholesale supply, or lake activities, we would be
            happy to hear from you.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-4 lg:flex-col lg:items-start">

          {/* Contact Button */}
          <Link
            to="/contact"
            className="group inline-flex items-center gap-3 bg-[#167D62] px-7 py-4 text-sm font-semibold text-white transition-all duration-300 hover:bg-[#123D35]"
          >
            Contact Us

            <ArrowRight
              size={18}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>

          {/* Explore Button */}
          <Link
            to="/fishery"
            className="group inline-flex items-center gap-2 border border-[#D0E0D4] bg-white/50 px-7 py-4 text-sm font-semibold text-[#123D35] transition-all duration-300 hover:border-[#123D35] hover:bg-[#123D35] hover:text-white"
          >
            Explore Our Fishery

            <ArrowUpRight
              size={17}
              className="transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1"
            />
          </Link>

        </div>
      </div>
    </section>
  )
}

export default HomeCTA