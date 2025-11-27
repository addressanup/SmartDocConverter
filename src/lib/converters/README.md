# SmartDocConverter - Conversion Workers

This directory contains the actual file conversion logic for SmartDocConverter. Each converter is a standalone module that handles a specific type of file conversion.

## Available Converters

### 1. PDF to Word (`pdf-to-word.ts`)
Converts PDF files to DOCX format by extracting text content using `pdf-parse` and creating a Word document using `docx`.

**Function:** `convertPdfToWord(inputPath, options)`
- **Input:** PDF file path
- **Output:** DOCX file path
- **Libraries:** pdf-parse, docx
- **Note:** Extracts text only, does not preserve complex formatting or images

### 2. Word to PDF (`word-to-pdf.ts`)
Converts DOCX files to PDF format by extracting text using `mammoth` and creating a PDF using `pdf-lib`.

**Function:** `convertWordToPdf(inputPath, options)`
- **Input:** DOCX file path
- **Output:** PDF file path
- **Libraries:** mammoth, pdf-lib
- **Options:**
  - `fontSize`: Font size for text (default: 12)
  - `pageMargin`: Page margin in points (default: 50)

### 3. Compress PDF (`compress-pdf.ts`)
Reduces PDF file size by removing metadata and optimizing structure.

**Function:** `compressPdf(inputPath, options)`
- **Input:** PDF file path
- **Output:** Compressed PDF file path
- **Libraries:** pdf-lib
- **Options:**
  - `removeMetadata`: Remove PDF metadata (default: true)
  - `compressionLevel`: 'low' | 'medium' | 'high' (default: 'medium')

### 4. Image to Text (`image-to-text.ts`)
Extracts text from images using OCR (Optical Character Recognition).

**Function:** `convertImageToText(inputPath, options)`
- **Input:** Image file path (JPG, PNG, etc.)
- **Output:** Text file path (TXT or JSON)
- **Libraries:** tesseract.js
- **Options:**
  - `language`: OCR language (default: 'eng')
  - `outputFormat`: 'txt' | 'json' (default: 'txt')

### 5. JPG to PDF (`jpg-to-pdf.ts`)
Converts images to PDF format.

**Function:** `convertJpgToPdf(inputPath, options)`
- **Input:** Image file path (JPG, PNG, etc.)
- **Output:** PDF file path
- **Libraries:** sharp, pdf-lib
- **Options:**
  - `quality`: JPEG quality 1-100 (default: 85)
  - `fitToPage`: Resize to fit page (default: false)
  - `pageSize`: 'A4' | 'Letter' | 'Legal' (default: 'A4')

### 6. PDF to JPG (`pdf-to-jpg.ts`)
Converts PDF pages to JPG images.

**Function:** `convertPdfToJpg(inputPath, options)`
- **Input:** PDF file path
- **Output:** JPG file path(s)
- **Libraries:** pdf-lib, sharp
- **Options:**
  - `quality`: JPEG quality 1-100 (default: 90)
  - `scale`: Scale factor for resolution (default: 2)
  - `allPages`: Convert all pages (default: false)
- **Note:** Currently creates placeholder images. For production, install pdf-poppler or pdf2pic

## Usage Example

```typescript
import { convertPdfToWord } from '@/lib/converters/pdf-to-word'

// Convert PDF to Word
const outputPath = await convertPdfToWord('/path/to/input.pdf', {
  outputDir: '/path/to/output',
  preserveFormatting: true,
})

console.log(`Converted file saved to: ${outputPath}`)
```

## API Integration

The converters are integrated with the API route at `/api/convert/route.ts`:

1. **POST /api/convert** - Submit conversion job
   - Returns job ID for tracking
   - Processes conversion asynchronously

2. **GET /api/convert?jobId=xxx** - Check job status
   - Returns status: queued, processing, completed, or failed
   - Provides download URL when completed

3. **GET /api/download/[jobId]** - Download converted file
   - Serves the converted file with appropriate content type

## Error Handling

All converters:
- Validate input file existence
- Handle errors gracefully with descriptive messages
- Log progress and errors to console
- Return absolute file paths

## Future Enhancements

### Not Yet Implemented:
- **PDF to Excel** - Extract tables from PDFs
- **Merge PDF** - Combine multiple PDFs into one
- **Split PDF** - Split PDF into multiple files

### Improvements Needed:
- **PDF to JPG**: Install pdf-poppler for actual PDF rendering instead of placeholders
- **Word to PDF**: Better formatting preservation
- **PDF to Word**: Image and table extraction

## Production Considerations

1. **Job Queue**: Replace in-memory job storage with Redis or database
2. **File Storage**: Use cloud storage (S3, GCS) instead of local filesystem
3. **Rate Limiting**: Already integrated with auth middleware
4. **Progress Updates**: Implement real-time progress using WebSockets or SSE
5. **Cleanup**: Implement automatic cleanup of temporary files
6. **Validation**: Add file size limits and format validation
7. **Security**: Scan uploads for malware before processing

## Dependencies

Ensure these packages are installed:
```bash
npm install pdf-lib pdf-parse mammoth sharp tesseract.js docx
```

## License

Part of SmartDocConverter project.
