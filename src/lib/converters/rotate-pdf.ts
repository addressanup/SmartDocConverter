import fs from 'fs';
import path from 'path';
import { PDFDocument, degrees } from 'pdf-lib';

export interface RotatePdfOptions {
  outputDir?: string;
  rotation?: 90 | 180 | 270;
  pages?: 'all' | number[];
}

/**
 * Rotate PDF pages by specified degrees
 * @param inputPath - Path to input PDF file
 * @param options - Rotation options
 * @returns Path to rotated PDF file
 */
export async function rotatePdf(
  inputPath: string,
  options: RotatePdfOptions = {}
): Promise<string> {
  try {
    console.log(`[Rotate PDF] Starting rotation: ${inputPath}`);

    // Read PDF file
    const existingPdfBytes = fs.readFileSync(inputPath);
    console.log(`[Rotate PDF] File size: ${(existingPdfBytes.length / 1024).toFixed(2)} KB`);

    // Load PDF document
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const totalPages = pdfDoc.getPageCount();
    console.log(`[Rotate PDF] Total pages: ${totalPages}`);

    // Get rotation angle (default to 90 degrees)
    const rotationAngle = options.rotation || 90;
    console.log(`[Rotate PDF] Rotation angle: ${rotationAngle} degrees`);

    // Determine which pages to rotate
    const pagesToRotate = options.pages === 'all' || !options.pages
      ? Array.from({ length: totalPages }, (_, i) => i)
      : options.pages.map(p => p - 1); // Convert to 0-based index

    console.log(`[Rotate PDF] Rotating ${pagesToRotate.length} page(s)...`);

    // Rotate specified pages
    for (const pageIndex of pagesToRotate) {
      if (pageIndex >= 0 && pageIndex < totalPages) {
        const page = pdfDoc.getPage(pageIndex);
        const currentRotation = page.getRotation().angle;
        const newRotation = (currentRotation + rotationAngle) % 360;
        page.setRotation(degrees(newRotation));
        console.log(`[Rotate PDF] Page ${pageIndex + 1}: ${currentRotation}° -> ${newRotation}°`);
      } else {
        console.warn(`[Rotate PDF] Page ${pageIndex + 1} is out of range, skipping...`);
      }
    }

    // Generate output path
    const outputDir = options.outputDir || path.dirname(inputPath);
    const baseName = path.basename(inputPath, path.extname(inputPath));
    const outputPath = path.join(outputDir, `${baseName}_rotated.pdf`);

    // Save rotated PDF
    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync(outputPath, pdfBytes);

    console.log(`[Rotate PDF] Rotation complete: ${outputPath}`);
    console.log(`[Rotate PDF] Output size: ${(pdfBytes.length / 1024).toFixed(2)} KB`);

    return outputPath;
  } catch (error) {
    console.error('[Rotate PDF] Rotation failed:', error);
    throw new Error(`Failed to rotate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
