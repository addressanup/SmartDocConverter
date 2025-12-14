import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { promises as fs } from 'fs'
import fsSync from 'fs'
import path from 'path'
import { auth } from '@/lib/auth'
import { checkUsageLimit, incrementUsage, getUserTier } from '@/lib/usage'
import { getClientIp } from '@/lib/ratelimit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

const UPLOAD_DIR = process.env.VERCEL ? '/tmp/uploads' : './uploads'
const MAX_FILE_SIZE_FREE = parseInt(process.env.MAX_FILE_SIZE_FREE || '10485760', 10) // 10MB default
const MAX_FILE_SIZE_PREMIUM = parseInt(process.env.MAX_FILE_SIZE_PREMIUM || '52428800', 10) // 50MB default

async function ensureDir(dir: string) {
  try {
    await fs.mkdir(dir, { recursive: true })
  } catch {
    // ignore if exists
  }
}

async function getConverter(type: string) {
  switch (type) {
    case 'pdf-to-word':
      return (await import('@/lib/converters/pdf-to-word')).convertPdfToWord
    case 'word-to-pdf':
      return (await import('@/lib/converters/word-to-pdf')).convertWordToPdf
    case 'compress-pdf':
      return (await import('@/lib/converters/compress-pdf')).compressPdf
    case 'rotate-pdf':
      return (await import('@/lib/converters/rotate-pdf')).rotatePdf
    case 'protect-pdf':
      return (await import('@/lib/converters/protect-pdf')).protectPdf
    case 'unlock-pdf':
      return (await import('@/lib/converters/unlock-pdf')).unlockPdf
    case 'split-pdf':
      return (await import('@/lib/converters/split-pdf')).splitPdf
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

export async function POST(request: NextRequest) {
  let inputPath: string | null = null
  let outputPath: string | null = null

  try {
    console.log('[Convert-Sync] Starting...')

    // Get user session and rate limit info
    const session = await auth()
    const userId = session?.user?.id || null
    const fingerprint = request.headers.get('x-fingerprint')
    const ipAddress = getClientIp(request)

    // Check usage limits before processing
    const { allowed, message } = await checkUsageLimit(userId, fingerprint, ipAddress)
    if (!allowed) {
      console.log(`[Convert-Sync] Rate limit exceeded for user: ${userId || fingerprint || ipAddress}`)
      return NextResponse.json(
        { error: 'Daily conversion limit reached', details: message },
        { status: 429 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const conversionType = formData.get('type') as string | null
    const optionsStr = formData.get('options') as string | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!conversionType) {
      return NextResponse.json({ error: 'No conversion type provided' }, { status: 400 })
    }

    // Check file size based on user tier
    const tier = await getUserTier(userId)
    const maxFileSize = tier === 'PREMIUM' ? MAX_FILE_SIZE_PREMIUM : MAX_FILE_SIZE_FREE
    if (file.size > maxFileSize) {
      const maxMB = Math.round(maxFileSize / (1024 * 1024))
      return NextResponse.json(
        { error: `File too large. Maximum size is ${maxMB}MB for ${tier.toLowerCase()} users.` },
        { status: 400 }
      )
    }

    console.log(`[Convert-Sync] File: ${file.name}, Type: ${conversionType}, User: ${userId || 'anonymous'}`)

    // Parse options
    let options: Record<string, unknown> = {}
    if (optionsStr) {
      try {
        options = JSON.parse(optionsStr)
      } catch {
        // ignore parse errors
      }
    }

    // Save uploaded file
    await ensureDir(UPLOAD_DIR)
    const ext = path.extname(file.name)
    const inputFileName = `${randomUUID()}${ext}`
    inputPath = path.join(UPLOAD_DIR, inputFileName)

    const buffer = Buffer.from(await file.arrayBuffer())
    await fs.writeFile(inputPath, buffer)
    console.log(`[Convert-Sync] Saved input: ${inputPath}`)

    // Get converter
    const converter = await getConverter(conversionType)
    if (!converter) {
      return NextResponse.json(
        { error: `Unsupported conversion type: ${conversionType}` },
        { status: 400 }
      )
    }

    // Run conversion
    console.log(`[Convert-Sync] Converting...`)
    outputPath = await (converter as any)(inputPath, options)
    console.log(`[Convert-Sync] Output: ${outputPath}`)

    // Read output file
    if (!outputPath || !fsSync.existsSync(outputPath)) {
      return NextResponse.json({ error: 'Conversion failed - no output file' }, { status: 500 })
    }

    const outputBuffer = await fs.readFile(outputPath)
    const outputExt = path.extname(outputPath).toLowerCase()
    const outputFileName = path.basename(outputPath)

    // Determine content type
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
    const contentType = contentTypeMap[outputExt] || 'application/octet-stream'

    // Increment usage counter after successful conversion
    await incrementUsage(userId, fingerprint, ipAddress, file.size)
    console.log(`[Convert-Sync] Usage incremented for user: ${userId || fingerprint || ipAddress}`)

    // Clean up temporary files
    try {
      if (inputPath) await fs.unlink(inputPath)
      if (outputPath) await fs.unlink(outputPath)
    } catch {
      // ignore cleanup errors
    }

    console.log(`[Convert-Sync] Sending response: ${outputFileName} (${outputBuffer.length} bytes)`)

    // Return the file directly
    return new NextResponse(outputBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${outputFileName}"`,
        'Content-Length': outputBuffer.length.toString(),
        'Access-Control-Allow-Origin': '*',
        'X-Output-Filename': outputFileName,
      },
    })
  } catch (error) {
    console.error('[Convert-Sync] Error:', error)

    // Clean up on error
    try {
      if (inputPath) await fs.unlink(inputPath)
      if (outputPath) await fs.unlink(outputPath)
    } catch {
      // ignore cleanup errors
    }

    return NextResponse.json(
      {
        error: 'Conversion failed',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}
