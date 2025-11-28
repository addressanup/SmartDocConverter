'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowLeft, Info, Clock, Shield, Zap } from 'lucide-react'

interface PageLayoutProps {
  children: React.ReactNode
  title: string
  description: string
  icon?: React.ElementType
  accentColor?: 'indigo' | 'emerald' | 'violet' | 'rose' | 'amber' | 'cyan' | 'slate'
  showBackLink?: boolean
  supportedFormats?: string[]
  maxFileSize?: string
  estimatedTime?: string
}

const accentColors = {
  indigo: {
    gradient: 'from-indigo-500 via-purple-500 to-pink-500',
    glow: 'from-indigo-500/20 via-purple-500/15 to-pink-500/10',
    bg: 'bg-indigo-100/40',
    bgAlt: 'bg-purple-100/30',
    text: 'text-indigo-600',
    border: 'border-indigo-200',
    lightBg: 'from-indigo-50 to-purple-50',
  },
  emerald: {
    gradient: 'from-emerald-500 via-teal-500 to-cyan-500',
    glow: 'from-emerald-500/20 via-teal-500/15 to-cyan-500/10',
    bg: 'bg-emerald-100/40',
    bgAlt: 'bg-teal-100/30',
    text: 'text-emerald-600',
    border: 'border-emerald-200',
    lightBg: 'from-emerald-50 to-teal-50',
  },
  violet: {
    gradient: 'from-violet-500 via-purple-500 to-fuchsia-500',
    glow: 'from-violet-500/20 via-purple-500/15 to-fuchsia-500/10',
    bg: 'bg-violet-100/40',
    bgAlt: 'bg-purple-100/30',
    text: 'text-violet-600',
    border: 'border-violet-200',
    lightBg: 'from-violet-50 to-purple-50',
  },
  rose: {
    gradient: 'from-rose-500 via-pink-500 to-red-500',
    glow: 'from-rose-500/20 via-pink-500/15 to-red-500/10',
    bg: 'bg-rose-100/40',
    bgAlt: 'bg-pink-100/30',
    text: 'text-rose-600',
    border: 'border-rose-200',
    lightBg: 'from-rose-50 to-pink-50',
  },
  amber: {
    gradient: 'from-amber-500 via-orange-500 to-red-500',
    glow: 'from-amber-500/20 via-orange-500/15 to-red-500/10',
    bg: 'bg-amber-100/40',
    bgAlt: 'bg-orange-100/30',
    text: 'text-amber-600',
    border: 'border-amber-200',
    lightBg: 'from-amber-50 to-orange-50',
  },
  cyan: {
    gradient: 'from-cyan-500 via-blue-500 to-indigo-500',
    glow: 'from-cyan-500/20 via-blue-500/15 to-indigo-500/10',
    bg: 'bg-cyan-100/40',
    bgAlt: 'bg-blue-100/30',
    text: 'text-cyan-600',
    border: 'border-cyan-200',
    lightBg: 'from-cyan-50 to-blue-50',
  },
  slate: {
    gradient: 'from-slate-600 via-slate-700 to-slate-800',
    glow: 'from-slate-500/20 via-slate-600/15 to-slate-700/10',
    bg: 'bg-slate-100/40',
    bgAlt: 'bg-slate-100/30',
    text: 'text-slate-600',
    border: 'border-slate-200',
    lightBg: 'from-slate-50 to-slate-100',
  },
}

