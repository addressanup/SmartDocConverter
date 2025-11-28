import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { createCheckoutSession, type SubscriptionPlan } from '@/lib/stripe'
import { z } from 'zod'

const checkoutSchema = z.object({
  plan: z.enum(['monthly', 'annual']),
})

export async function POST(req: NextRequest) {
  try {
    // Check if user is authenticated
    const session = await auth()

    if (!session?.user?.id || !session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in to continue.' },
        { status: 401 }
      )
    }

    // Parse and validate request body
    const body = await req.json()
    const validationResult = checkoutSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid plan type. Must be "monthly" or "annual".' },
        { status: 400 }
      )
    }

    const { plan } = validationResult.data

    // Get the app URL from environment
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    // Create Stripe checkout session
    const stripeSession = await createCheckoutSession({
      userId: session.user.id,
      userEmail: session.user.email,
      plan: plan as SubscriptionPlan,
      successUrl: `${appUrl}/dashboard?checkout=success`,
      cancelUrl: `${appUrl}/pricing?checkout=canceled`,
    })

    // Return the session URL for redirect
    return NextResponse.json({
      url: stripeSession.url,
      sessionId: stripeSession.id,
    })
  } catch (error) {
    console.error('Error creating checkout session:', error)

    return NextResponse.json(
      {
        error: 'Failed to create checkout session. Please try again later.',
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
