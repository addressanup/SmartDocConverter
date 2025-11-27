declare module 'pdf-parse' {
  export class PDFParse {
    constructor(dataBuffer: Buffer | Uint8Array);
    parse(): Promise<PDFParseResult>;
  }

  export interface PDFParseResult {
    text: string;
    numpages: number;
    numrender: number;
    info: any;
    metadata: any;
    version: string;
  }

  export class AbortException extends Error {}
  export class FormatError extends Error {}
  export class InvalidPDFException extends Error {}
  export class PasswordException extends Error {}
  export class ResponseException extends Error {}
  export class UnknownErrorException extends Error {}

  export enum VerbosityLevel {
    ERRORS = 0,
    WARNINGS = 1,
    INFOS = 5,
  }

  export interface Point {
    x: number;
    y: number;
  }

  export interface Rectangle {
    x: number;
    y: number;
    width: number;
    height: number;
  }

  export interface Line {
    text: string;
    x: number;
    y: number;
    width: number;
    height: number;
  }

  export enum LineDirection {
    HORIZONTAL = 0,
    VERTICAL = 1,
  }

  export class LineStore {
    lines: Line[];
  }

  export interface Shape {
    type: string;
    data: any;
  }

  export interface Table {
    rows: any[][];
  }

  export function getException(error: any): Error;
}
