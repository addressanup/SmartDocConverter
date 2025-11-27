# Stripe Payment Integration - SmartDocConverter

This document outlines the Stripe payment integration implemented for SmartDocConverter's subscription system.

## Overview

The integration enables:
- Subscription checkout with Stripe Checkout
- 7-day free trial for all paid plans
- Webhook handling for subscription lifecycle events
- Customer portal for subscription management
- Automatic tier upgrades/downgrades based on subscription status

## Files Created

### 1. `/src/lib/stripe.ts`
**Purpose**: Stripe client initialization and helper functions

**Key Functions**:
- `createCheckoutSession()` - Creates a Stripe checkout session for subscriptions
- `createCustomerPortalSession()` - Creates a customer portal session
- `getSubscription()` - Retrieves a Stripe subscription
- `getCustomer()` - Retrieves a Stripe customer
- `cancelSubscription()` - Cancels a subscription at period end
- `reactivateSubscription()` - Reactivates a canceled subscription
- `mapStripeStatus()` - Maps Stripe status to database enum
- `getPlanFromPriceId()` - Gets plan type from price ID

**Configuration**:
- Uses Stripe API version: `2025-11-17.clover`
- Price IDs configured via environment variables or placeholders

### 2. `/src/app/api/stripe/checkout/route.ts`
**Purpose**: API endpoint for creating Stripe checkout sessions

**Endpoint**: `POST /api/stripe/checkout`

**Request Body**:
```json
{
  "plan": "monthly" | "annual"
}
```

**Response**:
```json
{
  "url": "https://checkout.stripe.com/...",
  "sessionId": "cs_..."
}
```

**Features**:
- Requires authentication (checks session)
- Validates plan type using Zod schema
- Includes 7-day trial period
- Sets success/cancel URLs
- Passes user metadata to Stripe

### 3. `/src/app/api/stripe/webhook/route.ts`
**Purpose**: Handles Stripe webhook events

**Endpoint**: `POST /api/stripe/webhook`

**Webhook Events Handled**:

#### `checkout.session.completed`
- Creates or updates subscription in database
- Upgrades user to PREMIUM tier
- Stores Stripe customer ID and subscription ID

#### `customer.subscription.updated`
- Updates subscription status in database
- Updates billing period dates
- Handles plan changes
- Updates user tier based on subscription status

#### `customer.subscription.deleted`
- Marks subscription as CANCELED
- Downgrades user to FREE tier

#### `invoice.payment_succeeded`
- Reactivates PAST_DUE subscriptions
- Upgrades user back to PREMIUM tier

#### `invoice.payment_failed`
- Marks subscription as PAST_DUE
- Downgrades user to FREE tier

**Features**:
- Webhook signature verification
- Event logging in `WebhookEvent` table
- Error handling and logging
- Idempotency via event ID tracking

### 4. `/src/app/api/stripe/portal/route.ts`
**Purpose**: Creates Stripe customer portal sessions

**Endpoint**: `POST /api/stripe/portal`

**Response**:
```json
{
  "url": "https://billing.stripe.com/..."
}
```

**Features**:
- Requires authentication
- Validates user has an active subscription
- Returns portal URL for subscription management
- Users can update payment methods, cancel subscriptions, view invoices

### 5. `/src/components/pricing/CheckoutButton.tsx`
**Purpose**: React component for initiating Stripe checkout

**Props**:
```typescript
{
  plan: 'monthly' | 'annual'
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  className?: string
  children: React.ReactNode
}
```

**Features**:
- Loading state during checkout creation
- Error handling and display
- Redirects to login if not authenticated
- Redirects to Stripe Checkout on success

### 6. `/src/app/pricing/page.tsx` (Updated)
**Purpose**: Pricing page with integrated checkout buttons

**Changes**:
- Added `CheckoutButton` component integration
- Updated plan data with `planType` field
- Replaced static links with dynamic checkout buttons for paid plans
- Maintained free plan with direct link to tools

## Environment Variables

Add the following to your `.env` file:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Price IDs
STRIPE_PRICE_MONTHLY=price_monthly_499
STRIPE_PRICE_ANNUAL=price_annual_3999

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Setup Instructions

### 1. Configure Stripe Dashboard

1. Create a Stripe account at https://stripe.com
2. Go to Dashboard > Products
3. Create two subscription products:
   - **Monthly Premium** - $4.99/month
   - **Annual Premium** - $39.99/year
4. Copy the price IDs and add to `.env`

### 2. Set Up Webhook Endpoint

