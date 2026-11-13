import { Link } from 'react-router-dom'
import { ArrowRight, Home, MessageCircle } from 'lucide-react'

function ContactHero() {
  return (
    <section className="relative isolate flex min-h-[340px] items-center overflow-hidden bg-[#123D35] text-white sm:min-h-[390px] lg:min-h-[440px]">

      {/* Background Image */}
      <div
        className="absolute inset-0 -z-20 bg-cover bg-center"
        style={{
          backgroundImage: "url('/images/contact-hero.jpg')",
        }}
      />

      {/* Dark Overlay */}
      <div className="absolute inset-0 -z-10 bg-[#102F29]/75" />

      {/* Decorative Circles */}
      <div className="pointer-events-none absolute -right-20 top-1/2 h-80 w-80 -translate-y-1/2 rounded-full border border-white/10" />

      <div className="pointer-events-none absolute -right-10 top-1/2 h-60 w-60 -translate-y-1/2 rounded-full border border-white/10" />

      {/* Content */}
      <div className="fishery-container w-full py-16">

        <div className="mx-auto max-w-3xl text-center">

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

            <span className="text-[#9BD9B3]">Contact</span>

          </div>

          {/* Eyebrow */}
          <div className="mb-5 flex items-center justify-center gap-3">
            <span className="h-px w-8 bg-[#9BD9B3]" />

            <span className="text-xs font-semibold uppercase tracking-[0.24em] text-[#9BD9B3]">
              Get In Touch
            </span>

            <span className="h-px w-8 bg-[#9BD9B3]" />
          </div>

          {/* Heading */}
          <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            Let's Start a{' '}
            <span className="text-[#9BD9B3]">Conversation.</span>
          </h1>

          {/* Description */}
          <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-white/75 sm:text-base sm:leading-8">
            Have questions about our fish production, wholesale supply,
            or lake activities? We are here to help. Reach out and
            connect with our team.
          </p>

          {/* Contact Indicator */}
          <div className="mt-9 inline-flex items-center gap-3 border border-white/20 bg-white/5 px-5 py-3">
            <MessageCircle size={17} className="text-[#9BD9B3]" />

            <span className="text-xs font-medium tracking-wide text-white/85">
              We'd Be Happy to Hear From You
            </span>
          </div>

        </div>

      </div>
    </section>
  )
}

export default ContactHero