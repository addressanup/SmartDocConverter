import fs from 'fs';
import path from 'path';
import Tesseract, { createWorker } from 'tesseract.js';

export interface ImageToTextOptions {
  outputDir?: string;
  language?: string;
  outputFormat?: 'txt' | 'json';
}

/**
 * Extract text from image using OCR (Tesseract.js)
 * @param inputPath - Path to input image file
 * @param options - OCR options
 * @returns Path to generated text file
 */
export async function convertImageToText(
  inputPath: string,
  options: ImageToTextOptions = {}
): Promise<string> {
  let worker: Tesseract.Worker | null = null;

  try {
    console.log(`[Image to Text] Starting OCR: ${inputPath}`);

    // Create Tesseract worker
    console.log('[Image to Text] Initializing OCR engine...');
    worker = await createWorker(options.language || 'eng', 1, {
      logger: (m) => {
        if (m.status === 'recognizing text') {
          console.log(`[Image to Text] Progress: ${(m.progress * 100).toFixed(0)}%`);
        }
      },
    });

    // Perform OCR
    console.log('[Image to Text] Recognizing text...');
    const { data } = await worker.recognize(inputPath);

    console.log(`[Image to Text] Extracted ${data.text.length} characters`);
    console.log(`[Image to Text] Confidence: ${data.confidence.toFixed(2)}%`);

    // Generate output path
    const outputDir = options.outputDir || path.dirname(inputPath);
    const baseName = path.basename(inputPath, path.extname(inputPath));
    const outputFormat = options.outputFormat || 'txt';
    const outputPath = path.join(outputDir, `${baseName}.${outputFormat}`);

    // Save output
    if (outputFormat === 'json') {
      const jsonOutput = {
        text: data.text,
        confidence: data.confidence,
        words: (data as any).words?.map((w: any) => ({
          text: w.text,
          confidence: w.confidence,
          bbox: w.bbox,
        })) || [],
        lines: (data as any).lines?.map((l: any) => ({
          text: l.text,
          confidence: l.confidence,
          bbox: l.bbox,
        })) || [],
      };
      fs.writeFileSync(outputPath, JSON.stringify(jsonOutput, null, 2));
    } else {
      fs.writeFileSync(outputPath, data.text);
    }

    console.log(`[Image to Text] OCR complete: ${outputPath}`);

    // Cleanup
    await worker.terminate();
    return outputPath;
  } catch (error) {
    // Cleanup on error
    if (worker) {
      try {
        await worker.terminate();
      } catch (e) {
        // Ignore cleanup errors
      }
    }

    console.error('[Image to Text] OCR failed:', error);
    throw new Error(`Failed to extract text from image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
