import {
  MapPin,
  Phone,
  Mail,
  Clock,
  ArrowUpRight,
} from 'lucide-react'

const contactDetails = [
  {
    icon: MapPin,
    label: 'Our Location',
    title: 'Visit Our Fishery',
    value: 'Your Fishery Address, Bangladesh',
    link: null,
  },
  {
    icon: Phone,
    label: 'Call Us',
    title: 'Phone Number',
    value: '+880 1XXXXXXXXX',
    link: 'tel:+8801XXXXXXXXX',
  },
  {
    icon: Mail,
    label: 'Email Us',
    title: 'Email Address',
    value: 'your-email@example.com',
    link: 'mailto:your-email@example.com',
  },
  {
    icon: Clock,
    label: 'Working Hours',
    title: 'Business Hours',
    value: 'Saturday – Thursday | 9:00 AM – 6:00 PM',
    link: null,
  },
]

function ContactInformation() {
  return (
    <section className="bg-[#EAF3ED] px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24">
      <div className="mx-auto max-w-[1440px]">

        {/* Heading */}
        <div className="mb-12 max-w-2xl">
          <div className="mb-5 flex items-center gap-3">
            <span className="h-px w-9 bg-[#167D62]" />

            <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[#167D62]">
              Contact Details
            </span>
          </div>

          <h2 className="text-3xl font-semibold leading-tight tracking-tight text-[#123D35] sm:text-4xl">
            Here Is How You Can{' '}
            <span className="text-[#167D62]">Reach Us.</span>
          </h2>

          <p className="mt-5 text-sm leading-7 text-[#64766C] sm:text-base">
            Find our contact details below. Choose the most convenient
            way to get in touch with our fishery team.
          </p>
        </div>

        {/* Contact Cards */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

          {contactDetails.map((item, index) => {
            const Icon = item.icon

            return (
              <div
                key={item.title}
                className="group flex min-h-[245px] flex-col border border-[#DCE8DE] bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#167D62]/40 hover:shadow-lg hover:shadow-[#123D35]/5 sm:p-7"
              >

                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center bg-[#EAF3ED] text-[#167D62] transition-colors duration-300 group-hover:bg-[#123D35] group-hover:text-white">
                    <Icon size={21} strokeWidth={1.7} />
                  </div>

                  <span className="text-xs font-semibold tracking-wider text-[#A3B1A6]">
                    0{index + 1}
                  </span>
                </div>

                <div className="mt-7">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#167D62]">
                    {item.label}
                  </span>

                  <h3 className="mt-2 text-lg font-semibold text-[#123D35]">
                    {item.title}
                  </h3>

                  <p className="mt-3 break-words text-sm leading-7 text-[#748379]">
                    {item.value}
                  </p>
                </div>

                {item.link && (
                  <a
                    href={item.link}
                    className="mt-auto inline-flex items-center gap-2 pt-5 text-xs font-semibold text-[#167D62] transition-colors hover:text-[#123D35]"
                  >
                    {item.title === 'Phone Number' ? 'Call Now' : 'Send Email'}
                    <ArrowUpRight size={15} />
                  </a>
                )}

              </div>
            )
          })}

        </div>

      </div>
    </section>
  )
}

export default ContactInformation