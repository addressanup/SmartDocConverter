# Frontend Agent - Todo List

## Status: IN_PROGRESS
**Phase:** 3 - Core Implementation
**Current Feature:** Landing Page & Conversion UI

---

## Phase 3.1: Project Setup & Core Components (Day 1-2)

### UI Framework Setup
- [ ] Install and configure shadcn/ui components
- [ ] Set up Tailwind CSS with custom theme (colors, fonts)
- [ ] Configure dark mode support
- [ ] Create base layout component (header, footer, main)
- [ ] Set up responsive breakpoints

### State Management
- [ ] Install and configure Zustand for global state
- [ ] Install and configure TanStack Query for server state
- [ ] Create API client base with axios/fetch
- [ ] Set up error boundary component

### Shared Components
- [ ] Create FileUploader component (react-dropzone)
  - Drag-and-drop zone
  - File type validation display
  - Size limit indicator
  - Progress bar during upload
- [ ] Create ProgressBar component (circular and linear)
- [ ] Create DownloadButton component
- [ ] Create LoadingSpinner component
- [ ] Create ErrorMessage component
- [ ] Create Toast notification system

---

## Phase 3.2: Landing Page (Day 2-4)

### Hero Section
- [ ] Create Hero component with value proposition
- [ ] Add animated background or illustration
- [ ] Create "Get Started Free" CTA button
- [ ] Add trust indicators (file count processed, etc.)

### Tool Grid
- [ ] Create ToolCard component
  - Icon, title, description
  - Hover state with animation
  - Link to tool page
- [ ] Create ToolGrid component with category filters
- [ ] Implement tool categories (PDF, Image, Document, Data)
- [ ] Add search functionality for tools
- [ ] Create "Popular Tools" section

### Features Section
- [ ] Create feature highlight cards
  - Fast processing
  - Privacy-focused
  - No registration required
  - Mobile-friendly
- [ ] Add icons/illustrations for each feature

### Pricing Section
- [ ] Create PricingCard component
- [ ] Show Free vs Premium comparison
- [ ] Add feature checklist for each tier
- [ ] Create "Upgrade to Premium" CTA

### Footer
- [ ] Create Footer component
- [ ] Add tool categories links
- [ ] Add legal links (Privacy, Terms)
- [ ] Add social media links
- [ ] Add newsletter signup (optional)

### SEO
- [ ] Configure Next.js metadata for landing page
- [ ] Add Open Graph tags
- [ ] Add structured data (JSON-LD)
- [ ] Create dynamic sitemap

---

## Phase 3.3: Tool Page Template (Day 4-5)

### Reusable Tool Layout
- [ ] Create ToolPageLayout component
  - Breadcrumb navigation
  - Tool title and description
  - Main conversion area
  - Related tools sidebar
  - FAQ section
- [ ] Create SEO metadata template for tools

### Conversion Flow UI
- [ ] Create ConversionFlow component
  - Step 1: File Upload
  - Step 2: Options (if any)
  - Step 3: Processing
  - Step 4: Download
- [ ] Handle state transitions between steps
- [ ] Add "Convert Another" reset functionality

### Options Panel
- [ ] Create OptionsPanel component (expandable)
- [ ] Support different option types:
  - Checkboxes (OCR enabled)
  - Dropdowns (compression level)
  - Number inputs (DPI, quality)
  - Page range selector

---

## Phase 3.4: PDF to Word Tool Page (Day 5-7)

### Tool-Specific UI
- [ ] Create PdfToWordPage component
- [ ] Configure allowed file types (.pdf)
- [ ] Add OCR toggle option
- [ ] Show conversion progress with steps

### API Integration
- [ ] Create pdfToWord API client function
- [ ] Handle file upload to /api/v1/files/upload
- [ ] Call /api/v1/convert/pdf-to-word
- [ ] Poll /api/v1/jobs/{jobId} for status
- [ ] Handle download when complete

### User Feedback
- [ ] Show file info after upload (name, size, pages)
- [ ] Display conversion progress percentage
- [ ] Show success message with file size comparison
- [ ] Handle and display errors gracefully

### Testing
- [ ] Test upload flow with various PDF sizes
- [ ] Test cancellation during processing
- [ ] Test error handling (network failure, invalid file)
- [ ] Test mobile responsiveness

---

## Phase 3.5: Word to PDF Tool Page (Day 7-8)

### Tool-Specific UI
- [ ] Create WordToPdfPage component
- [ ] Configure allowed file types (.doc, .docx)
- [ ] Add compression toggle option
- [ ] Reuse ConversionFlow component

### API Integration
- [ ] Create wordToPdf API client function
- [ ] Integrate with upload and conversion endpoints
- [ ] Handle job status polling

### Testing
- [ ] Test with DOC and DOCX files
- [ ] Test compression option
- [ ] Verify download works correctly

---

## Phase 3.6: PDF to Excel Tool Page (Day 8-10)

### Tool-Specific UI
- [ ] Create PdfToExcelPage component
- [ ] Configure allowed file types (.pdf)
- [ ] Add options:
  - OCR toggle
  - Page range selector
  - Output format (XLSX/CSV)

### Preview Feature
- [ ] Create TablePreview component
- [ ] Show extracted tables before download
- [ ] Allow column mapping adjustments (advanced)

### API Integration
- [ ] Create pdfToExcel API client function
- [ ] Handle multi-step conversion (extract -> preview -> download)
- [ ] Support page range parameter

### Testing
- [ ] Test with various PDF table layouts
- [ ] Test OCR with scanned documents
- [ ] Test preview functionality

---

## Phase 3.7: Common Features (Day 10-12)

### Rate Limit UI
- [ ] Create UsageMeter component
- [ ] Show "X of 5 conversions used today"
- [ ] Display upgrade prompt when limit reached
- [ ] Handle rate limit error (429) gracefully

### Mobile Optimization
- [ ] Test all pages on mobile viewports
- [ ] Optimize touch targets (44px minimum)
- [ ] Implement mobile-specific file picker
- [ ] Test on iOS Safari and Android Chrome

### Accessibility
- [ ] Add ARIA labels to all interactive elements
- [ ] Ensure keyboard navigation works
- [ ] Test with screen reader (VoiceOver)
- [ ] Verify color contrast ratios

### Performance
- [ ] Implement lazy loading for tool pages
- [ ] Optimize images with Next.js Image
- [ ] Add loading skeletons
- [ ] Run Lighthouse audit and fix issues

---

## Component Tests Required

- [ ] FileUploader component tests
- [ ] ProgressBar component tests
- [ ] ToolCard component tests
- [ ] ConversionFlow component tests
- [ ] OptionsPanel component tests
- [ ] API client function tests (mocked)

---

## E2E Tests Required (Playwright)

- [ ] Landing page loads correctly
- [ ] Tool navigation works
- [ ] File upload flow completes
- [ ] Conversion success path
- [ ] Error handling displays correctly
- [ ] Mobile viewport tests

---

**Target Coverage:** >75%
**Dependencies:** Backend API endpoints, specs/api.openapi.yaml
