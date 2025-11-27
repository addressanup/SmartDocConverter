# SmartDocConverter Architecture

## Overview

SmartDocConverter is a Next.js 14 full-stack application that provides document conversion services. It uses a modern, scalable architecture designed for high performance and maintainability.

## Technology Stack

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript 5.x
- **Styling:** Tailwind CSS 4.x
- **State Management:** Zustand
- **Data Fetching:** TanStack Query (React Query)
- **Forms:** React Hook Form + Zod validation
- **Icons:** Lucide React

### Backend
- **Runtime:** Node.js 20 LTS
- **Framework:** Next.js API Routes
- **Database:** PostgreSQL 16
- **ORM:** Prisma 5.x
- **Authentication:** NextAuth.js v5
- **File Storage:** S3/Cloudflare R2
- **Caching:** Redis (Upstash)
- **Job Queue:** BullMQ (future implementation)

### Infrastructure
- **Containerization:** Docker
- **CI/CD:** GitHub Actions
- **Hosting:** Vercel / Docker deployment

## Directory Structure

```
SmartDocConverter/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   │   ├── auth/          # Authentication endpoints
│   │   │   ├── upload/        # File upload
│   │   │   ├── convert/       # Conversion jobs
│   │   │   └── download/      # File downloads
│   │   ├── (auth)/            # Auth pages (login, register)
│   │   ├── tools/             # Conversion tool pages
│   │   ├── pricing/           # Pricing page
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Home page
│   ├── components/
│   │   ├── layout/            # Header, Footer
│   │   ├── home/              # Home page components
│   │   ├── shared/            # Reusable components
│   │   ├── auth/              # Auth forms
│   │   └── ui/                # UI primitives
│   ├── lib/
│   │   ├── auth.ts            # NextAuth configuration
│   │   ├── db.ts              # Prisma client
│   │   ├── storage.ts         # File storage utilities
│   │   └── utils.ts           # Utility functions
│   ├── store/                 # Zustand stores
│   └── types/                 # TypeScript types
├── prisma/
│   └── schema.prisma          # Database schema
├── __tests__/                 # Test files
├── public/                    # Static assets
└── docs/                      # Documentation
```

## Data Flow

### File Conversion Flow

```
1. User uploads file
   └── POST /api/upload
       └── File saved to storage
       └── FileMetadata created in DB
       └── Returns fileId

2. User initiates conversion
   └── POST /api/convert
       └── ConversionJob created
       └── Job queued for processing
       └── Returns jobId

3. Conversion processing
   └── Worker picks up job
       └── Downloads input file
       └── Performs conversion
       └── Uploads output file
       └── Updates job status

4. User downloads result
   └── GET /api/download/[fileId]
       └── Validates permissions
       └── Streams file to user
```

## Database Schema

### Core Models

- **User** - User accounts with NextAuth.js compatibility
- **Account** - OAuth provider accounts
- **Session** - User sessions
- **Subscription** - Stripe subscription data
- **FileMetadata** - Uploaded file information
- **ConversionJob** - Conversion job tracking
- **UsageTracking** - Daily usage limits

### Key Relationships

```
User
├── has many Accounts (OAuth)
├── has many Sessions
├── has one Subscription
├── has many ConversionJobs
├── has many FileMetadata
└── has many UsageTracking

ConversionJob
├── belongs to User (optional)
├── has one InputFile (FileMetadata)
└── has one OutputFile (FileMetadata)
```

## Security

### Authentication
- NextAuth.js v5 with JWT session strategy
- Credentials provider (email/password)
- OAuth providers (Google)
- Password hashing with bcryptjs

### Authorization
- Middleware-based route protection
- Role-based access (FREE, PREMIUM tiers)
- Rate limiting per user/IP

### Data Protection
- Files automatically deleted after 1 hour
- No permanent file storage
- HTTPS only in production
- Input validation with Zod

## Scalability Considerations

### Current Architecture
- Serverless-friendly design
- Stateless API routes
- External file storage (S3/R2)
- Managed database (PostgreSQL)

### Future Scaling
- Job queue with BullMQ for heavy conversions
- Redis caching for sessions and rate limits
- CDN for static assets
- Horizontal scaling with load balancer

## Monitoring & Observability

### Logging
- Structured logging for API requests
- Error tracking for failed conversions
- Usage analytics for tools

### Metrics
- Conversion success/failure rates
- Processing time tracking
- Storage usage monitoring
