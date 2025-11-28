'use client'

import Link from 'next/link'
import { Scale, FileText, Shield, DollarSign, Ban, AlertCircle } from 'lucide-react'
import { PageLayout } from '@/components/layout/PageLayout'

export default function TermsOfServicePage() {
  return (
    <PageLayout
      title="Terms of Service"
      description="Please read these terms carefully before using SmartDocConverter. They govern your access and use of our services."
      icon={Scale}
    >
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Introduction */}
        <div className="glass-panel p-8 rounded-2xl border border-white/10 bg-white/5">
          <p className="text-gray-300 leading-relaxed mb-4">
            Welcome to SmartDocConverter. These Terms of Service (&quot;Terms&quot;) govern your access to and use of our website, services, and applications (collectively, the &quot;Service&quot;). By accessing or using SmartDocConverter, you agree to be bound by these Terms.
          </p>
          <p className="text-gray-300 leading-relaxed">
            If you do not agree to these Terms, you may not access or use the Service.
          </p>
          <div className="mt-6 p-4 bg-white/5 rounded-lg border border-white/10 text-center">
            <p className="text-sm text-gray-400">
              Last Updated: November 26, 2025
            </p>
          </div>
        </div>

        {/* 1. Acceptance of Terms */}
        <div className="glass-panel p-8 rounded-2xl border border-white/10 bg-white/5">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 bg-primary-500/20 rounded-xl flex items-center justify-center border border-primary-500/20 flex-shrink-0">
              <FileText className="h-6 w-6 text-primary-400" />
            </div>
            <h2 className="text-2xl font-bold text-white pt-2">1. Acceptance of Terms</h2>
          </div>
          <div className="space-y-4 text-gray-300 pl-16">
            <p className="leading-relaxed">
              By using SmartDocConverter, you acknowledge that you have read, understood, and agree to be bound by these Terms, as well as our Privacy Policy. These Terms apply to all users of the Service, including both free and premium subscribers.
            </p>
            <p className="leading-relaxed">
              We reserve the right to modify these Terms at any time. We will notify users of any material changes by posting the updated Terms on this page with a new &quot;Last Updated&quot; date. Your continued use of the Service after such changes constitutes acceptance of the modified Terms.
            </p>
          </div>
        </div>

        {/* 2. Description of Service */}
        <div className="glass-panel p-8 rounded-2xl border border-white/10 bg-white/5">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 bg-accent-purple/20 rounded-xl flex items-center justify-center border border-accent-purple/20 flex-shrink-0">
              <Scale className="h-6 w-6 text-accent-purple" />
            </div>
            <h2 className="text-2xl font-bold text-white pt-2">2. Description of Service</h2>
          </div>
          <div className="space-y-4 text-gray-300 pl-16">
            <p className="leading-relaxed">
              SmartDocConverter is a web-based platform that provides document conversion and processing tools, including but not limited to:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 text-gray-400">
              <li>PDF conversion tools (to/from Word, Excel, PowerPoint, JPG, PNG)</li>
              <li>PDF utilities (merge, split, compress, rotate, protect, unlock)</li>
              <li>Image processing tools (format conversion, compression, resizing)</li>
              <li>OCR (Optical Character Recognition) services</li>
              <li>Bank statement conversion to Excel/CSV</li>
              <li>Other document processing utilities</li>
            </ul>
            <p className="leading-relaxed">
              We offer both free and premium subscription tiers with varying features, file size limits, and usage quotas.
            </p>
          </div>
        </div>

        {/* 3. User Accounts */}
        <div className="glass-panel p-8 rounded-2xl border border-white/10 bg-white/5">
          <h2 className="text-2xl font-bold text-white mb-6 pl-16">3. User Accounts and Registration</h2>
          <div className="space-y-6 text-gray-300 pl-16">
            <div>
              <h3 className="font-bold text-white mb-2">3.1 Account Creation</h3>
              <p className="leading-relaxed">
                While basic use of our Service may not require registration, certain features (including premium subscriptions) require you to create an account. When creating an account, you agree to provide accurate, current, and complete information.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-white mb-2">3.2 Account Security</h3>
              <p className="leading-relaxed">
                You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to immediately notify us of any unauthorized use of your account.
              </p>
            </div>
          </div>
        </div>

        {/* 4. Acceptable Use Policy */}
        <div className="glass-panel p-8 rounded-2xl border border-white/10 bg-white/5">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center border border-red-500/20 flex-shrink-0">
              <Ban className="h-6 w-6 text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-white pt-2">4. Acceptable Use Policy</h2>
          </div>
          <div className="space-y-4 text-gray-300 pl-16">
            <p className="leading-relaxed">You agree NOT to use the Service to:</p>
            <ul className="list-disc list-inside space-y-2 ml-4 text-gray-400">
              <li>Upload content that is illegal, harmful, threatening, or abusive</li>
              <li>Violate intellectual property rights or privacy rights</li>
              <li>Upload files containing viruses or malicious code</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Interfere with or disrupt the Service</li>
              <li>Use automated systems (bots) without permission</li>
              <li>Resell the Service without authorization</li>
            </ul>
          </div>
        </div>

        {/* 5. Intellectual Property */}
        <div className="glass-panel p-8 rounded-2xl border border-white/10 bg-white/5">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center border border-blue-500/20 flex-shrink-0">
              <Shield className="h-6 w-6 text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold text-white pt-2">5. Intellectual Property Rights</h2>
          </div>
          <div className="space-y-4 text-gray-300 pl-16">
            <div>
              <h3 className="font-bold text-white mb-2">5.1 Your Content</h3>
              <p className="leading-relaxed">
                You retain all ownership rights to your files. By using our Service, you grant us a limited license solely to process and convert your files. We do not claim ownership, and files are automatically deleted after 1 hour.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-white mb-2">5.2 Our Intellectual Property</h3>
              <p className="leading-relaxed">
                SmartDocConverter and its original content, features, and design are owned by us and protected by intellectual property laws.
              </p>
            </div>
          </div>
        </div>

        {/* 6. Subscription */}
        <div className="glass-panel p-8 rounded-2xl border border-white/10 bg-white/5">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center border border-green-500/20 flex-shrink-0">
              <DollarSign className="h-6 w-6 text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-white pt-2">6. Subscription and Payments</h2>
          </div>
          <div className="space-y-4 text-gray-300 pl-16">
            <p className="leading-relaxed">
              Premium subscriptions are billed in advance on a recurring basis (monthly or annual). You can cancel at any time to stop future billing. Refunds are available within 14 days of initial purchase.
            </p>
            <p className="leading-relaxed">
              All payments are securely processed by Stripe. We do not store payment details.
            </p>
          </div>
        </div>

        {/* 7. Liability */}
        <div className="glass-panel p-8 rounded-2xl border border-white/10 bg-white/5">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center border border-yellow-500/20 flex-shrink-0">
              <AlertCircle className="h-6 w-6 text-yellow-400" />
            </div>
            <h2 className="text-2xl font-bold text-white pt-2">7. Limitation of Liability</h2>
          </div>
          <div className="space-y-4 text-gray-300 pl-16">
            <p className="leading-relaxed font-bold text-white">
              THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND.
            </p>
            <p className="leading-relaxed">
              In no event shall SmartDocConverter be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits or data, arising out of your use of the Service.
            </p>
          </div>
        </div>

        {/* Contact */}
        <div className="glass-panel p-8 rounded-2xl border border-white/10 bg-white/5">
          <h2 className="text-2xl font-bold text-white mb-6">Contact Information</h2>
          <div className="space-y-4 pl-4 border-l-2 border-white/10">
            <p className="text-gray-300">
              If you have any questions about these Terms, please contact us:
            </p>
            <div className="space-y-2">
              <p className="text-gray-400">
                <span className="text-white font-bold">Support:</span>{' '}
                <a href="mailto:support@smartdocconverter.com" className="text-primary-400 hover:text-primary-300 transition-colors">
                  support@smartdocconverter.com
                </a>
              </p>
              <p className="text-gray-400">
                <span className="text-white font-bold">Legal:</span>{' '}
                <a href="mailto:legal@smartdocconverter.com" className="text-primary-400 hover:text-primary-300 transition-colors">
                  legal@smartdocconverter.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
