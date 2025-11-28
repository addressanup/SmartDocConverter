'use client'

import { useState, useCallback, useEffect } from 'react'
import { ScanText, ArrowRight, Shield, Zap, Languages, Sparkles, FileText } from 'lucide-react'
import { FileUploader, UploadedFile } from '@/components/shared/FileUploader'
import { ConversionStatus, ConversionState } from '@/components/shared/ConversionStatus'
import { Button } from '@/components/ui/Button'
import { useConversionJob } from '@/hooks/useConversionJob'
import { PageLayout } from '@/components/layout/PageLayout'

export default function ImageToTextPage() {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [outputFileName, setOutputFileName] = useState<string | null>(null)
  const [extractedText, setExtractedText] = useState<string | null>(null)

  const { status, progress, downloadUrl, error, startConversion, reset: resetConversion, download } = useConversionJob()

  // Map hook status to ConversionState (hook uses 'failed', UI uses 'error')
  const conversionState: ConversionState = status === 'failed' ? 'error' : status

  // Fetch extracted text when conversion completes
  useEffect(() => {
    const fetchExtractedText = async () => {
      if (status === 'completed' && downloadUrl) {
        try {
          const response = await fetch(downloadUrl)
          if (response.ok) {
            const text = await response.text()
            setExtractedText(text)
          }
        } catch (err) {
          console.error('Failed to fetch extracted text:', err)
        }
      }
    }

    fetchExtractedText()
  }, [status, downloadUrl])

  const handleFilesSelected = useCallback((selectedFiles: UploadedFile[]) => {
    setFiles(selectedFiles)
    resetConversion()
    setExtractedText(null)
    setOutputFileName(null)
  }, [resetConversion])

  const handleExtract = async () => {
    if (files.length === 0) return

    const file = files[0]
    const originalName = file.file.name.replace(/\.(jpg|jpeg|png|pdf)$/i, '.txt')
    setOutputFileName(originalName)

    // Start the conversion using the hook
    await startConversion(file.file, 'image-to-text')
  }


  const handleCopyText = () => {
    if (extractedText) {
      navigator.clipboard.writeText(extractedText)
    }
  }

  const handleReset = () => {
    setFiles([])
    resetConversion()
    setOutputFileName(null)
    setExtractedText(null)
  }

  return (
    <PageLayout
      title="Image to Text (OCR)"
      description="Extract editable text from images and scanned documents using advanced optical character recognition."
      icon={ScanText}
    >
      <div className="max-w-3xl mx-auto">
        {conversionState === 'idle' || conversionState === 'error' ? (
          <div className="space-y-8">
            <FileUploader
              accept={{
                'image/jpeg': ['.jpg', '.jpeg'],
                'image/png': ['.png'],
                'application/pdf': ['.pdf'],
              }}
              maxFiles={1}
              maxSize={10 * 1024 * 1024}
              onFilesSelected={handleFilesSelected}
              title="Drop your image or PDF here"
              description="or click to browse (JPG, PNG, PDF - max 10MB)"
            />

            {files.length > 0 && conversionState === 'idle' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Button
                  onClick={handleExtract}
                  className="w-full flex items-center justify-center gap-2 py-6 text-lg"
                  size="lg"
                  variant="primary"
                >
                  <Sparkles className="w-5 h-5" />
                  Extract Text
                </Button>
              </div>
            )}

            <ConversionStatus
              state={conversionState}
              progress={progress}
              error={error || undefined}
              onReset={handleReset}
              className="mt-6"
            />
          </div>
        ) : conversionState === 'completed' && extractedText ? (
          <div className="glass-panel p-8 rounded-2xl border border-primary-500/20 bg-primary-500/5 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary-400" />
                Extracted Text
              </h3>
              <div className="flex gap-3">
                <Button
                  onClick={handleCopyText}
                  variant="outline"
                  size="sm"
                  className="border-white/10 text-gray-300 hover:text-white hover:bg-white/5"
                >
                  Copy Text
                </Button>
                <Button
                  onClick={download}
                  size="sm"
                  variant="primary"
                >
                  Download TXT
                </Button>
              </div>
            </div>
            <div className="bg-black/30 rounded-xl p-6 max-h-96 overflow-y-auto border border-white/10 custom-scrollbar">
              <pre className="whitespace-pre-wrap text-sm text-gray-300 font-mono leading-relaxed">
                {extractedText}
              </pre>
            </div>
            <Button
              onClick={handleReset}
              variant="ghost"
              className="w-full text-gray-400 hover:text-white hover:bg-white/5"
            >
              Extract Another Image
            </Button>
          </div>
        ) : (
          <div className="glass-panel p-8 rounded-2xl border border-primary-500/20 bg-primary-500/5">
            <ConversionStatus
              state={conversionState}
              progress={progress}
              error={error || undefined}
              downloadUrl={downloadUrl || undefined}
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
                <ScanText className="h-5 w-5 text-gray-400 group-hover:text-primary-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">Smart OCR</h3>
              <p className="text-sm text-gray-400">Detects text with high accuracy.</p>
            </div>
            <div className="text-center group">
               <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-accent-purple/20 transition-colors">
                <Languages className="h-5 w-5 text-gray-400 group-hover:text-accent-purple" />
              </div>
              <h3 className="font-semibold text-white mb-2">Multi-Lingual</h3>
              <p className="text-sm text-gray-400">Supports 100+ languages.</p>
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
