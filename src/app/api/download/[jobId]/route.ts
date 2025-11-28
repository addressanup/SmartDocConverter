import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

// Force Node.js runtime for file system operations
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Import the jobs map from the convert route
// Note: In production, this should be stored in Redis or a database
// For now, we'll need to access it via a shared module

interface ConversionJob {
  jobId: string
  status: 'queued' | 'processing' | 'completed' | 'failed'
  progress: number
  outputPath?: string
  error?: string
}

// This is a workaround - in production, use proper state management
// We'll export this from a shared module
const getJobsMap = (): Map<string, ConversionJob> => {
  // Access the jobs map from the module cache
  // This is a hack - in production, use Redis or a database
  if (!(global as any).__conversionJobs) {
    (global as any).__conversionJobs = new Map<string, ConversionJob>()
  }
  return (global as any).__conversionJobs
}

export async function GET(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const jobId = params.jobId
    const searchParams = request.nextUrl.searchParams
    const filename = searchParams.get('filename')

    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID required' },
        { status: 400 }
      )
    }

    // Get job from storage
    const jobs = getJobsMap()
    const job = jobs.get(jobId)

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      )
    }

    if (job.status !== 'completed' || !job.outputPath) {
      return NextResponse.json(
        { error: 'File not ready for download' },
        { status: 400 }
      )
    }

    // Check if file exists
    if (!fs.existsSync(job.outputPath)) {
      return NextResponse.json(
        { error: 'Output file not found' },
        { status: 404 }
      )
    }

    // Read file
    const fileBuffer = fs.readFileSync(job.outputPath)
    const fileExt = path.extname(job.outputPath).toLowerCase()

    // Determine content type
    const contentTypeMap: Record<string, string> = {
      '.pdf': 'application/pdf',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.txt': 'text/plain',
      '.json': 'application/json',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
    }

    const contentType = contentTypeMap[fileExt] || 'application/octet-stream'
    const downloadFilename = filename || path.basename(job.outputPath)

    // Return file with appropriate headers
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${downloadFilename}"`,
        'Content-Length': fileBuffer.length.toString(),
      },
    })
  } catch (error) {
    console.error('Download error:', error)
    return NextResponse.json(
      { error: 'Failed to download file' },
      { status: 500 }
    )
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}
