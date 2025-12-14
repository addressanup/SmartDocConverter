'use client'

import { cn } from '@/lib/utils'

interface ProgressBarProps {
  progress: number
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'success' | 'error'
  className?: string
}

export function ProgressBar({
  progress,
  showLabel = true,
  size = 'md',
  variant = 'default',
  className,
}: ProgressBarProps) {
  const clampedProgress = Math.min(100, Math.max(0, progress))

  const sizes = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  }

  const variants = {
    default: 'bg-gradient-to-r from-indigo-500 to-purple-500',
    success: 'bg-gradient-to-r from-emerald-500 to-teal-500',
    error: 'bg-gradient-to-r from-red-500 to-rose-500',
  }

  return (
    <div className={cn('w-full', className)}>
      <div className={cn('w-full bg-slate-200 rounded-full overflow-hidden', sizes[size])}>
        <div
          className={cn(
            'h-full rounded-full transition-all duration-300 ease-out relative overflow-hidden',
            variants[variant]
          )}
          style={{ width: `${clampedProgress}%` }}
          role="progressbar"
          aria-valuenow={clampedProgress}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
        </div>
      </div>
      {showLabel && (
        <p className="text-sm text-slate-600 mt-1 text-right font-medium">{Math.round(clampedProgress)}%</p>
      )}
    </div>
  )
}
