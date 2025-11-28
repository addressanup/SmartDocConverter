import NextAuth from "next-auth"
import { authConfig } from "@/lib/auth.config"

// Use lightweight auth config for middleware (Edge compatible - no Prisma)
export const { auth: middleware } = NextAuth(authConfig)

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
}
