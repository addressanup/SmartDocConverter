import fs from 'fs';
import path from 'path';
import * as XLSX from 'xlsx';

// Dynamic import for pdf-parse due to ESM/CommonJS compatibility
const pdfParse = require('pdf-parse');

export interface PdfToExcelOptions {
  outputDir?: string;
  detectTables?: boolean;
}

interface TableCell {
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface DetectedTable {
  rows: string[][];
  pageNumber: number;
}

/**
 * Convert PDF to Excel by extracting tables and text content
 * @param inputPath - Path to input PDF file
 * @param options - Conversion options
 * @returns Path to generated Excel file
 */
export async function convertPdfToExcel(
  inputPath: string,
  options: PdfToExcelOptions = {}
): Promise<string> {
  try {
    console.log(`[PDF to Excel] Starting conversion: ${inputPath}`);

    // Validate input file exists
    if (!fs.existsSync(inputPath)) {
      throw new Error(`Input file not found: ${inputPath}`);
    }

    // Read PDF file
    const dataBuffer = fs.readFileSync(inputPath);

    // Extract text from PDF
    console.log('[PDF to Excel] Parsing PDF...');
    const pdfData = await pdfParse(dataBuffer, {
      // Get page-by-page text for better table detection
      pagerender: options.detectTables !== false ? renderPage : undefined,
    });

    console.log(`[PDF to Excel] Extracted ${pdfData.numpages} pages`);

    // Create workbook
    const workbook = XLSX.utils.book_new();

    if (options.detectTables !== false) {
      // Try to detect and extract tables
      console.log('[PDF to Excel] Detecting tables...');
      const tables = detectTablesFromText(pdfData.text, pdfData.numpages);

      if (tables.length > 0) {
        console.log(`[PDF to Excel] Found ${tables.length} table(s)`);

        // Add each table as a separate sheet
        tables.forEach((table, index) => {
          const sheetName = tables.length === 1
            ? 'Data'
            : `Table_${index + 1}_Page_${table.pageNumber}`;

          const worksheet = XLSX.utils.aoa_to_sheet(table.rows);

          // Auto-size columns
          const colWidths = calculateColumnWidths(table.rows);
          worksheet['!cols'] = colWidths;

          XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
        });
      } else {
        console.log('[PDF to Excel] No tables detected, extracting as text');
        // Fallback to text extraction
        addTextToWorkbook(workbook, pdfData.text, pdfData.numpages);
      }
    } else {
      // Just extract text content
      console.log('[PDF to Excel] Extracting text content');
      addTextToWorkbook(workbook, pdfData.text, pdfData.numpages);
    }

    // Generate output path
    const outputDir = options.outputDir || path.dirname(inputPath);
    const baseName = path.basename(inputPath, path.extname(inputPath));
    const outputPath = path.join(outputDir, `${baseName}.xlsx`);

    // Ensure output directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Write Excel file
    console.log('[PDF to Excel] Generating Excel file...');
    XLSX.writeFile(workbook, outputPath);

    console.log(`[PDF to Excel] Conversion complete: ${outputPath}`);
    return outputPath;
  } catch (error) {
    console.error('[PDF to Excel] Conversion failed:', error);
    throw new Error(`Failed to convert PDF to Excel: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Custom page render function for better text extraction
 */
async function renderPage(pageData: any) {
  // Render page with text items
  const render_options = {
    normalizeWhitespace: false,
    disableCombineTextItems: false,
  };

  return pageData.getTextContent(render_options).then((textContent: any) => {
    let lastY = -1;
    let text = '';

    for (const item of textContent.items) {
      // Add newline if Y position changed significantly
      if (lastY !== -1 && Math.abs(lastY - item.transform[5]) > 5) {
        text += '\n';
      }
      text += item.str;
      lastY = item.transform[5];
    }

    return text;
  });
}

/**
 * Detect tables from extracted text using heuristics
 */
function detectTablesFromText(text: string, numPages: number): DetectedTable[] {
  const tables: DetectedTable[] = [];
  const lines = text.split('\n');

  let currentTable: string[][] = [];
  let tableStarted = false;
  let currentPage = 1;
  const linesPerPage = Math.ceil(lines.length / numPages);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const linePageNumber = Math.floor(i / linesPerPage) + 1;

    // Skip empty lines
    if (!line) {
      if (tableStarted && currentTable.length > 0) {
        // End of table
        tables.push({
          rows: currentTable,
          pageNumber: currentPage,
        });
        currentTable = [];
        tableStarted = false;
      }
      continue;
    }

    // Detect if line looks like a table row
    // Heuristics: contains multiple separators (tabs, multiple spaces, pipes)
    const hasTabSeparators = line.includes('\t');
    const hasMultipleSpaces = /\s{2,}/.test(line);
    const hasPipeSeparators = /\|/.test(line);
    const hasCommaSeparators = line.split(',').length > 2;

    if (hasTabSeparators || hasMultipleSpaces || hasPipeSeparators || hasCommaSeparators) {
      if (!tableStarted) {
        tableStarted = true;
        currentPage = linePageNumber;
      }

      // Parse row based on detected separator
      let cells: string[];

      if (hasPipeSeparators) {
        cells = line.split('|')
          .map(cell => cell.trim())
          .filter(cell => cell.length > 0);
      } else if (hasTabSeparators) {
        cells = line.split('\t')
          .map(cell => cell.trim())
          .filter(cell => cell.length > 0);
      } else if (hasCommaSeparators && !hasMultipleSpaces) {
        cells = line.split(',')
          .map(cell => cell.trim())
          .filter(cell => cell.length > 0);
      } else {
        // Split by multiple spaces (2 or more)
        cells = line.split(/\s{2,}/)
          .map(cell => cell.trim())
          .filter(cell => cell.length > 0);
      }

      // Only consider it a table row if it has at least 2 cells
      if (cells.length >= 2) {
        currentTable.push(cells);
      } else if (tableStarted && currentTable.length > 0) {
        // End current table if row doesn't match pattern
        tables.push({
          rows: currentTable,
          pageNumber: currentPage,
        });
        currentTable = [];
        tableStarted = false;
      }
    } else if (tableStarted && currentTable.length > 0) {
      // End current table if we hit a non-table line
      tables.push({
        rows: currentTable,
        pageNumber: currentPage,
      });
      currentTable = [];
      tableStarted = false;
    }
  }

  // Add any remaining table
  if (currentTable.length > 0) {
    tables.push({
      rows: currentTable,
      pageNumber: currentPage,
    });
  }

  // Filter out tables with less than 2 rows (header + at least one data row)
  return tables.filter(table => table.rows.length >= 2);
}

/**
 * Add text content to workbook when no tables are detected
 */
function addTextToWorkbook(workbook: XLSX.WorkBook, text: string, numPages: number) {
  const lines = text.split('\n').filter(line => line.trim().length > 0);

  if (numPages > 1) {
    // Split content by pages
    const linesPerPage = Math.ceil(lines.length / numPages);

    for (let page = 0; page < numPages; page++) {
      const startIdx = page * linesPerPage;
      const endIdx = Math.min(startIdx + linesPerPage, lines.length);
      const pageLines = lines.slice(startIdx, endIdx);

      if (pageLines.length > 0) {
        const data = pageLines.map(line => [line]);
        const worksheet = XLSX.utils.aoa_to_sheet(data);

        // Set column width
        worksheet['!cols'] = [{ wch: 100 }];

        XLSX.utils.book_append_sheet(workbook, worksheet, `Page_${page + 1}`);
      }
    }
  } else {
    // Single sheet for single page or combined content
    const data = lines.map(line => [line]);
    const worksheet = XLSX.utils.aoa_to_sheet(data);

    // Set column width
    worksheet['!cols'] = [{ wch: 100 }];

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Content');
  }
}

/**
 * Calculate optimal column widths based on content
 */
function calculateColumnWidths(rows: string[][]): { wch: number }[] {
  if (rows.length === 0) return [];

  const maxCols = Math.max(...rows.map(row => row.length));
  const widths: number[] = new Array(maxCols).fill(10);

  rows.forEach(row => {
    row.forEach((cell, colIdx) => {
      const cellLength = cell.toString().length;
      widths[colIdx] = Math.max(widths[colIdx], Math.min(cellLength + 2, 50));
    });
  });

  return widths.map(w => ({ wch: w }));
}
