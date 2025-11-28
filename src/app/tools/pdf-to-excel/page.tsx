'use client'

import { useState, useCallback, useEffect } from 'react'
import { FileSpreadsheet, ArrowRight, Shield, Zap, Table, Sparkles, FileText } from 'lucide-react'
import { FileUploader, UploadedFile } from '@/components/shared/FileUploader'
import { ConversionStatus, ConversionState } from '@/components/shared/ConversionStatus'
import { Button } from '@/components/ui/Button'
import { useConversionJob } from '@/hooks/useConversionJob'
import { PageLayout } from '@/components/layout/PageLayout'
import * as XLSX from 'xlsx'

export default function PdfToExcelPage() {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [outputFileName, setOutputFileName] = useState<string | null>(null)
  const [previewData, setPreviewData] = useState<any[][] | null>(null)

  const { status, progress, downloadUrl, error, startConversion, reset, download } = useConversionJob()

  // Map hook status to ConversionState type (hook returns 'failed' but ConversionState uses 'error')
  const conversionState: ConversionState = status === 'failed' ? 'error' : status

  useEffect(() => {
    if (status === 'completed' && downloadUrl) {
      fetch(downloadUrl)
        .then(res => res.arrayBuffer())
        .then(ab => {
          try {
            const wb = XLSX.read(ab, { type: 'array' })
            const ws = wb.Sheets[wb.SheetNames[0]]
            const data = XLSX.utils.sheet_to_json(ws, { header: 1 }).slice(0, 5) // First 5 rows
            setPreviewData(data as any[][])
          } catch (err) {
            console.error('Failed to parse Excel preview:', err)
          }
        })
        .catch(console.error)
    }
  }, [status, downloadUrl])

  const handleFilesSelected = useCallback((selectedFiles: UploadedFile[]) => {
    setFiles(selectedFiles)
    setOutputFileName(null)
    setPreviewData(null)
    reset()
  }, [reset])

  const handleConvert = async () => {
    if (files.length === 0) return

    const file = files[0]
    const originalName = file.file.name.replace('.pdf', '.xlsx')
    setOutputFileName(originalName)

    await startConversion(file.file, 'pdf-to-excel')
  }

  const handleReset = () => {
    setFiles([])
    setOutputFileName(null)
    setPreviewData(null)
    reset()
  }

  return (
    <PageLayout
      title="PDF to Excel"
      description="Convert PDF tables into editable Excel spreadsheets automatically. Accurate data extraction for financial reports and invoices."
      icon={FileSpreadsheet}
    >
      <div className="max-w-3xl mx-auto">
        {conversionState === 'idle' || conversionState === 'error' ? (
          <div className="space-y-8">
            <FileUploader
              accept={{ 'application/pdf': ['.pdf'] }}
              maxFiles={1}
              maxSize={10 * 1024 * 1024}
              onFilesSelected={handleFilesSelected}
              title="Drop your PDF here"
              description="or click to browse (max 10MB)"
            />

            {files.length > 0 && conversionState === 'idle' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Button
                  onClick={handleConvert}
                  className="w-full flex items-center justify-center gap-2 py-6 text-lg"
                  size="lg"
                  variant="primary"
                >
                  <Sparkles className="w-5 h-5" />
                  Convert to Excel
                </Button>
              </div>
            )}

            {conversionState === 'error' && (
              <ConversionStatus
                state={conversionState}
                progress={progress}
                error={error}
                onReset={handleReset}
                className="mt-6"
              />
            )}
          </div>
        ) : (
          <div className="space-y-6">
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

            {previewData && previewData.length > 0 && (
              <div className="glass-panel p-6 rounded-2xl border border-white/10 bg-white/5 animate-in fade-in slide-in-from-bottom-4">
                <div className="flex items-center gap-2 mb-4 text-white font-medium">
                  <Table className="w-5 h-5 text-green-400" />
                  <span>Data Preview (First 5 rows)</span>
                </div>
                <div className="overflow-x-auto custom-scrollbar rounded-lg border border-white/10">
                  <table className="w-full text-sm text-left">
                    <tbody>
                      {previewData.map((row, rowIndex) => (
                        <tr 
                          key={rowIndex} 
                          className={rowIndex === 0 ? "bg-white/10 font-bold text-white" : "border-t border-white/5 text-gray-300"}
                        >
                          {row.map((cell, cellIndex) => (
                            <td key={cellIndex} className="p-3 min-w-[100px]">
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}


        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 border-t border-white/10 pt-12">
            <div className="text-center group">
              <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary-500/20 transition-colors">
                <Table className="h-5 w-5 text-gray-400 group-hover:text-primary-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">Table Extraction</h3>
              <p className="text-sm text-gray-400">Smart detection of rows & columns.</p>
            </div>
            <div className="text-center group">
               <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-accent-purple/20 transition-colors">
                <Zap className="h-5 w-5 text-gray-400 group-hover:text-accent-purple" />
              </div>
              <h3 className="font-semibold text-white mb-2">High Accuracy</h3>
              <p className="text-sm text-gray-400">Preserves data integrity.</p>
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
