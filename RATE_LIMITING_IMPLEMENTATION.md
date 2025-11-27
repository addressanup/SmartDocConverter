# Rate Limiting Implementation Guide

## Overview

This document describes the rate limiting and usage tracking implementation for SmartDocConverter. The system supports different user tiers with varying conversion limits and provides comprehensive tracking and abuse prevention.

## Features

### 1. Multi-Tier Rate Limiting
- **Anonymous Users**: 5 conversions per day (IP/fingerprint-based)
- **Free Users**: 5 conversions per day (user ID-based)
- **Premium Users**: 1000 conversions per day (effectively unlimited)

### 2. Dual Rate Limiting Strategy
- **User-based limits**: Tracks conversions per user/fingerprint (24-hour sliding window)
- **IP-based limits**: 20 requests per hour for abuse prevention

### 3. Usage Tracking
- Database-backed usage tracking per user/day
- Tracks conversion count and bytes processed
- Automatic reset at midnight UTC
- Historical data retention for 90 days

### 4. Flexible Backend Support
- **Production**: Upstash Redis (serverless-friendly)
- **Development**: ioredis with local Redis
- **Fallback**: In-memory rate limiting (not recommended for production)

## File Structure

```
src/
├── lib/
│   ├── ratelimit.ts          # Rate limiter configuration and utilities
│   ├── usage.ts               # Database usage tracking utilities
│   └── auth.ts                # Existing authentication (NextAuth.js)
├── app/api/
│   ├── upload/route.ts        # File upload endpoint (with rate limiting)
│   ├── convert/route.ts       # Conversion endpoint (with rate limiting + usage tracking)
│   └── usage/route.ts         # Usage data API endpoint
└── components/shared/
    └── UsageIndicator.tsx     # UI component showing remaining conversions
```

## Implementation Details

### Rate Limiting (`src/lib/ratelimit.ts`)

The rate limiting system uses `@upstash/ratelimit` with sliding window algorithm:

```typescript
import { checkRateLimit, checkIpRateLimit, getClientIp } from '@/lib/ratelimit'

// In your API route
const ipAddress = getClientIp(request)
const ipRateLimit = await checkIpRateLimit(ipAddress)

if (!ipRateLimit.success) {
  return NextResponse.json(
    { error: 'Too many requests' },
    {
      status: 429,
      headers: {
        'X-RateLimit-Limit': ipRateLimit.limit.toString(),
        'X-RateLimit-Remaining': ipRateLimit.remaining.toString(),
        'X-RateLimit-Reset': ipRateLimit.reset.toString(),
      }
    }
  )
}
```

### Usage Tracking (`src/lib/usage.ts`)

Database-backed usage tracking with Prisma:

```typescript
import { checkUsageLimit, incrementUsage } from '@/lib/usage'

// Check if user has exceeded limit
const usageCheck = await checkUsageLimit(userId, fingerprint, ipAddress)
if (!usageCheck.allowed) {
  return NextResponse.json(
    { error: usageCheck.message },
    { status: 429 }
  )
}

// Increment usage after successful conversion
await incrementUsage(userId, fingerprint, ipAddress, fileSize)
```

### API Integration

#### Upload Endpoint (`/api/upload`)

Rate limiting is checked **before** accepting file uploads:

```typescript
// 1. Check IP-based rate limit (abuse prevention)
// 2. Check user-tier rate limit (daily conversions)
// 3. Check database usage limit
// 4. Accept and process upload
// 5. Return usage data in response
```

#### Convert Endpoint (`/api/convert`)

Rate limiting and usage tracking for conversions:

```typescript
// 1. Check IP-based rate limit
// 2. Check user-tier rate limit
// 3. Check database usage limit
// 4. Increment usage counter (prevents race conditions)
// 5. Start conversion job
// 6. Return job ID and updated usage
```

### UI Component (`UsageIndicator.tsx`)

Client-side React component for displaying usage:

```tsx
import UsageIndicator from '@/components/shared/UsageIndicator'

// Full display
<UsageIndicator />

// Compact display
<UsageIndicator compact />

// With initial data (SSR)
<UsageIndicator initialUsage={usageData} />
```

**Features:**
- Real-time usage display with progress bar
- Time until reset countdown
- Warning messages when running low
- Upgrade prompts for free users
- Sign-in prompts for anonymous users

## Environment Variables

Add these to your `.env` or `.env.local`:

```bash
# Upstash Redis (Production)
UPSTASH_REDIS_REST_URL=https://your-redis-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token_here

# Local Redis (Development - optional)
REDIS_URL=redis://localhost:6379

# PostgreSQL Database (Required for usage tracking)
DATABASE_URL=postgresql://user:password@localhost:5432/smartdocconverter

# File size limits
MAX_FILE_SIZE_FREE=10485760        # 10MB
MAX_FILE_SIZE_PREMIUM=52428800     # 50MB
```

## Database Schema

