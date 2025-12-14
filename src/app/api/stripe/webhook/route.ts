import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { stripe, mapStripeStatus, getPlanFromPriceId } from '@/lib/stripe'
import { prisma } from '@/lib/db'

// Stripe webhook secret
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

/**
 * Handle Stripe webhook events
 */
export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = (await headers()).get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (error) {
    console.error('Webhook signature verification failed:', error)
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }

  try {
    // Log webhook event
    await prisma.webhookEvent.create({
      data: {
        stripeEventId: event.id,
        type: event.type,
        data: event.data.object as any,
      },
    })

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session)
        break

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice)
        break

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    // Mark webhook as processed
    await prisma.webhookEvent.update({
      where: { stripeEventId: event.id },
      data: {
        processed: true,
        processedAt: new Date(),
      },
    })

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Error processing webhook:', error)

    // Log error in webhook event
    await prisma.webhookEvent.update({
      where: { stripeEventId: event.id },
      data: {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    })

    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

/**
 * Handle successful checkout session
 */
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId || session.client_reference_id

  if (!userId) {
    throw new Error('No userId found in checkout session')
  }

  const customerId = session.customer as string
  const subscriptionId = session.subscription as string

  // Retrieve the full subscription object
  const subscription = await stripe.subscriptions.retrieve(subscriptionId) as Stripe.Subscription

  // Get price ID and plan
  const priceId = subscription.items.data[0]?.price.id
  const plan = getPlanFromPriceId(priceId || '')

  // Create or update subscription in database
  const subAny = subscription as any
  await prisma.subscription.upsert({
    where: { userId },
    create: {
      userId,
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscriptionId,
      stripePriceId: priceId,
      status: mapStripeStatus(subscription.status),
      plan: plan || 'MONTHLY',
      currentPeriodStart: new Date(subAny.current_period_start * 1000),
      currentPeriodEnd: new Date(subAny.current_period_end * 1000),
      trialStart: subAny.trial_start
        ? new Date(subAny.trial_start * 1000)
        : null,
      trialEnd: subAny.trial_end
        ? new Date(subAny.trial_end * 1000)
        : null,
    },
    update: {
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscriptionId,
      stripePriceId: priceId,
      status: mapStripeStatus(subscription.status),
      plan: plan || 'MONTHLY',
      currentPeriodStart: new Date(subAny.current_period_start * 1000),
      currentPeriodEnd: new Date(subAny.current_period_end * 1000),
      trialStart: subAny.trial_start
        ? new Date(subAny.trial_start * 1000)
        : null,
      trialEnd: subAny.trial_end
        ? new Date(subAny.trial_end * 1000)
        : null,
    },
  })

  // Update user tier to PREMIUM
  await prisma.user.update({
    where: { id: userId },
    data: { tier: 'PREMIUM' },
  })

  console.log(`Subscription created for user ${userId}`)
}

