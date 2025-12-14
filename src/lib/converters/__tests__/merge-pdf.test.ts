import { mergePdfs } from '../merge-pdf';
import { PDFDocument } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import os from 'os';

describe('mergePdfs', () => {
  let tempDir: string;
  let testPdf1Path: string;
  let testPdf2Path: string;

  beforeAll(async () => {
    // Create temp directory for test files
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'merge-pdf-test-'));

    // Create two simple test PDFs using Uint8Array
    const pdf1 = await PDFDocument.create();
    pdf1.addPage();
    const pdf1Bytes = await pdf1.save();
    testPdf1Path = path.join(tempDir, 'test1.pdf');
    fs.writeFileSync(testPdf1Path, Buffer.from(pdf1Bytes));

    const pdf2 = await PDFDocument.create();
    pdf2.addPage();
    pdf2.addPage();
    const pdf2Bytes = await pdf2.save();
    testPdf2Path = path.join(tempDir, 'test2.pdf');
    fs.writeFileSync(testPdf2Path, Buffer.from(pdf2Bytes));
  });

  afterAll(() => {
    // Clean up temp directory
    if (tempDir && fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  describe('input validation', () => {
    it('should throw error when no files provided', async () => {
      await expect(mergePdfs([])).rejects.toThrow('At least one PDF file is required');
    });

    it('should throw error when only one file provided', async () => {
      await expect(mergePdfs([testPdf1Path])).rejects.toThrow('At least two PDF files are required');
    });

    it('should throw error when input file does not exist', async () => {
      await expect(mergePdfs([testPdf1Path, '/nonexistent/file.pdf'])).rejects.toThrow('Input file not found');
    });
  });

  describe('merge functionality', () => {
    it('should merge two PDFs successfully', async () => {
      const outputPath = await mergePdfs([testPdf1Path, testPdf2Path], {
        outputDir: tempDir,
        outputName: 'merged_test',
      });

      // Verify output file exists
      expect(fs.existsSync(outputPath)).toBe(true);
      expect(outputPath).toContain('merged_test.pdf');

      // Verify merged PDF has correct page count (1 + 2 = 3)
      const mergedPdfBytes = new Uint8Array(fs.readFileSync(outputPath));
      const mergedPdf = await PDFDocument.load(mergedPdfBytes);
      expect(mergedPdf.getPageCount()).toBe(3);

      // Clean up
      fs.unlinkSync(outputPath);
    });

    it('should use default output name when not provided', async () => {
      const outputPath = await mergePdfs([testPdf1Path, testPdf2Path], {
        outputDir: tempDir,
      });

      expect(fs.existsSync(outputPath)).toBe(true);
      expect(outputPath).toMatch(/merged_\d+\.pdf$/);

      // Clean up
      fs.unlinkSync(outputPath);
    });
  });
});
