// Wrapper for pdf-parse that avoids the test file loading issue
// pdf-parse 1.1.1 tries to load a test file on require which fails on Vercel

// eslint-disable-next-line @typescript-eslint/no-var-requires
const pdfParse = require('pdf-parse/lib/pdf-parse.js');

export async function parsePdf(dataBuffer: Buffer): Promise<{
  numpages: number;
  numrender: number;
  info: any;
  metadata: any;
  text: string;
  version: string;
}> {
  return pdfParse(dataBuffer);
}
