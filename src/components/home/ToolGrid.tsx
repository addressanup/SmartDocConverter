'use client'

import Link from 'next/link'
import { useState } from 'react'
import {
  FileText, FileSpreadsheet, Image as ImageIcon,
  Minimize2, Merge, Split, RotateCw, Lock, Unlock,
  Type, ArrowUpRight, Search, Sparkles
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/Input'
import { GradientBadge } from '@/components/ui/Badge'

const tools = [
  {
    id: 'pdf-to-word',
    name: 'PDF to Word',
    description: 'Convert PDF files to editable Word documents',
    icon: FileText,
    category: 'PDF',
    gradient: 'from-blue-500 to-indigo-600',
    shadowColor: 'shadow-blue-500/20',
    popular: true,
  },
  {
    id: 'word-to-pdf',
    name: 'Word to PDF',
    description: 'Transform Word documents into PDF format',
    icon: FileText,
    category: 'PDF',
    gradient: 'from-indigo-500 to-purple-600',
    shadowColor: 'shadow-indigo-500/20',
  },
  {
    id: 'pdf-to-excel',
    name: 'PDF to Excel',
    description: 'Extract tables and data to spreadsheets',
    icon: FileSpreadsheet,
    category: 'PDF',
    gradient: 'from-emerald-500 to-teal-600',
    shadowColor: 'shadow-emerald-500/20',
  },
  {
    id: 'merge-pdf',
    name: 'Merge PDF',
    description: 'Combine multiple PDFs into a single file',
    icon: Merge,
    category: 'PDF',
    gradient: 'from-violet-500 to-purple-600',
    shadowColor: 'shadow-violet-500/20',
    popular: true,
  },
  {
    id: 'split-pdf',
    name: 'Split PDF',
    description: 'Separate pages into individual files',
    icon: Split,
    category: 'PDF',
    gradient: 'from-cyan-500 to-blue-600',
    shadowColor: 'shadow-cyan-500/20',
  },
  {
    id: 'compress-pdf',
    name: 'Compress PDF',
    description: 'Reduce file size without losing quality',
    icon: Minimize2,
    category: 'PDF',
    gradient: 'from-teal-500 to-emerald-600',
    shadowColor: 'shadow-teal-500/20',
    popular: true,
  },
  {
    id: 'jpg-to-pdf',
    name: 'JPG to PDF',
    description: 'Convert images into PDF documents',
    icon: ImageIcon,
    category: 'Image',
    gradient: 'from-pink-500 to-rose-600',
    shadowColor: 'shadow-pink-500/20',
  },
  {
    id: 'pdf-to-jpg',
    name: 'PDF to JPG',
    description: 'Export PDF pages as image files',
    icon: ImageIcon,
    category: 'Image',
    gradient: 'from-rose-500 to-red-600',
    shadowColor: 'shadow-rose-500/20',
  },
  {
    id: 'image-to-text',
    name: 'Image to Text',
    description: 'Extract text from images using OCR',
    icon: Type,
    category: 'OCR',
    gradient: 'from-orange-500 to-amber-600',
    shadowColor: 'shadow-orange-500/20',
  },
  {
    id: 'rotate-pdf',
    name: 'Rotate PDF',
    description: 'Fix page orientation in your PDFs',
    icon: RotateCw,
    category: 'PDF',
    gradient: 'from-amber-500 to-orange-600',
    shadowColor: 'shadow-amber-500/20',
  },
  {
    id: 'protect-pdf',
    name: 'Protect PDF',
    description: 'Add password encryption to files',
    icon: Lock,
    category: 'PDF',
    gradient: 'from-slate-600 to-slate-800',
    shadowColor: 'shadow-slate-500/20',
  },
  {
    id: 'unlock-pdf',
    name: 'Unlock PDF',
    description: 'Remove password from PDF files',
    icon: Unlock,
    category: 'PDF',
    gradient: 'from-red-500 to-rose-600',
    shadowColor: 'shadow-red-500/20',
  },
]

const categories = ['All', 'PDF', 'Image', 'OCR']

export function ToolGrid() {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredTools = tools.filter((tool) => {
    const matchesCategory = selectedCategory === 'All' || tool.category === selectedCategory
    const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <section id="tools" className="py-32 relative overflow-hidden">
      {/* Background - Decorative */}
      <div className="absolute inset-0 bg-white" aria-hidden="true" />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-indigo-50 to-transparent rounded-full blur-3xl" aria-hidden="true" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-purple-50 to-transparent rounded-full blur-3xl" aria-hidden="true" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-14">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-600 rounded-full mb-6 border border-indigo-100">
              <Sparkles className="w-4 h-4" />
              Complete Toolkit
            </div>
            <h2 className="text-slate-900 mb-4">
              All the tools you need,{' '}
              <span className="gradient-text">in one place</span>
            </h2>
            <p className="text-lg text-slate-500">
              A complete suite of document conversion tools, designed for speed and security.
            </p>
          </div>

          {/* Search */}
          <div className="relative lg:w-80">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-2xl blur-xl opacity-0 focus-within:opacity-100 transition-opacity" aria-hidden="true" />
            <div className="relative">
              <label htmlFor="tool-search" className="sr-only">Search tools</label>
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none z-10" />
              <Input
                id="tool-search"
                type="text"
                placeholder="Search tools..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                inputSize="lg"
                className="pl-12 border-2 border-slate-100 rounded-2xl"
              />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-10 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={cn(
                "px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 whitespace-nowrap",
                selectedCategory === category
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/25'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              )}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Tool Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredTools.map((tool, index) => {
            const Icon = tool.icon

            return (
              <Link
                key={tool.id}
                href={`/tools/${tool.id}`}
                className="group relative bg-white rounded-2xl p-6 border border-slate-100 hover:border-transparent hover:shadow-2xl transition-all duration-500 overflow-hidden"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Popular Badge */}
                {tool.popular && (
                  <GradientBadge gradient="warning" size="sm" className="absolute top-4 right-4 uppercase tracking-wider">
                    Popular
                  </GradientBadge>
                )}

                {/* Hover Gradient Background */}
                <div className={cn(
                  "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500",
                  `bg-gradient-to-br ${tool.gradient}`
                )} style={{ opacity: 0 }} />
                <div className="absolute inset-0 bg-gradient-to-br from-slate-50/90 to-white/95 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="relative z-10">
                  {/* Icon */}
                  <div className={cn(
                    "w-14 h-14 rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-lg mb-5 group-hover:scale-110 group-hover:shadow-xl transition-all duration-300",
                    tool.gradient,
                    tool.shadowColor
                  )}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  
                  {/* Content */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {tool.name}
                    </h3>
                    <ArrowUpRight className="w-5 h-5 text-slate-300 opacity-0 group-hover:opacity-100 -translate-x-2 translate-y-2 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-300" />
                  </div>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    {tool.description}
                  </p>
                </div>
              </Link>
            )
          })}
        </div>

        {filteredTools.length === 0 && (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-slate-100 flex items-center justify-center">
              <Search className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-lg font-medium text-slate-400">No tools found matching your search.</p>
            <button
              onClick={() => {
                setSearchQuery('')
                setSelectedCategory('All')
              }}
              className="mt-4 text-indigo-600 font-semibold hover:text-indigo-700 transition-colors"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
