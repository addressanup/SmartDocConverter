import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { promises as fs } from 'fs'
import fsSync from 'fs'
import path from 'path'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

const UPLOAD_DIR = process.env.VERCEL ? '/tmp/uploads' : './uploads'

async function ensureDir(dir: string) {
  try {
    await fs.mkdir(dir, { recursive: true })
  } catch (e) {
    // ignore
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('[Convert-Multi-Sync] Starting...')

    const formData = await request.formData()
    const conversionType = formData.get('type') as string | null
    const fileCountStr = formData.get('fileCount') as string | null
    const optionsStr = formData.get('options') as string | null

    if (!conversionType) {
      return NextResponse.json({ error: 'No conversion type provided' }, { status: 400 })
    }

    const fileCount = parseInt(fileCountStr || '0', 10)
    if (fileCount < 2) {
      return NextResponse.json({ error: 'At least 2 files required' }, { status: 400 })
    }

    // Parse options
    let options: Record<string, unknown> = {}
    if (optionsStr) {
      try {
        options = JSON.parse(optionsStr)
      } catch (e) {
        // ignore
      }
    }

    // Save all uploaded files
    await ensureDir(UPLOAD_DIR)
    const filePaths: string[] = []

    for (let i = 0; i < fileCount; i++) {
      const file = formData.get(`file${i}`) as File | null
      if (!file) {
        return NextResponse.json({ error: `Missing file${i}` }, { status: 400 })
      }

      const ext = path.extname(file.name)
      const fileName = `${randomUUID()}${ext}`
      const filePath = path.join(UPLOAD_DIR, fileName)
      
      const buffer = Buffer.from(await file.arrayBuffer())
      await fs.writeFile(filePath, buffer)
      filePaths.push(filePath)
      
      console.log(`[Convert-Multi-Sync] Saved file ${i + 1}: ${filePath}`)
    }

    // Get merge converter
    if (conversionType !== 'merge-pdf') {
      return NextResponse.json({ error: 'Only merge-pdf supported for multi-file' }, { status: 400 })
    }

    const { mergePdfs } = await import('@/lib/converters/merge-pdf')

    // Run merge
    console.log(`[Convert-Multi-Sync] Merging ${filePaths.length} files...`)
    const outputPath = await mergePdfs(filePaths, options)
    console.log(`[Convert-Multi-Sync] Output: ${outputPath}`)

    // Read output file
    if (!fsSync.existsSync(outputPath)) {
      return NextResponse.json({ error: 'Merge failed - no output file' }, { status: 500 })
    }

    const outputBuffer = await fs.readFile(outputPath)
    const outputFileName = path.basename(outputPath)

    // Clean up input files
    for (const fp of filePaths) {
      try {
        await fs.unlink(fp)
      } catch (e) {
        // ignore
      }
    }

    console.log(`[Convert-Multi-Sync] Sending response: ${outputFileName} (${outputBuffer.length} bytes)`)

    return new NextResponse(outputBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${outputFileName}"`,
        'Content-Length': outputBuffer.length.toString(),
        'Access-Control-Allow-Origin': '*',
        'X-Output-Filename': outputFileName,
      },
    })
  } catch (error) {
    console.error('[Convert-Multi-Sync] Error:', error)
    return NextResponse.json(
      {
        error: 'Merge failed',
        details: error instanceof Error ? error.message : String(error),
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
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}
