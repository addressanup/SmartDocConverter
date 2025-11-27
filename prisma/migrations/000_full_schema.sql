-- ============================================================================
-- SmartDocConverter - Complete Database Schema
-- Run this in Supabase SQL Editor to set up the entire database
-- ============================================================================

-- ============================================================================
-- STEP 1: CREATE ENUM TYPES
-- ============================================================================

CREATE TYPE "UserTier" AS ENUM ('FREE', 'PREMIUM');

CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'CANCELED', 'PAST_DUE', 'TRIALING', 'INCOMPLETE');

CREATE TYPE "SubscriptionPlan" AS ENUM ('MONTHLY', 'ANNUAL');

CREATE TYPE "JobStatus" AS ENUM ('QUEUED', 'PROCESSING', 'COMPLETED', 'FAILED');

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

-- ============================================================================
-- STEP 2: CREATE HELPER FUNCTIONS
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- ============================================================================
-- STEP 3: CREATE USERS TABLE
-- ============================================================================

CREATE TABLE "users" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "name" TEXT,
  "email" TEXT NOT NULL,
  "emailVerified" TIMESTAMP(3),
  "image" TEXT,
  "password" TEXT,
  "tier" "UserTier" NOT NULL DEFAULT 'FREE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE INDEX "users_email_idx" ON "users"("email");
CREATE INDEX "users_tier_idx" ON "users"("tier");

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON "users"
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- STEP 4: CREATE AUTH TABLES (NextAuth.js compatible)
-- ============================================================================

CREATE TABLE "accounts" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "userId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "providerAccountId" TEXT NOT NULL,
  "refresh_token" TEXT,
  "access_token" TEXT,
  "expires_at" INTEGER,
  "token_type" TEXT,
  "scope" TEXT,
  "id_token" TEXT,
  "session_state" TEXT,

  CONSTRAINT "accounts_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "accounts_provider_providerAccountId_key" ON "accounts"("provider", "providerAccountId");
CREATE INDEX "accounts_userId_idx" ON "accounts"("userId");

CREATE TABLE "sessions" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "sessionToken" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "expires" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "sessions_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "sessions_sessionToken_key" ON "sessions"("sessionToken");
CREATE INDEX "sessions_userId_idx" ON "sessions"("userId");

CREATE TABLE "verification_tokens" (
  "identifier" TEXT NOT NULL,
  "token" TEXT NOT NULL,
  "expires" TIMESTAMP(3) NOT NULL
);

CREATE UNIQUE INDEX "verification_tokens_token_key" ON "verification_tokens"("token");
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");

CREATE TABLE "password_reset_tokens" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "email" TEXT NOT NULL,
  "token" TEXT NOT NULL,
  "expires" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "password_reset_tokens_token_key" ON "password_reset_tokens"("token");
CREATE INDEX "password_reset_tokens_email_idx" ON "password_reset_tokens"("email");

-- ============================================================================
-- STEP 5: CREATE SUBSCRIPTIONS TABLE
-- ============================================================================

CREATE TABLE "subscriptions" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "userId" TEXT NOT NULL,
  "stripeCustomerId" TEXT NOT NULL,
  "stripeSubscriptionId" TEXT,
  "stripePriceId" TEXT,
  "status" "SubscriptionStatus" NOT NULL DEFAULT 'INCOMPLETE',
  "plan" "SubscriptionPlan",
  "currentPeriodStart" TIMESTAMP(3),
  "currentPeriodEnd" TIMESTAMP(3),
  "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
  "trialStart" TIMESTAMP(3),
  "trialEnd" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "subscriptions_userId_key" ON "subscriptions"("userId");
CREATE UNIQUE INDEX "subscriptions_stripeCustomerId_key" ON "subscriptions"("stripeCustomerId");
CREATE UNIQUE INDEX "subscriptions_stripeSubscriptionId_key" ON "subscriptions"("stripeSubscriptionId");
CREATE INDEX "subscriptions_stripeCustomerId_idx" ON "subscriptions"("stripeCustomerId");
CREATE INDEX "subscriptions_stripeSubscriptionId_idx" ON "subscriptions"("stripeSubscriptionId");
CREATE INDEX "subscriptions_status_idx" ON "subscriptions"("status");

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON "subscriptions"
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- STEP 6: CREATE FILE METADATA TABLE
-- ============================================================================

