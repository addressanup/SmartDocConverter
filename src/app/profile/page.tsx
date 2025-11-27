'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { User, Mail, Calendar, CreditCard, Shield, Check, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'
import { z } from 'zod'

const updateNameSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name must be less than 50 characters'),
})

type UserSubscription = {
  status: string
  plan: string | null
  currentPeriodEnd: string | null
  cancelAtPeriodEnd: boolean
}

export default function ProfilePage() {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [subscription, setSubscription] = useState<UserSubscription | null>(null)
  const [loadingSubscription, setLoadingSubscription] = useState(true)

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  // Initialize name from session
  useEffect(() => {
    if (session?.user?.name) {
      setName(session.user.name)
    }
  }, [session?.user?.name])

  // Fetch subscription data
  useEffect(() => {
    const fetchSubscription = async () => {
      if (status === 'authenticated') {
        try {
          const response = await fetch('/api/subscription')
          if (response.ok) {
            const data = await response.json()
            setSubscription(data)
          }
        } catch (err) {
          console.error('Failed to fetch subscription:', err)
        } finally {
          setLoadingSubscription(false)
        }
      }
    }

    fetchSubscription()
  }, [status])

  const handleSave = async () => {
    setError(null)
    setSuccess(false)

    // Validate name
    try {
      updateNameSchema.parse({ name })
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.issues[0].message)
        return
      }
    }

    setIsSaving(true)

    try {
      const response = await fetch('/api/user/update', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update profile')
      }

      // Update the session with new name
      await update({ name })

      setSuccess(true)
      setIsEditing(false)

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setName(session?.user?.name || '')
    setIsEditing(false)
    setError(null)
  }

  const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const getSubscriptionStatus = () => {
    if (loadingSubscription) {
      return (
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
          <span className="text-gray-600">Loading...</span>
        </div>
      )
    }

    if (!subscription || subscription.status === 'INCOMPLETE') {
      return (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-gray-400"></div>
            <span className="text-gray-600 font-medium">Free Plan</span>
          </div>
          <Link href="/pricing">
            <Button size="sm" variant="outline">
              Upgrade to Premium
            </Button>
          </Link>
        </div>
      )
    }

    const statusColors = {
      ACTIVE: 'bg-green-500',
      TRIALING: 'bg-blue-500',
      CANCELED: 'bg-orange-500',
      PAST_DUE: 'bg-red-500',
    }

    const statusText = {
      ACTIVE: 'Active',
      TRIALING: 'Trial',
      CANCELED: 'Canceled',
      PAST_DUE: 'Past Due',
    }

    const color = statusColors[subscription.status as keyof typeof statusColors] || 'bg-gray-400'
    const text = statusText[subscription.status as keyof typeof statusText] || subscription.status

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${color}`}></div>
            <span className="text-gray-600 font-medium">
              {subscription.plan === 'MONTHLY' ? 'Premium Monthly' : 'Premium Annual'} - {text}
            </span>
          </div>
          {subscription.status === 'ACTIVE' && !subscription.cancelAtPeriodEnd && (
            <Link href="/api/stripe/portal" target="_blank">
              <Button size="sm" variant="ghost">
                Manage Subscription
              </Button>
            </Link>
          )}
        </div>
        {subscription.currentPeriodEnd && (
          <p className="text-sm text-gray-500">
            {subscription.cancelAtPeriodEnd ? 'Ends' : 'Renews'} on {formatDate(subscription.currentPeriodEnd)}
          </p>
        )}
      </div>
    )
  }

  // Loading state
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    )
  }

  // Not authenticated (will redirect)
  if (status === 'unauthenticated') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <User className="h-8 w-8 text-primary-600" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Your Profile
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Manage your account settings and subscription
            </p>
          </div>
        </div>
      </section>

      {/* Profile Content */}
      <section className="py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Success Message */}
          {success && (
            <div className="mb-6 rounded-lg bg-green-50 p-4 flex items-center gap-3">
              <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
              <p className="text-sm text-green-800 font-medium">
                Profile updated successfully!
              </p>
            </div>
          )}

          <div className="space-y-6">
            {/* Profile Information Card */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center gap-6 mb-8">
                {session?.user?.image ? (
                  <img
                    src={session.user.image}
                    alt={session.user.name || 'User avatar'}
                    className="w-20 h-20 rounded-full object-cover ring-4 ring-primary-100"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center ring-4 ring-primary-100">
                    <span className="text-2xl font-bold text-white">
                      {session?.user?.name?.charAt(0).toUpperCase() || session?.user?.email?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                )}
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {session?.user?.name || 'User'}
                  </h2>
                  <p className="text-gray-600">{session?.user?.email}</p>
                </div>
              </div>

              {/* Name Edit Form */}
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Display Name
                  </label>
                  {isEditing ? (
                    <div className="space-y-3">
                      <input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        disabled={isSaving}
                        className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:cursor-not-allowed disabled:bg-gray-50"
                        placeholder="Enter your name"
                      />
                      {error && (
                        <div className="flex items-center gap-2 text-sm text-red-600">
                          <X className="h-4 w-4" />
                          <span>{error}</span>
                        </div>
                      )}
                      <div className="flex gap-3">
                        <Button
                          onClick={handleSave}
                          isLoading={isSaving}
                          disabled={isSaving}
                          size="sm"
                        >
                          Save Changes
                        </Button>
                        <Button
                          onClick={handleCancel}
                          variant="ghost"
                          disabled={isSaving}
                          size="sm"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 border border-gray-200">
                      <div className="flex items-center gap-3">
                        <User className="h-5 w-5 text-gray-400" />
                        <span className="text-gray-900 font-medium">
                          {session?.user?.name || 'Not set'}
                        </span>
                      </div>
                      <Button
                        onClick={() => setIsEditing(true)}
                        variant="outline"
                        size="sm"
                      >
                        Edit
                      </Button>
                    </div>
                  )}
                </div>

                {/* Email (Read-only) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-gray-50 border border-gray-200">
                    <Mail className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-900 font-medium">
                      {session?.user?.email}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    Email address cannot be changed
                  </p>
                </div>

                {/* Account Created */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Member Since
                  </label>
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-gray-50 border border-gray-200">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-900 font-medium">
                      {formatDate((session?.user as any)?.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Subscription Card */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-primary-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Subscription</h3>
              </div>

              <div className="space-y-4">
                {getSubscriptionStatus()}
              </div>

              {!loadingSubscription && (!subscription || subscription.status === 'INCOMPLETE') && (
                <div className="mt-6 p-4 rounded-lg bg-blue-50 border border-blue-200">
                  <div className="flex gap-3">
                    <Shield className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-blue-900 mb-1">
                        Unlock Premium Features
                      </h4>
                      <p className="text-sm text-blue-800 mb-3">
                        Upgrade to Premium for unlimited conversions, larger file sizes, and priority processing.
                      </p>
                      <Link href="/pricing">
                        <Button size="sm">
                          View Plans
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Account Actions */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Account Actions</h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200">
                  <div>
                    <h4 className="font-semibold text-gray-900">Password</h4>
                    <p className="text-sm text-gray-600">
                      {session?.user?.image ? 'Signed in with Google' : 'Change your password'}
                    </p>
                  </div>
                  {!session?.user?.image && (
                    <Button variant="outline" size="sm" disabled>
                      Change Password
                    </Button>
                  )}
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border border-red-200 bg-red-50">
                  <div>
                    <h4 className="font-semibold text-red-900">Delete Account</h4>
                    <p className="text-sm text-red-700">
                      Permanently delete your account and all data
                    </p>
                  </div>
                  <Button variant="danger" size="sm" disabled>
                    Delete Account
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
