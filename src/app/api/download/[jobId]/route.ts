/**
 * @deprecated This download endpoint is part of the broken async job system.
 * The job storage is in-memory and doesn't persist on Vercel serverless.
 * The /api/convert-sync endpoint now returns files directly in the response.
 *
 * TODO: Remove this file or implement persistent job storage.
 * See /api/convert/route.ts for more details.
 */
import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface ConversionJob {
  jobId: string
  status: 'queued' | 'processing' | 'completed' | 'failed'
  progress: number
  outputPath?: string
  error?: string
}

const getJobsMap = (): Map<string, ConversionJob> => {
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
    const filename = request.nextUrl.searchParams.get('filename')

    if (!jobId) {
      return NextResponse.json({ error: 'Job ID required' }, { status: 400 })
    }

    const jobs = getJobsMap()
    const job = jobs.get(jobId)

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    if (job.status !== 'completed' || !job.outputPath) {
      return NextResponse.json({ error: 'File not ready' }, { status: 400 })
    }

    if (!fs.existsSync(job.outputPath)) {
      return NextResponse.json({ error: 'Output file not found' }, { status: 404 })
    }

    const fileBuffer = fs.readFileSync(job.outputPath)
    const fileExt = path.extname(job.outputPath).toLowerCase()

    const contentTypeMap: Record<string, string> = {
      '.pdf': 'application/pdf',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      '.txt': 'text/plain',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.zip': 'application/zip',
    }

    const contentType = contentTypeMap[fileExt] || 'application/octet-stream'
    const downloadFilename = filename || path.basename(job.outputPath)

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${downloadFilename}"`,
        'Content-Length': fileBuffer.length.toString(),
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch (error) {
    console.error('[Download] Error:', error)
    return NextResponse.json(
      { error: 'Download failed', details: error instanceof Error ? error.message : String(error) },
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
