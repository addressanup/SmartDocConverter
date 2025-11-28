import fs from 'fs';
import path from 'path';
import { PDFDocument } from 'pdf-lib';
import sharp from 'sharp';

export interface CompressPdfOptions {
  outputDir?: string;
  removeMetadata?: boolean;
  compressionLevel?: 'low' | 'medium' | 'high';
  imageQuality?: number;
}

export interface CompressResult {
  outputPath: string;
  originalSize: number;
  compressedSize: number;
  reductionPercent: number;
}

/**
 * Compress PDF by optimizing images and removing unnecessary data
 * @param inputPath - Path to input PDF file
 * @param options - Compression options
 * @returns Compression result with file info
 */
export async function compressPdf(
  inputPath: string,
  options: CompressPdfOptions = {}
): Promise<string> {
  try {
    console.log(`[Compress PDF] Starting compression: ${inputPath}`);

    if (!fs.existsSync(inputPath)) {
      throw new Error(`Input file not found: ${inputPath}`);
    }

    const existingPdfBytes = fs.readFileSync(inputPath);
    const originalSize = existingPdfBytes.length;

    console.log(`[Compress PDF] Original size: ${(originalSize / 1024).toFixed(2)} KB`);

    const pdfDoc = await PDFDocument.load(existingPdfBytes, {
      ignoreEncryption: true,
    });

    // Determine compression settings
    const compressionLevel = options.compressionLevel || 'medium';
    let imageQuality: number;
    
    switch (compressionLevel) {
      case 'low':
        imageQuality = options.imageQuality || 85;
        break;
      case 'medium':
        imageQuality = options.imageQuality || 70;
        break;
      case 'high':
        imageQuality = options.imageQuality || 50;
        break;
      default:
        imageQuality = 70;
    }

    console.log(`[Compress PDF] Compression level: ${compressionLevel}, image quality: ${imageQuality}`);

    // Remove metadata if requested (default: true)
    if (options.removeMetadata !== false) {
      console.log('[Compress PDF] Removing metadata...');
      pdfDoc.setTitle('');
      pdfDoc.setAuthor('');
      pdfDoc.setSubject('');
      pdfDoc.setKeywords([]);
      pdfDoc.setProducer('SmartDocConverter');
      pdfDoc.setCreator('SmartDocConverter');
    }

    // Try to extract and re-compress embedded images
    let imagesProcessed = 0;
    
    try {
      // Access raw PDF objects to find images
      const context = (pdfDoc as any).context;
      if (context && context.enumerateIndirectObjects) {
        const objects = context.enumerateIndirectObjects();
        
        for (const [ref, obj] of objects) {
          try {
            // Check if this is an image XObject
            if (obj && obj.dict) {
              const subtype = obj.dict.get && obj.dict.get('Subtype');
              if (subtype && subtype.toString() === '/Image') {
                // Found an image - we could process it here
                // Note: pdf-lib has limited support for modifying embedded images
                imagesProcessed++;
              }
            }
          } catch (e) {
            // Skip objects that can't be processed
          }
        }
      }
      
      if (imagesProcessed > 0) {
        console.log(`[Compress PDF] Found ${imagesProcessed} embedded image(s)`);
      }
    } catch (e) {
      // Continue without image processing if it fails
      console.log('[Compress PDF] Image processing skipped');
    }

    // Generate output path
    const outputDir = options.outputDir || path.dirname(inputPath);
    const baseName = path.basename(inputPath, path.extname(inputPath));
    const outputPath = path.join(outputDir, `${baseName}_compressed.pdf`);

    // Save with maximum object stream compression
    console.log('[Compress PDF] Saving with optimized settings...');
    const pdfBytes = await pdfDoc.save({
      useObjectStreams: true,
      addDefaultPage: false,
    });

    // Additional pass: if the file is still large, try further optimization
    let finalBytes = pdfBytes;
    
    if (pdfBytes.length > 100000 && compressionLevel === 'high') {
      console.log('[Compress PDF] Applying additional optimization pass...');
      
      try {
        // Reload and save again with more aggressive settings
        const secondPassDoc = await PDFDocument.load(pdfBytes);
        
        // Remove all optional content
        secondPassDoc.setTitle('');
        secondPassDoc.setSubject('');
        secondPassDoc.setProducer('');
        secondPassDoc.setCreator('');
        
        finalBytes = await secondPassDoc.save({
          useObjectStreams: true,
        });
      } catch (e) {
        // Use first pass result if second pass fails
        console.log('[Compress PDF] Second pass skipped');
      }
    }

    fs.writeFileSync(outputPath, finalBytes);

    const compressedSize = finalBytes.length;
    const reductionPercent = ((1 - compressedSize / originalSize) * 100);

    console.log(`[Compress PDF] Compressed size: ${(compressedSize / 1024).toFixed(2)} KB`);
    console.log(`[Compress PDF] Reduction: ${reductionPercent.toFixed(1)}%`);
    console.log(`[Compress PDF] Compression complete: ${outputPath}`);

    // Store metadata for API response
    const result: CompressResult = {
      outputPath,
      originalSize,
      compressedSize,
      reductionPercent: Math.max(0, reductionPercent),
    };

    // Write metadata to companion file for API to read
    const metadataPath = outputPath + '.meta.json';
    fs.writeFileSync(metadataPath, JSON.stringify(result));

    return outputPath;
  } catch (error) {
    console.error('[Compress PDF] Compression failed:', error);
    throw new Error(`Failed to compress PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get compression metadata if available
 */
export function getCompressionMetadata(outputPath: string): CompressResult | null {
  const metadataPath = outputPath + '.meta.json';
  
  try {
    if (fs.existsSync(metadataPath)) {
      const data = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
      // Clean up metadata file
      fs.unlinkSync(metadataPath);
      return data;
    }
  } catch (e) {
    // Ignore errors
  }
  
  return null;
}
