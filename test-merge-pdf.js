/**
 * Test script for merge-pdf converter
 * This script demonstrates how to use the mergePdfs function
 */

const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

async function createTestPDF(filename, text) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, 400]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  page.drawText(text, {
    x: 50,
    y: 350,
    size: 30,
    font: font,
    color: rgb(0, 0, 0),
  });

  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(filename, pdfBytes);
  console.log(`Created test PDF: ${filename}`);
}

async function testMergePdf() {
  console.log('Starting merge-pdf test...\n');

  // Create test directory
  const testDir = path.join(__dirname, 'test-pdfs');
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, { recursive: true });
  }

  try {
    // Create test PDFs
    const pdf1 = path.join(testDir, 'test1.pdf');
    const pdf2 = path.join(testDir, 'test2.pdf');
    const pdf3 = path.join(testDir, 'test3.pdf');

    await createTestPDF(pdf1, 'This is Page 1');
    await createTestPDF(pdf2, 'This is Page 2');
    await createTestPDF(pdf3, 'This is Page 3');

    console.log('\nTest PDFs created successfully!\n');

    // Import the merge function
    // Note: This would need to be compiled from TypeScript first
    console.log('To test the merge function:');
    console.log('1. Upload the test PDFs via /api/upload-multiple');
    console.log('2. Call /api/convert with conversionType: "merge-pdf"');
    console.log('3. Provide the filePaths array in the request body\n');

    console.log('Example API call:');
    console.log(JSON.stringify({
      fileId: 'test-merge',
      conversionType: 'merge-pdf',
      filePaths: [pdf1, pdf2, pdf3],
      options: {
        outputName: 'merged-test'
      }
    }, null, 2));

    console.log('\nTest files are located at:', testDir);
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testMergePdf();
