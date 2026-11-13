
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Fish, Mail, ArrowLeft, ArrowRight, ShieldCheck, CheckCircle2, LockKeyhole, KeyRound, LoaderCircle, RefreshCw } from 'lucide-react'

import api from '../../services/api'

function ForgotPassword() {
  const navigate = useNavigate()

  // ==========================================
  // FORM STATES
  // ==========================================

  const [step, setStep] = useState(1)

  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [resetToken, setResetToken] = useState('')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // ==========================================
  // SEND OTP
  // ==========================================

  const handleSendOTP = async (e) => {
    e.preventDefault()

    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const response = await api.post( '/password-reset/send-otp', { email: email.trim().toLowerCase(),
      })

      setSuccess(response.data.message)
      setStep(2)
    } 
    catch (error) {
      setError(
        error.response?.data?.message ||
        'Unable to send OTP. Please try again.'
      )
    } 
    finally {
      setLoading(false)
    }
  }

  // ==========================================
  // VERIFY OTP
  // ==========================================

  const handleVerifyOTP = async (e) => {
    e.preventDefault()

    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const response = await api.post( '/password-reset/verify-otp', { email: email.trim().toLowerCase(), 
        otp 
      })

      setResetToken(response.data.resetToken)

      setSuccess('OTP verified.')
      setStep(3)
    } 
    catch (error) {
      setError(
        error.response?.data?.message ||
        'OTP verification failed'
      )
    } 
    finally {
      setLoading(false)
    }
  }

  // ==========================================
  // RESET PASSWORD
  // ==========================================

  const handleResetPassword = async (e) => {
    e.preventDefault()

    setError('')
    setSuccess('')

    if (password.length < 6) {
      setError('Password length should must be 6 or more characters long.')
      return
    }

    if (new TextEncoder().encode(password).length > 72) {
      setError('Password must not exceed 72 bytes.')
      return
    }

    if (password !== confirmPassword) {
      setError("Password and Confirm Password didn't match.")
      return
    }

    setLoading(true)

    try {
      const response = await api.post( '/password-reset/reset-password', {
          email: email.trim().toLowerCase(), resetToken, password, confirmPassword,
      })

      setSuccess(response.data.message)
      setPassword('')
      setConfirmPassword('')
      setOtp('')
      setResetToken('')

      setStep(4)
    } 
    catch (error) {
      setError(
        error.response?.data?.message ||
        'Unable to reset password. Try again'
      )
    } 
    finally {
      setLoading(false)
    }
  }

  // ==========================================
  // RESEND OTP
  // ==========================================

  const handleResendOTP = async () => {
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const response = await api.post( '/password-reset/send-otp', {
          email: email.trim().toLowerCase(),
      })

      setOtp('')
      setResetToken('')
      setSuccess(response.data.message)
    } 
    catch (error) {
      setError(
        error.response?.data?.message ||
        'Unable to resend OTP, try again.'
      )
    } 
    finally {
      setLoading(false)
    }
  }

  // ==========================================
  // MESSAGE COMPONENT
  // ==========================================

  const Message = () => {
    if (error) {
      return (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )
    }

    if (success) {
      return (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {success}
        </div>
      )
    }

    return null
  }

  // ==========================================
  // SHARED BUTTON
  // ==========================================

  const SubmitButton = ({ children }) => (
    <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-3 rounded-lg bg-[#123D35] px-6 py-4 text-sm font-semibold text-white transition hover:bg-[#167D62] disabled:cursor-not-allowed disabled:opacity-60" >
      {loading ? (
        <div>
          <LoaderCircle size={18} className="animate-spin" />
          Please wait...
        </div>
      ) : (
        children
      )}
    </button>
  )

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <main className="flex min-h-screen bg-[#F7F8F5]">

      {/* Left Side */}

{ /* 
      <section className="relative hidden w-1/2 overflow-hidden bg-[#123D35] p-14 lg:flex lg:flex-col lg:justify-between">

        <div className="pointer-events-none absolute -right-32 top-20 h-96 w-96 rounded-full border border-white/10" />

        <div className="pointer-events-none absolute -right-16 top-36 h-64 w-64 rounded-full border border-white/10" />

        <div className="pointer-events-none absolute -bottom-40 -left-24 h-96 w-96 rounded-full border border-white/10" />

        <Link to="/" className="relative z-10 flex items-center gap-3">

          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#9BD9B3] text-[#123D35]">
            <Fish size={27} />
          </div>

          <div>
            <h2 className="text-xl font-bold tracking-wide text-white">
              FISHERY
            </h2>

            <p className="text-xs tracking-widest text-white/60">
              MANAGEMENT SYSTEM
            </p>
          </div>

        </Link>

        <div className="relative z-10 max-w-lg">

          <span className="text-sm font-semibold uppercase tracking-[0.2em] text-[#9BD9B3]">
            Account Recovery
          </span>

          <h1 className="mt-5 text-4xl font-semibold leading-tight text-white xl:text-5xl">
            A Simple Way to
            <span className="block text-[#9BD9B3]">
              Regain Access.
            </span>
          </h1>

          <p className="mt-6 max-w-md text-base leading-8 text-white/65">
            Securely recover your administrator account
            through email verification and password reset.
          </p>

          <div className="mt-10 flex items-center gap-3 border-t border-white/15 pt-7">

            <ShieldCheck size={22} className="text-[#9BD9B3]" />

            <p className="text-sm text-white/70">
              Your account security matters to us.
            </p>

          </div>

        </div>

        <p className="relative z-10 text-xs text-white/40">
          © {new Date().getFullYear()} Fishery Management System.
          All rights reserved.
        </p>

      </section> */}

      {/* Right Side */}

      <section className="flex w-full items-center justify-center px-5 py-12 sm:px-10  lg:px-16">

        <div className="w-full max-w-md">

          {/* Mobile Logo */}

          <Link to="/" className="mb-10 flex items-center gap-3 lg:hidden">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#123D35] text-[#9BD9B3]">
              <Fish size={24} />
            </div>

            <div>
              <h2 className="text-lg font-bold text-[#123D35]">
                FISHERY
              </h2>

              <p className="text-[10px] tracking-widest text-[#718078]">
                MANAGEMENT SYSTEM
              </p>
            </div>

          </Link>

          {/* ======================================
              STEP 1: ENTER EMAIL
          ====================================== */}

          {step === 1 && (
            <>

              <Link
                to="/login"
                className="mb-9 inline-flex items-center gap-2 text-sm font-medium text-[#718078] transition hover:text-[#159B60]"
              >
                <ArrowLeft size={17} />
                Back to Login
              </Link>

              <div className="mb-9">

                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-[#E8F3ED] text-[#167D62]">
                  <Mail size={26} />
                </div>

                <span className="text-sm font-semibold uppercase tracking-[0.16em] text-[#159B60]">
                  Step 01 / 03
                </span>

                <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#123D35] sm:text-4xl">
                  Forgot Password?
                </h2>

                <p className="mt-4 text-sm leading-7 text-[#718078]">
                  Enter your registered administrator email.
                  We will send you a 6-digit verification code.
                </p>

              </div>

              <form onSubmit={handleSendOTP} className="space-y-6">

                <div>

                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-semibold text-[#263B31]"
                  >
                    Email Address
                  </label>

                  <div className="relative">

                    <Mail
                      size={19}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8A988F]"
                    />

                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your registered email"
                      required
                      autoComplete="email"
                      disabled={loading}
                      className="w-full rounded-lg border border-[#E1E9E2] bg-white py-4 pl-12 pr-4 text-sm text-[#263B31] outline-none transition focus:border-[#159B60] focus:ring-4 focus:ring-[#159B60]/10"
                    />

                  </div>

                </div>

                <Message />

                <SubmitButton>
                  Send Verification Code
                  <ArrowRight size={18} />
                </SubmitButton>

              </form>

            </>
          )}

          {/* ======================================
              STEP 2: VERIFY OTP
          ====================================== */}

          {step === 2 && (
            <>

              <button
                type="button"
                onClick={() => {
                  setStep(1)
                  setError('')
                  setSuccess('')
                }}
                className="mb-9 inline-flex items-center gap-2 text-sm font-medium text-[#718078] transition hover:text-[#159B60]"
              >
                <ArrowLeft size={17} />
                Change Email
              </button>

              <div className="mb-9">

                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-[#E8F3ED] text-[#167D62]">
                  <KeyRound size={26} />
                </div>

                <span className="text-sm font-semibold uppercase tracking-[0.16em] text-[#159B60]">
                  Step 02 / 03
                </span>

                <h2 className="mt-3 text-3xl font-semibold text-[#123D35]">
                  Verify OTP
                </h2>

                <p className="mt-4 text-sm leading-7 text-[#718078]">
                  We sent a 6-digit verification code to:
                </p>

                <p className="mt-2 break-all font-semibold text-[#123D35]">
                  {email}
                </p>

              </div>

              <form onSubmit={handleVerifyOTP} className="space-y-6">

                <div>

                  <label
                    htmlFor="otp"
                    className="mb-2 block text-sm font-semibold text-[#263B31]"
                  >
                    6-Digit Verification Code
                  </label>

                  <input
                    id="otp"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    pattern="[0-9]{6}"
                    value={otp}
                    onChange={(e) =>
                      setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))
                    }
                    placeholder="000000"
                    required
                    autoComplete="one-time-code"
                    disabled={loading}
                    className="w-full rounded-lg border border-[#E1E9E2] bg-white px-4 py-5 text-center text-2xl font-bold tracking-[0.5em] text-[#123D35] outline-none transition focus:border-[#159B60] focus:ring-4 focus:ring-[#159B60]/10"
                  />

                  <p className="mt-2 text-xs text-[#8A988F]">
                    OTP is valid for 5 minutes.
                  </p>

                </div>

                <Message />

                <SubmitButton>
                  Verify OTP
                  <ArrowRight size={18} />
                </SubmitButton>

              </form>

              <button
                type="button"
                onClick={handleResendOTP}
                disabled={loading}
                className="mt-6 flex w-full items-center justify-center gap-2 text-sm font-semibold text-[#167D62] transition hover:text-[#123D35] disabled:opacity-50"
              >
                <RefreshCw size={16} />
                Resend Verification Code
              </button>

            </>
          )}

          {/* ======================================
              STEP 3: SET NEW PASSWORD
          ====================================== */}

          {step === 3 && (
            <>

              <div className="mb-9">

                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-[#E8F3ED] text-[#167D62]">
                  <LockKeyhole size={26} />
                </div>

                <span className="text-sm font-semibold uppercase tracking-[0.16em] text-[#159B60]">
                  Step 03 / 03
                </span>

                <h2 className="mt-3 text-3xl font-semibold text-[#123D35]">
                  Set New Password
                </h2>

                <p className="mt-4 text-sm leading-7 text-[#718078]">
                  OTP verified successfully. Create a new password
                  for your administrator account.
                </p>

              </div>

              <form onSubmit={handleResetPassword} className="space-y-5">

                <div>

                  <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-semibold text-[#263B31]"
                  >
                    New Password
                  </label>

                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter new password"
                    required
                    minLength={8}
                    autoComplete="new-password"
                    disabled={loading}
                    className="w-full rounded-lg border border-[#E1E9E2] bg-white px-4 py-4 text-sm text-[#263B31] outline-none transition focus:border-[#159B60] focus:ring-4 focus:ring-[#159B60]/10"
                  />

                </div>

                <div>

                  <label
                    htmlFor="confirmPassword"
                    className="mb-2 block text-sm font-semibold text-[#263B31]"
                  >
                    Confirm New Password
                  </label>

                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    required
                    minLength={8}
                    autoComplete="new-password"
                    disabled={loading}
                    className="w-full rounded-lg border border-[#E1E9E2] bg-white px-4 py-4 text-sm text-[#263B31] outline-none transition focus:border-[#159B60] focus:ring-4 focus:ring-[#159B60]/10"
                  />

                </div>

                <p className="text-xs leading-5 text-[#8A988F]">
                  Password must contain at least 8 characters
                  and must not exceed 72 bytes.
                </p>

                <Message />

                <SubmitButton>
                  Reset Password
                  <ShieldCheck size={18} />
                </SubmitButton>

              </form>

            </>
          )}

          {/* ======================================
              STEP 4: SUCCESS
          ====================================== */}

          {step === 4 && (
            <div className="text-center">

              <div className="mx-auto mb-7 flex h-16 w-16 items-center justify-center rounded-full bg-[#E8F3ED] text-[#167D62]">
                <CheckCircle2 size={34} />
              </div>

              <span className="text-sm font-semibold uppercase tracking-[0.16em] text-[#159B60]">
                Password Updated
              </span>

              <h2 className="mt-3 text-3xl font-semibold text-[#123D35]">
                All Done!
              </h2>

              <p className="mt-4 text-sm leading-7 text-[#718078]">
                Your administrator password has been changed
                successfully. You can now log in using your new password.
              </p>

              <div className="mt-8 rounded-lg border border-[#DCEBE1] bg-[#E8F3ED] px-4 py-4 text-sm text-[#167D62]">
                <CheckCircle2 size={19} className="mx-auto mb-2" />
                Password reset completed successfully.
              </div>

              <button
                type="button"
                onClick={() => navigate('/login')}
                className="mt-8 flex w-full items-center justify-center gap-3 rounded-lg bg-[#123D35] px-6 py-4 text-sm font-semibold text-white transition hover:bg-[#167D62]"
              >
                <ArrowLeft size={17} />
                Back to Login
              </button>

            </div>
          )}

          {/* Footer */}

          <Link
            to="/"
            className="mt-10 block text-center text-sm font-medium text-[#718078] transition hover:text-[#159B60]"
          >
            ← Back to Website
          </Link>

        </div>

      </section>

    </main>
  )
}

export default ForgotPassword
