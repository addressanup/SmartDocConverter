'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { User, Mail, Calendar, CreditCard, Shield, Check, X, Loader2, Crown, Sparkles, Settings } from 'lucide-react'
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

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    if (session?.user?.name) {
      setName(session.user.name)
    }
  }, [session?.user?.name])

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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update profile')
      }

      await update({ name })
      setSuccess(true)
      setIsEditing(false)
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

  if (status === 'loading') {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-indigo-50/30" />
        <div className="relative z-10 text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center mx-auto animate-pulse">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <p className="mt-6 text-lg font-medium text-slate-600">Loading your profile...</p>
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated') return null

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-purple-50/30" />
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-purple-100/40 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-indigo-100/30 rounded-full blur-[100px]" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-30" />
      </div>

      <div className="relative z-10 pt-32 pb-24">
        <div className="max-w-3xl mx-auto px-6">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl blur-xl opacity-40" />
              <div className="relative w-20 h-20 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center shadow-2xl">
                <User className="h-10 w-10 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-extrabold text-slate-900 mb-3">Your Profile</h1>
            <p className="text-lg text-slate-500">Manage your account settings and subscription details.</p>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-8 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 p-5 flex items-center gap-4 animate-slide-down">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                <Check className="h-5 w-5 text-emerald-600" />
              </div>
              <p className="font-semibold text-emerald-700">Profile updated successfully!</p>
            </div>
          )}

          <div className="space-y-8">
            {/* Profile Card */}
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 rounded-[28px] blur-xl" />
              <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl border border-white/60 shadow-xl p-8">
                <div className="flex items-center gap-6 mb-8">
                  {session?.user?.image ? (
                    <img
                      src={session.user.image}
                      alt={session.user.name || 'User avatar'}
                      className="w-20 h-20 rounded-2xl object-cover ring-4 ring-indigo-100"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center ring-4 ring-indigo-100 shadow-lg">
                      <span className="text-3xl font-bold text-white">
                        {session?.user?.name?.charAt(0).toUpperCase() || session?.user?.email?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                  )}
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-slate-900 mb-1">
                      {session?.user?.name || 'User'}
                    </h2>
                    <p className="text-slate-500">{session?.user?.email}</p>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">
                      Display Name
                    </label>
                    {isEditing ? (
                      <div className="space-y-4">
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          disabled={isSaving}
                          className="block w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-slate-900 focus:border-indigo-400 focus:outline-none focus:ring-4 focus:ring-indigo-100 disabled:opacity-50 transition-all"
                          placeholder="Enter your name"
                        />
                        {error && (
                          <div className="flex items-center gap-2 text-sm text-red-600">
                            <X className="h-4 w-4" />
                            <span>{error}</span>
                          </div>
                        )}
                        <div className="flex gap-3">
                          <Button onClick={handleSave} isLoading={isSaving} size="md" variant="gradient">
                            Save Changes
                          </Button>
                          <Button onClick={handleCancel} variant="ghost" disabled={isSaving} size="md">
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border-2 border-slate-100">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center">
                            <User className="h-5 w-5 text-slate-500" />
                          </div>
                          <span className="font-medium text-slate-900">
                            {session?.user?.name || 'Not set'}
                          </span>
                        </div>
                        <Button onClick={() => setIsEditing(true)} variant="outline" size="sm" className="border-2">
                          Edit
                        </Button>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">
                      Email Address
                    </label>
                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 border-2 border-slate-100">
                      <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center">
                        <Mail className="h-5 w-5 text-slate-500" />
                      </div>
                      <span className="font-medium text-slate-900">{session?.user?.email}</span>
                    </div>
                    <p className="mt-2 text-xs text-slate-500">Email address cannot be changed</p>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">
                      Member Since
                    </label>
                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 border-2 border-slate-100">
                      <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-slate-500" />
                      </div>
                      <span className="font-medium text-slate-900">
                        {formatDate((session?.user as any)?.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Subscription Card */}
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-rose-500/10 rounded-[28px] blur-xl" />
              <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl border border-white/60 shadow-xl p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
                    <CreditCard className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">Subscription</h3>
                </div>

                {loadingSubscription ? (
                  <div className="flex items-center gap-3 p-4">
                    <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                    <span className="text-slate-500">Loading subscription...</span>
                  </div>
                ) : !subscription || subscription.status === 'INCOMPLETE' ? (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border-2 border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-slate-400" />
                        <span className="font-semibold text-slate-700">Free Plan</span>
                      </div>
                      <Link href="/pricing">
                        <Button size="sm" variant="gradient">
                          Upgrade to Premium
                        </Button>
                      </Link>
                    </div>
                    <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100">
                      <div className="flex gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg flex-shrink-0">
                          <Crown className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h4 className="font-bold text-indigo-900 mb-1">Unlock Premium Features</h4>
                          <p className="text-sm text-indigo-700/80 mb-4">
                            Get unlimited conversions, larger file sizes, and priority processing.
                          </p>
                          <Link href="/pricing">
                            <Button size="sm" variant="gradient">View Plans</Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-100">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-emerald-500" />
                        <span className="font-semibold text-emerald-800">
                          {subscription.plan === 'MONTHLY' ? 'Premium Monthly' : 'Premium Annual'} - Active
                        </span>
                      </div>
                      <Link href="/api/stripe/portal" target="_blank">
                        <Button variant="ghost" size="sm">Manage</Button>
                      </Link>
                    </div>
                    {subscription.currentPeriodEnd && (
                      <p className="text-sm text-slate-500">
                        {subscription.cancelAtPeriodEnd ? 'Ends' : 'Renews'} on {formatDate(subscription.currentPeriodEnd)}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Account Actions */}
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-slate-500/5 via-slate-500/10 to-slate-500/5 rounded-[28px] blur-xl" />
              <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl border border-white/60 shadow-xl p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center shadow-lg">
                    <Settings className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">Account Actions</h3>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-2xl border-2 border-slate-100 bg-slate-50">
                    <div>
                      <h4 className="font-semibold text-slate-900">Password</h4>
                      <p className="text-sm text-slate-500 mt-1">
                        {session?.user?.image ? 'Signed in with Google' : 'Change your password'}
                      </p>
                    </div>
                    {!session?.user?.image && (
                      <Link href="/settings">
                        <Button variant="outline" size="sm" className="border-2">Change</Button>
                      </Link>
                    )}
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-2xl border-2 border-red-100 bg-red-50/50">
                    <div>
                      <h4 className="font-semibold text-red-700">Delete Account</h4>
                      <p className="text-sm text-red-600/70 mt-1">
                        Permanently delete your account and all data
                      </p>
                    </div>
                    <Link href="/settings">
                      <Button variant="danger" size="sm">Delete</Button>
                    </Link>
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
