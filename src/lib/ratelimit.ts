import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// ============================================================================
// IN-MEMORY RATE LIMITER (FALLBACK)
// ============================================================================

interface InMemoryStore {
  [key: string]: {
    count: number
    resetAt: number
  }
}

const inMemoryStore: InMemoryStore = {}

class InMemoryRateLimiter {
  private limitCount: number
  private window: number

  constructor(limit: number, windowInSeconds: number) {
    this.limitCount = limit
    this.window = windowInSeconds * 1000
  }

  async limit(identifier: string): Promise<{
    success: boolean
    limit: number
    remaining: number
    reset: number
  }> {
    const now = Date.now()
    const key = identifier
    const store = inMemoryStore[key]

    if (store && now >= store.resetAt) {
      delete inMemoryStore[key]
    }

    const entry = inMemoryStore[key] || {
      count: 0,
      resetAt: now + this.window,
    }

    if (entry.count >= this.limitCount) {
      return {
        success: false,
        limit: this.limitCount,
        remaining: 0,
        reset: entry.resetAt,
      }
    }

    entry.count++
    inMemoryStore[key] = entry

    return {
      success: true,
      limit: this.limitCount,
      remaining: this.limitCount - entry.count,
      reset: entry.resetAt,
    }
  }
}

// ============================================================================
// RATE LIMITER INSTANCES
// ============================================================================

function createRateLimiter(limit: number, windowHours: number, prefix: string) {
  // Only use Upstash if credentials are available
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    try {
      const redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
      return new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(limit, `${windowHours} h`),
        analytics: true,
        prefix,
      })
    } catch (error) {
      console.warn('Failed to create Upstash rate limiter:', error)
    }
  }
  
  // Fallback to in-memory
  return new InMemoryRateLimiter(limit, windowHours * 60 * 60)
}

const anonymousRateLimiter = createRateLimiter(5, 24, 'ratelimit:anonymous')
const freeUserRateLimiter = createRateLimiter(5, 24, 'ratelimit:free')
const premiumUserRateLimiter = createRateLimiter(1000, 24, 'ratelimit:premium')
const ipRateLimiter = createRateLimiter(20, 1, 'ratelimit:ip')

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export type UserTier = 'ANONYMOUS' | 'FREE' | 'PREMIUM'

export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: number
}

export async function checkRateLimit(
  identifier: string,
  tier: UserTier = 'ANONYMOUS'
): Promise<RateLimitResult> {
  try {
    let result

    switch (tier) {
      case 'PREMIUM':
        result = await premiumUserRateLimiter.limit(identifier)
        break
      case 'FREE':
        result = await freeUserRateLimiter.limit(identifier)
        break
      case 'ANONYMOUS':
      default:
        result = await anonymousRateLimiter.limit(identifier)
        break
    }

    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
    }
  } catch (error) {
    console.error('Rate limit check failed:', error)
    return {
      success: true,
      limit: 5,
      remaining: 5,
      reset: Date.now() + 24 * 60 * 60 * 1000,
    }
  }
}

export async function checkIpRateLimit(ipAddress: string): Promise<RateLimitResult> {
  try {
    const result = await ipRateLimiter.limit(ipAddress)
    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
    }
  } catch (error) {
    console.error('IP rate limit check failed:', error)
    return {
      success: true,
      limit: 20,
      remaining: 20,
      reset: Date.now() + 60 * 60 * 1000,
    }
  }
}

export function getDailyLimit(tier: UserTier): number {
  switch (tier) {
    case 'PREMIUM':
      return 1000
    case 'FREE':
      return 5
    case 'ANONYMOUS':
    default:
      return 5
  }
}

export function getClientIp(request: Request): string {
  const headers = new Headers(request.headers)

  const forwardedFor = headers.get('x-forwarded-for')
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }

  const realIp = headers.get('x-real-ip')
  if (realIp) {
    return realIp.trim()
  }

  const cfConnectingIp = headers.get('cf-connecting-ip')
  if (cfConnectingIp) {
    return cfConnectingIp.trim()
  }

  return 'unknown'
}
