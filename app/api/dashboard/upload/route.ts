export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getFirebaseSession } from '@/lib/auth-helpers'
import { getStorage } from 'firebase-admin/storage'
import { adminDb } from '@/lib/firebase-admin'  // ensures Firebase app is initialized
import { rateLimit } from '@/lib/rate-limit'
import { v4 as uuidv4 } from 'uuid'
import sharp from 'sharp'

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])
const MAX_SIZE = 5 * 1024 * 1024

export async function POST(request: NextRequest) {
  const limited = await rateLimit(request)
  if (limited) return limited

  try {
  const session = await getFirebaseSession(request)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await request.formData()
  const files = formData.getAll('files') as File[]

  if (!files.length) return NextResponse.json({ error: 'No files provided' }, { status: 400 })

  // Resolve bucket: try the configured default, then fall back to alternate name format
  // Firebase projects use either {id}.firebasestorage.app (new) or {id}.appspot.com (legacy)
  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  const envBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
  const altBucket = envBucket?.endsWith('.appspot.com')
    ? envBucket.replace('.appspot.com', '.firebasestorage.app')
    : `${projectId}.appspot.com`

  async function resolveBucket() {
    // Try default (env-configured) bucket first
    const primary = getStorage().bucket()
    try {
      await primary.exists()
      return primary
    } catch {
      // Default bucket inaccessible — try the alternate naming format
      const fallback = getStorage().bucket(altBucket)
      await fallback.exists()
      return fallback
    }
  }

  const bucket = await resolveBucket()
  const urls: string[] = []

  for (const file of files) {
    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json({ error: `Invalid file type: ${file.type}` }, { status: 400 })
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'File too large (max 5MB)' }, { status: 400 })
    }

    const buf = Buffer.from(await file.arrayBuffer())
    const isJpeg = buf[0] === 0xff && buf[1] === 0xd8
    const isPng = buf[0] === 0x89 && buf[1] === 0x50
    const isWebp = buf[8] === 0x57 && buf[9] === 0x45 && buf[10] === 0x42 && buf[11] === 0x50
    if (!isJpeg && !isPng && !isWebp) {
      return NextResponse.json({ error: 'Invalid image file' }, { status: 400 })
    }

    const compressed = await sharp(buf)
      .resize(1920, undefined, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 85 })
      .toBuffer()

    const filename = `${session.tenantId}/${uuidv4()}.webp`
    const fileRef = bucket.file(filename)
    await fileRef.save(compressed, {
      metadata: { contentType: 'image/webp' },
      resumable: false,
    })
    await fileRef.makePublic()
    urls.push(fileRef.publicUrl())
  }

  return NextResponse.json({ urls })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[upload] error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

