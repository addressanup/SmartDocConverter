'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Check, X, Zap, Shield, Clock, Star, Crown, Sparkles, ArrowRight, HelpCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { CheckoutButton } from '@/components/pricing/CheckoutButton'
import { cn } from '@/lib/utils'

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Perfect for occasional document conversions',
    features: [
      { text: '5 conversions per day', included: true },
      { text: 'Max file size: 10MB', included: true },
      { text: 'Basic PDF tools', included: true },
      { text: 'Standard processing speed', included: true },
      { text: 'Ads displayed', included: true },
      { text: 'Priority processing', included: false },
      { text: 'Batch processing', included: false },
      { text: 'Email support', included: false },
    ],
    cta: 'Get Started Free',
    ctaLink: '/#tools',
    highlighted: false,
    planType: null,
    gradient: 'from-slate-500 to-slate-600',
  },
  {
    name: 'Premium',
    price: '$4.99',
    period: 'per month',
    description: 'For power users and professionals',
    features: [
      { text: 'Unlimited conversions', included: true },
      { text: 'Max file size: 50MB', included: true },
      { text: 'All PDF & image tools', included: true },
      { text: 'Priority processing speed', included: true },
      { text: 'No advertisements', included: true },
      { text: 'Priority processing', included: true },
      { text: 'Batch processing', included: true },
      { text: 'Email support', included: true },
    ],
    cta: 'Start 7-Day Free Trial',
    ctaLink: '/register?plan=monthly',
    highlighted: true,
    badge: 'Most Popular',
    planType: 'monthly' as const,
    gradient: 'from-indigo-500 via-purple-500 to-pink-500',
  },
  {
    name: 'Annual',
    price: '$39.99',
    period: 'per year',
    description: 'Best value - save 33%',
    features: [
      { text: 'Everything in Premium', included: true },
      { text: 'Max file size: 100MB', included: true },
      { text: 'API access', included: true },
      { text: 'Fastest processing', included: true },
      { text: 'No advertisements', included: true },
      { text: 'Priority support', included: true },
      { text: 'Team features (coming soon)', included: true },
      { text: 'Custom integrations', included: true },
    ],
    cta: 'Start 7-Day Free Trial',
    ctaLink: '/register?plan=annual',
    highlighted: false,
    badge: 'Best Value',
    planType: 'annual' as const,
    gradient: 'from-emerald-500 to-teal-600',
  },
]

const faqs = [
  {
    question: 'Can I cancel my subscription anytime?',
    answer: 'Yes, you can cancel your subscription at any time. Your premium features will remain active until the end of your billing period.',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards (Visa, MasterCard, American Express) and PayPal. All payments are securely processed through Stripe.',
  },
  {
    question: 'Is there a free trial?',
    answer: 'Yes! Premium plans come with a 7-day free trial. No credit card required to start.',
  },
  {
    question: 'What happens to my files?',
    answer: 'All uploaded files are automatically deleted after 1 hour for your privacy and security. We never store or share your documents.',
  },
  {
    question: 'Can I upgrade or downgrade my plan?',
    answer: 'Absolutely! You can upgrade or downgrade your plan at any time. Changes take effect immediately and we\'ll prorate any charges.',
  },
]

