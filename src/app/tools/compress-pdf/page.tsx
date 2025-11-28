'use client'

import { useState, useCallback, useMemo } from 'react'
import { Minimize2, Shield, Zap, Sparkles, Gauge } from 'lucide-react'
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

  const { status, progress, downloadUrl, error, metadata, startConversion, reset, download } = useConversionJob()

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

  const handleDownload = () => {
    download()
  }

  const handleReset = () => {
    setFiles([])
    reset()
  }

  const compressionOptions = [
    { id: 'low', label: 'Maximum', desc: 'Smallest Size', reduction: 'Up to 80%', gradient: 'from-teal-400 to-emerald-500' },
    { id: 'medium', label: 'Balanced', desc: 'Recommended', reduction: 'Up to 60%', gradient: 'from-indigo-400 to-purple-500' },
    { id: 'high', label: 'Quality', desc: 'Best Clarity', reduction: 'Up to 40%', gradient: 'from-rose-400 to-pink-500' },
  ]

  return (
    <PageLayout
      title="Compress PDF"
      description="Optimize your PDF files for sharing and storage. Reduce file size significantly while preserving visual quality."
      icon={Minimize2}
    >
      <div className="max-w-3xl mx-auto">
        {conversionState === 'idle' || conversionState === 'error' ? (
          <div className="space-y-8">
            <FileUploader
              accept={{ 'application/pdf': ['.pdf'] }}
              maxFiles={1}
              maxSize={50 * 1024 * 1024}
              onFilesSelected={handleFilesSelected}
              title="Drop your PDF here"
              description="or click to browse (max 50MB)"
            />

            {files.length > 0 && conversionState === 'idle' && (
              <div className="space-y-8 animate-slide-up">
                <div>
                  <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">
                    Compression Level
                  </label>
                  <div className="grid grid-cols-3 gap-4">
                    {compressionOptions.map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => setQuality(opt.id as CompressionQuality)}
                        className={cn(
                          "relative px-5 py-6 rounded-2xl border-2 text-left transition-all duration-300 overflow-hidden group",
                          quality === opt.id
                            ? 'border-indigo-400 bg-gradient-to-br from-indigo-50 to-purple-50 shadow-lg shadow-indigo-500/10'
                            : 'border-slate-200 bg-white hover:border-indigo-200 hover:bg-slate-50'
                        )}
                      >
                        {quality === opt.id && (
                          <div className={cn("absolute top-0 right-0 w-20 h-20 rounded-full blur-2xl opacity-30 bg-gradient-to-br", opt.gradient)} />
                        )}
                        <div className="relative z-10">
                          <div className={cn(
                            "text-lg font-bold mb-1 transition-colors",
                            quality === opt.id ? 'text-indigo-600' : 'text-slate-900'
                          )}>
                            {opt.label}
                          </div>
                          <div className="text-xs text-slate-500 mb-3">{opt.desc}</div>
                          <div className={cn(
                            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold",
                            quality === opt.id 
                              ? 'bg-indigo-100 text-indigo-700' 
                              : 'bg-slate-100 text-slate-600'
                          )}>
                            <Gauge className="w-3 h-3" />
                            {opt.reduction}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={handleCompress}
                  className="w-full py-5 text-lg"
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
              className="mt-6"
            />
          </div>
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

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 pt-12 border-t border-slate-100">
          {[
            { icon: Minimize2, title: 'Smart Compression', description: 'Reduce size up to 80%.', gradient: 'from-teal-400 to-emerald-500' },
            { icon: Zap, title: 'Fast Processing', description: 'Done in seconds.', gradient: 'from-amber-400 to-orange-500' },
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
