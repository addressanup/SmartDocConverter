'use client'

import { useCallback, useState } from 'react'
import { useDropzone, Accept } from 'react-dropzone'
import { Upload, File, X, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { formatFileSize } from '@/lib/utils'

export interface UploadedFile {
  file: File
  id: string
  preview?: string
}

interface FileUploaderProps {
  accept?: Accept
  maxFiles?: number
  maxSize?: number // in bytes
  onFilesSelected: (files: UploadedFile[]) => void
  onFileRemove?: (fileId: string) => void
  disabled?: boolean
  className?: string
  title?: string
  description?: string
}

export function FileUploader({
  accept,
  maxFiles = 1,
  maxSize = 10 * 1024 * 1024, // 10MB default
  onFilesSelected,
  onFileRemove,
  disabled = false,
  className,
  title = 'Drop your file here',
  description = 'or click to browse',
}: FileUploaderProps) {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [error, setError] = useState<string | null>(null)

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: any[]) => {
      setError(null)

      if (rejectedFiles.length > 0) {
        const firstError = rejectedFiles[0].errors[0]
        if (firstError.code === 'file-too-large') {
          setError(`File is too large. Maximum size is ${formatFileSize(maxSize)}`)
        } else if (firstError.code === 'file-invalid-type') {
          setError('File type not supported')
        } else if (firstError.code === 'too-many-files') {
          setError(`Maximum ${maxFiles} file(s) allowed`)
        } else {
          setError(firstError.message)
        }
        return
      }

      const newFiles: UploadedFile[] = acceptedFiles.map((file) => ({
        file,
        id: `${file.name}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
      }))

      const updatedFiles = maxFiles === 1 ? newFiles : [...files, ...newFiles].slice(0, maxFiles)
      setFiles(updatedFiles)
      onFilesSelected(updatedFiles)
    },
    [files, maxFiles, maxSize, onFilesSelected]
  )

  const removeFile = useCallback(
    (fileId: string) => {
      const fileToRemove = files.find((f) => f.id === fileId)
      if (fileToRemove?.preview) {
        URL.revokeObjectURL(fileToRemove.preview)
      }
      const updatedFiles = files.filter((f) => f.id !== fileId)
      setFiles(updatedFiles)
      onFileRemove?.(fileId)
      if (updatedFiles.length === 0) {
        onFilesSelected([])
      }
    },
    [files, onFileRemove, onFilesSelected]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxFiles,
    maxSize,
    disabled,
    multiple: maxFiles > 1,
  })

  return (
    <div className={cn('w-full', className)}>
      <div
        {...getRootProps()}
        className={cn(
          'relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors',
          isDragActive
            ? 'border-primary-500 bg-primary-50'
            : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50',
          disabled && 'opacity-50 cursor-not-allowed',
          error && 'border-red-300 bg-red-50'
        )}
      >
        <input {...getInputProps()} />

        <div className="flex flex-col items-center gap-4">
          <div
            className={cn(
              'w-16 h-16 rounded-full flex items-center justify-center',
              isDragActive ? 'bg-primary-100' : 'bg-gray-100'
            )}
          >
            <Upload
              className={cn('h-8 w-8', isDragActive ? 'text-primary-600' : 'text-gray-400')}
            />
          </div>

          <div>
            <p className="text-lg font-semibold text-gray-900">{title}</p>
            <p className="text-sm text-gray-500 mt-1">{description}</p>
            <p className="text-xs text-gray-400 mt-2">
              Max file size: {formatFileSize(maxSize)}
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-3 flex items-center gap-2 text-red-600 text-sm">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          {files.map((uploadedFile) => (
            <div
              key={uploadedFile.id}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
            >
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <File className="h-5 w-5 text-primary-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {uploadedFile.file.name}
                </p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(uploadedFile.file.size)}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  removeFile(uploadedFile.id)
                }}
                className="flex-shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
