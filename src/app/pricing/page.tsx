'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Check, X, Zap, Shield, Clock } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { CheckoutButton } from '@/components/pricing/CheckoutButton'

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
    <div className="bg-blue-50 border-b border-blue-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between gap-4">
          <p className="text-blue-800 text-sm sm:text-base">
            No worries! You can upgrade anytime when you're ready.
          </p>
          <button
            onClick={() => setShowCancelAlert(false)}
            className="flex-shrink-0 text-blue-600 hover:text-blue-800 transition-colors"
            aria-label="Dismiss"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Checkout Canceled Alert */}
      <Suspense fallback={null}>
        <CancelAlert />
      </Suspense>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose the plan that fits your needs. Start for free, upgrade when you need more.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16 -mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl p-8 ${
                  plan.highlighted
                    ? 'bg-primary-600 text-white ring-4 ring-primary-600 ring-offset-4 scale-105'
                    : 'bg-white text-gray-900 border border-gray-200'
                }`}
              >
                {plan.badge && (
                  <span
                    className={`absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-sm font-semibold ${
                      plan.highlighted
                        ? 'bg-yellow-400 text-yellow-900'
                        : 'bg-primary-100 text-primary-700'
                    }`}
                  >
                    {plan.badge}
                  </span>
                )}

                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p
                  className={`text-sm mb-4 ${
                    plan.highlighted ? 'text-primary-100' : 'text-gray-600'
                  }`}
                >
                  {plan.description}
                </p>

                <div className="mb-6">
                  <span className="text-5xl font-bold">{plan.price}</span>
                  <span
                    className={`text-sm ${
                      plan.highlighted ? 'text-primary-100' : 'text-gray-600'
                    }`}
                  >
                    {' '}
                    / {plan.period}
                  </span>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-3">
                      {feature.included ? (
                        <Check
                          className={`h-5 w-5 flex-shrink-0 ${
                            plan.highlighted ? 'text-primary-200' : 'text-green-500'
                          }`}
                        />
                      ) : (
                        <X
                          className={`h-5 w-5 flex-shrink-0 ${
                            plan.highlighted ? 'text-primary-300' : 'text-gray-300'
                          }`}
                        />
                      )}
                      <span
                        className={`text-sm ${
                          !feature.included &&
                          (plan.highlighted ? 'text-primary-300' : 'text-gray-400')
                        }`}
                      >
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                {plan.planType ? (
                  <CheckoutButton
                    plan={plan.planType}
                    variant={plan.highlighted ? 'secondary' : 'primary'}
                    className={`w-full ${
                      plan.highlighted
                        ? 'bg-white text-primary-600 hover:bg-gray-100'
                        : 'bg-primary-600 text-white hover:bg-primary-700'
                    }`}
                  >
                    {plan.cta}
                  </CheckoutButton>
                ) : (
                  <Link
                    href={plan.ctaLink}
                    className={`block w-full text-center py-3 rounded-lg font-semibold transition-colors ${
                      plan.highlighted
                        ? 'bg-white text-primary-600 hover:bg-gray-100'
                        : 'bg-primary-600 text-white hover:bg-primary-700'
                    }`}
                  >
                    {plan.cta}
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Why Choose SmartDocConverter?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Lightning Fast</h3>
              <p className="text-gray-600">
                Convert documents in seconds with our optimized cloud infrastructure.
                No waiting around for your files.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Secure & Private</h3>
              <p className="text-gray-600">
                Your files are encrypted and automatically deleted after 1 hour.
                We never store or share your data.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Available 24/7</h3>
              <p className="text-gray-600">
                Access our tools anytime, anywhere. No software to install,
                works on any device with a browser.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {faq.question}
                </h3>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Join thousands of users converting documents with SmartDocConverter.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/#tools"
              className="inline-flex items-center justify-center bg-white text-primary-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Start Converting Free
            </Link>
            <CheckoutButton
              plan="monthly"
              variant="outline"
              className="border-2 border-white text-white px-8 py-4 text-lg hover:bg-primary-700"
            >
              Try Premium Free
            </CheckoutButton>
          </div>
        </div>
      </section>
    </div>
  )
}
