# PDF to JPG Converter

## Overview

The PDF to JPG converter transforms PDF documents into high-quality JPEG images. It extracts text content from PDFs and renders it as images, creating a ZIP archive containing all converted pages.

## Features

- ✅ Multi-page PDF support
- ✅ Text extraction and rendering
- ✅ Customizable quality and scale
- ✅ ZIP archive creation
- ✅ Comprehensive error handling
- ✅ Automatic cleanup of temporary files
- ✅ Page-by-page processing
- ✅ SVG-based text rendering

## Installation

Required dependencies (already included in package.json):

```bash
npm install pdf-lib sharp archiver pdf-parse
```

## Usage

### Basic Usage

```typescript
import { convertPdfToJpg } from '@/lib/converters/pdf-to-jpg';

// Convert first page only (default)
const outputPath = await convertPdfToJpg('document.pdf');
// Returns: path/to/document_images.zip
```

### Convert All Pages

```typescript
const outputPath = await convertPdfToJpg('document.pdf', {
  pages: 'all'
});
```

### Custom Quality and Scale

```typescript
const outputPath = await convertPdfToJpg('document.pdf', {
  pages: 'all',
  quality: 95,  // JPEG quality (0-100)
  scale: 3      // Scaling factor
});
```

### Specify Output Directory

```typescript
const outputPath = await convertPdfToJpg('document.pdf', {
  outputDir: '/path/to/output',
  pages: 'all'
});
```

## API Reference

### Function Signature

```typescript
async function convertPdfToJpg(
  inputPath: string,
  options?: PdfToJpgOptions
): Promise<string>
```

### Parameters

- `inputPath` (string, required): Path to the input PDF file
- `options` (PdfToJpgOptions, optional): Conversion options

### Options Interface

```typescript
interface PdfToJpgOptions {
  outputDir?: string;    // Output directory (default: same as input)
  quality?: number;      // JPEG quality 0-100 (default: 90)
  scale?: number;        // Scaling factor (default: 2)
  pages?: 'all' | 'first';  // Pages to convert (default: 'first')
}
```

### Return Value

Returns a Promise that resolves to a string containing the path to the generated ZIP file.

## Technical Details

### Conversion Strategy

The converter uses a multi-step approach:

1. **PDF Loading**: Uses `pdf-lib` to load and analyze the PDF
2. **Text Extraction**: Attempts to extract text using `pdf-parse`
3. **Image Rendering**: Renders text content as SVG, then converts to JPEG using `sharp`
4. **Archive Creation**: Packages all images into a ZIP file using `archiver`

### Image Generation Process

1. **Extract Page Dimensions**: Gets original PDF page size
2. **Scale Calculations**: Applies scaling factor for higher resolution
3. **SVG Creation**: Generates SVG with formatted text content
4. **JPEG Conversion**: Uses Sharp to convert SVG to JPEG
5. **File Naming**: Names files as `document_page_XXX.jpg` with zero-padding

### Text Rendering

- Text is extracted using `pdf-parse` library
- Text is split approximately by pages (heuristic distribution)
- SVG templates are used for consistent formatting
- Text is word-wrapped at 80 characters per line
- Special XML characters are properly escaped
- Font size is calculated based on page width

### Error Handling

The converter includes comprehensive error handling:

- **Missing Files**: Validates input file existence
- **Parse Errors**: Gracefully falls back if text extraction fails
- **Page Errors**: Creates error placeholder images for failed pages
- **Cleanup Errors**: Logs warnings but doesn't fail the conversion

## Examples

### Example 1: Convert Single Page

```typescript
import { convertPdfToJpg } from '@/lib/converters/pdf-to-jpg';

async function convertFirstPage() {
  try {
    const zipPath = await convertPdfToJpg('report.pdf', {
      pages: 'first',
      quality: 90,
      scale: 2
    });

    console.log(`Conversion complete: ${zipPath}`);
  } catch (error) {
    console.error('Conversion failed:', error);
  }
}
```

### Example 2: High-Quality Full Document

