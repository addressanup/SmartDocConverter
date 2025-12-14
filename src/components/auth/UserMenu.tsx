"use client"

import { useState, useRef, useEffect } from "react"
import { signOut } from "next-auth/react"
import { useAuth } from "@/hooks/useAuth"
import Link from "next/link"
import Image from "next/image"
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

    function handleEscapeKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("keydown", handleEscapeKey)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleEscapeKey)
    }
  }, [])

  if (isLoading) {
    return <div className="h-9 w-9 animate-pulse rounded-full bg-slate-100" />
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center gap-3">
        <Link
          href="/login"
          className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
        >
          Sign in
        </Link>
        <Link
          href="/register"
          className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-xl transition-all shadow-sm hover:shadow-md"
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
        id="user-menu-button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        aria-label="User menu"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {user?.image ? (
          <Image
            src={user.image}
            alt={user.name || "User"}
            width={32}
            height={32}
            className="h-8 w-8 rounded-full border border-slate-200"
          />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-[13px] font-semibold text-white">
            {initials}
          </div>
        )}
        <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-56 rounded-xl bg-white border border-slate-200 py-1 shadow-lg animate-scale-in origin-top-right"
          role="menu"
          aria-labelledby="user-menu-button"
          aria-orientation="vertical"
        >
          {/* User Info */}
          <div className="px-4 py-3 border-b border-slate-100">
            <p className="text-sm font-semibold text-slate-900 truncate">
              {user?.name || "User"}
            </p>
            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
          </div>

          {/* Menu Items */}
          <div className="py-1">
            <Link
              href="/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
              role="menuitem"
            >
              <User className="h-4 w-4 text-slate-400" />
              Profile
            </Link>

            <Link
              href="/dashboard"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
              role="menuitem"
            >
              <FileText className="h-4 w-4 text-slate-400" />
              Dashboard
            </Link>

            <Link
              href="/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
              role="menuitem"
            >
              <Settings className="h-4 w-4 text-slate-400" />
              Settings
            </Link>
          </div>

          {/* Sign Out */}
          <div className="border-t border-slate-100 py-1">
            <button
              onClick={() => {
                setIsOpen(false)
                signOut({ callbackUrl: "/" })
              }}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
              role="menuitem"
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
