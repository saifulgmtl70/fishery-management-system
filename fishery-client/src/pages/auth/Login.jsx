
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { Fish, Mail, LockKeyhole, Eye, EyeOff, ArrowRight, ShieldCheck} from 'lucide-react'

import { useAuth } from '../../context/AuthContext'

function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    setIsLoading(true)

    try {
      const response = await login({ email, password})

      if (response.success && response.user.role === 'admin') {
        toast.success('Welcome back, Admin.')
        navigate('/dashboard', { replace: true })
      } 
      else {
        toast.error('Only admin accessible')
      }
    } 
    catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Unable to connect to the server. Please try again.'

      toast.error(errorMessage)
    } 
    finally {
      setIsLoading(false)
    }
  }

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
            <h2 className="text-xl font-bold tracking-wide text-white"> FISHERY </h2>
            <p className="text-xs tracking-widest text-white/60"> MANAGEMENT SYSTEM </p>
          </div>
        </Link>

        <div className="relative z-10 max-w-lg">
          <span className="text-sm font-semibold uppercase tracking-[0.2em] text-[#9BD9B3]"> Administrator Access </span>

          <h1 className="mt-5 text-4xl font-semibold leading-tight text-white xl:text-5xl">
            Managing Fishery Operations, <span className="block text-[#9BD9B3]"> Made Simpler. </span>
          </h1>

          <p className="mt-6 max-w-md text-base leading-8 text-white/65"> Access your fishery management workspace to monitor production, manage operations, track sales and stay connected with your business activities.</p>

          <div className="mt-10 flex items-center gap-3 border-t border-white/15 pt-7">
            <ShieldCheck size={22} className="text-[#9BD9B3]" />
            <p className="text-sm text-white/70">Secure administrative access to your fishery business.</p>
          </div>
        </div>

        <p className="relative z-10 text-xs text-white/40"> © {new Date().getFullYear()} Fishery Management System. All rights reserved. </p>
      </section> */}

      {/* Right Side */}
      <section className="flex w-full items-center justify-center px-5 py-12 sm:px-10  lg:px-16">
        <div className="w-full max-w-md">
          <Link to="/" className="mb-10 flex items-center gap-3 lg:hidden">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#123D35] text-[#9BD9B3]">
              <Fish size={24} />
            </div>

            <div>
              <h2 className="text-lg font-bold text-[#123D35]"> FISHERY </h2>
              <p className="text-[10px] tracking-widest text-[#718078]"> MANAGEMENT SYSTEM </p>
            </div>
          </Link>

          <div className="mb-9">
            <span className="text-sm font-semibold uppercase tracking-[0.16em] text-[#159B60]"> Admin Portal Login </span>

            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#123D35] sm:text-4xl"> Welcome Back </h2>

            <p className="mt-3 text-sm leading-6 text-[#718078]">
              Sign in your admin dashboard to access the
              fishery management system.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-semibold text-[#263B31]" > Email Address </label>

              <div className="relative">
                <Mail size={19} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8A988F]" />

                <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email address" required disabled={isLoading} autoComplete="username"
                className="w-full rounded-lg border border-[#E1E9E2] bg-white py-4 pl-12 pr-4 text-sm text-[#263B31] outline-none transition focus:border-[#159B60] focus:ring-4 focus:ring-[#159B60]/10 disabled:opacity-60" />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-semibold text-[#263B31]" > Password </label>

                <Link to="/forgot-password" className="text-xs font-semibold text-[#159B60] hover:text-[#123D35]" >
                  Forgot Password?
                </Link>
              </div>

              <div className="relative">
                <LockKeyhole size={19} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8A988F]" />

                <input id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" required disabled={isLoading} autoComplete="current-password"
                className="w-full rounded-lg border border-[#E1E9E2] bg-white py-4 pl-12 pr-12 text-sm text-[#263B31] outline-none transition focus:border-[#159B60] focus:ring-4 focus:ring-[#159B60]/10 disabled:opacity-60" />

                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8A988F] hover:text-[#123D35]" aria-label="Toggle password visibility" >
                  {showPassword ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button type="submit" disabled={isLoading} className="flex w-full items-center justify-center gap-3 rounded-lg bg-[#123D35] px-6 py-4 text-sm font-semibold text-white transition hover:bg-[#167D62] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? 'Signing In...' : 'Sign In'}

              {!isLoading && <ArrowRight size={18} />}
            </button>
          </form>

          <div className="mt-8 border-t border-[#E5ECE6] pt-7">
            <p className="text-center text-xs leading-6 text-[#718078]"> <ShieldCheck size={15} className="mr-1 inline text-[#159B60]" />
              Authorized administrators only.
            </p>
          </div>

          <Link
            to="/"
            className="mt-8 block text-center text-sm font-medium text-[#718078] hover:text-[#159B60]"
          >
            ← Back to Website
          </Link>
        </div>
      </section>
    </main>
  )
}

export default Login
