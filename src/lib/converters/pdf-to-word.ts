import fs from 'fs';
import path from 'path';
import { Document, Packer, Paragraph, TextRun } from 'docx';

// Dynamic import for pdf-parse due to ESM/CommonJS compatibility
const pdfParse = require('pdf-parse');

export interface PdfToWordOptions {
  outputDir?: string;
  preserveFormatting?: boolean;
}

/**
 * Convert PDF to DOCX by extracting text content
 * @param inputPath - Path to input PDF file
 * @param options - Conversion options
 * @returns Path to generated DOCX file
 */
export async function convertPdfToWord(
  inputPath: string,
  options: PdfToWordOptions = {}
): Promise<string> {
  try {
    console.log(`[PDF to Word] Starting conversion: ${inputPath}`);

    // Read PDF file
    const dataBuffer = fs.readFileSync(inputPath);

    // Extract text from PDF
    console.log('[PDF to Word] Parsing PDF...');
    const pdfData = await pdfParse(dataBuffer);

    console.log(`[PDF to Word] Extracted ${pdfData.numpages} pages`);

    // Split text into paragraphs
    const paragraphs = pdfData.text
      .split('\n')
      .filter((line: string) => line.trim().length > 0)
      .map((line: string) => new Paragraph({
        children: [new TextRun(line.trim())],
        spacing: {
          after: 200,
        },
      }));

    // Create Word document
    const doc = new Document({
      sections: [{
        properties: {},
        children: paragraphs.length > 0 ? paragraphs : [
          new Paragraph({
            children: [new TextRun('No text content found in PDF')],
          }),
        ],
      }],
    });

    // Generate output path
    const outputDir = options.outputDir || path.dirname(inputPath);
    const baseName = path.basename(inputPath, path.extname(inputPath));
    const outputPath = path.join(outputDir, `${baseName}.docx`);

    // Write DOCX file
    console.log('[PDF to Word] Generating DOCX...');
    const buffer = await Packer.toBuffer(doc);
    fs.writeFileSync(outputPath, buffer);

    console.log(`[PDF to Word] Conversion complete: ${outputPath}`);
    return outputPath;
  } catch (error) {
    console.error('[PDF to Word] Conversion failed:', error);
    throw new Error(`Failed to convert PDF to Word: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
