'use client'

import { useState, useCallback } from 'react'
import { FileText, ArrowRight, Shield, Zap } from 'lucide-react'
import { FileUploader, UploadedFile } from '@/components/shared/FileUploader'
import { ConversionStatus, ConversionState } from '@/components/shared/ConversionStatus'
import { Button } from '@/components/ui/Button'
import { useConversionJob } from '@/hooks/useConversionJob'

export default function WordToPdfPage() {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [outputFileName, setOutputFileName] = useState<string | null>(null)

  const {
    status,
    progress,
    downloadUrl,
    error,
    startConversion,
    reset: resetJob,
    download
  } = useConversionJob()

  // Map hook status to ConversionState type (hook returns 'failed' but ConversionState uses 'error')
  const conversionState: ConversionState = status === 'failed' ? 'error' : status as ConversionState

  const handleFilesSelected = useCallback((selectedFiles: UploadedFile[]) => {
    setFiles(selectedFiles)
    setOutputFileName(null)
    resetJob()
  }, [resetJob])

  const handleConvert = async () => {
    if (files.length === 0) return

    const file = files[0]

    // Set output filename based on input file
    const originalName = file.file.name.replace(/\.(docx?|doc)$/i, '.pdf')
    setOutputFileName(originalName)

    // Use the hook to start conversion with proper job polling
    await startConversion(file.file, 'word-to-pdf')
  }

  const handleReset = () => {
    setFiles([])
    setOutputFileName(null)
    resetJob()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-gradient-to-br from-primary-50 to-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <FileText className="h-8 w-8 text-primary-600" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Word to PDF Converter
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Convert Word documents to PDF format instantly.
              Perfect for sharing documents with preserved formatting.
            </p>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            {conversionState === 'idle' || conversionState === 'error' ? (
              <>
                <FileUploader
                  accept={{
                    'application/msword': ['.doc'],
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
                  }}
                  maxFiles={1}
                  maxSize={10 * 1024 * 1024}
                  onFilesSelected={handleFilesSelected}
                  title="Drop your Word file here"
                  description="or click to browse (.doc, .docx - max 10MB)"
                />

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
                onDownload={download}
                onReset={handleReset}
              />
            )}
          </div>
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Why Convert Word to PDF?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Universal Format</h3>
              <p className="text-sm text-gray-600">
                PDF files look the same on any device without special software.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Locked Formatting</h3>
              <p className="text-sm text-gray-600">
                Prevent unwanted changes to your document layout.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Professional</h3>
              <p className="text-sm text-gray-600">
                PDF is the standard format for professional document sharing.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
