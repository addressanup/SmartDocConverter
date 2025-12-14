"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import Link from "next/link"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type RegisterFormData = z.infer<typeof registerSchema>

export default function RegisterForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true)
    setError(null)

    try {
      // Register the user
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || "Failed to create account")
        return
      }

      // Automatically sign in after successful registration
      const signInResult = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (signInResult?.error) {
        setError("Account created but failed to sign in. Please try logging in.")
        return
      }

      router.push("/")
      router.refresh()
    } catch {
      setError("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    setError(null)

    try {
      await signIn("google", {
        callbackUrl: "/",
      })
    } catch {
      setError("Failed to sign in with Google")
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md space-y-6 animate-fade-in">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Create an account</h1>
        <p className="mt-2 text-sm text-slate-600">
          Get started with SmartDocConverter
        </p>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700 border border-red-100" role="alert">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-slate-700"
          >
            Full Name
          </label>
          <Input
            id="name"
            type="text"
            autoComplete="name"
            disabled={isLoading}
            aria-describedby={errors.name ? "name-error" : undefined}
            aria-invalid={!!errors.name}
            error={!!errors.name}
            className="mt-1"
            {...register("name")}
          />
          {errors.name && (
            <p id="name-error" className="mt-1 text-sm text-red-600" role="alert">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-slate-700"
          >
            Email
          </label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            disabled={isLoading}
            aria-describedby={errors.email ? "email-error" : undefined}
            aria-invalid={!!errors.email}
            error={!!errors.email}
            className="mt-1"
            {...register("email")}
          />
          {errors.email && (
            <p id="email-error" className="mt-1 text-sm text-red-600" role="alert">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-slate-700"
          >
            Password
          </label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            disabled={isLoading}
            aria-describedby={errors.password ? "password-error" : undefined}
            aria-invalid={!!errors.password}
            error={!!errors.password}
            className="mt-1"
            {...register("password")}
          />
          {errors.password && (
            <p id="password-error" className="mt-1 text-sm text-red-600" role="alert">
              {errors.password.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-slate-700"
          >
            Confirm Password
          </label>
          <Input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            disabled={isLoading}
            aria-describedby={errors.confirmPassword ? "confirmPassword-error" : undefined}
            aria-invalid={!!errors.confirmPassword}
            error={!!errors.confirmPassword}
            className="mt-1"
            {...register("confirmPassword")}
          />
          {errors.confirmPassword && (
            <p id="confirmPassword-error" className="mt-1 text-sm text-red-600" role="alert">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          variant="gradient"
          size="lg"
          isLoading={isLoading}
          className="w-full"
        >
          Create account
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white px-2 text-slate-500">Or continue with</span>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        size="lg"
        onClick={handleGoogleSignIn}
        disabled={isLoading}
        className="w-full"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        Sign up with Google
      </Button>

      <p className="text-center text-sm text-slate-600">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
        >
          Sign in
        </Link>
      </p>
    </div>
  )
}
