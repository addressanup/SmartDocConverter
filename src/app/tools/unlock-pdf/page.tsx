'use client'

import { useState, useCallback } from 'react'
import { Unlock, ArrowRight, Shield, Zap, Lock, Sparkles } from 'lucide-react'
import { FileUploader, UploadedFile } from '@/components/shared/FileUploader'
import { ConversionStatus, ConversionState } from '@/components/shared/ConversionStatus'
import { Button } from '@/components/ui/Button'
import { useConversionJob } from '@/hooks/useConversionJob'
import { PageLayout } from '@/components/layout/PageLayout'

export default function UnlockPdfPage() {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [password, setPassword] = useState('')
  const [outputFileName, setOutputFileName] = useState<string | null>(null)

  const {
    status,
    progress,
    error,
    downloadUrl,
    startConversion,
    reset: resetConversion,
    download,
  } = useConversionJob()

  // Map hook status to ConversionState (hook returns 'failed' but ConversionState uses 'error')
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

    // Set output filename for display
    const originalName = file.file.name.replace('.pdf', '_unlocked.pdf')
    setOutputFileName(originalName)

    // Start conversion with password as an option
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
    >
      <div className="max-w-3xl mx-auto">
        {conversionState === 'idle' || conversionState === 'error' ? (
          <div className="space-y-8">
            <FileUploader
              accept={{ 'application/pdf': ['.pdf'] }}
              maxFiles={1}
              maxSize={50 * 1024 * 1024}
              onFilesSelected={handleFilesSelected}
              title="Drop your password-protected PDF here"
              description="or click to browse (max 50MB)"
            />

            {files.length > 0 && conversionState === 'idle' && (
              <div className="mt-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="glass-panel p-6 rounded-xl border border-white/10 bg-white/5">
                  <div>
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-gray-300 mb-2"
                    >
                      PDF Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter PDF password"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-white/10 bg-black/20 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
                      />
                    </div>
                    <p className="mt-2 text-xs text-gray-400">
                      Enter the password required to open the PDF. Leave empty if the PDF
                      has no password.
                    </p>
                  </div>
                </div>

                <Button
                  onClick={handleUnlock}
                  className="w-full flex items-center justify-center gap-2 py-6 text-lg"
                  size="lg"
                  variant="primary"
                >
                  <Sparkles className="w-5 h-5" />
                  Unlock PDF
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
                <Unlock className="h-5 w-5 text-gray-400 group-hover:text-primary-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">Instant Unlock</h3>
              <p className="text-sm text-gray-400">Remove restrictions quickly.</p>
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
