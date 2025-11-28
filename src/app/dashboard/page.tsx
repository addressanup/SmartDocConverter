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
  Zap,
  Shield,
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

  useEffect(() => {
    if (searchParams.get('checkout') === 'success') {
      setShowCheckoutSuccess(true)
      const timer = setTimeout(() => setShowCheckoutSuccess(false), 10000)
      return () => clearTimeout(timer)
    }
  }, [searchParams])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/dashboard')
    }
  }, [status, router])

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
      const response = await fetch('/api/stripe/portal', { method: 'POST' })
      if (response.ok) {
        const { url } = await response.json()
        window.location.href = url
      }
    } catch (error) {
      alert('Failed to open subscription management')
    } finally {
      setIsLoadingPortal(false)
    }
  }

  if (status === 'loading' || !session) {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-indigo-50/30" />
        <div className="relative z-10 text-center">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full blur-xl opacity-30 animate-pulse" />
            <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center">
              <Sparkles className="h-8 w-8 text-white animate-pulse" />
            </div>
          </div>
          <p className="mt-6 text-lg font-medium text-slate-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  const isPremium = subscription?.tier === 'PREMIUM' || usage?.tier === 'PREMIUM'
  const userName = session.user?.name?.split(' ')[0] || 'there'

  const tools = [
    { name: 'PDF Tools', description: 'Convert, merge, split, and compress PDFs', icon: FileText, link: '/#tools', gradient: 'from-blue-500 to-indigo-600' },
    { name: 'Image Tools', description: 'Convert images and extract text', icon: Image, link: '/#tools', gradient: 'from-purple-500 to-pink-600' }
  ]

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-indigo-50/30" />
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-indigo-100/40 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-purple-100/30 rounded-full blur-[100px]" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-30" />
      </div>

      <div className="relative z-10 pt-28 pb-16">
        <div className="max-w-7xl mx-auto px-6">
          {/* Success Banner */}
          {showCheckoutSuccess && (
            <div className="mb-8 relative overflow-hidden bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 border border-emerald-200 rounded-3xl p-6 animate-slide-down">
              <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-200/30 rounded-full blur-3xl" />
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
                    <Crown className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-slate-900">Welcome to Premium!</p>
                    <p className="text-sm text-emerald-600 font-medium">Enjoy unlimited conversions and priority processing.</p>
                  </div>
                </div>
                <button onClick={() => setShowCheckoutSuccess(false)} className="text-slate-400 hover:text-slate-600 text-2xl">&times;</button>
              </div>
            </div>
          )}

          {/* Header */}
          <div className="mb-12">
            <div className="flex items-center gap-4 mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl blur-lg opacity-40" />
                <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-xl">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900">Welcome back, {userName}!</h1>
                <p className="text-lg text-slate-500">Manage your documents, track usage, and access premium features.</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {/* Usage Stats */}
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 rounded-[28px] blur-xl" />
                <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl border border-white/60 shadow-xl p-8">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                        <TrendingUp className="h-5 w-5 text-white" />
                      </div>
                      Usage Today
                    </h2>
                    <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-full">
                      <Clock className="h-4 w-4 text-slate-500" />
                      <span className="text-sm font-medium text-slate-600">
                        Resets {usage ? new Date(usage.resetDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                      </span>
                    </div>
                  </div>

                  {usage ? (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <span className="text-lg text-slate-600">Conversions</span>
                        <span className="text-3xl font-extrabold text-slate-900">
                          {usage.conversionsUsed} <span className="text-slate-400 font-medium">/ {isPremium ? '∞' : usage.dailyLimit}</span>
                        </span>
                      </div>
                      {!isPremium && (
                        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min((usage.conversionsUsed / usage.dailyLimit) * 100, 100)}%` }}
                          />
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-6 pt-6 border-t border-slate-100">
                        <div className="text-center p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100">
                          <div className="text-4xl font-extrabold text-slate-900">{isPremium ? '∞' : usage.conversionsRemaining}</div>
                          <div className="text-sm font-medium text-slate-500 mt-1">Remaining</div>
                        </div>
                        <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border border-purple-100">
                          <div className="text-4xl font-extrabold text-slate-900">{isPremium ? '∞' : usage.dailyLimit}</div>
                          <div className="text-sm font-medium text-slate-500 mt-1">Daily Limit</div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="animate-pulse space-y-4">
                      <div className="h-6 bg-slate-100 rounded-full w-3/4"></div>
                      <div className="h-3 bg-slate-100 rounded-full"></div>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Access */}
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-violet-500/10 rounded-[28px] blur-xl" />
                <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl border border-white/60 shadow-xl p-8">
                  <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg">
                      <Zap className="h-5 w-5 text-white" />
                    </div>
                    Quick Access
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {tools.map((tool) => (
                      <Link
                        key={tool.name}
                        href={tool.link}
                        className="group relative p-6 rounded-2xl border-2 border-slate-100 hover:border-transparent hover:shadow-xl bg-white hover:bg-gradient-to-br hover:from-slate-50 hover:to-white transition-all duration-500"
                      >
                        <div className="flex items-start gap-4">
                          <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${tool.gradient} flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300`}>
                            <tool.icon className="h-7 w-7 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{tool.name}</h3>
                            <p className="text-sm text-slate-500 mt-1">{tool.description}</p>
                          </div>
                          <ArrowRight className="h-5 w-5 text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-rose-500/10 rounded-[28px] blur-xl" />
                <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl border border-white/60 shadow-xl p-8">
                  <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg">
                      <Settings className="h-5 w-5 text-white" />
                    </div>
                    Subscription
                  </h2>

                  {subscription ? (
                    <div className="space-y-6">
                      <div className="p-5 bg-gradient-to-br from-slate-50 to-white rounded-2xl border border-slate-100">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-slate-500">Current Plan</span>
                          {isPremium && <Crown className="h-5 w-5 text-amber-500" />}
                        </div>
                        <div className="text-2xl font-extrabold text-slate-900">{subscription.tier}</div>
                      </div>

                      {isPremium ? (
                        <>
                          <div className="space-y-3">
                            {['Unlimited conversions', 'Priority processing', 'No advertisements', 'Larger file support'].map((f) => (
                              <div key={f} className="flex items-center gap-3">
                                <div className="w-6 h-6 rounded-full bg-emerald-50 flex items-center justify-center">
                                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                                </div>
                                <span className="text-sm font-medium text-slate-600">{f}</span>
                              </div>
                            ))}
                          </div>
                          <Button onClick={handleManageSubscription} isLoading={isLoadingPortal} variant="outline" className="w-full border-2">
                            Manage Subscription
                          </Button>
                        </>
                      ) : (
                        <>
                          <div className="space-y-2 text-sm text-slate-500">
                            <p>5 conversions per day</p>
                            <p>10MB max file size</p>
                          </div>
                          <Link 
                            href="/pricing" 
                            className="block w-full text-center bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white px-6 py-4 rounded-2xl font-semibold hover:shadow-xl hover:shadow-indigo-500/25 transition-all"
                          >
                            Upgrade to Premium
                          </Link>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="animate-pulse space-y-4">
                      <div className="h-20 bg-slate-100 rounded-2xl"></div>
                      <div className="h-4 bg-slate-100 rounded w-3/4"></div>
                    </div>
                  )}
                </div>
              </div>

              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-slate-500/5 via-slate-500/10 to-slate-500/5 rounded-[28px] blur-xl" />
                <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl border border-white/60 shadow-xl p-8">
                  <h2 className="text-lg font-bold text-slate-900 mb-4">Quick Links</h2>
                  <div className="space-y-2">
                    {[
                      { label: 'All Tools', href: '/#tools', icon: FileText },
                      { label: 'Pricing', href: '/pricing', icon: Crown },
                      { label: 'Settings', href: '/settings', icon: Settings }
                    ].map((link) => (
                      <Link 
                        key={link.label} 
                        href={link.href} 
                        className="flex items-center gap-3 p-3 rounded-xl text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-all"
                      >
                        <link.icon className="h-5 w-5" />
                        <span className="font-medium">{link.label}</span>
                      </Link>
                    ))}
                  </div>
                </div>
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
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-indigo-50/30" />
        <div className="relative z-10">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center animate-pulse">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  )
}
