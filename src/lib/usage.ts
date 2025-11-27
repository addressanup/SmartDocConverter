import { prisma } from './db'
import { UserTier } from '@prisma/client'
import { getDailyLimit, type UserTier as RateLimitTier } from './ratelimit'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface UsageData {
  conversionsUsed: number
  conversionsRemaining: number
  dailyLimit: number
  resetDate: Date
  tier: RateLimitTier
}

export interface UsageCheckResult {
  allowed: boolean
  usage: UsageData
  message?: string
}

// ============================================================================
// USAGE TRACKING FUNCTIONS
// ============================================================================

/**
 * Get today's date at midnight (UTC) for consistent daily tracking
 */
function getTodayDate(): Date {
  const now = new Date()
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
}

/**
 * Convert Prisma UserTier to RateLimitTier
 */
function mapUserTier(tier: UserTier | null): RateLimitTier {
  if (!tier || tier === UserTier.FREE) {
    return 'FREE'
  }
  return 'PREMIUM'
}

/**
 * Get or create usage tracking record for today
 *
 * @param userId - User ID (null for anonymous)
 * @param fingerprint - Browser fingerprint for anonymous users
 * @param ipAddress - IP address for additional tracking
 * @returns Usage tracking record
 */
async function getOrCreateUsageRecord(
  userId: string | null,
  fingerprint: string | null,
  ipAddress: string | null
) {
  const today = getTodayDate()

  if (userId) {
    // For registered users, use userId
    let usage = await prisma.usageTracking.findUnique({
      where: {
        userId_date: {
          userId,
          date: today,
        },
      },
    })

    if (!usage) {
      usage = await prisma.usageTracking.create({
        data: {
          userId,
          date: today,
          conversionsUsed: 0,
          bytesProcessed: BigInt(0),
          ipAddress,
        },
      })
    }

    return usage
  } else if (fingerprint) {
    // For anonymous users, use fingerprint
    let usage = await prisma.usageTracking.findUnique({
      where: {
        fingerprint_date: {
          fingerprint,
          date: today,
        },
      },
    })

    if (!usage) {
      usage = await prisma.usageTracking.create({
        data: {
          fingerprint,
          date: today,
          conversionsUsed: 0,
          bytesProcessed: BigInt(0),
          ipAddress,
        },
      })
    }

    return usage
  }

  throw new Error('Either userId or fingerprint must be provided')
}

/**
 * Get current usage for a user
 *
 * @param userId - User ID (null for anonymous)
 * @param fingerprint - Browser fingerprint for anonymous users
 * @param ipAddress - IP address
 * @returns Usage data
 */
export async function getUsage(
  userId: string | null,
  fingerprint: string | null,
  ipAddress: string | null
): Promise<UsageData> {
  try {
    // Get user tier
    let tier: RateLimitTier = 'ANONYMOUS'
    if (userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { tier: true },
      })
      tier = user ? mapUserTier(user.tier) : 'FREE'
    }

    // Get or create usage record
    const usage = await getOrCreateUsageRecord(userId, fingerprint, ipAddress)

    const dailyLimit = getDailyLimit(tier)
    const conversionsUsed = usage.conversionsUsed
    const conversionsRemaining = Math.max(0, dailyLimit - conversionsUsed)

    // Calculate reset date (tomorrow at midnight UTC)
    const resetDate = new Date(usage.date)
    resetDate.setDate(resetDate.getDate() + 1)

    return {
      conversionsUsed,
      conversionsRemaining,
      dailyLimit,
      resetDate,
      tier,
    }
  } catch (error) {
    console.error('Failed to get usage:', error)
    // Return default values on error
    return {
      conversionsUsed: 0,
      conversionsRemaining: 5,
      dailyLimit: 5,
      resetDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      tier: 'ANONYMOUS',
    }
  }
}

/**
 * Check if user has exceeded their daily limit
 *
 * @param userId - User ID (null for anonymous)
 * @param fingerprint - Browser fingerprint for anonymous users
 * @param ipAddress - IP address
 * @returns Usage check result
 */
export async function checkUsageLimit(
  userId: string | null,
  fingerprint: string | null,
  ipAddress: string | null
): Promise<UsageCheckResult> {
  try {
    const usage = await getUsage(userId, fingerprint, ipAddress)

    if (usage.conversionsRemaining <= 0) {
      return {
        allowed: false,
        usage,
        message: `Daily limit of ${usage.dailyLimit} conversions reached. Resets at ${usage.resetDate.toISOString()}`,
      }
    }

    return {
      allowed: true,
      usage,
    }
  } catch (error) {
    console.error('Failed to check usage limit:', error)
    // On error, allow the request
    return {
      allowed: true,
      usage: {
        conversionsUsed: 0,
        conversionsRemaining: 5,
        dailyLimit: 5,
        resetDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        tier: 'ANONYMOUS',
      },
    }
  }
}

/**
 * Increment usage counter after successful conversion
 *
 * @param userId - User ID (null for anonymous)
 * @param fingerprint - Browser fingerprint for anonymous users
 * @param ipAddress - IP address
 * @param bytesProcessed - Number of bytes processed (optional)
 * @returns Updated usage data
 */
