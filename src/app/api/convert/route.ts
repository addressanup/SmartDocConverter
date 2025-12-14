/**
 * @deprecated This async job-based conversion API is currently broken on Vercel
 * due to in-memory job storage not persisting across serverless function invocations.
 * Use /api/convert-sync for synchronous conversions instead.
 *
 * TODO: To restore async functionality, implement persistent job storage with:
 * - Redis (Upstash) for job state
 * - S3/R2 for file storage
 * - Or migrate to a persistent backend (Railway, Cloud Run)
 *
 * See CONVERSION_ENGINE_OPTIONS.md for architecture discussion.
 */
import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import fs from 'fs'
import path from 'path'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

// Lazy load converters to avoid cold start issues
async function getConverter(type: string) {
  switch (type) {
    case 'pdf-to-word':
      return (await import('@/lib/converters/pdf-to-word')).convertPdfToWord
    case 'word-to-pdf':
      return (await import('@/lib/converters/word-to-pdf')).convertWordToPdf
    case 'compress-pdf':
      return (await import('@/lib/converters/compress-pdf')).compressPdf
    case 'merge-pdf':
      return (await import('@/lib/converters/merge-pdf')).mergePdfs
    case 'split-pdf':
      return (await import('@/lib/converters/split-pdf')).splitPdf
    case 'rotate-pdf':
      return (await import('@/lib/converters/rotate-pdf')).rotatePdf
    case 'protect-pdf':
      return (await import('@/lib/converters/protect-pdf')).protectPdf
    case 'unlock-pdf':
      return (await import('@/lib/converters/unlock-pdf')).unlockPdf
    case 'pdf-to-jpg':
      return (await import('@/lib/converters/pdf-to-jpg')).convertPdfToJpg
    case 'jpg-to-pdf':
      return (await import('@/lib/converters/jpg-to-pdf')).convertJpgToPdf
    case 'pdf-to-excel':
      return (await import('@/lib/converters/pdf-to-excel')).convertPdfToExcel
    case 'image-to-text':
      return (await import('@/lib/converters/image-to-text')).convertImageToText
    default:
      return null
  }
}

export type ConversionType =
  | 'pdf-to-word'
  | 'word-to-pdf'
  | 'pdf-to-excel'
  | 'compress-pdf'
  | 'merge-pdf'
  | 'split-pdf'
  | 'jpg-to-pdf'
  | 'pdf-to-jpg'
  | 'image-to-text'
  | 'unlock-pdf'
  | 'rotate-pdf'
  | 'protect-pdf'

interface ConversionJob {
  jobId: string
  status: 'queued' | 'processing' | 'completed' | 'failed'
  progress: number
  outputPath?: string
  error?: string
  metadata?: Record<string, any>
}

// In-memory job storage
const getJobsMap = (): Map<string, ConversionJob> => {
  if (!(global as any).__conversionJobs) {
    (global as any).__conversionJobs = new Map<string, ConversionJob>()
  }
  return (global as any).__conversionJobs
}

