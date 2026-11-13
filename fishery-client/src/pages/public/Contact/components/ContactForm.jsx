import { useState } from 'react'
import {
  Send,
  User,
  Mail,
  Phone,
  MessageSquare,
  CheckCircle2,
} from 'lucide-react'

function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  })

  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    setSubmitted(false)
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    // Frontend demonstration only.
    // Backend API integration will be added later.

    console.log('Contact Form Data:', formData)

    setSubmitted(true)

    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: '',
    })
  }

  const inputClass =
    'w-full border border-[#E0E9E1] bg-[#F9FBF9] px-4 py-3.5 text-sm text-[#123D35] outline-none transition-all placeholder:text-[#A0ADA3] focus:border-[#167D62] focus:bg-white'

  return (
    <section className="bg-[#F7F8F5] px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24">
      <div className="mx-auto max-w-[1440px]">

        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">

          {/* Left Information */}
          <div className="flex flex-col justify-between">

            <div>
              <div className="mb-5 flex items-center gap-3">
                <span className="h-px w-9 bg-[#167D62]" />

                <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[#167D62]">
                  Send Us a Message
                </span>
              </div>

              <h2 className="max-w-lg text-3xl font-semibold leading-tight tracking-tight text-[#123D35] sm:text-4xl lg:text-5xl">
                Tell Us What You{' '}
                <span className="text-[#167D62]">Need.</span>
              </h2>

              <p className="mt-6 max-w-md text-sm leading-8 text-[#64766C] sm:text-base">
                Have a question or business enquiry? Fill out the form
                and share a few details with us. Our team will be able
                to understand your requirements more clearly.
              </p>
            </div>

            {/* Supporting Note */}
            <div className="mt-10 border-l-2 border-[#167D62] bg-[#EAF3ED] p-6 sm:p-7">
              <MessageSquare size={24} className="text-[#167D62]" />

              <h3 className="mt-4 text-lg font-semibold text-[#123D35]">
                We're Here to Listen
              </h3>

              <p className="mt-2 text-sm leading-7 text-[#64766C]">
                From wholesale fish enquiries to general questions
                about our operations, feel free to send us a message.
              </p>
            </div>

          </div>

          {/* Contact Form */}
          <div className="border border-[#E5ECE6] bg-white p-6 shadow-sm shadow-[#123D35]/5 sm:p-9 lg:p-10">

            <div className="mb-8">
              <h3 className="text-2xl font-semibold text-[#123D35]">
                Send an Enquiry
              </h3>

              <p className="mt-2 text-sm text-[#748379]">
                Fields marked with * are required.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Name & Email */}
              <div className="grid gap-5 sm:grid-cols-2">

                <div>
                  <label
                    htmlFor="contact-name"
                    className="mb-2 block text-xs font-semibold text-[#263B31]"
                  >
                    Full Name *
                  </label>

                  <div className="relative">
                    <User
                      size={17}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A49A]"
                    />

                    <input
                      id="contact-name"
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter your name"
                      required
                      maxLength={100}
                      autoComplete="name"
                      className={`${inputClass} pl-11`}
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="contact-email"
                    className="mb-2 block text-xs font-semibold text-[#263B31]"
                  >
                    Email Address *
                  </label>

                  <div className="relative">
                    <Mail
                      size={17}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A49A]"
                    />

                    <input
                      id="contact-email"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      required
                      maxLength={150}
                      autoComplete="email"
                      className={`${inputClass} pl-11`}
                    />
                  </div>
                </div>

              </div>

              {/* Phone & Subject */}
              <div className="grid gap-5 sm:grid-cols-2">

                <div>
                  <label
                    htmlFor="contact-phone"
                    className="mb-2 block text-xs font-semibold text-[#263B31]"
                  >
                    Phone Number
                  </label>

                  <div className="relative">
                    <Phone
                      size={17}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A49A]"
                    />

                    <input
                      id="contact-phone"
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+880 1XXXXXXXXX"
                      maxLength={20}
                      autoComplete="tel"
                      className={`${inputClass} pl-11`}
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="contact-subject"
                    className="mb-2 block text-xs font-semibold text-[#263B31]"
                  >
                    Inquiry Type *
                  </label>

                  <select
                    id="contact-subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className={`${inputClass} appearance-none`}
                  >
                    <option value="">Select a topic</option>
                    <option value="Wholesale Fish Supply">
                      Wholesale Fish Supply
                    </option>
                    <option value="Fish Production">
                      Fish Production
                    </option>
                    <option value="Lake Activities">
                      Lake Activities
                    </option>
                    <option value="Business Partnership">
                      Business Partnership
                    </option>
                    <option value="General Enquiry">
                      General Enquiry
                    </option>
                    <option value="Other">Other</option>
                  </select>
                </div>

              </div>

              {/* Message */}
              <div>
                <label
                  htmlFor="contact-message"
                  className="mb-2 block text-xs font-semibold text-[#263B31]"
                >
                  Your Message *
                </label>

                <textarea
                  id="contact-message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Write your message here..."
                  required
                  minLength={10}
                  maxLength={2000}
                  rows={6}
                  className={`${inputClass} resize-y`}
                />
              </div>

              {/* Submit Button */}
              <div className="pt-1">

                <button
                  type="submit"
                  className="group inline-flex w-full items-center justify-center gap-3 bg-[#167D62] px-7 py-4 text-sm font-semibold text-white transition-all duration-300 hover:bg-[#123D35] sm:w-auto"
                >
                  Send Message

                  <Send
                    size={17}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                </button>

                {submitted && (
                  <div
                    role="status"
                    className="mt-5 flex items-start gap-3 border border-[#CDE8D5] bg-[#EDF7F0] p-4 text-sm text-[#167D62]"
                  >
                    <CheckCircle2 size={19} className="mt-0.5 shrink-0" />

                    <p>
                      Demo submission successful! Your form data has
                      been captured in the browser console. Backend
                      integration is required to actually send this enquiry.
                    </p>
                  </div>
                )}

              </div>

            </form>

          </div>

        </div>

      </div>
    </section>
  )
}

export default ContactForm