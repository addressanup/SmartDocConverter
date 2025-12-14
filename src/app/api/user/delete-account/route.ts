import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getStripe } from '@/lib/stripe'
import { z } from 'zod'

const deleteAccountSchema = z.object({
  confirmation: z.literal('DELETE'),
})

export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userId = session.user.id

    // Parse and validate request body
    const body = await request.json()
    const validation = deleteAccountSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Invalid request data. Confirmation must equal "DELETE"',
          details: validation.error.issues
        },
        { status: 400 }
      )
    }

    // Execute account deletion in a transaction
    await prisma.$transaction(async (tx) => {
      // 1. Get user's subscription if exists
      const subscription = await tx.subscription.findUnique({
        where: { userId },
      })

      // 2. Cancel Stripe subscription if it exists
      if (subscription?.stripeSubscriptionId) {
        try {
          const stripe = getStripe()
          await stripe.subscriptions.cancel(subscription.stripeSubscriptionId)
        } catch (stripeError) {
          console.error('Error canceling Stripe subscription:', stripeError)
          // Continue with deletion even if Stripe cancellation fails
          // The subscription will be handled by Stripe webhooks or manual cleanup
        }
      }

      // 3. Delete UsageTracking records
      await tx.usageTracking.deleteMany({
        where: { userId },
      })

      // 4. Delete Subscription record
      if (subscription) {
        await tx.subscription.delete({
          where: { userId },
        })
      }

      // 5. Delete Sessions (if using database sessions)
      // Note: NextAuth with JWT strategy might not use database sessions
      await tx.session.deleteMany({
        where: { userId },
      })

      // 6. Delete OAuth Accounts
      await tx.account.deleteMany({
        where: { userId },
      })

      // 7. Finally, delete the User record
      await tx.user.delete({
        where: { id: userId },
      })
    })

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Account successfully deleted',
    })
  } catch (error) {
    console.error('Error deleting account:', error)

    // Check if it's a Prisma error
    if (error && typeof error === 'object' && 'code' in error) {
      return NextResponse.json(
        { error: 'Database error occurred while deleting account' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to delete account' },
      { status: 500 }
    )
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}
