'use client'

import { useState, useCallback } from 'react'
import { FileText, Shield, Zap, Sparkles, CheckCircle } from 'lucide-react'
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

  const handleDownload = () => {
    download()
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
    >
      <div className="max-w-3xl mx-auto">
        {conversionState === 'idle' || conversionState === 'error' ? (
          <div className="space-y-8">
            <FileUploader
              accept={{ 'application/pdf': ['.pdf'] }}
              maxFiles={1}
              maxSize={10 * 1024 * 1024}
              onFilesSelected={handleFilesSelected}
              title="Drop your PDF here"
              description="or click to browse (max 10MB)"
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
              className="mt-6"
            />
          </div>
        ) : (
          <ConversionStatus
            state={conversionState}
            progress={progress}
            error={error}
            downloadUrl={downloadUrl}
            onDownload={handleDownload}
            onReset={handleReset}
          />
        )}
        
        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 pt-12 border-t border-slate-100">
          {[
            { icon: Zap, title: 'Lightning Fast', description: 'Processed in milliseconds on the edge.', gradient: 'from-amber-400 to-orange-500' },
            { icon: CheckCircle, title: 'Perfect Format', description: 'Retains fonts, layout, and images.', gradient: 'from-emerald-400 to-teal-500' },
            { icon: Shield, title: 'Secure', description: 'Auto-deleted after 1 hour.', gradient: 'from-blue-400 to-indigo-500' },
          ].map((feature) => (
            <div key={feature.title} className="text-center group">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300`}>
                <feature.icon className="h-7 w-7 text-white" />
              </div>
              <h3 className="font-bold text-slate-900 mb-2">{feature.title}</h3>
              <p className="text-sm text-slate-500">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </PageLayout>
  )
}
