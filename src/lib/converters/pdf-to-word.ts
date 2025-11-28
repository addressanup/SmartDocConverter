import fs from 'fs';
import path from 'path';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle } from 'docx';
import { parsePdf } from '../pdf-parse';

export interface PdfToWordOptions {
  outputDir?: string;
  preserveFormatting?: boolean;
  detectHeadings?: boolean;
}

interface TextBlock {
  text: string;
  isHeading: boolean;
  headingLevel: number;
  isBold: boolean;
  alignment: 'left' | 'center' | 'right';
}

/**
 * Convert PDF to DOCX with improved text extraction and formatting
 * @param inputPath - Path to input PDF file
 * @param options - Conversion options
 * @returns Path to generated DOCX file
 */
export async function convertPdfToWord(
  inputPath: string,
  options: PdfToWordOptions = {}
): Promise<string> {
  try {
    console.log(`[PDF to Word] Starting conversion: ${inputPath}`);

    if (!fs.existsSync(inputPath)) {
      throw new Error(`Input file not found: ${inputPath}`);
    }

    const dataBuffer = fs.readFileSync(inputPath);

    console.log('[PDF to Word] Parsing PDF...');
    const pdfData = await parsePdf(dataBuffer);

    console.log(`[PDF to Word] Extracted ${pdfData.numpages} pages, ${pdfData.text.length} characters`);

    // Parse text into structured blocks
    const blocks = parseTextBlocks(pdfData.text, options.detectHeadings !== false);

    console.log(`[PDF to Word] Detected ${blocks.length} text blocks`);

    // Create Word document with proper formatting
    const paragraphs = blocks.map((block) => createParagraph(block));

    // Add title page info if detected
    const titleInfo = extractTitleInfo(pdfData.info);
    if (titleInfo.title) {
      paragraphs.unshift(
        new Paragraph({
          children: [
            new TextRun({
              text: titleInfo.title,
              bold: true,
              size: 48,
            }),
          ],
          heading: HeadingLevel.TITLE,
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
        })
      );
    }

    const doc = new Document({
      sections: [{
        properties: {
          page: {
            margin: {
              top: 1440, // 1 inch in twips
              right: 1440,
              bottom: 1440,
              left: 1440,
            },
          },
        },
        children: paragraphs.length > 0 ? paragraphs : [
          new Paragraph({
            children: [
              new TextRun({
                text: 'No text content found in PDF',
                italics: true,
              }),
            ],
          }),
        ],
      }],
    });

    // Generate output path
    const outputDir = options.outputDir || path.dirname(inputPath);
    const baseName = path.basename(inputPath, path.extname(inputPath));
    const outputPath = path.join(outputDir, `${baseName}.docx`);

    console.log('[PDF to Word] Generating DOCX...');
    const buffer = await Packer.toBuffer(doc);
    fs.writeFileSync(outputPath, buffer);

    console.log(`[PDF to Word] Conversion complete: ${outputPath}`);
    return outputPath;
  } catch (error) {
    console.error('[PDF to Word] Conversion failed:', error);
    throw new Error(`Failed to convert PDF to Word: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Parse text into structured blocks with formatting detection
 */
function parseTextBlocks(text: string, detectHeadings: boolean): TextBlock[] {
  const blocks: TextBlock[] = [];
  const lines = text.split('\n');
  
  let currentBlock: string[] = [];
  let lastLineType: 'text' | 'heading' | 'empty' = 'empty';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();
    
    if (trimmedLine.length === 0) {
      // Empty line - finalize current block
      if (currentBlock.length > 0) {
        const blockText = currentBlock.join(' ').trim();
        const analysis = analyzeBlock(blockText, detectHeadings);
        blocks.push(analysis);
        currentBlock = [];
      }
      lastLineType = 'empty';
      continue;
    }

    // Check if this line looks like a heading
    const isHeadingLine = detectHeadings && isLikelyHeading(trimmedLine, lines[i + 1]);
    
    if (isHeadingLine && lastLineType !== 'heading') {
      // Finalize previous block
      if (currentBlock.length > 0) {
        const blockText = currentBlock.join(' ').trim();
        blocks.push(analyzeBlock(blockText, false));
        currentBlock = [];
      }
      
      // Add heading as separate block
      blocks.push({
        text: trimmedLine,
        isHeading: true,
        headingLevel: detectHeadingLevel(trimmedLine),
        isBold: true,
        alignment: 'left',
      });
      lastLineType = 'heading';
    } else {
      currentBlock.push(trimmedLine);
      lastLineType = 'text';
    }
  }

  // Finalize last block
  if (currentBlock.length > 0) {
    const blockText = currentBlock.join(' ').trim();
    blocks.push(analyzeBlock(blockText, detectHeadings));
  }

  return blocks;
}

/**
 * Check if a line is likely a heading
 */
function isLikelyHeading(line: string, nextLine?: string): boolean {
  // Short lines that end without punctuation are likely headings
  if (line.length < 80 && !/[.,;:!?]$/.test(line)) {
    // Check for common heading patterns
    if (/^(Chapter|Section|Part|\d+\.|\d+\)|\([a-z]\)|[IVXLCDM]+\.)/i.test(line)) {
      return true;
    }
    
    // All caps or title case short lines
    if (line.length < 50) {
      const isAllCaps = line === line.toUpperCase() && /[A-Z]/.test(line);
      const isTitleCase = /^[A-Z][a-z]/.test(line) && !nextLine?.trim().startsWith(line.charAt(0));
      
      if (isAllCaps || (isTitleCase && line.split(' ').length < 10)) {
        return true;
      }
    }
  }
  
  return false;
}

/**
 * Detect heading level based on text characteristics
 */
function detectHeadingLevel(text: string): number {
  if (/^(Chapter|CHAPTER)\s+/i.test(text)) return 1;
  if (/^(Section|SECTION)\s+/i.test(text)) return 2;
  if (/^(Part|PART)\s+/i.test(text)) return 2;
  if (/^\d+\.\s+[A-Z]/.test(text)) return 2;
  if (/^\d+\.\d+\s+/.test(text)) return 3;
  if (text === text.toUpperCase() && text.length < 50) return 1;
  return 2;
}

/**
 * Analyze a text block for formatting
 */
function analyzeBlock(text: string, detectHeadings: boolean): TextBlock {
  return {
    text,
    isHeading: false,
    headingLevel: 0,
    isBold: false,
    alignment: 'left',
  };
}

/**
 * Create a paragraph from a text block
 */
function createParagraph(block: TextBlock): Paragraph {
  if (block.isHeading) {
    const headingLevel = block.headingLevel === 1 
      ? HeadingLevel.HEADING_1 
      : block.headingLevel === 2 
        ? HeadingLevel.HEADING_2 
        : HeadingLevel.HEADING_3;
    
    return new Paragraph({
      children: [
        new TextRun({
          text: block.text,
          bold: true,
        }),
      ],
      heading: headingLevel,
      spacing: { before: 240, after: 120 },
    });
  }

  return new Paragraph({
    children: [
      new TextRun({
        text: block.text,
      }),
    ],
    spacing: { after: 200 },
  });
}

/**
 * Extract title information from PDF metadata
 */
function extractTitleInfo(info: any): { title?: string; author?: string } {
  if (!info) return {};
  
  return {
    title: info.Title || undefined,
    author: info.Author || undefined,
  };
}
