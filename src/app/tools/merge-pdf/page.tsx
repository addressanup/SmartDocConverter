'use client'

import { useState, useCallback } from 'react'
import { Layers, Shield, Zap, Sparkles, MoveUp, MoveDown, X, File, GripVertical } from 'lucide-react'
import { FileUploader, UploadedFile } from '@/components/shared/FileUploader'
import { ConversionStatus, ConversionState } from '@/components/shared/ConversionStatus'
import { Button } from '@/components/ui/Button'
import { useConversionJob } from '@/hooks/useConversionJob'
import { PageLayout } from '@/components/layout/PageLayout'
import { formatFileSize } from '@/lib/utils'

export default function MergePdfPage() {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const {
    status,
    progress,
    downloadUrl,
    error,
    startMultiFileConversion,
    reset,
    download,
  } = useConversionJob()

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
    reset()
  }

  const handleMerge = async () => {
    if (files.length < 2) return
    await startMultiFileConversion(files.map(f => f.file), 'merge-pdf')
  }

  const handleDownload = () => {
    download()
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
    >
      <div className="max-w-3xl mx-auto">
        {conversionState === 'idle' || conversionState === 'error' ? (
          <div className="space-y-8">
            {/* File List with Reordering */}
            {files.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Files to merge ({files.length})</h3>
                  <span className="text-xs text-slate-500">Drag to reorder</span>
                </div>
                {files.map((file, index) => (
                  <div 
                    key={file.id} 
                    className="group flex items-center gap-4 p-4 bg-white rounded-2xl border-2 border-slate-100 hover:border-indigo-200 hover:shadow-lg transition-all duration-300"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-center gap-3">
                      <GripVertical className="w-5 h-5 text-slate-300 cursor-grab" />
                      <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl text-sm font-bold text-indigo-600">
                        {index + 1}
                      </div>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                      <File className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">
                        {file.file.name}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {formatFileSize(file.file.size)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => moveFile(index, 'up')}
                        disabled={index === 0}
                        className="h-9 w-9 p-0 hover:bg-indigo-50 disabled:opacity-30"
                        title="Move Up"
                      >
                        <MoveUp className="h-4 w-4 text-slate-500" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => moveFile(index, 'down')}
                        disabled={index === files.length - 1}
                        className="h-9 w-9 p-0 hover:bg-indigo-50 disabled:opacity-30"
                        title="Move Down"
                      >
                        <MoveDown className="h-4 w-4 text-slate-500" />
                      </Button>
                      <div className="w-px h-5 bg-slate-200 mx-1" />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(file.id)}
                        className="h-9 w-9 p-0 hover:bg-red-50"
                        title="Remove"
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
              description="or click to browse (2-10 files, max 10MB each)"
            />

            {files.length >= 2 && conversionState === 'idle' && (
              <div className="animate-slide-up">
                <Button
                  onClick={handleMerge}
                  className="w-full py-5 text-lg"
                  size="lg"
                  variant="gradient"
                >
                  <Sparkles className="w-5 h-5" />
                  Merge {files.length} PDFs
                </Button>
              </div>
            )}

            {files.length === 1 && conversionState === 'idle' && (
              <div className="p-5 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl">
                <p className="text-sm font-medium text-amber-700 text-center">
                  Please select at least 2 PDF files to merge.
                </p>
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
          <ConversionStatus
            state={conversionState}
            progress={progress}
            error={error}
            downloadUrl={downloadUrl || undefined}
            fileName="merged.pdf"
            onDownload={handleDownload}
            onReset={handleReset}
          />
        )}

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 pt-12 border-t border-slate-100">
          {[
            { icon: Layers, title: 'Batch Processing', description: 'Merge up to 10 files at once.', gradient: 'from-violet-400 to-purple-500' },
            { icon: Zap, title: 'Instant Merge', description: 'Engineered for speed.', gradient: 'from-amber-400 to-orange-500' },
            { icon: Shield, title: 'Secure', description: 'Auto-deleted after 1 hour.', gradient: 'from-emerald-400 to-teal-500' },
          ].map((feature) => (
            <div key={feature.title} className="text-center group">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300`}>
                <feature.icon className="h-7 w-7 text-white" />
              </div>
              <h3 className="font-bold text-slate-900 mb-2">{feature.title}</h3>
              <p className="text-sm text-slate-500">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </PageLayout>
  )
}
