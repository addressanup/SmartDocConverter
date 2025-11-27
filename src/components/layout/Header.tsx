'use client'

import Link from 'next/link'
import { FileText, Menu, X } from 'lucide-react'
import { useState } from 'react'
import UserMenu from '@/components/auth/UserMenu'

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <FileText className="h-8 w-8 text-primary-600" />
              <span className="text-xl font-bold text-gray-900">SmartDocConverter</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/tools/pdf-to-word" className="text-gray-600 hover:text-gray-900">
              PDF to Word
            </Link>
            <Link href="/tools/compress-pdf" className="text-gray-600 hover:text-gray-900">
              Compress PDF
            </Link>
            <Link href="/tools/merge-pdf" className="text-gray-600 hover:text-gray-900">
              Merge PDF
            </Link>
            <Link href="/#tools" className="text-gray-600 hover:text-gray-900">
              All Tools
            </Link>
            <Link
              href="/pricing"
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
            >
              Go Premium
            </Link>
            <UserMenu />
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-600 hover:text-gray-900"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col gap-4">
              <Link href="/tools/pdf-to-word" className="text-gray-600 hover:text-gray-900">
                PDF to Word
              </Link>
              <Link href="/tools/compress-pdf" className="text-gray-600 hover:text-gray-900">
                Compress PDF
              </Link>
              <Link href="/tools/merge-pdf" className="text-gray-600 hover:text-gray-900">
                Merge PDF
              </Link>
              <Link href="/#tools" className="text-gray-600 hover:text-gray-900">
                All Tools
              </Link>
              <Link
                href="/pricing"
                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors text-center"
              >
                Go Premium
              </Link>
              <div className="pt-2 border-t border-gray-200">
                <UserMenu />
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
