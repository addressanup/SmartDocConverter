'use client'

import { useState, useCallback } from 'react'
import { RotateCw, Sparkles, RotateCcw } from 'lucide-react'
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

  const { status, progress, downloadUrl, error, startConversion, reset, download } = useConversionJob()

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

  const handleReset = () => {
    setFiles([])
    setRotation(90)
    reset()
  }

  const rotationOptions = [
    { deg: 90, label: '90°', desc: 'Right', icon: RotateCw },
    { deg: 180, label: '180°', desc: 'Flip', icon: RotateCw },
    { deg: 270, label: '270°', desc: 'Left', icon: RotateCcw },
  ]

  return (
    <PageLayout
      title="Rotate PDF"
      description="Correct the orientation of your PDF pages. Rotate permanently by 90, 180, or 270 degrees."
      icon={RotateCw}
      accentColor="amber"
      maxFileSize="50MB"
      estimatedTime="~2 seconds"
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
              {/* Rotation Preview */}
              <div className="flex justify-center py-4">
                <div className="relative w-40 h-40 flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border-2 border-amber-200">
                  <div 
                    className="w-20 h-28 bg-white border-2 border-amber-300 rounded-lg shadow-lg flex flex-col items-center justify-center transition-all duration-500"
                    style={{ transform: `rotate(${rotation}deg)` }}
                  >
                    <div className="w-10 h-1.5 bg-amber-200 rounded-full mb-2" />
                    <div className="w-12 h-12 border-t-2 border-r-2 border-amber-300 rounded-tr-lg" />
                    <span className="text-[8px] text-amber-400 font-mono mt-1">PDF</span>
                  </div>
                  <div className="absolute -bottom-3 bg-white px-3 py-1.5 rounded-full border-2 border-amber-200 text-xs text-amber-700 font-bold shadow-sm">
                    {rotation}° Clockwise
                  </div>
                </div>
              </div>

              {/* Rotation Options */}
              <div>
                <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider mb-4 text-center">
                  Select Rotation
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {rotationOptions.map((opt) => (
                    <button
                      key={opt.deg}
                      onClick={() => setRotation(opt.deg as RotationAngle)}
                      className={cn(
                        "px-4 py-5 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center",
                        rotation === opt.deg
                          ? "border-amber-400 bg-gradient-to-br from-amber-50 to-orange-50 shadow-lg"
                          : "border-slate-200 bg-white hover:border-amber-200 hover:bg-slate-50"
                      )}
                    >
                      <opt.icon className={cn(
                        "w-7 h-7 mb-2",
                        rotation === opt.deg ? "text-amber-600" : "text-slate-400"
                      )} />
                      <div className={cn(
                        "font-bold text-lg",
                        rotation === opt.deg ? "text-amber-600" : "text-slate-900"
                      )}>
                        {opt.label}
                      </div>
                      <div className="text-xs text-slate-500">{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <Button
                onClick={handleRotate}
                className="w-full py-5 text-lg bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
                size="lg"
                variant="gradient"
              >
                <RotateCw className="w-5 h-5" />
                Rotate PDF
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
          downloadUrl={downloadUrl || undefined}
          onDownload={() => download()}
          onReset={handleReset}
        />
      )}
    </PageLayout>
  )
}
