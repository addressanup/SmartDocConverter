'use client'

import { forwardRef, HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

// Card Root
export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'elevated' | 'outline'
  hover?: boolean
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', hover = false, children, ...props }, ref) => {
    const variants = {
      default: cn(
        'bg-white rounded-2xl border border-slate-100',
        'shadow-sm'
      ),
      glass: cn(
        'bg-white/60 backdrop-blur-lg rounded-2xl',
        'border border-white/20 shadow-lg'
      ),
      elevated: cn(
        'bg-white rounded-2xl border border-slate-100',
        'shadow-lg'
      ),
      outline: cn(
        'bg-transparent rounded-2xl',
        'border-2 border-slate-200'
      ),
    }

    const hoverStyles = hover
      ? 'transition-all duration-300 hover:shadow-xl hover:border-indigo-100 hover:-translate-y-1'
      : ''

    return (
      <div
        ref={ref}
        className={cn(variants[variant], hoverStyles, className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'

// Card Header
export type CardHeaderProps = HTMLAttributes<HTMLDivElement>

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('px-6 py-4 border-b border-slate-100', className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)

CardHeader.displayName = 'CardHeader'

// Card Title
export interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
}

export const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, as: Tag = 'h3', children, ...props }, ref) => {
    return (
      <Tag
        ref={ref}
        className={cn('text-lg font-semibold text-slate-900', className)}
        {...props}
      >
        {children}
      </Tag>
    )
  }
)

CardTitle.displayName = 'CardTitle'

// Card Description
export type CardDescriptionProps = HTMLAttributes<HTMLParagraphElement>

export const CardDescription = forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <p
        ref={ref}
        className={cn('text-sm text-slate-500 mt-1', className)}
        {...props}
      >
        {children}
      </p>
    )
  }
)

CardDescription.displayName = 'CardDescription'

// Card Content
export interface CardContentProps extends HTMLAttributes<HTMLDivElement> {
  noPadding?: boolean
}

export const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, noPadding = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(noPadding ? '' : 'px-6 py-4', className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)

CardContent.displayName = 'CardContent'

// Card Footer
export type CardFooterProps = HTMLAttributes<HTMLDivElement>

export const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'px-6 py-4 border-t border-slate-100',
          'flex items-center justify-end gap-3',
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

CardFooter.displayName = 'CardFooter'
