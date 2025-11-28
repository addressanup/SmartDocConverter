'use client'

import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'gradient'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, disabled, children, ...props }, ref) => {
    const baseStyles = cn(
      'relative inline-flex items-center justify-center gap-2',
      'font-semibold',
      'transition-all duration-300',
      'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
      'disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none',
      'active:scale-[0.98]',
      'overflow-hidden'
    )

    const variants = {
      primary: cn(
        'bg-slate-900 text-white',
        'hover:bg-slate-800',
        'focus-visible:ring-slate-900',
        'shadow-lg shadow-slate-900/10 hover:shadow-xl hover:shadow-slate-900/15'
      ),
      secondary: cn(
        'bg-slate-100 text-slate-900',
        'hover:bg-slate-200',
        'focus-visible:ring-slate-500'
      ),
      outline: cn(
        'bg-transparent border-2 border-slate-200 text-slate-700',
        'hover:bg-slate-50 hover:border-slate-300',
        'focus-visible:ring-slate-500'
      ),
      ghost: cn(
        'text-slate-600',
        'hover:text-slate-900 hover:bg-slate-100',
        'focus-visible:ring-slate-500'
      ),
      danger: cn(
        'bg-gradient-to-r from-red-500 to-rose-600 text-white',
        'hover:from-red-600 hover:to-rose-700',
        'focus-visible:ring-red-500',
        'shadow-lg shadow-red-500/20 hover:shadow-xl hover:shadow-red-500/30'
      ),
      gradient: cn(
        'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white',
        'hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600',
        'focus-visible:ring-indigo-500',
        'shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/35'
      ),
    }

    const sizes = {
      sm: 'px-4 py-2 text-[13px] rounded-xl',
      md: 'px-5 py-2.5 text-[14px] rounded-xl',
      lg: 'px-8 py-4 text-[15px] rounded-2xl',
    }

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {/* Shimmer effect on hover */}
        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-700 pointer-events-none" />
        
        {isLoading ? (
          <>
            <svg
              className="animate-spin h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Processing...</span>
          </>
        ) : (
          <span className="relative z-10">{children}</span>
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'
