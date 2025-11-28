'use client'

import { useState, useCallback } from 'react'
import { Image, ArrowRight, Shield, Zap, FileText, Sparkles } from 'lucide-react'
import { FileUploader, UploadedFile } from '@/components/shared/FileUploader'
import { ConversionStatus, ConversionState } from '@/components/shared/ConversionStatus'
import { Button } from '@/components/ui/Button'
import { useConversionJob } from '@/hooks/useConversionJob'
import { PageLayout } from '@/components/layout/PageLayout'

type ImageQuality = 'low' | 'medium' | 'high'

export default function PdfToJpgPage() {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [quality, setQuality] = useState<ImageQuality>('high')

  const { status, progress, downloadUrl, error, startConversion, reset, download } = useConversionJob()

  // Map hook status to ConversionState (hook returns 'failed' but ConversionState uses 'error')
  const conversionState: ConversionState = status === 'failed' ? 'error' : status

  const handleFilesSelected = useCallback((selectedFiles: UploadedFile[]) => {
    setFiles(selectedFiles)
    reset()
  }, [reset])

  const handleConvert = async () => {
    if (files.length === 0) return

    const file = files[0]
    
    // Map string quality to number
    let numericQuality = 90
    if (quality === 'low') numericQuality = 60
    else if (quality === 'medium') numericQuality = 80
    else if (quality === 'high') numericQuality = 100

    await startConversion(file.file, 'pdf-to-jpg', { quality: numericQuality })
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
      title="PDF to JPG Converter"
      description="Convert each page of your PDF document into high-quality JPG images. Supports batch extraction."
      icon={Image}
    >
      <div className="max-w-3xl mx-auto">
        {conversionState === 'idle' || conversionState === 'error' ? (
          <div className="space-y-8">
            <FileUploader
              accept={{ 'application/pdf': ['.pdf'] }}
              maxFiles={1}
              maxSize={20 * 1024 * 1024}
              onFilesSelected={handleFilesSelected}
              title="Drop your PDF here"
              description="or click to browse (max 20MB)"
            />

            {files.length > 0 && conversionState === 'idle' && (
              <div className="mt-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-4">
                    Image Quality
                  </label>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { id: 'low', label: 'Low', desc: '72 DPI' },
                      { id: 'medium', label: 'Medium', desc: '150 DPI' },
                      { id: 'high', label: 'High', desc: '300 DPI' },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => setQuality(opt.id as ImageQuality)}
                        className={`px-4 py-4 rounded-xl border transition-all duration-200 ${
                          quality === opt.id
                            ? 'border-primary-500 bg-primary-500/20 text-white shadow-[0_0_15px_rgba(14,165,233,0.3)]'
                            : 'border-white/10 bg-white/5 text-gray-400 hover:bg-white/10 hover:border-white/20'
                        }`}
                      >
                        <div className="font-bold text-lg mb-1">{opt.label}</div>
                        <div className="text-xs opacity-70">{opt.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={handleConvert}
                  className="w-full flex items-center justify-center gap-2 py-6 text-lg"
                  size="lg"
                  variant="primary"
                >
                  <Sparkles className="w-5 h-5" />
                  Convert to JPG
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
              downloadUrl={downloadUrl || undefined}
              fileName="pdf_images.zip"
              onDownload={handleDownload}
              onReset={handleReset}
            />
          </div>
        )}

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 border-t border-white/10 pt-12">
            <div className="text-center group">
              <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary-500/20 transition-colors">
                <Image className="h-5 w-5 text-gray-400 group-hover:text-primary-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">High Res</h3>
              <p className="text-sm text-gray-400">Up to 300 DPI quality.</p>
            </div>
            <div className="text-center group">
               <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-accent-purple/20 transition-colors">
                <Zap className="h-5 w-5 text-gray-400 group-hover:text-accent-purple" />
              </div>
              <h3 className="font-semibold text-white mb-2">Batch Export</h3>
              <p className="text-sm text-gray-400">All pages at once.</p>
            </div>
            <div className="text-center group">
               <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-accent-cyan/20 transition-colors">
                <Shield className="h-5 w-5 text-gray-400 group-hover:text-accent-cyan" />
              </div>
              <h3 className="font-semibold text-white mb-2">Secure</h3>
              <p className="text-sm text-gray-400">Auto-deleted after 1 hour.</p>
            </div>
          </div>
      </div>
    </PageLayout>
  )
}
