import fs from 'fs';
import path from 'path';
import * as XLSX from 'xlsx';
import { parsePdf } from '../pdf-parse';

export interface PdfToExcelOptions {
  outputDir?: string;
  detectTables?: boolean;
  splitByPage?: boolean;
}

interface TableRow {
  cells: string[];
  y: number;
}

interface DetectedTable {
  rows: string[][];
  pageNumber: number;
  confidence: number;
}

/**
 * Convert PDF to Excel with advanced table detection
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

    if (!fs.existsSync(inputPath)) {
      throw new Error(`Input file not found: ${inputPath}`);
    }

    const dataBuffer = fs.readFileSync(inputPath);

    console.log('[PDF to Excel] Parsing PDF...');
    const pdfData = await parsePdf(dataBuffer);

    console.log(`[PDF to Excel] Extracted ${pdfData.numpages} pages, ${pdfData.text.length} characters`);

    // Create workbook
    const workbook = XLSX.utils.book_new();

    // Detect and extract tables
    const detectTables = options.detectTables !== false;
    
    if (detectTables) {
      console.log('[PDF to Excel] Detecting tables...');
      const tables = detectTablesAdvanced(pdfData.text, pdfData.numpages);

      if (tables.length > 0) {
        console.log(`[PDF to Excel] Found ${tables.length} table(s)`);

        tables.forEach((table, index) => {
          const sheetName = sanitizeSheetName(
            tables.length === 1 
              ? 'Data' 
              : `Table_${index + 1}_Page_${table.pageNumber}`
          );

          const worksheet = XLSX.utils.aoa_to_sheet(table.rows);
          
          // Apply column widths
          worksheet['!cols'] = calculateColumnWidths(table.rows);
          
          // Apply header styling (freeze first row)
          worksheet['!freeze'] = { xSplit: 0, ySplit: 1 };

          XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
        });
      } else {
        console.log('[PDF to Excel] No tables detected, extracting as structured text');
        addStructuredTextToWorkbook(workbook, pdfData.text, pdfData.numpages, options.splitByPage);
      }
    } else {
      console.log('[PDF to Excel] Extracting text content');
      addStructuredTextToWorkbook(workbook, pdfData.text, pdfData.numpages, options.splitByPage);
    }

    // Generate output path
    const outputDir = options.outputDir || path.dirname(inputPath);
    const baseName = path.basename(inputPath, path.extname(inputPath));
    const outputPath = path.join(outputDir, `${baseName}.xlsx`);

    // Ensure output directory exists
    fs.mkdirSync(outputDir, { recursive: true });

    console.log('[PDF to Excel] Generating Excel file...');
    XLSX.writeFile(workbook, outputPath);

    // Write preview data for frontend
    const previewData = getPreviewData(workbook);
    if (previewData) {
      const previewPath = outputPath + '.preview.json';
      fs.writeFileSync(previewPath, JSON.stringify(previewData));
    }

    console.log(`[PDF to Excel] Conversion complete: ${outputPath}`);
    return outputPath;
  } catch (error) {
    console.error('[PDF to Excel] Conversion failed:', error);
    throw new Error(`Failed to convert PDF to Excel: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Advanced table detection using multiple heuristics
 */
