'use client'

import Link from 'next/link'
import { Check, Zap, Sparkles, Crown } from 'lucide-react'
import { cn } from '@/lib/utils'

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Perfect for occasional use',
    icon: Zap,
    features: [
      '5 conversions per day',
      '10MB max file size',
      'All basic tools',
      'Standard processing',
    ],
    cta: 'Get Started',
    ctaLink: '/#tools',
    highlighted: false,
    gradient: 'from-slate-500 to-slate-600',
  },
  {
    name: 'Pro',
    price: '$4.99',
    period: '/month',
    description: 'For power users and teams',
    icon: Crown,
    features: [
      'Unlimited conversions',
      '50MB max file size',
      'All tools unlocked',
      'Priority processing',
      'No advertisements',
      'Batch processing',
      'Email support',
    ],
    cta: 'Start Free Trial',
    ctaLink: '/pricing',
    highlighted: true,
    gradient: 'from-indigo-500 via-purple-500 to-pink-500',
  },
]

export function Pricing() {
  return (
    <section className="py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-white to-slate-50" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-gradient-radial from-indigo-100/40 via-purple-100/20 to-transparent rounded-full blur-3xl" />

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-600 rounded-full mb-6 border border-indigo-100">
            <Sparkles className="w-4 h-4" />
            Simple Pricing
          </div>
          <h2 className="text-slate-900 mb-6">
            Transparent pricing,{' '}
            <span className="gradient-text">no hidden fees</span>
          </h2>
          <p className="text-lg text-slate-500">
            Start free, upgrade when you need more power. Cancel anytime.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan) => {
            const Icon = plan.icon
            return (
              <div
                key={plan.name}
                className={cn(
                  "relative rounded-3xl p-8 md:p-10 transition-all duration-500 overflow-hidden",
                  plan.highlighted
                    ? "bg-slate-900 text-white shadow-2xl shadow-slate-900/20 scale-[1.02]"
                    : "bg-white border-2 border-slate-100 hover:border-indigo-100 hover:shadow-xl"
                )}
              >
                {/* Background Effects for Pro */}
                {plan.highlighted && (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 via-transparent to-purple-600/20" />
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-purple-500/30 to-transparent rounded-full blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-indigo-500/20 to-transparent rounded-full blur-2xl" />
                  </>
                )}

                {/* Popular Badge */}
                {plan.highlighted && (
                  <div className="absolute -top-px left-1/2 -translate-x-1/2">
                    <div className="px-4 py-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white text-xs font-bold uppercase tracking-wider rounded-b-xl shadow-lg flex items-center gap-1.5">
                      <Crown className="w-3.5 h-3.5" />
                      Most Popular
                    </div>
                  </div>
                )}

                <div className="relative z-10">
                  {/* Plan Header */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className={cn(
                      "w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg",
                      plan.highlighted 
                        ? "bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500" 
                        : "bg-gradient-to-br from-slate-100 to-slate-200"
                    )}>
                      <Icon className={cn(
                        "w-7 h-7",
                        plan.highlighted ? "text-white" : "text-slate-600"
                      )} />
                    </div>
                    <div>
                      <h3 className={cn(
                        "text-2xl font-bold",
                        plan.highlighted ? "text-white" : "text-slate-900"
                      )}>
                        {plan.name}
                      </h3>
                      <p className={cn(
                        "text-sm",
                        plan.highlighted ? "text-slate-400" : "text-slate-500"
                      )}>
                        {plan.description}
                      </p>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mb-8">
                    <div className="flex items-baseline gap-2">
                      <span className={cn(
                        "text-5xl font-extrabold tracking-tight",
                        plan.highlighted ? "text-white" : "text-slate-900"
                      )}>
                        {plan.price}
                      </span>
                      <span className={cn(
                        "text-lg font-medium",
                        plan.highlighted ? "text-slate-400" : "text-slate-500"
                      )}>
                        {plan.period}
                      </span>
                    </div>
                  </div>

                  {/* Features */}
                  <ul className="space-y-4 mb-10">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <div className={cn(
                          "w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                          plan.highlighted 
                            ? "bg-gradient-to-br from-indigo-500/30 to-purple-500/30 ring-1 ring-white/20" 
                            : "bg-indigo-50"
                        )}>
                          <Check className={cn(
                            "w-3.5 h-3.5",
                            plan.highlighted ? "text-white" : "text-indigo-600"
                          )} />
                        </div>
                        <span className={cn(
                          "text-base",
                          plan.highlighted ? "text-slate-300" : "text-slate-600"
                        )}>
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <Link
                    href={plan.ctaLink}
                    className={cn(
                      "group relative block w-full text-center py-4 rounded-2xl text-base font-semibold transition-all duration-300 overflow-hidden",
                      plan.highlighted
                        ? "bg-white text-slate-900 hover:shadow-xl hover:shadow-white/20"
                        : "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white hover:shadow-xl hover:shadow-indigo-500/25"
                    )}
                  >
                    <span className="relative z-10">{plan.cta}</span>
                    {!plan.highlighted && (
                      <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </Link>
                </div>
              </div>
            )
          })}
        </div>

        {/* Annual Billing Note */}
        <div className="text-center mt-12">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-full">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-sm font-medium text-emerald-700">
              Save 33% with annual billing at $39.99/year
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
