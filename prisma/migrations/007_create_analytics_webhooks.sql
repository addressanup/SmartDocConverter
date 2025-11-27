-- SmartDocConverter Database Setup
-- Step 7: Create Analytics and Webhook Events tables

-- Tool Analytics table (aggregated stats, no PII)
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

-- Unique constraint (one record per tool per day)
CREATE UNIQUE INDEX "tool_analytics_date_toolType_key" ON "tool_analytics"("date", "toolType");
CREATE INDEX "tool_analytics_date_idx" ON "tool_analytics"("date");

-- Webhook Events table (Stripe webhook tracking)
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

-- Unique constraint on Stripe event ID (idempotency)
CREATE UNIQUE INDEX "webhook_events_stripeEventId_key" ON "webhook_events"("stripeEventId");
CREATE INDEX "webhook_events_type_idx" ON "webhook_events"("type");
CREATE INDEX "webhook_events_processed_idx" ON "webhook_events"("processed");
