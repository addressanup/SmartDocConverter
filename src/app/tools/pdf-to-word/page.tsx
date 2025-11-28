'use client'

import { useState, useCallback } from 'react'
import { FileText, Sparkles } from 'lucide-react'
import { FileUploader, UploadedFile } from '@/components/shared/FileUploader'
import { ConversionStatus, ConversionState } from '@/components/shared/ConversionStatus'
import { Button } from '@/components/ui/Button'
import { useConversionJob } from '@/hooks/useConversionJob'
import { PageLayout } from '@/components/layout/PageLayout'

export default function PdfToWordPage() {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const { status, progress, downloadUrl, error, startConversion, reset, download } = useConversionJob()

  const conversionState: ConversionState = status === 'failed' ? 'error' : status

  const handleFilesSelected = useCallback((selectedFiles: UploadedFile[]) => {
    setFiles(selectedFiles)
    reset()
  }, [reset])

  const handleConvert = async () => {
    if (files.length === 0) return
    const file = files[0]
    await startConversion(file.file, 'pdf-to-word')
  }

  const handleReset = () => {
    setFiles([])
    reset()
  }

  return (
    <PageLayout
      title="PDF to Word Converter"
      description="Transform your static PDFs into editable Word documents instantly. Powered by AI-enhanced OCR."
      icon={FileText}
      accentColor="indigo"
      maxFileSize="10MB"
      estimatedTime="~5 seconds"
      supportedFormats={['.pdf']}
    >
      {conversionState === 'idle' || conversionState === 'error' ? (
        <div className="space-y-6">
          <FileUploader
            accept={{ 'application/pdf': ['.pdf'] }}
            maxFiles={1}
            maxSize={10 * 1024 * 1024}
            onFilesSelected={handleFilesSelected}
            title="Drop your PDF here"
            description="or click to browse"
          />

          {files.length > 0 && conversionState === 'idle' && (
            <div className="animate-slide-up">
              <Button
                onClick={handleConvert}
                className="w-full py-5 text-lg"
                size="lg"
                variant="gradient"
              >
                <Sparkles className="w-5 h-5" />
                Convert to Word
              </Button>
            </div>
          )}

          <ConversionStatus
            state={conversionState}
            progress={progress}
            error={error}
            onReset={handleReset}
          />
        </div>
      ) : (
        <ConversionStatus
          state={conversionState}
          progress={progress}
          error={error}
          downloadUrl={downloadUrl}
          fileName="document.docx"
          onDownload={() => download()}
          onReset={handleReset}
        />
      )}
    </PageLayout>
  )
}
