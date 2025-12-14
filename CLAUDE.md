# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SmartDocConverter is a SaaS document conversion platform built with Next.js 14. It provides browser-based tools for converting between PDF, Word, Excel, images, and other formats. The app supports both anonymous users (with daily limits) and authenticated users with premium subscriptions via Stripe.

## Development Commands

```bash
# Development
npm run dev              # Start dev server at localhost:3000

# Build & Production
npm run build            # Run prisma generate + next build
npm run start            # Start production server

# Database
npm run db:generate      # Generate Prisma client
npm run db:push          # Push schema to database (no migration)
npm run db:migrate       # Create and run migrations
npm run db:studio        # Open Prisma Studio GUI

# Testing
npm run test             # Run Jest unit tests
npm run test:watch       # Jest in watch mode
npm run test:coverage    # Jest with coverage report
npm run test:e2e         # Run Playwright E2E tests
npm run test:e2e:ui      # Playwright with UI mode
npm run test:e2e:headed  # Playwright in headed browser

# Linting
npm run lint             # Run Next.js ESLint
```

## Architecture

### Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Database**: PostgreSQL with Prisma ORM
- **Auth**: NextAuth.js v5 (credentials + Google OAuth)
- **State Management**: Zustand
- **Payments**: Stripe (subscriptions + webhooks)
- **Styling**: Tailwind CSS v4
- **Testing**: Jest + React Testing Library + Playwright

### Project Structure
```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   │   ├── auth/          # NextAuth endpoints
│   │   ├── convert/       # Async conversion job API
│   │   ├── convert-sync/  # Synchronous conversion API
│   │   ├── upload/        # File upload handling
│   │   ├── download/      # File download by job ID
│   │   └── stripe/        # Stripe checkout & webhooks
│   └── tools/             # Conversion tool pages (pdf-to-word, etc.)
├── components/
│   ├── auth/              # Login/Register forms, UserMenu
│   ├── home/              # Homepage sections (Hero, Features, Pricing)
│   ├── layout/            # Header, Footer, PageLayout
│   ├── shared/            # FileUploader, ConversionStatus
│   └── ui/                # Button, ProgressBar
├── lib/
│   ├── converters/        # Document conversion functions
│   ├── auth.ts            # NextAuth configuration
│   ├── db.ts              # Prisma client singleton
│   ├── stripe.ts          # Stripe client setup
│   ├── usage.ts           # Usage tracking/limits
│   └── ratelimit.ts       # Upstash rate limiting
└── store/
    └── conversion.ts      # Zustand store for conversion state
```

### Conversion Architecture

The conversion system uses a job-based async pattern:

1. **Upload** (`/api/upload`): Files uploaded to temp storage, returns `fileId` and `filePath`
2. **Convert** (`/api/convert`): Creates job, processes asynchronously, returns `jobId`
3. **Poll Status**: Frontend polls `/api/convert?jobId=X` for progress
4. **Download** (`/api/download/[jobId]`): Returns converted file when complete

Converters are in `src/lib/converters/` and follow this pattern:
```typescript
export async function convertX(inputPath: string, options?: Options): Promise<string> {
  // Returns path to output file
}
```

Key libraries used:
- `pdf-lib` - PDF manipulation
- `pdf-parse` - PDF text extraction
- `docx` - Word document generation
- `xlsx` - Excel file handling
- `sharp` - Image processing
- `tesseract.js` - OCR for image-to-text

### Authentication Flow

NextAuth.js v5 with JWT sessions:
- Credentials provider (email/password with bcrypt)
- Google OAuth (optional, requires env vars)
- Session data includes user ID and tier (FREE/PREMIUM)
- Protected routes handled in middleware

### Database Schema

Key models in `prisma/schema.prisma`:
- `User` - with tier (FREE/PREMIUM)
- `Subscription` - Stripe subscription tracking
- `ConversionJob` - Job queue with status tracking
- `FileMetadata` - Uploaded file records
- `UsageTracking` - Daily usage limits per user/fingerprint

### Environment Variables

Required:
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_SECRET` - Auth encryption key
- `NEXTAUTH_URL` - App URL for auth callbacks

Optional:
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` - OAuth
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` - Payments
- `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` - Rate limiting

## Key Patterns

### Adding a New Converter

1. Create converter in `src/lib/converters/new-converter.ts`
2. Add to `getConverter()` switch in `src/app/api/convert/route.ts`
3. Add type to `ConversionType` union
4. Create tool page at `src/app/tools/new-tool/page.tsx`

### API Route Conventions

API routes use Next.js route handlers with:
- `export const runtime = 'nodejs'` for file operations
- `export const dynamic = 'force-dynamic'` for no caching
- `export const maxDuration = 60` for longer timeouts on Vercel

### State Management

Conversion UI state is managed by Zustand store (`src/store/conversion.ts`):
- Tracks: idle → uploading → processing → completed/error
- Stores: progress, downloadUrl, jobId, error

## Testing

- Unit tests in `__tests__/` directories alongside code
- E2E tests in `e2e/` directory
- Jest configured with path alias `@/` → `src/`
- Playwright tests run against `localhost:3000`
