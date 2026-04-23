export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'

const DEMO_LOGS = [
  { id: 'demo-log-1', action: 'admin_login_success', targetType: 'admin', performedBy: 'admin@rewrew7.com', createdAt: new Date().toISOString() },
  { id: 'demo-log-2', action: 'create_tenant', targetType: 'tenant', targetId: 'demo-1', performedBy: 'super_admin', createdAt: new Date(Date.now() - 86400000).toISOString() },
  { id: 'demo-log-3', action: 'create_tenant', targetType: 'tenant', targetId: 'demo-2', performedBy: 'super_admin', createdAt: new Date(Date.now() - 172800000).toISOString() },
  { id: 'demo-log-4', action: 'edit_tenant', targetType: 'tenant', targetId: 'demo-3', performedBy: 'super_admin', createdAt: new Date(Date.now() - 259200000).toISOString() },
  { id: 'demo-log-5', action: 'suspend_tenant', targetType: 'tenant', targetId: 'demo-4', performedBy: 'super_admin', createdAt: new Date(Date.now() - 345600000).toISOString() },
]

export async function GET() {
  // Return demo data if in demo mode
  if (process.env.DEMO_MODE === 'true') {
    return NextResponse.json(DEMO_LOGS)
  }

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