export async function POST(request: NextRequest) {
  try {
    console.log('[Convert] Starting...')
    
    let body: any
    try {
      body = await request.json()
      console.log('[Convert] Body:', JSON.stringify(body))
    } catch (e) {
      console.error('[Convert] JSON parse error:', e)
      return NextResponse.json(
        { error: 'Invalid JSON body' },
        { status: 400 }
      )
    }

    const { fileId, filePath, conversionType, options, filePaths } = body

    if (!fileId || !conversionType) {
      return NextResponse.json(
        { error: 'Missing required fields: fileId and conversionType' },
        { status: 400 }
      )
    }

    // For merge-pdf, validate filePaths
    if (conversionType === 'merge-pdf') {
      if (!filePaths || !Array.isArray(filePaths) || filePaths.length < 2) {
        return NextResponse.json(
          { error: 'At least two file paths required for merge' },
          { status: 400 }
        )
      }
      for (const fp of filePaths) {
        if (!fs.existsSync(fp)) {
          return NextResponse.json(
            { error: `File not found: ${fp}` },
            { status: 404 }
          )
        }
      }
    } else {
      if (!filePath) {
        return NextResponse.json(
          { error: 'Missing filePath' },
          { status: 400 }
        )
      }
      if (!fs.existsSync(filePath)) {
        return NextResponse.json(
          { error: 'Input file not found' },
          { status: 404 }
        )
      }
    }

    const jobId = randomUUID()
    const jobs = getJobsMap()

    jobs.set(jobId, {
      jobId,
      status: 'queued',
      progress: 0,
    })

    // Process async
    processConversion(jobId, filePath, conversionType, options || {}, filePaths).catch((error) => {
      console.error(`[Convert] Job ${jobId} failed:`, error)
      jobs.set(jobId, {
        jobId,
        status: 'failed',
        progress: 0,
        error: error instanceof Error ? error.message : String(error),
      })
    })

    console.log('[Convert] Job created:', jobId)

    return NextResponse.json({
      success: true,
      jobId,
      status: 'queued',
      message: 'Conversion job created',
    })
  } catch (error) {
    console.error('[Convert] Error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to create conversion job',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}

async function processConversion(
  jobId: string,
  filePath: string,
  conversionType: string,
  options: Record<string, unknown>,
  filePaths?: string[]
) {
  const jobs = getJobsMap()

  try {
    jobs.set(jobId, { jobId, status: 'processing', progress: 10 })
    console.log(`[Convert] Processing ${jobId}: ${conversionType}`)

    const converter = await getConverter(conversionType)
    if (!converter) {
      throw new Error(`Unsupported conversion type: ${conversionType}`)
    }

    let outputPath: string
    let metadata: Record<string, any> | undefined

    if (conversionType === 'merge-pdf' && filePaths) {
      outputPath = await (converter as any)(filePaths, options)
    } else if (conversionType === 'protect-pdf') {
      outputPath = await (converter as any)(filePath, options)
    } else {
      outputPath = await (converter as any)(filePath, options)
    }

    // Get compression metadata if applicable
    if (conversionType === 'compress-pdf' && fs.existsSync(filePath) && fs.existsSync(outputPath)) {
      const originalSize = fs.statSync(filePath).size
      const compressedSize = fs.statSync(outputPath).size
      metadata = {
        originalSize,
        compressedSize,
        compressionRatio: ((1 - compressedSize / originalSize) * 100).toFixed(2)
      }
    }

    jobs.set(jobId, {
      jobId,
      status: 'completed',
      progress: 100,
      outputPath,
      metadata
    })

    console.log(`[Convert] Job ${jobId} completed: ${outputPath}`)
  } catch (error) {
    console.error(`[Convert] Job ${jobId} error:`, error)
    jobs.set(jobId, {
      jobId,
      status: 'failed',
      progress: 0,
      error: error instanceof Error ? error.message : String(error),
    })
  }
}

export async function GET(request: NextRequest) {
  try {
    const jobId = request.nextUrl.searchParams.get('jobId')

    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID required' },
        { status: 400 }
      )
    }

    const jobs = getJobsMap()
    const job = jobs.get(jobId)

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      )
    }

    const response: any = {
      jobId: job.jobId,
      status: job.status,
      progress: job.progress,
      metadata: job.metadata
    }

    if (job.status === 'completed' && job.outputPath) {
      const filename = path.basename(job.outputPath)
      response.downloadUrl = `/api/download/${jobId}?filename=${encodeURIComponent(filename)}`
    }

    if (job.status === 'failed' && job.error) {
      response.error = job.error
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('[Convert] GET Error:', error)
    return NextResponse.json(
      { error: 'Failed to get job status' },
      { status: 500 }
    )
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Fingerprint',
    },
  })
}