/**
 * Handle subscription update
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  // Try to get userId from metadata, fallback to DB lookup
  let userId = subscription.metadata?.userId

  if (!userId) {
    // Fallback: lookup by stripeSubscriptionId or stripeCustomerId
    const dbSubscription = await prisma.subscription.findFirst({
      where: {
        OR: [
          { stripeSubscriptionId: subscription.id },
          { stripeCustomerId: subscription.customer as string },
        ],
      },
      select: { userId: true },
    })

    if (!dbSubscription) {
      console.error('No subscription found for:', subscription.id, subscription.customer)
      return
    }
    userId = dbSubscription.userId
  }

  const priceId = subscription.items.data[0]?.price.id
  const plan = getPlanFromPriceId(priceId || '')

  // Update subscription in database
  const subAny = subscription as any
  await prisma.subscription.update({
    where: { stripeSubscriptionId: subscription.id },
    data: {
      status: mapStripeStatus(subscription.status),
      stripePriceId: priceId,
      plan: plan || 'MONTHLY',
      currentPeriodStart: new Date(subAny.current_period_start * 1000),
      currentPeriodEnd: new Date(subAny.current_period_end * 1000),
      cancelAtPeriodEnd: subAny.cancel_at_period_end,
      trialStart: subAny.trial_start
        ? new Date(subAny.trial_start * 1000)
        : null,
      trialEnd: subAny.trial_end
        ? new Date(subAny.trial_end * 1000)
        : null,
    },
  })

  // Update user tier based on subscription status
  const isActive = ['ACTIVE', 'TRIALING'].includes(mapStripeStatus(subscription.status))
  await prisma.user.update({
    where: { id: userId },
    data: { tier: isActive ? 'PREMIUM' : 'FREE' },
  })

  console.log(`Subscription updated for user ${userId}`)
}

/**
 * Handle subscription deletion/cancellation
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  // Try to get userId from metadata, fallback to DB lookup
  let userId = subscription.metadata?.userId

  if (!userId) {
    // Fallback: lookup by stripeSubscriptionId or stripeCustomerId
    const dbSubscription = await prisma.subscription.findFirst({
      where: {
        OR: [
          { stripeSubscriptionId: subscription.id },
          { stripeCustomerId: subscription.customer as string },
        ],
      },
      select: { userId: true },
    })

    if (!dbSubscription) {
      console.error('No subscription found for deletion:', subscription.id, subscription.customer)
      return
    }
    userId = dbSubscription.userId
  }

  // Update subscription status to CANCELED
  await prisma.subscription.update({
    where: { stripeSubscriptionId: subscription.id },
    data: {
      status: 'CANCELED',
      cancelAtPeriodEnd: false,
    },
  })

  // Downgrade user to FREE tier
  await prisma.user.update({
    where: { id: userId },
    data: { tier: 'FREE' },
  })

  console.log(`Subscription canceled for user ${userId}`)
}

/**
 * Handle successful invoice payment
 */
async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  const subscriptionId = typeof (invoice as any).subscription === 'string'
    ? (invoice as any).subscription
    : (invoice as any).subscription?.id

  if (!subscriptionId) {
    return
  }

  // Find subscription in our database
  const dbSubscription = await prisma.subscription.findUnique({
    where: { stripeSubscriptionId: subscriptionId },
  })

  if (!dbSubscription) {
    console.log('No subscription found for invoice:', subscriptionId)
    return
  }

  const userId = dbSubscription.userId

  // Update subscription status to ACTIVE if it was PAST_DUE
  if (dbSubscription.status === 'PAST_DUE') {
    await prisma.subscription.update({
      where: { stripeSubscriptionId: subscriptionId },
      data: { status: 'ACTIVE' },
    })

    await prisma.user.update({
      where: { id: userId },
      data: { tier: 'PREMIUM' },
    })

    console.log(`Payment succeeded for user ${userId}, reactivating subscription`)
  }
}

/**
 * Handle failed invoice payment
 */
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const subscriptionId = typeof (invoice as any).subscription === 'string'
    ? (invoice as any).subscription
    : (invoice as any).subscription?.id

  if (!subscriptionId) {
    return
  }

  // Find subscription in our database
  const dbSubscription = await prisma.subscription.findUnique({
    where: { stripeSubscriptionId: subscriptionId },
  })

  if (!dbSubscription) {
    console.log('No subscription found for failed invoice:', subscriptionId)
    return
  }

  const userId = dbSubscription.userId

  // Update subscription status to PAST_DUE
  await prisma.subscription.update({
    where: { stripeSubscriptionId: subscriptionId },
    data: { status: 'PAST_DUE' },
  })

  // Downgrade user to FREE tier
  await prisma.user.update({
    where: { id: userId },
    data: { tier: 'FREE' },
  })

  console.log(`Payment failed for user ${userId}, subscription marked as PAST_DUE`)
}

// Disable body parsing - we need raw body for signature verification
export const runtime = 'nodejs'
