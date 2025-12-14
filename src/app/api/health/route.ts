import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    checks: {
      database: 'unknown',
    },
  }

  // Check database connection
  try {
    await prisma.$queryRaw`SELECT 1`
    health.checks.database = 'ok'
  } catch {
    health.checks.database = 'error'
    health.status = 'degraded'
  }

  const statusCode = health.status === 'ok' ? 200 : 503

  return NextResponse.json(health, { status: statusCode })
}
