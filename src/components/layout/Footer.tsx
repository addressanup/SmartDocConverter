'use client'

import Link from 'next/link'
import { FileText, ArrowUpRight, Heart } from 'lucide-react'

const footerLinks = {
  product: [
    { label: 'All Tools', href: '/#tools' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'API Access', href: '/api-access' },
    { label: 'System Status', href: '/status' },
  ],
  tools: [
    { label: 'PDF to Word', href: '/tools/pdf-to-word' },
    { label: 'Merge PDF', href: '/tools/merge-pdf' },
    { label: 'Compress PDF', href: '/tools/compress-pdf' },
    { label: 'Image to Text', href: '/tools/image-to-text' },
  ],
  legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Cookie Policy', href: '/cookies' },
  ],
}

export function Footer() {
  return (
    <footer className="relative overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />

      <div className="relative z-10">
        {/* Main Footer */}
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
            {/* Brand */}
            <div className="md:col-span-4">
              <Link href="/" className="inline-flex items-center gap-3 group mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
                  <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div>
                  <span className="text-xl font-bold text-white">SmartDoc</span>
                  <span className="block text-xs font-medium text-indigo-400 -mt-0.5">Converter</span>
                </div>
              </Link>
              <p className="text-base text-slate-400 leading-relaxed max-w-sm mb-8">
                The modern document conversion platform. Fast, secure, and designed for professionals who value their time.
              </p>
              
              {/* Newsletter */}
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                />
                <button className="px-5 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm font-semibold rounded-xl hover:shadow-lg hover:shadow-indigo-500/25 transition-all">
                  Subscribe
                </button>
              </div>
            </div>

            {/* Links */}
            <div className="md:col-span-2 md:col-start-6">
              <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-6">
                Product
              </h4>
              <ul className="space-y-4">
                {footerLinks.product.map((link) => (
                  <li key={link.href}>
                    <Link 
                      href={link.href} 
                      className="group inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
                    >
                      {link.label}
                      <ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-1 translate-y-1 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 transition-all" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="md:col-span-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-6">
                Tools
              </h4>
              <ul className="space-y-4">
                {footerLinks.tools.map((link) => (
                  <li key={link.href}>
                    <Link 
                      href={link.href} 
                      className="group inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
                    >
                      {link.label}
                      <ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-1 translate-y-1 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 transition-all" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="md:col-span-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-6">
                Legal
              </h4>
              <ul className="space-y-4">
                {footerLinks.legal.map((link) => (
                  <li key={link.href}>
                    <Link 
                      href={link.href} 
                      className="group inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
                    >
                      {link.label}
                      <ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-1 translate-y-1 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 transition-all" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-8" />

          {/* Bottom */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-slate-500">
              &copy; {new Date().getFullYear()} SmartDocConverter. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                </div>
                <span className="text-sm text-slate-500">All systems operational</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-slate-500">
                <span>Made with</span>
                <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />
                <span>for productivity</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