function CancelAlert() {
  const searchParams = useSearchParams()
  const [showCancelAlert, setShowCancelAlert] = useState(
    searchParams.get('checkout') === 'canceled'
  )

  if (!showCancelAlert) return null

  return (
    <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-5 animate-slide-down">
      <div className="flex items-center justify-between gap-4">
        <p className="text-blue-700 font-medium">
          No worries! You can upgrade anytime when you're ready.
        </p>
        <button
          onClick={() => setShowCancelAlert(false)}
          className="flex-shrink-0 text-blue-400 hover:text-blue-600 transition-colors"
          aria-label="Dismiss"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}

export default function PricingPage() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-indigo-50/30" />
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-indigo-100/40 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-purple-100/30 rounded-full blur-[100px]" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-30" />
      </div>

      <div className="relative z-10 pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-6">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-600 rounded-full mb-6 border border-indigo-100">
              <Star className="w-4 h-4" />
              Simple Pricing
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">
              Choose the plan that{' '}
              <span className="gradient-text">fits your needs</span>
            </h1>
            <p className="text-xl text-slate-500">
              Start for free, upgrade when you need more power.
            </p>
          </div>

          {/* Checkout Canceled Alert */}
          <Suspense fallback={null}>
            <CancelAlert />
          </Suspense>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={cn(
                  "relative rounded-3xl p-8 transition-all duration-500",
                  plan.highlighted
                    ? "bg-slate-900 text-white shadow-2xl shadow-slate-900/20 scale-[1.02] ring-4 ring-indigo-500/20"
                    : "bg-white border-2 border-slate-100 hover:border-indigo-100 hover:shadow-xl"
                )}
              >
                {/* Background for highlighted */}
                {plan.highlighted && (
                  <>
                    <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-indigo-600/20 via-transparent to-purple-600/20" />
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-purple-500/20 to-transparent rounded-full blur-3xl" />
                  </>
                )}

                {/* Badge */}
                {plan.badge && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <div className={cn(
                      "px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg flex items-center gap-1.5",
                      plan.highlighted 
                        ? "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white"
                        : "bg-gradient-to-r from-emerald-500 to-teal-600 text-white"
                    )}>
                      <Crown className="w-3.5 h-3.5" />
                      {plan.badge}
                    </div>
                  </div>
                )}

                <div className="relative z-10">
                  <h3 className={cn(
                    "text-2xl font-bold mb-2",
                    plan.highlighted ? "text-white" : "text-slate-900"
                  )}>
                    {plan.name}
                  </h3>
                  <p className={cn(
                    "text-sm mb-6 h-10",
                    plan.highlighted ? "text-slate-400" : "text-slate-500"
                  )}>
                    {plan.description}
                  </p>

                  <div className="mb-8 pb-8 border-b border-white/10">
                    <span className={cn(
                      "text-5xl font-extrabold tracking-tight",
                      plan.highlighted ? "text-white" : "text-slate-900"
                    )}>
                      {plan.price}
                    </span>
                    <span className={cn(
                      "font-medium ml-2",
                      plan.highlighted ? "text-slate-400" : "text-slate-500"
                    )}>
                      / {plan.period}
                    </span>
                  </div>

                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        {feature.included ? (
                          <div className={cn(
                            "mt-0.5 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0",
                            plan.highlighted ? "bg-indigo-500/30" : "bg-emerald-50"
                          )}>
                            <Check className={cn(
                              "h-3 w-3",
                              plan.highlighted ? "text-indigo-300" : "text-emerald-600"
                            )} />
                          </div>
                        ) : (
                          <div className={cn(
                            "mt-0.5 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0",
                            plan.highlighted ? "bg-white/5" : "bg-slate-100"
                          )}>
                            <X className={cn(
                              "h-3 w-3",
                              plan.highlighted ? "text-slate-600" : "text-slate-400"
                            )} />
                          </div>
                        )}
                        <span className={cn(
                          "text-sm",
                          feature.included 
                            ? plan.highlighted ? "text-slate-300" : "text-slate-600"
                            : plan.highlighted ? "text-slate-600 line-through" : "text-slate-400 line-through"
                        )}>
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {plan.planType ? (
                    <CheckoutButton
                      plan={plan.planType}
                      variant={plan.highlighted ? 'primary' : 'outline'}
                      className={cn(
                        "w-full py-4 text-base",
                        plan.highlighted 
                          ? "bg-white text-slate-900 hover:bg-slate-100" 
                          : "border-2"
                      )}
                    >
                      {plan.cta}
                    </CheckoutButton>
                  ) : (
                    <Link href={plan.ctaLink} className="block w-full">
                      <Button variant="outline" className="w-full py-4 text-base border-2">
                        {plan.cta}
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Features Section */}
          <div className="mb-24">
            <h2 className="text-3xl font-bold text-slate-900 text-center mb-16">
              Why Choose <span className="gradient-text">SmartDocConverter</span>?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { icon: Zap, title: 'Lightning Fast', description: 'Convert documents in seconds with our optimized cloud infrastructure.', gradient: 'from-amber-400 to-orange-500' },
                { icon: Shield, title: 'Secure & Private', description: 'Your files are encrypted and automatically deleted after 1 hour.', gradient: 'from-emerald-400 to-teal-500' },
                { icon: Clock, title: 'Available 24/7', description: 'Access our tools anytime, anywhere. No software to install.', gradient: 'from-blue-400 to-indigo-500' },
              ].map((feature) => (
                <div key={feature.title} className="group bg-white rounded-3xl p-8 border-2 border-slate-100 hover:border-transparent hover:shadow-xl transition-all duration-500">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300`}>
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                  <p className="text-slate-500 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ Section */}
          <div className="max-w-3xl mx-auto mb-24">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-slate-100 text-slate-600 rounded-full mb-6">
                <HelpCircle className="w-4 h-4" />
                FAQ
              </div>
              <h2 className="text-3xl font-bold text-slate-900">
                Frequently Asked Questions
              </h2>
            </div>
            <div className="space-y-4">
              {faqs.map((faq, idx) => (
                <div key={idx} className="bg-white rounded-2xl p-6 border-2 border-slate-100 hover:border-indigo-100 hover:shadow-lg transition-all duration-300">
                  <h3 className="text-lg font-bold text-slate-900 mb-2">
                    {faq.question}
                  </h3>
                  <p className="text-slate-500 leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="relative overflow-hidden rounded-3xl">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600" />
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
            <div className="relative z-10 p-12 md:p-16 text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Ready to Get Started?
              </h2>
              <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
                Join thousands of professionals converting documents faster and smarter.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/#tools">
                  <Button size="lg" className="w-full sm:w-auto px-8 py-4 text-lg bg-white text-slate-900 hover:bg-slate-100">
                    Start Converting Free
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
                <CheckoutButton
                  plan="monthly"
                  variant="outline"
                  className="border-2 border-white/30 text-white hover:bg-white/10 px-8 py-4 text-lg"
                >
                  <Sparkles className="w-5 h-5" />
                  Try Premium Free
                </CheckoutButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
