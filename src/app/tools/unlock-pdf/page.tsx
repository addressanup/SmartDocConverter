'use client'

import { useState, useCallback } from 'react'
import { Unlock, Lock, Sparkles, KeyRound } from 'lucide-react'
import { FileUploader, UploadedFile } from '@/components/shared/FileUploader'
import { ConversionStatus, ConversionState } from '@/components/shared/ConversionStatus'
import { Button } from '@/components/ui/Button'
import { useConversionJob } from '@/hooks/useConversionJob'
import { PageLayout } from '@/components/layout/PageLayout'

export default function UnlockPdfPage() {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [password, setPassword] = useState('')
  const [outputFileName, setOutputFileName] = useState<string | null>(null)

  const { status, progress, error, downloadUrl, startConversion, reset: resetConversion, download } = useConversionJob()

  const conversionState: ConversionState = status === 'failed' ? 'error' : status

  const handleFilesSelected = useCallback((selectedFiles: UploadedFile[]) => {
    setFiles(selectedFiles)
    resetConversion()
    setPassword('')
    setOutputFileName(null)
  }, [resetConversion])

  const handleUnlock = async () => {
    if (files.length === 0) return
    const file = files[0]
    setOutputFileName(file.file.name.replace('.pdf', '_unlocked.pdf'))
    await startConversion(file.file, 'unlock-pdf', { password })
  }

  const handleReset = () => {
    setFiles([])
    resetConversion()
    setOutputFileName(null)
    setPassword('')
  }

  return (
    <PageLayout
      title="Unlock PDF"
      description="Remove passwords and restrictions from your PDF files. Gain full access to your documents instantly."
      icon={Unlock}
      accentColor="rose"
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
            title="Drop your protected PDF here"
            description="or click to browse"
          />

          {files.length > 0 && conversionState === 'idle' && (
            <div className="space-y-6 animate-slide-up">
              {/* Password Section */}
              <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl border-2 border-rose-200 p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-lg">
                    <KeyRound className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">Enter PDF Password</h3>
                    <p className="text-xs text-slate-500">Required if the PDF is encrypted</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter PDF password"
                      className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 border-rose-200 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-100 transition-all"
                    />
                  </div>
                  <p className="mt-3 text-xs text-slate-500 bg-white/60 rounded-lg p-3 border border-slate-100">
                    <span className="font-semibold text-slate-700">Note:</span> Leave empty if the PDF only has printing/editing restrictions but no open password.
                  </p>
                </div>
              </div>

              <Button
                onClick={handleUnlock}
                className="w-full py-5 text-lg bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700"
                size="lg"
                variant="gradient"
              >
                <Unlock className="w-5 h-5" />
                Unlock PDF
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
