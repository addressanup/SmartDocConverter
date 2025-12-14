import { Metadata } from "next"
import RegisterForm from "@/components/auth/RegisterForm"
import Link from "next/link"
import { FileText, Sparkles, Check } from "lucide-react"

export const metadata: Metadata = {
  title: "Create Account | SmartDocConverter",
  description: "Create your SmartDocConverter account",
}

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-purple-50/30" />
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-100/40 rounded-full blur-[100px]" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-indigo-100/30 rounded-full blur-[80px]" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-30" />

      {/* Left Side - Features (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-center px-16 bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-900">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-indigo-500/20 rounded-full blur-[80px]" />
        
        <div className="relative z-10 max-w-md">
          <Link href="/" className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-xl">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold text-white">SmartDoc</span>
              <span className="block text-xs font-medium text-purple-400 -mt-0.5">Converter</span>
            </div>
          </Link>

          <h1 className="text-4xl font-extrabold text-white mb-6 leading-tight">
            Start converting{' '}
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-rose-400 bg-clip-text text-transparent">
              for free
            </span>
          </h1>
          
          <p className="text-lg text-slate-400 mb-12 leading-relaxed">
            Create your account and unlock powerful document conversion tools.
          </p>

          <div className="space-y-5">
            {[
              'Unlimited PDF conversions',
              'All file formats supported',
              'Priority processing speed',
              'Secure cloud storage',
              'No watermarks ever',
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400/20 to-teal-400/10 flex items-center justify-center ring-1 ring-emerald-400/30">
                  <Check className="w-4 h-4 text-emerald-400" />
                </div>
                <span className="text-base font-medium text-slate-300">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 relative flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <Link href="/" className="flex flex-col items-center mb-10 lg:hidden">
            <div className="relative mb-4">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl blur-xl opacity-50" />
              <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-xl">
                <FileText className="h-8 w-8 text-white" />
              </div>
            </div>
          </Link>

          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-gradient-to-r from-purple-50 to-pink-50 text-purple-600 rounded-full mb-6 border border-purple-100">
              <Sparkles className="w-4 h-4" />
              Free to start
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 mb-2">
              Create your account
            </h2>
            <p className="text-slate-500">Get started with SmartDoc in seconds</p>
          </div>

          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-rose-500/10 rounded-[28px] blur-xl" />
            <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-white/60 shadow-2xl shadow-slate-900/5">
              <RegisterForm />
            </div>
          </div>

          <div className="mt-8 text-center text-sm text-slate-500">
            <p>
              By creating an account, you agree to our{" "}
              <Link href="/terms" className="font-medium text-purple-600 hover:text-purple-700 transition-colors">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="font-medium text-purple-600 hover:text-purple-700 transition-colors">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
