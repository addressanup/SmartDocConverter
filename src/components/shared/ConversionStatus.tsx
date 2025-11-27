'use client'

import { CheckCircle, XCircle, Loader2, Download } from 'lucide-react'
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
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
            <span className="text-blue-800 font-medium">Uploading file...</span>
          </div>
          <ProgressBar progress={progress} size="md" />
        </div>
      )}

      {/* Processing */}
      {state === 'processing' && (
        <div className="bg-primary-50 border border-primary-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Loader2 className="h-5 w-5 text-primary-600 animate-spin" />
            <span className="text-primary-800 font-medium">Converting your file...</span>
          </div>
          <ProgressBar progress={progress} size="md" />
          <p className="text-sm text-primary-600 mt-2">This may take a moment</p>
        </div>
      )}

      {/* Completed */}
      {state === 'completed' && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle className="h-6 w-6 text-green-600" />
            <span className="text-green-800 font-medium">Conversion complete!</span>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            {downloadUrl && (
              <Button
                variant="primary"
                onClick={onDownload}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download {fileName || 'File'}
              </Button>
            )}
            <Button variant="outline" onClick={onReset}>
              Convert Another File
            </Button>
          </div>
          <p className="text-sm text-gray-500 mt-3">
            Your file will be automatically deleted in 1 hour
          </p>
        </div>
      )}

      {/* Error */}
      {state === 'error' && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <XCircle className="h-6 w-6 text-red-600" />
            <span className="text-red-800 font-medium">Conversion failed</span>
          </div>
          <p className="text-sm text-red-600 mb-4">{error || 'An unexpected error occurred'}</p>
          <Button variant="outline" onClick={onReset}>
            Try Again
          </Button>
        </div>
      )}
    </div>
  )
}
