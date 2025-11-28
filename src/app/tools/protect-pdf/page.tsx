'use client'

import { useState, useCallback } from 'react'
import { Lock, ArrowRight, Shield, Eye, EyeOff, FileText, Sparkles, Zap } from 'lucide-react'
import { FileUploader, UploadedFile } from '@/components/shared/FileUploader'
import { ConversionStatus, ConversionState } from '@/components/shared/ConversionStatus'
import { Button } from '@/components/ui/Button'
import { useConversionJob } from '@/hooks/useConversionJob'
import { PageLayout } from '@/components/layout/PageLayout'

export default function ProtectPdfPage() {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [userPassword, setUserPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [outputFileName, setOutputFileName] = useState<string | null>(null)

  const {
    status,
    progress,
    downloadUrl,
    error: conversionError,
    startConversion,
    reset: resetConversion,
    download,
  } = useConversionJob()

  // Map hook status to ConversionState type
  const conversionState: ConversionState = status === 'failed' ? 'error' : status
  const error = passwordError || conversionError

  const handleFilesSelected = useCallback((selectedFiles: UploadedFile[]) => {
    setFiles(selectedFiles)
    setPasswordError(null)
    resetConversion()
  }, [resetConversion])

  const handleProtect = async () => {
    if (files.length === 0) return

    // Validate passwords
    if (!userPassword) {
      setPasswordError('Please enter a password')
      return
    }

    if (userPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters long')
      return
    }

    if (userPassword !== confirmPassword) {
      setPasswordError('Passwords do not match')
      return
    }

    setPasswordError(null)
    const file = files[0]

    // Set output filename
    const originalName = file.file.name.replace('.pdf', '_protected.pdf')
    setOutputFileName(originalName)

    // Start conversion with password option
    await startConversion(file.file, 'protect-pdf', { userPassword })
  }

  const handleDownload = () => {
    download()
  }

  const handleReset = () => {
    setFiles([])
    setUserPassword('')
    setConfirmPassword('')
    setShowPassword(false)
    setShowConfirmPassword(false)
    setPasswordError(null)
    setOutputFileName(null)
    resetConversion()
  }

  return (
    <PageLayout
      title="Protect PDF"
      description="Secure your sensitive documents with strong encryption. Add a password to prevent unauthorized access."
      icon={Lock}
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
              <div className="mt-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="glass-panel p-6 rounded-xl border border-white/10 bg-white/5">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Set Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={userPassword}
                        onChange={(e) => setUserPassword(e.target.value)}
                        placeholder="Enter password (min 6 characters)"
                        className="w-full px-4 py-3 rounded-xl border border-white/10 bg-black/20 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter password"
                        className="w-full px-4 py-3 rounded-xl border border-white/10 bg-black/20 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {(userPassword || confirmPassword) && (
                    <div className="mt-2">
                      {userPassword && userPassword !== confirmPassword && (
                        <p className="text-sm text-red-400">Passwords do not match</p>
                      )}
                      {userPassword && userPassword.length < 6 && (
                        <p className="text-sm text-yellow-400">
                          Password should be at least 6 characters long
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <Button
                  onClick={handleProtect}
                  className="w-full flex items-center justify-center gap-2 py-6 text-lg"
                  size="lg"
                  variant="primary"
                  disabled={!userPassword || !confirmPassword || userPassword !== confirmPassword || userPassword.length < 6}
                >
                  <Sparkles className="w-5 h-5" />
                  Protect PDF
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
              onDownload={handleDownload}
              onReset={handleReset}
            />
          </div>
        )}

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 border-t border-white/10 pt-12">
            <div className="text-center group">
              <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary-500/20 transition-colors">
                <Lock className="h-5 w-5 text-gray-400 group-hover:text-primary-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">AES Encryption</h3>
              <p className="text-sm text-gray-400">Industry standard security.</p>
            </div>
            <div className="text-center group">
               <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-accent-purple/20 transition-colors">
                <Shield className="h-5 w-5 text-gray-400 group-hover:text-accent-purple" />
              </div>
              <h3 className="font-semibold text-white mb-2">Privacy First</h3>
              <p className="text-sm text-gray-400">Your data stays yours.</p>
            </div>
            <div className="text-center group">
               <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-accent-cyan/20 transition-colors">
                <FileText className="h-5 w-5 text-gray-400 group-hover:text-accent-cyan" />
              </div>
              <h3 className="font-semibold text-white mb-2">Universal</h3>
              <p className="text-sm text-gray-400">Compatible with all readers.</p>
            </div>
          </div>
      </div>
    </PageLayout>
  )
}
