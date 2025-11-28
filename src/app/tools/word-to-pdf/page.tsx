'use client'

import { useState, useCallback } from 'react'
import { FileText, ArrowRight, Shield, Zap, Sparkles } from 'lucide-react'
import { FileUploader, UploadedFile } from '@/components/shared/FileUploader'
import { ConversionStatus, ConversionState } from '@/components/shared/ConversionStatus'
import { Button } from '@/components/ui/Button'
import { useConversionJob } from '@/hooks/useConversionJob'
import { PageLayout } from '@/components/layout/PageLayout'

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
    <PageLayout
      title="Word to PDF Converter"
      description="Convert Word documents to professional PDF format instantly. Preserves formatting and layout perfectly."
      icon={FileText}
    >
      <div className="max-w-3xl mx-auto">
        {conversionState === 'idle' || conversionState === 'error' ? (
          <div className="space-y-8">
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
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Button
                  onClick={handleConvert}
                  className="w-full flex items-center justify-center gap-2 py-6 text-lg"
                  size="lg"
                  variant="primary"
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
              className="mt-6"
            />
          </div>
        ) : (
          <div className="glass-panel p-8 rounded-2xl border border-primary-500/20 bg-primary-500/5">
            <ConversionStatus
              state={conversionState}
              progress={progress}
              error={error}
              downloadUrl={downloadUrl}
              fileName={outputFileName || undefined}
              onDownload={download}
              onReset={handleReset}
            />
          </div>
        )}

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 border-t border-white/10 pt-12">
            <div className="text-center group">
              <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary-500/20 transition-colors">
                <Zap className="h-5 w-5 text-gray-400 group-hover:text-primary-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">Universal Format</h3>
              <p className="text-sm text-gray-400">PDFs look perfect on any device.</p>
            </div>
            <div className="text-center group">
               <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-accent-purple/20 transition-colors">
                <FileText className="h-5 w-5 text-gray-400 group-hover:text-accent-purple" />
              </div>
              <h3 className="font-semibold text-white mb-2">Locked Layout</h3>
              <p className="text-sm text-gray-400">Prevents unwanted editing.</p>
            </div>
            <div className="text-center group">
               <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-accent-cyan/20 transition-colors">
                <Shield className="h-5 w-5 text-gray-400 group-hover:text-accent-cyan" />
              </div>
              <h3 className="font-semibold text-white mb-2">Professional</h3>
              <p className="text-sm text-gray-400">Industry standard format.</p>
            </div>
          </div>
      </div>
    </PageLayout>
  )
}
