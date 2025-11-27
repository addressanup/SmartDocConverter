'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { useRouter } from 'next/navigation'

interface CheckoutButtonProps {
  plan: 'monthly' | 'annual'
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  className?: string
  children: React.ReactNode
}

export function CheckoutButton({
  plan,
  variant = 'primary',
  className,
  children,
}: CheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleCheckout = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Call the checkout API
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plan }),
      })

      const data = await response.json()

      if (!response.ok) {
        // If unauthorized, redirect to sign in
        if (response.status === 401) {
          router.push(`/login?callbackUrl=/pricing&plan=${plan}`)
          return
        }

        throw new Error(data.error || 'Failed to create checkout session')
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error('No checkout URL returned')
      }
    } catch (err) {
      console.error('Checkout error:', err)
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <Button
        onClick={handleCheckout}
        isLoading={isLoading}
        disabled={isLoading}
        variant={variant}
        className={className}
      >
        {children}
      </Button>
      {error && (
        <p className="text-sm text-red-600 text-center">{error}</p>
      )}
    </div>
  )
}
