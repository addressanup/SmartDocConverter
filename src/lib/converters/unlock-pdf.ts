import fs from 'fs';
import path from 'path';
import { PDFDocument } from 'pdf-lib';
import { execSync } from 'child_process';

export interface UnlockPdfOptions {
  outputDir?: string;
  password?: string;
}

/**
 * Check if qpdf is installed on the system
 */
function isQpdfAvailable(): boolean {
  try {
    execSync('which qpdf', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

/**
 * Unlock a password-protected PDF by removing password protection
 * Uses qpdf when available for full encryption support,
 * falls back to pdf-lib for basic password handling
 * 
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

    if (!fs.existsSync(inputPath)) {
      throw new Error(`Input file not found: ${inputPath}`);
    }

    const fileSize = fs.statSync(inputPath).size;
    console.log(`[Unlock PDF] File size: ${(fileSize / 1024).toFixed(2)} KB`);

    // Generate output path
    const outputDir = options.outputDir || path.dirname(inputPath);
    const baseName = path.basename(inputPath, path.extname(inputPath));
    const outputPath = path.join(outputDir, `${baseName}_unlocked.pdf`);

    // Try to use qpdf for proper decryption
    if (isQpdfAvailable()) {
      console.log('[Unlock PDF] Using qpdf for decryption...');
      
      let qpdfCommand: string;
      if (options.password) {
        qpdfCommand = `qpdf --decrypt --password="${options.password}" "${inputPath}" "${outputPath}"`;
      } else {
        // Try without password (for owner-password-only protected PDFs)
        qpdfCommand = `qpdf --decrypt "${inputPath}" "${outputPath}"`;
      }

      try {
        execSync(qpdfCommand, { stdio: 'pipe' });
        console.log('[Unlock PDF] qpdf decryption successful');
      } catch (error: any) {
        const errorMsg = error.stderr?.toString() || error.message;
        
        if (errorMsg.includes('password')) {
          throw new Error('Incorrect password or PDF is encrypted with a password');
        }
        
        // If qpdf fails, fall back to pdf-lib
        console.log('[Unlock PDF] qpdf failed, trying pdf-lib...');
        await unlockWithPdfLib(inputPath, outputPath, options.password);
      }
    } else {
      // Use pdf-lib for basic password handling
      console.log('[Unlock PDF] Using pdf-lib for unlock...');
      await unlockWithPdfLib(inputPath, outputPath, options.password);
    }

    if (!fs.existsSync(outputPath)) {
      throw new Error('Failed to create unlocked PDF file');
    }

    const outputSize = fs.statSync(outputPath).size;
    console.log(`[Unlock PDF] Unlocked PDF saved: ${outputPath}`);
    console.log(`[Unlock PDF] Output size: ${(outputSize / 1024).toFixed(2)} KB`);

    return outputPath;
  } catch (error) {
    console.error('[Unlock PDF] Unlock failed:', error);

    if (error instanceof Error) {
      if (error.message.includes('password') || error.message.includes('encrypted')) {
        throw new Error('Failed to unlock PDF: Incorrect password or PDF is encrypted');
      }
      throw new Error(`Failed to unlock PDF: ${error.message}`);
    }

    throw new Error('Failed to unlock PDF: Unknown error');
  }
}

/**
 * Unlock PDF using pdf-lib
 */
async function unlockWithPdfLib(
  inputPath: string,
  outputPath: string,
  password?: string
): Promise<void> {
  const existingPdfBytes = fs.readFileSync(inputPath);

  // pdf-lib load options for password-protected PDFs
  const loadOptions: { password?: string; ignoreEncryption?: boolean } = {};
  
  if (password) {
    loadOptions.password = password;
  } else {
    // Try to load ignoring encryption (works for some PDFs)
    loadOptions.ignoreEncryption = true;
  }

  let pdfDoc: PDFDocument;
  
  try {
    pdfDoc = await PDFDocument.load(existingPdfBytes, loadOptions);
  } catch (error: any) {
    // Try with password if initial load fails
    if (password) {
      throw new Error('Incorrect password or PDF cannot be unlocked');
    }
    
    // Try loading with ignoreEncryption as fallback
    try {
      pdfDoc = await PDFDocument.load(existingPdfBytes, { ignoreEncryption: true });
    } catch {
      throw new Error('PDF is encrypted and requires a password');
    }
  }

  console.log(`[Unlock PDF] PDF loaded, ${pdfDoc.getPageCount()} pages`);

  // Save without encryption
  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(outputPath, pdfBytes);
}
