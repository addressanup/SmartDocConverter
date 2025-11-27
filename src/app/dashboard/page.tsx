'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  FileText,
  Image,
  Settings,
  TrendingUp,
  Crown,
  Clock,
  CheckCircle,
  Sparkles,
  ArrowRight,
  Calendar
} from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface UsageData {
  conversionsUsed: number
  conversionsRemaining: number
  dailyLimit: number
  resetDate: string
  tier: string
}

interface SubscriptionData {
  tier: string
  status: string
  currentPeriodEnd: string | null
  cancelAtPeriodEnd: boolean
}

function DashboardContent() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [usage, setUsage] = useState<UsageData | null>(null)
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null)
  const [isLoadingPortal, setIsLoadingPortal] = useState(false)
  const [showCheckoutSuccess, setShowCheckoutSuccess] = useState(false)

  // Check for checkout success
  useEffect(() => {
    if (searchParams.get('checkout') === 'success') {
      setShowCheckoutSuccess(true)
      // Auto-hide after 10 seconds
      const timer = setTimeout(() => {
        setShowCheckoutSuccess(false)
      }, 10000)
      return () => clearTimeout(timer)
    }
  }, [searchParams])

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/dashboard')
    }
  }, [status, router])

  // Fetch usage data
  useEffect(() => {
    if (session?.user?.id) {
      fetchUsageData()
      fetchSubscriptionData()
    }
  }, [session])

  const fetchUsageData = async () => {
    try {
      const response = await fetch('/api/usage')
      if (response.ok) {
        const data = await response.json()
        setUsage(data)
      }
    } catch (error) {
      console.error('Failed to fetch usage data:', error)
      // Set default values on error
      setUsage({
        conversionsUsed: 0,
        conversionsRemaining: 5,
        dailyLimit: 5,
        resetDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        tier: 'FREE'
      })
    }
  }

  const fetchSubscriptionData = async () => {
    try {
      const response = await fetch('/api/subscription')
      if (response.ok) {
        const data = await response.json()
        setSubscription(data)
      }
    } catch (error) {
      console.error('Failed to fetch subscription data:', error)
      // Set default values on error
      setSubscription({
        tier: 'FREE',
        status: 'none',
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false
      })
    }
  }

  const handleManageSubscription = async () => {
    setIsLoadingPortal(true)
    try {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
      })

      if (response.ok) {
        const { url } = await response.json()
        window.location.href = url
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to open subscription management')
      }
    } catch (error) {
      console.error('Failed to open portal:', error)
      alert('Failed to open subscription management. Please try again.')
    } finally {
      setIsLoadingPortal(false)
    }
  }

  if (status === 'loading' || !session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  const isPremium = subscription?.tier === 'PREMIUM' || usage?.tier === 'PREMIUM'
  const userName = session.user?.name?.split(' ')[0] || 'there'

  const tools = [
    {
      name: 'PDF Tools',
      description: 'Convert, merge, split, and compress PDFs',
      icon: FileText,
      link: '/#pdf-tools',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      name: 'Image Tools',
      description: 'Convert images, compress, and resize',
      icon: Image,
      link: '/#image-tools',
      color: 'bg-purple-100 text-purple-600'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Checkout Success Banner */}
      {showCheckoutSuccess && (
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 px-4 relative">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 rounded-full p-2">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Welcome to Premium!</h3>
                <p className="text-sm text-green-50">
                  Your subscription is now active. Enjoy unlimited conversions!
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowCheckoutSuccess(false)}
              className="text-white hover:text-green-100 text-xl font-bold"
            >
              &times;
            </button>
          </div>
        </div>
      )}

      {/* Header Section */}
      <section className="bg-gradient-to-br from-primary-50 to-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Welcome back, {userName}!
              </h1>
              <p className="text-lg text-gray-600">
                Manage your documents and track your usage
              </p>
            </div>
            {isPremium && (
              <div className="hidden md:flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 px-6 py-3 rounded-full font-semibold shadow-lg">
                <Crown className="h-5 w-5" />
                Premium Member
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Mobile Premium Badge */}
        {isPremium && (
          <div className="md:hidden mb-6 flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 px-4 py-2 rounded-full font-semibold shadow-lg w-fit">
            <Crown className="h-4 w-4" />
            Premium Member
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Usage Stats Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <TrendingUp className="h-6 w-6 text-primary-600" />
                  Usage Today
                </h2>
                <div className="text-sm text-gray-500 flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Resets in {usage ? new Date(usage.resetDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                </div>
              </div>

              {usage ? (
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-700 font-medium">Conversions Used</span>
                      <span className="text-2xl font-bold text-primary-600">
                        {usage.conversionsUsed} / {isPremium ? '∞' : usage.dailyLimit}
                      </span>
                    </div>
                    {!isPremium && (
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-primary-500 to-primary-600 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min((usage.conversionsUsed / usage.dailyLimit) * 100, 100)}%` }}
                        />
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-3xl font-bold text-gray-900">
                        {isPremium ? '∞' : usage.conversionsRemaining}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">Remaining Today</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-3xl font-bold text-gray-900">
                        {isPremium ? '∞' : usage.dailyLimit}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">Daily Limit</div>
                    </div>
                  </div>

                  {!isPremium && usage.conversionsRemaining <= 2 && (
                    <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        <strong>Running low on conversions!</strong> Upgrade to Premium for unlimited conversions.
                      </p>
                      <Link
                        href="/pricing"
                        className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-yellow-900 hover:text-yellow-700"
                      >
                        View Premium Plans <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="animate-pulse space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
                  </div>
                </div>
              )}
            </div>

            {/* Recent Activity Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="h-6 w-6 text-primary-600" />
                Recent Conversions
              </h2>
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-600 mb-4">No recent conversions yet</p>
                <Link
                  href="/#tools"
                  className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-semibold"
                >
                  Start Converting <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Available Tools */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Tools</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tools.map((tool) => (
                  <Link
                    key={tool.name}
                    href={tool.link}
                    className="group p-4 border border-gray-200 rounded-xl hover:border-primary-300 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-lg ${tool.color} group-hover:scale-110 transition-transform`}>
                        <tool.icon className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-primary-600 transition-colors">
                          {tool.name}
                        </h3>
                        <p className="text-sm text-gray-600">{tool.description}</p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-primary-600 group-hover:translate-x-1 transition-all" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar - Right Column */}
          <div className="space-y-6">
            {/* Subscription Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary-600" />
                Subscription
              </h2>

              {subscription ? (
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Current Plan</span>
                      {isPremium && <Crown className="h-4 w-4 text-yellow-500" />}
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      {subscription.tier}
                    </div>
                  </div>

                  {isPremium ? (
                    <>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-green-700">
                          <CheckCircle className="h-4 w-4" />
                          Unlimited conversions
                        </div>
                        <div className="flex items-center gap-2 text-green-700">
                          <CheckCircle className="h-4 w-4" />
                          Priority processing
                        </div>
                        <div className="flex items-center gap-2 text-green-700">
                          <CheckCircle className="h-4 w-4" />
                          No advertisements
                        </div>
                        <div className="flex items-center gap-2 text-green-700">
                          <CheckCircle className="h-4 w-4" />
                          Larger file sizes
                        </div>
                      </div>

                      {subscription.currentPeriodEnd && (
                        <div className="pt-4 border-t border-gray-100 text-sm text-gray-600">
                          {subscription.cancelAtPeriodEnd ? (
                            <p>Expires on {new Date(subscription.currentPeriodEnd).toLocaleDateString()}</p>
                          ) : (
                            <p>Renews on {new Date(subscription.currentPeriodEnd).toLocaleDateString()}</p>
                          )}
                        </div>
                      )}

                      <Button
                        onClick={handleManageSubscription}
                        isLoading={isLoadingPortal}
                        variant="outline"
                        className="w-full"
                      >
                        Manage Subscription
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className="space-y-2 text-sm text-gray-600">
                        <p>5 conversions per day</p>
                        <p>10MB max file size</p>
                        <p>Standard processing</p>
                      </div>

                      <Link
                        href="/pricing"
                        className="block w-full text-center bg-gradient-to-r from-primary-600 to-primary-700 text-white px-4 py-3 rounded-lg font-semibold hover:from-primary-700 hover:to-primary-800 transition-all shadow-md hover:shadow-lg"
                      >
                        Upgrade to Premium
                      </Link>
                    </>
                  )}
                </div>
              ) : (
                <div className="animate-pulse space-y-3">
                  <div className="h-20 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              )}
            </div>

            {/* Quick Links Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Links</h2>
              <div className="space-y-2">
                <Link
                  href="/#tools"
                  className="block p-3 rounded-lg hover:bg-gray-50 text-gray-700 hover:text-primary-600 transition-colors"
                >
                  Browse All Tools
                </Link>
                <Link
                  href="/pricing"
                  className="block p-3 rounded-lg hover:bg-gray-50 text-gray-700 hover:text-primary-600 transition-colors"
                >
                  View Pricing
                </Link>
                <Link
                  href="/settings"
                  className="block p-3 rounded-lg hover:bg-gray-50 text-gray-700 hover:text-primary-600 transition-colors"
                >
                  Account Settings
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  )
}
