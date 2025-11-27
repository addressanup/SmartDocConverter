import { NextRequest, NextResponse } from 'next/server'
import { cleanupExpiredFiles } from '@/lib/cleanup'

const CLEANUP_SECRET = process.env.CLEANUP_SECRET

/**
 * GET /api/cleanup
 *
 * Triggers cleanup of expired files from uploads and tmp directories.
 * Requires x-cleanup-secret header matching CLEANUP_SECRET env var.
 * Designed to be triggered by external cron services (e.g., cron-job.org).
 */
export async function GET(request: NextRequest) {
  // Verify cleanup secret
  const providedSecret = request.headers.get('x-cleanup-secret')

  if (!CLEANUP_SECRET) {
    return NextResponse.json(
      { error: 'CLEANUP_SECRET not configured on server' },
      { status: 500 }
    )
  }

  if (!providedSecret || providedSecret !== CLEANUP_SECRET) {
    return NextResponse.json(
      { error: 'Unauthorized: Invalid or missing x-cleanup-secret header' },
      { status: 401 }
    )
  }

  try {
    // Run cleanup
    const result = await cleanupExpiredFiles()

    return NextResponse.json({
      success: true,
      deletedCount: result.deletedCount,
      deletedFiles: result.deletedFiles,
      errors: result.errors.length > 0 ? result.errors : undefined,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Cleanup endpoint error:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to run cleanup',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
