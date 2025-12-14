import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { createCustomerPortalSession } from '@/lib/stripe'
import { prisma } from '@/lib/db'

export async function POST(_req: NextRequest) {
  try {
    // Check if user is authenticated
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in to continue.' },
        { status: 401 }
      )
    }

    // Get user's subscription
    const subscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
    })

    if (!subscription?.stripeCustomerId) {
      return NextResponse.json(
        { error: 'No active subscription found.' },
        { status: 404 }
      )
    }

    // Get the app URL from environment
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    // Create Stripe customer portal session
    const portalSession = await createCustomerPortalSession({
      customerId: subscription.stripeCustomerId,
      returnUrl: `${appUrl}/dashboard`,
    })

    // Return the portal URL for redirect
    return NextResponse.json({
      url: portalSession.url,
    })
  } catch (error) {
    console.error('Error creating portal session:', error)

    return NextResponse.json(
      {
        error: 'Failed to create portal session. Please try again later.',
        details: error instanceof Error ? error.message : 'Unknown error'
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
