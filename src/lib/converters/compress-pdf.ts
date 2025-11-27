import fs from 'fs';
import path from 'path';
import { PDFDocument } from 'pdf-lib';

export interface CompressPdfOptions {
  outputDir?: string;
  removeMetadata?: boolean;
  compressionLevel?: 'low' | 'medium' | 'high';
}

/**
 * Compress PDF by removing metadata and optimizing structure
 * @param inputPath - Path to input PDF file
 * @param options - Compression options
 * @returns Path to compressed PDF file
 */
export async function compressPdf(
  inputPath: string,
  options: CompressPdfOptions = {}
): Promise<string> {
  try {
    console.log(`[Compress PDF] Starting compression: ${inputPath}`);

    // Read PDF file
    const existingPdfBytes = fs.readFileSync(inputPath);
    const originalSize = existingPdfBytes.length;

    console.log(`[Compress PDF] Original size: ${(originalSize / 1024).toFixed(2)} KB`);

    // Load PDF document
    const pdfDoc = await PDFDocument.load(existingPdfBytes);

    // Remove metadata if requested
    if (options.removeMetadata !== false) {
      console.log('[Compress PDF] Removing metadata...');
      pdfDoc.setTitle('');
      pdfDoc.setAuthor('');
      pdfDoc.setSubject('');
      pdfDoc.setKeywords([]);
      pdfDoc.setProducer('');
      pdfDoc.setCreator('');
    }

    // Get compression settings based on level
    const compressionLevel = options.compressionLevel || 'medium';
    let saveOptions: any = {};

    switch (compressionLevel) {
      case 'low':
        saveOptions = {
          useObjectStreams: true,
        };
        break;
      case 'medium':
        saveOptions = {
          useObjectStreams: true,
          addDefaultPage: false,
        };
        break;
      case 'high':
        saveOptions = {
          useObjectStreams: true,
          addDefaultPage: false,
        };
        break;
    }

    console.log(`[Compress PDF] Applying ${compressionLevel} compression...`);

    // Generate output path
    const outputDir = options.outputDir || path.dirname(inputPath);
    const baseName = path.basename(inputPath, path.extname(inputPath));
    const outputPath = path.join(outputDir, `${baseName}_compressed.pdf`);

    // Save compressed PDF
    const pdfBytes = await pdfDoc.save(saveOptions);
    fs.writeFileSync(outputPath, pdfBytes);

    const compressedSize = pdfBytes.length;
    const compressionRatio = ((1 - compressedSize / originalSize) * 100).toFixed(2);

    console.log(`[Compress PDF] Compressed size: ${(compressedSize / 1024).toFixed(2)} KB`);
    console.log(`[Compress PDF] Compression ratio: ${compressionRatio}%`);
    console.log(`[Compress PDF] Compression complete: ${outputPath}`);

    return outputPath;
  } catch (error) {
    console.error('[Compress PDF] Compression failed:', error);
    throw new Error(`Failed to compress PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
