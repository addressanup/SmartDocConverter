import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { saveFile } from '@/lib/storage'
import { auth } from '@/lib/auth'
import { checkRateLimit, checkIpRateLimit, getClientIp } from '@/lib/ratelimit'
import { checkUsageLimit, getUserTier } from '@/lib/usage'

// Force Node.js runtime for file system operations
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const MAX_FILE_SIZE_FREE = parseInt(process.env.MAX_FILE_SIZE_FREE || '10485760') // 10MB
const MAX_FILE_SIZE_PREMIUM = parseInt(process.env.MAX_FILE_SIZE_PREMIUM || '52428800') // 50MB
const MAX_FILES_FREE = 5 // Maximum number of files for free tier
const MAX_FILES_PREMIUM = 20 // Maximum number of files for premium tier

const ALLOWED_MIME_TYPES = [
  'application/pdf', // Only PDFs for merge functionality
]

export interface UploadedFileInfo {
  fileId: string
  fileName: string
  fileSize: number
  filePath: string
  mimeType: string
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

    // Get files from form data
    const formData = await request.formData()
    const files: File[] = []

    // Extract all files from form data
    for (const [_key, value] of formData.entries()) {
      if (value instanceof File) {
        files.push(value)
      }
    }

    if (files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      )
    }

    // Check minimum files for merge
    if (files.length < 2) {
      return NextResponse.json(
        { error: 'At least 2 files are required for merging' },
        { status: 400 }
      )
    }

    // Check maximum number of files based on tier
    const maxFiles = tier === 'PREMIUM' ? MAX_FILES_PREMIUM : MAX_FILES_FREE
    if (files.length > maxFiles) {
      return NextResponse.json(
        {
          error: `Maximum ${maxFiles} files allowed${
            tier !== 'PREMIUM' ? '. Upgrade to Premium to merge up to 20 files.' : '.'
          }`,
          maxFiles,
          tier,
        },
        { status: 400 }
      )
    }

    // Validate file size and type
    const maxFileSize = tier === 'PREMIUM' ? MAX_FILE_SIZE_PREMIUM : MAX_FILE_SIZE_FREE
    const uploadedFiles: UploadedFileInfo[] = []
    let totalSize = 0

    for (let i = 0; i < files.length; i++) {
      const file = files[i]

      // Validate file size
      if (file.size > maxFileSize) {
        return NextResponse.json(
          {
            error: `File "${file.name}" exceeds the maximum size limit of ${Math.round(maxFileSize / 1024 / 1024)}MB${
              tier !== 'PREMIUM' ? '. Upgrade to Premium for larger file support (50MB).' : '.'
            }`,
            maxFileSize,
            tier,
          },
          { status: 400 }
        )
      }

      // Validate file type
      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        return NextResponse.json(
          { error: `File "${file.name}" is not a supported type. Only PDF files are allowed for merging.` },
          { status: 400 }
        )
      }

      totalSize += file.size
    }

    // Process and save all files
    console.log(`[Upload Multiple] Processing ${files.length} files, total size: ${(totalSize / 1024).toFixed(2)} KB`)

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      console.log(`[Upload Multiple] Processing file ${i + 1}/${files.length}: ${file.name}`)

      // Read file buffer
      const buffer = Buffer.from(await file.arrayBuffer())

      // Save file
      const result = await saveFile(buffer, file.name)

      // Generate file ID for tracking
      const fileId = randomUUID()

      uploadedFiles.push({
        fileId,
        fileName: file.name,
        fileSize: result.size,
        filePath: result.path,
        mimeType: file.type,
      })

      console.log(`[Upload Multiple] Saved file ${i + 1}: ${result.path}`)
    }

    console.log(`[Upload Multiple] Successfully uploaded ${uploadedFiles.length} files`)

    // Return success with rate limit info in headers
    return NextResponse.json(
      {
        success: true,
        files: uploadedFiles,
        totalSize,
        fileCount: uploadedFiles.length,
        usage: usageCheck.usage,
      },
      {
        status: 200,
        headers: {
          'X-RateLimit-Limit': rateLimit.limit.toString(),
          'X-RateLimit-Remaining': rateLimit.remaining.toString(),
          'X-RateLimit-Reset': rateLimit.reset.toString(),
        },
      }
    )
  } catch (error) {
    console.error('[Upload Multiple] Upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload files' },
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
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Fingerprint',
    },
  })
}
