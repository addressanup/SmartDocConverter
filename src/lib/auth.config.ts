import type { NextAuthConfig } from "next-auth"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"

// This config is used by middleware (Edge runtime compatible - no Prisma)
export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      // Authorize is handled in auth.ts with Prisma
      authorize: async () => null,
    }),
  ],
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
