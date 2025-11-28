'use client'

import { useCallback, useState } from 'react'
import { useDropzone, Accept } from 'react-dropzone'
import { Upload, File, X, AlertCircle, CheckCircle, Sparkles } from 'lucide-react'
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
  maxSize?: number
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
  maxSize = 10 * 1024 * 1024,
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
          'relative rounded-3xl p-12 text-center cursor-pointer transition-all duration-500 overflow-hidden',
          isDragActive
            ? 'bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 border-2 border-indigo-400 shadow-lg shadow-indigo-500/10'
            : 'bg-gradient-to-br from-slate-50/80 to-white border-2 border-dashed border-slate-200 hover:border-indigo-300 hover:bg-gradient-to-br hover:from-indigo-50/50 hover:to-purple-50/30 hover:shadow-lg',
          disabled && 'opacity-50 cursor-not-allowed',
          error && 'border-red-300 bg-red-50/50'
        )}
      >
        <input {...getInputProps()} />

        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-4 right-4 w-32 h-32 bg-gradient-to-br from-indigo-200 to-purple-200 rounded-full blur-2xl" />
          <div className="absolute bottom-4 left-4 w-24 h-24 bg-gradient-to-br from-pink-200 to-rose-200 rounded-full blur-2xl" />
        </div>

        <div className="relative z-10 flex flex-col items-center gap-5">
          <div
            className={cn(
              'w-20 h-20 rounded-3xl flex items-center justify-center transition-all duration-500',
              isDragActive 
                ? 'bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-xl shadow-indigo-500/30 scale-110' 
                : 'bg-white border-2 border-slate-200 shadow-lg group-hover:border-indigo-200'
            )}
          >
            <Upload
              className={cn(
                'h-8 w-8 transition-all duration-300',
                isDragActive ? 'text-white animate-bounce' : 'text-slate-400'
              )}
            />
          </div>

          <div>
            <p className={cn(
              'text-xl font-bold mb-2 transition-colors',
              isDragActive ? 'text-indigo-600' : 'text-slate-900'
            )}>
              {isDragActive ? 'Drop to upload!' : title}
            </p>
            <p className="text-base text-slate-500">{description}</p>
            <div className="flex items-center justify-center gap-2 mt-4">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <p className="text-sm text-slate-400">
                Max file size: {formatFileSize(maxSize)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-5 flex items-center gap-3 text-red-600 text-sm bg-gradient-to-r from-red-50 to-rose-50 p-5 rounded-2xl border border-red-100">
          <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-red-500" />
          </div>
          <span className="font-medium">{error}</span>
        </div>
      )}

      {files.length > 0 && (
        <div className="mt-5 space-y-3">
          {files.map((uploadedFile) => (
            <div
              key={uploadedFile.id}
              className="group flex items-center gap-4 p-5 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all duration-300"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl flex items-center justify-center flex-shrink-0 border border-indigo-100">
                <File className="h-7 w-7 text-indigo-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-base font-semibold text-slate-900 truncate">
                  {uploadedFile.file.name}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <p className="text-sm text-emerald-600 font-medium">
                    Ready to convert
                  </p>
                  <span className="text-slate-300">•</span>
                  <p className="text-sm text-slate-500">
                    {formatFileSize(uploadedFile.file.size)}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  removeFile(uploadedFile.id)
                }}
                className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 hover:text-red-600"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
