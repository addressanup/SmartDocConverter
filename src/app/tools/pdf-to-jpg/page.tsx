'use client'

import { useState, useCallback } from 'react'
import { Image, ArrowRight, Shield, Zap, FileText } from 'lucide-react'
import { FileUploader, UploadedFile } from '@/components/shared/FileUploader'
import { ConversionStatus, ConversionState } from '@/components/shared/ConversionStatus'
import { Button } from '@/components/ui/Button'
import { useConversionJob } from '@/hooks/useConversionJob'

type ImageQuality = 'low' | 'medium' | 'high'

export default function PdfToJpgPage() {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [quality, setQuality] = useState<ImageQuality>('high')

  const { status, progress, downloadUrl, error, startConversion, reset, download } = useConversionJob()

  // Map hook status to ConversionState (hook returns 'failed' but ConversionState uses 'error')
  const conversionState: ConversionState = status === 'failed' ? 'error' : status

  const handleFilesSelected = useCallback((selectedFiles: UploadedFile[]) => {
    setFiles(selectedFiles)
    reset()
  }, [reset])

  const handleConvert = async () => {
    if (files.length === 0) return

    const file = files[0]
    await startConversion(file.file, 'pdf-to-jpg', { quality })
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
              <Image className="h-8 w-8 text-primary-600" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              PDF to JPG Converter
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Convert PDF pages to high-quality JPG images. Each page becomes a
              separate image file.
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
                        Image Quality
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
                          <div className="font-semibold">Low</div>
                          <div className="text-xs mt-1">72 DPI</div>
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
                          <div className="text-xs mt-1">150 DPI</div>
                        </button>
                        <button
                          onClick={() => setQuality('high')}
                          className={`px-4 py-3 rounded-lg border-2 text-sm font-medium transition-colors ${
                            quality === 'high'
                              ? 'border-primary-600 bg-primary-50 text-primary-700'
                              : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          <div className="font-semibold">High</div>
                          <div className="text-xs mt-1">300 DPI</div>
                        </button>
                      </div>
                    </div>

                    <Button
                      onClick={handleConvert}
                      className="w-full flex items-center justify-center gap-2"
                      size="lg"
                    >
                      Convert to JPG
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
                downloadUrl={downloadUrl || undefined}
                fileName="pdf_images.zip"
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
            Why Use Our PDF to JPG Converter?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Image className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">High Quality</h3>
              <p className="text-sm text-gray-600">
                Export PDF pages as high-resolution JPG images up to 300 DPI.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Fast Conversion</h3>
              <p className="text-sm text-gray-600">
                Convert all PDF pages to images in seconds.
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
            How to Convert PDF to JPG
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
                Select the image quality (DPI) for your JPG files.
              </p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold">
                3
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Download</h3>
              <p className="text-sm text-gray-600">
                Download your images as a ZIP file.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