The implementation uses the existing Prisma schema with the `UsageTracking` model:

```prisma
model UsageTracking {
  id              String   @id @default(cuid())
  userId          String?  // For registered users
  fingerprint     String?  // For anonymous users
  ipAddress       String?  // For rate limiting
  date            DateTime @db.Date
  conversionsUsed Int      @default(0)
  bytesProcessed  BigInt   @default(0)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  user User? @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, date])
  @@unique([fingerprint, date])
  @@index([date])
  @@index([ipAddress, date])
  @@map("usage_tracking")
}
```

## Testing

### Test Rate Limiting

```bash
# Test anonymous rate limit (5 requests)
for i in {1..6}; do
  curl -X POST http://localhost:3000/api/upload \
    -H "x-fingerprint: test-fingerprint" \
    -F "file=@test.pdf"
done
```

### Test IP Rate Limiting

```bash
# Test IP rate limit (20 requests per hour)
for i in {1..21}; do
  curl -X POST http://localhost:3000/api/convert \
    -H "Content-Type: application/json" \
    -d '{"fileId":"test","filePath":"/tmp/test.pdf","conversionType":"pdf-to-word"}'
done
```

### Expected Response (429 Rate Limited)

```json
{
  "error": "Daily limit of 5 conversions reached. Upgrade to Premium for unlimited conversions.",
  "resetAt": "2025-11-27T00:00:00.000Z",
  "tier": "ANONYMOUS",
  "limit": 5,
  "remaining": 0
}
```

### Response Headers

```
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1735344000000
Retry-After: 43200
```

## Production Deployment

### 1. Setup Upstash Redis

1. Create account at [upstash.com](https://upstash.com)
2. Create a new Redis database
3. Copy REST URL and token to environment variables

### 2. Database Migration

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Seed database (optional)
npx prisma db seed
```

### 3. Vercel Deployment

```bash
# Add environment variables to Vercel
vercel env add UPSTASH_REDIS_REST_URL
vercel env add UPSTASH_REDIS_REST_TOKEN
vercel env add DATABASE_URL

# Deploy
vercel --prod
```

## Monitoring & Maintenance

### View Usage Statistics

```typescript
import { getUsageStats } from '@/lib/usage'

const stats = await getUsageStats(
  new Date('2025-11-01'),
  new Date('2025-11-30')
)

console.log(stats)
// {
//   totalConversions: 1250,
//   totalBytesProcessed: '524288000',
//   uniqueUsers: 156
// }
```

### Cleanup Old Records

Add a cron job to clean up old usage records:

```typescript
// app/api/cron/cleanup/route.ts
import { cleanupOldUsageRecords } from '@/lib/usage'

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const deletedCount = await cleanupOldUsageRecords()
  return NextResponse.json({ deletedCount })
}
```

Configure Vercel Cron:

```json
// vercel.json
{
  "crons": [{
    "path": "/api/cron/cleanup",
    "schedule": "0 0 * * 0"
  }]
}
```

## Common Issues & Solutions

### Issue: Redis Connection Failed

**Solution**: System falls back to in-memory rate limiting. Check Redis URL and token.

```typescript
// Check Redis connection
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

await redis.ping() // Should return "PONG"
```

### Issue: Rate Limit Not Resetting

**Solution**: Upstash uses sliding window. Use absolute time-based windows:

```typescript
// Use fixed daily windows
const today = new Date()
today.setUTCHours(0, 0, 0, 0)
const identifier = `${userId}:${today.toISOString()}`
```

### Issue: Different Limits on Mobile

**Solution**: Browser fingerprinting may vary. Use user ID when signed in:

```typescript
const identifier = userId || fingerprint || ipAddress
```

## Security Considerations

1. **IP Spoofing**: Trust proxy headers carefully
   ```typescript
   // Only trust Vercel's headers
   const forwardedFor = request.headers.get('x-forwarded-for')
   ```

2. **Fingerprint Bypass**: Combine with IP-based limits
   - User limit: 5/day
   - IP limit: 20/hour

3. **Database Injection**: Prisma provides SQL injection protection
   - Never use raw SQL with user input
   - Use parameterized queries

4. **Rate Limit Evasion**: Monitor for patterns
   ```typescript
   // Track suspicious activity
   if (ipRateLimit.remaining === 0) {
     await logSuspiciousActivity(ipAddress)
   }
   ```

## Future Enhancements

1. **Dynamic Rate Limits**: Adjust limits based on system load
2. **User Reputation**: Lower limits for abusive users
3. **Burst Allowance**: Allow short bursts above limit
4. **API Keys**: Rate limiting for API access
5. **WebSocket Support**: Real-time usage updates
6. **Analytics Dashboard**: Visual usage statistics

## Support

For issues or questions:
- File a GitHub issue
- Check logs: `vercel logs production`
- Monitor Upstash dashboard
- Review Prisma Studio: `npx prisma studio`

## License

This implementation is part of SmartDocConverter and follows the project's license.
