import Link from 'next/link'
import { Scale, FileText, Shield, DollarSign, Ban, AlertCircle } from 'lucide-react'

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center mb-6">
            <Scale className="h-12 w-12 text-primary-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 text-center mb-4">
            Terms of Service
          </h1>
          <p className="text-lg text-gray-600 text-center max-w-2xl mx-auto">
            Please read these terms carefully before using SmartDocConverter
          </p>
          <p className="text-sm text-gray-500 text-center mt-4">
            Last Updated: November 26, 2025
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 md:p-12">
            {/* Introduction */}
            <div className="mb-12">
              <p className="text-gray-700 leading-relaxed mb-4">
                Welcome to SmartDocConverter. These Terms of Service (&quot;Terms&quot;) govern your access to and use of our website, services, and applications (collectively, the &quot;Service&quot;). By accessing or using SmartDocConverter, you agree to be bound by these Terms.
              </p>
              <p className="text-gray-700 leading-relaxed">
                If you do not agree to these Terms, you may not access or use the Service.
              </p>
            </div>

            {/* 1. Acceptance of Terms */}
            <div className="mb-10">
              <div className="flex items-start gap-3 mb-4">
                <FileText className="h-6 w-6 text-primary-600 flex-shrink-0 mt-1" />
                <h2 className="text-2xl font-bold text-gray-900">1. Acceptance of Terms</h2>
              </div>
              <div className="ml-9 space-y-3 text-gray-700">
                <p className="leading-relaxed">
                  By using SmartDocConverter, you acknowledge that you have read, understood, and agree to be bound by these Terms, as well as our Privacy Policy. These Terms apply to all users of the Service, including both free and premium subscribers.
                </p>
                <p className="leading-relaxed">
                  We reserve the right to modify these Terms at any time. We will notify users of any material changes by posting the updated Terms on this page with a new &quot;Last Updated&quot; date. Your continued use of the Service after such changes constitutes acceptance of the modified Terms.
                </p>
              </div>
            </div>

            {/* 2. Description of Service */}
            <div className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Description of Service</h2>
              <div className="ml-0 space-y-3 text-gray-700">
                <p className="leading-relaxed">
                  SmartDocConverter is a web-based platform that provides document conversion and processing tools, including but not limited to:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>PDF conversion tools (to/from Word, Excel, PowerPoint, JPG, PNG)</li>
                  <li>PDF utilities (merge, split, compress, rotate, protect, unlock)</li>
                  <li>Image processing tools (format conversion, compression, resizing)</li>
                  <li>OCR (Optical Character Recognition) services</li>
                  <li>Bank statement conversion to Excel/CSV</li>
                  <li>Other document processing utilities</li>
                </ul>
                <p className="leading-relaxed mt-3">
                  We offer both free and premium subscription tiers with varying features, file size limits, and usage quotas.
                </p>
              </div>
            </div>

            {/* 3. User Accounts and Registration */}
            <div className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. User Accounts and Registration</h2>
              <div className="ml-0 space-y-4 text-gray-700">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">3.1 Account Creation</h3>
                  <p className="leading-relaxed">
                    While basic use of our Service may not require registration, certain features (including premium subscriptions) require you to create an account. When creating an account, you agree to provide accurate, current, and complete information.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">3.2 Account Security</h3>
                  <p className="leading-relaxed">
                    You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to immediately notify us of any unauthorized use of your account.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">3.3 Age Requirement</h3>
                  <p className="leading-relaxed">
                    You must be at least 13 years old to use SmartDocConverter. If you are under 18, you may only use the Service with the involvement and consent of a parent or legal guardian.
                  </p>
                </div>
              </div>
            </div>

            {/* 4. Acceptable Use Policy */}
            <div className="mb-10">
              <div className="flex items-start gap-3 mb-4">
                <Ban className="h-6 w-6 text-red-600 flex-shrink-0 mt-1" />
                <h2 className="text-2xl font-bold text-gray-900">4. Acceptable Use Policy</h2>
              </div>
              <div className="ml-9 space-y-3 text-gray-700">
                <p className="leading-relaxed">You agree NOT to use the Service to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Upload, process, or distribute any content that is illegal, harmful, threatening, abusive, defamatory, or otherwise objectionable</li>
                  <li>Violate any intellectual property rights, privacy rights, or other rights of any person or entity</li>
                  <li>Upload files containing viruses, malware, or other malicious code</li>
                  <li>Attempt to gain unauthorized access to our systems or other users&apos; accounts</li>
                  <li>Interfere with or disrupt the Service or servers/networks connected to the Service</li>
                  <li>Use automated systems (bots, scrapers) to access the Service without prior written permission</li>
                  <li>Circumvent any usage limits, rate limiting, or access controls</li>
                  <li>Resell or commercially exploit the Service without authorization</li>
                  <li>Process documents containing child exploitation material or other illegal content</li>
                </ul>
                <p className="leading-relaxed mt-3">
                  We reserve the right to investigate and take appropriate legal action against anyone who violates this Acceptable Use Policy.
                </p>
              </div>
            </div>

            {/* 5. Intellectual Property */}
            <div className="mb-10">
              <div className="flex items-start gap-3 mb-4">
                <Shield className="h-6 w-6 text-primary-600 flex-shrink-0 mt-1" />
                <h2 className="text-2xl font-bold text-gray-900">5. Intellectual Property Rights</h2>
              </div>
              <div className="ml-9 space-y-4 text-gray-700">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">5.1 Your Content</h3>
                  <p className="leading-relaxed">
                    You retain all ownership rights to the files and documents you upload to SmartDocConverter. By using our Service, you grant us a limited, non-exclusive license to process, convert, and temporarily store your files solely for the purpose of providing the Service to you.
                  </p>
                  <p className="leading-relaxed mt-2">
                    We do not claim any ownership over your content, and we will not use your files for any purpose other than providing the Service. All uploaded files are automatically deleted from our servers within 1 hour of processing.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">5.2 Our Intellectual Property</h3>
                  <p className="leading-relaxed">
                    SmartDocConverter and its original content, features, functionality, design, logos, and trademarks are owned by us and are protected by international copyright, trademark, and other intellectual property laws. You may not copy, modify, distribute, sell, or lease any part of our Service without our prior written consent.
                  </p>
                </div>
              </div>
            </div>

            {/* 6. Service Limitations and Disclaimers */}
            <div className="mb-10">
              <div className="flex items-start gap-3 mb-4">
                <AlertCircle className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-1" />
                <h2 className="text-2xl font-bold text-gray-900">6. Service Limitations and Disclaimers</h2>
              </div>
              <div className="ml-9 space-y-4 text-gray-700">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">6.1 Service Availability</h3>
                  <p className="leading-relaxed">
                    While we strive to provide reliable service, we do not guarantee that the Service will be available at all times or that it will be free from errors, bugs, or interruptions. We reserve the right to modify, suspend, or discontinue any part of the Service at any time without notice.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">6.2 Conversion Accuracy</h3>
                  <p className="leading-relaxed">
                    We strive to provide accurate document conversions, but we do not guarantee perfect accuracy or formatting preservation in all cases. The quality of conversions may vary depending on the complexity and format of the source document. You are responsible for reviewing all converted documents before use.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">6.3 File Size and Usage Limits</h3>
                  <p className="leading-relaxed">
                    Free tier users are limited to 5 conversions per day and a maximum file size of 10MB. Premium users have access to unlimited conversions with larger file size limits (50MB for monthly, 100MB for annual subscribers). We reserve the right to modify these limits at any time.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">6.4 &quot;AS IS&quot; Warranty Disclaimer</h3>
                  <p className="leading-relaxed">
                    THE SERVICE IS PROVIDED ON AN &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; BASIS WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.
                  </p>
                </div>
              </div>
            </div>

            {/* 7. Subscription and Payments */}
            <div className="mb-10">
              <div className="flex items-start gap-3 mb-4">
                <DollarSign className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                <h2 className="text-2xl font-bold text-gray-900">7. Subscription and Payments</h2>
              </div>
              <div className="ml-9 space-y-4 text-gray-700">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">7.1 Premium Subscriptions</h3>
                  <p className="leading-relaxed">
                    SmartDocConverter offers premium subscription plans at $4.99 per month or $39.99 per year. Premium features include unlimited conversions, no advertisements, larger file size limits, batch processing, and priority support.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">7.2 Payment Processing</h3>
                  <p className="leading-relaxed">
                    All payments are processed securely through Stripe, our third-party payment processor. We accept major credit cards (Visa, MasterCard, American Express) and other payment methods supported by Stripe. By providing payment information, you represent that you are authorized to use the payment method.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">7.3 Free Trial</h3>
                  <p className="leading-relaxed">
                    Premium subscriptions may include a 7-day free trial. You will not be charged until the trial period ends. You may cancel at any time during the trial period to avoid charges. If you do not cancel before the trial ends, your payment method will be automatically charged for the subscription.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">7.4 Automatic Renewal</h3>
                  <p className="leading-relaxed">
                    Subscriptions automatically renew at the end of each billing period (monthly or annually) unless you cancel before the renewal date. You will be charged the then-current subscription fee using your payment method on file.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">7.5 Cancellation</h3>
                  <p className="leading-relaxed">
                    You may cancel your subscription at any time through your account settings or by contacting our support team. Cancellations take effect at the end of the current billing period. You will continue to have access to premium features until the end of your paid period. No partial refunds are provided for unused time in a billing period.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">7.6 Refund Policy</h3>
                  <p className="leading-relaxed">
                    We offer refunds within 14 days of your initial subscription purchase if you are not satisfied with the Service. Refunds are not available for renewal charges or after 14 days from the initial purchase. To request a refund, please contact our support team at{' '}
                    <a href="mailto:support@smartdocconverter.com" className="text-primary-600 hover:text-primary-700 underline">
                      support@smartdocconverter.com
                    </a>
                    .
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">7.7 Price Changes</h3>
                  <p className="leading-relaxed">
                    We reserve the right to modify subscription prices at any time. Price changes will not affect existing subscribers until their next renewal period. We will provide at least 30 days&apos; notice before any price increase takes effect.
                  </p>
                </div>
              </div>
            </div>

            {/* 8. Termination */}
            <div className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Termination</h2>
              <div className="ml-0 space-y-4 text-gray-700">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">8.1 Termination by You</h3>
                  <p className="leading-relaxed">
                    You may stop using the Service and delete your account at any time. You can request account deletion by contacting us at{' '}
                    <a href="mailto:support@smartdocconverter.com" className="text-primary-600 hover:text-primary-700 underline">
                      support@smartdocconverter.com
                    </a>
                    .
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">8.2 Termination by Us</h3>
                  <p className="leading-relaxed">
                    We reserve the right to suspend or terminate your access to the Service at any time, with or without notice, for any reason, including but not limited to:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
                    <li>Violation of these Terms or our Acceptable Use Policy</li>
                    <li>Fraudulent or illegal activity</li>
                    <li>Excessive use that degrades service quality for other users</li>
                    <li>Non-payment of subscription fees</li>
                    <li>At our discretion for any other reason</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">8.3 Effect of Termination</h3>
                  <p className="leading-relaxed">
                    Upon termination, your right to use the Service will immediately cease. Any data associated with your account may be deleted. We are not liable for any loss of data or content resulting from termination.
                  </p>
                </div>
              </div>
            </div>

            {/* 9. Limitation of Liability */}
            <div className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Limitation of Liability</h2>
              <div className="ml-0 space-y-3 text-gray-700">
                <p className="leading-relaxed font-semibold">
                  TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW:
                </p>
                <p className="leading-relaxed">
                  IN NO EVENT SHALL SMARTDOCCONVERTER, ITS DIRECTORS, EMPLOYEES, PARTNERS, AGENTS, SUPPLIERS, OR AFFILIATES BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION, LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Your access to or use of (or inability to access or use) the Service</li>
                  <li>Any conduct or content of any third party on the Service</li>
                  <li>Unauthorized access, use, or alteration of your content or files</li>
                  <li>Any errors, inaccuracies, or omissions in converted documents</li>
                  <li>Any other matter relating to the Service</li>
                </ul>
                <p className="leading-relaxed mt-3">
                  WHETHER BASED ON WARRANTY, CONTRACT, TORT (INCLUDING NEGLIGENCE), PRODUCT LIABILITY, OR ANY OTHER LEGAL THEORY, AND WHETHER OR NOT WE HAVE BEEN INFORMED OF THE POSSIBILITY OF SUCH DAMAGE.
                </p>
                <p className="leading-relaxed">
                  IN NO EVENT SHALL OUR TOTAL LIABILITY TO YOU FOR ALL DAMAGES EXCEED THE AMOUNT YOU PAID TO US IN THE TWELVE (12) MONTHS PRECEDING THE EVENT GIVING RISE TO THE LIABILITY, OR ONE HUNDRED DOLLARS ($100), WHICHEVER IS GREATER.
                </p>
              </div>
            </div>

            {/* 10. Indemnification */}
            <div className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Indemnification</h2>
              <div className="ml-0 space-y-3 text-gray-700">
                <p className="leading-relaxed">
                  You agree to defend, indemnify, and hold harmless SmartDocConverter and its officers, directors, employees, contractors, agents, and affiliates from and against any claims, liabilities, damages, losses, and expenses, including reasonable attorneys&apos; fees and costs, arising out of or in any way connected with:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Your access to or use of the Service</li>
                  <li>Your violation of these Terms</li>
                  <li>Your violation of any third-party rights, including intellectual property rights</li>
                  <li>Any content or files you upload or process through the Service</li>
                  <li>Any misrepresentation made by you</li>
                </ul>
              </div>
            </div>

            {/* 11. Governing Law and Dispute Resolution */}
            <div className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Governing Law and Dispute Resolution</h2>
              <div className="ml-0 space-y-4 text-gray-700">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">11.1 Governing Law</h3>
                  <p className="leading-relaxed">
                    These Terms shall be governed by and construed in accordance with the laws of the State of Delaware, United States, without regard to its conflict of law provisions.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">11.2 Dispute Resolution</h3>
                  <p className="leading-relaxed">
                    Any dispute, controversy, or claim arising out of or relating to these Terms or the Service shall first be attempted to be resolved through good faith negotiations. If negotiations fail, disputes shall be resolved through binding arbitration in accordance with the rules of the American Arbitration Association.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">11.3 Class Action Waiver</h3>
                  <p className="leading-relaxed">
                    You agree that any dispute resolution proceedings will be conducted only on an individual basis and not in a class, consolidated, or representative action.
                  </p>
                </div>
              </div>
            </div>

            {/* 12. Miscellaneous */}
            <div className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Miscellaneous Provisions</h2>
              <div className="ml-0 space-y-4 text-gray-700">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">12.1 Entire Agreement</h3>
                  <p className="leading-relaxed">
                    These Terms, together with our Privacy Policy, constitute the entire agreement between you and SmartDocConverter regarding the use of the Service and supersede all prior agreements and understandings.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">12.2 Severability</h3>
                  <p className="leading-relaxed">
                    If any provision of these Terms is found to be invalid or unenforceable, the remaining provisions shall remain in full force and effect.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">12.3 Waiver</h3>
                  <p className="leading-relaxed">
                    Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">12.4 Assignment</h3>
                  <p className="leading-relaxed">
                    You may not assign or transfer these Terms or your rights hereunder without our prior written consent. We may assign these Terms without restriction.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">12.5 No Third-Party Beneficiaries</h3>
                  <p className="leading-relaxed">
                    These Terms do not create any third-party beneficiary rights.
                  </p>
                </div>
              </div>
            </div>

            {/* 13. Contact Information */}
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Contact Information</h2>
              <div className="ml-0 space-y-3 text-gray-700">
                <p className="leading-relaxed">
                  If you have any questions about these Terms of Service, please contact us:
                </p>
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <p className="font-semibold text-gray-900 mb-2">SmartDocConverter Support</p>
                  <p className="text-gray-700">
                    Email:{' '}
                    <a href="mailto:support@smartdocconverter.com" className="text-primary-600 hover:text-primary-700 underline">
                      support@smartdocconverter.com
                    </a>
                  </p>
                  <p className="text-gray-700">
                    Legal:{' '}
                    <a href="mailto:legal@smartdocconverter.com" className="text-primary-600 hover:text-primary-700 underline">
                      legal@smartdocconverter.com
                    </a>
                  </p>
                </div>
                <p className="leading-relaxed text-sm text-gray-600 mt-4">
                  By using SmartDocConverter, you acknowledge that you have read and understood these Terms of Service and agree to be bound by them.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Links Section */}
      <section className="py-12 bg-white border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Related Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link
              href="/pricing"
              className="flex flex-col items-center p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors border border-gray-200"
            >
              <DollarSign className="h-10 w-10 text-primary-600 mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Pricing Plans</h3>
              <p className="text-sm text-gray-600 text-center">
                View our subscription options and features
              </p>
            </Link>
            <Link
              href="/privacy"
              className="flex flex-col items-center p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors border border-gray-200"
            >
              <Shield className="h-10 w-10 text-primary-600 mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Privacy Policy</h3>
              <p className="text-sm text-gray-600 text-center">
                Learn how we protect your data
              </p>
            </Link>
            <a
              href="mailto:support@smartdocconverter.com"
              className="flex flex-col items-center p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors border border-gray-200"
            >
              <FileText className="h-10 w-10 text-primary-600 mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Contact Support</h3>
              <p className="text-sm text-gray-600 text-center">
                Questions? We&apos;re here to help
              </p>
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
