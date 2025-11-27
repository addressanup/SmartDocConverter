import fs from 'fs';
import path from 'path';
import { PDFDocument } from 'pdf-lib';

export interface UnlockPdfOptions {
  outputDir?: string;
  password?: string;
}

/**
 * Unlock a password-protected PDF by removing password protection
 * @param inputPath - Path to input PDF file
 * @param options - Unlock options including password
 * @returns Path to unlocked PDF file
 */
export async function unlockPdf(
  inputPath: string,
  options: UnlockPdfOptions = {}
): Promise<string> {
  try {
    console.log(`[Unlock PDF] Starting unlock: ${inputPath}`);

    // Read PDF file
    const existingPdfBytes = fs.readFileSync(inputPath);

    console.log(`[Unlock PDF] File size: ${(existingPdfBytes.length / 1024).toFixed(2)} KB`);

    // Load PDF document with password if provided
    const loadOptions: any = {};
    if (options.password) {
      loadOptions.password = options.password;
      console.log('[Unlock PDF] Loading with password...');
    }

    const pdfDoc = await PDFDocument.load(existingPdfBytes, loadOptions);

    console.log('[Unlock PDF] PDF loaded successfully');

    // Generate output path
    const outputDir = options.outputDir || path.dirname(inputPath);
    const baseName = path.basename(inputPath, path.extname(inputPath));
    const outputPath = path.join(outputDir, `${baseName}_unlocked.pdf`);

    // Save unlocked PDF (without password protection)
    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync(outputPath, pdfBytes);

    console.log(`[Unlock PDF] Unlocked PDF saved: ${outputPath}`);
    console.log(`[Unlock PDF] Output size: ${(pdfBytes.length / 1024).toFixed(2)} KB`);

    return outputPath;
  } catch (error) {
    console.error('[Unlock PDF] Unlock failed:', error);

    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('password') || error.message.includes('encrypted')) {
        throw new Error('Failed to unlock PDF: Incorrect password or PDF is encrypted');
      }
      throw new Error(`Failed to unlock PDF: ${error.message}`);
    }

    throw new Error('Failed to unlock PDF: Unknown error');
  }
}
