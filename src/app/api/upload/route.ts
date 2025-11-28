import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { saveFile, getFileExtension } from '@/lib/storage'
import { auth } from '@/lib/auth'
import { checkRateLimit, checkIpRateLimit, getClientIp } from '@/lib/ratelimit'
import { checkUsageLimit, getUserTier } from '@/lib/usage'

const MAX_FILE_SIZE_FREE = parseInt(process.env.MAX_FILE_SIZE_FREE || '10485760') // 10MB
const MAX_FILE_SIZE_PREMIUM = parseInt(process.env.MAX_FILE_SIZE_PREMIUM || '52428800') // 50MB
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/bmp',
  'image/tiff',
  'text/plain',
  'text/csv',
]

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

    // Get file from form data
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file size based on tier
    const maxFileSize = tier === 'PREMIUM' ? MAX_FILE_SIZE_PREMIUM : MAX_FILE_SIZE_FREE
    if (file.size > maxFileSize) {
      return NextResponse.json(
        {
          error: `File size exceeds the maximum limit of ${Math.round(maxFileSize / 1024 / 1024)}MB${
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
        { error: 'File type not supported' },
        { status: 400 }
      )
    }

    // Read file buffer
    const buffer = Buffer.from(await file.arrayBuffer())

    // Save file
    const result = await saveFile(buffer, file.name)

    // Generate file ID for tracking
    const fileId = randomUUID()

    // Return success with rate limit info in headers
    return NextResponse.json(
      {
        success: true,
        fileId,
        fileName: file.name,
        fileSize: result.size,
        filePath: result.path,
        mimeType: file.type,
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
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    )
  }
}

// Handle CORS preflight requests
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
