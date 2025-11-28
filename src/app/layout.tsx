import type { Metadata } from 'next'
import { Inter, Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import SessionProvider from '@/components/providers/SessionProvider'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const jakarta = Plus_Jakarta_Sans({ 
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
})

export const metadata: Metadata = {
  title: 'SmartDocConverter - Free Online Document Conversion Tools',
  description: 'Convert PDF to Word, Excel, JPG and more. Free online document conversion tools with no registration required. Fast, secure, and easy to use.',
  keywords: ['pdf to word', 'convert pdf', 'pdf converter', 'document conversion', 'free pdf tools'],
  openGraph: {
    title: 'SmartDocConverter - Free Online Document Conversion Tools',
    description: 'Convert PDF to Word, Excel, JPG and more. Free online document conversion tools.',
    url: 'https://smartdocconverter.com',
    siteName: 'SmartDocConverter',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jakarta.variable}`}>
      <body className={`${inter.className} antialiased`}>
        <SessionProvider>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
        </SessionProvider>
      </body>
    </html>
  )
}
