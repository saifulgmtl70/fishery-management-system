import {
  Truck,
  Handshake,
  Scale,
  PackageCheck,
  ArrowUpRight,
  CheckCircle2,
} from 'lucide-react'
import { Link } from 'react-router-dom'

const supplyFeatures = [
  {
    icon: Handshake,
    title: 'Dealer Relationships',
    description:
      'Building business connections with fish dealers and wholesale buyers.',
  },
  {
    icon: Scale,
    title: 'Quantity & Price Management',
    description:
      'Recording actual fish quantities, negotiated rates and wholesale sales.',
  },
  {
    icon: PackageCheck,
    title: 'Organized Fish Handling',
    description:
      'Preparing harvested fish for collection and distribution to buyers.',
  },
  {
    icon: Truck,
    title: 'Delivery Coordination',
    description:
      'Coordinating transportation, delivery quantities and shipment records.',
  },
]

function WholesaleSupply() {
  return (
    <section className="bg-white px-5 py-20 sm:px-8 lg:px-16 lg:py-28">
      <div className="mx-auto max-w-[1440px]">

        {/* Heading */}
        <div className="mb-12 max-w-3xl">
          <span className="mb-4 block text-xs font-bold uppercase tracking-[0.22em] text-[#167D62]">
            WHOLESALE & DISTRIBUTION
          </span>

          <h2 className="text-3xl font-semibold leading-tight tracking-tight text-[#123D35] sm:text-4xl lg:text-5xl">
            Connecting Our Harvest
            <span className="text-[#167D62]"> to the Market.</span>
          </h2>

          <p className="mt-5 max-w-2xl text-sm leading-8 text-[#64766C] sm:text-base">
            Our wholesale operations connect harvested fish with dealers
            and buyers through organized sales, quantity management and
            delivery coordination.
          </p>
        </div>

        {/* Main Content */}
        <div className="grid overflow-hidden rounded-xl border border-[#E7EEE8] bg-[#F7F8F5] lg:grid-cols-2">

          {/* Information Side */}
          <div className="flex flex-col justify-center p-6 sm:p-9 lg:p-12">

            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#167D62]">
              FROM FARM TO BUYER
            </span>

            <h3 className="mt-3 text-2xl font-semibold leading-snug text-[#123D35] sm:text-3xl">
              Reliable Wholesale Supply Operations
            </h3>

            <p className="mt-4 text-sm leading-7 text-[#64766C]">
              After harvesting, actual fish quantities are measured and
              prepared for wholesale sales. We coordinate with dealers
              regarding fish species, quantities, agreed prices and
              transportation arrangements.
            </p>

            <div className="mt-8 space-y-6">
              {supplyFeatures.map((feature) => {
                const Icon = feature.icon

                return (
                  <div key={feature.title} className="flex gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#EAF3ED] text-[#167D62]">
                      <Icon size={21} strokeWidth={1.7} />
                    </div>

                    <div>
                      <h4 className="text-base font-semibold text-[#123D35]">
                        {feature.title}
                      </h4>

                      <p className="mt-1 text-sm leading-6 text-[#64766C]">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="mt-8 border-t border-[#E1EAE2] pt-6">
              <div className="flex items-start gap-3">
                <CheckCircle2
                  size={19}
                  className="mt-0.5 shrink-0 text-[#167D62]"
                />

                <p className="text-sm leading-6 text-[#52695C]">
                  Wholesale transactions can include partial payments,
                  outstanding balances and delivery records.
                </p>
              </div>
            </div>

            <Link
              to="/contact"
              className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-[#167D62] transition-colors hover:text-[#123D35]"
            >
              Discuss Business Opportunities
              <ArrowUpRight size={17} />
            </Link>
          </div>

          {/* Image Side */}
          <div className="relative min-h-[300px] overflow-hidden sm:min-h-[380px] lg:min-h-[560px]">
            <img
              src="/images/wholesale-supply.jpg"
              alt="Fresh fish prepared for wholesale distribution"
              className="absolute inset-0 h-full w-full object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-[#102F29]/75 via-transparent to-transparent" />

            <div className="absolute bottom-7 left-6 right-6 sm:bottom-9 sm:left-9">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#B7E6CA]">
                WHOLESALE DISTRIBUTION
              </span>

              <h3 className="mt-3 max-w-md text-2xl font-semibold leading-snug text-white sm:text-3xl">
                Fresh Harvest.
                Organized Supply.
              </h3>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default WholesaleSupply