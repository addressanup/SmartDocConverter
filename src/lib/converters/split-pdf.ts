import fs from 'fs';
import path from 'path';
import { PDFDocument } from 'pdf-lib';
import archiver from 'archiver';

export interface SplitPdfOptions {
  outputDir?: string;
  mode?: 'all' | 'range' | 'every';  // all=each page, range=specific pages, every=every N pages
  pages?: string;  // e.g., "1-3,5,7-10"
  everyN?: number;  // split every N pages
}

/**
 * Split PDF into multiple files based on specified mode
 * @param inputPath - Path to input PDF file
 * @param options - Split options
 * @returns Path to ZIP file containing split PDFs
 */
export async function splitPdf(
  inputPath: string,
  options: SplitPdfOptions = {}
): Promise<string> {
  try {
    console.log(`[Split PDF] Starting split operation: ${inputPath}`);
    console.log(`[Split PDF] Mode: ${options.mode || 'all'}`, options);

    // Read PDF file
    const existingPdfBytes = fs.readFileSync(inputPath);
    const pdfDoc = await PDFDocument.load(existingPdfBytes);

    const pageCount = pdfDoc.getPageCount();
    console.log(`[Split PDF] PDF has ${pageCount} page(s)`);

    // Validate and parse split configuration
    const mode = options.mode || 'all';
    const splitRanges = parseSplitRanges(mode, pageCount, options);

    console.log(`[Split PDF] Will create ${splitRanges.length} split PDF file(s)`);

    // Generate output directory
    const outputDir = options.outputDir || path.dirname(inputPath);
    const baseName = path.basename(inputPath, path.extname(inputPath));
    const tempDir = path.join(outputDir, `${baseName}_split_${Date.now()}`);

    // Create temporary directory for split PDFs
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    console.log(`[Split PDF] Temporary directory: ${tempDir}`);

    // Create split PDFs
    const splitFiles: string[] = [];
    for (let i = 0; i < splitRanges.length; i++) {
      const range = splitRanges[i];
      console.log(`[Split PDF] Creating split ${i + 1}/${splitRanges.length}: pages ${range.start + 1}-${range.end + 1}`);

      // Create new PDF document
      const newPdf = await PDFDocument.create();

      // Copy pages to new document
      const pagesToCopy = [];
      for (let pageIdx = range.start; pageIdx <= range.end; pageIdx++) {
        pagesToCopy.push(pageIdx);
      }

      const copiedPages = await newPdf.copyPages(pdfDoc, pagesToCopy);
      copiedPages.forEach((page) => {
        newPdf.addPage(page);
      });

      // Generate filename for this split
      const splitFileName = generateSplitFileName(baseName, range, splitRanges.length, i);
      const splitFilePath = path.join(tempDir, splitFileName);

      // Save split PDF
      const pdfBytes = await newPdf.save();
      fs.writeFileSync(splitFilePath, pdfBytes);
      splitFiles.push(splitFilePath);

      console.log(`[Split PDF] Created: ${splitFileName} (${pdfBytes.length} bytes)`);
    }

    // Create ZIP archive
    const zipPath = path.join(outputDir, `${baseName}_split.zip`);
    await createZipArchive(splitFiles, zipPath, tempDir);

    // Clean up temporary directory
    console.log(`[Split PDF] Cleaning up temporary directory...`);
    fs.rmSync(tempDir, { recursive: true, force: true });

    console.log(`[Split PDF] Split complete: ${zipPath}`);
    console.log(`[Split PDF] Created ${splitFiles.length} PDF file(s) in ZIP archive`);

    return zipPath;
  } catch (error) {
    console.error('[Split PDF] Split operation failed:', error);
    throw new Error(`Failed to split PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Parse split configuration into page ranges
 */
function parseSplitRanges(
  mode: string,
  pageCount: number,
  options: SplitPdfOptions
): Array<{ start: number; end: number }> {
  const ranges: Array<{ start: number; end: number }> = [];

  switch (mode) {
    case 'all':
      // Split into individual pages
      for (let i = 0; i < pageCount; i++) {
        ranges.push({ start: i, end: i });
      }
      break;

    case 'range':
      // Parse page ranges like "1-3,5,7-10"
      if (!options.pages) {
        throw new Error('pages option is required for range mode');
      }

      const pageRanges = options.pages.split(',').map(s => s.trim());

      for (const rangeStr of pageRanges) {
        if (rangeStr.includes('-')) {
          // Range like "1-3"
          const [startStr, endStr] = rangeStr.split('-').map(s => s.trim());
          const start = parseInt(startStr, 10) - 1; // Convert to 0-based
          const end = parseInt(endStr, 10) - 1;

          if (isNaN(start) || isNaN(end)) {
            throw new Error(`Invalid page range: ${rangeStr}`);
          }

          if (start < 0 || end >= pageCount || start > end) {
            throw new Error(`Page range ${rangeStr} is out of bounds (PDF has ${pageCount} pages)`);
          }

          ranges.push({ start, end });
        } else {
          // Single page like "5"
          const pageNum = parseInt(rangeStr, 10) - 1; // Convert to 0-based

          if (isNaN(pageNum)) {
            throw new Error(`Invalid page number: ${rangeStr}`);
          }

          if (pageNum < 0 || pageNum >= pageCount) {
            throw new Error(`Page ${rangeStr} is out of bounds (PDF has ${pageCount} pages)`);
          }

          ranges.push({ start: pageNum, end: pageNum });
        }
      }
      break;

    case 'every':
      // Split every N pages
      if (!options.everyN || options.everyN < 1) {
        throw new Error('everyN option must be a positive number for every mode');
      }

      const n = options.everyN;
      for (let i = 0; i < pageCount; i += n) {
        const start = i;
        const end = Math.min(i + n - 1, pageCount - 1);
        ranges.push({ start, end });
      }
      break;

    default:
      throw new Error(`Unsupported split mode: ${mode}`);
  }

  if (ranges.length === 0) {
    throw new Error('No pages to split');
  }

  return ranges;
}

/**
 * Generate filename for split PDF
 */
function generateSplitFileName(
  baseName: string,
  range: { start: number; end: number },
  totalSplits: number,
  index: number
): string {
  if (range.start === range.end) {
    // Single page
    const pageNum = range.start + 1; // Convert to 1-based
    const paddedIndex = String(index + 1).padStart(String(totalSplits).length, '0');
    return `${baseName}_page_${pageNum}_${paddedIndex}.pdf`;
  } else {
    // Range of pages
    const startPage = range.start + 1; // Convert to 1-based
    const endPage = range.end + 1;
    const paddedIndex = String(index + 1).padStart(String(totalSplits).length, '0');
    return `${baseName}_pages_${startPage}-${endPage}_${paddedIndex}.pdf`;
  }
}

/**
 * Create ZIP archive from files
 */
async function createZipArchive(
  files: string[],
  outputPath: string,
  baseDir: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    console.log(`[Split PDF] Creating ZIP archive: ${outputPath}`);

    const output = fs.createWriteStream(outputPath);
    const archive = archiver('zip', {
      zlib: { level: 9 } // Maximum compression
    });

    output.on('close', () => {
      console.log(`[Split PDF] ZIP archive created: ${archive.pointer()} bytes`);
      resolve();
    });

    archive.on('error', (err: Error) => {
      console.error('[Split PDF] Archive error:', err);
      reject(err);
    });

    output.on('error', (err: Error) => {
      console.error('[Split PDF] Output stream error:', err);
      reject(err);
    });

    archive.pipe(output);

    // Add files to archive
    for (const file of files) {
      const fileName = path.basename(file);
      archive.file(file, { name: fileName });
      console.log(`[Split PDF] Added to archive: ${fileName}`);
    }

    archive.finalize();
  });
}
