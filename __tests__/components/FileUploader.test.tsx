import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FileUploader } from '@/components/shared/FileUploader'

// Mock the utils
jest.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' '),
  formatFileSize: (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  },
}))

// Mock Button component
jest.mock('@/components/ui/Button', () => ({
  Button: ({ children, onClick, className, ...props }: any) => (
    <button onClick={onClick} className={className} {...props}>
      {children}
    </button>
  ),
}))

describe('FileUploader', () => {
  const mockOnFilesSelected = jest.fn()
  const mockOnFileRemove = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders with default props', () => {
    render(<FileUploader onFilesSelected={mockOnFilesSelected} />)

    expect(screen.getByText('Drop your file here')).toBeInTheDocument()
    expect(screen.getByText('or click to browse')).toBeInTheDocument()
    expect(screen.getByText('Max file size: 10 MB')).toBeInTheDocument()
  })

  it('renders with custom title and description', () => {
    render(
      <FileUploader
        onFilesSelected={mockOnFilesSelected}
        title="Upload PDF"
        description="Select a PDF file"
      />
    )

    expect(screen.getByText('Upload PDF')).toBeInTheDocument()
    expect(screen.getByText('Select a PDF file')).toBeInTheDocument()
  })

  it('displays custom max file size', () => {
    const fiveMB = 5 * 1024 * 1024
    render(<FileUploader onFilesSelected={mockOnFilesSelected} maxSize={fiveMB} />)

    expect(screen.getByText('Max file size: 5 MB')).toBeInTheDocument()
  })

  it('handles file selection via input', async () => {
    render(<FileUploader onFilesSelected={mockOnFilesSelected} />)

    const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' })
    const input = screen.getByRole('presentation').querySelector('input[type="file"]') as HTMLInputElement

    await userEvent.upload(input, file)

    await waitFor(() => {
      expect(mockOnFilesSelected).toHaveBeenCalled()
      const callArgs = mockOnFilesSelected.mock.calls[0][0]
      expect(callArgs).toHaveLength(1)
      expect(callArgs[0].file.name).toBe('test.pdf')
    })
  })

  it('displays uploaded file information', async () => {
    render(<FileUploader onFilesSelected={mockOnFilesSelected} />)

    const file = new File(['test content'], 'document.pdf', { type: 'application/pdf' })
    const input = screen.getByRole('presentation').querySelector('input[type="file"]') as HTMLInputElement

    await userEvent.upload(input, file)

    await waitFor(() => {
      expect(screen.getByText('document.pdf')).toBeInTheDocument()
      expect(screen.getByText('12 Bytes')).toBeInTheDocument()
    })
  })

  it('handles file removal', async () => {
    render(
      <FileUploader
        onFilesSelected={mockOnFilesSelected}
        onFileRemove={mockOnFileRemove}
      />
    )

    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' })
    const input = screen.getByRole('presentation').querySelector('input[type="file"]') as HTMLInputElement

    await userEvent.upload(input, file)

    await waitFor(() => {
      expect(screen.getByText('test.pdf')).toBeInTheDocument()
    })

    const removeButton = screen.getByRole('button')
    await userEvent.click(removeButton)

    await waitFor(() => {
      expect(screen.queryByText('test.pdf')).not.toBeInTheDocument()
      expect(mockOnFileRemove).toHaveBeenCalled()
    })
  })

  it('replaces file when maxFiles is 1', async () => {
    render(<FileUploader onFilesSelected={mockOnFilesSelected} maxFiles={1} />)

    const file1 = new File(['content1'], 'file1.pdf', { type: 'application/pdf' })
    const file2 = new File(['content2'], 'file2.pdf', { type: 'application/pdf' })
    const input = screen.getByRole('presentation').querySelector('input[type="file"]') as HTMLInputElement

    await userEvent.upload(input, file1)

    await waitFor(() => {
      expect(screen.getByText('file1.pdf')).toBeInTheDocument()
    })

    await userEvent.upload(input, file2)

    await waitFor(() => {
      expect(screen.queryByText('file1.pdf')).not.toBeInTheDocument()
      expect(screen.getByText('file2.pdf')).toBeInTheDocument()
    })
  })

  it('handles multiple files when maxFiles > 1', async () => {
    render(<FileUploader onFilesSelected={mockOnFilesSelected} maxFiles={3} />)

    const file1 = new File(['content1'], 'file1.pdf', { type: 'application/pdf' })
    const file2 = new File(['content2'], 'file2.pdf', { type: 'application/pdf' })
    const input = screen.getByRole('presentation').querySelector('input[type="file"]') as HTMLInputElement

    await userEvent.upload(input, file1)

    await waitFor(() => {
      expect(screen.getByText('file1.pdf')).toBeInTheDocument()
    })

    await userEvent.upload(input, file2)

    await waitFor(() => {
      expect(screen.getByText('file1.pdf')).toBeInTheDocument()
      expect(screen.getByText('file2.pdf')).toBeInTheDocument()
    })
  })

  it('validates file size limit', () => {
    render(<FileUploader onFilesSelected={mockOnFilesSelected} maxSize={1024 * 1024} />)

    // Verify max size is displayed
    expect(screen.getByText('Max file size: 1 MB')).toBeInTheDocument()
  })

  it('respects disabled state', () => {
    render(<FileUploader onFilesSelected={mockOnFilesSelected} disabled />)

    const dropzone = screen.getByRole('presentation')
    expect(dropzone.className).toContain('cursor-not-allowed')
    expect(dropzone.className).toContain('opacity-50')
  })

  it('applies custom className', () => {
    render(
      <FileUploader onFilesSelected={mockOnFilesSelected} className="custom-class" />
    )

    const container = screen.getByRole('presentation').parentElement
    expect(container?.className).toContain('custom-class')
  })

  it('calls onFilesSelected with empty array when last file is removed', async () => {
    render(<FileUploader onFilesSelected={mockOnFilesSelected} />)

    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' })
    const input = screen.getByRole('presentation').querySelector('input[type="file"]') as HTMLInputElement

    await userEvent.upload(input, file)

    await waitFor(() => {
      expect(screen.getByText('test.pdf')).toBeInTheDocument()
    })

    mockOnFilesSelected.mockClear()

    const removeButton = screen.getByRole('button')
    await userEvent.click(removeButton)

    await waitFor(() => {
      expect(mockOnFilesSelected).toHaveBeenCalledWith([])
    })
  })

  it('generates unique file IDs', async () => {
    render(<FileUploader onFilesSelected={mockOnFilesSelected} maxFiles={2} />)

    const file1 = new File(['content1'], 'test1.pdf', { type: 'application/pdf' })
    const file2 = new File(['content2'], 'test2.pdf', { type: 'application/pdf' })
    const input = screen.getByRole('presentation').querySelector('input[type="file"]') as HTMLInputElement

    await userEvent.upload(input, file1)

    await waitFor(() => {
      expect(screen.getByText('test1.pdf')).toBeInTheDocument()
    })

    await userEvent.upload(input, file2)

    await waitFor(() => {
      expect(screen.getByText('test2.pdf')).toBeInTheDocument()
    })

    // Check that both files have unique IDs by verifying the onFilesSelected was called
    // with different file objects
    await waitFor(() => {
      const lastCall = mockOnFilesSelected.mock.calls[mockOnFilesSelected.mock.calls.length - 1]
      const files = lastCall[0]
      const ids = files.map((f: any) => f.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(files.length)
    })
  })
})
