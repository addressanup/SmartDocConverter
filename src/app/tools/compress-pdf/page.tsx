'use client'

import { useState, useCallback, useMemo } from 'react'
import { Minimize2, Sparkles, Gauge } from 'lucide-react'
import { FileUploader, UploadedFile } from '@/components/shared/FileUploader'
import { ConversionStatus, ConversionState } from '@/components/shared/ConversionStatus'
import { Button } from '@/components/ui/Button'
import { useConversionJob } from '@/hooks/useConversionJob'
import { PageLayout } from '@/components/layout/PageLayout'
import { cn } from '@/lib/utils'

type CompressionQuality = 'low' | 'medium' | 'high'

export default function CompressPdfPage() {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [quality, setQuality] = useState<CompressionQuality>('medium')

  const { status, progress, downloadUrl, error, startConversion, reset, download } = useConversionJob()

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

  const handleReset = () => {
    setFiles([])
    reset()
  }

  const compressionOptions = [
    { id: 'low', label: 'Maximum', desc: 'Smallest Size', reduction: 'Up to 80%' },
    { id: 'medium', label: 'Balanced', desc: 'Recommended', reduction: 'Up to 60%' },
    { id: 'high', label: 'Quality', desc: 'Best Clarity', reduction: 'Up to 40%' },
  ]

  return (
    <PageLayout
      title="Compress PDF"
      description="Optimize your PDF files for sharing and storage. Reduce file size significantly while preserving visual quality."
      icon={Minimize2}
      accentColor="emerald"
      maxFileSize="50MB"
      estimatedTime="~3 seconds"
      supportedFormats={['.pdf']}
    >
      {conversionState === 'idle' || conversionState === 'error' ? (
        <div className="space-y-6">
          <FileUploader
            accept={{ 'application/pdf': ['.pdf'] }}
            maxFiles={1}
            maxSize={50 * 1024 * 1024}
            onFilesSelected={handleFilesSelected}
            title="Drop your PDF here"
            description="or click to browse"
          />

          {files.length > 0 && conversionState === 'idle' && (
            <div className="space-y-6 animate-slide-up">
              <div>
                <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">
                  Compression Level
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {compressionOptions.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setQuality(opt.id as CompressionQuality)}
                      className={cn(
                        "relative px-4 py-5 rounded-2xl border-2 text-left transition-all duration-300",
                        quality === opt.id
                          ? 'border-emerald-400 bg-gradient-to-br from-emerald-50 to-teal-50 shadow-lg'
                          : 'border-slate-200 bg-white hover:border-emerald-200 hover:bg-slate-50'
                      )}
                    >
                      <div className={cn(
                        "text-base font-bold mb-1 transition-colors",
                        quality === opt.id ? 'text-emerald-600' : 'text-slate-900'
                      )}>
                        {opt.label}
                      </div>
                      <div className="text-xs text-slate-500 mb-2">{opt.desc}</div>
                      <div className={cn(
                        "inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-semibold",
                        quality === opt.id 
                          ? 'bg-emerald-100 text-emerald-700' 
                          : 'bg-slate-100 text-slate-600'
                      )}>
                        <Gauge className="w-3 h-3" />
                        {opt.reduction}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <Button
                onClick={handleCompress}
                className="w-full py-5 text-lg bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                size="lg"
                variant="gradient"
              >
                <Sparkles className="w-5 h-5" />
                Compress PDF
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
