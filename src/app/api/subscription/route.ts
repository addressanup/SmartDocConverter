import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

/**
 * GET /api/subscription
 * Get current subscription information for the user
 */
export async function GET(request: NextRequest) {
  try {
    // Get session and user info
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          tier: 'FREE',
          status: 'none',
          currentPeriodEnd: null,
          cancelAtPeriodEnd: false
        },
        { status: 200 }
      )
    }

    // Get user with subscription data
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        tier: true,
        subscription: {
          select: {
            status: true,
            currentPeriodEnd: true,
            cancelAtPeriodEnd: true,
            plan: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      tier: user.tier,
      status: user.subscription?.status || 'none',
      currentPeriodEnd: user.subscription?.currentPeriodEnd?.toISOString() || null,
      cancelAtPeriodEnd: user.subscription?.cancelAtPeriodEnd || false,
      plan: user.subscription?.plan || null
    }, { status: 200 })
  } catch (error) {
    console.error('Subscription API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subscription data' },
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
