import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import fs from 'fs'
import path from 'path'
import { convertPdfToWord } from '@/lib/converters/pdf-to-word'
import { convertWordToPdf } from '@/lib/converters/word-to-pdf'
import { compressPdf } from '@/lib/converters/compress-pdf'
import { convertImageToText } from '@/lib/converters/image-to-text'
import { convertJpgToPdf } from '@/lib/converters/jpg-to-pdf'
import { convertPdfToJpg } from '@/lib/converters/pdf-to-jpg'
import { convertPdfToExcel } from '@/lib/converters/pdf-to-excel'
import { splitPdf } from '@/lib/converters/split-pdf'
import { mergePdfs } from '@/lib/converters/merge-pdf'
import { unlockPdf } from '@/lib/converters/unlock-pdf'
import { rotatePdf } from '@/lib/converters/rotate-pdf'
import { protectPdf, ProtectPdfOptions } from '@/lib/converters/protect-pdf'
import { auth } from '@/lib/auth'
import { checkRateLimit, checkIpRateLimit, getClientIp } from '@/lib/ratelimit'
import { checkUsageLimit, incrementUsage, getUserTier } from '@/lib/usage'

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

interface ConversionRequest {
  fileId: string
  filePath: string
  conversionType: ConversionType
  options?: Record<string, unknown>
  fileSize?: number
  filePaths?: string[] // For merge-pdf conversion type
}

interface ConversionJob {
  jobId: string
  status: 'queued' | 'processing' | 'completed' | 'failed'
  progress: number
  outputPath?: string
  error?: string
  metadata?: Record<string, any>
}

// In-memory job storage (in production, use Redis or a database)
// Using global object to share state across API routes
const getJobsMap = (): Map<string, ConversionJob> => {
  if (!(global as any).__conversionJobs) {
    (global as any).__conversionJobs = new Map<string, ConversionJob>()
  }
  return (global as any).__conversionJobs
}

export async function POST(request: NextRequest) {
  try {
    // Get session and user info
    const session = await auth()
    const userId = session?.user?.id || null

    // Get client IP and fingerprint
    const ipAddress = getClientIp(request)
    const fingerprint = request.headers.get('x-fingerprint') || null

    // Check IP-based rate limit first (abuse prevention)
    const ipRateLimit = await checkIpRateLimit(ipAddress)
    if (!ipRateLimit.success) {
      return NextResponse.json(
        {
          error: 'Too many requests from this IP address. Please try again later.',
          resetAt: new Date(ipRateLimit.reset).toISOString(),
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': ipRateLimit.limit.toString(),
            'X-RateLimit-Remaining': ipRateLimit.remaining.toString(),
            'X-RateLimit-Reset': ipRateLimit.reset.toString(),
            'Retry-After': Math.ceil((ipRateLimit.reset - Date.now()) / 1000).toString(),
          },
        }
      )
    }

    // Get user tier
    const tier = await getUserTier(userId)

    // Check user rate limit
    const identifier = userId || fingerprint || ipAddress
    const rateLimit = await checkRateLimit(identifier, tier)

    if (!rateLimit.success) {
      return NextResponse.json(
        {
          error: `Daily limit of ${rateLimit.limit} conversions reached. ${
            tier === 'FREE' || tier === 'ANONYMOUS'
              ? 'Upgrade to Premium for unlimited conversions.'
              : 'Please try again tomorrow.'
          }`,
          resetAt: new Date(rateLimit.reset).toISOString(),
          tier,
          limit: rateLimit.limit,
          remaining: rateLimit.remaining,
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': rateLimit.limit.toString(),
            'X-RateLimit-Remaining': rateLimit.remaining.toString(),
            'X-RateLimit-Reset': rateLimit.reset.toString(),
            'Retry-After': Math.ceil((rateLimit.reset - Date.now()) / 1000).toString(),
          },
        }
      )
    }

    // Check usage limit from database
    const usageCheck = await checkUsageLimit(userId, fingerprint, ipAddress)
    if (!usageCheck.allowed) {
      return NextResponse.json(
        {
          error: usageCheck.message || 'Daily conversion limit exceeded.',
          usage: usageCheck.usage,
          tier,
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': usageCheck.usage.dailyLimit.toString(),
            'X-RateLimit-Remaining': usageCheck.usage.conversionsRemaining.toString(),
            'X-RateLimit-Reset': usageCheck.usage.resetDate.getTime().toString(),
          },
        }
      )
    }

    // Parse request body
    const body: ConversionRequest = await request.json()
    const { fileId, filePath, conversionType, options, fileSize, filePaths } = body

    if (!fileId || !conversionType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // For merge-pdf, validate filePaths array
    if (conversionType === 'merge-pdf') {
      if (!filePaths || !Array.isArray(filePaths) || filePaths.length < 2) {
        return NextResponse.json(
          { error: 'At least two file paths are required for merging PDFs' },
          { status: 400 }
        )
      }

      // Verify all files exist
      for (const path of filePaths) {
        if (!fs.existsSync(path)) {
          return NextResponse.json(
            { error: `Input file not found: ${path}` },
            { status: 404 }
          )
        }
      }
    } else {
      // For other conversion types, validate single filePath
      if (!filePath) {
        return NextResponse.json(
          { error: 'Missing filePath' },
          { status: 400 }
        )
      }

      // Verify file exists
      if (!fs.existsSync(filePath)) {
        return NextResponse.json(
          { error: 'Input file not found' },
          { status: 404 }
        )
      }
    }

    // Generate job ID
    const jobId = randomUUID()

    // Increment usage counter immediately
    // This prevents race conditions where multiple requests could be made before the first completes
    const updatedUsage = await incrementUsage(userId, fingerprint, ipAddress, fileSize)

    // Get jobs map
    const jobs = getJobsMap()

    // Initialize job
    jobs.set(jobId, {
      jobId,
      status: 'queued',
      progress: 0,
    })

    // Process conversion asynchronously
    processConversion(jobId, filePath, conversionType, options || {}, filePaths).catch((error) => {
      console.error(`Job ${jobId} failed:`, error)
      const jobs = getJobsMap()
      jobs.set(jobId, {
        jobId,
        status: 'failed',
        progress: 0,
        error: error.message,
      })
    })

    return NextResponse.json(
      {
        success: true,
        jobId,
        status: 'queued',
        message: 'Conversion job created',
        usage: updatedUsage,
      },
      {
        status: 200,
        headers: {
          'X-RateLimit-Limit': rateLimit.limit.toString(),
          'X-RateLimit-Remaining': Math.max(0, rateLimit.remaining - 1).toString(),
          'X-RateLimit-Reset': rateLimit.reset.toString(),
        },
      }
    )
  } catch (error) {
    console.error('Conversion error:', error)
    return NextResponse.json(
      { error: 'Failed to create conversion job' },
      { status: 500 }
    )
  }
}

