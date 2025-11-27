# Rate Limiting - Quick Start Guide

Get rate limiting up and running in 5 minutes!

## 1. Environment Setup (2 minutes)

### Option A: Production (Upstash Redis)

1. Create account at [upstash.com](https://upstash.com)
2. Create a Redis database
3. Copy credentials to `.env.local`:

```bash
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token_here
```

### Option B: Development (In-Memory)

No setup needed! The system automatically uses in-memory rate limiting.

## 2. Database Migration (1 minute)

```bash
# The UsageTracking model already exists in schema.prisma
# Just run the migration
npx prisma migrate deploy

# Or in development
npx prisma migrate dev
```

## 3. Test It (2 minutes)

### Start your development server

```bash
npm run dev
```

### Test rate limiting

```bash
# Test 6 uploads (5 allowed, 6th should be rate-limited)
for i in {1..6}; do
  echo "Request $i"
  curl -X POST http://localhost:3000/api/upload \
    -H "x-fingerprint: test-user-123" \
    -F "file=@test.pdf"
  echo ""
done
```

Expected output:
- Requests 1-5: Success (200 OK)
- Request 6: Rate Limited (429)

## 4. Add UI Component (Optional)

```tsx
// In any page or component
import UsageIndicator from '@/components/shared/UsageIndicator'

export default function MyPage() {
  return (
    <div>
      <h1>My Tool</h1>
      <UsageIndicator />
      {/* Your content */}
    </div>
  )
}
```

## That's It!

Your rate limiting is now active. Users get:
- Anonymous: 5 conversions/day
- Free: 5 conversions/day
- Premium: 1000 conversions/day (unlimited)

## Quick Tips

### Check Current Usage

```tsx
const response = await fetch('/api/usage', {
  headers: { 'x-fingerprint': 'user-123' }
})
const usage = await response.json()
console.log(usage)
```

### Handle Rate Limit Errors

```tsx
try {
  const response = await fetch('/api/convert', {
    method: 'POST',
    body: JSON.stringify({ /* ... */ })
  })

  if (response.status === 429) {
    const error = await response.json()
    alert(`Rate limited! ${error.error}`)
    return
  }

  // Success
  const data = await response.json()
} catch (error) {
  console.error(error)
}
```

### Reset User's Limit (Admin)

```typescript
import { resetUsage, resetRateLimit } from '@/lib/usage'

// Reset database usage
await resetUsage(userId)

// Reset rate limiter
await resetRateLimit(userId, 'FREE')
```

## Configuration

### Change Limits

Edit `/Users/anuppandey/Desktop/SmartDocConverter/src/lib/ratelimit.ts`:

```typescript
// Change from 5 to 10
export const freeUserRateLimiter = new Ratelimit({
  redis: client,
  limiter: Ratelimit.slidingWindow(10, '24 h'), // Changed from 5
  analytics: true,
  prefix: 'ratelimit:free',
})
```

### Change File Size Limits

Edit `.env.local`:

```bash
MAX_FILE_SIZE_FREE=20971520        # 20MB (was 10MB)
MAX_FILE_SIZE_PREMIUM=104857600    # 100MB (was 50MB)
```

## Troubleshooting

### Rate Limit Not Working?

```bash
# Check if Redis is connected (if using Upstash)
curl $UPSTASH_REDIS_REST_URL/ping \
  -H "Authorization: Bearer $UPSTASH_REDIS_REST_TOKEN"
# Should return: "PONG"

# Check database
npx prisma studio
# Navigate to UsageTracking table
```

### User Still Limited After Premium Upgrade?

```typescript
// Make sure user tier is updated in database
await prisma.user.update({
  where: { id: userId },
  data: { tier: 'PREMIUM' }
})

// Then reset their rate limit
await resetRateLimit(userId, 'PREMIUM')
```

## Next Steps

- Read [RATE_LIMITING_IMPLEMENTATION.md](./RATE_LIMITING_IMPLEMENTATION.md) for full documentation
- See [USAGE_EXAMPLES.md](./USAGE_EXAMPLES.md) for integration examples
- Check [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) for complete overview

## Support

Questions? Issues?
1. Check the documentation files
2. Review the code comments
3. Test with curl commands
4. Check browser console and server logs

---

**Quick Start Complete!** Your rate limiting is now protecting your API and tracking usage.
