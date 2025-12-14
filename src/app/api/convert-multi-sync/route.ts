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

export async function POST(request: NextRequest) {
  const filePaths: string[] = []
  let outputPath: string | null = null

  try {
    console.log('[Convert-Multi-Sync] Starting...')

    // Get user session and rate limit info
    const session = await auth()
    const userId = session?.user?.id || null
    const fingerprint = request.headers.get('x-fingerprint')
    const ipAddress = getClientIp(request)

    // Check usage limits before processing
    const { allowed, message } = await checkUsageLimit(userId, fingerprint, ipAddress)
    if (!allowed) {
      console.log(`[Convert-Multi-Sync] Rate limit exceeded for user: ${userId || fingerprint || ipAddress}`)
      return NextResponse.json(
        { error: 'Daily conversion limit reached', details: message },
        { status: 429 }
      )
    }

    const formData = await request.formData()
    const conversionType = formData.get('type') as string | null
    const fileCountStr = formData.get('fileCount') as string | null
    const optionsStr = formData.get('options') as string | null

    if (!conversionType) {
      return NextResponse.json({ error: 'No conversion type provided' }, { status: 400 })
    }

    const fileCount = parseInt(fileCountStr || '0', 10)
    if (fileCount < 2) {
      return NextResponse.json({ error: 'At least 2 files required' }, { status: 400 })
    }

    // Parse options
    let options: Record<string, unknown> = {}
    if (optionsStr) {
      try {
        options = JSON.parse(optionsStr)
      } catch {
        // ignore parse errors
      }
    }

    // Check user tier for file size limits
    const tier = await getUserTier(userId)
    const maxFileSize = tier === 'PREMIUM' ? MAX_FILE_SIZE_PREMIUM : MAX_FILE_SIZE_FREE

    // Save all uploaded files
    await ensureDir(UPLOAD_DIR)
    let totalSize = 0

    for (let i = 0; i < fileCount; i++) {
      const file = formData.get(`file${i}`) as File | null
      if (!file) {
        return NextResponse.json({ error: `Missing file${i}` }, { status: 400 })
      }

      // Check individual file size
      if (file.size > maxFileSize) {
        const maxMB = Math.round(maxFileSize / (1024 * 1024))
        return NextResponse.json(
          { error: `File ${file.name} is too large. Maximum size is ${maxMB}MB for ${tier.toLowerCase()} users.` },
          { status: 400 }
        )
      }

      totalSize += file.size

      const ext = path.extname(file.name)
      const fileName = `${randomUUID()}${ext}`
      const filePath = path.join(UPLOAD_DIR, fileName)

      const buffer = Buffer.from(await file.arrayBuffer())
      await fs.writeFile(filePath, buffer)
      filePaths.push(filePath)

      console.log(`[Convert-Multi-Sync] Saved file ${i + 1}: ${filePath}`)
    }

    // Get merge converter
    if (conversionType !== 'merge-pdf') {
      return NextResponse.json({ error: 'Only merge-pdf supported for multi-file' }, { status: 400 })
    }

    const { mergePdfs } = await import('@/lib/converters/merge-pdf')

    // Run merge
    console.log(`[Convert-Multi-Sync] Merging ${filePaths.length} files...`)
    outputPath = await mergePdfs(filePaths, options)
    console.log(`[Convert-Multi-Sync] Output: ${outputPath}`)

    // Read output file
    if (!fsSync.existsSync(outputPath)) {
      return NextResponse.json({ error: 'Merge failed - no output file' }, { status: 500 })
    }

    const outputBuffer = await fs.readFile(outputPath)
    const outputFileName = path.basename(outputPath)

    // Increment usage counter after successful conversion
    await incrementUsage(userId, fingerprint, ipAddress, totalSize)
    console.log(`[Convert-Multi-Sync] Usage incremented for user: ${userId || fingerprint || ipAddress}`)

    // Clean up all temporary files
    for (const fp of filePaths) {
      try {
        await fs.unlink(fp)
      } catch {
        // ignore cleanup errors
      }
    }
    try {
      if (outputPath) await fs.unlink(outputPath)
    } catch {
      // ignore cleanup errors
    }

    console.log(`[Convert-Multi-Sync] Sending response: ${outputFileName} (${outputBuffer.length} bytes)`)

    return new NextResponse(outputBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${outputFileName}"`,
        'Content-Length': outputBuffer.length.toString(),
        'Access-Control-Allow-Origin': '*',
        'X-Output-Filename': outputFileName,
      },
    })
  } catch (error) {
    console.error('[Convert-Multi-Sync] Error:', error)

    // Clean up on error
    for (const fp of filePaths) {
      try {
        await fs.unlink(fp)
      } catch {
        // ignore cleanup errors
      }
    }
    try {
      if (outputPath) await fs.unlink(outputPath)
    } catch {
      // ignore cleanup errors
    }

    return NextResponse.json(
      {
        error: 'Merge failed',
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
