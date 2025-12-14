import fs from 'fs';
import path from 'path';
import { PDFDocument } from 'pdf-lib';

export interface MergePdfsOptions {
  outputDir?: string;
  outputName?: string;
}

/**
 * Merge multiple PDF files into a single PDF
 * @param inputPaths - Array of paths to input PDF files
 * @param options - Merge options including output name
 * @returns Path to merged PDF file
 */
export async function mergePdfs(
  inputPaths: string[],
  options: MergePdfsOptions = {}
): Promise<string> {
  try {
    console.log(`[Merge PDF] Starting merge of ${inputPaths.length} PDFs`);

    // Validate inputs
    if (!inputPaths || inputPaths.length === 0) {
      throw new Error('At least one PDF file is required for merging');
    }

    if (inputPaths.length === 1) {
      throw new Error('At least two PDF files are required for merging');
    }

    // Verify all input files exist
    for (const inputPath of inputPaths) {
      if (!fs.existsSync(inputPath)) {
        throw new Error(`Input file not found: ${inputPath}`);
      }
    }

    // Create a new PDF document
    const mergedPdf = await PDFDocument.create();

    // Process each input PDF
    for (let i = 0; i < inputPaths.length; i++) {
      const inputPath = inputPaths[i];
      console.log(`[Merge PDF] Processing file ${i + 1}/${inputPaths.length}: ${path.basename(inputPath)}`);

      try {
        // Read the PDF file and convert to Uint8Array for pdf-lib compatibility
        const pdfBytes = new Uint8Array(fs.readFileSync(inputPath));

        // Load the PDF document
        const pdf = await PDFDocument.load(pdfBytes);

        // Get all page indices
        const pageCount = pdf.getPageCount();
        console.log(`[Merge PDF] File has ${pageCount} pages`);

        // Copy all pages from this PDF
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());

        // Add each copied page to the merged document
        // This preserves page sizes and orientations
        for (const page of copiedPages) {
          mergedPdf.addPage(page);
        }

        console.log(`[Merge PDF] Successfully added ${pageCount} pages from ${path.basename(inputPath)}`);
      } catch (error) {
        console.error(`[Merge PDF] Failed to process ${inputPath}:`, error);
        throw new Error(`Failed to process ${path.basename(inputPath)}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // Generate output path
    const outputDir = options.outputDir || path.dirname(inputPaths[0]);
    const outputName = options.outputName || `merged_${Date.now()}`;
    const outputPath = path.join(outputDir, `${outputName}.pdf`);

    // Save the merged PDF
    console.log(`[Merge PDF] Saving merged PDF to ${outputPath}`);
    const mergedPdfBytes = await mergedPdf.save();
    fs.writeFileSync(outputPath, mergedPdfBytes);

    const totalPages = mergedPdf.getPageCount();
    const outputSize = mergedPdfBytes.length;

    console.log(`[Merge PDF] Merge complete!`);
    console.log(`[Merge PDF] Total pages: ${totalPages}`);
    console.log(`[Merge PDF] Output size: ${(outputSize / 1024).toFixed(2)} KB`);
    console.log(`[Merge PDF] Output path: ${outputPath}`);

    return outputPath;
  } catch (error) {
    console.error('[Merge PDF] Merge failed:', error);
    throw new Error(`Failed to merge PDFs: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