```typescript
async function convertHighQuality() {
  const zipPath = await convertPdfToJpg('presentation.pdf', {
    pages: 'all',
    quality: 95,
    scale: 3,
    outputDir: '/path/to/output'
  });

  console.log(`Created high-quality images: ${zipPath}`);
}
```

### Example 3: Batch Processing

```typescript
import { promises as fs } from 'fs';
import path from 'path';

async function batchConvert(inputDir: string) {
  const files = await fs.readdir(inputDir);
  const pdfFiles = files.filter(f => f.endsWith('.pdf'));

  for (const file of pdfFiles) {
    const inputPath = path.join(inputDir, file);
    console.log(`Converting ${file}...`);

    await convertPdfToJpg(inputPath, {
      pages: 'all',
      quality: 85
    });
  }
}
```

## Output Format

### ZIP Archive Structure

```
document_images.zip
├── document_page_001.jpg
├── document_page_002.jpg
├── document_page_003.jpg
└── ...
```

### File Naming Convention

- Format: `{basename}_page_{number}.jpg`
- Numbers are zero-padded to 3 digits (001, 002, etc.)
- ZIP file: `{basename}_images.zip`

## Performance Considerations

### Memory Usage

- Processes pages sequentially to manage memory
- Temporary files are created during processing
- Automatic cleanup after ZIP creation

### File Sizes

Typical file sizes (per page):

- **Quality 85, Scale 2**: ~10-15 KB per page
- **Quality 90, Scale 2**: ~12-18 KB per page
- **Quality 95, Scale 3**: ~25-35 KB per page

### Processing Time

Processing time depends on:

- Number of pages
- Quality and scale settings
- Text content complexity
- System performance

Typical: ~100-300ms per page

## Limitations

### Current Limitations

1. **Image Extraction**: Limited embedded image extraction from PDFs
2. **Text Positioning**: Simplified text layout (not exact PDF positioning)
3. **Complex Layouts**: Tables and multi-column layouts are flattened
4. **Fonts**: Uses standard Arial font for rendering

### PDF Features Not Supported

- Complex vector graphics
- Embedded multimedia
- Form fields
- Annotations and comments
- Interactive elements

## Troubleshooting

### Common Issues

#### "Input file not found"

```typescript
// Ensure file path is correct and file exists
if (!fs.existsSync(inputPath)) {
  console.error('File does not exist:', inputPath);
}
```

#### "Text extraction not available"

This warning is normal - the converter will still work, creating page indicator images.

#### Low Image Quality

```typescript
// Increase quality and scale
await convertPdfToJpg('document.pdf', {
  quality: 95,  // Higher quality
  scale: 3      // Larger image
});
```

## Integration Examples

### Next.js API Route

```typescript
// app/api/convert/pdf-to-jpg/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { convertPdfToJpg } from '@/lib/converters/pdf-to-jpg';
import { writeFile } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Save uploaded file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const uploadPath = path.join('/tmp', file.name);
    await writeFile(uploadPath, buffer);

    // Convert to JPG
    const zipPath = await convertPdfToJpg(uploadPath, {
      pages: 'all',
      quality: 90,
      scale: 2
    });

    // Return ZIP file
    const zipBuffer = await readFile(zipPath);
    return new NextResponse(zipBuffer, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${path.basename(zipPath)}"`,
      },
    });
  } catch (error) {
    console.error('Conversion error:', error);
    return NextResponse.json(
      { error: 'Conversion failed' },
      { status: 500 }
    );
  }
}
```

## Future Enhancements

Potential improvements:

- [ ] True embedded image extraction
- [ ] OCR for scanned PDFs
- [ ] Preserve original PDF layout
- [ ] Support for custom fonts
- [ ] Parallel page processing
- [ ] Progress callbacks
- [ ] Individual image output option (no ZIP)
- [ ] WebP and PNG output formats

## Related Converters

- [JPG to PDF](./jpg-to-pdf.md) - Reverse conversion
- [PDF to Word](./pdf-to-word.md) - Extract editable text
- [Compress PDF](./compress-pdf.md) - Reduce PDF file size

## Support

For issues or questions:
- Check the [troubleshooting section](#troubleshooting)
- Review the [examples](#examples)
- Consult the [API reference](#api-reference)
