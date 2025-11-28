"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import Link from "next/link"
import { Shield, Bell, Trash2, ArrowLeft, Lock, Sparkles, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/Button"

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type PasswordFormData = z.infer<typeof passwordSchema>

export default function SettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState("")

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  })

  if (status === "unauthenticated") {
    router.push("/login")
    return null
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-indigo-50/30" />
        <div className="relative z-10">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center animate-pulse">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
        </div>
      </div>
    )
  }

  const onPasswordSubmit = async (data: PasswordFormData) => {
    setIsLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to change password')
      }

      setMessage({ type: 'success', text: 'Password changed successfully' })
      reset()
    } catch (err) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to change password'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleNotificationToggle = async () => {
    setEmailNotifications(!emailNotifications)
    setMessage({ type: 'success', text: 'Notification preferences updated' })
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== "DELETE") {
      setMessage({ type: 'error', text: 'Please type DELETE to confirm' })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/user/delete-account', { method: 'DELETE' })

      if (!response.ok) {
        throw new Error('Failed to delete account')
      }

      router.push('/')
    } catch (err) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to delete account'
      })
    } finally {
      setIsLoading(false)
      setShowDeleteDialog(false)
    }
  }

  const user = session?.user

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
        <div className="max-w-3xl mx-auto px-6">
          {/* Header */}
          <div className="mb-10">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-indigo-600 mb-6 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
            
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl blur-lg opacity-40" />
                <div className="relative w-16 h-16 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-xl">
                  <Shield className="h-8 w-8 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-extrabold text-slate-900">Settings</h1>
                <p className="text-slate-500">Manage your account settings, preferences, and security.</p>
              </div>
            </div>
          </div>

          {/* Alert Messages */}
          {message && (
            <div
              className={`mb-8 rounded-2xl p-5 border-2 flex items-center gap-4 animate-slide-down ${
                message.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                  : 'bg-red-50 border-red-200 text-red-700'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                message.type === 'success' ? 'bg-emerald-100' : 'bg-red-100'
              }`}>
                {message.type === 'success' ? '✓' : '!'}
              </div>
              <span className="font-medium">{message.text}</span>
            </div>
          )}

          <div className="space-y-8">
            {/* Account Information */}
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 rounded-[28px] blur-xl" />
              <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl border border-white/60 shadow-xl p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Account Information</h2>
                    <p className="text-sm text-slate-500">Your personal details</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider mb-2">Name</label>
                    <div className="p-4 bg-slate-50 rounded-xl border-2 border-slate-100 text-slate-900 font-medium">
                      {user?.name || 'Not set'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider mb-2">Email</label>
                    <div className="p-4 bg-slate-50 rounded-xl border-2 border-slate-100 text-slate-900 font-medium">
                      {user?.email}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Change Password */}
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-rose-500/10 rounded-[28px] blur-xl" />
              <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl border border-white/60 shadow-xl p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg">
                    <Lock className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Change Password</h2>
                    <p className="text-sm text-slate-500">Update your security credentials</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit(onPasswordSubmit)} className="space-y-5">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Current Password
                    </label>
                    <input
                      type="password"
                      autoComplete="current-password"
                      disabled={isLoading}
                      {...register("currentPassword")}
                      className="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-slate-900 focus:border-indigo-400 focus:outline-none focus:ring-4 focus:ring-indigo-100 disabled:opacity-50 transition-all"
                    />
                    {errors.currentPassword && (
                      <p className="mt-2 text-sm text-red-600">{errors.currentPassword.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider mb-2">
                        New Password
                      </label>
                      <input
                        type="password"
                        autoComplete="new-password"
                        disabled={isLoading}
                        {...register("newPassword")}
                        className="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-slate-900 focus:border-indigo-400 focus:outline-none focus:ring-4 focus:ring-indigo-100 disabled:opacity-50 transition-all"
                      />
                      {errors.newPassword && (
                        <p className="mt-2 text-sm text-red-600">{errors.newPassword.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider mb-2">
                        Confirm Password
                      </label>
                      <input
                        type="password"
                        autoComplete="new-password"
                        disabled={isLoading}
                        {...register("confirmPassword")}
                        className="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-slate-900 focus:border-indigo-400 focus:outline-none focus:ring-4 focus:ring-indigo-100 disabled:opacity-50 transition-all"
                      />
                      {errors.confirmPassword && (
                        <p className="mt-2 text-sm text-red-600">{errors.confirmPassword.message}</p>
                      )}
                    </div>
                  </div>

                  <Button type="submit" disabled={isLoading} variant="gradient" className="w-full sm:w-auto">
                    {isLoading ? "Changing Password..." : "Change Password"}
                  </Button>
                </form>
              </div>
            </div>

            {/* Notification Preferences */}
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-indigo-500/10 rounded-[28px] blur-xl" />
              <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl border border-white/60 shadow-xl p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg">
                    <Bell className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Notifications</h2>
                    <p className="text-sm text-slate-500">Manage email preferences</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-5 rounded-2xl bg-slate-50 border-2 border-slate-100">
                  <div>
                    <p className="font-semibold text-slate-900">Email Notifications</p>
                    <p className="text-sm text-slate-500 mt-1">
                      Receive updates about your conversions and account
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleNotificationToggle}
                    className={`relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                      emailNotifications ? 'bg-gradient-to-r from-indigo-500 to-purple-500' : 'bg-slate-300'
                    }`}
                    role="switch"
                    aria-checked={emailNotifications}
                  >
                    <span
                      className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        emailNotifications ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-red-500/10 via-rose-500/10 to-pink-500/10 rounded-[28px] blur-xl" />
              <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl border-2 border-red-100 shadow-xl p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg">
                    <Trash2 className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Danger Zone</h2>
                    <p className="text-sm text-red-600">Irreversible account actions</p>
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-red-50 border-2 border-red-100">
                  <div className="flex items-start gap-4">
                    <AlertTriangle className="h-6 w-6 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-lg font-bold text-red-900 mb-2">Delete Account</h3>
                      <p className="text-red-700/80 mb-6 text-sm leading-relaxed">
                        Once you delete your account, there is no going back. All your data will be permanently removed from our servers.
                      </p>
                      <Button type="button" onClick={() => setShowDeleteDialog(true)} variant="danger">
                        Delete Account
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white border border-slate-200 p-8 shadow-2xl animate-scale-in">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center mx-auto mb-6 shadow-lg">
              <AlertTriangle className="h-7 w-7 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 text-center mb-2">
              Delete Account?
            </h3>
            <p className="text-slate-500 text-center mb-6">
              This action cannot be undone. Type <span className="font-bold text-red-600">DELETE</span> to confirm.
            </p>
            
            <input
              type="text"
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
              placeholder="Type DELETE"
              className="w-full mb-6 rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-slate-900 focus:border-red-400 focus:outline-none focus:ring-4 focus:ring-red-100 placeholder-slate-400 transition-all"
            />
            
            <div className="flex gap-4">
              <Button
                type="button"
                onClick={() => {
                  setShowDeleteDialog(false)
                  setDeleteConfirmation("")
                }}
                variant="secondary"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deleteConfirmation !== "DELETE" || isLoading}
                variant="danger"
                className="flex-1"
              >
                {isLoading ? "Deleting..." : "Delete Account"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
