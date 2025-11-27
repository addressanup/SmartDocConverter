import Link from 'next/link'
import {
  Home,
  FileText,
  Minimize2,
  Merge,
  Image,
  FileSpreadsheet,
  ArrowRight,
  Search,
  HelpCircle,
} from 'lucide-react'

export default function NotFound() {
  const popularTools = [
    {
      id: 'pdf-to-word',
      name: 'PDF to Word',
      description: 'Convert PDF to editable Word documents',
      icon: FileText,
      href: '/tools/pdf-to-word',
    },
    {
      id: 'compress-pdf',
      name: 'Compress PDF',
      description: 'Reduce PDF file size',
      icon: Minimize2,
      href: '/tools/compress-pdf',
    },
    {
      id: 'merge-pdf',
      name: 'Merge PDF',
      description: 'Combine multiple PDFs',
      icon: Merge,
      href: '/tools/merge-pdf',
    },
    {
      id: 'pdf-to-excel',
      name: 'PDF to Excel',
      description: 'Extract tables from PDF',
      icon: FileSpreadsheet,
      href: '/tools/pdf-to-excel',
    },
    {
      id: 'jpg-to-pdf',
      name: 'JPG to PDF',
      description: 'Convert images to PDF',
      icon: Image,
      href: '/tools/jpg-to-pdf',
    },
  ]

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-primary-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Main 404 Message */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-primary-100 rounded-full mb-6">
            <HelpCircle className="h-12 w-12 text-primary-600" />
          </div>

          <h1 className="text-6xl md:text-8xl font-bold text-gray-900 mb-4">404</h1>

          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Page Not Found
          </h2>

          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Oops! The page you're looking for doesn't exist. It might have been moved or deleted.
          </p>

          {/* Primary CTA */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 bg-primary-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-primary-700 transition-colors"
            >
              <Home className="h-5 w-5" />
              Go to Homepage
            </Link>
            <Link
              href="/#tools"
              className="inline-flex items-center justify-center gap-2 bg-white text-primary-600 border-2 border-primary-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-primary-50 transition-colors"
            >
              <Search className="h-5 w-5" />
              Browse All Tools
            </Link>
          </div>
        </div>

        {/* Suggestions Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 md:p-12">
          <div className="text-center mb-8">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
              Here's What You Can Do
            </h3>
            <p className="text-gray-600">
              Try one of our popular document conversion tools
            </p>
          </div>

          {/* Popular Tools Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {popularTools.map((tool) => {
              const Icon = tool.icon
              return (
                <Link
                  key={tool.id}
                  href={tool.href}
                  className="group bg-gray-50 border border-gray-200 rounded-xl p-6 hover:shadow-lg hover:border-primary-300 hover:bg-white transition-all"
                >
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary-200 transition-colors">
                    <Icon className="h-6 w-6 text-primary-600" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    {tool.name}
                  </h4>
                  <p className="text-gray-600 text-sm mb-3">
                    {tool.description}
                  </p>
                  <div className="flex items-center text-primary-600 font-medium text-sm">
                    Try it now
                    <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              )
            })}
          </div>

          {/* Additional Help */}
          <div className="text-center pt-6 border-t border-gray-200">
            <p className="text-gray-600 mb-4">
              Still can't find what you're looking for?
            </p>
            <Link
              href="/#tools"
              className="inline-flex items-center gap-2 text-primary-600 font-semibold hover:text-primary-700 transition-colors"
            >
              View all conversion tools
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
