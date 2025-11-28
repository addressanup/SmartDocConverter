'use client'

import { useState, useCallback } from 'react'
import { Layers, Sparkles, MoveUp, MoveDown, X, File, GripVertical } from 'lucide-react'
import { FileUploader, UploadedFile } from '@/components/shared/FileUploader'
import { ConversionStatus, ConversionState } from '@/components/shared/ConversionStatus'
import { Button } from '@/components/ui/Button'
import { useConversionJob } from '@/hooks/useConversionJob'
import { PageLayout } from '@/components/layout/PageLayout'
import { formatFileSize } from '@/lib/utils'

export default function MergePdfPage() {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const { status, progress, downloadUrl, error, startMultiFileConversion, reset, download } = useConversionJob()

  const conversionState: ConversionState = status === 'failed' ? 'error' : status

  const handleFilesSelected = useCallback((selectedFiles: UploadedFile[]) => {
    setFiles(prev => [...prev, ...selectedFiles])
    reset()
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
  }

  const handleMerge = async () => {
    if (files.length < 2) return
    await startMultiFileConversion(files.map(f => f.file), 'merge-pdf')
  }

  const handleReset = () => {
    setFiles([])
    reset()
  }

  return (
    <PageLayout
      title="Merge PDF Files"
      description="Combine multiple PDF files into a single, organized document. Upload, arrange, and merge in seconds."
      icon={Layers}
      accentColor="violet"
      maxFileSize="10MB each"
      estimatedTime="~5 seconds"
      supportedFormats={['.pdf']}
    >
      {conversionState === 'idle' || conversionState === 'error' ? (
        <div className="space-y-6">
          {/* File List */}
          {files.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
                  Files to merge ({files.length})
                </h3>
                <span className="text-xs text-slate-500">Drag to reorder</span>
              </div>
              {files.map((file, index) => (
                <div 
                  key={file.id} 
                  className="group flex items-center gap-3 p-4 bg-white rounded-xl border-2 border-slate-100 hover:border-violet-200 hover:shadow-md transition-all"
                >
                  <GripVertical className="w-5 h-5 text-slate-300 cursor-grab flex-shrink-0" />
                  <div className="w-9 h-9 flex items-center justify-center bg-gradient-to-br from-violet-100 to-purple-100 rounded-lg text-sm font-bold text-violet-600">
                    {index + 1}
                  </div>
                  <div className="w-11 h-11 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                    <File className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">{file.file.name}</p>
                    <p className="text-xs text-slate-500">{formatFileSize(file.file.size)}</p>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => moveFile(index, 'up')}
                      disabled={index === 0}
                      className="h-8 w-8 p-0 hover:bg-violet-50 disabled:opacity-30"
                    >
                      <MoveUp className="h-4 w-4 text-slate-500" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => moveFile(index, 'down')}
                      disabled={index === files.length - 1}
                      className="h-8 w-8 p-0 hover:bg-violet-50 disabled:opacity-30"
                    >
                      <MoveDown className="h-4 w-4 text-slate-500" />
                    </Button>
                    <div className="w-px h-4 bg-slate-200 mx-1" />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(file.id)}
                      className="h-8 w-8 p-0 hover:bg-red-50"
                    >
                      <X className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <FileUploader
            accept={{ 'application/pdf': ['.pdf'] }}
            maxFiles={10}
            maxSize={10 * 1024 * 1024}
            onFilesSelected={handleFilesSelected}
            title={files.length > 0 ? "Add more PDFs" : "Drop your PDF files here"}
            description="2-10 files, max 10MB each"
          />

          {files.length >= 2 && conversionState === 'idle' && (
            <div className="animate-slide-up">
              <Button
                onClick={handleMerge}
                className="w-full py-5 text-lg bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700"
                size="lg"
                variant="gradient"
              >
                <Sparkles className="w-5 h-5" />
                Merge {files.length} PDFs
              </Button>
            </div>
          )}

          {files.length === 1 && (
            <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl">
              <p className="text-sm font-medium text-amber-700 text-center">
                Add at least one more PDF to merge
              </p>
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
          downloadUrl={downloadUrl || undefined}
          fileName="merged.pdf"
          onDownload={() => download()}
          onReset={handleReset}
        />
      )}
    </PageLayout>
  )
}
