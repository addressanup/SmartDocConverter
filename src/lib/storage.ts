import { randomUUID } from 'crypto'
import { promises as fs } from 'fs'
import path from 'path'

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads'
const TEMP_DIR = process.env.TEMP_DIR || './tmp'

export interface StorageResult {
  path: string
  size: number
  checksum?: string
}

export async function ensureDirectories() {
  await fs.mkdir(UPLOAD_DIR, { recursive: true })
  await fs.mkdir(TEMP_DIR, { recursive: true })
}

export async function saveFile(buffer: Buffer, originalName: string): Promise<StorageResult> {
  await ensureDirectories()

  const ext = path.extname(originalName)
  const fileName = `${randomUUID()}${ext}`
  const filePath = path.join(UPLOAD_DIR, fileName)

  await fs.writeFile(filePath, buffer)

  return {
    path: filePath,
    size: buffer.length,
  }
}

export async function getFile(filePath: string): Promise<Buffer> {
  return fs.readFile(filePath)
}

export async function deleteFile(filePath: string): Promise<void> {
  try {
    await fs.unlink(filePath)
  } catch (error) {
    console.error('Failed to delete file:', filePath, error)
  }
}

export async function saveTempFile(buffer: Buffer, ext: string): Promise<string> {
  await ensureDirectories()

  const fileName = `${randomUUID()}${ext}`
  const filePath = path.join(TEMP_DIR, fileName)

  await fs.writeFile(filePath, buffer)
  return filePath
}

export function getFileExtension(mimeType: string): string {
  const mimeToExt: Record<string, string> = {
    'application/pdf': '.pdf',
    'application/msword': '.doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
    'application/vnd.ms-excel': '.xls',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/gif': '.gif',
    'image/webp': '.webp',
    'text/plain': '.txt',
    'text/csv': '.csv',
  }
  return mimeToExt[mimeType] || ''
}

export function getMimeType(ext: string): string {
  const extToMime: Record<string, string> = {
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.xls': 'application/vnd.ms-excel',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.txt': 'text/plain',
    '.csv': 'text/csv',
  }
  return extToMime[ext.toLowerCase()] || 'application/octet-stream'
}
