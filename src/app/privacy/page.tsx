import Link from 'next/link'
import { Shield, Lock, Eye, FileText, Clock, Mail, RefreshCw, Users } from 'lucide-react'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="h-8 w-8 text-primary-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Privacy Policy
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Your privacy and data security are our top priorities. Learn how we protect your information.
          </p>
          <p className="text-sm text-gray-500 mt-4">
            Last Updated: November 26, 2025
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Introduction */}
          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 mb-8">
            <p className="text-gray-700 leading-relaxed">
              Welcome to SmartDocConverter. This Privacy Policy explains how we collect, use, disclose,
              and safeguard your information when you use our document conversion services. Please read
              this privacy policy carefully. If you do not agree with the terms of this privacy policy,
              please do not access our website or use our services.
            </p>
          </div>

          {/* Data Collection */}
          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <Eye className="h-6 w-6 text-primary-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Information We Collect</h2>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
              Personal Information
            </h3>
            <p className="text-gray-700 mb-3">
              When you create an account or use our services, we may collect:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Email address (for account creation and communication)</li>
              <li>Name (optional, for personalization)</li>
              <li>Payment information (processed securely through Stripe)</li>
              <li>Login credentials (encrypted and securely stored)</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
              Usage Information
            </h3>
            <p className="text-gray-700 mb-3">
              We automatically collect certain information when you use our services:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Browser type and version</li>
              <li>Operating system</li>
              <li>IP address (for security and rate limiting)</li>
              <li>Pages visited and features used</li>
              <li>Time and date of visits</li>
              <li>Conversion history and usage statistics</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
              File Information
            </h3>
            <p className="text-gray-700">
              We temporarily process your uploaded files to provide our conversion services.
              We do not access, read, or analyze the content of your files except as necessary
              to perform the requested conversion.
            </p>
          </div>

          {/* File Processing & Security */}
          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">File Processing & Storage</h2>
            </div>

            <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
              <div className="flex items-start">
                <Clock className="h-5 w-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-green-800 mb-1">
                    Automatic File Deletion
                  </p>
                  <p className="text-sm text-green-700">
                    All uploaded files are automatically and permanently deleted from our servers
                    within 1 hour after processing. This ensures your documents remain private and secure.
                  </p>
                </div>
              </div>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
              How We Process Your Files
            </h3>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Files are encrypted during upload and transmission (HTTPS/TLS)</li>
              <li>Processing happens in secure, isolated environments</li>
              <li>Files are stored temporarily in encrypted cloud storage</li>
              <li>Converted files are deleted immediately after download or within 1 hour</li>
              <li>We never share, sell, or distribute your files to third parties</li>
              <li>Premium users' files are processed with priority but follow the same deletion policy</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
              Client-Side Processing
            </h3>
            <p className="text-gray-700">
              When possible, we process files directly in your browser using client-side processing.
              This means your files never leave your device, providing maximum privacy and security
              for smaller conversions.
            </p>
          </div>

          {/* Cookies and Tracking */}
          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Lock className="h-6 w-6 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Cookies and Tracking Technologies</h2>
            </div>

            <p className="text-gray-700 mb-4">
              We use cookies and similar tracking technologies to enhance your experience and analyze
              service usage:
            </p>

            <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
              Essential Cookies
            </h3>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Session cookies for authentication and security</li>
              <li>Preference cookies to remember your settings</li>
              <li>Rate limiting cookies to enforce fair usage policies</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
              Analytics Cookies
            </h3>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Google Analytics 4 for usage statistics and improvements</li>
              <li>Conversion tracking to understand feature popularity</li>
              <li>Performance monitoring to optimize service speed</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
              Advertising Cookies (Free Tier Only)
            </h3>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Google AdSense cookies for displaying relevant ads</li>
              <li>Ad performance and frequency capping</li>
              <li>Premium subscribers do not see ads or advertising cookies</li>
            </ul>

            <p className="text-gray-700 mt-4">
              You can manage cookie preferences through your browser settings. Note that disabling
              essential cookies may affect service functionality.
            </p>
          </div>

          {/* Third-Party Services */}
          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Third-Party Services</h2>
            </div>

            <p className="text-gray-700 mb-4">
              We work with trusted third-party service providers to deliver our services:
            </p>

            <div className="space-y-4">
              <div className="border-l-4 border-primary-500 pl-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Stripe (Payment Processing)
                </h3>
                <p className="text-gray-700">
                  All payment transactions are processed securely through Stripe. We do not store
                  your credit card information on our servers. Stripe's privacy policy can be found at{' '}
                  <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer"
                     className="text-primary-600 hover:underline">
                    stripe.com/privacy
                  </a>.
                </p>
              </div>

              <div className="border-l-4 border-red-500 pl-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Google Services (Authentication & Analytics)
                </h3>
                <p className="text-gray-700">
                  We use Google OAuth for optional account login and Google Analytics for service
                  improvement. Google's privacy policy can be found at{' '}
                  <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer"
                     className="text-primary-600 hover:underline">
                    policies.google.com/privacy
                  </a>.
                </p>
              </div>

              <div className="border-l-4 border-yellow-500 pl-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Cloud Infrastructure
                </h3>
                <p className="text-gray-700">
                  Our services are hosted on Vercel and AWS, which provide secure, compliant
                  infrastructure with industry-standard security measures.
                </p>
              </div>
            </div>
          </div>

          {/* Data Security */}
          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <Shield className="h-6 w-6 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Data Security</h2>
            </div>

            <p className="text-gray-700 mb-4">
              We implement comprehensive security measures to protect your information:
            </p>

            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>End-to-end encryption (HTTPS/TLS) for all data transmission</li>
              <li>Secure, encrypted storage for temporary file processing</li>
              <li>Regular security audits and vulnerability assessments</li>
              <li>Access controls and authentication for all systems</li>
              <li>Automated file deletion within 1 hour of processing</li>
              <li>Industry-standard password hashing (bcrypt)</li>
              <li>Rate limiting and abuse prevention systems</li>
              <li>Regular backups of user data (excluding uploaded files)</li>
            </ul>

            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mt-6">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> While we implement strong security measures, no method of
                transmission over the internet or electronic storage is 100% secure. We cannot
                guarantee absolute security of your information.
              </p>
            </div>
          </div>

          {/* User Rights */}
          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-indigo-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Your Privacy Rights</h2>
            </div>

            <p className="text-gray-700 mb-4">
              You have the following rights regarding your personal information:
            </p>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Access and Portability
                </h3>
                <p className="text-gray-700">
                  You can request a copy of your personal data in a machine-readable format.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Correction
                </h3>
                <p className="text-gray-700">
                  You can update or correct your account information at any time through your
                  account settings.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Deletion
                </h3>
                <p className="text-gray-700">
                  You can request deletion of your account and associated personal data. Note that
                  uploaded files are automatically deleted within 1 hour regardless.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Opt-Out
                </h3>
                <p className="text-gray-700">
                  You can opt out of marketing communications and adjust cookie preferences at any time.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Data Processing Objection
                </h3>
                <p className="text-gray-700">
                  You can object to certain types of data processing, subject to legal requirements.
                </p>
              </div>
            </div>

            <p className="text-gray-700 mt-6">
              To exercise any of these rights, please contact us at{' '}
              <a href="mailto:privacy@smartdocconverter.com" className="text-primary-600 hover:underline">
                privacy@smartdocconverter.com
              </a>.
            </p>
          </div>

          {/* Data Retention */}
          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Data Retention</h2>
            </div>

            <p className="text-gray-700 mb-4">
              We retain different types of data for varying periods:
            </p>

            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li><strong>Uploaded Files:</strong> Automatically deleted within 1 hour of processing</li>
              <li><strong>Converted Files:</strong> Deleted immediately after download or within 1 hour</li>
              <li><strong>Account Information:</strong> Retained while your account is active</li>
              <li><strong>Usage Logs:</strong> Retained for 90 days for security and analytics</li>
              <li><strong>Payment Records:</strong> Retained for 7 years for legal and tax compliance</li>
              <li><strong>Marketing Preferences:</strong> Retained until you opt out or delete your account</li>
            </ul>

            <p className="text-gray-700 mt-4">
              You can request deletion of your account at any time, after which we will delete your
              personal information within 30 days, except where retention is required by law.
            </p>
          </div>

          {/* International Transfers */}
          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                <RefreshCw className="h-6 w-6 text-teal-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">International Data Transfers</h2>
            </div>

            <p className="text-gray-700">
              Your information may be transferred to and processed in countries other than your country
              of residence. These countries may have data protection laws that differ from your jurisdiction.
              We ensure that such transfers comply with applicable data protection laws and use appropriate
              safeguards such as Standard Contractual Clauses approved by the European Commission.
            </p>
          </div>

          {/* Children's Privacy */}
          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
                <Shield className="h-6 w-6 text-pink-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Children's Privacy</h2>
            </div>

            <p className="text-gray-700">
              Our services are not directed to children under 13 years of age. We do not knowingly
              collect personal information from children under 13. If you become aware that a child
              has provided us with personal information without parental consent, please contact us
              at{' '}
              <a href="mailto:privacy@smartdocconverter.com" className="text-primary-600 hover:underline">
                privacy@smartdocconverter.com
              </a>, and we will take steps to delete such information.
            </p>
          </div>

          {/* Updates to Policy */}
          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center">
                <RefreshCw className="h-6 w-6 text-cyan-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Updates to This Privacy Policy</h2>
            </div>

            <p className="text-gray-700 mb-4">
              We may update this Privacy Policy from time to time to reflect changes in our practices
              or for legal, operational, or regulatory reasons. We will notify you of any material
              changes by:
            </p>

            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Posting the updated policy on this page with a new "Last Updated" date</li>
              <li>Sending an email notification to registered users (for significant changes)</li>
              <li>Displaying a notice on our website</li>
            </ul>

            <p className="text-gray-700 mt-4">
              Your continued use of our services after any changes constitutes acceptance of the
              updated Privacy Policy.
            </p>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Mail className="h-6 w-6 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Contact Us</h2>
            </div>

            <p className="text-gray-700 mb-4">
              If you have any questions, concerns, or requests regarding this Privacy Policy or our
              data practices, please contact us:
            </p>

            <div className="bg-gray-50 rounded-lg p-6 space-y-3">
              <div>
                <p className="text-sm font-semibold text-gray-900">Email</p>
                <a href="mailto:privacy@smartdocconverter.com"
                   className="text-primary-600 hover:underline">
                  privacy@smartdocconverter.com
                </a>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-900">General Support</p>
                <a href="mailto:support@smartdocconverter.com"
                   className="text-primary-600 hover:underline">
                  support@smartdocconverter.com
                </a>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-900">Website</p>
                <a href="/" className="text-primary-600 hover:underline">
                  www.smartdocconverter.com
                </a>
              </div>
            </div>

            <p className="text-gray-700 mt-6">
              We aim to respond to all privacy-related inquiries within 30 days.
            </p>
          </div>

          {/* GDPR & CCPA Compliance */}
          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <Shield className="h-6 w-6 text-primary-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Compliance</h2>
            </div>

            <p className="text-gray-700 mb-4">
              SmartDocConverter is committed to complying with applicable data protection regulations:
            </p>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  GDPR (General Data Protection Regulation)
                </h3>
                <p className="text-gray-700">
                  For users in the European Economic Area (EEA), we comply with GDPR requirements
                  including lawful basis for processing, data minimization, and your rights to access,
                  rectify, erase, restrict processing, object, and data portability.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  CCPA (California Consumer Privacy Act)
                </h3>
                <p className="text-gray-700">
                  For California residents, we comply with CCPA requirements including the right to
                  know what personal information is collected, the right to delete personal information,
                  the right to opt-out of the sale of personal information (note: we do not sell your
                  personal information), and the right to non-discrimination.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Questions About Privacy?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            We're here to help. Contact our support team or review our other policies.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:privacy@smartdocconverter.com"
              className="inline-flex items-center justify-center bg-white text-primary-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Contact Privacy Team
            </a>
            <Link
              href="/"
              className="inline-flex items-center justify-center border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-primary-700 transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
