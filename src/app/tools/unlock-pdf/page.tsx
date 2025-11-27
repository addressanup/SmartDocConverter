'use client'

import { useState, useCallback } from 'react'
import { Unlock, ArrowRight, Shield, Zap, Lock } from 'lucide-react'
import { FileUploader, UploadedFile } from '@/components/shared/FileUploader'
import { ConversionStatus, ConversionState } from '@/components/shared/ConversionStatus'
import { Button } from '@/components/ui/Button'
import { useConversionJob } from '@/hooks/useConversionJob'

export default function UnlockPdfPage() {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [password, setPassword] = useState('')
  const [outputFileName, setOutputFileName] = useState<string | null>(null)

  const {
    status,
    progress,
    error,
    downloadUrl,
    startConversion,
    reset: resetConversion,
    download,
  } = useConversionJob()

  // Map hook status to ConversionState (hook returns 'failed' but ConversionState uses 'error')
  const conversionState: ConversionState = status === 'failed' ? 'error' : status

  const handleFilesSelected = useCallback((selectedFiles: UploadedFile[]) => {
    setFiles(selectedFiles)
    resetConversion()
    setPassword('')
    setOutputFileName(null)
  }, [resetConversion])

  const handleUnlock = async () => {
    if (files.length === 0) return

    const file = files[0]

    // Set output filename for display
    const originalName = file.file.name.replace('.pdf', '_unlocked.pdf')
    setOutputFileName(originalName)

    // Start conversion with password as an option
    await startConversion(file.file, 'unlock-pdf', { password })
  }

  const handleReset = () => {
    setFiles([])
    resetConversion()
    setOutputFileName(null)
    setPassword('')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Unlock className="h-8 w-8 text-primary-600" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Unlock PDF
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Remove password protection from your PDF files. Enter the password and unlock
              your PDF to make it freely accessible.
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
                  title="Drop your password-protected PDF here"
                  description="or click to browse (max 50MB)"
                />

                {files.length > 0 && conversionState === 'idle' && (
                  <div className="mt-6 space-y-4">
                    <div>
                      <label
                        htmlFor="password"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        PDF Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          id="password"
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter PDF password"
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
                        />
                      </div>
                      <p className="mt-2 text-xs text-gray-500">
                        Enter the password required to open the PDF. Leave empty if the PDF
                        has no password.
                      </p>
                    </div>

                    <Button
                      onClick={handleUnlock}
                      className="w-full flex items-center justify-center gap-2"
                      size="lg"
                    >
                      Unlock PDF
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
                onDownload={download}
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
            Why Use Our PDF Unlocker?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Unlock className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Easy Unlocking</h3>
              <p className="text-sm text-gray-600">
                Remove password protection from PDFs instantly with the correct password.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Fast Processing</h3>
              <p className="text-sm text-gray-600">
                Unlock PDFs in seconds without compromising document integrity.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Secure & Private</h3>
              <p className="text-sm text-gray-600">
                Your files and passwords are processed securely and deleted after 1 hour.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            How to Unlock PDF
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold">
                1
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Upload PDF</h3>
              <p className="text-sm text-gray-600">
                Drag and drop your password-protected PDF file.
              </p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold">
                2
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Enter Password</h3>
              <p className="text-sm text-gray-600">
                Type the password required to open the PDF.
              </p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold">
                3
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Download</h3>
              <p className="text-sm text-gray-600">
                Download your unlocked PDF without password protection.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
