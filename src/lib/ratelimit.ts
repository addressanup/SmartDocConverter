import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import IORedis from 'ioredis'

// ============================================================================
// REDIS CLIENT SETUP
// ============================================================================

/**
 * Redis client for rate limiting
 * Uses Upstash in production, ioredis in development
 */
let redis: Redis | IORedis | null = null

function getRedisClient(): Redis | IORedis {
  if (redis) return redis

  // Production: Use Upstash Redis
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
    return redis
  }

  // Development: Use ioredis with local Redis or in-memory fallback
  if (process.env.REDIS_URL) {
    redis = new IORedis(process.env.REDIS_URL)
    return redis
  }

  // Fallback: In-memory Redis (ioredis with default settings)
  console.warn('⚠️  No Redis configured. Using in-memory rate limiting (not recommended for production)')
  redis = new IORedis({
    host: 'localhost',
    port: 6379,
    maxRetriesPerRequest: 1,
    retryStrategy: () => null, // Don't retry on connection failure
    lazyConnect: true,
  })

  return redis
}

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

/**
 * Simple in-memory rate limiter for development when Redis is unavailable
 */
class InMemoryRateLimiter {
  private limitCount: number
  private window: number // in milliseconds

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

    // Clean up expired entries
    if (store && now >= store.resetAt) {
      delete inMemoryStore[key]
    }

    // Get or create entry
    const entry = inMemoryStore[key] || {
      count: 0,
      resetAt: now + this.window,
    }

    // Check if limit exceeded
    if (entry.count >= this.limitCount) {
      return {
        success: false,
        limit: this.limitCount,
        remaining: 0,
        reset: entry.resetAt,
      }
    }

    // Increment counter
    entry.count++
    inMemoryStore[key] = entry

    return {
      success: true,
      limit: this.limitCount,
      remaining: this.limitCount - entry.count,
      reset: entry.resetAt,
    }
  }

  async reset(identifier: string): Promise<void> {
    delete inMemoryStore[identifier]
  }
}

// ============================================================================
// RATE LIMITER INSTANCES
// ============================================================================

/**
 * Anonymous users: 5 requests per day
 * Uses IP address or fingerprint as identifier
 */
export const anonymousRateLimiter = (() => {
  try {
    const client = getRedisClient()

    if (client instanceof IORedis) {
      // Fallback to in-memory if ioredis connection fails
      return new InMemoryRateLimiter(5, 24 * 60 * 60)
    }

    return new Ratelimit({
      redis: client as Redis,
      limiter: Ratelimit.slidingWindow(5, '24 h'),
      analytics: true,
      prefix: 'ratelimit:anonymous',
    })
  } catch (error) {
    console.warn('Failed to create Upstash rate limiter, using in-memory fallback:', error)
    return new InMemoryRateLimiter(5, 24 * 60 * 60)
  }
})()

/**
 * Free tier users: 5 requests per day
 * Uses user ID as identifier
 */
export const freeUserRateLimiter = (() => {
  try {
    const client = getRedisClient()

    if (client instanceof IORedis) {
      return new InMemoryRateLimiter(5, 24 * 60 * 60)
    }

    return new Ratelimit({
      redis: client as Redis,
      limiter: Ratelimit.slidingWindow(5, '24 h'),
      analytics: true,
      prefix: 'ratelimit:free',
    })
  } catch (error) {
    console.warn('Failed to create Upstash rate limiter, using in-memory fallback:', error)
    return new InMemoryRateLimiter(5, 24 * 60 * 60)
  }
})()

/**
 * Premium users: 1000 requests per day (effectively unlimited)
 * Uses user ID as identifier
 */
export const premiumUserRateLimiter = (() => {
  try {
    const client = getRedisClient()

    if (client instanceof IORedis) {
      return new InMemoryRateLimiter(1000, 24 * 60 * 60)
    }

    return new Ratelimit({
      redis: client as Redis,
      limiter: Ratelimit.slidingWindow(1000, '24 h'),
      analytics: true,
      prefix: 'ratelimit:premium',
    })
  } catch (error) {
    console.warn('Failed to create Upstash rate limiter, using in-memory fallback:', error)
    return new InMemoryRateLimiter(1000, 24 * 60 * 60)
  }
})()

