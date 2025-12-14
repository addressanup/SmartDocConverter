import fs from 'fs';
import path from 'path';
import mammoth from 'mammoth';
import { PDFDocument, rgb, StandardFonts, PDFFont } from 'pdf-lib';

export interface WordToPdfOptions {
  outputDir?: string;
  fontSize?: number;
  pageMargin?: number;
  preserveStyles?: boolean;
}

interface TextElement {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  heading?: number;
  listItem?: boolean;
  listLevel?: number;
}

/**
 * Convert DOCX to PDF with improved text and style handling
 * @param inputPath - Path to input DOCX file
 * @param options - Conversion options
 * @returns Path to generated PDF file
 */
export async function convertWordToPdf(
  inputPath: string,
  options: WordToPdfOptions = {}
): Promise<string> {
  try {
    console.log(`[Word to PDF] Starting conversion: ${inputPath}`);

    if (!fs.existsSync(inputPath)) {
      throw new Error(`Input file not found: ${inputPath}`);
    }

    const dataBuffer = fs.readFileSync(inputPath);

    // Extract HTML for better formatting preservation
    console.log('[Word to PDF] Extracting content from DOCX...');
    const htmlResult = await mammoth.convertToHtml({ buffer: dataBuffer });
    const textResult = await mammoth.extractRawText({ buffer: dataBuffer });

    if (htmlResult.messages.length > 0) {
      console.log('[Word to PDF] Extraction warnings:', htmlResult.messages.length);
    }

    console.log(`[Word to PDF] Extracted ${textResult.value.length} characters`);

    // Parse HTML to extract styled text
    const elements = parseHtmlToElements(htmlResult.value);
    console.log(`[Word to PDF] Parsed ${elements.length} text elements`);

    // Create PDF document
    const pdfDoc = await PDFDocument.create();
    
    // Embed fonts
    const fonts = {
      regular: await pdfDoc.embedFont(StandardFonts.Helvetica),
      bold: await pdfDoc.embedFont(StandardFonts.HelveticaBold),
      italic: await pdfDoc.embedFont(StandardFonts.HelveticaOblique),
      boldItalic: await pdfDoc.embedFont(StandardFonts.HelveticaBoldOblique),
    };

    const baseFontSize = options.fontSize || 11;
    const pageMargin = options.pageMargin || 60;
    const lineHeight = baseFontSize * 1.4;

    // Page dimensions (A4)
    const pageWidth = 595;
    const pageHeight = 842;
    const maxWidth = pageWidth - (pageMargin * 2);
    const maxHeight = pageHeight - (pageMargin * 2);

    let page = pdfDoc.addPage([pageWidth, pageHeight]);
    let yPosition = pageHeight - pageMargin;
    let currentPageNum = 1;

    // Process each element
    for (const element of elements) {
      const fontSize = getElementFontSize(element, baseFontSize);
      const font = getElementFont(element, fonts);
      const color = rgb(0, 0, 0);
      
      // Calculate spacing
      const spaceBefore = element.heading ? fontSize * 0.8 : 0;
      const spaceAfter = element.heading ? fontSize * 0.4 : lineHeight * 0.3;

      // Check if we need a new page
      if (yPosition - spaceBefore - fontSize < pageMargin) {
        page = pdfDoc.addPage([pageWidth, pageHeight]);
        yPosition = pageHeight - pageMargin;
        currentPageNum++;
      }

      yPosition -= spaceBefore;

      // Handle list items
      let textToRender = element.text;
      let xOffset = 0;
      
      if (element.listItem) {
        const indent = (element.listLevel || 0) * 20;
        xOffset = indent;
        textToRender = `• ${textToRender}`;
      }

      // Word wrap and render text
      const words = textToRender.split(/\s+/);
      let currentLine = '';

      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const textWidth = font.widthOfTextAtSize(testLine, fontSize);

        if (textWidth > maxWidth - xOffset && currentLine) {
          // Draw current line
          page.drawText(currentLine, {
            x: pageMargin + xOffset,
            y: yPosition,
            size: fontSize,
            font: font,
            color: color,
          });

          yPosition -= lineHeight;
          currentLine = word;

          // Check for new page
          if (yPosition < pageMargin) {
            page = pdfDoc.addPage([pageWidth, pageHeight]);
            yPosition = pageHeight - pageMargin;
            currentPageNum++;
          }
        } else {
          currentLine = testLine;
        }
      }

      // Draw remaining text
      if (currentLine) {
        page.drawText(currentLine, {
          x: pageMargin + xOffset,
          y: yPosition,
          size: fontSize,
          font: font,
          color: color,
        });

        yPosition -= lineHeight;
      }

      yPosition -= spaceAfter;
    }

    // Generate output path
    const outputDir = options.outputDir || path.dirname(inputPath);
    const baseName = path.basename(inputPath, path.extname(inputPath));
    const outputPath = path.join(outputDir, `${baseName}.pdf`);

    console.log('[Word to PDF] Generating PDF...');
    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync(outputPath, pdfBytes);

    console.log(`[Word to PDF] Created ${currentPageNum} page(s)`);
    console.log(`[Word to PDF] Conversion complete: ${outputPath}`);
    return outputPath;
  } catch (error) {
    console.error('[Word to PDF] Conversion failed:', error);
    throw new Error(`Failed to convert Word to PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Parse HTML content into styled text elements
 */
function parseHtmlToElements(html: string): TextElement[] {
  const elements: TextElement[] = [];
  
  // Remove script and style tags
  html = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  html = html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  
  // Split by block-level elements
  const blockPattern = /<(h[1-6]|p|div|li|tr)([^>]*)>([\s\S]*?)<\/\1>/gi;
  let match;
  
  while ((match = blockPattern.exec(html)) !== null) {
    const tag = match[1].toLowerCase();
    const content = match[3];
    
    // Extract text and detect formatting
    const element = parseBlockElement(tag, content);
    if (element.text.trim()) {
      elements.push(element);
    }
  }
  
  // If no block elements found, fall back to plain text
  if (elements.length === 0) {
    const plainText = html
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/\s+/g, ' ')
      .trim();
    
    if (plainText) {
      // Split into paragraphs
      const paragraphs = plainText.split(/\n\n+/);
      for (const para of paragraphs) {
        if (para.trim()) {
          elements.push({ text: para.trim() });
        }
      }
    }
  }
  
  return elements;
}

/**
 * Parse a block-level HTML element
 */
function parseBlockElement(tag: string, content: string): TextElement {
  // Remove HTML tags and decode entities
  const text = content
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();

  const element: TextElement = { text };

  // Detect heading level
  const headingMatch = tag.match(/h(\d)/i);
  if (headingMatch) {
    element.heading = parseInt(headingMatch[1], 10);
    element.bold = true;
  }

  // Detect list items
  if (tag === 'li') {
    element.listItem = true;
    element.listLevel = 0;
  }

  // Detect inline formatting from content
  if (/<strong|<b>/i.test(content)) {
    element.bold = true;
  }
  if (/<em|<i>/i.test(content)) {
    element.italic = true;
  }
  if (/<u>/i.test(content)) {
    element.underline = true;
  }

  return element;
}

/**
 * Get font size based on element type
 */
function getElementFontSize(element: TextElement, baseFontSize: number): number {
  if (element.heading) {
    switch (element.heading) {
      case 1: return baseFontSize * 2;
      case 2: return baseFontSize * 1.5;
      case 3: return baseFontSize * 1.25;
      case 4: return baseFontSize * 1.1;
      default: return baseFontSize;
    }
  }
  return baseFontSize;
}

/**
 * Get font based on element formatting
 */
function getElementFont(
  element: TextElement,
  fonts: { regular: PDFFont; bold: PDFFont; italic: PDFFont; boldItalic: PDFFont }
): PDFFont {
  if (element.bold && element.italic) {
    return fonts.boldItalic;
  }
  if (element.bold || element.heading) {
    return fonts.bold;
  }
  if (element.italic) {
    return fonts.italic;
  }
  return fonts.regular;
}
