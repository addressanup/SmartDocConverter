'use client'

import { useState, useCallback } from 'react'
import { Lock, ArrowRight, Shield, Eye, EyeOff, FileText } from 'lucide-react'
import { FileUploader, UploadedFile } from '@/components/shared/FileUploader'
import { ConversionStatus, ConversionState } from '@/components/shared/ConversionStatus'
import { Button } from '@/components/ui/Button'
import { useConversionJob } from '@/hooks/useConversionJob'

export default function ProtectPdfPage() {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [userPassword, setUserPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [outputFileName, setOutputFileName] = useState<string | null>(null)

  const {
    status,
    progress,
    downloadUrl,
    error: conversionError,
    startConversion,
    reset: resetConversion,
    download,
  } = useConversionJob()

  // Map hook status to ConversionState type
  const conversionState: ConversionState = status === 'failed' ? 'error' : status
  const error = passwordError || conversionError

  const handleFilesSelected = useCallback((selectedFiles: UploadedFile[]) => {
    setFiles(selectedFiles)
    setPasswordError(null)
    resetConversion()
  }, [resetConversion])

  const handleProtect = async () => {
    if (files.length === 0) return

    // Validate passwords
    if (!userPassword) {
      setPasswordError('Please enter a password')
      return
    }

    if (userPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters long')
      return
    }

    if (userPassword !== confirmPassword) {
      setPasswordError('Passwords do not match')
      return
    }

    setPasswordError(null)
    const file = files[0]

    // Set output filename
    const originalName = file.file.name.replace('.pdf', '_protected.pdf')
    setOutputFileName(originalName)

    // Start conversion with password option
    await startConversion(file.file, 'protect-pdf', { userPassword })
  }

  const handleDownload = () => {
    download()
  }

  const handleReset = () => {
    setFiles([])
    setUserPassword('')
    setConfirmPassword('')
    setShowPassword(false)
    setShowConfirmPassword(false)
    setPasswordError(null)
    setOutputFileName(null)
    resetConversion()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Lock className="h-8 w-8 text-primary-600" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Protect PDF with Password
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Secure your PDF documents with password protection. Add encryption
              to prevent unauthorized access to your sensitive files.
            </p>
          </div>
        </div>
      </section>

      {/* Converter Section */}
      <section className="py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            {conversionState === 'idle' || conversionState === 'error' ? (
              <>
                <FileUploader
                  accept={{ 'application/pdf': ['.pdf'] }}
                  maxFiles={1}
                  maxSize={50 * 1024 * 1024}
                  onFilesSelected={handleFilesSelected}
                  title="Drop your PDF here"
                  description="or click to browse (max 50MB)"
                />

                {files.length > 0 && conversionState === 'idle' && (
                  <div className="mt-6 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={userPassword}
                          onChange={(e) => setUserPassword(e.target.value)}
                          placeholder="Enter password (min 6 characters)"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Re-enter password"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {userPassword && confirmPassword && userPassword !== confirmPassword && (
                      <p className="text-sm text-red-600">Passwords do not match</p>
                    )}

                    {userPassword && userPassword.length < 6 && (
                      <p className="text-sm text-yellow-600">
                        Password should be at least 6 characters long
                      </p>
                    )}

                    <Button
                      onClick={handleProtect}
                      className="w-full flex items-center justify-center gap-2"
                      size="lg"
                      disabled={!userPassword || !confirmPassword || userPassword !== confirmPassword || userPassword.length < 6}
                    >
                      Protect PDF
                      <ArrowRight className="h-5 w-5" />
                    </Button>
                  </div>
                )}

                <ConversionStatus
                  state={conversionState}
                  progress={progress}
                  error={error}
                  onReset={handleReset}
                  className="mt-6"
                />
              </>
            ) : (
              <ConversionStatus
                state={conversionState}
                progress={progress}
                error={error}
                downloadUrl={downloadUrl}
                fileName={outputFileName || undefined}
                onDownload={handleDownload}
                onReset={handleReset}
              />
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Why Protect Your PDFs?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Secure Documents</h3>
              <p className="text-sm text-gray-600">
                Add password protection to prevent unauthorized access to sensitive files.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Privacy Protection</h3>
              <p className="text-sm text-gray-600">
                Keep your confidential documents safe from prying eyes.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Easy to Use</h3>
              <p className="text-sm text-gray-600">
                Simple interface to quickly add password protection to any PDF.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            How to Protect PDF
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold">
                1
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Upload PDF</h3>
              <p className="text-sm text-gray-600">
                Drag and drop your PDF file or click to browse.
              </p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold">
                2
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Set Password</h3>
              <p className="text-sm text-gray-600">
                Enter a strong password to protect your document.
              </p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold">
                3
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Download</h3>
              <p className="text-sm text-gray-600">
                Download your password-protected PDF file.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
