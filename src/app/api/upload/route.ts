import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { promises as fs } from 'fs'
import path from 'path'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

// Use /tmp on Vercel
const UPLOAD_DIR = process.env.VERCEL ? '/tmp/uploads' : './uploads'
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE_FREE || '10485760', 10) // 10MB default

async function ensureDir(dir: string) {
  try {
    await fs.mkdir(dir, { recursive: true })
  } catch {
    // ignore if exists
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('[Upload] Starting upload...')
    
    // Parse form data
    let formData: FormData
    try {
      formData = await request.formData()
      console.log('[Upload] FormData parsed')
    } catch (e) {
      console.error('[Upload] FormData parse error:', e)
      return NextResponse.json(
        { error: 'Failed to parse form data', details: String(e) },
        { status: 400 }
      )
    }

    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    console.log('[Upload] File:', file.name, file.size, file.type)

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      const maxMB = Math.round(MAX_FILE_SIZE / (1024 * 1024))
      return NextResponse.json(
        { error: `File too large. Maximum size is ${maxMB}MB.` },
        { status: 400 }
      )
    }

    // Read file buffer
    const buffer = Buffer.from(await file.arrayBuffer())
    console.log('[Upload] Buffer size:', buffer.length)

    // Save file
    await ensureDir(UPLOAD_DIR)
    const ext = path.extname(file.name)
    const fileName = `${randomUUID()}${ext}`
    const filePath = path.join(UPLOAD_DIR, fileName)
    
    await fs.writeFile(filePath, buffer)
    console.log('[Upload] File saved:', filePath)

    return NextResponse.json({
      success: true,
      fileId: randomUUID(),
      fileName: file.name,
      fileSize: buffer.length,
      filePath: filePath,
      mimeType: file.type,
    })
  } catch (error) {
    console.error('[Upload] Error:', error)
    return NextResponse.json(
      { 
        error: 'Upload failed', 
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Fingerprint',
    },
  })
}
