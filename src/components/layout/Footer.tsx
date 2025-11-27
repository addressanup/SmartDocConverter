import Link from 'next/link'
import { FileText } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <FileText className="h-8 w-8 text-primary-400" />
              <span className="text-xl font-bold">SmartDocConverter</span>
            </Link>
            <p className="mt-4 text-gray-400 text-sm">
              Free online document conversion tools. Fast, secure, and easy to use.
            </p>
          </div>

          {/* PDF Tools */}
          <div>
            <h3 className="font-semibold mb-4">PDF Tools</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><Link href="/tools/pdf-to-word" className="hover:text-white">PDF to Word</Link></li>
              <li><Link href="/tools/word-to-pdf" className="hover:text-white">Word to PDF</Link></li>
              <li><Link href="/tools/pdf-to-excel" className="hover:text-white">PDF to Excel</Link></li>
              <li><Link href="/tools/compress-pdf" className="hover:text-white">Compress PDF</Link></li>
              <li><Link href="/tools/merge-pdf" className="hover:text-white">Merge PDF</Link></li>
              <li><Link href="/tools/split-pdf" className="hover:text-white">Split PDF</Link></li>
            </ul>
          </div>

          {/* Image Tools */}
          <div>
            <h3 className="font-semibold mb-4">Image Tools</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><Link href="/tools/jpg-to-pdf" className="hover:text-white">JPG to PDF</Link></li>
              <li><Link href="/tools/pdf-to-jpg" className="hover:text-white">PDF to JPG</Link></li>
              <li><Link href="/tools/image-to-text" className="hover:text-white">Image to Text (OCR)</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><Link href="/pricing" className="hover:text-white">Pricing</Link></li>
              <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white">Terms of Service</Link></li>
              <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} SmartDocConverter. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
