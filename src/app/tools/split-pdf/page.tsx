'use client'

import { useState, useCallback } from 'react'
import { Scissors, ArrowRight, Shield, Zap, FileText, Sparkles } from 'lucide-react'
import { FileUploader, UploadedFile } from '@/components/shared/FileUploader'
import { ConversionStatus, ConversionState } from '@/components/shared/ConversionStatus'
import { Button } from '@/components/ui/Button'
import { useConversionJob } from '@/hooks/useConversionJob'
import { PageLayout } from '@/components/layout/PageLayout'

type SplitMode = 'all' | 'range' | 'custom'

export default function SplitPdfPage() {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [splitMode, setSplitMode] = useState<SplitMode>('all')
  const [pageRange, setPageRange] = useState('')

  const { status, progress, downloadUrl, error, startConversion, reset: hookReset, download } = useConversionJob()

  // Map hook status to ConversionState - note: hook returns 'failed' but ConversionState uses 'error'
  const conversionState: ConversionState = status === 'failed' ? 'error' : status
  const outputFileName = 'split_pages.zip'

  const handleFilesSelected = useCallback((selectedFiles: UploadedFile[]) => {
    setFiles(selectedFiles)
    hookReset()
  }, [hookReset])

  const handleSplit = async () => {
    if (files.length === 0) return

    const file = files[0]

    await startConversion(file.file, 'split-pdf', {
      mode: splitMode,
      pageRange: splitMode === 'range' || splitMode === 'custom' ? pageRange : undefined,
    })
  }

  const handleReset = () => {
    setFiles([])
    setPageRange('')
    hookReset()
  }

  return (
    <PageLayout
      title="Split PDF"
      description="Separate specific pages or extract ranges from your PDF files. Fast, secure, and simple."
      icon={Scissors}
    >
      <div className="max-w-3xl mx-auto">
        {conversionState === 'idle' || conversionState === 'error' ? (
          <div className="space-y-8">
            <FileUploader
              accept={{ 'application/pdf': ['.pdf'] }}
              maxFiles={1}
              maxSize={20 * 1024 * 1024}
              onFilesSelected={handleFilesSelected}
              title="Drop your PDF here"
              description="or click to browse (max 20MB)"
            />

            {files.length > 0 && conversionState === 'idle' && (
              <div className="mt-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-4">
                    Split Mode
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                      onClick={() => setSplitMode('all')}
                      className={`px-4 py-4 rounded-xl border text-left transition-all duration-200 ${
                        splitMode === 'all'
                          ? 'border-primary-500 bg-primary-500/20 text-white shadow-[0_0_15px_rgba(14,165,233,0.3)]'
                          : 'border-white/10 bg-white/5 text-gray-400 hover:bg-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="font-bold text-lg mb-1">All Pages</div>
                      <div className="text-xs opacity-70">Separate every page</div>
                    </button>
                    <button
                      onClick={() => setSplitMode('range')}
                      className={`px-4 py-4 rounded-xl border text-left transition-all duration-200 ${
                        splitMode === 'range'
                          ? 'border-primary-500 bg-primary-500/20 text-white shadow-[0_0_15px_rgba(14,165,233,0.3)]'
                          : 'border-white/10 bg-white/5 text-gray-400 hover:bg-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="font-bold text-lg mb-1">Page Range</div>
                      <div className="text-xs opacity-70">Extract range (e.g. 1-5)</div>
                    </button>
                    <button
                      onClick={() => setSplitMode('custom')}
                      className={`px-4 py-4 rounded-xl border text-left transition-all duration-200 ${
                        splitMode === 'custom'
                          ? 'border-primary-500 bg-primary-500/20 text-white shadow-[0_0_15px_rgba(14,165,233,0.3)]'
                          : 'border-white/10 bg-white/5 text-gray-400 hover:bg-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="font-bold text-lg mb-1">Custom</div>
                      <div className="text-xs opacity-70">Specific pages (1,3,5)</div>
                    </button>
                  </div>
                </div>

                {(splitMode === 'range' || splitMode === 'custom') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      {splitMode === 'range' ? 'Page Range' : 'Page Numbers'}
                    </label>
                    <input
                      type="text"
                      value={pageRange}
                      onChange={(e) => setPageRange(e.target.value)}
                      placeholder={
                        splitMode === 'range'
                          ? 'e.g., 1-5 or 10-15'
                          : 'e.g., 1,3,5-7,10'
                      }
                      className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                )}

                <Button
                  onClick={handleSplit}
                  className="w-full flex items-center justify-center gap-2 py-6 text-lg"
                  size="lg"
                  variant="primary"
                >
                  <Sparkles className="w-5 h-5" />
                  Split PDF
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
              onDownload={download}
              onReset={handleReset}
            />
          </div>
        )}

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 border-t border-white/10 pt-12">
            <div className="text-center group">
              <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary-500/20 transition-colors">
                <Scissors className="h-5 w-5 text-gray-400 group-hover:text-primary-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">Precision Cut</h3>
              <p className="text-sm text-gray-400">Extract exactly what you need.</p>
            </div>
            <div className="text-center group">
               <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-accent-purple/20 transition-colors">
                <Zap className="h-5 w-5 text-gray-400 group-hover:text-accent-purple" />
              </div>
              <h3 className="font-semibold text-white mb-2">Instant Split</h3>
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
