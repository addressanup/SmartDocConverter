'use client'

import { useState, useCallback } from 'react'
import { FileText, Sparkles } from 'lucide-react'
import { FileUploader, UploadedFile } from '@/components/shared/FileUploader'
import { ConversionStatus, ConversionState } from '@/components/shared/ConversionStatus'
import { Button } from '@/components/ui/Button'
import { useConversionJob } from '@/hooks/useConversionJob'
import { PageLayout } from '@/components/layout/PageLayout'

export default function WordToPdfPage() {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [outputFileName, setOutputFileName] = useState<string | null>(null)

  const { status, progress, downloadUrl, error, startConversion, reset: resetJob, download } = useConversionJob()

  const conversionState: ConversionState = status === 'failed' ? 'error' : status as ConversionState

  const handleFilesSelected = useCallback((selectedFiles: UploadedFile[]) => {
    setFiles(selectedFiles)
    setOutputFileName(null)
    resetJob()
  }, [resetJob])

  const handleConvert = async () => {
    if (files.length === 0) return
    const file = files[0]
    setOutputFileName(file.file.name.replace(/\.(docx?|doc)$/i, '.pdf'))
    await startConversion(file.file, 'word-to-pdf')
  }

  const handleReset = () => {
    setFiles([])
    setOutputFileName(null)
    resetJob()
  }

  return (
    <PageLayout
      title="Word to PDF Converter"
      description="Convert Word documents to professional PDF format instantly. Preserves formatting and layout perfectly."
      icon={FileText}
      accentColor="indigo"
      maxFileSize="10MB"
      estimatedTime="~5 seconds"
      supportedFormats={['.doc', '.docx']}
    >
      {conversionState === 'idle' || conversionState === 'error' ? (
        <div className="space-y-6">
          <FileUploader
            accept={{
              'application/msword': ['.doc'],
              'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
            }}
            maxFiles={1}
            maxSize={10 * 1024 * 1024}
            onFilesSelected={handleFilesSelected}
            title="Drop your Word file here"
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
                Convert to PDF
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
          fileName={outputFileName || undefined}
          onDownload={() => download()}
          onReset={handleReset}
        />
      )}
    </PageLayout>
  )
}
