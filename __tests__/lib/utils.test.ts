import { cn, formatFileSize } from '@/lib/utils'

describe('cn utility function', () => {
  it('merges class names correctly', () => {
    const result = cn('bg-red-500', 'text-white')
    expect(result).toBe('bg-red-500 text-white')
  })

  it('handles conditional class names', () => {
    const isActive = true
    const result = cn('base-class', isActive && 'active-class')
    expect(result).toBe('base-class active-class')
  })

  it('filters out falsy values', () => {
    const result = cn('class-1', false, 'class-2', null, 'class-3', undefined)
    expect(result).toBe('class-1 class-2 class-3')
  })

  it('handles Tailwind class conflicts', () => {
    const result = cn('p-4', 'p-8')
    // tailwind-merge should keep only the last padding class
    expect(result).toBe('p-8')
  })

  it('handles empty input', () => {
    const result = cn()
    expect(result).toBe('')
  })

  it('handles array of classes', () => {
    const result = cn(['class-1', 'class-2'], 'class-3')
    expect(result).toBe('class-1 class-2 class-3')
  })

  it('resolves conflicting Tailwind classes correctly', () => {
    const result = cn('bg-red-500', 'bg-blue-500')
    expect(result).toBe('bg-blue-500')
  })

  it('handles object-style class names', () => {
    const result = cn({
      'base-class': true,
      'conditional-class': true,
      'false-class': false,
    })
    expect(result).toContain('base-class')
    expect(result).toContain('conditional-class')
    expect(result).not.toContain('false-class')
  })
})

describe('formatFileSize utility function', () => {
  it('formats 0 bytes correctly', () => {
    expect(formatFileSize(0)).toBe('0 Bytes')
  })

  it('formats bytes correctly', () => {
    expect(formatFileSize(500)).toBe('500 Bytes')
    expect(formatFileSize(1023)).toBe('1023 Bytes')
  })

  it('formats kilobytes correctly', () => {
    expect(formatFileSize(1024)).toBe('1 KB')
    expect(formatFileSize(2048)).toBe('2 KB')
    expect(formatFileSize(1536)).toBe('1.5 KB')
  })

  it('formats megabytes correctly', () => {
    expect(formatFileSize(1024 * 1024)).toBe('1 MB')
    expect(formatFileSize(1024 * 1024 * 2)).toBe('2 MB')
    expect(formatFileSize(1024 * 1024 * 1.5)).toBe('1.5 MB')
  })

  it('formats gigabytes correctly', () => {
    expect(formatFileSize(1024 * 1024 * 1024)).toBe('1 GB')
    expect(formatFileSize(1024 * 1024 * 1024 * 2)).toBe('2 GB')
    expect(formatFileSize(1024 * 1024 * 1024 * 1.5)).toBe('1.5 GB')
  })

  it('rounds to 2 decimal places', () => {
    expect(formatFileSize(1536)).toBe('1.5 KB')
    expect(formatFileSize(1587)).toBe('1.55 KB')
  })

  it('handles large file sizes', () => {
    const largeSize = 5 * 1024 * 1024 * 1024 // 5 GB
    expect(formatFileSize(largeSize)).toBe('5 GB')
  })

  it('handles decimal calculations correctly', () => {
    expect(formatFileSize(1024 * 1.25)).toBe('1.25 KB')
    expect(formatFileSize(1024 * 1024 * 3.14)).toBe('3.14 MB')
  })

  it('handles edge case: 1 byte', () => {
    expect(formatFileSize(1)).toBe('1 Bytes')
  })

  it('handles typical document sizes', () => {
    const docSize = 2 * 1024 * 1024 // 2MB typical document
    expect(formatFileSize(docSize)).toBe('2 MB')
  })

  it('handles small file sizes under 1KB', () => {
    expect(formatFileSize(100)).toBe('100 Bytes')
    expect(formatFileSize(512)).toBe('512 Bytes')
  })

  it('returns consistent format with unit separation', () => {
    const result = formatFileSize(1024)
    expect(result).toMatch(/^\d+(\.\d+)?\s[A-Z]+$/)
  })

  it('handles very large file sizes', () => {
    const largeSize = 1024 * 1024 * 1024 * 100 // 100 GB
    const result = formatFileSize(largeSize)
    expect(result).toBe('100 GB')
  })

  it('formats commonly used file sizes correctly', () => {
    expect(formatFileSize(10 * 1024 * 1024)).toBe('10 MB') // 10MB upload limit
    expect(formatFileSize(5 * 1024 * 1024)).toBe('5 MB') // 5MB image
    expect(formatFileSize(100 * 1024)).toBe('100 KB') // 100KB thumbnail
  })
})