export function PageLayout({ 
  children, 
  title, 
  description, 
  icon: Icon,
  accentColor = 'indigo',
  showBackLink = true,
  supportedFormats,
  maxFileSize,
  estimatedTime,
}: PageLayoutProps) {
  const colors = accentColors[accentColor]
  const showSidebar = supportedFormats || maxFileSize || estimatedTime

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Ambient Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-slate-50" />
        <div className={`absolute top-0 right-1/4 w-[600px] h-[600px] ${colors.bg} rounded-full blur-[120px]`} />
        <div className={`absolute bottom-0 left-1/4 w-[500px] h-[500px] ${colors.bgAlt} rounded-full blur-[100px]`} />
        <div className="absolute top-1/3 right-0 w-[400px] h-[400px] bg-gradient-to-br from-cyan-50/40 via-transparent to-pink-50/30 rounded-full blur-[80px]" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.35]" />
      </div>

      <div className="relative z-10 pt-28 pb-20">
        <div className="max-w-6xl mx-auto px-6">
          {/* Back Link */}
          {showBackLink && (
            <Link 
              href="/#tools" 
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 mb-8 transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to all tools
            </Link>
          )}

          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8 mb-10">
            <div className="flex items-start gap-6">
              {Icon && (
                <div className="relative flex-shrink-0 hidden sm:block">
                  <div className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} rounded-3xl blur-xl opacity-40`} />
                  <div className={`relative w-20 h-20 bg-gradient-to-br ${colors.gradient} rounded-3xl flex items-center justify-center shadow-2xl`}>
                    <Icon className="h-10 w-10 text-white" />
                  </div>
                </div>
              )}
              <div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
                  {title}
                </h1>
                <p className="text-lg text-slate-500 mt-3 max-w-xl leading-relaxed">
                  {description}
                </p>
              </div>
            </div>

            {/* Quick Info Pills */}
            {showSidebar && (
              <div className="flex flex-wrap lg:flex-col gap-3 lg:min-w-[200px]">
                {maxFileSize && (
                  <div className={`inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-gradient-to-r ${colors.lightBg} border ${colors.border}`}>
                    <Info className={`w-4 h-4 ${colors.text}`} />
                    <span className="text-sm font-medium text-slate-700">Max {maxFileSize}</span>
                  </div>
                )}
                {estimatedTime && (
                  <div className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span className="text-sm font-medium text-slate-700">{estimatedTime}</span>
                  </div>
                )}
                {supportedFormats && (
                  <div className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200">
                    <Shield className="w-4 h-4 text-emerald-600" />
                    <span className="text-sm font-medium text-slate-700">{supportedFormats.join(', ')}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Converter Card */}
            <div className="lg:col-span-8">
              <div className="relative">
                <div className={`absolute -inset-1 bg-gradient-to-r ${colors.glow} rounded-[28px] blur-xl`} />
                <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl shadow-slate-900/5 border border-white/60 p-6 sm:p-8 lg:p-10">
                  {children}
                </div>
              </div>
            </div>

            {/* Sidebar - How it works */}
            <div className="lg:col-span-4 space-y-6">
              {/* How it works */}
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-slate-100 shadow-lg p-6">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-5 flex items-center gap-2">
                  <Zap className={`w-4 h-4 ${colors.text}`} />
                  How it works
                </h3>
                <div className="space-y-4">
                  {[
                    { step: '1', title: 'Upload', desc: 'Drop or select your file' },
                    { step: '2', title: 'Convert', desc: 'We process it instantly' },
                    { step: '3', title: 'Download', desc: 'Get your converted file' },
                  ].map((item, index) => (
                    <div key={item.step} className="flex items-start gap-4">
                      <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${colors.gradient} flex items-center justify-center flex-shrink-0 shadow-md`}>
                        <span className="text-sm font-bold text-white">{item.step}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 text-sm">{item.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Security Notice */}
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100 p-6">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-emerald-900 text-sm">Your files are safe</h4>
                    <p className="text-xs text-emerald-700/80 mt-1 leading-relaxed">
                      All files are encrypted and automatically deleted after 1 hour. We never store or access your data.
                    </p>
                  </div>
                </div>
              </div>

              {/* Pro Tip */}
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-100 p-6">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                    <span className="text-lg">💡</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-amber-900 text-sm">Pro tip</h4>
                    <p className="text-xs text-amber-700/80 mt-1 leading-relaxed">
                      For best results, ensure your files are not password-protected before uploading.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
