'use client'

import { useState, useCallback } from 'react'
import { ImageIcon, ArrowRight, Shield, Zap, FileText } from 'lucide-react'
import { FileUploader, UploadedFile } from '@/components/shared/FileUploader'
import { ConversionStatus, ConversionState } from '@/components/shared/ConversionStatus'
import { Button } from '@/components/ui/Button'
import { useConversionJob } from '@/hooks/useConversionJob'

export default function JpgToPdfPage() {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [outputFileName, setOutputFileName] = useState<string | null>(null)

  const {
    status,
    progress,
    downloadUrl,
    error,
    startConversion,
    startMultiFileConversion,
    reset,
    download
  } = useConversionJob()

  // Map hook status to ConversionState (hook uses 'failed', ConversionState uses 'error')
  const conversionState: ConversionState = status === 'failed' ? 'error' : status

  const handleFilesSelected = useCallback((selectedFiles: UploadedFile[]) => {
    setFiles(selectedFiles)
    reset()
    setOutputFileName(null)
  }, [reset])

  const handleConvert = async () => {
    if (files.length === 0) return

    // Set output file name
    const originalName = files[0].file.name.replace(/\.(jpg|jpeg|png)$/i, '.pdf')
    setOutputFileName(originalName)

    // Use appropriate conversion method based on file count
    if (files.length === 1) {
      await startConversion(files[0].file, 'jpg-to-pdf')
    } else {
      await startMultiFileConversion(files.map(f => f.file), 'jpg-to-pdf')
    }
  }

  const handleDownload = () => {
    download()
  }

  const handleReset = () => {
    setFiles([])
    reset()
    setOutputFileName(null)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <ImageIcon className="h-8 w-8 text-primary-600" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              JPG to PDF Converter
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Convert JPG, JPEG, and PNG images to PDF format. Combine multiple images
              into a single PDF document.
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
                  accept={{
                    'image/jpeg': ['.jpg', '.jpeg'],
                    'image/png': ['.png'],
                  }}
                  maxFiles={20}
                  maxSize={10 * 1024 * 1024}
                  onFilesSelected={handleFilesSelected}
                  title="Drop your images here"
                  description="or click to browse (JPG, JPEG, PNG - max 10MB each)"
                />

                {files.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600">
                      {files.length} image{files.length !== 1 ? 's' : ''} selected
                      {files.length > 1 && ' - will be combined into one PDF'}
                    </p>
                  </div>
                )}

                {files.length > 0 && conversionState === 'idle' && (
                  <div className="mt-6">
                    <Button
                      onClick={handleConvert}
                      className="w-full flex items-center justify-center gap-2"
                      size="lg"
                    >
                      Convert to PDF
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
            Why Use Our JPG to PDF Converter?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ImageIcon className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Multiple Images</h3>
              <p className="text-sm text-gray-600">
                Convert single or multiple images to PDF in one go.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Fast Conversion</h3>
              <p className="text-sm text-gray-600">
                Convert images to PDF format in seconds.
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
            How to Convert JPG to PDF
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold">
                1
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Upload Images</h3>
              <p className="text-sm text-gray-600">
                Select one or more JPG/PNG images to convert.
              </p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold">
                2
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Convert</h3>
              <p className="text-sm text-gray-600">
                Click the convert button and wait a few seconds.
              </p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold">
                3
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Download</h3>
              <p className="text-sm text-gray-600">
                Download your PDF document.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
