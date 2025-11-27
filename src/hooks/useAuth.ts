"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export interface User {
  id: string
  name: string | null
  email: string | null
  image: string | null
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}

/**
 * Custom hook for managing authentication state
 *
 * @returns AuthState object with user, isAuthenticated, and isLoading
 */
export function useAuth(): AuthState {
  const { data: session, status } = useSession()

  const isLoading = status === "loading"
  const isAuthenticated = status === "authenticated" && !!session?.user

  return {
    user: session?.user as User | null,
    isAuthenticated,
    isLoading,
  }
}

/**
 * Hook to protect routes that require authentication
 * Redirects to login page if user is not authenticated
 *
 * @param redirectTo - The URL to redirect to after login (optional)
 */
export function useRequireAuth(redirectTo: string = "/login") {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(redirectTo)
    }
  }, [isAuthenticated, isLoading, router, redirectTo])

  return { isAuthenticated, isLoading }
}

/**
 * Hook to redirect authenticated users away from auth pages
 * Useful for login/register pages
 *
 * @param redirectTo - The URL to redirect authenticated users to (default: "/")
 */
export function useRedirectIfAuthenticated(redirectTo: string = "/") {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push(redirectTo)
    }
  }, [isAuthenticated, isLoading, router, redirectTo])

  return { isAuthenticated, isLoading }
}
