'use client'

import { useState, useCallback } from 'react'
import { ImageIcon, ArrowRight, Shield, Zap, FileText, Sparkles, MoveUp, MoveDown, X, File } from 'lucide-react'
import { FileUploader, UploadedFile } from '@/components/shared/FileUploader'
import { ConversionStatus, ConversionState } from '@/components/shared/ConversionStatus'
import { Button } from '@/components/ui/Button'
import { useConversionJob } from '@/hooks/useConversionJob'
import { PageLayout } from '@/components/layout/PageLayout'
import { formatFileSize } from '@/lib/utils'

export default function JpgToPdfPage() {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [outputFileName, setOutputFileName] = useState<string | null>(null)

  const {
    status,
    progress,
    downloadUrl,
    error,
    startConversion,
    startMultiFileConversion,
    reset,
    download
  } = useConversionJob()

  // Map hook status to ConversionState (hook uses 'failed', ConversionState uses 'error')
  const conversionState: ConversionState = status === 'failed' ? 'error' : status

  const handleFilesSelected = useCallback((selectedFiles: UploadedFile[]) => {
    setFiles(prev => [...prev, ...selectedFiles])
    reset()
    setOutputFileName(null)
  }, [reset])

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId))
    reset()
  }

  const moveFile = (index: number, direction: 'up' | 'down') => {
    const newFiles = [...files]
    if (direction === 'up' && index > 0) {
      [newFiles[index], newFiles[index - 1]] = [newFiles[index - 1], newFiles[index]]
    } else if (direction === 'down' && index < newFiles.length - 1) {
      [newFiles[index], newFiles[index + 1]] = [newFiles[index + 1], newFiles[index]]
    }
    setFiles(newFiles)
    reset()
  }

  const handleConvert = async () => {
    if (files.length === 0) return

    // Set output file name
    const originalName = files[0].file.name.replace(/\.(jpg|jpeg|png)$/i, '.pdf')
    setOutputFileName(originalName)

    // Use appropriate conversion method based on file count
    if (files.length === 1) {
      await startConversion(files[0].file, 'jpg-to-pdf')
    } else {
      await startMultiFileConversion(files.map(f => f.file), 'jpg-to-pdf')
    }
  }

  const handleDownload = () => {
    download()
  }

  const handleReset = () => {
    setFiles([])
    reset()
    setOutputFileName(null)
  }

  return (
    <PageLayout
      title="JPG to PDF"
      description="Transform your images into professional PDF documents. Combine multiple photos into a single, organized file."
      icon={ImageIcon}
    >
      <div className="max-w-3xl mx-auto">
        {conversionState === 'idle' || conversionState === 'error' ? (
          <div className="space-y-8">
            
            {/* File List with Reordering */}
            {files.length > 0 && (
              <div className="space-y-3">
                {files.map((file, index) => (
                  <div 
                    key={file.id} 
                    className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10 hover:border-white/20 transition-colors animate-in fade-in slide-in-from-bottom-2"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="w-12 h-12 bg-black/40 rounded-lg overflow-hidden flex-shrink-0 border border-white/10">
                      <img
                        src={file.preview}
                        alt="preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {file.file.name}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {formatFileSize(file.file.size)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => moveFile(index, 'up')}
                        disabled={index === 0}
                        className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-30"
                        title="Move Up"
                      >
                        <MoveUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => moveFile(index, 'down')}
                        disabled={index === files.length - 1}
                        className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-30"
                        title="Move Down"
                      >
                        <MoveDown className="h-4 w-4" />
                      </Button>
                      <div className="w-px h-4 bg-white/10 mx-2" />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(file.id)}
                        className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        title="Remove"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <FileUploader
              accept={{
                'image/jpeg': ['.jpg', '.jpeg'],
                'image/png': ['.png'],
              }}
              maxFiles={20}
              maxSize={10 * 1024 * 1024}
              onFilesSelected={handleFilesSelected}
              title={files.length > 0 ? "Add more images" : "Drop your images here"}
              description="or click to browse (JPG, JPEG, PNG - max 10MB each)"
              className={files.length > 0 ? "py-6" : undefined}
            />

            {files.length > 0 && (
              <div className="mt-4 glass-panel p-4 rounded-xl border border-white/10 bg-white/5">
                <p className="text-sm text-gray-300 font-medium">
                  {files.length} image{files.length !== 1 ? 's' : ''} selected
                  {files.length > 1 && ' - will be combined into one PDF'}
                </p>
              </div>
            )}

            {files.length > 0 && conversionState === 'idle' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Button
                  onClick={handleConvert}
                  className="w-full flex items-center justify-center gap-2 py-6 text-lg"
                  size="lg"
                  variant="primary"
                >
                  <Sparkles className="w-5 h-5" />
                  Convert to PDF
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
                <ImageIcon className="h-5 w-5 text-gray-400 group-hover:text-primary-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">Batch Support</h3>
              <p className="text-sm text-gray-400">Combine up to 20 images.</p>
            </div>
            <div className="text-center group">
               <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-accent-purple/20 transition-colors">
                <Zap className="h-5 w-5 text-gray-400 group-hover:text-accent-purple" />
              </div>
              <h3 className="font-semibold text-white mb-2">Instant</h3>
              <p className="text-sm text-gray-400">Processed in seconds.</p>
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
