'use client'

import Link from 'next/link'
import { ArrowRight, Shield, Zap, Clock, Lock, Sparkles, ArrowDown } from 'lucide-react'

const features = [
  { icon: Zap, text: 'Instant conversion', color: 'from-amber-400 to-orange-500' },
  { icon: Shield, text: 'Bank-level encryption', color: 'from-emerald-400 to-teal-500' },
  { icon: Clock, text: 'No sign-up needed', color: 'from-blue-400 to-indigo-500' },
  { icon: Lock, text: 'Files auto-delete', color: 'from-purple-400 to-pink-500' },
]

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      {/* Ambient Background */}
      <div className="absolute inset-0 ambient-bg" />
      
      {/* Animated Gradient Orbs */}
      <div className="absolute top-1/4 -right-32 w-[600px] h-[600px] bg-gradient-to-br from-indigo-200/60 via-purple-200/40 to-transparent rounded-full blur-3xl animate-float" />
      <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-gradient-to-tr from-cyan-200/50 via-blue-200/30 to-transparent rounded-full blur-3xl animate-float" style={{ animationDelay: '-3s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] opacity-30">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-300/30 via-transparent to-purple-300/20 rounded-full animate-morph" />
      </div>
      
      {/* Grid Pattern */}
      <div className="absolute inset-0 grid-pattern pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full py-16 lg:py-24">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Content - Asymmetric */}
          <div className="lg:col-span-7 lg:pr-8">
            {/* Premium Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 border border-indigo-100/60 rounded-full mb-8 shadow-sm animate-slide-up">
              <div className="flex items-center justify-center w-5 h-5 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500">
                <Sparkles className="w-3 h-3 text-white" />
              </div>
              <span>Trusted by 50,000+ professionals</span>
            </div>

            {/* Kinetic Headline */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <span className="block text-slate-900">Document conversion</span>
              <span className="block mt-2">
                <span className="relative inline-block">
                  <span className="relative z-10 text-gradient-shine">that just works.</span>
                  <span className="absolute -bottom-2 left-0 right-0 h-4 bg-gradient-to-r from-indigo-200/60 via-purple-200/60 to-pink-200/60 blur-xl" />
                </span>
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg md:text-xl text-slate-500 leading-relaxed max-w-xl mb-10 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              Transform PDFs, Word docs, images, and spreadsheets in seconds. 
              No software to install. No account required.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-14 animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <Link
                href="#tools"
                className="group relative inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-[length:200%_100%] text-white text-base font-semibold rounded-2xl shadow-lg hover:shadow-2xl hover:shadow-indigo-500/25 transition-all duration-500 hover:bg-[100%_0] overflow-hidden"
              >
                <span className="relative z-10">Start Converting</span>
                <ArrowRight className="relative z-10 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              </Link>
              
              <Link
                href="/pricing"
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 text-slate-700 text-base font-semibold rounded-2xl border-2 border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/50 transition-all duration-300"
              >
                See Pricing
                <span className="w-6 h-6 rounded-full bg-slate-100 group-hover:bg-indigo-100 flex items-center justify-center transition-colors">
                  <ArrowRight className="w-3 h-3 text-slate-500 group-hover:text-indigo-600 transition-colors" />
                </span>
              </Link>
            </div>

            {/* Trust Features */}
            <div className="flex flex-wrap gap-x-6 gap-y-4 animate-slide-up" style={{ animationDelay: '0.4s' }}>
              {features.map((feature, index) => (
                <div 
                  key={feature.text} 
                  className="group flex items-center gap-3 text-slate-600 hover:text-slate-900 transition-colors cursor-default"
                >
                  <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300`}>
                    <feature.icon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Visual - Floating Cards */}
          <div className="lg:col-span-5 relative">
            <div className="relative w-full max-w-md mx-auto lg:ml-auto">
              {/* Background Glow */}
              <div className="absolute -inset-4 bg-gradient-to-br from-indigo-500/20 via-purple-500/10 to-pink-500/20 rounded-3xl blur-2xl animate-pulse-glow" />
              
              {/* Stacked Cards Effect */}
              <div className="absolute -top-4 -left-4 w-full h-full bg-gradient-to-br from-purple-100 to-purple-50 rounded-3xl -rotate-6 shadow-lg" />
              <div className="absolute -bottom-4 -right-4 w-full h-full bg-gradient-to-br from-indigo-100 to-blue-50 rounded-3xl rotate-6 shadow-lg" />
              
              {/* Main Card */}
              <div className="relative glass rounded-3xl p-8 shadow-2xl border border-white/40 animate-slide-in-right">
                {/* Card Header */}
                <div className="flex items-center gap-4 mb-8">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl blur-lg opacity-50" />
                    <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-xl">
                      <Zap className="w-7 h-7 text-white" />
                    </div>
                  </div>
                  <div>
                    <div className="text-base font-semibold text-slate-900">Ready to convert</div>
                    <div className="text-sm text-slate-500">Drop your files below</div>
                  </div>
                </div>
                
                {/* Drop Zone */}
                <div className="relative rounded-2xl border-2 border-dashed border-indigo-200 bg-gradient-to-br from-indigo-50/50 to-purple-50/30 p-8 flex flex-col items-center justify-center hover:border-indigo-400 hover:bg-indigo-50/70 transition-all duration-300 cursor-pointer group">
                  <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300 mb-4">
                    <ArrowDown className="w-6 h-6 text-indigo-500 animate-bounce-subtle" />
                  </div>
                  <p className="text-sm font-medium text-slate-700">Drop files here</p>
                  <p className="text-xs text-slate-400 mt-1">PDF, DOCX, JPG, PNG</p>
                </div>

                {/* Progress Indicator */}
                <div className="mt-6 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700">Processing...</span>
                    <span className="font-semibold text-indigo-600">67%</span>
                  </div>
                  <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full w-2/3 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" style={{ animationDuration: '1.5s' }} />
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="mt-6 pt-6 border-t border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                      <Shield className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-700">document.pdf</p>
                      <p className="text-xs text-emerald-500 font-medium">Converted successfully</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-8 -right-8 w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg animate-float rotate-12">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -bottom-6 -left-6 w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center shadow-lg animate-float -rotate-12" style={{ animationDelay: '-2s' }}>
                <Shield className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden lg:flex flex-col items-center gap-2 animate-fade-in" style={{ animationDelay: '1s' }}>
          <span className="text-xs font-medium text-slate-400 uppercase tracking-widest">Scroll to explore</span>
          <div className="w-6 h-10 rounded-full border-2 border-slate-300 flex items-start justify-center p-1.5">
            <div className="w-1.5 h-3 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full animate-bounce" />
          </div>
        </div>
      </div>
    </section>
  )
}
