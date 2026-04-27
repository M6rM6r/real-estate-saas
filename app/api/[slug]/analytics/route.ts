export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'

// Simple in-memory dedup: prevent counting the same IP+tenant more than once per hour
const recentHits = new Map<string, number>()
const ONE_HOUR = 60 * 60 * 1000

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } },
) {
  try {
    const body = await request.json()
    const { tenantId, listingId } = body ?? {}
    if (!tenantId || typeof tenantId !== 'string') {
      return NextResponse.json({ ok: false }, { status: 400 })
    }

    // Rate-limit: 1 view per IP per tenant (or listing) per hour
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      request.headers.get('x-real-ip') ??
      'unknown'
    const key = `${ip}:${tenantId}:${listingId ?? '_page'}`
    const last = recentHits.get(key)
    if (last && Date.now() - last < ONE_HOUR) {
      return NextResponse.json({ ok: true, skipped: true })
    }
    recentHits.set(key, Date.now())

    // Clean up old entries periodically (keep map small)
    if (recentHits.size > 10_000) {
      const cutoff = Date.now() - ONE_HOUR
      for (const [k, t] of recentHits) {
        if (t < cutoff) recentHits.delete(k)
      }
    }

    const doc: Record<string, unknown> = {
      tenantId,
      slug: params.slug,
      createdAt: FieldValue.serverTimestamp(),
    }
    if (listingId && typeof listingId === 'string') {
      doc.listingId = listingId
    }

    await adminDb.collection('page_views').add(doc)

    return NextResponse.json({ ok: true })
  } catch {
    // Silently fail — tracking should never break the page
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
