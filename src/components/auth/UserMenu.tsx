"use client"

import { useState, useRef, useEffect } from "react"
import { signOut } from "next-auth/react"
import { useAuth } from "@/hooks/useAuth"
import Link from "next/link"
import { User, LogOut, Settings, FileText, ChevronDown } from "lucide-react"

export default function UserMenu() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  if (isLoading) {
    return <div className="h-9 w-9 animate-pulse rounded-full bg-zinc-100" />
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center gap-3">
        <Link
          href="/login"
          className="text-[14px] font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
        >
          Sign in
        </Link>
        <Link
          href="/register"
          className="px-4 py-2 text-[14px] font-medium text-white bg-zinc-900 hover:bg-zinc-800 rounded-xl transition-colors shadow-sm"
        >
          Sign up
        </Link>
      </div>
    )
  }

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : user?.email?.[0].toUpperCase() || "U"

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1 rounded-xl hover:bg-zinc-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
        aria-label="User menu"
      >
        {user?.image ? (
          <img
            src={user.image}
            alt={user.name || "User"}
            className="h-8 w-8 rounded-full border border-zinc-200"
          />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-primary-600 text-[13px] font-semibold text-white">
            {initials}
          </div>
        )}
        <ChevronDown className={`h-4 w-4 text-zinc-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white border border-zinc-200 py-1 shadow-elevated animate-scale-in origin-top-right">
          {/* User Info */}
          <div className="px-4 py-3 border-b border-zinc-100">
            <p className="text-[14px] font-semibold text-zinc-900 truncate">
              {user?.name || "User"}
            </p>
            <p className="text-[13px] text-zinc-500 truncate">{user?.email}</p>
          </div>

          {/* Menu Items */}
          <div className="py-1">
            <Link
              href="/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-[14px] text-zinc-700 hover:bg-zinc-50 transition-colors"
            >
              <User className="h-4 w-4 text-zinc-400" />
              Profile
            </Link>

            <Link
              href="/dashboard"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-[14px] text-zinc-700 hover:bg-zinc-50 transition-colors"
            >
              <FileText className="h-4 w-4 text-zinc-400" />
              Dashboard
            </Link>

            <Link
              href="/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-[14px] text-zinc-700 hover:bg-zinc-50 transition-colors"
            >
              <Settings className="h-4 w-4 text-zinc-400" />
              Settings
            </Link>
          </div>

          {/* Sign Out */}
          <div className="border-t border-zinc-100 py-1">
            <button
              onClick={() => {
                setIsOpen(false)
                signOut({ callbackUrl: "/" })
              }}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-[14px] text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
