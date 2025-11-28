'use client'

import Link from 'next/link'
import { FileText, Menu, X, ChevronRight, Sparkles } from 'lucide-react'
import { useState, useEffect } from 'react'
import UserMenu from '@/components/auth/UserMenu'

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { href: '/tools/pdf-to-word', label: 'PDF to Word' },
    { href: '/tools/compress-pdf', label: 'Compress' },
    { href: '/tools/merge-pdf', label: 'Merge' },
    { href: '/#tools', label: 'All Tools' },
  ]

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled 
          ? 'py-2' 
          : 'py-4'
      }`}
    >
      <div className={`mx-4 md:mx-6 lg:mx-8 transition-all duration-500 ${
        scrolled 
          ? 'glass rounded-2xl shadow-lg border border-white/20' 
          : ''
      }`}>
        <nav className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="flex justify-between items-center h-14">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
                <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                  <FileText className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold text-slate-900 tracking-tight">SmartDoc</span>
                <span className="text-[10px] font-medium text-indigo-500 -mt-1 tracking-wider uppercase">Converter</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center">
              <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100/80">
                {navLinks.map((link) => (
                  <Link 
                    key={link.href}
                    href={link.href} 
                    className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 rounded-lg hover:bg-white hover:shadow-sm transition-all duration-200"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Right Side */}
            <div className="hidden md:flex items-center gap-3">
              <Link
                href="/pricing"
                className="group flex items-center gap-2 px-4 py-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700 rounded-xl hover:bg-indigo-50 transition-all duration-200"
              >
                <Sparkles className="w-4 h-4 group-hover:animate-bounce-subtle" />
                Pricing
              </Link>
              <div className="w-px h-6 bg-slate-200" />
              <UserMenu />
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden relative p-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all duration-200"
              aria-label="Toggle menu"
            >
              <span className={`absolute inset-0 rounded-xl transition-colors duration-200 ${mobileMenuOpen ? 'bg-slate-100' : ''}`} />
              <span className="relative">
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </span>
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden absolute top-full left-4 right-4 mt-2 glass rounded-2xl shadow-2xl border border-white/30 animate-slide-down overflow-hidden">
              <div className="p-4 space-y-1">
                {navLinks.map((link, index) => (
                  <Link 
                    key={link.href}
                    href={link.href} 
                    className="flex items-center justify-between px-4 py-3.5 text-[15px] font-medium text-slate-700 hover:text-slate-900 hover:bg-white/60 rounded-xl transition-all duration-200"
                    onClick={() => setMobileMenuOpen(false)}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {link.label}
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  </Link>
                ))}
                <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent my-3" />
                <Link
                  href="/pricing"
                  className="flex items-center justify-center gap-2 px-4 py-3.5 text-[15px] font-semibold text-white bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Sparkles className="w-4 h-4" />
                  View Pricing
                </Link>
                <div className="flex justify-center pt-3 pb-1">
                  <UserMenu />
                </div>
              </div>
            </div>
          )}
        </nav>
      </div>
    </header>
  )
}
