import Stripe from 'stripe'

// Lazy initialization of Stripe client
let stripeInstance: Stripe | null = null

export function getStripe(): Stripe {
  if (!stripeInstance) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('Missing STRIPE_SECRET_KEY environment variable')
    }
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-11-17.clover',
      typescript: true,
    })
  }
  return stripeInstance
}

// For backwards compatibility
export const stripe = {
  get checkout() { return getStripe().checkout },
  get billingPortal() { return getStripe().billingPortal },
  get subscriptions() { return getStripe().subscriptions },
  get customers() { return getStripe().customers },
  get webhooks() { return getStripe().webhooks },
}

// Price IDs from environment or use placeholders
export const STRIPE_PRICE_IDS = {
  MONTHLY: process.env.STRIPE_PRICE_MONTHLY || 'price_monthly_499',
  ANNUAL: process.env.STRIPE_PRICE_ANNUAL || 'price_annual_3999',
} as const

// Subscription plan type
export type SubscriptionPlan = 'monthly' | 'annual'

/**
 * Creates a Stripe checkout session for subscription
 */
export async function createCheckoutSession({
  userId,
  userEmail,
  plan,
  successUrl,
  cancelUrl,
}: {
  userId: string
  userEmail: string
  plan: SubscriptionPlan
  successUrl: string
  cancelUrl: string
}) {
  const priceId = plan === 'monthly' ? STRIPE_PRICE_IDS.MONTHLY : STRIPE_PRICE_IDS.ANNUAL

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    customer_email: userEmail,
    client_reference_id: userId,
    subscription_data: {
      trial_period_days: 7,
      metadata: {
        userId,
        plan,
      },
    },
    metadata: {
      userId,
      plan,
    },
    success_url: successUrl,
    cancel_url: cancelUrl,
    allow_promotion_codes: true,
  })

  return session
}

/**
 * Creates a Stripe customer portal session for managing subscription
 */
export async function createCustomerPortalSession({
  customerId,
  returnUrl,
}: {
  customerId: string
  returnUrl: string
}) {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  })

  return session
}

/**
 * Retrieves a Stripe subscription
 */
export async function getSubscription(subscriptionId: string) {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
    return subscription
  } catch (error) {
    console.error('Error retrieving subscription:', error)
    return null
  }
}

/**
 * Retrieves a Stripe customer
 */
export async function getCustomer(customerId: string) {
  try {
    const customer = await stripe.customers.retrieve(customerId)
    return customer
  } catch (error) {
    console.error('Error retrieving customer:', error)
    return null
  }
}

/**
 * Cancels a Stripe subscription at period end
 */
export async function cancelSubscription(subscriptionId: string) {
  try {
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    })
    return subscription
  } catch (error) {
    console.error('Error canceling subscription:', error)
    throw error
  }
}

/**
 * Reactivates a canceled subscription
 */
export async function reactivateSubscription(subscriptionId: string) {
  try {
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false,
    })
    return subscription
  } catch (error) {
    console.error('Error reactivating subscription:', error)
    throw error
  }
}

/**
 * Maps Stripe subscription status to our database status
 */
export function mapStripeStatus(
  stripeStatus: Stripe.Subscription.Status
): 'ACTIVE' | 'CANCELED' | 'PAST_DUE' | 'TRIALING' | 'INCOMPLETE' {
  const statusMap: Record<Stripe.Subscription.Status, 'ACTIVE' | 'CANCELED' | 'PAST_DUE' | 'TRIALING' | 'INCOMPLETE'> = {
    active: 'ACTIVE',
    canceled: 'CANCELED',
    incomplete: 'INCOMPLETE',
    incomplete_expired: 'INCOMPLETE',
    past_due: 'PAST_DUE',
    trialing: 'TRIALING',
    unpaid: 'PAST_DUE',
    paused: 'CANCELED',
  }

  return statusMap[stripeStatus] || 'INCOMPLETE'
}

/**
 * Gets the plan type from Stripe price ID
 */
export function getPlanFromPriceId(priceId: string): 'MONTHLY' | 'ANNUAL' | null {
  if (priceId === STRIPE_PRICE_IDS.MONTHLY) {
    return 'MONTHLY'
  }
  if (priceId === STRIPE_PRICE_IDS.ANNUAL) {
    return 'ANNUAL'
  }
  return null
}
