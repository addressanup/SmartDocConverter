'use client'

import Link from 'next/link'
import { useState } from 'react'
import {
  FileText, FileSpreadsheet, Image, FileType,
  Minimize2, Merge, Split, RotateCw, Lock, Unlock,
  Type, ScanLine
} from 'lucide-react'

const tools = [
  {
    id: 'pdf-to-word',
    name: 'PDF to Word',
    description: 'Convert PDF to editable Word documents',
    icon: FileText,
    category: 'PDF',
    popular: true,
  },
  {
    id: 'word-to-pdf',
    name: 'Word to PDF',
    description: 'Convert Word documents to PDF format',
    icon: FileText,
    category: 'PDF',
    popular: true,
  },
  {
    id: 'pdf-to-excel',
    name: 'PDF to Excel',
    description: 'Extract tables from PDF to Excel',
    icon: FileSpreadsheet,
    category: 'PDF',
    popular: true,
  },
  {
    id: 'compress-pdf',
    name: 'Compress PDF',
    description: 'Reduce PDF file size while maintaining quality',
    icon: Minimize2,
    category: 'PDF',
    popular: true,
  },
  {
    id: 'merge-pdf',
    name: 'Merge PDF',
    description: 'Combine multiple PDFs into one document',
    icon: Merge,
    category: 'PDF',
    popular: true,
  },
  {
    id: 'split-pdf',
    name: 'Split PDF',
    description: 'Split a PDF into multiple documents',
    icon: Split,
    category: 'PDF',
    popular: false,
  },
  {
    id: 'jpg-to-pdf',
    name: 'JPG to PDF',
    description: 'Convert images to PDF documents',
    icon: Image,
    category: 'Image',
    popular: true,
  },
  {
    id: 'pdf-to-jpg',
    name: 'PDF to JPG',
    description: 'Convert PDF pages to JPG images',
    icon: Image,
    category: 'Image',
    popular: true,
  },
  {
    id: 'image-to-text',
    name: 'Image to Text',
    description: 'Extract text from images using OCR',
    icon: Type,
    category: 'OCR',
    popular: true,
  },
  {
    id: 'rotate-pdf',
    name: 'Rotate PDF',
    description: 'Rotate PDF pages in any direction',
    icon: RotateCw,
    category: 'PDF',
    popular: false,
  },
  {
    id: 'unlock-pdf',
    name: 'Unlock PDF',
    description: 'Remove password from PDF files',
    icon: Unlock,
    category: 'PDF',
    popular: false,
  },
  {
    id: 'protect-pdf',
    name: 'Protect PDF',
    description: 'Add password protection to PDF',
    icon: Lock,
    category: 'PDF',
    popular: false,
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
    <section id="tools" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">All Document Tools</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Choose from our comprehensive collection of document conversion and manipulation tools
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-8">
          <div className="flex gap-2 flex-wrap justify-center">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
          <input
            type="text"
            placeholder="Search tools..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 w-full sm:w-64"
          />
        </div>

        {/* Tool Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTools.map((tool) => {
            const Icon = tool.icon
            return (
              <Link
                key={tool.id}
                href={`/tools/${tool.id}`}
                className="group relative bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg hover:border-primary-300 transition-all"
              >
                {tool.popular && (
                  <span className="absolute top-4 right-4 bg-primary-100 text-primary-600 text-xs font-medium px-2 py-1 rounded">
                    Popular
                  </span>
                )}
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary-200 transition-colors">
                  <Icon className="h-6 w-6 text-primary-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{tool.name}</h3>
                <p className="text-gray-600 text-sm">{tool.description}</p>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
