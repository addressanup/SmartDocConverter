-- SmartDocConverter Database Setup
-- Step 1: Create ENUM types

-- User tier enum
CREATE TYPE "UserTier" AS ENUM ('FREE', 'PREMIUM');

-- Subscription status enum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'CANCELED', 'PAST_DUE', 'TRIALING', 'INCOMPLETE');

-- Subscription plan enum
CREATE TYPE "SubscriptionPlan" AS ENUM ('MONTHLY', 'ANNUAL');

-- Job status enum
CREATE TYPE "JobStatus" AS ENUM ('QUEUED', 'PROCESSING', 'COMPLETED', 'FAILED');

-- Conversion type enum
CREATE TYPE "ConversionType" AS ENUM (
  'PDF_TO_WORD',
  'WORD_TO_PDF',
  'PDF_TO_EXCEL',
  'EXCEL_TO_PDF',
  'PDF_TO_PPT',
  'PPT_TO_PDF',
  'COMPRESS_PDF',
  'MERGE_PDF',
  'SPLIT_PDF',
  'ROTATE_PDF',
  'JPG_TO_PDF',
  'PNG_TO_PDF',
  'PDF_TO_JPG',
  'PDF_TO_PNG',
  'IMAGE_TO_TEXT',
  'PDF_OCR',
  'BANK_STATEMENT',
  'HTML_TO_PDF',
  'UNLOCK_PDF',
  'PROTECT_PDF',
  'WATERMARK_PDF',
  'PAGE_NUMBERS_PDF',
  'PDF_TO_PDFA',
  'REPAIR_PDF',
  'COMPRESS_IMAGE',
  'RESIZE_IMAGE',
  'CONVERT_IMAGE'
);

-- File type enum
CREATE TYPE "FileType" AS ENUM (
  'PDF',
  'DOCX',
  'DOC',
  'XLSX',
  'XLS',
  'PPTX',
  'PPT',
  'JPG',
  'JPEG',
  'PNG',
  'GIF',
  'BMP',
  'WEBP',
  'TIFF',
  'TXT',
  'CSV',
  'HTML',
  'ZIP'
);