/**
 * IP-based rate limiter for abuse prevention: 20 requests per hour
 */
export const ipRateLimiter = (() => {
  try {
    const client = getRedisClient()

    if (client instanceof IORedis) {
      return new InMemoryRateLimiter(20, 60 * 60)
    }

    return new Ratelimit({
      redis: client as Redis,
      limiter: Ratelimit.slidingWindow(20, '1 h'),
      analytics: true,
      prefix: 'ratelimit:ip',
    })
  } catch (error) {
    console.warn('Failed to create Upstash rate limiter, using in-memory fallback:', error)
    return new InMemoryRateLimiter(20, 60 * 60)
  }
})()

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * User tier type
 */
export type UserTier = 'ANONYMOUS' | 'FREE' | 'PREMIUM'

/**
 * Rate limit result
 */
export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: number // Unix timestamp in milliseconds
}

/**
 * Check rate limit for a user based on their tier
 *
 * @param identifier - User ID, IP address, or fingerprint
 * @param tier - User tier (ANONYMOUS, FREE, or PREMIUM)
 * @returns Rate limit result
 */
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
    // On error, allow the request but log the issue
    return {
      success: true,
      limit: 5,
      remaining: 5,
      reset: Date.now() + 24 * 60 * 60 * 1000,
    }
  }
}

/**
 * Check IP-based rate limit for abuse prevention
 *
 * @param ipAddress - Client IP address
 * @returns Rate limit result
 */
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
    // On error, allow the request but log the issue
    return {
      success: true,
      limit: 20,
      remaining: 20,
      reset: Date.now() + 60 * 60 * 1000,
    }
  }
}

/**
 * Get the daily limit for a user tier
 *
 * @param tier - User tier
 * @returns Daily conversion limit
 */
export function getDailyLimit(tier: UserTier): number {
  switch (tier) {
    case 'PREMIUM':
      return 1000 // Effectively unlimited
    case 'FREE':
      return 5
    case 'ANONYMOUS':
    default:
      return 5
  }
}

/**
 * Reset rate limit for a user (admin function)
 *
 * @param identifier - User ID, IP address, or fingerprint
 * @param tier - User tier
 */
export async function resetRateLimit(
  identifier: string,
  tier: UserTier = 'ANONYMOUS'
): Promise<void> {
  try {
    let limiter

    switch (tier) {
      case 'PREMIUM':
        limiter = premiumUserRateLimiter
        break
      case 'FREE':
        limiter = freeUserRateLimiter
        break
      case 'ANONYMOUS':
      default:
        limiter = anonymousRateLimiter
        break
    }

    if (limiter instanceof InMemoryRateLimiter) {
      await limiter.reset(identifier)
    } else {
      // For Upstash Ratelimit, we need to manually delete the key
      const client = getRedisClient()
      if (client instanceof Redis) {
        const prefix = tier === 'PREMIUM' ? 'ratelimit:premium' :
                      tier === 'FREE' ? 'ratelimit:free' :
                      'ratelimit:anonymous'
        await client.del(`${prefix}:${identifier}`)
      }
    }
  } catch (error) {
    console.error('Failed to reset rate limit:', error)
    throw error
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get client IP address from request
 * Handles various proxy headers
 *
 * @param request - Next.js request object
 * @returns IP address
 */
export function getClientIp(request: Request): string {
  const headers = new Headers(request.headers)

  // Check common proxy headers
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

  // Fallback
  return 'unknown'
}

/**
 * Clean up expired in-memory entries (run periodically)
 */
export function cleanupInMemoryStore(): void {
  const now = Date.now()
  for (const key in inMemoryStore) {
    if (inMemoryStore[key].resetAt <= now) {
      delete inMemoryStore[key]
    }
  }
}

// Clean up every hour
if (typeof window === 'undefined') {
  setInterval(cleanupInMemoryStore, 60 * 60 * 1000)
}
