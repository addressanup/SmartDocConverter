'use client'

import { forwardRef, InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default' | 'filled' | 'ghost'
  inputSize?: 'sm' | 'md' | 'lg'
  error?: boolean
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      variant = 'default',
      inputSize = 'md',
      error,
      icon,
      iconPosition = 'left',
      type,
      ...props
    },
    ref
  ) => {
    const baseStyles = cn(
      'w-full rounded-xl border bg-white text-slate-900 placeholder-slate-400',
      'transition-colors duration-200',
      'focus:outline-none focus:ring-2 focus:ring-offset-0',
      'disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400'
    )

    const variantStyles = {
      default: cn(
        'border-slate-200 shadow-sm',
        'hover:border-slate-300',
        error
          ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
          : 'focus:border-indigo-500 focus:ring-indigo-500/20'
      ),
      filled: cn(
        'border-transparent bg-slate-100',
        'hover:bg-slate-50',
        error
          ? 'bg-red-50 focus:bg-white focus:border-red-400 focus:ring-red-100'
          : 'focus:bg-white focus:border-indigo-500 focus:ring-indigo-500/20'
      ),
      ghost: cn(
        'border-transparent bg-transparent',
        'hover:bg-slate-50',
        error
          ? 'focus:border-red-400 focus:ring-red-100'
          : 'focus:border-indigo-500 focus:ring-indigo-500/20'
      ),
    }

    const sizeStyles = {
      sm: 'px-3 py-2 text-sm',
      md: 'px-4 py-3 text-base',
      lg: 'px-4 py-4 text-lg',
    }

    const iconPaddingStyles = {
      left: {
        sm: 'pl-9',
        md: 'pl-11',
        lg: 'pl-12',
      },
      right: {
        sm: 'pr-9',
        md: 'pr-11',
        lg: 'pr-12',
      },
    }

    const iconPositionStyles = {
      left: 'left-3',
      right: 'right-3',
    }

    const iconSizeStyles = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6',
    }

    if (icon) {
      return (
        <div className="relative">
          <div
            className={cn(
              'absolute top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none',
              iconPositionStyles[iconPosition]
            )}
          >
            <span className={iconSizeStyles[inputSize]}>{icon}</span>
          </div>
          <input
            type={type}
            className={cn(
              baseStyles,
              variantStyles[variant],
              sizeStyles[inputSize],
              iconPaddingStyles[iconPosition][inputSize],
              className
            )}
            ref={ref}
            {...props}
          />
        </div>
      )
    }

    return (
      <input
        type={type}
        className={cn(
          baseStyles,
          variantStyles[variant],
          sizeStyles[inputSize],
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)

Input.displayName = 'Input'
