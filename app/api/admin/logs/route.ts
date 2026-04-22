export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'

export async function GET() {
  // Check if Firebase is configured
  if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL ||
      !process.env.FIREBASE_PRIVATE_KEY || process.env.FIREBASE_PRIVATE_KEY.includes('YOUR_PRIVATE_KEY_HERE')) {
    return NextResponse.json({
      error: 'Firebase Admin credentials not configured',
      logs: [],
    }, { status: 503 })
  }

  const snap = await adminDb
    .collection('admin_logs')
    .orderBy('createdAt', 'desc')
    .limit(200)
    .get()

  const logs = snap.docs.map(d => ({ id: d.id, ...d.data() }))
  return NextResponse.json(logs)
}