import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { PDFDocument } from 'pdf-lib';

export interface JpgToPdfOptions {
  outputDir?: string;
  quality?: number;
  fitToPage?: boolean;
  pageSize?: 'A4' | 'Letter' | 'Legal';
}

/**
 * Convert image (JPG/PNG) to PDF
 * @param inputPath - Path to input image file
 * @param options - Conversion options
 * @returns Path to generated PDF file
 */
export async function convertJpgToPdf(
  inputPath: string,
  options: JpgToPdfOptions = {}
): Promise<string> {
  try {
    console.log(`[JPG to PDF] Starting conversion: ${inputPath}`);

    // Get page dimensions
    const pageSizes = {
      A4: { width: 595, height: 842 },
      Letter: { width: 612, height: 792 },
      Legal: { width: 612, height: 1008 },
    };
    const pageSize = pageSizes[options.pageSize || 'A4'];

    // Process image with sharp
    console.log('[JPG to PDF] Processing image...');
    const imageBuffer = fs.readFileSync(inputPath);
    const metadata = await sharp(imageBuffer).metadata();

    console.log(`[JPG to PDF] Original image: ${metadata.width}x${metadata.height}`);

    let processedBuffer: Buffer;
    let imageWidth = metadata.width || 0;
    let imageHeight = metadata.height || 0;

    if (options.fitToPage) {
      // Calculate scaling to fit page while maintaining aspect ratio
      const margin = 40; // 40 points margin
      const maxWidth = pageSize.width - (margin * 2);
      const maxHeight = pageSize.height - (margin * 2);

      const widthRatio = maxWidth / imageWidth;
      const heightRatio = maxHeight / imageHeight;
      const scale = Math.min(widthRatio, heightRatio);

      imageWidth = Math.floor(imageWidth * scale);
      imageHeight = Math.floor(imageHeight * scale);

      console.log(`[JPG to PDF] Resizing to fit page: ${imageWidth}x${imageHeight}`);

      processedBuffer = await sharp(imageBuffer)
        .resize(imageWidth, imageHeight, { fit: 'inside' })
        .jpeg({ quality: options.quality || 85 })
        .toBuffer();
    } else {
      // Convert to JPEG if needed
      if (metadata.format !== 'jpeg') {
        processedBuffer = await sharp(imageBuffer)
          .jpeg({ quality: options.quality || 85 })
          .toBuffer();
      } else {
        processedBuffer = imageBuffer;
      }
    }

    // Create PDF document
    console.log('[JPG to PDF] Creating PDF...');
    const pdfDoc = await PDFDocument.create();

    // Embed image
    const image = await pdfDoc.embedJpg(processedBuffer);

    // Add page with image
    const page = pdfDoc.addPage([pageSize.width, pageSize.height]);

    if (options.fitToPage) {
      // Center image on page
      const x = (pageSize.width - imageWidth) / 2;
      const y = (pageSize.height - imageHeight) / 2;

      page.drawImage(image, {
        x,
        y,
        width: imageWidth,
        height: imageHeight,
      });
    } else {
      // Use original image dimensions
      const imgDims = image.scale(1);
      page.drawImage(image, {
        x: 0,
        y: pageSize.height - imgDims.height,
        width: imgDims.width,
        height: imgDims.height,
      });
    }

    // Generate output path
    const outputDir = options.outputDir || path.dirname(inputPath);
    const baseName = path.basename(inputPath, path.extname(inputPath));
    const outputPath = path.join(outputDir, `${baseName}.pdf`);

    // Save PDF
    console.log('[JPG to PDF] Saving PDF...');
    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync(outputPath, pdfBytes);

    console.log(`[JPG to PDF] Conversion complete: ${outputPath}`);
    return outputPath;
  } catch (error) {
    console.error('[JPG to PDF] Conversion failed:', error);
    throw new Error(`Failed to convert image to PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
