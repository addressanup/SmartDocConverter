# Merge PDF Implementation

This document describes the Merge PDF converter implementation for SmartDocConverter.

## Overview

The merge PDF feature allows users to combine multiple PDF files into a single PDF document while preserving page sizes, orientations, and content quality.

## Files Created

### 1. `/src/lib/converters/merge-pdf.ts`

The core converter module that handles PDF merging using pdf-lib.

**Key Features:**
- Merges multiple PDF files into a single document
- Preserves original page sizes and orientations
- Validates input files exist before processing
- Comprehensive error handling and logging
- Configurable output location and name

**Function Signature:**
```typescript
export async function mergePdfs(
  inputPaths: string[],
  options?: { outputName?: string; outputDir?: string }
): Promise<string>
```

**Parameters:**
- `inputPaths`: Array of absolute paths to PDF files to merge (minimum 2 files)
- `options.outputName`: Optional custom name for the merged PDF (default: `merged_<timestamp>`)
- `options.outputDir`: Optional output directory (default: same as first input file)

**Returns:**
- Absolute path to the merged PDF file

**Error Handling:**
- Validates minimum 2 files for merging
- Checks all input files exist
- Provides detailed error messages for debugging
- Catches and wraps all errors with context

### 2. `/src/app/api/upload-multiple/route.ts`

New API endpoint for uploading multiple files (specifically for merge functionality).

**Endpoint:** `POST /api/upload-multiple`

**Features:**
- Handles multiple file uploads in a single request
- Rate limiting (IP-based and user-based)
- Usage tracking and tier-based limits
- File size validation per tier (Free: 10MB, Premium: 50MB)
- File count limits (Free: 5 files, Premium: 20 files)
- MIME type validation (PDF only)
- Returns array of uploaded file information

**Request Format:**
```typescript
// FormData with multiple file entries
const formData = new FormData();
formData.append('file', file1);
formData.append('file', file2);
formData.append('file', file3);
```

**Response Format:**
```typescript
{
  success: true,
  files: [
    {
      fileId: string,
      fileName: string,
      fileSize: number,
      filePath: string,
      mimeType: string
    },
    // ... more files
  ],
  totalSize: number,
  fileCount: number,
  usage: {
    // usage information
  }
}
```

**Error Responses:**
- 400: No files provided / Invalid file count / Invalid file size / Invalid file type
- 429: Rate limit exceeded / Usage limit exceeded
- 500: Server error

### 3. `/src/app/api/convert/route.ts` (Updated)

Updated the existing convert API to handle merge-pdf conversion type.

**Changes Made:**
1. Added `mergePdfs` import
2. Updated `ConversionRequest` interface to include optional `filePaths` array
3. Added validation logic for merge-pdf conversion type
4. Updated `processConversion` function signature to accept `filePaths` parameter
5. Added merge-pdf case in conversion switch statement

**Usage for Merge PDF:**
```typescript
POST /api/convert
{
  fileId: "unique-id",
  conversionType: "merge-pdf",
  filePaths: [
    "/path/to/file1.pdf",
    "/path/to/file2.pdf",
    "/path/to/file3.pdf"
  ],
  options: {
    outputName: "merged-document"
  }
}
```

**Response:**
```typescript
{
  success: true,
  jobId: "job-uuid",
  status: "queued",
  message: "Conversion job created",
  usage: { /* usage info */ }
}
```

### 4. `/tsconfig.json` (Updated)

Added `"downlevelIteration": true` to compiler options to support iterating over FormData entries.

## Implementation Details

### PDF Merging Process

1. **Validation**: Checks that at least 2 PDFs are provided and all files exist
2. **Document Creation**: Creates a new empty PDF document using pdf-lib
3. **Page Copying**: For each input PDF:
   - Loads the PDF document
   - Gets all page indices
   - Copies all pages preserving size and orientation
   - Adds copied pages to the merged document
4. **Output**: Saves the merged PDF to the specified location
5. **Logging**: Provides detailed console logs for debugging

### Error Handling

- Input validation errors (too few files, missing files)
- File system errors (file not found, permission issues)
- PDF parsing errors (corrupted PDFs, invalid format)
- All errors are caught and wrapped with descriptive messages

### Logging

The converter provides detailed logging at each step:
```
[Merge PDF] Starting merge of 3 PDFs
[Merge PDF] Processing file 1/3: document1.pdf
[Merge PDF] File has 5 pages
[Merge PDF] Successfully added 5 pages from document1.pdf
...
[Merge PDF] Merge complete!
[Merge PDF] Total pages: 15
[Merge PDF] Output size: 245.67 KB
[Merge PDF] Output path: /path/to/merged_1234567890.pdf
```

