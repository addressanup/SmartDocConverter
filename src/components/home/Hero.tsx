import Link from 'next/link'
import { ArrowRight, Shield, Zap, Globe } from 'lucide-react'

export function Hero() {
  return (
    <section className="bg-gradient-to-br from-primary-50 to-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Convert Documents{' '}
            <span className="text-primary-600">Instantly</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Free online tools to convert PDF to Word, Excel, JPG and more.
            No registration required. Fast, secure, and easy to use.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link
              href="#tools"
              className="inline-flex items-center justify-center gap-2 bg-primary-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-primary-700 transition-colors"
            >
              Start Converting
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center gap-2 bg-white text-primary-600 border-2 border-primary-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-primary-50 transition-colors"
            >
              View Pricing
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap justify-center gap-8 text-gray-600">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary-600" />
              <span>Lightning Fast</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary-600" />
              <span>Secure & Private</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary-600" />
              <span>Works Everywhere</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
