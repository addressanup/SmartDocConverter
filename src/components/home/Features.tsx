'use client'

import { Zap, Shield, Globe, Clock, ArrowUpRight } from 'lucide-react'

const features = [
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Convert documents in seconds with our optimized cloud infrastructure. No waiting, no queues.',
    gradient: 'from-amber-400 via-orange-500 to-red-500',
    bgGlow: 'from-amber-500/20 to-orange-500/10',
  },
  {
    icon: Shield,
    title: 'Secure by Design',
    description: 'Bank-level encryption protects your files. Auto-deleted within 1 hour of processing.',
    gradient: 'from-emerald-400 via-teal-500 to-cyan-500',
    bgGlow: 'from-emerald-500/20 to-teal-500/10',
  },
  {
    icon: Globe,
    title: 'Works Everywhere',
    description: 'Use on any device with a browser. No software to install, no plugins required.',
    gradient: 'from-blue-400 via-indigo-500 to-violet-500',
    bgGlow: 'from-blue-500/20 to-indigo-500/10',
  },
  {
    icon: Clock,
    title: 'No Registration',
    description: 'Start converting immediately. No sign-up walls or email verification needed.',
    gradient: 'from-violet-400 via-purple-500 to-pink-500',
    bgGlow: 'from-violet-500/20 to-purple-500/10',
  },
]

const stats = [
  { value: '50K+', label: 'Active users', suffix: '' },
  { value: '2M+', label: 'Files converted', suffix: '' },
  { value: '99.9', label: 'Uptime', suffix: '%' },
  { value: '<2', label: 'Avg. conversion', suffix: 's' },
]

export function Features() {
  return (
    <section className="py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-slate-50/80 to-white" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-100/40 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-purple-100/30 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-indigo-50 text-indigo-600 rounded-full mb-6 border border-indigo-100">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            Why SmartDoc
          </div>
          <h2 className="text-slate-900 mb-6">
            Built for professionals who value their{' '}
            <span className="relative inline-block">
              <span className="relative z-10 gradient-text">time and privacy</span>
              <span className="absolute -bottom-1 left-0 right-0 h-3 bg-indigo-200/50 blur-sm" />
            </span>
          </h2>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            Our platform is engineered for speed, security, and simplicity. No compromises.
          </p>
        </div>

        {/* Bento Grid Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-20">
          {features.map((feature, index) => {
            const Icon = feature.icon
            const isLarge = index < 2
            return (
              <div
                key={feature.title}
                className={`group relative bg-white rounded-3xl p-8 md:p-10 border border-slate-100 hover:border-transparent transition-all duration-500 overflow-hidden ${
                  isLarge ? 'md:col-span-1' : ''
                }`}
              >
                {/* Hover Glow Effect */}
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br ${feature.bgGlow} blur-3xl`} />
                
                {/* Content */}
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-6">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                      <ArrowUpRight className="w-5 h-5 text-slate-400" />
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors">
                    {feature.title}
                  </h3>
                  
                  <p className="text-base text-slate-500 leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                {/* Decorative Corner */}
                <div className={`absolute -bottom-12 -right-12 w-32 h-32 rounded-full bg-gradient-to-br ${feature.gradient} opacity-5 group-hover:opacity-10 transition-opacity`} />
              </div>
            )
          })}
        </div>

        {/* Stats Bar */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl opacity-90" />
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-3xl" />
          
          <div className="relative grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 p-8 md:p-12">
            {stats.map((stat, index) => (
              <div 
                key={stat.label} 
                className={`text-center ${index < 3 ? 'md:border-r md:border-white/20' : ''}`}
              >
                <div className="text-4xl md:text-5xl font-extrabold text-white mb-2 tracking-tight">
                  {stat.value}
                  <span className="text-white/80">{stat.suffix}</span>
                </div>
                <div className="text-sm md:text-base font-medium text-white/70">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
