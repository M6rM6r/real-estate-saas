export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'

export const runtime = 'nodejs'
export const revalidate = 0

export async function GET() {
  let db = false
  try {
    await adminDb.collection('tenants').limit(1).get()
    db = true
  } catch {
    db = false
  }

  const status = db ? 'ok' : 'degraded'
  return NextResponse.json({ status, db, ts: new Date().toISOString() }, {
    status: db ? 200 : 503,
  })
}
