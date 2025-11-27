import { Zap, Shield, Smartphone, Clock } from 'lucide-react'

const features = [
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Convert documents in seconds with our optimized processing engine. No waiting around.',
  },
  {
    icon: Shield,
    title: 'Secure & Private',
    description: 'Your files are automatically deleted after 1 hour. We never store or share your data.',
  },
  {
    icon: Smartphone,
    title: 'Works Everywhere',
    description: 'Use on any device - desktop, tablet, or mobile. No software installation required.',
  },
  {
    icon: Clock,
    title: 'No Registration',
    description: 'Start converting immediately. No account needed for basic conversions.',
  },
]

export function Features() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose SmartDocConverter?</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            We've built the fastest, most secure document conversion platform on the web
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <div key={feature.title} className="text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon className="h-8 w-8 text-primary-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
