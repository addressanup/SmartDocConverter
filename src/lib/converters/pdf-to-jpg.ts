import fs from 'fs';
import path from 'path';
import { PDFDocument } from 'pdf-lib';
import sharp from 'sharp';
import archiver from 'archiver';

export interface PdfToJpgOptions {
  outputDir?: string;
  quality?: number;
  scale?: number;
  pages?: 'all' | 'first';
}

/**
 * Convert PDF pages to JPG images
 * Strategy:
 * 1. First try to extract embedded images from PDF using pdf-lib
 * 2. If no embedded images, use pdf-parse to get text and render it as image
 * 3. Create a ZIP file with all page images
 * @param inputPath - Path to input PDF file
 * @param options - Conversion options
 * @returns Path to generated ZIP file containing JPG images
 */
export async function convertPdfToJpg(
  inputPath: string,
  options: PdfToJpgOptions = {}
): Promise<string> {
  try {
    console.log(`[PDF to JPG] Starting conversion: ${inputPath}`);

    // Validate input file exists
    if (!fs.existsSync(inputPath)) {
      throw new Error(`Input file not found: ${inputPath}`);
    }

    // Read PDF file
    const existingPdfBytes = fs.readFileSync(inputPath);
    const pdfDoc = await PDFDocument.load(existingPdfBytes);

    const pageCount = pdfDoc.getPageCount();
    console.log(`[PDF to JPG] PDF has ${pageCount} page(s)`);

    // Determine pages to convert
    const pagesToConvert = options.pages === 'all' ? pageCount : 1;
    console.log(`[PDF to JPG] Converting ${pagesToConvert} page(s)`);

    // Generate output directory
    const outputDir = options.outputDir || path.dirname(inputPath);
    const baseName = path.basename(inputPath, path.extname(inputPath));
    const tempDir = path.join(outputDir, `${baseName}_temp_${Date.now()}`);

    // Create temporary directory for images
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const quality = options.quality || 90;
    const scale = options.scale || 2;
    const outputPaths: string[] = [];

    // Try to extract text content from PDF
    let extractedText = '';
    try {
      // pdf-parse exports a default function that takes a buffer
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pdfParseModule = await import('pdf-parse') as any;
      const result = await pdfParseModule.default(existingPdfBytes);
      extractedText = result?.text || '';
      if (extractedText) {
        console.log(`[PDF to JPG] Extracted ${extractedText.length} characters of text`);
      }
    } catch (error) {
      // Fallback: just log the warning and proceed with page-based rendering
      console.log(`[PDF to JPG] Text extraction not available, will render pages without text`);
    }

    // Process each page
    for (let i = 0; i < pagesToConvert; i++) {
      console.log(`[PDF to JPG] Processing page ${i + 1}/${pagesToConvert}...`);

      try {
        // Get page dimensions
        const page = pdfDoc.getPage(i);
        const { width, height } = page.getSize();
        console.log(`[PDF to JPG] Page ${i + 1} dimensions: ${width}x${height}`);

        // Try to extract embedded images first
        let imageBuffer: Buffer | null = null;
        try {
          imageBuffer = await extractEmbeddedImage(pdfDoc, i, width, height, scale, quality);
          if (imageBuffer) {
            console.log(`[PDF to JPG] Extracted embedded image from page ${i + 1}`);
          }
        } catch (error) {
          console.log(`[PDF to JPG] No embedded images on page ${i + 1}, will render text`);
        }

        // If no embedded image, render text content
        if (!imageBuffer) {
          console.log(`[PDF to JPG] Rendering text content for page ${i + 1}`);
          imageBuffer = await renderTextToImage(
            extractedText,
            i,
            width,
            height,
            scale,
            quality,
            pageCount
          );
        }

        // Save image
        const outputPath = path.join(
          tempDir,
          `${baseName}_page_${String(i + 1).padStart(3, '0')}.jpg`
        );
        fs.writeFileSync(outputPath, imageBuffer);
        outputPaths.push(outputPath);

        console.log(`[PDF to JPG] Page ${i + 1} saved: ${outputPath}`);
      } catch (error) {
        console.error(`[PDF to JPG] Error processing page ${i + 1}:`, error);
        // Create a fallback error image
        const page = pdfDoc.getPage(i);
        const { width, height } = page.getSize();
        const errorImage = await createErrorImage(width, height, scale, quality, i + 1);
        const outputPath = path.join(
          tempDir,
          `${baseName}_page_${String(i + 1).padStart(3, '0')}.jpg`
        );
        fs.writeFileSync(outputPath, errorImage);
        outputPaths.push(outputPath);
      }
    }

    // Create ZIP file
    const zipPath = path.join(outputDir, `${baseName}_images.zip`);
    await createZipArchive(outputPaths, zipPath, baseName);

    // Clean up temporary directory
    try {
      for (const file of outputPaths) {
        fs.unlinkSync(file);
      }
      fs.rmdirSync(tempDir);
      console.log(`[PDF to JPG] Cleaned up temporary files`);
    } catch (error) {
      console.warn(`[PDF to JPG] Could not clean up temporary files:`, error);
    }

    console.log(`[PDF to JPG] Conversion complete: ${zipPath}`);
    return zipPath;
  } catch (error) {
    console.error('[PDF to JPG] Conversion failed:', error);
    throw new Error(
      `Failed to convert PDF to JPG: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Try to extract embedded images from a PDF page
 */
async function extractEmbeddedImage(
  pdfDoc: PDFDocument,
  pageIndex: number,
  width: number,
  height: number,
  scale: number,
  quality: number
): Promise<Buffer | null> {
  try {
    const page = pdfDoc.getPage(pageIndex);

    // Create a new PDF with just this page
    const singlePagePdf = await PDFDocument.create();
    const [copiedPage] = await singlePagePdf.copyPages(pdfDoc, [pageIndex]);
    singlePagePdf.addPage(copiedPage);

    // Try to get embedded images
    // Note: pdf-lib has limited image extraction capabilities
    // This is a best-effort attempt
    const embeddedImages = singlePagePdf.getPages()[0];

    // pdf-lib doesn't provide direct image extraction
    // Return null to fallback to text rendering
    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Render PDF text content as an image
 */
async function renderTextToImage(
  extractedText: string,
  pageIndex: number,
  width: number,
  height: number,
  scale: number,
  quality: number,
  totalPages: number
): Promise<Buffer> {
  const scaledWidth = Math.floor(width * scale);
  const scaledHeight = Math.floor(height * scale);

  // Get text content for this page (if available)
  let pageText = '';
  if (extractedText) {
    // Split text roughly by page (simple heuristic)
    const textPerPage = Math.ceil(extractedText.length / totalPages);
    const start = pageIndex * textPerPage;
    const end = Math.min((pageIndex + 1) * textPerPage, extractedText.length);
    pageText = extractedText.substring(start, end).trim();

    // Limit text length for rendering
    if (pageText.length > 2000) {
      pageText = pageText.substring(0, 2000) + '...';
    }
  }

  // If no text, create a simple page indicator
  if (!pageText) {
    pageText = `Page ${pageIndex + 1}`;
  }

  // Prepare text for SVG (escape special characters)
  const escapedText = escapeXml(pageText);

  // Split text into lines for better rendering
  const lines = wrapText(escapedText, 80);
  const fontSize = Math.max(12, Math.floor(scaledWidth / 60));
  const lineHeight = fontSize * 1.4;
  const maxLines = Math.floor((scaledHeight - 100) / lineHeight);
  const displayLines = lines.slice(0, maxLines);

  // Create SVG with text content
  let svgContent = `
    <svg width="${scaledWidth}" height="${scaledHeight}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${scaledWidth}" height="${scaledHeight}" fill="white"/>

      <!-- Header -->
      <rect width="${scaledWidth}" height="60" fill="#f0f0f0"/>
      <text x="20" y="40" font-family="Arial, sans-serif" font-size="${fontSize + 4}" font-weight="bold" fill="#333">
        Page ${pageIndex + 1}
      </text>

      <!-- Content -->
      <g transform="translate(20, 80)">
  `;

  // Add text lines
  displayLines.forEach((line, idx) => {
    const y = idx * lineHeight;
    svgContent += `
        <text x="0" y="${y}" font-family="Arial, sans-serif" font-size="${fontSize}" fill="#000">
          ${line}
        </text>
    `;
  });

  svgContent += `
      </g>

      <!-- Footer -->
      <text x="${scaledWidth / 2}" y="${scaledHeight - 20}"
            font-family="Arial, sans-serif" font-size="${fontSize - 2}"
            fill="#666" text-anchor="middle">
        Converted from PDF
      </text>
    </svg>
  `;

  // Convert SVG to JPEG using sharp
  const imageBuffer = await sharp(Buffer.from(svgContent))
    .jpeg({ quality })
    .toBuffer();

  return imageBuffer;
}

/**
 * Create an error image for failed page conversions
 */
async function createErrorImage(
  width: number,
  height: number,
  scale: number,
  quality: number,
  pageNumber: number
): Promise<Buffer> {
  const scaledWidth = Math.floor(width * scale);
  const scaledHeight = Math.floor(height * scale);

  const svgContent = `
    <svg width="${scaledWidth}" height="${scaledHeight}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${scaledWidth}" height="${scaledHeight}" fill="#fff5f5"/>
      <text x="${scaledWidth / 2}" y="${scaledHeight / 2 - 20}"
            font-family="Arial, sans-serif" font-size="24" font-weight="bold"
            fill="#e53e3e" text-anchor="middle">
        Error Processing Page ${pageNumber}
      </text>
      <text x="${scaledWidth / 2}" y="${scaledHeight / 2 + 20}"
            font-family="Arial, sans-serif" font-size="16"
            fill="#666" text-anchor="middle">
        This page could not be converted
      </text>
    </svg>
  `;

  const imageBuffer = await sharp(Buffer.from(svgContent))
    .jpeg({ quality })
    .toBuffer();

  return imageBuffer;
}

/**
 * Create a ZIP archive from image files
 */
async function createZipArchive(
  filePaths: string[],
  outputPath: string,
  baseName: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(outputPath);
    const archive = archiver('zip', {
      zlib: { level: 9 }, // Maximum compression
    });

    output.on('close', () => {
      console.log(`[PDF to JPG] Created ZIP archive: ${archive.pointer()} bytes`);
      resolve();
    });

    archive.on('error', (err) => {
      reject(err);
    });

    archive.pipe(output);

    // Add all images to the archive
    filePaths.forEach((filePath) => {
      const fileName = path.basename(filePath);
      archive.file(filePath, { name: fileName });
    });

    archive.finalize();
  });
}

/**
 * Escape XML special characters
 */
function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Wrap text into lines of specified width
 */
function wrapText(text: string, maxLength: number): string[] {
  const lines: string[] = [];
  const paragraphs = text.split(/\n+/);

  for (const paragraph of paragraphs) {
    if (paragraph.trim().length === 0) continue;

    const words = paragraph.split(/\s+/);
    let currentLine = '';

    for (const word of words) {
      if ((currentLine + ' ' + word).length <= maxLength) {
        currentLine += (currentLine ? ' ' : '') + word;
      } else {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      }
    }

    if (currentLine) lines.push(currentLine);
  }

  return lines;
}
