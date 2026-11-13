import { MapPin, Navigation, ExternalLink } from 'lucide-react'

function LocationSection() {
  const latitude = 22.251114
  const longitude = 91.805626

  const mapEmbedUrl = `https://www.google.com/maps?q=${latitude},${longitude}&z=16&output=embed`

  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`

  return (
    <section className="bg-[#F7F8F5] py-20 md:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">

        {/* Section Heading */}
        <div className="mb-12 grid gap-6 md:grid-cols-2 md:items-end">
          <div>
            <span className="mb-4 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-[#159B60]">
              <span className="h-px w-8 bg-[#159B60]" />
              Find Our Location
            </span>

            <h2 className="max-w-xl text-3xl font-semibold leading-tight tracking-tight text-[#123D35] sm:text-4xl lg:text-5xl">
              Visit Our Fishery
            </h2>
          </div>

          <p className="max-w-lg text-base leading-7 text-[#718078] md:justify-self-end">
            Explore our fishery location and get directions to visit our
            operations. We welcome enquiries about our fish production,
            wholesale supply and lake activities.
          </p>
        </div>

        {/* Map and Information */}
        <div className="grid overflow-hidden rounded-2xl border border-[#E3EBE4] bg-white shadow-sm lg:grid-cols-[1.6fr_0.8fr]">

          {/* Google Map */}
          <div className="relative min-h-[350px] bg-[#E8F3ED] sm:min-h-[430px]">
            <iframe
              title="Fishery Location Map"
              src={mapEmbedUrl}
              width="100%"
              height="100%"
              style={{ border: 0, minHeight: '350px' }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0 h-full w-full"
            />
          </div>

          {/* Location Details */}
          <div className="flex flex-col justify-between p-7 sm:p-9 lg:p-10">

            <div>
              <div className="mb-7 flex h-14 w-14 items-center justify-center rounded-xl bg-[#E8F3ED] text-[#167D62]">
                <MapPin size={27} strokeWidth={1.7} />
              </div>

              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#159B60]">
                Our Location
              </span>

              <h3 className="mt-3 text-2xl font-semibold text-[#123D35]">
                Find Us on the Map
              </h3>

              <p className="mt-4 text-sm leading-7 text-[#718078]">
                Our fishery location is available on Google Maps. Use the
                map to explore the surrounding area and plan your visit.
              </p>

              <div className="mt-7 border-t border-[#E7EEE8] pt-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#8A988F]">
                  Map Coordinates
                </p>

                <p className="mt-2 text-sm font-medium text-[#263B31]">
                  {latitude}, {longitude}
                </p>
              </div>
            </div>

            {/* Directions Button */}
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-9 inline-flex w-full items-center justify-center gap-3 rounded-lg bg-[#123D35] px-6 py-4 text-sm font-semibold text-white transition-colors duration-300 hover:bg-[#167D62]"
            >
              <Navigation size={17} />
              Get Directions
              <ExternalLink size={15} />
            </a>

          </div>
        </div>
      </div>
    </section>
  )
}

export default LocationSection