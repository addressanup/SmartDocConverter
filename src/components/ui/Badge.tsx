'use client'

import { forwardRef, HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'outline'
  size?: 'sm' | 'md' | 'lg'
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', size = 'md', children, ...props }, ref) => {
    const baseStyles = cn(
      'inline-flex items-center justify-center gap-1.5',
      'font-semibold rounded-full',
      'transition-colors'
    )

    const variants = {
      default: cn(
        'bg-slate-100 text-slate-700',
        'border border-slate-200'
      ),
      primary: cn(
        'bg-indigo-50 text-indigo-700',
        'border border-indigo-100'
      ),
      secondary: cn(
        'bg-purple-50 text-purple-700',
        'border border-purple-100'
      ),
      success: cn(
        'bg-emerald-50 text-emerald-700',
        'border border-emerald-100'
      ),
      warning: cn(
        'bg-amber-50 text-amber-700',
        'border border-amber-100'
      ),
      error: cn(
        'bg-red-50 text-red-700',
        'border border-red-100'
      ),
      outline: cn(
        'bg-transparent text-slate-700',
        'border-2 border-slate-200'
      ),
    }

    const sizes = {
      sm: 'px-2 py-0.5 text-[10px]',
      md: 'px-2.5 py-1 text-xs',
      lg: 'px-3 py-1.5 text-sm',
    }

    return (
      <span
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {children}
      </span>
    )
  }
)

Badge.displayName = 'Badge'

// Gradient Badge for premium/featured items
export interface GradientBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  gradient?: 'primary' | 'success' | 'warning' | 'premium'
  size?: 'sm' | 'md' | 'lg'
}

export const GradientBadge = forwardRef<HTMLSpanElement, GradientBadgeProps>(
  ({ className, gradient = 'primary', size = 'md', children, ...props }, ref) => {
    const baseStyles = cn(
      'inline-flex items-center justify-center gap-1.5',
      'font-bold rounded-full text-white',
      'shadow-sm'
    )

    const gradients = {
      primary: 'bg-gradient-to-r from-indigo-500 to-purple-500',
      success: 'bg-gradient-to-r from-emerald-500 to-teal-500',
      warning: 'bg-gradient-to-r from-amber-400 to-orange-500',
      premium: 'bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500',
    }

    const sizes = {
      sm: 'px-2 py-0.5 text-[10px]',
      md: 'px-2.5 py-1 text-xs',
      lg: 'px-3 py-1.5 text-sm',
    }

    return (
      <span
        ref={ref}
        className={cn(baseStyles, gradients[gradient], sizes[size], className)}
        {...props}
      >
        {children}
      </span>
    )
  }
)

GradientBadge.displayName = 'GradientBadge'

// Status Dot Badge
export interface StatusBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  status?: 'online' | 'offline' | 'busy' | 'away'
  pulse?: boolean
}

export const StatusBadge = forwardRef<HTMLSpanElement, StatusBadgeProps>(
  ({ className, status = 'online', pulse = true, children, ...props }, ref) => {
    const statusColors = {
      online: 'bg-emerald-500',
      offline: 'bg-slate-400',
      busy: 'bg-red-500',
      away: 'bg-amber-500',
    }

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center gap-2 text-sm text-slate-600',
          className
        )}
        {...props}
      >
        <span className="relative flex h-2.5 w-2.5">
          {pulse && status === 'online' && (
            <span
              className={cn(
                'absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping',
                statusColors[status]
              )}
            />
          )}
          <span
            className={cn(
              'relative inline-flex h-2.5 w-2.5 rounded-full',
              statusColors[status]
            )}
          />
        </span>
        {children}
      </span>
    )
  }
)

StatusBadge.displayName = 'StatusBadge'
