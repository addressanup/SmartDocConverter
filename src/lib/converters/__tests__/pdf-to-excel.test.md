# PDF to Excel Converter - Testing Guide

## Overview
The PDF to Excel converter extracts tables and text from PDF files and converts them to Excel (.xlsx) format.

## Function Signature
```typescript
export async function convertPdfToExcel(
  inputPath: string,
  options?: { detectTables?: boolean; outputDir?: string }
): Promise<string>
```

## Features

### 1. Table Detection
The converter automatically detects tables in PDF documents using multiple heuristics:
- **Tab separators**: Detects columns separated by tab characters
- **Multiple spaces**: Identifies columns separated by 2 or more spaces
- **Pipe separators**: Recognizes tables with pipe (|) delimiters
- **Comma separators**: Detects CSV-style tables within PDFs

### 2. Multi-page Support
- Processes PDFs with multiple pages
- Each page's content can be placed in separate sheets
- Maintains page context for tables

### 3. Smart Output Structure
- **Tables detected**: Each table becomes a separate Excel sheet named `Table_N_Page_X`
- **No tables detected**: Falls back to text extraction, creating sheets per page
- **Auto-sizing**: Columns are automatically sized based on content (max 50 chars)

### 4. Error Handling
- Validates input file existence
- Handles PDF parsing errors
- Provides detailed error messages with context
- Logs conversion progress at each step

## Usage Examples

### Basic Usage
```typescript
import { convertPdfToExcel } from '@/lib/converters/pdf-to-excel';

// Convert with default settings (table detection enabled)
const outputPath = await convertPdfToExcel('/path/to/input.pdf');
console.log('Excel file created at:', outputPath);
```

### Disable Table Detection
```typescript
// Extract all text as-is without table detection
const outputPath = await convertPdfToExcel('/path/to/input.pdf', {
  detectTables: false
});
```

### Custom Output Directory
```typescript
// Specify where to save the output file
const outputPath = await convertPdfToExcel('/path/to/input.pdf', {
  outputDir: '/path/to/output/folder'
});
```

## API Integration

The converter is integrated into the main conversion API at `/api/convert`:

```typescript
// API Request
POST /api/convert
{
  "fileId": "unique-file-id",
  "filePath": "/uploads/document.pdf",
  "conversionType": "pdf-to-excel",
  "options": {
    "detectTables": true
  }
}

// API Response
{
  "success": true,
  "jobId": "conversion-job-id",
  "status": "queued",
  "message": "Conversion job created"
}
```

## Table Detection Algorithm

The converter uses sophisticated heuristics to identify table structures:

1. **Line Analysis**: Each line is analyzed for separator patterns
2. **Cell Extraction**: Cells are extracted based on identified separators
3. **Table Continuity**: Consecutive rows with similar structure are grouped
4. **Validation**: Tables must have at least 2 rows and 2 columns

### Separator Priority
1. Pipe separators (|) - highest priority
2. Tab characters (\t)
3. Comma separators (,)
4. Multiple spaces (2+) - lowest priority

## Output Format

### With Tables Detected
```
Excel Workbook
├── Table_1_Page_1
│   ├── Header Row
│   └── Data Rows
├── Table_2_Page_1
│   └── ...
└── Table_3_Page_2
    └── ...
```

### Without Tables (Text Mode)
```
Excel Workbook
├── Page_1
│   └── Text lines as rows
├── Page_2
│   └── Text lines as rows
└── Page_N
    └── Text lines as rows
```

## Logging

The converter provides detailed console logging:

```
[PDF to Excel] Starting conversion: /path/to/file.pdf
[PDF to Excel] Parsing PDF...
[PDF to Excel] Extracted 5 pages
[PDF to Excel] Detecting tables...
[PDF to Excel] Found 3 table(s)
[PDF to Excel] Generating Excel file...
[PDF to Excel] Conversion complete: /path/to/file.xlsx
```

## Error Messages

Common errors and their meanings:

- `Input file not found`: The specified PDF file doesn't exist
- `Failed to convert PDF to Excel`: General conversion error with details
- PDF parsing errors from pdf-parse library

## Dependencies

- **xlsx**: Excel file generation
- **pdf-parse**: PDF text extraction
- **fs**: File system operations
- **path**: Path manipulation

## Performance Considerations

- Large PDFs may take longer to process
- Table detection adds minimal overhead
- Memory usage scales with PDF size and complexity
- Multi-page PDFs create multiple worksheets

## Best Practices

1. **Always enable table detection** unless you specifically need raw text
2. **Validate input files** before calling the converter
3. **Handle errors appropriately** in production code
4. **Use custom output directories** to organize converted files
5. **Clean up temporary files** after conversion completes

## Limitations

1. Complex table structures may not be perfectly detected
2. Images and graphics are not extracted
3. Formatting (fonts, colors) is not preserved
4. Merged cells in original PDFs are treated as separate cells
5. Very large PDFs may consume significant memory

## Future Enhancements

Potential improvements for future versions:
- Advanced table detection using ML
- Image extraction and embedding
- Preserve cell formatting and styles
- Support for merged cells
- Incremental processing for large files
- OCR support for scanned PDFs
