'use client'

import Link from 'next/link'
import { Cookie, Shield, Settings, Info, CheckCircle, ToggleRight } from 'lucide-react'

export default function CookiesPage() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Ambient Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-amber-50/30" />
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-amber-100/40 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-orange-100/30 rounded-full blur-[100px]" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.35]" />
      </div>

      <div className="relative z-10 pt-28 pb-20">
        <div className="max-w-4xl mx-auto px-6">
          {/* Back Link */}
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 mb-8 transition-colors"
          >
            ← Back to home
          </Link>

          {/* Header */}
          <div className="flex items-start gap-6 mb-10">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-xl shadow-amber-500/25">
              <Cookie className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Cookie Policy
              </h1>
              <p className="text-lg text-slate-500 mt-2">
                How we use cookies to improve your experience
              </p>
            </div>
          </div>

          {/* Last Updated */}
          <div className="bg-slate-50 px-4 py-3 rounded-xl border border-slate-100 text-center mb-10">
            <p className="text-sm text-slate-500 font-medium">
              Last Updated: November 26, 2025
            </p>
          </div>

          <div className="space-y-8">
            {/* Introduction */}
            <div className="bg-white/80 backdrop-blur-xl p-8 rounded-2xl border border-slate-100 shadow-lg">
              <p className="text-slate-600 leading-relaxed mb-5">
                This Cookie Policy explains what cookies are, how SmartDocConverter (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) uses them on our website, and your choices regarding their use.
              </p>
              <div className="flex items-start gap-4 p-5 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-xl">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                  <Info className="w-5 h-5 text-white" />
                </div>
                <p className="text-sm text-slate-700 leading-relaxed">
                  By using our Service, you consent to the use of cookies as described in this policy. You can change your cookie settings at any time in your browser.
                </p>
              </div>
            </div>

            {/* What are Cookies */}
            <div className="bg-white/80 backdrop-blur-xl p-8 rounded-2xl border border-slate-100 shadow-lg">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Cookie className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">What Are Cookies?</h2>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Cookies are small text files that are stored on your computer or mobile device when you visit a website. They allow the website to remember your actions and preferences (such as login, language, font size, and other display preferences) over a period of time, so you don&apos;t have to keep re-entering them whenever you come back to the site or browse from one page to another.
              </p>
            </div>

            {/* Cookie Types Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white/80 backdrop-blur-xl p-6 rounded-2xl border border-slate-100 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Essential Cookies</h3>
                </div>
                <p className="text-sm text-slate-500 mb-5 leading-relaxed">
                  Necessary for the website to function properly. Without these, basic features like page navigation and secure areas cannot work.
                </p>
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-2 rounded-full border border-emerald-200 w-fit">
                  <CheckCircle className="w-3.5 h-3.5" /> Always Active
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-xl p-6 rounded-2xl border border-slate-100 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
                    <Settings className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Preference Cookies</h3>
                </div>
                <p className="text-sm text-slate-500 mb-5 leading-relaxed">
                  Enable the website to remember information that changes the way the website behaves or looks, like your preferred language or region.
                </p>
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-700 bg-indigo-100 px-3 py-2 rounded-full border border-indigo-200 w-fit">
                  <ToggleRight className="w-3.5 h-3.5" /> Optional
                </div>
              </div>
            </div>

            {/* Managing Cookies */}
            <div className="bg-white/80 backdrop-blur-xl p-8 rounded-2xl border border-slate-100 shadow-lg">
              <h2 className="text-2xl font-bold text-slate-900 mb-5">Managing Your Cookies</h2>
              <p className="text-slate-600 mb-8 leading-relaxed">
                Most web browsers allow you to control cookies through their settings preferences. However, if you limit the ability of websites to set cookies, you may worsen your overall user experience, since it will no longer be personalized to you.
              </p>
              
              <div className="space-y-5">
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">How to disable cookies in common browsers</h3>
                <div className="grid md:grid-cols-2 gap-3">
                  {[
                    { name: 'Google Chrome', url: 'https://support.google.com/chrome/answer/95647' },
                    { name: 'Safari', url: 'https://support.apple.com/en-us/HT201265' },
                    { name: 'Mozilla Firefox', url: 'https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop' },
                    { name: 'Microsoft Edge', url: 'https://support.microsoft.com/en-us/microsoft-edge/delete-and-manage-cookies-168dab11-0753-043d-7c16-ede5947fc64d' },
                  ].map((browser, i) => (
                    <a 
                      key={i}
                      href={browser.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-4 rounded-xl bg-slate-50 border-2 border-slate-100 hover:border-indigo-200 hover:bg-indigo-50 transition-all group"
                    >
                      <span className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">{browser.name}</span>
                      <span className="text-slate-400 ml-2">→</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Contact */}
            <div className="bg-gradient-to-r from-slate-50 to-slate-100 p-8 rounded-2xl border border-slate-200 text-center">
              <h2 className="text-xl font-bold text-slate-900 mb-3">Questions about our Cookie Policy?</h2>
              <p className="text-slate-500 mb-6">
                If you have any questions or concerns about our use of cookies, please contact our privacy team.
              </p>
              <Link 
                href="mailto:privacy@smartdocconverter.com"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 transition-colors shadow-lg"
              >
                Contact Privacy Team
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
