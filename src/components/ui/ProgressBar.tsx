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
    default: 'bg-primary-600',
    success: 'bg-green-500',
    error: 'bg-red-500',
  }

  return (
    <div className={cn('w-full', className)}>
      <div className={cn('w-full bg-gray-200 rounded-full overflow-hidden', sizes[size])}>
        <div
          className={cn(
            'h-full rounded-full transition-all duration-300 ease-out',
            variants[variant]
          )}
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
      {showLabel && (
        <p className="text-sm text-gray-600 mt-1 text-right">{Math.round(clampedProgress)}%</p>
      )}
    </div>
  )
}
