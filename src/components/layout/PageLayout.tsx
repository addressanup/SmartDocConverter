'use client'

import React from 'react'

interface PageLayoutProps {
  children: React.ReactNode
  title: string
  description: string
  icon?: React.ElementType
}

export function PageLayout({ children, title, description, icon: Icon }: PageLayoutProps) {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Ambient Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-slate-50" />
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-indigo-100/40 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-purple-100/30 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-cyan-50/40 via-transparent to-pink-50/30 rounded-full blur-[80px]" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-30" />
      </div>

      <div className="relative z-10 pt-32 pb-24">
        <div className="max-w-3xl mx-auto px-6">
          
          {/* Header */}
          <div className="text-center mb-12">
            {Icon && (
              <div className="relative inline-block mb-8">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl blur-xl opacity-40" />
                <div className="relative w-20 h-20 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-indigo-500/30">
                  <Icon className="h-10 w-10 text-white" />
                </div>
              </div>
            )}
            
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
              {title}
            </h1>
            <p className="text-lg md:text-xl text-slate-500 max-w-xl mx-auto leading-relaxed">
              {description}
            </p>
          </div>

          {/* Content Card */}
          <div className="relative">
            {/* Card Glow Effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 rounded-[28px] blur-xl" />
            
            {/* Main Card */}
            <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl shadow-slate-900/5 border border-white/60 p-8 md:p-12">
              {children}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
