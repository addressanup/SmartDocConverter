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

async function getConverter(type: string) {
  switch (type) {
    case 'pdf-to-word':
      return (await import('@/lib/converters/pdf-to-word')).convertPdfToWord
    case 'word-to-pdf':
      return (await import('@/lib/converters/word-to-pdf')).convertWordToPdf
    case 'compress-pdf':
      return (await import('@/lib/converters/compress-pdf')).compressPdf
    case 'rotate-pdf':
      return (await import('@/lib/converters/rotate-pdf')).rotatePdf
    case 'protect-pdf':
      return (await import('@/lib/converters/protect-pdf')).protectPdf
    case 'unlock-pdf':
      return (await import('@/lib/converters/unlock-pdf')).unlockPdf
    case 'split-pdf':
      return (await import('@/lib/converters/split-pdf')).splitPdf
    case 'pdf-to-jpg':
      return (await import('@/lib/converters/pdf-to-jpg')).convertPdfToJpg
    case 'jpg-to-pdf':
      return (await import('@/lib/converters/jpg-to-pdf')).convertJpgToPdf
    case 'pdf-to-excel':
      return (await import('@/lib/converters/pdf-to-excel')).convertPdfToExcel
    case 'image-to-text':
      return (await import('@/lib/converters/image-to-text')).convertImageToText
    default:
      return null
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('[Convert-Sync] Starting...')

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const conversionType = formData.get('type') as string | null
    const optionsStr = formData.get('options') as string | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!conversionType) {
      return NextResponse.json({ error: 'No conversion type provided' }, { status: 400 })
    }

    console.log(`[Convert-Sync] File: ${file.name}, Type: ${conversionType}`)

    // Parse options
    let options: Record<string, unknown> = {}
    if (optionsStr) {
      try {
        options = JSON.parse(optionsStr)
      } catch (e) {
        // ignore parse errors
      }
    }

    // Save uploaded file
    await ensureDir(UPLOAD_DIR)
    const ext = path.extname(file.name)
    const inputFileName = `${randomUUID()}${ext}`
    const inputPath = path.join(UPLOAD_DIR, inputFileName)
    
    const buffer = Buffer.from(await file.arrayBuffer())
    await fs.writeFile(inputPath, buffer)
    console.log(`[Convert-Sync] Saved input: ${inputPath}`)

    // Get converter
    const converter = await getConverter(conversionType)
    if (!converter) {
      return NextResponse.json(
        { error: `Unsupported conversion type: ${conversionType}` },
        { status: 400 }
      )
    }

    // Run conversion
    console.log(`[Convert-Sync] Converting...`)
    const outputPath = await (converter as any)(inputPath, options)
    console.log(`[Convert-Sync] Output: ${outputPath}`)

    // Read output file
    if (!fsSync.existsSync(outputPath)) {
      return NextResponse.json({ error: 'Conversion failed - no output file' }, { status: 500 })
    }

    const outputBuffer = await fs.readFile(outputPath)
    const outputExt = path.extname(outputPath).toLowerCase()
    const outputFileName = path.basename(outputPath)

    // Determine content type
    const contentTypeMap: Record<string, string> = {
      '.pdf': 'application/pdf',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      '.txt': 'text/plain',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.zip': 'application/zip',
    }
    const contentType = contentTypeMap[outputExt] || 'application/octet-stream'

    // Clean up input file (keep output for a bit in case of retry)
    try {
      await fs.unlink(inputPath)
    } catch (e) {
      // ignore
    }

    console.log(`[Convert-Sync] Sending response: ${outputFileName} (${outputBuffer.length} bytes)`)

    // Return the file directly
    return new NextResponse(outputBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${outputFileName}"`,
        'Content-Length': outputBuffer.length.toString(),
        'Access-Control-Allow-Origin': '*',
        'X-Output-Filename': outputFileName,
      },
    })
  } catch (error) {
    console.error('[Convert-Sync] Error:', error)
    return NextResponse.json(
      {
        error: 'Conversion failed',
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
