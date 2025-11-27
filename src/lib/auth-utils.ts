import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

/**
 * Get the current session from the server
 * Use this in Server Components and API Routes
 */
export async function getSession() {
  return await auth()
}

/**
 * Get the current user from the server session
 * Returns null if not authenticated
 */
export async function getCurrentUser() {
  const session = await getSession()
  return session?.user || null
}

/**
 * Require authentication for server components
 * Redirects to login page if not authenticated
 */
export async function requireAuth() {
  const session = await getSession()

  if (!session || !session.user) {
    redirect("/login")
  }

  return session
}

/**
 * Check if user is authenticated
 * Returns boolean without redirecting
 */
export async function isAuthenticated() {
  const session = await getSession()
  return !!session?.user
}
