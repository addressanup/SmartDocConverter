'use client'

import { useState, useCallback, useEffect } from 'react'
import { ScanText, ArrowRight, Shield, Zap, Languages } from 'lucide-react'
import { FileUploader, UploadedFile } from '@/components/shared/FileUploader'
import { ConversionStatus, ConversionState } from '@/components/shared/ConversionStatus'
import { Button } from '@/components/ui/Button'
import { useConversionJob } from '@/hooks/useConversionJob'

export default function ImageToTextPage() {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [outputFileName, setOutputFileName] = useState<string | null>(null)
  const [extractedText, setExtractedText] = useState<string | null>(null)

  const { status, progress, downloadUrl, error, startConversion, reset: resetConversion, download } = useConversionJob()

  // Map hook status to ConversionState (hook uses 'failed', UI uses 'error')
  const conversionState: ConversionState = status === 'failed' ? 'error' : status

  // Fetch extracted text when conversion completes
  useEffect(() => {
    const fetchExtractedText = async () => {
      if (status === 'completed' && downloadUrl) {
        try {
          const response = await fetch(downloadUrl)
          if (response.ok) {
            const text = await response.text()
            setExtractedText(text)
          }
        } catch (err) {
          console.error('Failed to fetch extracted text:', err)
        }
      }
    }

    fetchExtractedText()
  }, [status, downloadUrl])

  const handleFilesSelected = useCallback((selectedFiles: UploadedFile[]) => {
    setFiles(selectedFiles)
    resetConversion()
    setExtractedText(null)
    setOutputFileName(null)
  }, [resetConversion])

  const handleExtract = async () => {
    if (files.length === 0) return

    const file = files[0]
    const originalName = file.file.name.replace(/\.(jpg|jpeg|png|pdf)$/i, '.txt')
    setOutputFileName(originalName)

    // Start the conversion using the hook
    await startConversion(file.file, 'image-to-text')
  }


  const handleCopyText = () => {
    if (extractedText) {
      navigator.clipboard.writeText(extractedText)
    }
  }

  const handleReset = () => {
    setFiles([])
    resetConversion()
    setOutputFileName(null)
    setExtractedText(null)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <ScanText className="h-8 w-8 text-primary-600" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Image to Text (OCR)
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Extract text from images using advanced OCR technology. Convert scanned
              documents, screenshots, and photos to editable text.
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
                    'application/pdf': ['.pdf'],
                  }}
                  maxFiles={1}
                  maxSize={10 * 1024 * 1024}
                  onFilesSelected={handleFilesSelected}
                  title="Drop your image or PDF here"
                  description="or click to browse (JPG, PNG, PDF - max 10MB)"
                />

                {files.length > 0 && conversionState === 'idle' && (
                  <div className="mt-6">
                    <Button
                      onClick={handleExtract}
                      className="w-full flex items-center justify-center gap-2"
                      size="lg"
                    >
                      Extract Text
                      <ArrowRight className="h-5 w-5" />
                    </Button>
                  </div>
                )}

                <ConversionStatus
                  state={conversionState}
                  progress={progress}
                  error={error || undefined}
                  onReset={handleReset}
                  className="mt-6"
                />
              </>
            ) : conversionState === 'completed' && extractedText ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Extracted Text</h3>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleCopyText}
                      variant="outline"
                      size="sm"
                    >
                      Copy Text
                    </Button>
                    <Button
                      onClick={download}
                      size="sm"
                    >
                      Download TXT
                    </Button>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono">
                    {extractedText}
                  </pre>
                </div>
                <Button
                  onClick={handleReset}
                  variant="outline"
                  className="w-full"
                >
                  Extract Another Image
                </Button>
              </div>
            ) : (
              <ConversionStatus
                state={conversionState}
                progress={progress}
                error={error || undefined}
                downloadUrl={downloadUrl || undefined}
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
            Why Use Our OCR Tool?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ScanText className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Accurate OCR</h3>
              <p className="text-sm text-gray-600">
                Advanced optical character recognition with high accuracy.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Languages className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Multi-Language</h3>
              <p className="text-sm text-gray-600">
                Supports text extraction in multiple languages.
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
            How to Extract Text from Images
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold">
                1
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Upload Image</h3>
              <p className="text-sm text-gray-600">
                Drag and drop your image or PDF file.
              </p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold">
                2
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Extract</h3>
              <p className="text-sm text-gray-600">
                Our OCR engine processes and extracts the text.
              </p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold">
                3
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Copy or Download</h3>
              <p className="text-sm text-gray-600">
                Copy the text or download it as a TXT file.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
