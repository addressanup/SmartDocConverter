import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { pathname } = req.nextUrl

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
    return NextResponse.next()
  }

  // Allow public paths
  if (isPublicPath) {
    return NextResponse.next()
  }

  // Require auth for protected paths
  if (!req.auth) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
