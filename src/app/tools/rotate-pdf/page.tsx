'use client'

import { useState, useCallback } from 'react'
import { RotateCw, ArrowRight, Shield, Zap, FileText, Sparkles, Undo2 } from 'lucide-react'
import { FileUploader, UploadedFile } from '@/components/shared/FileUploader'
import { ConversionStatus, ConversionState } from '@/components/shared/ConversionStatus'
import { Button } from '@/components/ui/Button'
import { useConversionJob } from '@/hooks/useConversionJob'
import { PageLayout } from '@/components/layout/PageLayout'
import { cn } from '@/lib/utils'

type RotationAngle = 90 | 180 | 270

export default function RotatePdfPage() {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [rotation, setRotation] = useState<RotationAngle>(90)

  const {
    status,
    progress,
    downloadUrl,
    error,
    startConversion,
    reset,
    download,
  } = useConversionJob()

  // Map hook status to ConversionState type (hook returns 'failed' but ConversionState uses 'error')
  const conversionState: ConversionState = status === 'failed' ? 'error' : status

  const handleFilesSelected = useCallback((selectedFiles: UploadedFile[]) => {
    setFiles(selectedFiles)
    reset()
  }, [reset])

  const handleRotate = async () => {
    if (files.length === 0) return

    const file = files[0]
    await startConversion(file.file, 'rotate-pdf', { rotation })
  }

  const handleDownload = () => {
    download()
  }

  const handleReset = () => {
    setFiles([])
    setRotation(90)
    reset()
  }

  return (
    <PageLayout
      title="Rotate PDF"
      description="Correct the orientation of your PDF pages. Rotate permanently by 90, 180, or 270 degrees."
      icon={RotateCw}
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
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                
                {/* Rotation Preview */}
                <div className="flex justify-center">
                  <div className="relative w-48 h-48 flex items-center justify-center bg-white/5 rounded-2xl border border-white/10 p-8 transition-all duration-500">
                    <div 
                      className="w-24 h-32 bg-white/10 border-2 border-white/20 rounded-lg flex flex-col items-center justify-center gap-2 transition-all duration-500 ease-spring"
                      style={{ transform: `rotate(${rotation}deg)` }}
                    >
                      <div className="w-12 h-2 bg-white/20 rounded-full" />
                      <div className="w-16 h-16 border-t-2 border-r-2 border-white/30 rounded-tr-lg" />
                      <div className="absolute top-2 right-2 text-[10px] text-white/40 font-mono">PDF</div>
                    </div>
                    <div className="absolute -bottom-3 bg-black/50 backdrop-blur px-3 py-1 rounded-full border border-white/10 text-xs text-primary-300 font-mono">
                      {rotation}° Clockwise
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-4 text-center">
                    Select Rotation Angle
                  </label>
                  <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
                    {[
                      { deg: 90, label: '90°', desc: 'Right' },
                      { deg: 180, label: '180°', desc: 'Flip' },
                      { deg: 270, label: '270°', desc: 'Left' },
                    ].map((opt) => (
                      <button
                        key={opt.deg}
                        onClick={() => setRotation(opt.deg as RotationAngle)}
                        className={cn(
                          "px-4 py-4 rounded-xl border transition-all duration-200 flex flex-col items-center",
                          rotation === opt.deg
                            ? "border-primary-500 bg-primary-500/20 text-white shadow-[0_0_15px_rgba(14,165,233,0.3)] scale-105"
                            : "border-white/10 bg-white/5 text-gray-400 hover:bg-white/10 hover:border-white/20"
                        )}
                      >
                        <RotateCw className={cn("w-6 h-6 mb-2", rotation === opt.deg ? "text-primary-400" : "text-gray-500")} />
                        <div className="font-bold text-lg mb-1">{opt.label}</div>
                        <div className="text-xs opacity-70">{opt.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={handleRotate}
                  className="w-full flex items-center justify-center gap-2 py-6 text-lg"
                  size="lg"
                  variant="primary"
                >
                  <Sparkles className="w-5 h-5" />
                  Rotate PDF
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
              onDownload={handleDownload}
              onReset={handleReset}
            />
          </div>
        )}

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 border-t border-white/10 pt-12">
            <div className="text-center group">
              <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary-500/20 transition-colors">
                <RotateCw className="h-5 w-5 text-gray-400 group-hover:text-primary-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">Simple Rotate</h3>
              <p className="text-sm text-gray-400">Fix orientation instantly.</p>
            </div>
            <div className="text-center group">
               <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-accent-purple/20 transition-colors">
                <Zap className="h-5 w-5 text-gray-400 group-hover:text-accent-purple" />
              </div>
              <h3 className="font-semibold text-white mb-2">Fast Processing</h3>
              <p className="text-sm text-gray-400">No quality loss.</p>
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
