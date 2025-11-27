# DevOps Agent - Todo List

## Status: PENDING
**Phase:** 4 - Infrastructure & Testing
**Current Focus:** Docker, CI/CD, Deployment

---

## Phase 4.1: Local Development Environment (Day 1)

### Docker Setup
- [ ] Create Dockerfile for Next.js app (multi-stage build)
- [ ] Create Dockerfile for LibreOffice worker
- [ ] Create docker-compose.yml with all services:
  - Next.js app (port 3000)
  - PostgreSQL (port 5432)
  - Redis (port 6379)
  - LibreOffice worker
- [ ] Create docker-compose.override.yml for dev settings
- [ ] Add volume mounts for hot reload
- [ ] Create .dockerignore file

### Environment Configuration
- [ ] Create .env.example with all required variables
- [ ] Document environment variables in README
- [ ] Create .env.local template for development
- [ ] Set up environment validation on startup

---

## Phase 4.2: CI/CD Pipeline (Day 2-3)

### GitHub Actions - CI
- [ ] Create .github/workflows/ci.yml
- [ ] Add lint step (ESLint, Prettier)
- [ ] Add type checking step (tsc --noEmit)
- [ ] Add unit test step (Jest, Vitest)
- [ ] Add build verification step
- [ ] Configure test coverage reporting
- [ ] Add caching for node_modules and .next

### GitHub Actions - Deploy Preview
- [ ] Create .github/workflows/preview.yml
- [ ] Deploy preview on PR open/update
- [ ] Post preview URL as PR comment
- [ ] Clean up preview on PR close

### GitHub Actions - Production Deploy
- [ ] Create .github/workflows/deploy.yml
- [ ] Deploy on merge to main
- [ ] Run database migrations
- [ ] Notify on success/failure (Slack/Discord)

---

## Phase 4.3: Vercel Deployment (Day 3-4)

### Vercel Setup
- [ ] Connect GitHub repository to Vercel
- [ ] Configure build settings for Next.js
- [ ] Set up environment variables in Vercel
- [ ] Configure preview deployments
- [ ] Set up custom domain

### Environment Variables
- [ ] DATABASE_URL (Supabase connection string)
- [ ] REDIS_URL (Upstash connection string)
- [ ] NEXTAUTH_SECRET
- [ ] NEXTAUTH_URL
- [ ] GOOGLE_CLIENT_ID (OAuth)
- [ ] GOOGLE_CLIENT_SECRET
- [ ] STRIPE_SECRET_KEY
- [ ] STRIPE_WEBHOOK_SECRET
- [ ] S3_ACCESS_KEY_ID
- [ ] S3_SECRET_ACCESS_KEY
- [ ] S3_BUCKET_NAME
- [ ] S3_REGION
- [ ] SENTRY_DSN
- [ ] ADSENSE_CLIENT_ID

---

## Phase 4.4: Worker Deployment (Day 4)

### LibreOffice Worker
- [ ] Create worker Docker image with LibreOffice
- [ ] Deploy to AWS Lambda or Railway
- [ ] Configure auto-scaling (1-50 instances)
- [ ] Set up health check endpoint
- [ ] Configure timeout settings (5 minutes max)

### Queue Configuration
- [ ] Configure BullMQ with Redis
- [ ] Set up retry policies (3 retries, exponential backoff)
- [ ] Configure job cleanup (remove completed after 1 hour)
- [ ] Set up dead letter queue for failed jobs

---

## Phase 4.5: Database & Storage (Day 4)

### PostgreSQL (Supabase)
- [ ] Create production database
- [ ] Configure connection pooling
- [ ] Set up automated backups
- [ ] Create read replica (if needed)
- [ ] Configure Row Level Security (optional)

### Redis (Upstash)
- [ ] Create production Redis instance
- [ ] Configure max memory policy
- [ ] Set up persistence (optional)

### File Storage (Cloudflare R2)
- [ ] Create R2 bucket
- [ ] Configure CORS settings
- [ ] Set up lifecycle rules (1-hour expiry)
- [ ] Configure presigned URL permissions

---

## Phase 4.6: Monitoring & Logging (Day 5)

### Sentry (Error Tracking)
- [ ] Create Sentry project
- [ ] Install @sentry/nextjs
- [ ] Configure error boundaries
- [ ] Set up release tracking
- [ ] Configure environment tags

### Logging
- [ ] Set up structured logging (JSON format)
- [ ] Configure log levels per environment
- [ ] Set up log aggregation (Vercel logs or external)

### Uptime Monitoring
- [ ] Set up BetterStack (BetterUptime)
- [ ] Configure health check endpoint monitoring
- [ ] Set up status page
- [ ] Configure alert notifications

### Performance Monitoring
- [ ] Enable Vercel Analytics
- [ ] Set up Core Web Vitals tracking
- [ ] Configure custom performance metrics
- [ ] Set up alerting for degraded performance

---

## Phase 4.7: Security Configuration (Day 5)

### SSL/TLS
- [ ] Verify HTTPS-only (Vercel automatic)
- [ ] Configure HSTS header
- [ ] Set up SSL certificate monitoring

### Security Headers
- [ ] Configure Content-Security-Policy
- [ ] Set X-Frame-Options
- [ ] Set X-Content-Type-Options
- [ ] Configure Referrer-Policy
- [ ] Add Permissions-Policy

### Secrets Management
- [ ] Audit all secrets in environment variables
- [ ] Verify no secrets in code or git history
- [ ] Set up secret rotation plan
- [ ] Document secret access procedures

### DDoS Protection
- [ ] Enable Vercel DDoS protection
- [ ] Consider Cloudflare if needed
- [ ] Configure rate limiting at edge

---

## Deliverables Checklist

### Files to Create
- [ ] Dockerfile (Next.js app)
- [ ] Dockerfile.worker (LibreOffice worker)
- [ ] docker-compose.yml
- [ ] docker-compose.override.yml
- [ ] .github/workflows/ci.yml
- [ ] .github/workflows/preview.yml
- [ ] .github/workflows/deploy.yml
- [ ] .env.example
- [ ] vercel.json (if needed)
- [ ] sentry.client.config.ts
- [ ] sentry.server.config.ts

### Configuration to Document
- [ ] Environment variable reference
- [ ] Deployment checklist
- [ ] Rollback procedures
- [ ] Incident response playbook

---

**Dependencies:** Phase 3 implementation complete
**Tools:** Docker, GitHub Actions, Vercel, Supabase, Upstash, Cloudflare R2, Sentry, BetterStack