function detectTablesAdvanced(text: string, numPages: number): DetectedTable[] {
  const tables: DetectedTable[] = [];
  const lines = text.split('\n');
  
  let currentTable: TableRow[] = [];
  let tableStarted = false;
  let currentPage = 1;
  let expectedColumns = 0;
  const linesPerPage = Math.ceil(lines.length / numPages);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const linePageNumber = Math.floor(i / linesPerPage) + 1;

    if (!line) {
      if (tableStarted && currentTable.length >= 2) {
        // Finalize table
        const tableRows = normalizeTable(currentTable, expectedColumns);
        if (tableRows.length >= 2) {
          tables.push({
            rows: tableRows,
            pageNumber: currentPage,
            confidence: calculateTableConfidence(tableRows),
          });
        }
      }
      currentTable = [];
      tableStarted = false;
      expectedColumns = 0;
      continue;
    }

    // Detect potential table row
    const rowData = parseTableRow(line);
    
    if (rowData.cells.length >= 2) {
      if (!tableStarted) {
        tableStarted = true;
        currentPage = linePageNumber;
        expectedColumns = rowData.cells.length;
      }
      
      // Check if column count is consistent (allow some variation)
      const columnDiff = Math.abs(rowData.cells.length - expectedColumns);
      if (columnDiff <= 2) {
        currentTable.push(rowData);
        expectedColumns = Math.max(expectedColumns, rowData.cells.length);
      } else if (currentTable.length >= 2) {
        // Column count changed significantly - end current table
        const tableRows = normalizeTable(currentTable, expectedColumns);
        if (tableRows.length >= 2) {
          tables.push({
            rows: tableRows,
            pageNumber: currentPage,
            confidence: calculateTableConfidence(tableRows),
          });
        }
        currentTable = [rowData];
        expectedColumns = rowData.cells.length;
        currentPage = linePageNumber;
      }
    } else if (tableStarted && currentTable.length >= 2) {
      // Non-table line - finalize current table
      const tableRows = normalizeTable(currentTable, expectedColumns);
      if (tableRows.length >= 2) {
        tables.push({
          rows: tableRows,
          pageNumber: currentPage,
          confidence: calculateTableConfidence(tableRows),
        });
      }
      currentTable = [];
      tableStarted = false;
      expectedColumns = 0;
    }
  }

  // Finalize last table
  if (currentTable.length >= 2) {
    const tableRows = normalizeTable(currentTable, expectedColumns);
    if (tableRows.length >= 2) {
      tables.push({
        rows: tableRows,
        pageNumber: currentPage,
        confidence: calculateTableConfidence(tableRows),
      });
    }
  }

  // Filter by confidence and merge adjacent tables
  return tables
    .filter(t => t.confidence >= 0.5)
    .sort((a, b) => b.confidence - a.confidence);
}

/**
 * Parse a line into table cells
 */
function parseTableRow(line: string): TableRow {
  let cells: string[];

  // Try different separators in order of likelihood
  if (line.includes('\t')) {
    cells = line.split('\t').map(c => c.trim());
  } else if (line.includes('|')) {
    cells = line.split('|').map(c => c.trim()).filter(c => c.length > 0);
  } else if (line.includes(';')) {
    cells = line.split(';').map(c => c.trim());
  } else if (/\s{3,}/.test(line)) {
    // Multiple spaces as separator
    cells = line.split(/\s{3,}/).map(c => c.trim());
  } else if (line.includes(',') && countOccurrences(line, ',') >= 2) {
    // CSV-style
    cells = parseCSVLine(line);
  } else {
    // Try to split by 2+ spaces
    cells = line.split(/\s{2,}/).map(c => c.trim()).filter(c => c.length > 0);
  }

  return {
    cells: cells.filter(c => c.length > 0),
    y: 0,
  };
}

/**
 * Parse CSV-style line handling quoted values
 */
function parseCSVLine(line: string): string[] {
  const cells: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      cells.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  if (current) {
    cells.push(current.trim());
  }

  return cells;
}

/**
 * Count occurrences of a character in a string
 */
function countOccurrences(str: string, char: string): number {
  return str.split(char).length - 1;
}

/**
 * Normalize table rows to have consistent column count
 */
function normalizeTable(rows: TableRow[], expectedColumns: number): string[][] {
  return rows.map(row => {
    const cells = [...row.cells];
    while (cells.length < expectedColumns) {
      cells.push('');
    }
    return cells.slice(0, expectedColumns);
  });
}

/**
 * Calculate confidence score for a detected table
 */
