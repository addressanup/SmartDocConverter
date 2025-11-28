import { Metadata } from "next"
import LoginForm from "@/components/auth/LoginForm"
import Link from "next/link"
import { FileText, Sparkles, Shield, Zap } from "lucide-react"

export const metadata: Metadata = {
  title: "Sign In | SmartDocConverter",
  description: "Sign in to your SmartDocConverter account",
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-indigo-50/30" />
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-indigo-100/40 rounded-full blur-[100px]" />
      <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-purple-100/30 rounded-full blur-[80px]" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-30" />

      {/* Left Side - Features (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-center px-16 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/20 rounded-full blur-[80px]" />
        
        <div className="relative z-10 max-w-md">
          <Link href="/" className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-xl">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold text-white">SmartDoc</span>
              <span className="block text-xs font-medium text-indigo-400 -mt-0.5">Converter</span>
            </div>
          </Link>

          <h1 className="text-4xl font-extrabold text-white mb-6 leading-tight">
            Convert documents with{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              blazing speed
            </span>
          </h1>
          
          <p className="text-lg text-slate-400 mb-12 leading-relaxed">
            Join thousands of professionals who trust SmartDoc for their document conversion needs.
          </p>

          <div className="space-y-6">
            {[
              { icon: Zap, text: 'Lightning-fast conversions', color: 'from-amber-400 to-orange-500' },
              { icon: Shield, text: 'Bank-level security', color: 'from-emerald-400 to-teal-500' },
              { icon: Sparkles, text: 'AI-powered accuracy', color: 'from-purple-400 to-pink-500' },
            ].map((feature) => (
              <div key={feature.text} className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-lg`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-lg font-medium text-white">{feature.text}</span>
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
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl blur-xl opacity-50" />
              <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-xl">
                <FileText className="h-8 w-8 text-white" />
              </div>
            </div>
          </Link>

          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-2">
              Welcome back
            </h2>
            <p className="text-slate-500">Sign in to continue converting</p>
          </div>

          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 rounded-[28px] blur-xl" />
            <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-white/60 shadow-2xl shadow-slate-900/5">
              <LoginForm />
            </div>
          </div>

          <div className="mt-8 text-center text-sm text-slate-500">
            <p>
              By signing in, you agree to our{" "}
              <Link href="/terms" className="font-medium text-indigo-600 hover:text-indigo-700 transition-colors">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="font-medium text-indigo-600 hover:text-indigo-700 transition-colors">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
