'use client'

import { useState, useCallback } from 'react'
import { Layers, ArrowRight, Shield, Zap, FileText } from 'lucide-react'
import { FileUploader, UploadedFile } from '@/components/shared/FileUploader'
import { ConversionStatus, ConversionState } from '@/components/shared/ConversionStatus'
import { Button } from '@/components/ui/Button'
import { useConversionJob } from '@/hooks/useConversionJob'

export default function MergePdfPage() {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const {
    status,
    progress,
    downloadUrl,
    error,
    startMultiFileConversion,
    reset,
    download,
  } = useConversionJob()

  // Map hook status to ConversionState type (hook returns 'failed' but ConversionState uses 'error')
  const conversionState: ConversionState = status === 'failed' ? 'error' : status

  const handleFilesSelected = useCallback((selectedFiles: UploadedFile[]) => {
    setFiles(selectedFiles)
    reset()
  }, [reset])

  const handleMerge = async () => {
    if (files.length < 2) return

    await startMultiFileConversion(files.map(f => f.file), 'merge-pdf')
  }

  const handleDownload = () => {
    download()
  }

  const handleReset = () => {
    setFiles([])
    reset()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Layers className="h-8 w-8 text-primary-600" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Merge PDF Files
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Combine multiple PDF files into a single document. Upload 2 or more PDFs
              and merge them in your preferred order.
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
                  maxFiles={10}
                  maxSize={10 * 1024 * 1024}
                  onFilesSelected={handleFilesSelected}
                  title="Drop your PDF files here"
                  description="or click to browse (2-10 files, max 10MB each)"
                />

                {files.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 mb-2">
                      Files will be merged in this order:
                    </p>
                    <div className="text-sm text-gray-500">
                      {files.length} file{files.length !== 1 ? 's' : ''} selected
                    </div>
                  </div>
                )}

                {files.length >= 2 && conversionState === 'idle' && (
                  <div className="mt-6">
                    <Button
                      onClick={handleMerge}
                      className="w-full flex items-center justify-center gap-2"
                      size="lg"
                    >
                      Merge PDFs
                      <ArrowRight className="h-5 w-5" />
                    </Button>
                  </div>
                )}

                {files.length === 1 && conversionState === 'idle' && (
                  <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      Please select at least 2 PDF files to merge.
                    </p>
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
                downloadUrl={downloadUrl || undefined}
                fileName="merged.pdf"
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
            Why Use Our PDF Merger?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Layers className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Multiple Files</h3>
              <p className="text-sm text-gray-600">
                Merge up to 10 PDF files at once in your preferred order.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Fast Merging</h3>
              <p className="text-sm text-gray-600">
                Combine PDFs in seconds with our optimized processing engine.
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
            How to Merge PDFs
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold">
                1
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Upload PDFs</h3>
              <p className="text-sm text-gray-600">
                Select 2 or more PDF files to merge together.
              </p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold">
                2
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Merge</h3>
              <p className="text-sm text-gray-600">
                Click the merge button and wait a few seconds.
              </p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold">
                3
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Download</h3>
              <p className="text-sm text-gray-600">
                Download your combined PDF document.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
