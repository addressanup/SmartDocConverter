import { promises as fs } from 'fs'
import path from 'path'

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads'
const TEMP_DIR = process.env.TEMP_DIR || './tmp'
const FILE_EXPIRY_HOURS = parseInt(process.env.FILE_EXPIRY_HOURS || '1', 10)

interface CleanupResult {
  deletedCount: number
  deletedFiles: string[]
  errors: string[]
}

/**
 * Checks if a file is older than the expiry threshold
 */
async function isFileExpired(filePath: string, expiryHours: number): Promise<boolean> {
  try {
    const stats = await fs.stat(filePath)
    const now = Date.now()
    const fileAge = now - stats.mtime.getTime()
    const expiryMs = expiryHours * 60 * 60 * 1000

    return fileAge > expiryMs
  } catch (error) {
    console.error(`Failed to check file stats: ${filePath}`, error)
    return false
  }
}

/**
 * Cleans up files in a specific directory
 */
async function cleanupDirectory(directory: string, expiryHours: number): Promise<CleanupResult> {
  const result: CleanupResult = {
    deletedCount: 0,
    deletedFiles: [],
    errors: [],
  }

  try {
    // Check if directory exists
    try {
      await fs.access(directory)
    } catch {
      console.log(`Directory does not exist: ${directory}`)
      return result
    }

    const files = await fs.readdir(directory)

    for (const file of files) {
      const filePath = path.join(directory, file)

      try {
        const stats = await fs.stat(filePath)

        // Skip directories
        if (stats.isDirectory()) {
          continue
        }

        // Check if file is expired
        if (await isFileExpired(filePath, expiryHours)) {
          await fs.unlink(filePath)
          result.deletedCount++
          result.deletedFiles.push(filePath)
          console.log(`Deleted expired file: ${filePath}`)
        }
      } catch (error) {
        const errorMsg = `Failed to process file ${filePath}: ${error}`
        console.error(errorMsg)
        result.errors.push(errorMsg)
      }
    }
  } catch (error) {
    const errorMsg = `Failed to read directory ${directory}: ${error}`
    console.error(errorMsg)
    result.errors.push(errorMsg)
  }

  return result
}

/**
 * Scans uploads and tmp directories and deletes files older than FILE_EXPIRY_HOURS
 * @returns Object containing count of deleted files and list of deleted file paths
 */
export async function cleanupExpiredFiles(): Promise<CleanupResult> {
  console.log(`Starting cleanup: FILE_EXPIRY_HOURS=${FILE_EXPIRY_HOURS}`)
  console.log(`Scanning directories: ${UPLOAD_DIR}, ${TEMP_DIR}`)

  const startTime = Date.now()

  // Clean both directories
  const uploadResults = await cleanupDirectory(UPLOAD_DIR, FILE_EXPIRY_HOURS)
  const tempResults = await cleanupDirectory(TEMP_DIR, FILE_EXPIRY_HOURS)

  // Combine results
  const combinedResult: CleanupResult = {
    deletedCount: uploadResults.deletedCount + tempResults.deletedCount,
    deletedFiles: [...uploadResults.deletedFiles, ...tempResults.deletedFiles],
    errors: [...uploadResults.errors, ...tempResults.errors],
  }

  const duration = Date.now() - startTime
  console.log(`Cleanup completed in ${duration}ms`)
  console.log(`Total files deleted: ${combinedResult.deletedCount}`)

  return combinedResult
}
