# QA Agent - Todo List

## Status: IN_PROGRESS
**Phase:** 3 - Core Implementation
**Current Focus:** Testing Core PDF Tools

---

## Phase 3.1: Test Environment Setup (Day 1-2)

### Testing Infrastructure
- [ ] Set up Jest for backend unit tests
- [ ] Set up Vitest for frontend unit tests
- [ ] Set up Playwright for E2E tests
- [ ] Configure test database (PostgreSQL test instance)
- [ ] Create test file fixtures (sample PDFs, DOCs, images)
- [ ] Set up CI pipeline for automated testing

### Test Data Preparation
- [ ] Create sample PDF files (1-page, 10-page, 100-page)
- [ ] Create sample PDF with tables
- [ ] Create sample scanned PDF (for OCR testing)
- [ ] Create sample DOCX files with various formatting
- [ ] Create sample DOC (legacy) files
- [ ] Create corrupted/invalid test files
- [ ] Create password-protected PDF

---

## Phase 3.2: API Integration Tests (Day 2-4)

### Health & Status
- [ ] Test GET /api/v1/health returns correct format
- [ ] Test health check with DB down
- [ ] Test health check with Redis down

### File Upload Tests
- [ ] Test successful PDF upload
- [ ] Test successful DOCX upload
- [ ] Test file type validation (reject .exe, .js)
- [ ] Test file size limit (10MB free tier)
- [ ] Test upload without authentication
- [ ] Test upload with authentication
- [ ] Test concurrent uploads

### File Download Tests
- [ ] Test successful download with valid fileId
- [ ] Test 404 for non-existent fileId
- [ ] Test 410 for expired file
- [ ] Test presigned URL generation
- [ ] Test download after file deletion

---

## Phase 3.3: PDF to Word Conversion Tests (Day 4-6)

### Functional Tests
- [ ] Test basic PDF to DOCX conversion
- [ ] Test multi-page PDF conversion
- [ ] Test PDF with images conversion
- [ ] Test PDF with tables conversion
- [ ] Test PDF with special characters
- [ ] Test scanned PDF with OCR enabled
- [ ] Test scanned PDF without OCR (should fail gracefully)

### Edge Cases
- [ ] Test empty PDF (0 pages)
- [ ] Test very large PDF (100+ pages)
- [ ] Test corrupted PDF file
- [ ] Test password-protected PDF
- [ ] Test PDF with embedded fonts
- [ ] Test PDF with form fields

### Error Handling
- [ ] Test invalid file type submitted
- [ ] Test missing fileId parameter
- [ ] Test conversion timeout handling
- [ ] Test worker failure recovery

### Performance Tests
- [ ] Measure conversion time for 1-page PDF
- [ ] Measure conversion time for 10-page PDF
- [ ] Measure conversion time for 50-page PDF
- [ ] Verify < 30s for files under 10MB

---

## Phase 3.4: Word to PDF Conversion Tests (Day 6-7)

### Functional Tests
- [ ] Test DOCX to PDF conversion
- [ ] Test DOC (legacy) to PDF conversion
- [ ] Test document with images
- [ ] Test document with tables
- [ ] Test document with headers/footers
- [ ] Test document with hyperlinks

### Edge Cases
- [ ] Test empty document
- [ ] Test very large document (100+ pages)
- [ ] Test corrupted DOCX file
- [ ] Test DOCX with macros (should strip macros)
- [ ] Test document with custom fonts

### Compression Tests
- [ ] Test without compression
- [ ] Test with low compression
- [ ] Test with high compression
- [ ] Verify file size reduction

---

## Phase 3.5: PDF to Excel Conversion Tests (Day 7-9)

### Table Extraction Tests
- [ ] Test simple single-table PDF
- [ ] Test multi-table PDF (2-3 tables)
- [ ] Test table spanning multiple pages
- [ ] Test PDF with merged cells
- [ ] Test PDF with numeric data
- [ ] Test PDF with currency formatting
- [ ] Test PDF with dates

### OCR Tests
- [ ] Test scanned table with OCR
- [ ] Test handwritten table (expect lower accuracy)
- [ ] Test mixed typed/scanned content

