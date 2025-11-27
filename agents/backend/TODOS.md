# Backend Agent - Todo List

## Status: IN_PROGRESS
**Phase:** 3 - Core Implementation
**Current Feature:** Landing Page & File Processing Pipeline

---

## Phase 3.1: Project Setup & Infrastructure (Day 1-2)

### Next.js & Database Setup
- [ ] Initialize Next.js 14 project with App Router and TypeScript
- [ ] Configure Tailwind CSS and path aliases
- [ ] Set up Prisma with PostgreSQL connection
- [ ] Run initial Prisma migration with database schema
- [ ] Configure environment variables (.env.local template)
- [ ] Set up Redis connection (Upstash) for rate limiting

### File Storage Setup
- [ ] Configure S3/R2 client for file uploads
- [ ] Create presigned URL generation utility
- [ ] Implement file lifecycle management (1-hour auto-delete)
- [ ] Set up file validation middleware (type, size, magic bytes)

### Core Utilities
- [ ] Create API response wrapper (success/error format)
- [ ] Implement rate limiting middleware using Redis
- [ ] Create error handling middleware with Sentry integration
- [ ] Set up logging with structured JSON output

---

## Phase 3.2: Landing Page API (Day 2-3)

### Health & Status Endpoints
- [ ] Implement GET /api/v1/health endpoint
- [ ] Add database connectivity check
- [ ] Add Redis connectivity check
- [ ] Add S3 storage check
- [ ] Return service status and version

### Tool Directory API
- [ ] Create GET /api/v1/tools endpoint (list all tools)
- [ ] Add tool metadata (name, description, icon, route)
- [ ] Implement tool category filtering
- [ ] Add SEO metadata for each tool

---

## Phase 3.3: File Upload/Download Pipeline (Day 3-4)

### File Upload
- [ ] Implement POST /api/v1/files/upload endpoint
- [ ] Handle multipart form data with formidable/multer
- [ ] Validate file type against allowed types
- [ ] Enforce size limits (10MB free, 50MB premium)
- [ ] Upload to S3/R2 with unique key
- [ ] Store FileMetadata in database
- [ ] Return file ID and expiration time

### File Download
- [ ] Implement GET /api/v1/files/{fileId}/download
- [ ] Verify file exists and not expired
- [ ] Generate presigned download URL
- [ ] Redirect to presigned URL
- [ ] Handle expired file (410 Gone response)

---

## Phase 3.4: PDF to Word Converter (Day 4-7)

### Conversion Endpoint
- [ ] Implement POST /api/v1/convert/pdf-to-word
- [ ] Validate input file is PDF
- [ ] Create ConversionJob record in database
- [ ] Queue job with BullMQ for processing

### Processing Worker
- [ ] Create PDF to Word worker process
- [ ] Download input file from S3
- [ ] Convert using LibreOffice headless (soffice --convert-to docx)
- [ ] Alternative: Use pdf-lib + docx library for simple PDFs
- [ ] Upload output file to S3
- [ ] Update ConversionJob status to completed
- [ ] Handle OCR option for scanned documents (Tesseract.js)

### Job Status
- [ ] Implement GET /api/v1/jobs/{jobId} endpoint
- [ ] Return job status, progress, and download URL when complete
- [ ] Implement WebSocket for real-time progress updates (optional)

### Error Handling
- [ ] Handle corrupted PDF files
- [ ] Handle password-protected PDFs
- [ ] Handle timeout for large files
- [ ] Retry failed jobs (max 3 attempts)

---

## Phase 3.5: Word to PDF Converter (Day 7-9)

### Conversion Endpoint
- [ ] Implement POST /api/v1/convert/word-to-pdf
- [ ] Validate input file is DOC or DOCX
- [ ] Create ConversionJob record
- [ ] Queue job for processing

### Processing Worker
- [ ] Create Word to PDF worker
- [ ] Download input file from S3
- [ ] Convert using LibreOffice headless (soffice --convert-to pdf)
- [ ] Apply optional compression
- [ ] Upload output PDF to S3
- [ ] Update job status

### Testing
- [ ] Test with various DOCX files (tables, images, fonts)
- [ ] Test with DOC (legacy) files
- [ ] Test with large documents (100+ pages)
- [ ] Verify formatting preservation

---

## Phase 3.6: PDF to Excel Converter (Day 9-14)

### Conversion Endpoint
- [ ] Implement POST /api/v1/convert/pdf-to-excel
- [ ] Validate input file is PDF
- [ ] Accept OCR option and page range parameters
- [ ] Create ConversionJob record
- [ ] Queue job for processing

### Table Extraction Logic
- [ ] Implement table detection using pdf-parse + custom logic
- [ ] Alternative: Use tabula-py or Camelot via Python subprocess
- [ ] Handle multiple tables per page
- [ ] Handle multi-page tables
- [ ] Preserve numeric formatting

### Processing Worker
- [ ] Create PDF to Excel worker
- [ ] Download input PDF from S3
- [ ] Extract text and detect tables
- [ ] Apply OCR if enabled and needed
- [ ] Convert to XLSX using SheetJS (xlsx)
- [ ] Upload output file to S3
- [ ] Update job status

### Testing
- [ ] Test with simple table PDFs
- [ ] Test with complex multi-column tables
- [ ] Test with scanned PDFs (OCR path)
- [ ] Test with PDFs containing no tables

---

## Unit Tests Required

- [ ] File upload validation tests
- [ ] File download and expiry tests
- [ ] Rate limiting tests
- [ ] PDF to Word conversion tests (mock LibreOffice)
- [ ] Word to PDF conversion tests
- [ ] PDF to Excel extraction tests
- [ ] Job status and progress tests
- [ ] Error handling tests

---

## Integration Tests Required

- [ ] Full upload -> convert -> download flow
- [ ] Rate limit enforcement
- [ ] File expiry and cleanup
- [ ] Multiple concurrent conversions

---

**Target Coverage:** >80%
**Dependencies:** specs/api.openapi.yaml, database_schema.prisma