## Testing

A test script is provided at `/test-merge-pdf.js` that:
1. Creates sample PDF files for testing
2. Demonstrates the API call format
3. Shows expected request/response structure

To run the test:
```bash
node test-merge-pdf.js
```

## API Usage Example

### Step 1: Upload Multiple PDFs

```javascript
const formData = new FormData();
formData.append('file', pdfFile1);
formData.append('file', pdfFile2);
formData.append('file', pdfFile3);

const uploadResponse = await fetch('/api/upload-multiple', {
  method: 'POST',
  body: formData,
  headers: {
    'x-fingerprint': userFingerprint // optional
  }
});

const { files } = await uploadResponse.json();
```

### Step 2: Start Merge Conversion

```javascript
const convertResponse = await fetch('/api/convert', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    fileId: 'merge-' + Date.now(),
    conversionType: 'merge-pdf',
    filePaths: files.map(f => f.filePath),
    options: {
      outputName: 'merged-document'
    }
  })
});

const { jobId } = await convertResponse.json();
```

### Step 3: Poll for Completion

```javascript
const checkStatus = async (jobId) => {
  const response = await fetch(`/api/convert?jobId=${jobId}`);
  const job = await response.json();

  if (job.status === 'completed') {
    return job.downloadUrl;
  } else if (job.status === 'failed') {
    throw new Error(job.error);
  }

  // Poll again after delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  return checkStatus(jobId);
};

const downloadUrl = await checkStatus(jobId);
```

## Rate Limits and Tiers

### Anonymous/Free Tier
- Max 5 files per merge
- Max 10MB per file
- Daily conversion limit applies

### Premium Tier
- Max 20 files per merge
- Max 50MB per file
- Unlimited daily conversions

## Dependencies

- **pdf-lib**: Used for PDF manipulation (already installed)
- All other dependencies are built-in Node.js modules (fs, path) or Next.js APIs

## Future Enhancements

Potential improvements for future versions:

1. **Page Selection**: Allow users to select specific pages from each PDF
2. **Page Ordering**: Enable reordering of pages in the final document
3. **Bookmarks**: Preserve or generate bookmarks in the merged PDF
4. **Metadata**: Option to set custom metadata on merged PDF
5. **Page Numbering**: Add page numbers to merged document
6. **Batch Processing**: Queue multiple merge operations
7. **Preview**: Show thumbnail preview before merging
8. **Drag & Drop Reordering**: UI for reordering files before merge

## Security Considerations

1. **File Validation**: Only PDF files are accepted
2. **Path Validation**: All file paths are validated before processing
3. **Size Limits**: Enforced based on user tier
4. **Rate Limiting**: Prevents abuse with IP and user-based limits
5. **Usage Tracking**: All conversions are tracked for quota management
6. **Temporary Files**: Consider implementing cleanup for old merged files

## Troubleshooting

### Common Issues

**Error: "At least two file paths are required for merging PDFs"**
- Solution: Ensure you're passing an array with at least 2 file paths

**Error: "Input file not found: /path/to/file.pdf"**
- Solution: Verify all uploaded files were saved successfully before calling convert

**Error: "Failed to process [filename]: Invalid PDF structure"**
- Solution: The PDF file may be corrupted or password-protected

**Error: "Maximum X files allowed"**
- Solution: Reduce the number of files or upgrade to Premium tier

## File Locations

- Converter: `/src/lib/converters/merge-pdf.ts`
- Multi-upload API: `/src/app/api/upload-multiple/route.ts`
- Convert API: `/src/app/api/convert/route.ts`
- Test script: `/test-merge-pdf.js`
- Documentation: `/MERGE_PDF_IMPLEMENTATION.md`

## Configuration

Environment variables that affect merge-pdf:

- `UPLOAD_DIR`: Directory where uploaded files are stored (default: `./uploads`)
- `TEMP_DIR`: Directory for temporary files (default: `./tmp`)
- `MAX_FILE_SIZE_FREE`: Max file size for free tier in bytes (default: 10485760)
- `MAX_FILE_SIZE_PREMIUM`: Max file size for premium tier in bytes (default: 52428800)

## Support

For issues or questions about the merge-pdf implementation, please check:
1. Console logs for detailed error messages
2. This documentation for API usage examples
3. The test script for working example code
