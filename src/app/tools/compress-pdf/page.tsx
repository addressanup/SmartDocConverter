'use client'

import { useState, useCallback, useMemo } from 'react'
import { Minimize2, ArrowRight, Shield, Zap, FileText } from 'lucide-react'
import { FileUploader, UploadedFile } from '@/components/shared/FileUploader'
import { ConversionStatus, ConversionState } from '@/components/shared/ConversionStatus'
import { Button } from '@/components/ui/Button'
import { useConversionJob } from '@/hooks/useConversionJob'

type CompressionQuality = 'low' | 'medium' | 'high'

export default function CompressPdfPage() {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [quality, setQuality] = useState<CompressionQuality>('medium')

  const { status, progress, downloadUrl, error, startConversion, reset, download } = useConversionJob()

  // Map hook status to ConversionState type (hook uses 'failed', ConversionState uses 'error')
  const conversionState: ConversionState = useMemo(() => {
    if (status === 'failed') return 'error'
    return status as ConversionState
  }, [status])

  const outputFileName = useMemo(() => {
    if (files.length > 0 && downloadUrl) {
      return files[0].file.name.replace('.pdf', '_compressed.pdf')
    }
    return null
  }, [files, downloadUrl])

  const handleFilesSelected = useCallback((selectedFiles: UploadedFile[]) => {
    setFiles(selectedFiles)
    reset()
  }, [reset])

  const handleCompress = async () => {
    if (files.length === 0) return

    const file = files[0]
    await startConversion(file.file, 'compress-pdf', { quality })
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
              <Minimize2 className="h-8 w-8 text-primary-600" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Compress PDF
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Reduce PDF file size while maintaining quality. Choose from multiple
              compression levels to balance size and quality.
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
                        Compression Quality
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        <button
                          onClick={() => setQuality('low')}
                          className={`px-4 py-3 rounded-lg border-2 text-sm font-medium transition-colors ${
                            quality === 'low'
                              ? 'border-primary-600 bg-primary-50 text-primary-700'
                              : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          <div className="font-semibold">Low Quality</div>
                          <div className="text-xs mt-1">Smallest Size</div>
                        </button>
                        <button
                          onClick={() => setQuality('medium')}
                          className={`px-4 py-3 rounded-lg border-2 text-sm font-medium transition-colors ${
                            quality === 'medium'
                              ? 'border-primary-600 bg-primary-50 text-primary-700'
                              : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          <div className="font-semibold">Medium</div>
                          <div className="text-xs mt-1">Balanced</div>
                        </button>
                        <button
                          onClick={() => setQuality('high')}
                          className={`px-4 py-3 rounded-lg border-2 text-sm font-medium transition-colors ${
                            quality === 'high'
                              ? 'border-primary-600 bg-primary-50 text-primary-700'
                              : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          <div className="font-semibold">High Quality</div>
                          <div className="text-xs mt-1">Best Quality</div>
                        </button>
                      </div>
                    </div>

                    <Button
                      onClick={handleCompress}
                      className="w-full flex items-center justify-center gap-2"
                      size="lg"
                    >
                      Compress PDF
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
            Why Use Our PDF Compressor?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Minimize2 className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Smart Compression</h3>
              <p className="text-sm text-gray-600">
                Reduce file size by up to 80% while maintaining visual quality.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Fast Processing</h3>
              <p className="text-sm text-gray-600">
                Compress large PDFs in seconds with our optimized engine.
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
            How to Compress PDF
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
              <h3 className="font-semibold text-gray-900 mb-2">Choose Quality</h3>
              <p className="text-sm text-gray-600">
                Select compression level based on your needs.
              </p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold">
                3
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Download</h3>
              <p className="text-sm text-gray-600">
                Download your compressed PDF file.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
