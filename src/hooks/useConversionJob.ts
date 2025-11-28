'use client'

import { useState, useCallback } from 'react'

export type JobStatus = 'idle' | 'uploading' | 'processing' | 'completed' | 'failed'

export interface UseConversionJobReturn {
  status: JobStatus
  progress: number
  downloadUrl: string | null
  error: string | null
  metadata: Record<string, any> | null
  startConversion: (file: File, conversionType: string, options?: Record<string, unknown>) => Promise<void>
  startMultiFileConversion: (files: File[], conversionType: string, options?: Record<string, unknown>) => Promise<void>
  reset: () => void
  download: () => void
}

export function useConversionJob(): UseConversionJobReturn {
  const [status, setStatus] = useState<JobStatus>('idle')
  const [progress, setProgress] = useState(0)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [metadata, setMetadata] = useState<Record<string, any> | null>(null)

  const startConversion = useCallback(async (
    file: File,
    conversionType: string,
    options: Record<string, unknown> = {}
  ) => {
    try {
      setStatus('uploading')
      setProgress(20)
      setError(null)
      setDownloadUrl(null)
      setMetadata(null)

      // Create form data with file, type, and options
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', conversionType)
      formData.append('options', JSON.stringify(options))

      setStatus('processing')
      setProgress(50)

      // Send to synchronous conversion endpoint
      const response = await fetch('/api/convert-sync', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        // Try to parse error JSON
        const contentType = response.headers.get('content-type')
        if (contentType?.includes('application/json')) {
          const errorData = await response.json()
          throw new Error(errorData.error || errorData.details || 'Conversion failed')
        }
        throw new Error(`Conversion failed with status ${response.status}`)
      }

      setProgress(90)

      // Get the file blob
      const blob = await response.blob()
      const filename = response.headers.get('X-Output-Filename') || 'converted-file'
      
      // Create download URL
      const url = URL.createObjectURL(blob)
      setDownloadUrl(url)
      setMetadata({ filename, size: blob.size })
      
      setProgress(100)
      setStatus('completed')
    } catch (err) {
      console.error('Conversion error:', err)
      setStatus('failed')
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    }
  }, [])

  const startMultiFileConversion = useCallback(async (
    files: File[],
    conversionType: string,
    options: Record<string, unknown> = {}
  ) => {
    try {
      setStatus('uploading')
      setProgress(10)
      setError(null)
      setDownloadUrl(null)
      setMetadata(null)

      // For merge, we need to upload all files first then merge
      const formData = new FormData()
      files.forEach((file, index) => {
        formData.append(`file${index}`, file)
      })
      formData.append('type', conversionType)
      formData.append('options', JSON.stringify(options))
      formData.append('fileCount', files.length.toString())

      setStatus('processing')
      setProgress(50)

      const response = await fetch('/api/convert-multi-sync', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const contentType = response.headers.get('content-type')
        if (contentType?.includes('application/json')) {
          const errorData = await response.json()
          throw new Error(errorData.error || errorData.details || 'Conversion failed')
        }
        throw new Error(`Conversion failed with status ${response.status}`)
      }

      setProgress(90)

      const blob = await response.blob()
      const filename = response.headers.get('X-Output-Filename') || 'merged.pdf'
      
      const url = URL.createObjectURL(blob)
      setDownloadUrl(url)
      setMetadata({ filename, size: blob.size })
      
      setProgress(100)
      setStatus('completed')
    } catch (err) {
      console.error('Multi-file conversion error:', err)
      setStatus('failed')
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    }
  }, [])

  const reset = useCallback(() => {
    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl)
    }
    setStatus('idle')
    setProgress(0)
    setDownloadUrl(null)
    setError(null)
    setMetadata(null)
  }, [downloadUrl])

  const download = useCallback(() => {
    if (downloadUrl && metadata?.filename) {
      const a = document.createElement('a')
      a.href = downloadUrl
      a.download = metadata.filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    }
  }, [downloadUrl, metadata])

  return {
    status,
    progress,
    downloadUrl,
    error,
    metadata,
    startConversion,
    startMultiFileConversion,
    reset,
    download,
  }
}
