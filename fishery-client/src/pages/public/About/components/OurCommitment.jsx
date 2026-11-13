import { ArrowUpRight, ShieldCheck, Fish, Waves } from 'lucide-react'
import { Link } from 'react-router-dom'

const commitments = [
  {
    number: '01',
    icon: Waves,
    title: 'Responsible Aquaculture',
    description:
      'We focus on organized pond management and responsible practices throughout the fish production process.',
  },
  {
    number: '02',
    icon: Fish,
    title: 'Fish Quality & Care',
    description:
      'From stocking to harvesting, proper attention to fish growth, feeding and care remains important.',
  },
  {
    number: '03',
    icon: ShieldCheck,
    title: 'Organized Operations',
    description:
      'We value careful planning, transparent business operations and reliable connections with our buyers.',
  },
]

function OurCommitment() {
  return (
    <section className="relative overflow-hidden bg-[#F7F8F5] px-5 py-20 sm:px-8 lg:px-16 lg:py-24">
      <div className="mx-auto max-w-[1440px]">
        <div className="mb-12 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <span className="mb-4 block text-xs font-bold uppercase tracking-[0.22em] text-[#167D62]">
              WHAT WE STAND FOR
            </span>

            <h2 className="text-3xl font-semibold leading-tight tracking-tight text-[#123D35] sm:text-4xl lg:text-5xl">
              Our Commitment to
              <span className="text-[#167D62]"> Better Fishery.</span>
            </h2>
          </div>

          <p className="max-w-md text-sm leading-7 text-[#64766C] sm:text-base">
            We believe that successful fishery operations are built through
            responsible practices, consistent care and thoughtful management.
          </p>
        </div>

        <div className="grid grid-cols-1 border-t border-[#DCE7DE] sm:grid-cols-2 lg:grid-cols-3">
          {commitments.map((item) => {
            const Icon = item.icon

            return (
              <div
                key={item.number}
                className="group border-b border-[#DCE7DE] py-8 sm:px-6 lg:px-8 lg:py-10 first:lg:pl-0 last:lg:pr-0"
              >
                <div className="mb-8 flex items-center justify-between">
                  <span className="text-sm font-semibold tracking-widest text-[#91A69A]">
                    {item.number}
                  </span>

                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#EAF3ED] text-[#167D62] transition-colors duration-300 group-hover:bg-[#167D62] group-hover:text-white">
                    <Icon size={21} strokeWidth={1.7} />
                  </div>
                </div>

                <h3 className="mb-3 text-xl font-semibold text-[#123D35]">
                  {item.title}
                </h3>

                <p className="max-w-sm text-sm leading-7 text-[#64766C]">
                  {item.description}
                </p>
              </div>
            )
          })}
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-5 rounded-xl border border-[#DCE7DE] bg-white p-6 sm:flex-row sm:items-center sm:p-8">
          <div>
            <h3 className="text-xl font-semibold text-[#123D35]">
              Want to know more about our operations?
            </h3>
            <p className="mt-2 text-sm text-[#64766C]">
              Get in touch with us to learn more about our fishery.
            </p>
          </div>

          <Link
            to="/contact"
            className="inline-flex shrink-0 items-center gap-3 rounded-md bg-[#167D62] px-6 py-3 text-sm font-semibold text-white transition-colors duration-300 hover:bg-[#123D35]"
          >
            Contact Us
            <ArrowUpRight size={17} />
          </Link>
        </div>
      </div>
    </section>
  )
}

export default OurCommitment