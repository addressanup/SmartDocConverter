'use client'

import { useState, useCallback } from 'react'
import { Scissors, ArrowRight, Shield, Zap, FileText } from 'lucide-react'
import { FileUploader, UploadedFile } from '@/components/shared/FileUploader'
import { ConversionStatus, ConversionState } from '@/components/shared/ConversionStatus'
import { Button } from '@/components/ui/Button'
import { useConversionJob } from '@/hooks/useConversionJob'

type SplitMode = 'all' | 'range' | 'custom'

export default function SplitPdfPage() {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [splitMode, setSplitMode] = useState<SplitMode>('all')
  const [pageRange, setPageRange] = useState('')

  const { status, progress, downloadUrl, error, startConversion, reset: hookReset, download } = useConversionJob()

  // Map hook status to ConversionState - note: hook returns 'failed' but ConversionState uses 'error'
  const conversionState: ConversionState = status === 'failed' ? 'error' : status
  const outputFileName = 'split_pages.zip'

  const handleFilesSelected = useCallback((selectedFiles: UploadedFile[]) => {
    setFiles(selectedFiles)
    hookReset()
  }, [hookReset])

  const handleSplit = async () => {
    if (files.length === 0) return

    const file = files[0]

    await startConversion(file.file, 'split-pdf', {
      mode: splitMode,
      pageRange: splitMode === 'range' || splitMode === 'custom' ? pageRange : undefined,
    })
  }

  const handleReset = () => {
    setFiles([])
    setPageRange('')
    hookReset()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Scissors className="h-8 w-8 text-primary-600" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Split PDF
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Extract pages from your PDF. Split into individual pages or extract
              specific page ranges.
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
                  maxSize={20 * 1024 * 1024}
                  onFilesSelected={handleFilesSelected}
                  title="Drop your PDF here"
                  description="or click to browse (max 20MB)"
                />

                {files.length > 0 && conversionState === 'idle' && (
                  <div className="mt-6 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Split Mode
                      </label>
                      <div className="space-y-3">
                        <button
                          onClick={() => setSplitMode('all')}
                          className={`w-full px-4 py-3 rounded-lg border-2 text-left transition-colors ${
                            splitMode === 'all'
                              ? 'border-primary-600 bg-primary-50'
                              : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                        >
                          <div className="font-medium text-gray-900">All Pages</div>
                          <div className="text-sm text-gray-600">
                            Split into individual pages
                          </div>
                        </button>
                        <button
                          onClick={() => setSplitMode('range')}
                          className={`w-full px-4 py-3 rounded-lg border-2 text-left transition-colors ${
                            splitMode === 'range'
                              ? 'border-primary-600 bg-primary-50'
                              : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                        >
                          <div className="font-medium text-gray-900">Page Range</div>
                          <div className="text-sm text-gray-600">
                            Extract specific pages (e.g., 1-5, 10)
                          </div>
                        </button>
                        <button
                          onClick={() => setSplitMode('custom')}
                          className={`w-full px-4 py-3 rounded-lg border-2 text-left transition-colors ${
                            splitMode === 'custom'
                              ? 'border-primary-600 bg-primary-50'
                              : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                        >
                          <div className="font-medium text-gray-900">Custom Split</div>
                          <div className="text-sm text-gray-600">
                            Specify page numbers (e.g., 1,3,5-7)
                          </div>
                        </button>
                      </div>
                    </div>

                    {(splitMode === 'range' || splitMode === 'custom') && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {splitMode === 'range' ? 'Page Range' : 'Page Numbers'}
                        </label>
                        <input
                          type="text"
                          value={pageRange}
                          onChange={(e) => setPageRange(e.target.value)}
                          placeholder={
                            splitMode === 'range'
                              ? 'e.g., 1-5 or 10-15'
                              : 'e.g., 1,3,5-7,10'
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                    )}

                    <Button
                      onClick={handleSplit}
                      className="w-full flex items-center justify-center gap-2"
                      size="lg"
                    >
                      Split PDF
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
            Why Use Our PDF Splitter?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Scissors className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Flexible Splitting</h3>
              <p className="text-sm text-gray-600">
                Extract all pages or choose specific pages and ranges.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Fast Processing</h3>
              <p className="text-sm text-gray-600">
                Split PDFs quickly with our optimized engine.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Secure & Private</h3>
              <p className="text-sm text-gray-600">
                Files are automatically deleted after 1 hour. We never share your data.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            How to Split PDF
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
              <h3 className="font-semibold text-gray-900 mb-2">Choose Pages</h3>
              <p className="text-sm text-gray-600">
                Select split mode and specify pages if needed.
              </p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold">
                3
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Download</h3>
              <p className="text-sm text-gray-600">
                Download your split PDF pages as a ZIP file.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