export async function incrementUsage(
  userId: string | null,
  fingerprint: string | null,
  ipAddress: string | null,
  bytesProcessed?: number
): Promise<UsageData> {
  try {
    const today = getTodayDate()

    if (userId) {
      // Update for registered user
      await prisma.usageTracking.upsert({
        where: {
          userId_date: {
            userId,
            date: today,
          },
        },
        update: {
          conversionsUsed: {
            increment: 1,
          },
          bytesProcessed: bytesProcessed
            ? {
                increment: BigInt(bytesProcessed),
              }
            : undefined,
          ipAddress,
        },
        create: {
          userId,
          date: today,
          conversionsUsed: 1,
          bytesProcessed: bytesProcessed ? BigInt(bytesProcessed) : BigInt(0),
          ipAddress,
        },
      })
    } else if (fingerprint) {
      // Update for anonymous user
      await prisma.usageTracking.upsert({
        where: {
          fingerprint_date: {
            fingerprint,
            date: today,
          },
        },
        update: {
          conversionsUsed: {
            increment: 1,
          },
          bytesProcessed: bytesProcessed
            ? {
                increment: BigInt(bytesProcessed),
              }
            : undefined,
          ipAddress,
        },
        create: {
          fingerprint,
          date: today,
          conversionsUsed: 1,
          bytesProcessed: bytesProcessed ? BigInt(bytesProcessed) : BigInt(0),
          ipAddress,
        },
      })
    }

    // Get updated usage
    return await getUsage(userId, fingerprint, ipAddress)
  } catch (error) {
    console.error('Failed to increment usage:', error)
    // Return current usage on error
    return await getUsage(userId, fingerprint, ipAddress)
  }
}

/**
 * Get remaining conversions for a user
 *
 * @param userId - User ID (null for anonymous)
 * @param fingerprint - Browser fingerprint for anonymous users
 * @param ipAddress - IP address
 * @returns Number of remaining conversions
 */
export async function getRemainingConversions(
  userId: string | null,
  fingerprint: string | null,
  ipAddress: string | null
): Promise<number> {
  try {
    const usage = await getUsage(userId, fingerprint, ipAddress)
    return usage.conversionsRemaining
  } catch (error) {
    console.error('Failed to get remaining conversions:', error)
    return 5 // Default fallback
  }
}

/**
 * Check if user is premium
 *
 * @param userId - User ID
 * @returns True if user is premium
 */
export async function isPremiumUser(userId: string | null): Promise<boolean> {
  if (!userId) return false

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { tier: true },
    })

    return user?.tier === UserTier.PREMIUM
  } catch (error) {
    console.error('Failed to check if user is premium:', error)
    return false
  }
}

/**
 * Get user tier
 *
 * @param userId - User ID
 * @returns User tier
 */
export async function getUserTier(userId: string | null): Promise<RateLimitTier> {
  if (!userId) return 'ANONYMOUS'

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { tier: true },
    })

    return user ? mapUserTier(user.tier) : 'FREE'
  } catch (error) {
    console.error('Failed to get user tier:', error)
    return 'FREE'
  }
}

/**
 * Reset usage for a user (admin function)
 *
 * @param userId - User ID
 * @param date - Date to reset (defaults to today)
 */
export async function resetUsage(userId: string, date?: Date): Promise<void> {
  try {
    const targetDate = date || getTodayDate()

    await prisma.usageTracking.update({
      where: {
        userId_date: {
          userId,
          date: targetDate,
        },
      },
      data: {
        conversionsUsed: 0,
        bytesProcessed: BigInt(0),
      },
    })
  } catch (error) {
    console.error('Failed to reset usage:', error)
    throw error
  }
}

/**
 * Get usage statistics for a date range (admin/analytics)
 *
 * @param startDate - Start date
 * @param endDate - End date
 * @returns Usage statistics
 */
export async function getUsageStats(startDate: Date, endDate: Date) {
  try {
    const stats = await prisma.usageTracking.aggregate({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      _sum: {
        conversionsUsed: true,
        bytesProcessed: true,
      },
      _count: {
        id: true,
      },
    })

    return {
      totalConversions: stats._sum.conversionsUsed || 0,
      totalBytesProcessed: stats._sum.bytesProcessed?.toString() || '0',
      uniqueUsers: stats._count.id || 0,
    }
  } catch (error) {
    console.error('Failed to get usage stats:', error)
    return {
      totalConversions: 0,
      totalBytesProcessed: '0',
      uniqueUsers: 0,
    }
  }
}

/**
 * Clean up old usage records (run as cron job)
 * Removes records older than 90 days
 */
export async function cleanupOldUsageRecords(): Promise<number> {
  try {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - 90)

    const result = await prisma.usageTracking.deleteMany({
      where: {
        date: {
          lt: cutoffDate,
        },
      },
    })

    return result.count
  } catch (error) {
    console.error('Failed to cleanup old usage records:', error)
    return 0
  }
}
