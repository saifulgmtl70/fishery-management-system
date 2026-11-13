import {
  MessageCircle,
  Fish,
  Truck,
  Waves,
  Handshake,
} from 'lucide-react'

const contactTopics = [
  {
    icon: Fish,
    title: 'Fish Production',
    description:
      'Questions about our fish farming, species, and production activities.',
  },
  {
    icon: Truck,
    title: 'Wholesale Supply',
    description:
      'Interested in bulk fish purchases, pricing, or dealer partnerships.',
  },
  {
    icon: Waves,
    title: 'Lake Activities',
    description:
      'Want to know more about recreational fishing and lake experiences.',
  },
  {
    icon: Handshake,
    title: 'Business Enquiries',
    description:
      'Discuss potential collaborations and other business opportunities.',
  },
]

function ContactIntroduction() {
  return (
    <section className="bg-[#F7F8F5] px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24">
      <div className="mx-auto max-w-[1440px]">

        {/* Introduction */}
        <div className="grid gap-8 lg:grid-cols-2 lg:items-end lg:gap-16">

          <div>
            <div className="mb-5 flex items-center gap-3">
              <span className="h-px w-9 bg-[#167D62]" />

              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[#167D62]">
                We'd Love to Connect
              </span>
            </div>

            <h2 className="max-w-xl text-3xl font-semibold leading-tight tracking-tight text-[#123D35] sm:text-4xl lg:text-5xl">
              Every Good Connection Starts With a{' '}
              <span className="text-[#167D62]">Conversation.</span>
            </h2>
          </div>

          <div className="lg:pb-1">
            <p className="text-sm leading-8 text-[#64766C] sm:text-base">
              Whether you are a fish dealer, a potential business partner,
              or simply interested in learning about our fishery, we
              welcome your questions. Choose a topic below or send us
              a message directly.
            </p>

            <div className="mt-6 flex items-center gap-3 text-sm font-semibold text-[#167D62]">
              <MessageCircle size={18} />
              <span>Let's discuss how we can help</span>
            </div>
          </div>

        </div>

        {/* Contact Topics */}
        <div className="mt-14 grid gap-5 border-t border-[#E3EBE4] pt-9 sm:grid-cols-2 lg:grid-cols-4 lg:gap-7">

          {contactTopics.map((item, index) => {
            const Icon = item.icon

            return (
              <div key={item.title} className="group">

                <div className="mb-5 flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center bg-[#EAF3ED] text-[#167D62] transition-colors duration-300 group-hover:bg-[#123D35] group-hover:text-white">
                    <Icon size={21} strokeWidth={1.7} />
                  </div>

                  <span className="text-xs font-semibold tracking-wider text-[#A3B1A6]">
                    0{index + 1}
                  </span>
                </div>

                <h3 className="text-base font-semibold text-[#123D35]">
                  {item.title}
                </h3>

                <p className="mt-3 text-sm leading-7 text-[#748379]">
                  {item.description}
                </p>

              </div>
            )
          })}

        </div>

      </div>
    </section>
  )
}

export default ContactIntroduction