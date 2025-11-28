import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getUsage } from '@/lib/usage'
import { getClientIp } from '@/lib/ratelimit'

export const dynamic = 'force-dynamic'

/**
 * GET /api/usage
 * Get current usage information for the user
 */
export async function GET(request: NextRequest) {
  try {
    // Get session and user info
    const session = await auth()
    const userId = session?.user?.id || null

    // Get client IP and fingerprint
    const ipAddress = getClientIp(request)
    const fingerprint = request.headers.get('x-fingerprint') || null

    // Get usage data
    const usage = await getUsage(userId, fingerprint, ipAddress)

    return NextResponse.json(usage, { status: 200 })
  } catch (error) {
    console.error('Usage API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch usage data' },
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
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Fingerprint',
    },
  })
}
