'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'

interface UsageData {
  conversionsUsed: number
  conversionsRemaining: number
  dailyLimit: number
  resetDate: string
  tier: 'ANONYMOUS' | 'FREE' | 'PREMIUM'
}

interface UsageIndicatorProps {
  initialUsage?: UsageData
  className?: string
  compact?: boolean
}

export default function UsageIndicator({
  initialUsage,
  className = '',
  compact = false,
}: UsageIndicatorProps) {
  const { data: session } = useSession()
  const [usage, setUsage] = useState<UsageData | null>(initialUsage || null)
  const [loading, setLoading] = useState(!initialUsage)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (initialUsage) {
      setUsage(initialUsage)
      setLoading(false)
      return
    }

    fetchUsage()
  }, [session])

  const fetchUsage = async () => {
    try {
      setLoading(true)
      setError(null)

      // Get browser fingerprint (simple implementation)
      const fingerprint = getFingerprint()

      const response = await fetch('/api/usage', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-fingerprint': fingerprint,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch usage data')
      }

      const data = await response.json()
      setUsage(data)
    } catch (err) {
      console.error('Failed to fetch usage:', err)
      setError('Unable to load usage data')
    } finally {
      setLoading(false)
    }
  }

  const getFingerprint = (): string => {
    // Simple browser fingerprint (in production, use a proper library like FingerprintJS)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.textBaseline = 'top'
      ctx.font = '14px Arial'
      ctx.fillText('fingerprint', 2, 2)
    }
    const fingerprint = canvas.toDataURL()
    return btoa(
      fingerprint +
        navigator.userAgent +
        navigator.language +
        screen.colorDepth +
        screen.width +
        screen.height
    ).substring(0, 32)
  }

  const getPercentageUsed = () => {
    if (!usage) return 0
    return Math.round((usage.conversionsUsed / usage.dailyLimit) * 100)
  }

  const getProgressColor = () => {
    const percentage = getPercentageUsed()
    if (percentage >= 100) return 'bg-red-500'
    if (percentage >= 80) return 'bg-orange-500'
    if (percentage >= 50) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const getTimeUntilReset = () => {
    if (!usage) return ''
    const resetDate = new Date(usage.resetDate)
    const now = new Date()
    const diff = resetDate.getTime() - now.getTime()

    if (diff <= 0) return 'Resetting soon...'

    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    if (hours > 24) {
      const days = Math.floor(hours / 24)
      return `Resets in ${days}d ${hours % 24}h`
    }

    if (hours > 0) {
      return `Resets in ${hours}h ${minutes}m`
    }

    return `Resets in ${minutes}m`
  }

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-4 bg-gray-200 rounded w-32"></div>
      </div>
    )
  }

  if (error || !usage) {
    return null
  }

  // Premium users get unlimited conversions
  if (usage.tier === 'PREMIUM') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="flex items-center gap-1">
          <svg
            className="w-5 h-5 text-yellow-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <span className="font-semibold text-yellow-600">Premium</span>
        </div>
        <span className="text-sm text-gray-600">Unlimited conversions</span>
      </div>
    )
  }

  if (compact) {
    return (
      <div className={`flex items-center gap-2 text-sm ${className}`}>
        <span className="text-gray-600">
          {usage.conversionsRemaining} / {usage.dailyLimit} left
        </span>
        {usage.conversionsRemaining === 0 && (
          <span className="text-red-600 text-xs">{getTimeUntilReset()}</span>
        )}
      </div>
    )
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <svg
            className="w-4 h-4 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <span className="font-medium text-gray-700">Daily Conversions</span>
        </div>
        <span className="text-xs text-gray-500">{getTimeUntilReset()}</span>
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">
            {usage.conversionsUsed} of {usage.dailyLimit} used
          </span>
          <span
            className={`font-semibold ${
              usage.conversionsRemaining === 0
                ? 'text-red-600'
                : usage.conversionsRemaining <= 2
                ? 'text-orange-600'
                : 'text-green-600'
            }`}
          >
            {usage.conversionsRemaining} remaining
          </span>
        </div>

        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${getProgressColor()}`}
            style={{ width: `${getPercentageUsed()}%` }}
          />
        </div>
      </div>

      {usage.conversionsRemaining === 0 && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800 font-medium">
            Daily limit reached!
          </p>
          <p className="text-xs text-red-600 mt-1">
            {usage.tier === 'ANONYMOUS' || usage.tier === 'FREE' ? (
              <>
                Upgrade to Premium for unlimited conversions.{' '}
                <a
                  href="/pricing"
                  className="underline font-medium hover:text-red-700"
                >
                  View plans
                </a>
              </>
            ) : (
              'Your limit will reset tomorrow.'
            )}
          </p>
        </div>
      )}

      {usage.conversionsRemaining > 0 &&
        usage.conversionsRemaining <= 2 &&
        (usage.tier === 'ANONYMOUS' || usage.tier === 'FREE') && (
          <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <p className="text-sm text-orange-800 font-medium">
              Running low on conversions
            </p>
            <p className="text-xs text-orange-600 mt-1">
              Upgrade to Premium for unlimited daily conversions.{' '}
              <a
                href="/pricing"
                className="underline font-medium hover:text-orange-700"
              >
                Learn more
              </a>
            </p>
          </div>
        )}

      {usage.tier === 'ANONYMOUS' && (
        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800 font-medium">
            Not signed in
          </p>
          <p className="text-xs text-blue-600 mt-1">
            <a
              href="/login"
              className="underline font-medium hover:text-blue-700"
            >
              Sign in
            </a>{' '}
            or{' '}
            <a
              href="/register"
              className="underline font-medium hover:text-blue-700"
            >
              create an account
            </a>{' '}
            to track your usage across devices.
          </p>
        </div>
      )}
    </div>
  )
}
