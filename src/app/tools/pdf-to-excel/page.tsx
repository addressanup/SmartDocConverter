'use client'

import { useState, useCallback } from 'react'
import { FileSpreadsheet, ArrowRight, Shield, Zap, Table } from 'lucide-react'
import { FileUploader, UploadedFile } from '@/components/shared/FileUploader'
import { ConversionStatus, ConversionState } from '@/components/shared/ConversionStatus'
import { Button } from '@/components/ui/Button'
import { useConversionJob } from '@/hooks/useConversionJob'

export default function PdfToExcelPage() {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [outputFileName, setOutputFileName] = useState<string | null>(null)

  const { status, progress, downloadUrl, error, startConversion, reset, download } = useConversionJob()

  // Map hook status to ConversionState type (hook returns 'failed' but ConversionState uses 'error')
  const conversionState: ConversionState = status === 'failed' ? 'error' : status

  const handleFilesSelected = useCallback((selectedFiles: UploadedFile[]) => {
    setFiles(selectedFiles)
    setOutputFileName(null)
    reset()
  }, [reset])

  const handleConvert = async () => {
    if (files.length === 0) return

    const file = files[0]
    const originalName = file.file.name.replace('.pdf', '.xlsx')
    setOutputFileName(originalName)

    await startConversion(file.file, 'pdf-to-excel')
  }

  const handleReset = () => {
    setFiles([])
    setOutputFileName(null)
    reset()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-gradient-to-br from-primary-50 to-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <FileSpreadsheet className="h-8 w-8 text-primary-600" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              PDF to Excel Converter
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Extract tables and data from PDF files into editable Excel spreadsheets.
              Perfect for data analysis and reporting.
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
                  accept={{ 'application/pdf': ['.pdf'] }}
                  maxFiles={1}
                  maxSize={10 * 1024 * 1024}
                  onFilesSelected={handleFilesSelected}
                  title="Drop your PDF here"
                  description="or click to browse (max 10MB)"
                />

                {files.length > 0 && conversionState === 'idle' && (
                  <div className="mt-6">
                    <Button
                      onClick={handleConvert}
                      className="w-full flex items-center justify-center gap-2"
                      size="lg"
                    >
                      Convert to Excel
                      <ArrowRight className="h-5 w-5" />
                    </Button>
                  </div>
                )}

                {conversionState === 'error' && (
                  <ConversionStatus
                    state={conversionState}
                    progress={progress}
                    error={error}
                    onReset={handleReset}
                    className="mt-6"
                  />
                )}
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
            PDF to Excel Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Table className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Table Detection</h3>
              <p className="text-sm text-gray-600">
                Automatically detects and extracts tables from your PDF.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Accurate Data</h3>
              <p className="text-sm text-gray-600">
                Preserves numbers, dates, and text formatting accurately.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Editable Output</h3>
              <p className="text-sm text-gray-600">
                Get a fully editable Excel file ready for analysis.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