### Page Range Tests
- [ ] Test specific page extraction (page 2 only)
- [ ] Test page range (pages 1-5)
- [ ] Test non-contiguous pages (1, 3, 5)
- [ ] Test "all" pages option

### Output Format Tests
- [ ] Test XLSX output format
- [ ] Test CSV output format
- [ ] Verify data integrity in both formats

### Edge Cases
- [ ] Test PDF with no tables
- [ ] Test PDF with complex nested tables
- [ ] Test PDF with rotated text
- [ ] Test PDF with multiple columns

---

## Phase 3.6: Rate Limiting Tests (Day 9-10)

### Free Tier Limits
- [ ] Test 5 conversions allowed
- [ ] Test 6th conversion blocked (429)
- [ ] Test limit reset after 24 hours
- [ ] Test different tools count toward same limit

### Anonymous vs Authenticated
- [ ] Test rate limit for anonymous user
- [ ] Test rate limit for logged-in free user
- [ ] Test no limit for premium user

### Fingerprinting
- [ ] Test rate limit persists across sessions
- [ ] Test rate limit with different browsers (same user)
- [ ] Test IP-based rate limiting

---

## Phase 3.7: UI/UX Tests (Day 10-12)

### Landing Page E2E
- [ ] Test page loads under 3 seconds
- [ ] Test tool grid displays all tools
- [ ] Test category filtering works
- [ ] Test search functionality
- [ ] Test navigation to tool pages

### Conversion Flow E2E
- [ ] Test file drag-and-drop upload
- [ ] Test file picker upload
- [ ] Test progress indicator displays
- [ ] Test successful conversion completes
- [ ] Test download button works
- [ ] Test "Convert Another" resets state

### Error States E2E
- [ ] Test invalid file type error display
- [ ] Test file too large error display
- [ ] Test network error handling
- [ ] Test rate limit error and upgrade prompt

### Mobile E2E
- [ ] Test landing page on mobile
- [ ] Test file upload on mobile
- [ ] Test conversion flow on mobile
- [ ] Test download on mobile

---

## Phase 3.8: Cross-Browser Testing (Day 12)

### Desktop Browsers
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

### Mobile Browsers
- [ ] iOS Safari
- [ ] Chrome Mobile (Android)

### File Handling Compatibility
- [ ] Test file picker on each browser
- [ ] Test drag-and-drop on each browser
- [ ] Test download behavior on each browser

---

## Phase 3.9: Security Testing (Day 12-13)

### File Upload Security
- [ ] Test for path traversal attacks
- [ ] Test for malicious file upload
- [ ] Test file type spoofing (renamed .exe to .pdf)
- [ ] Test MIME type validation

### API Security
- [ ] Test SQL injection in parameters
- [ ] Test XSS in error messages
- [ ] Test CSRF protection
- [ ] Test authentication bypass attempts

### Rate Limiting Security
- [ ] Test rate limit bypass attempts
- [ ] Test distributed attack simulation

---

## Phase 3.10: Performance Testing (Day 13-14)

### Load Testing
- [ ] Test 10 concurrent conversions
- [ ] Test 50 concurrent conversions
- [ ] Test 100 concurrent conversions
- [ ] Measure response times under load

### Stress Testing
- [ ] Test system behavior at capacity
- [ ] Test recovery after overload
- [ ] Test queue behavior under stress

### Benchmarks
- [ ] Document baseline performance metrics
- [ ] Create performance regression tests

---

## Test Reports Required

- [ ] Unit test coverage report (>80% backend, >75% frontend)
- [ ] Integration test results
- [ ] E2E test results
- [ ] Performance test report
- [ ] Security test findings
- [ ] Browser compatibility matrix
- [ ] Bug report with severity ratings

---

## Bug Tracking

### Critical Bugs (P0)
- Blocking functionality
- Security vulnerabilities
- Data loss

### High Bugs (P1)
- Major feature broken
- Poor user experience

### Medium Bugs (P2)
- Minor feature issues
- Edge case failures

### Low Bugs (P3)
- Cosmetic issues
- Minor improvements

---

**Dependencies:** Backend API complete, Frontend UI complete
**Tools:** Jest, Vitest, Playwright, k6 (load testing)
