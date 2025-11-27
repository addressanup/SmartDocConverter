-- SmartDocConverter Database Setup
-- Step 4: Create File Metadata table

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

-- Unique constraint on storage path
CREATE UNIQUE INDEX "file_metadata_storagePath_key" ON "file_metadata"("storagePath");

-- Indexes
CREATE INDEX "file_metadata_userId_idx" ON "file_metadata"("userId");
CREATE INDEX "file_metadata_expiresAt_idx" ON "file_metadata"("expiresAt");
CREATE INDEX "file_metadata_deleted_idx" ON "file_metadata"("deleted");