1. Go to Dashboard > Developers > Webhooks
2. Click "Add endpoint"
3. Add endpoint URL: `https://yourdomain.com/api/stripe/webhook`
4. Select events to listen to:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy the webhook signing secret to `.env` as `STRIPE_WEBHOOK_SECRET`

### 3. Test Locally with Stripe CLI

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login to Stripe
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Copy the webhook signing secret to .env
```

### 4. Update Database Schema

The existing Prisma schema already includes the required models:
- `Subscription` - Stores subscription data
- `WebhookEvent` - Logs webhook events
- `User` - Includes tier field

Run migrations:
```bash
npm run db:migrate
```

## Usage Flow

### New Subscription
1. User clicks "Start 7-Day Free Trial" on pricing page
2. `CheckoutButton` calls `/api/stripe/checkout`
3. User is redirected to Stripe Checkout
4. User enters payment details
5. On success, redirected to `/dashboard?checkout=success`
6. Stripe sends `checkout.session.completed` webhook
7. Webhook handler creates subscription and upgrades user to PREMIUM
8. User gains access to premium features

### Subscription Management
1. User navigates to account/billing page
2. Page calls `/api/stripe/portal`
3. User is redirected to Stripe Customer Portal
4. User can:
   - Update payment method
   - Cancel subscription
   - View invoices
   - Change plan
5. Any changes trigger webhooks to update database

### Subscription Lifecycle

```
TRIALING (7 days) → ACTIVE → (payment succeeds)
                           → PAST_DUE → (payment fails)
                                      → CANCELED (after retry period)
```

## Database Schema Updates

No changes required - the existing schema supports:
- Multiple subscription statuses (TRIALING, ACTIVE, PAST_DUE, CANCELED, INCOMPLETE)
- Multiple plans (MONTHLY, ANNUAL)
- User tiers (FREE, PREMIUM)
- Webhook event logging

## Security Considerations

1. **Webhook Signature Verification**: All webhooks verify Stripe signatures
2. **Authentication**: Checkout and portal endpoints require user authentication
3. **Environment Variables**: All secrets stored in environment variables
4. **HTTPS Required**: Webhooks only work over HTTPS in production
5. **Idempotency**: Events tracked by ID to prevent duplicate processing

## Error Handling

- All API endpoints return proper HTTP status codes
- Webhook errors logged to `WebhookEvent` table
- User-friendly error messages in checkout flow
- Automatic retry for failed webhooks (handled by Stripe)

## Testing

### Test Cards
Use Stripe test cards for testing:
- Success: `4242 4242 4242 4242`
- Declined: `4000 0000 0000 0002`
- Requires authentication: `4000 0025 0000 3155`

Use any future expiry date and any 3-digit CVC.

### Webhook Testing
```bash
# Trigger a test checkout.session.completed event
stripe trigger checkout.session.completed

# Trigger a test subscription updated event
stripe trigger customer.subscription.updated
```

## Monitoring

Monitor the following in Stripe Dashboard:
- Payment success/failure rates
- Subscription churn
- MRR (Monthly Recurring Revenue)
- Active subscriptions by plan

Check webhook delivery status:
- Dashboard > Developers > Webhooks
- View event logs and retry failed events

## Next Steps

1. **Add Customer Portal Link**: Add a "Manage Subscription" button in user dashboard
2. **Email Notifications**: Send emails on subscription events (trial ending, payment failed, etc.)
3. **Analytics**: Track conversion rates and subscription metrics
4. **Promo Codes**: Enable promotional codes in Stripe Dashboard
5. **Usage Limits**: Enforce premium features based on user tier
6. **Invoice PDFs**: Generate and send invoice PDFs to customers
7. **Subscription Upgrade**: Allow upgrading from monthly to annual mid-cycle

## Troubleshooting

### Webhooks Not Received
- Check webhook endpoint is publicly accessible
- Verify webhook secret in `.env`
- Check webhook logs in Stripe Dashboard
- Ensure endpoint returns 200 status code

### Checkout Not Working
- Verify Stripe publishable key is correct
- Check price IDs exist in Stripe Dashboard
- Ensure user is authenticated
- Check browser console for errors

### Subscription Not Created
- Check webhook event logs
- Verify database connection
- Check Prisma schema matches database
- Review webhook handler logs

## Support

For Stripe-specific issues:
- Documentation: https://stripe.com/docs
- Support: https://support.stripe.com

For integration issues:
- Check application logs
- Review webhook event table
- Test with Stripe CLI
