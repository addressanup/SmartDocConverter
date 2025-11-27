import fs from 'fs';
import path from 'path';
import mammoth from 'mammoth';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export interface WordToPdfOptions {
  outputDir?: string;
  fontSize?: number;
  pageMargin?: number;
}

/**
 * Convert DOCX to PDF by extracting text and creating a PDF
 * @param inputPath - Path to input DOCX file
 * @param options - Conversion options
 * @returns Path to generated PDF file
 */
export async function convertWordToPdf(
  inputPath: string,
  options: WordToPdfOptions = {}
): Promise<string> {
  try {
    console.log(`[Word to PDF] Starting conversion: ${inputPath}`);

    // Read DOCX file
    const dataBuffer = fs.readFileSync(inputPath);

    // Extract text from DOCX
    console.log('[Word to PDF] Extracting text from DOCX...');
    const result = await mammoth.extractRawText({ buffer: dataBuffer });
    const text = result.value;

    if (result.messages.length > 0) {
      console.log('[Word to PDF] Warnings:', result.messages);
    }

    console.log(`[Word to PDF] Extracted ${text.length} characters`);

    // Create PDF document
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontSize = options.fontSize || 12;
    const pageMargin = options.pageMargin || 50;
    const lineHeight = fontSize * 1.2;

    // Page dimensions
    const pageWidth = 595; // A4 width in points
    const pageHeight = 842; // A4 height in points
    const maxWidth = pageWidth - (pageMargin * 2);
    const maxHeight = pageHeight - (pageMargin * 2);

    let page = pdfDoc.addPage([pageWidth, pageHeight]);
    let yPosition = pageHeight - pageMargin;

    // Split text into lines that fit the page width
    const paragraphs = text.split('\n');

    for (const paragraph of paragraphs) {
      if (paragraph.trim().length === 0) {
        // Add extra space for empty paragraphs
        yPosition -= lineHeight;
        if (yPosition < pageMargin) {
          page = pdfDoc.addPage([pageWidth, pageHeight]);
          yPosition = pageHeight - pageMargin;
        }
        continue;
      }

      const words = paragraph.split(' ');
      let currentLine = '';

      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const textWidth = font.widthOfTextAtSize(testLine, fontSize);

        if (textWidth > maxWidth && currentLine) {
          // Draw current line
          page.drawText(currentLine, {
            x: pageMargin,
            y: yPosition,
            size: fontSize,
            font: font,
            color: rgb(0, 0, 0),
          });

          yPosition -= lineHeight;
          currentLine = word;

          // Check if we need a new page
          if (yPosition < pageMargin) {
            page = pdfDoc.addPage([pageWidth, pageHeight]);
            yPosition = pageHeight - pageMargin;
          }
        } else {
          currentLine = testLine;
        }
      }

      // Draw remaining text in line
      if (currentLine) {
        page.drawText(currentLine, {
          x: pageMargin,
          y: yPosition,
          size: fontSize,
          font: font,
          color: rgb(0, 0, 0),
        });

        yPosition -= lineHeight;

        // Check if we need a new page
        if (yPosition < pageMargin) {
          page = pdfDoc.addPage([pageWidth, pageHeight]);
          yPosition = pageHeight - pageMargin;
        }
      }
    }

    // Generate output path
    const outputDir = options.outputDir || path.dirname(inputPath);
    const baseName = path.basename(inputPath, path.extname(inputPath));
    const outputPath = path.join(outputDir, `${baseName}.pdf`);

    // Save PDF
    console.log('[Word to PDF] Generating PDF...');
    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync(outputPath, pdfBytes);

    console.log(`[Word to PDF] Conversion complete: ${outputPath}`);
    return outputPath;
  } catch (error) {
    console.error('[Word to PDF] Conversion failed:', error);
    throw new Error(`Failed to convert Word to PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
