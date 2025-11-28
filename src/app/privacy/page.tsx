'use client'

import Link from 'next/link'
import { Shield, Lock, Eye, FileText, Clock, Mail, Users, Database } from 'lucide-react'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-emerald-50/30" />
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-emerald-100/40 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-teal-100/30 rounded-full blur-[100px]" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-30" />
      </div>

      <div className="relative z-10 pt-32 pb-24">
        <div className="max-w-4xl mx-auto px-6">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl blur-xl opacity-40" />
              <div className="relative w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl flex items-center justify-center shadow-2xl">
                <Shield className="h-10 w-10 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4">Privacy Policy</h1>
            <p className="text-xl text-slate-500 max-w-2xl mx-auto">
              Your privacy and data security are our top priorities. Learn how we protect your information.
            </p>
          </div>

          {/* Last Updated */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-full text-sm font-medium">
              <Clock className="w-4 h-4" />
              Last Updated: November 26, 2025
            </div>
          </div>

          <div className="space-y-8">
            {/* Introduction */}
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 rounded-[28px] blur-xl" />
              <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl border border-white/60 shadow-xl p-8">
                <p className="text-slate-600 leading-relaxed text-lg">
                  Welcome to SmartDocConverter. This Privacy Policy explains how we collect, use, disclose,
                  and safeguard your information when you use our document conversion services. Please read
                  this privacy policy carefully.
                </p>
              </div>
            </div>

            {/* Data Collection */}
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 rounded-[28px] blur-xl" />
              <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl border border-white/60 shadow-xl p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                    <Eye className="h-7 w-7 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">Information We Collect</h2>
                </div>

                <h3 className="text-lg font-bold text-slate-900 mt-6 mb-3">Personal Information</h3>
                <p className="text-slate-600 mb-3">When you create an account or use our services, we may collect:</p>
                <ul className="list-disc list-inside text-slate-600 space-y-2 ml-4">
                  <li>Email address (for account creation and communication)</li>
                  <li>Name (optional, for personalization)</li>
                  <li>Payment information (processed securely through Stripe)</li>
                  <li>Login credentials (encrypted and securely stored)</li>
                </ul>

                <h3 className="text-lg font-bold text-slate-900 mt-6 mb-3">Usage Information</h3>
                <p className="text-slate-600 mb-3">We automatically collect certain information when you use our services:</p>
                <ul className="list-disc list-inside text-slate-600 space-y-2 ml-4">
                  <li>Browser type and version</li>
                  <li>Operating system</li>
                  <li>IP address (for security and rate limiting)</li>
                  <li>Pages visited and features used</li>
                  <li>Conversion history and usage statistics</li>
                </ul>
              </div>
            </div>

            {/* File Processing */}
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/10 via-green-500/10 to-teal-500/10 rounded-[28px] blur-xl" />
              <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl border border-white/60 shadow-xl p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
                    <FileText className="h-7 w-7 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">File Processing & Storage</h2>
                </div>

                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-2xl p-6 mb-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                      <Clock className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-bold text-emerald-900 mb-1">Automatic File Deletion</p>
                      <p className="text-sm text-emerald-700">
                        All uploaded files are automatically and permanently deleted from our servers
                        within 1 hour after processing. This ensures your documents remain private and secure.
                      </p>
                    </div>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-slate-900 mt-6 mb-3">How We Process Your Files</h3>
                <ul className="list-disc list-inside text-slate-600 space-y-2 ml-4">
                  <li>Files are encrypted during upload and transmission (HTTPS/TLS)</li>
                  <li>Processing happens in secure, isolated environments</li>
                  <li>Files are stored temporarily in encrypted cloud storage</li>
                  <li>Converted files are deleted immediately after download or within 1 hour</li>
                  <li>We never share, sell, or distribute your files to third parties</li>
                </ul>
              </div>
            </div>

            {/* Cookies */}
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-violet-500/10 rounded-[28px] blur-xl" />
              <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl border border-white/60 shadow-xl p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                    <Lock className="h-7 w-7 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">Cookies and Tracking</h2>
                </div>

                <p className="text-slate-600 mb-4">
                  We use cookies and similar tracking technologies to enhance your experience:
                </p>

                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-slate-50 border-2 border-slate-100">
                    <h3 className="font-bold text-slate-900 mb-2">Essential Cookies</h3>
                    <p className="text-sm text-slate-600">Session cookies for authentication, preferences, and security.</p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 border-2 border-slate-100">
                    <h3 className="font-bold text-slate-900 mb-2">Analytics Cookies</h3>
                    <p className="text-sm text-slate-600">Google Analytics for usage statistics and service improvements.</p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 border-2 border-slate-100">
                    <h3 className="font-bold text-slate-900 mb-2">Advertising (Free Tier Only)</h3>
                    <p className="text-sm text-slate-600">Premium subscribers do not see ads or advertising cookies.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Third Parties */}
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-rose-500/10 rounded-[28px] blur-xl" />
              <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl border border-white/60 shadow-xl p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg">
                    <Users className="h-7 w-7 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">Third-Party Services</h2>
                </div>

                <div className="space-y-4">
                  <div className="p-5 rounded-2xl border-l-4 border-indigo-500 bg-indigo-50">
                    <h3 className="font-bold text-slate-900 mb-2">Stripe (Payments)</h3>
                    <p className="text-sm text-slate-600">
                      All payments are processed securely through Stripe. We do not store credit card information.
                    </p>
                  </div>
                  <div className="p-5 rounded-2xl border-l-4 border-red-500 bg-red-50">
                    <h3 className="font-bold text-slate-900 mb-2">Google Services</h3>
                    <p className="text-sm text-slate-600">
                      We use Google OAuth for authentication and Google Analytics for service improvement.
                    </p>
                  </div>
                  <div className="p-5 rounded-2xl border-l-4 border-amber-500 bg-amber-50">
                    <h3 className="font-bold text-slate-900 mb-2">Cloud Infrastructure</h3>
                    <p className="text-sm text-slate-600">
                      Hosted on Vercel and AWS with industry-standard security measures.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Data Security */}
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-red-500/10 via-orange-500/10 to-amber-500/10 rounded-[28px] blur-xl" />
              <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl border border-white/60 shadow-xl p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center shadow-lg">
                    <Database className="h-7 w-7 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">Data Security</h2>
                </div>

                <p className="text-slate-600 mb-4">
                  We implement comprehensive security measures to protect your information:
                </p>

                <ul className="list-disc list-inside text-slate-600 space-y-2 ml-4">
                  <li>End-to-end encryption (HTTPS/TLS) for all data transmission</li>
                  <li>Secure, encrypted storage for temporary file processing</li>
                  <li>Regular security audits and vulnerability assessments</li>
                  <li>Access controls and authentication for all systems</li>
                  <li>Automated file deletion within 1 hour of processing</li>
                  <li>Industry-standard password hashing (bcrypt)</li>
                </ul>
              </div>
            </div>

            {/* Contact */}
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-teal-500/10 via-cyan-500/10 to-blue-500/10 rounded-[28px] blur-xl" />
              <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl border border-white/60 shadow-xl p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-lg">
                    <Mail className="h-7 w-7 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">Contact Us</h2>
                </div>

                <p className="text-slate-600 mb-6">
                  If you have any questions about this Privacy Policy, please contact us:
                </p>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="p-5 rounded-2xl bg-slate-50 border-2 border-slate-100 text-center">
                    <p className="font-bold text-slate-900 mb-1">Privacy</p>
                    <a href="mailto:privacy@smartdocconverter.com" className="text-indigo-600 hover:text-indigo-700 text-sm font-medium transition-colors">
                      privacy@smartdocconverter.com
                    </a>
                  </div>
                  <div className="p-5 rounded-2xl bg-slate-50 border-2 border-slate-100 text-center">
                    <p className="font-bold text-slate-900 mb-1">Support</p>
                    <a href="mailto:support@smartdocconverter.com" className="text-indigo-600 hover:text-indigo-700 text-sm font-medium transition-colors">
                      support@smartdocconverter.com
                    </a>
                  </div>
                  <div className="p-5 rounded-2xl bg-slate-50 border-2 border-slate-100 text-center">
                    <p className="font-bold text-slate-900 mb-1">Website</p>
                    <Link href="/" className="text-indigo-600 hover:text-indigo-700 text-sm font-medium transition-colors">
                      www.smartdocconverter.com
                    </Link>
                  </div>
                </div>

                <p className="text-slate-500 text-sm mt-6 text-center">
                  We aim to respond to all privacy-related inquiries within 30 days.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