async function processConversion(
  jobId: string,
  filePath: string,
  conversionType: ConversionType,
  options: Record<string, unknown>,
  filePaths?: string[]
) {
  try {
    const jobs = getJobsMap()

    // Update job status to processing
    jobs.set(jobId, {
      jobId,
      status: 'processing',
      progress: 10,
    })

    console.log(`Processing job ${jobId}: ${conversionType}`)

    let outputPath: string
    let metadata: Record<string, any> | undefined

    // Route to appropriate converter
    switch (conversionType) {
      case 'pdf-to-word':
        outputPath = await convertPdfToWord(filePath, options)
        break

      case 'word-to-pdf':
        outputPath = await convertWordToPdf(filePath, options)
        break

      case 'compress-pdf':
        // compressPdf now returns metadata if we modify it, but current signature returns string
        // We need to modify compressPdf signature first or just read the file size here
        outputPath = await compressPdf(filePath, options)
        // Calculate compression stats
        if (fs.existsSync(filePath) && fs.existsSync(outputPath)) {
          const originalSize = fs.statSync(filePath).size
          const compressedSize = fs.statSync(outputPath).size
          metadata = {
            originalSize,
            compressedSize,
            compressionRatio: ((1 - compressedSize / originalSize) * 100).toFixed(2)
          }
        }
        break

      case 'image-to-text':
        outputPath = await convertImageToText(filePath, options)
        break

      case 'jpg-to-pdf':
        outputPath = await convertJpgToPdf(filePath, options)
        break

      case 'pdf-to-jpg':
        outputPath = await convertPdfToJpg(filePath, options)
        break

      case 'pdf-to-excel':
        outputPath = await convertPdfToExcel(filePath, options)
        break

      case 'merge-pdf':
        if (!filePaths || filePaths.length < 2) {
          throw new Error('At least two file paths are required for merging PDFs')
        }
        outputPath = await mergePdfs(filePaths, options)
        break

      case 'split-pdf':
        outputPath = await splitPdf(filePath, options)
        break

      case 'unlock-pdf':
        outputPath = await unlockPdf(filePath, options)
        break

      case 'rotate-pdf':
        outputPath = await rotatePdf(filePath, options)
        break

      case 'protect-pdf':
        outputPath = await protectPdf(filePath, options as unknown as ProtectPdfOptions)
        break

      default:
        throw new Error(`Unsupported conversion type: ${conversionType}`)
    }

    // Update job as completed
    jobs.set(jobId, {
      jobId,
      status: 'completed',
      progress: 100,
      outputPath,
      metadata
    })

    console.log(`Job ${jobId} completed: ${outputPath}`)
  } catch (error) {
    console.error(`Job ${jobId} failed:`, error)
    const jobs = getJobsMap()
    jobs.set(jobId, {
      jobId,
      status: 'failed',
      progress: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const jobId = searchParams.get('jobId')

  if (!jobId) {
    return NextResponse.json(
      { error: 'Job ID required' },
      { status: 400 }
    )
  }

  // Get jobs map
  const jobs = getJobsMap()

  // Look up job status
  const job = jobs.get(jobId)

  if (!job) {
    return NextResponse.json(
      { error: 'Job not found' },
      { status: 404 }
    )
  }

  // Build response based on job status
  const response: any = {
    jobId: job.jobId,
    status: job.status,
    progress: job.progress,
    metadata: job.metadata
  }

  if (job.status === 'completed' && job.outputPath) {
    // Generate download URL with the output filename
    const filename = path.basename(job.outputPath)
    response.downloadUrl = `/api/download/${jobId}?filename=${encodeURIComponent(filename)}`
  }

  if (job.status === 'failed' && job.error) {
    response.error = job.error
  }

  return NextResponse.json(response)
}

// Handle CORS preflight requests
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