CREATE TABLE "file_metadata" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "userId" TEXT,
  "originalName" TEXT NOT NULL,
  "storagePath" TEXT NOT NULL,
  "mimeType" TEXT NOT NULL,
  "fileType" "FileType" NOT NULL,
  "size" INTEGER NOT NULL,
  "checksum" TEXT,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "deleted" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "file_metadata_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "file_metadata_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "file_metadata_storagePath_key" ON "file_metadata"("storagePath");
CREATE INDEX "file_metadata_userId_idx" ON "file_metadata"("userId");
CREATE INDEX "file_metadata_expiresAt_idx" ON "file_metadata"("expiresAt");
CREATE INDEX "file_metadata_deleted_idx" ON "file_metadata"("deleted");

-- ============================================================================
-- STEP 7: CREATE CONVERSION JOBS TABLE
-- ============================================================================

CREATE TABLE "conversion_jobs" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "userId" TEXT,
  "type" "ConversionType" NOT NULL,
  "status" "JobStatus" NOT NULL DEFAULT 'QUEUED',
  "progress" INTEGER NOT NULL DEFAULT 0,
  "inputFileId" TEXT NOT NULL,
  "outputFileId" TEXT,
  "options" JSONB,
  "error" TEXT,
  "processingTime" INTEGER,
  "queuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "startedAt" TIMESTAMP(3),
  "completedAt" TIMESTAMP(3),

  CONSTRAINT "conversion_jobs_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "conversion_jobs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "conversion_jobs_inputFileId_fkey" FOREIGN KEY ("inputFileId") REFERENCES "file_metadata"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "conversion_jobs_outputFileId_fkey" FOREIGN KEY ("outputFileId") REFERENCES "file_metadata"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "conversion_jobs_userId_idx" ON "conversion_jobs"("userId");
CREATE INDEX "conversion_jobs_status_idx" ON "conversion_jobs"("status");
CREATE INDEX "conversion_jobs_type_idx" ON "conversion_jobs"("type");
CREATE INDEX "conversion_jobs_queuedAt_idx" ON "conversion_jobs"("queuedAt");

-- ============================================================================
-- STEP 8: CREATE USAGE TRACKING TABLE
-- ============================================================================

CREATE TABLE "usage_tracking" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "userId" TEXT,
  "fingerprint" TEXT,
  "ipAddress" TEXT,
  "date" DATE NOT NULL,
  "conversionsUsed" INTEGER NOT NULL DEFAULT 0,
  "bytesProcessed" BIGINT NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "usage_tracking_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "usage_tracking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "usage_tracking_userId_date_key" ON "usage_tracking"("userId", "date");
CREATE UNIQUE INDEX "usage_tracking_fingerprint_date_key" ON "usage_tracking"("fingerprint", "date");
CREATE INDEX "usage_tracking_date_idx" ON "usage_tracking"("date");
CREATE INDEX "usage_tracking_ipAddress_date_idx" ON "usage_tracking"("ipAddress", "date");

CREATE TRIGGER update_usage_tracking_updated_at
  BEFORE UPDATE ON "usage_tracking"
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- STEP 9: CREATE ANALYTICS TABLE
-- ============================================================================

CREATE TABLE "tool_analytics" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "date" DATE NOT NULL,
  "toolType" "ConversionType" NOT NULL,
  "totalJobs" INTEGER NOT NULL DEFAULT 0,
  "successJobs" INTEGER NOT NULL DEFAULT 0,
  "failedJobs" INTEGER NOT NULL DEFAULT 0,
  "avgProcessingTime" INTEGER,
  "totalBytesIn" BIGINT NOT NULL DEFAULT 0,
  "totalBytesOut" BIGINT NOT NULL DEFAULT 0,

  CONSTRAINT "tool_analytics_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "tool_analytics_date_toolType_key" ON "tool_analytics"("date", "toolType");
CREATE INDEX "tool_analytics_date_idx" ON "tool_analytics"("date");

-- ============================================================================
-- STEP 10: CREATE WEBHOOK EVENTS TABLE
-- ============================================================================

CREATE TABLE "webhook_events" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "stripeEventId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "data" JSONB NOT NULL,
  "processed" BOOLEAN NOT NULL DEFAULT false,
  "error" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "processedAt" TIMESTAMP(3),

  CONSTRAINT "webhook_events_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "webhook_events_stripeEventId_key" ON "webhook_events"("stripeEventId");
CREATE INDEX "webhook_events_type_idx" ON "webhook_events"("type");
CREATE INDEX "webhook_events_processed_idx" ON "webhook_events"("processed");

-- ============================================================================
-- SETUP COMPLETE!
-- ============================================================================
