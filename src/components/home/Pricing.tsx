import Link from 'next/link'
import { Check } from 'lucide-react'

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Perfect for occasional use',
    features: [
      '5 conversions per day',
      'Max file size: 10MB',
      'Basic tools access',
      'Standard processing',
      'Ads displayed',
    ],
    cta: 'Get Started',
    ctaLink: '/#tools',
    highlighted: false,
  },
  {
    name: 'Premium',
    price: '$4.99',
    period: 'per month',
    description: 'For power users and professionals',
    features: [
      'Unlimited conversions',
      'Max file size: 50MB',
      'All tools access',
      'Priority processing',
      'No advertisements',
      'Batch processing',
      'Email support',
    ],
    cta: 'Start Free Trial',
    ctaLink: '/pricing',
    highlighted: true,
  },
]

export function Pricing() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Start for free, upgrade when you need more
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl p-8 ${
                plan.highlighted
                  ? 'bg-primary-600 text-white ring-4 ring-primary-600 ring-offset-4'
                  : 'bg-gray-50 text-gray-900'
              }`}
            >
              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <p className={`text-sm mb-4 ${plan.highlighted ? 'text-primary-100' : 'text-gray-600'}`}>
                {plan.description}
              </p>
              <div className="mb-6">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className={`text-sm ${plan.highlighted ? 'text-primary-100' : 'text-gray-600'}`}>
                  {' '}/{plan.period}
                </span>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <Check className={`h-5 w-5 ${plan.highlighted ? 'text-primary-200' : 'text-primary-600'}`} />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
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
            </div>
          ))}
        </div>

        <p className="text-center text-gray-500 text-sm mt-8">
          Annual billing available: $39.99/year (save 33%)
        </p>
      </div>
    </section>
  )
}
