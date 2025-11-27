-- SmartDocConverter Database Setup
-- Step 5: Create Conversion Jobs table

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

-- Indexes
CREATE INDEX "conversion_jobs_userId_idx" ON "conversion_jobs"("userId");
CREATE INDEX "conversion_jobs_status_idx" ON "conversion_jobs"("status");
CREATE INDEX "conversion_jobs_type_idx" ON "conversion_jobs"("type");
CREATE INDEX "conversion_jobs_queuedAt_idx" ON "conversion_jobs"("queuedAt");
