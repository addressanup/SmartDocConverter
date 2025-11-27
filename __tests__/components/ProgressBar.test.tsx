import React from 'react'
import { render, screen } from '@testing-library/react'
import { ProgressBar } from '@/components/ui/ProgressBar'

// Mock the cn utility
jest.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' '),
}))

describe('ProgressBar', () => {
  it('renders with default props', () => {
    const { container } = render(<ProgressBar progress={50} />)

    const progressBar = container.querySelector('[style*="width"]')
    expect(progressBar).toHaveStyle({ width: '50%' })
    expect(screen.getByText('50%')).toBeInTheDocument()
  })

  it('displays progress label when showLabel is true', () => {
    render(<ProgressBar progress={75} showLabel />)

    expect(screen.getByText('75%')).toBeInTheDocument()
  })

  it('hides progress label when showLabel is false', () => {
    render(<ProgressBar progress={75} showLabel={false} />)

    expect(screen.queryByText('75%')).not.toBeInTheDocument()
  })

  it('clamps progress to 0-100 range (above 100)', () => {
    const { container } = render(<ProgressBar progress={150} />)

    const progressBar = container.querySelector('[style*="width"]')
    expect(progressBar).toHaveStyle({ width: '100%' })
    expect(screen.getByText('100%')).toBeInTheDocument()
  })

  it('clamps progress to 0-100 range (below 0)', () => {
    const { container } = render(<ProgressBar progress={-20} />)

    const progressBar = container.querySelector('[style*="width"]')
    expect(progressBar).toHaveStyle({ width: '0%' })
    expect(screen.getByText('0%')).toBeInTheDocument()
  })

  it('handles decimal progress values', () => {
    render(<ProgressBar progress={33.7} />)

    expect(screen.getByText('34%')).toBeInTheDocument()
  })

  it('renders with small size', () => {
    const { container } = render(<ProgressBar progress={50} size="sm" />)

    const progressContainer = container.querySelector('.h-1\\.5')
    expect(progressContainer).toBeInTheDocument()
  })

  it('renders with medium size (default)', () => {
    const { container } = render(<ProgressBar progress={50} size="md" />)

    const progressContainer = container.querySelector('.h-2\\.5')
    expect(progressContainer).toBeInTheDocument()
  })

  it('renders with large size', () => {
    const { container } = render(<ProgressBar progress={50} size="lg" />)

    const progressContainer = container.querySelector('.h-4')
    expect(progressContainer).toBeInTheDocument()
  })

  it('renders with default variant', () => {
    const { container } = render(<ProgressBar progress={50} variant="default" />)

    const progressBar = container.querySelector('.bg-primary-600')
    expect(progressBar).toBeInTheDocument()
  })

  it('renders with success variant', () => {
    const { container } = render(<ProgressBar progress={100} variant="success" />)

    const progressBar = container.querySelector('.bg-green-500')
    expect(progressBar).toBeInTheDocument()
  })

  it('renders with error variant', () => {
    const { container } = render(<ProgressBar progress={50} variant="error" />)

    const progressBar = container.querySelector('.bg-red-500')
    expect(progressBar).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(<ProgressBar progress={50} className="custom-class" />)

    const wrapper = container.firstChild
    expect(wrapper).toHaveClass('custom-class')
  })

  it('renders at 0% progress', () => {
    const { container } = render(<ProgressBar progress={0} />)

    const progressBar = container.querySelector('[style*="width"]')
    expect(progressBar).toHaveStyle({ width: '0%' })
    expect(screen.getByText('0%')).toBeInTheDocument()
  })

  it('renders at 100% progress', () => {
    const { container } = render(<ProgressBar progress={100} />)

    const progressBar = container.querySelector('[style*="width"]')
    expect(progressBar).toHaveStyle({ width: '100%' })
    expect(screen.getByText('100%')).toBeInTheDocument()
  })

  it('has transition classes for smooth animation', () => {
    const { container } = render(<ProgressBar progress={50} />)

    const progressBar = container.querySelector('[style*="width"]')
    expect(progressBar?.className).toContain('transition-all')
    expect(progressBar?.className).toContain('duration-300')
    expect(progressBar?.className).toContain('ease-out')
  })

  it('combines size and variant correctly', () => {
    const { container } = render(
      <ProgressBar progress={75} size="lg" variant="success" />
    )

    const progressBar = container.querySelector('.bg-green-500')
    expect(progressBar).toBeInTheDocument()

    const progressContainer = container.querySelector('.h-4')
    expect(progressContainer).toBeInTheDocument()
  })

  it('rounds progress percentage in label', () => {
    render(<ProgressBar progress={33.4} />)
    expect(screen.getByText('33%')).toBeInTheDocument()

    const { rerender } = render(<ProgressBar progress={33.5} />)
    rerender(<ProgressBar progress={33.5} />)
    expect(screen.getByText('34%')).toBeInTheDocument()
  })

  it('maintains proper structure with nested divs', () => {
    const { container } = render(<ProgressBar progress={50} />)

    const wrapper = container.firstChild
    expect(wrapper).toHaveClass('w-full')

    const progressContainer = wrapper?.querySelector('.bg-gray-200')
    expect(progressContainer).toBeInTheDocument()

    const progressBar = progressContainer?.querySelector('[style*="width"]')
    expect(progressBar).toBeInTheDocument()
  })
})
