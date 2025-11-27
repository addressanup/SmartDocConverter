-- SmartDocConverter Database Setup
-- Step 6: Create Usage Tracking table

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

-- Unique constraints (one record per user/fingerprint per day)
CREATE UNIQUE INDEX "usage_tracking_userId_date_key" ON "usage_tracking"("userId", "date");
CREATE UNIQUE INDEX "usage_tracking_fingerprint_date_key" ON "usage_tracking"("fingerprint", "date");

-- Indexes
CREATE INDEX "usage_tracking_date_idx" ON "usage_tracking"("date");
CREATE INDEX "usage_tracking_ipAddress_date_idx" ON "usage_tracking"("ipAddress", "date");

-- Trigger to auto-update updatedAt
CREATE TRIGGER update_usage_tracking_updated_at
  BEFORE UPDATE ON "usage_tracking"
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
