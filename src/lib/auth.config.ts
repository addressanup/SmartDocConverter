import type { NextAuthConfig } from "next-auth"

// Lightweight config for middleware (Edge runtime compatible - no Prisma, no providers)
export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [], // Providers are added in auth.ts
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const { pathname } = nextUrl

      // Define public paths
      const publicPaths = [
        "/",
        "/login",
        "/register",
        "/forgot-password",
        "/tools",
        "/pricing",
        "/contact",
        "/terms",
        "/privacy",
      ]

      // Check if path is public
      const isPublicPath = publicPaths.some((path) => {
        if (path === "/") return pathname === path
        return pathname.startsWith(path)
      })

      // Allow API routes and static files
      if (
        pathname.startsWith("/api") ||
        pathname.startsWith("/_next") ||
        pathname.includes(".")
      ) {
        return true
      }

      // Allow public paths
      if (isPublicPath) {
        return true
      }

      // Require auth for protected paths
      return isLoggedIn
    },
  },
}
