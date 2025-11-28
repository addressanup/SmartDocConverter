'use client'

import { useState, useCallback, useRef } from 'react'

export type JobStatus = 'idle' | 'uploading' | 'processing' | 'completed' | 'failed'

export interface ConversionJob {
  jobId: string
  status: JobStatus
  progress: number
  downloadUrl?: string
  error?: string
}

export interface UseConversionJobOptions {
  pollInterval?: number // ms
  maxPollTime?: number // ms
}

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

export function useConversionJob(opts: UseConversionJobOptions = {}): UseConversionJobReturn {
  const { pollInterval = 1000, maxPollTime = 120000 } = opts

  const [status, setStatus] = useState<JobStatus>('idle')
  const [progress, setProgress] = useState(0)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [metadata, setMetadata] = useState<Record<string, any> | null>(null)

  const pollTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number>(0)

  const clearPolling = useCallback(() => {
    if (pollTimeoutRef.current) {
      clearTimeout(pollTimeoutRef.current)
      pollTimeoutRef.current = null
    }
  }, [])

  const pollJobStatus = useCallback(async (jobId: string) => {
    try {
      const response = await fetch(`/api/convert?jobId=${jobId}`)

      if (!response.ok) {
        throw new Error('Failed to check job status')
      }

      const job: ConversionJob & { metadata?: Record<string, any> } = await response.json()

      if (job.status === 'completed') {
        setStatus('completed')
        setProgress(100)
        setDownloadUrl(job.downloadUrl || null)
        setMetadata(job.metadata || null)
        clearPolling()
        return
      }
      
      // ... rest of the function ...

      if (job.status === 'failed') {
        setStatus('failed')
        setError(job.error || 'Conversion failed')
        clearPolling()
        return
      }

      // Update progress based on job status
      if (job.status === 'processing') {
        setProgress(prev => Math.min(prev + 5, 90))
      }

      // Check if we've exceeded max poll time
      if (Date.now() - startTimeRef.current > maxPollTime) {
        setStatus('failed')
        setError('Conversion timed out. Please try again.')
        clearPolling()
        return
      }

      // Continue polling
      pollTimeoutRef.current = setTimeout(() => pollJobStatus(jobId), pollInterval)
    } catch (err) {
      setStatus('failed')
      setError(err instanceof Error ? err.message : 'Failed to check conversion status')
      clearPolling()
    }
  }, [pollInterval, maxPollTime, clearPolling])

  const startConversion = useCallback(async (
    file: File,
    conversionType: string,
    options: Record<string, unknown> = {}
  ) => {
    try {
      clearPolling()
      setStatus('uploading')
      setProgress(10)
      setError(null)
      setDownloadUrl(null)
      setMetadata(null)
      startTimeRef.current = Date.now()

      // Upload file
      const formData = new FormData()
      formData.append('file', file)

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!uploadResponse.ok) {
        const uploadError = await uploadResponse.json()
        throw new Error(uploadError.error || 'Upload failed')
      }

      const uploadResult = await uploadResponse.json()
      setProgress(30)
      setStatus('processing')

      // Start conversion job
      const convertResponse = await fetch('/api/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileId: uploadResult.fileId,
          filePath: uploadResult.filePath,
          conversionType,
          fileSize: file.size,
          options,
        }),
      })

      if (!convertResponse.ok) {
        const convertError = await convertResponse.json()
        throw new Error(convertError.error || 'Conversion failed')
      }

      const convertResult = await convertResponse.json()
      setProgress(50)

      // Start polling for job status
      pollJobStatus(convertResult.jobId)
    } catch (err) {
      setStatus('failed')
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    }
  }, [clearPolling, pollJobStatus])

  const startMultiFileConversion = useCallback(async (
    files: File[],
    conversionType: string,
    options: Record<string, unknown> = {}
  ) => {
    try {
      clearPolling()
      setStatus('uploading')
      setProgress(5)
      setError(null)
      setDownloadUrl(null)
      setMetadata(null)
      startTimeRef.current = Date.now()

      // Upload all files
      const filePaths: string[] = []
      let fileId = ''

      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const formData = new FormData()
        formData.append('file', file)

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        if (!uploadResponse.ok) {
          const uploadError = await uploadResponse.json()
          throw new Error(uploadError.error || `Upload failed for file ${i + 1}`)
        }

        const uploadResult = await uploadResponse.json()
        filePaths.push(uploadResult.filePath)
        if (i === 0) fileId = uploadResult.fileId

        // Update progress for each file upload
        setProgress(5 + Math.floor((i + 1) / files.length * 25))
      }

      setStatus('processing')
      setProgress(35)

      // Start conversion job with all file paths
      const convertResponse = await fetch('/api/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileId,
          filePath: filePaths[0],
          filePaths,
          conversionType,
          options,
        }),
      })

      if (!convertResponse.ok) {
        const convertError = await convertResponse.json()
        throw new Error(convertError.error || 'Conversion failed')
      }

      const convertResult = await convertResponse.json()
      setProgress(50)

      // Start polling for job status
      pollJobStatus(convertResult.jobId)
    } catch (err) {
      setStatus('failed')
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    }
  }, [clearPolling, pollJobStatus])

  const reset = useCallback(() => {
    clearPolling()
    setStatus('idle')
    setProgress(0)
    setDownloadUrl(null)
    setError(null)
    setMetadata(null)
  }, [clearPolling])

  const download = useCallback(() => {
    if (downloadUrl) {
      window.open(downloadUrl, '_blank')
    }
  }, [downloadUrl])

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
