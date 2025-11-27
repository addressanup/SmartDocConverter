# Usage Examples

This document provides practical examples for implementing rate limiting and usage tracking in SmartDocConverter.

## Table of Contents
1. [Client-Side Usage](#client-side-usage)
2. [Server-Side Usage](#server-side-usage)
3. [API Route Examples](#api-route-examples)
4. [UI Integration](#ui-integration)

## Client-Side Usage

### Example 1: Tool Page with Usage Indicator

```tsx
// app/tools/pdf-to-word/page.tsx
'use client'

import { useState } from 'react'
import FileUploader from '@/components/shared/FileUploader'
import UsageIndicator from '@/components/shared/UsageIndicator'

export default function PdfToWordPage() {
  const [usage, setUsage] = useState(null)

  const handleUploadComplete = (response) => {
    // Update usage from API response
    if (response.usage) {
      setUsage(response.usage)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">PDF to Word Converter</h1>

        {/* Usage Indicator */}
        <div className="mb-6 p-4 bg-white rounded-lg shadow">
          <UsageIndicator initialUsage={usage} />
        </div>

        {/* File Upload */}
        <FileUploader
          onUploadComplete={handleUploadComplete}
          acceptedTypes={['application/pdf']}
          maxSize={10 * 1024 * 1024} // 10MB
        />
      </div>
    </div>
  )
}
```

### Example 2: Compact Usage in Header

```tsx
// components/layout/Header.tsx
'use client'

import { useSession } from 'next-auth/react'
import UsageIndicator from '@/components/shared/UsageIndicator'

export default function Header() {
  const { data: session } = useSession()

  return (
    <header className="bg-white shadow">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">SmartDocConverter</h1>
          </div>

          <div className="flex items-center gap-6">
            {/* Compact usage indicator */}
            <UsageIndicator compact className="hidden md:flex" />

            {session ? (
              <UserMenu user={session.user} />
            ) : (
              <div className="flex gap-2">
                <a href="/login" className="btn btn-ghost">Login</a>
                <a href="/register" className="btn btn-primary">Sign Up</a>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
```

### Example 3: Handling Rate Limit Errors

```tsx
// hooks/useFileUpload.ts
import { useState } from 'react'

export function useFileUpload() {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [rateLimitInfo, setRateLimitInfo] = useState<any>(null)

  const uploadFile = async (file: File) => {
    try {
      setUploading(true)
      setError(null)

      const formData = new FormData()
      formData.append('file', file)

      // Get browser fingerprint
      const fingerprint = generateFingerprint()

      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'x-fingerprint': fingerprint,
        },
        body: formData,
      })

      if (response.status === 429) {
        // Rate limited
        const data = await response.json()
        setRateLimitInfo(data)
        setError(data.error)
        return null
      }

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const data = await response.json()
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
      return null
    } finally {
      setUploading(false)
    }
  }

  return { uploadFile, uploading, error, rateLimitInfo }
}
```

## Server-Side Usage

### Example 1: Server Component with Pre-fetched Usage

```tsx
// app/dashboard/page.tsx
import { auth } from '@/lib/auth'
import { getUsage } from '@/lib/usage'
import UsageIndicator from '@/components/shared/UsageIndicator'

export default async function DashboardPage() {
  const session = await auth()
  const userId = session?.user?.id || null

  // Pre-fetch usage on server
  const usage = await getUsage(userId, null, null)

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Usage Card */}
        <div className="col-span-1 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Your Usage</h2>
          <UsageIndicator initialUsage={usage} />
        </div>

        {/* Other dashboard content */}
        <div className="col-span-2">
          {/* ... */}
        </div>
      </div>
    </div>
  )
}
```

### Example 2: API Route with User Authentication

```tsx
// app/api/tools/custom-tool/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { checkRateLimit, getClientIp } from '@/lib/ratelimit'
import { checkUsageLimit, incrementUsage, getUserTier } from '@/lib/usage'

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user
    const session = await auth()
    const userId = session?.user?.id || null

    // 2. Get identifiers
    const ipAddress = getClientIp(request)
    const fingerprint = request.headers.get('x-fingerprint') || null

    // 3. Check rate limits
    const tier = await getUserTier(userId)
    const identifier = userId || fingerprint || ipAddress
    const rateLimit = await checkRateLimit(identifier, tier)

    if (!rateLimit.success) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          limit: rateLimit.limit,
          remaining: rateLimit.remaining,
          resetAt: new Date(rateLimit.reset).toISOString(),
        },
        { status: 429 }
      )
    }

    // 4. Check usage limit
    const usageCheck = await checkUsageLimit(userId, fingerprint, ipAddress)
    if (!usageCheck.allowed) {
      return NextResponse.json(
        {
          error: usageCheck.message,
          usage: usageCheck.usage,
        },
        { status: 429 }
      )
    }

    // 5. Process request
    const body = await request.json()
    const result = await processCustomTool(body)

    // 6. Increment usage
    const updatedUsage = await incrementUsage(
      userId,
      fingerprint,
      ipAddress,
      body.fileSize
    )

    // 7. Return success
    return NextResponse.json(
      {
        success: true,
        result,
        usage: updatedUsage,
      },
      {
        headers: {
          'X-RateLimit-Limit': rateLimit.limit.toString(),
          'X-RateLimit-Remaining': (rateLimit.remaining - 1).toString(),
          'X-RateLimit-Reset': rateLimit.reset.toString(),
        },
      }
    )
  } catch (error) {
    console.error('Custom tool error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function processCustomTool(data: any) {
  // Your custom tool logic here
  return { processed: true }
}
```

## API Route Examples

### Example 1: Check Usage Before File Upload

```tsx
// app/api/check-limit/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { checkUsageLimit } from '@/lib/usage'
import { getClientIp } from '@/lib/ratelimit'

export async function GET(request: NextRequest) {
  const session = await auth()
  const userId = session?.user?.id || null
  const ipAddress = getClientIp(request)
  const fingerprint = request.headers.get('x-fingerprint') || null

  const usageCheck = await checkUsageLimit(userId, fingerprint, ipAddress)

  if (!usageCheck.allowed) {
    return NextResponse.json(
      {
        allowed: false,
        message: usageCheck.message,
        usage: usageCheck.usage,
      },
      { status: 200 }
    )
  }

  return NextResponse.json({
    allowed: true,
    usage: usageCheck.usage,
  })
}
```

Usage in frontend:

```tsx
const checkLimit = async () => {
  const fingerprint = generateFingerprint()

  const response = await fetch('/api/check-limit', {
    headers: {
      'x-fingerprint': fingerprint,
    },
  })

  const data = await response.json()

  if (!data.allowed) {
    alert(data.message)
    return false
  }

  return true
}

// Before file upload
if (await checkLimit()) {
  await uploadFile(file)
}
```

### Example 2: Admin Reset Usage

```tsx
// app/api/admin/reset-usage/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { resetUsage } from '@/lib/usage'
import { resetRateLimit } from '@/lib/ratelimit'

export async function POST(request: NextRequest) {
  // Verify admin
  const session = await auth()
  if (!session?.user?.email?.endsWith('@admin.com')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const { userId, tier } = await request.json()

  try {
    // Reset database usage
    await resetUsage(userId)

    // Reset rate limiter
    await resetRateLimit(userId, tier)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Reset failed:', error)
    return NextResponse.json(
      { error: 'Failed to reset usage' },
      { status: 500 }
    )
  }
}
```

## UI Integration

### Example 1: Rate Limit Warning Modal

```tsx
// components/RateLimitModal.tsx
'use client'

import { useEffect, useState } from 'react'

interface RateLimitModalProps {
  error: any
  onClose: () => void
}

export default function RateLimitModal({ error, onClose }: RateLimitModalProps) {
  const [timeLeft, setTimeLeft] = useState('')

  useEffect(() => {
    if (!error?.resetAt) return

    const interval = setInterval(() => {
      const now = new Date()
      const reset = new Date(error.resetAt)
      const diff = reset.getTime() - now.getTime()

      if (diff <= 0) {
        setTimeLeft('Now!')
        clearInterval(interval)
        return
      }

      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      setTimeLeft(`${hours}h ${minutes}m`)
    }, 1000)

    return () => clearInterval(interval)
  }, [error])

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Daily Limit Reached
            </h3>
            <p className="text-sm text-gray-600">Resets in {timeLeft}</p>
          </div>
        </div>

        <p className="text-gray-700 mb-4">
          {error.error || 'You have reached your daily conversion limit.'}
        </p>

        {error.tier !== 'PREMIUM' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-blue-800 font-medium mb-2">
              Upgrade to Premium
            </p>
            <p className="text-xs text-blue-600 mb-3">
              Get unlimited conversions, larger file sizes, and priority processing.
            </p>
            <a
              href="/pricing"
              className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
            >
              View Plans
            </a>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300"
        >
          Close
        </button>
      </div>
    </div>
  )
}
```

Usage:

```tsx
const [rateLimitError, setRateLimitError] = useState(null)

const handleUpload = async (file) => {
  try {
    const response = await uploadFile(file)
    // ... handle success
  } catch (error) {
    if (error.status === 429) {
      setRateLimitError(error)
    }
  }
}

return (
  <>
    {/* Your component */}

    {rateLimitError && (
      <RateLimitModal
        error={rateLimitError}
        onClose={() => setRateLimitError(null)}
      />
    )}
  </>
)
```

### Example 2: Usage Badge Component

```tsx
// components/UsageBadge.tsx
'use client'

import { useEffect, useState } from 'react'
import { getUsage } from '@/lib/usage'

export default function UsageBadge() {
  const [remaining, setRemaining] = useState<number | null>(null)

  useEffect(() => {
    fetchRemaining()
  }, [])

  const fetchRemaining = async () => {
    const fingerprint = generateFingerprint()
    const response = await fetch('/api/usage', {
      headers: { 'x-fingerprint': fingerprint },
    })
    const data = await response.json()
    setRemaining(data.conversionsRemaining)
  }

  if (remaining === null) return null

  const getColor = () => {
    if (remaining === 0) return 'bg-red-500'
    if (remaining <= 2) return 'bg-orange-500'
    return 'bg-green-500'
  }

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-white text-sm ${getColor()}`}>
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
        <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
      </svg>
      <span>{remaining} conversions left</span>
    </div>
  )
}
```

## Testing Examples

### Example 1: Test Rate Limiting with Jest

```typescript
// __tests__/ratelimit.test.ts
import { checkRateLimit, getDailyLimit } from '@/lib/ratelimit'

describe('Rate Limiting', () => {
  it('should allow requests within limit', async () => {
    const result = await checkRateLimit('test-user-1', 'FREE')
    expect(result.success).toBe(true)
    expect(result.limit).toBe(5)
  })

  it('should block requests over limit', async () => {
    const userId = 'test-user-2'

    // Make 5 requests (should succeed)
    for (let i = 0; i < 5; i++) {
      const result = await checkRateLimit(userId, 'FREE')
      expect(result.success).toBe(true)
    }

    // 6th request should fail
    const result = await checkRateLimit(userId, 'FREE')
    expect(result.success).toBe(false)
    expect(result.remaining).toBe(0)
  })

  it('should have different limits for different tiers', () => {
    expect(getDailyLimit('ANONYMOUS')).toBe(5)
    expect(getDailyLimit('FREE')).toBe(5)
    expect(getDailyLimit('PREMIUM')).toBe(1000)
  })
})
```

### Example 2: Integration Test

```typescript
// __tests__/api/upload.test.ts
import { POST } from '@/app/api/upload/route'
import { NextRequest } from 'next/server'

describe('Upload API', () => {
  it('should enforce rate limits', async () => {
    const formData = new FormData()
    formData.append('file', new Blob(['test']), 'test.pdf')

    const fingerprint = 'test-fingerprint-1'

    // Make 5 requests (should succeed)
    for (let i = 0; i < 5; i++) {
      const request = new NextRequest('http://localhost:3000/api/upload', {
        method: 'POST',
        headers: { 'x-fingerprint': fingerprint },
        body: formData,
      })

      const response = await POST(request)
      expect(response.status).toBe(200)
    }

    // 6th request should be rate limited
    const request = new NextRequest('http://localhost:3000/api/upload', {
      method: 'POST',
      headers: { 'x-fingerprint': fingerprint },
      body: formData,
    })

    const response = await POST(request)
    expect(response.status).toBe(429)

    const data = await response.json()
    expect(data.error).toContain('limit')
  })
})
```

## Utility Functions

### Browser Fingerprinting

```typescript
// lib/fingerprint.ts
export function generateFingerprint(): string {
  if (typeof window === 'undefined') return 'server'

  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (ctx) {
    ctx.textBaseline = 'top'
    ctx.font = '14px Arial'
    ctx.fillText('fingerprint', 2, 2)
  }

  const canvasData = canvas.toDataURL()

  const components = [
    canvasData,
    navigator.userAgent,
    navigator.language,
    screen.colorDepth.toString(),
    screen.width.toString(),
    screen.height.toString(),
    new Date().getTimezoneOffset().toString(),
  ].join('|')

  // Simple hash function
  let hash = 0
  for (let i = 0; i < components.length; i++) {
    const char = components.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }

  return Math.abs(hash).toString(36)
}
```

### Format Time Until Reset

```typescript
// lib/formatTime.ts
export function formatTimeUntilReset(resetDate: Date | string): string {
  const reset = new Date(resetDate)
  const now = new Date()
  const diff = reset.getTime() - now.getTime()

  if (diff <= 0) return 'Now'

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

  if (days > 0) return `${days}d ${hours}h`
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}
```

## Conclusion

These examples demonstrate how to integrate rate limiting and usage tracking throughout your application. The key principles are:

1. **Always check limits before expensive operations**
2. **Provide clear feedback to users**
3. **Handle rate limit errors gracefully**
4. **Increment usage immediately to prevent race conditions**
5. **Include usage data in API responses**

For more details, see the [main implementation documentation](./RATE_LIMITING_IMPLEMENTATION.md).
