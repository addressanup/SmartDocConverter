// Middleware disabled temporarily for debugging
// import NextAuth from "next-auth"
// import { authConfig } from "@/lib/auth.config"
// export const { auth: middleware } = NextAuth(authConfig)

import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Allow all requests for now
  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
}
