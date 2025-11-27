/**
 * Example: Using the PDF to JPG Converter
 *
 * This demonstrates the complete functionality of the PDF to JPG converter
 * including text extraction and image rendering.
 *
 * Run with: npx tsx examples/test-pdf-to-jpg-converter.ts
 */

import { convertPdfToJpg } from '../src/lib/converters/pdf-to-jpg';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import fs from 'fs';
import path from 'path';

async function createSamplePdf(outputPath: string) {
  console.log('Creating sample PDF with text and formatting...');

  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Page 1: Title and Introduction
  const page1 = pdfDoc.addPage([612, 792]); // US Letter size
  page1.drawText('SmartDocConverter', {
    x: 50,
    y: 740,
    size: 32,
    font: boldFont,
    color: rgb(0, 0.2, 0.6),
  });

  page1.drawText('PDF to JPG Conversion Example', {
    x: 50,
    y: 700,
    size: 18,
    font: font,
    color: rgb(0, 0, 0),
  });

  const intro = `
This is a demonstration of the PDF to JPG converter capabilities.
The converter can:
  • Extract and render text content from PDFs
  • Handle multi-page documents
  • Create high-quality JPG images
  • Package all images into a convenient ZIP file
  `.trim();

  let y = 650;
  for (const line of intro.split('\n')) {
    page1.drawText(line, {
      x: 50,
      y,
      size: 12,
      font: font,
      color: rgb(0, 0, 0),
    });
    y -= 20;
  }

  // Page 2: Features
  const page2 = pdfDoc.addPage([612, 792]);
  page2.drawText('Key Features', {
    x: 50,
    y: 740,
    size: 24,
    font: boldFont,
    color: rgb(0, 0.2, 0.6),
  });

  const features = [
    '1. Text Extraction: Automatically extracts text from PDF documents',
    '2. Image Rendering: Converts text to high-quality images',
    '3. Customizable Options: Quality, scale, and page selection',
    '4. ZIP Packaging: All images bundled in a single ZIP file',
    '5. Error Handling: Graceful fallbacks for problematic pages',
  ];

  y = 700;
  for (const feature of features) {
    page2.drawText(feature, {
      x: 50,
      y,
      size: 11,
      font: font,
      color: rgb(0, 0, 0),
    });
    y -= 25;
  }

  // Page 3: Usage Examples
  const page3 = pdfDoc.addPage([612, 792]);
  page3.drawText('Usage Examples', {
    x: 50,
    y: 740,
    size: 24,
    font: boldFont,
    color: rgb(0, 0.2, 0.6),
  });

  const usage = `
Convert first page only:
  convertPdfToJpg('document.pdf', { pages: 'first' })

Convert all pages:
  convertPdfToJpg('document.pdf', { pages: 'all' })

High quality conversion:
  convertPdfToJpg('document.pdf', {
    pages: 'all',
    quality: 95,
    scale: 3
  })
  `.trim();

  y = 700;
  for (const line of usage.split('\n')) {
    page3.drawText(line, {
      x: 50,
      y,
      size: 10,
      font: font,
      color: rgb(0, 0, 0),
    });
    y -= 15;
  }

  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(outputPath, pdfBytes);
  console.log(`Sample PDF created: ${outputPath}`);
  console.log(`File size: ${(pdfBytes.length / 1024).toFixed(2)} KB`);
}

async function main() {
  const examplesDir = path.join(__dirname, 'output');

  // Create output directory
  if (!fs.existsSync(examplesDir)) {
    fs.mkdirSync(examplesDir, { recursive: true });
  }

  const samplePdfPath = path.join(examplesDir, 'sample-document.pdf');

  try {
    // Create sample PDF
    await createSamplePdf(samplePdfPath);

    console.log('\n' + '='.repeat(70));
    console.log('Example 1: Convert First Page Only');
    console.log('='.repeat(70) + '\n');

    const result1 = await convertPdfToJpg(samplePdfPath, {
      pages: 'first',
      quality: 90,
      scale: 2,
    });
    console.log(`\nOutput: ${result1}`);
    console.log(`Size: ${(fs.statSync(result1).size / 1024).toFixed(2)} KB`);

    console.log('\n' + '='.repeat(70));
    console.log('Example 2: Convert All Pages (Standard Quality)');
    console.log('='.repeat(70) + '\n');

    const result2 = await convertPdfToJpg(samplePdfPath, {
      pages: 'all',
      quality: 85,
      scale: 2,
    });
    console.log(`\nOutput: ${result2}`);
    console.log(`Size: ${(fs.statSync(result2).size / 1024).toFixed(2)} KB`);

    console.log('\n' + '='.repeat(70));
    console.log('Example 3: High-Quality Conversion');
    console.log('='.repeat(70) + '\n');

    const result3 = await convertPdfToJpg(samplePdfPath, {
      pages: 'all',
      quality: 95,
      scale: 3,
    });
    console.log(`\nOutput: ${result3}`);
    console.log(`Size: ${(fs.statSync(result3).size / 1024).toFixed(2)} KB`);

    console.log('\n' + '='.repeat(70));
    console.log('All Examples Completed Successfully!');
    console.log('='.repeat(70));
    console.log(`\nOutput directory: ${examplesDir}`);
    console.log('\nGenerated files:');
    console.log(`  - ${path.basename(samplePdfPath)}`);
    console.log(`  - ${path.basename(result1)}`);
    console.log(`  - ${path.basename(result2)} (standard quality)`);
    console.log(`  - ${path.basename(result3)} (high quality)`);
    console.log('\nYou can extract the ZIP files to view the generated JPG images.');
  } catch (error) {
    console.error('\nError:', error);
    process.exit(1);
  }
}

main().catch(console.error);
