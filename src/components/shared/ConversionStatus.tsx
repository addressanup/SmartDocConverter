'use client'

import { CheckCircle, XCircle, Loader2, Download, RefreshCw, Sparkles, Shield } from 'lucide-react'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

export type ConversionState = 'idle' | 'uploading' | 'processing' | 'completed' | 'error'

interface ConversionStatusProps {
  state: ConversionState
  progress: number
  error?: string | null
  downloadUrl?: string | null
  fileName?: string
  onDownload?: () => void
  onReset?: () => void
  className?: string
}

export function ConversionStatus({
  state,
  progress,
  error,
  downloadUrl,
  fileName,
  onDownload,
  onReset,
  className,
}: ConversionStatusProps) {
  if (state === 'idle') return null

  return (
    <div className={cn('w-full', className)}>
      {/* Uploading */}
      {state === 'uploading' && (
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-50 border border-blue-100 rounded-3xl p-8">
          <div className="absolute top-0 right-0 w-40 h-40 bg-blue-200/30 rounded-full blur-3xl" />
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Loader2 className="h-6 w-6 text-white animate-spin" />
              </div>
              <div>
                <span className="text-lg font-bold text-slate-900">Uploading file...</span>
                <p className="text-sm text-slate-500">{progress}% complete</p>
              </div>
            </div>
            <ProgressBar progress={progress} size="md" />
          </div>
        </div>
      )}

      {/* Processing */}
      {state === 'processing' && (
        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 border border-indigo-100 rounded-3xl p-8">
          <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-purple-200/40 to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-indigo-200/40 to-transparent rounded-full blur-2xl" />
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl blur-lg opacity-50 animate-pulse" />
                <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-xl">
                  <Sparkles className="h-7 w-7 text-white animate-pulse" />
                </div>
              </div>
              <div>
                <span className="text-lg font-bold text-slate-900">Converting your file...</span>
                <p className="text-sm text-slate-500">This may take a moment</p>
              </div>
            </div>
            <ProgressBar progress={progress} size="md" />
          </div>
        </div>
      )}

      {/* Completed */}
      {state === 'completed' && (
        <div className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 border border-emerald-100 rounded-3xl p-8 animate-scale-in">
          <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-emerald-200/40 to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-teal-200/40 to-transparent rounded-full blur-2xl" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-8">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl blur-lg opacity-40" />
                <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-xl shadow-emerald-500/20">
                  <CheckCircle className="h-8 w-8 text-white" />
                </div>
              </div>
              <div>
                <span className="text-xl font-bold text-slate-900">Conversion complete!</span>
                <p className="text-sm text-emerald-600 font-medium">Your file is ready to download</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              {downloadUrl && (
                <Button
                  variant="gradient"
                  onClick={onDownload}
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                  size="lg"
                >
                  <Download className="h-5 w-5" />
                  Download {fileName || 'File'}
                </Button>
              )}
              <Button variant="outline" onClick={onReset} size="lg" className="border-2">
                <RefreshCw className="h-5 w-5" />
                Convert Another
              </Button>
            </div>
            
            <div className="flex items-center justify-center gap-2 mt-6 pt-6 border-t border-emerald-100">
              <Shield className="w-4 h-4 text-slate-400" />
              <p className="text-sm text-slate-500">
                File will be automatically deleted in 1 hour for your security
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error */}
      {state === 'error' && (
        <div className="relative overflow-hidden bg-gradient-to-br from-red-50 via-rose-50 to-pink-50 border border-red-100 rounded-3xl p-8">
          <div className="absolute top-0 right-0 w-40 h-40 bg-red-200/30 rounded-full blur-3xl" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-xl shadow-red-500/20">
                <XCircle className="h-8 w-8 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold text-slate-900">Conversion failed</span>
                <p className="text-sm text-red-600 font-medium">Please try again</p>
              </div>
            </div>
            
            <div className="p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-red-100 mb-6">
              <p className="text-sm text-red-700">
                {error || 'An unexpected error occurred'}
              </p>
            </div>
            
            <Button 
              variant="outline" 
              onClick={onReset}
              className="w-full border-2 border-red-200 text-red-700 hover:bg-red-50"
              size="lg"
            >
              <RefreshCw className="h-5 w-5" />
              Try Again
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