function calculateTableConfidence(rows: string[][]): number {
  if (rows.length < 2) return 0;
  
  let score = 0;
  const columnCount = rows[0].length;
  
  // Consistent column count
  const consistentRows = rows.filter(r => r.length === columnCount).length;
  score += (consistentRows / rows.length) * 0.3;
  
  // Header row detection (first row has different characteristics)
  const firstRow = rows[0];
  const dataRows = rows.slice(1);
  
  const headerScore = firstRow.every(cell => 
    /^[A-Za-z\s]+$/.test(cell) || cell.length < 20
  ) ? 0.2 : 0;
  score += headerScore;
  
  // Data consistency (numbers, dates, etc.)
  let numericCells = 0;
  let totalCells = 0;
  
  for (const row of dataRows) {
    for (const cell of row) {
      if (cell) {
        totalCells++;
        if (/^[\d,.$€£¥%-]+$/.test(cell.trim())) {
          numericCells++;
        }
      }
    }
  }
  
  if (totalCells > 0) {
    score += (numericCells / totalCells) * 0.3;
  }
  
  // Row count bonus
  score += Math.min(rows.length / 20, 0.2);
  
  return Math.min(score, 1);
}

/**
 * Add structured text to workbook when no tables detected
 */
function addStructuredTextToWorkbook(
  workbook: XLSX.WorkBook,
  text: string,
  numPages: number,
  splitByPage?: boolean
) {
  const lines = text.split('\n').filter(line => line.trim().length > 0);

  if (splitByPage && numPages > 1) {
    const linesPerPage = Math.ceil(lines.length / numPages);

    for (let page = 0; page < numPages; page++) {
      const startIdx = page * linesPerPage;
      const endIdx = Math.min(startIdx + linesPerPage, lines.length);
      const pageLines = lines.slice(startIdx, endIdx);

      if (pageLines.length > 0) {
        const data = pageLines.map(line => [line.trim()]);
        const worksheet = XLSX.utils.aoa_to_sheet(data);
        worksheet['!cols'] = [{ wch: 100 }];

        XLSX.utils.book_append_sheet(workbook, worksheet, `Page_${page + 1}`);
      }
    }
  } else {
    const data = lines.map(line => [line.trim()]);
    const worksheet = XLSX.utils.aoa_to_sheet(data);
    worksheet['!cols'] = [{ wch: 100 }];

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Content');
  }
}

/**
 * Calculate optimal column widths
 */
function calculateColumnWidths(rows: string[][]): { wch: number }[] {
  if (rows.length === 0) return [];

  const maxCols = Math.max(...rows.map(row => row.length));
  const widths: number[] = new Array(maxCols).fill(10);

  rows.forEach(row => {
    row.forEach((cell, colIdx) => {
      const cellLength = String(cell).length;
      widths[colIdx] = Math.max(widths[colIdx], Math.min(cellLength + 2, 50));
    });
  });

  return widths.map(w => ({ wch: w }));
}

/**
 * Sanitize sheet name for Excel compatibility
 */
function sanitizeSheetName(name: string): string {
  return name
    .replace(/[\\/*?:\[\]]/g, '_')
    .substring(0, 31);
}

/**
 * Get preview data for the first sheet
 */
function getPreviewData(workbook: XLSX.WorkBook): { headers: string[]; rows: string[][] } | null {
  const sheetNames = workbook.SheetNames;
  if (sheetNames.length === 0) return null;

  const sheet = workbook.Sheets[sheetNames[0]];
  const data = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1 });
  
  if (data.length === 0) return null;

  return {
    headers: (data[0] as string[]) || [],
    rows: data.slice(1, 6) as string[][],
  };
}

/**
 * Get Excel preview data if available
 */
export function getExcelPreviewData(outputPath: string): { headers: string[]; rows: string[][] } | null {
  const previewPath = outputPath + '.preview.json';
  
  try {
    if (fs.existsSync(previewPath)) {
      const data = JSON.parse(fs.readFileSync(previewPath, 'utf-8'));
      fs.unlinkSync(previewPath);
      return data;
    }
  } catch (e) {
    // Ignore errors
  }
  
  return null;
}
