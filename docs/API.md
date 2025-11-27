# SmartDocConverter API Documentation

## Overview

SmartDocConverter provides a REST API for document conversion operations. All endpoints are available at `/api/`.

## Authentication

The API uses NextAuth.js for authentication. Protected endpoints require a valid session token.

### Public Endpoints
- `POST /api/upload` - File upload (with rate limiting for anonymous users)
- `POST /api/convert` - Start conversion job
- `GET /api/convert?jobId=xxx` - Check job status
- `GET /api/download/[fileId]` - Download converted file

### Protected Endpoints (Require Authentication)
- `GET /api/user/profile` - Get user profile
- `GET /api/user/conversions` - Get conversion history
- `POST /api/subscription/create` - Create subscription

## Endpoints

### File Upload

Upload a file for conversion.

```http
POST /api/upload
Content-Type: multipart/form-data
```

**Request Body:**
| Field | Type | Description |
|-------|------|-------------|
| file | File | The file to upload (max 10MB for free, 50MB for premium) |

**Response:**
```json
{
  "success": true,
  "fileId": "abc123",
  "fileName": "document.pdf",
  "fileSize": 1048576,
  "filePath": "/uploads/abc123.pdf",
  "mimeType": "application/pdf"
}
```

**Error Response:**
```json
{
  "error": "File size exceeds the maximum limit"
}
```

### Start Conversion

Start a conversion job.

```http
POST /api/convert
Content-Type: application/json
```

**Request Body:**
```json
{
  "fileId": "abc123",
  "filePath": "/uploads/abc123.pdf",
  "conversionType": "pdf-to-word",
  "options": {}
}
```

**Conversion Types:**
- `pdf-to-word` - PDF to DOCX
- `word-to-pdf` - DOCX/DOC to PDF
- `pdf-to-excel` - PDF to XLSX
- `compress-pdf` - Compress PDF
- `merge-pdf` - Merge multiple PDFs
- `split-pdf` - Split PDF into pages
- `jpg-to-pdf` - Images to PDF
- `pdf-to-jpg` - PDF to images
- `image-to-text` - OCR text extraction

**Response:**
```json
{
  "success": true,
  "jobId": "job123",
  "status": "queued",
  "message": "Conversion job created"
}
```

### Check Job Status

Check the status of a conversion job.

```http
GET /api/convert?jobId=job123
```

**Response:**
```json
{
  "jobId": "job123",
  "status": "completed",
  "progress": 100,
  "downloadUrl": "/api/download/output123"
}
```

**Status Values:**
- `queued` - Job is waiting to be processed
- `processing` - Job is being processed
- `completed` - Job finished successfully
- `failed` - Job failed with an error

### Download File

Download a converted file.

```http
GET /api/download/[fileId]?name=document.docx
```

**Response:**
Binary file download with appropriate Content-Type header.

## Authentication Endpoints

### Register

Create a new user account.

```http
POST /api/auth/register
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

### Login

Handled by NextAuth.js at `/api/auth/[...nextauth]`.

## Rate Limiting

| User Type | Daily Limit | Max File Size |
|-----------|-------------|---------------|
| Anonymous | 5 conversions | 10MB |
| Free | 5 conversions | 10MB |
| Premium | Unlimited | 50MB |
| Annual | Unlimited | 100MB |

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 413 | Payload Too Large - File exceeds size limit |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error |

## Webhooks (Coming Soon)

Webhook notifications for conversion completion will be available for Premium users.
