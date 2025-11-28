'use client'

import { useState, useCallback } from 'react'
import { Lock, Eye, EyeOff, Sparkles, KeyRound, ShieldCheck } from 'lucide-react'
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

  const { status, progress, downloadUrl, error: conversionError, startConversion, reset: resetConversion, download } = useConversionJob()

  const conversionState: ConversionState = status === 'failed' ? 'error' : status
  const error = passwordError || conversionError

  const handleFilesSelected = useCallback((selectedFiles: UploadedFile[]) => {
    setFiles(selectedFiles)
    setPasswordError(null)
    resetConversion()
  }, [resetConversion])

  const handleProtect = async () => {
    if (files.length === 0) return

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
    setOutputFileName(file.file.name.replace('.pdf', '_protected.pdf'))
    await startConversion(file.file, 'protect-pdf', { userPassword })
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

  const isValidPassword = userPassword.length >= 6 && userPassword === confirmPassword

  return (
    <PageLayout
      title="Protect PDF"
      description="Secure your sensitive documents with AES-256 encryption. Add a password to prevent unauthorized access."
      icon={Lock}
      accentColor="slate"
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
              {/* Password Section */}
              <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-2xl border-2 border-slate-200 p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center shadow-lg">
                    <KeyRound className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">Set Encryption Password</h3>
                    <p className="text-xs text-slate-500">AES-256 bit encryption</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={userPassword}
                        onChange={(e) => setUserPassword(e.target.value)}
                        placeholder="Enter password (min 6 characters)"
                        className="w-full px-4 py-3.5 rounded-xl border-2 border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-100 transition-all pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter password"
                        className="w-full px-4 py-3.5 rounded-xl border-2 border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-100 transition-all pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Password Validation Messages */}
                  {(userPassword || confirmPassword) && (
                    <div className="space-y-2 pt-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center ${userPassword.length >= 6 ? 'bg-emerald-100' : 'bg-slate-100'}`}>
                          <ShieldCheck className={`w-3 h-3 ${userPassword.length >= 6 ? 'text-emerald-600' : 'text-slate-400'}`} />
                        </div>
                        <span className={`text-sm ${userPassword.length >= 6 ? 'text-emerald-600' : 'text-slate-500'}`}>
                          At least 6 characters
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center ${userPassword === confirmPassword && confirmPassword ? 'bg-emerald-100' : 'bg-slate-100'}`}>
                          <ShieldCheck className={`w-3 h-3 ${userPassword === confirmPassword && confirmPassword ? 'text-emerald-600' : 'text-slate-400'}`} />
                        </div>
                        <span className={`text-sm ${userPassword === confirmPassword && confirmPassword ? 'text-emerald-600' : 'text-slate-500'}`}>
                          Passwords match
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <Button
                onClick={handleProtect}
                className="w-full py-5 text-lg bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900"
                size="lg"
                variant="gradient"
                disabled={!isValidPassword}
              >
                <Lock className="w-5 h-5" />
                Protect PDF with Password
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
