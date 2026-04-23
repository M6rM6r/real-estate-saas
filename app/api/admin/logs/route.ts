export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { requireAdmin } from '@/lib/admin-auth'

const DEMO_LOGS = [
  { id: 'demo-log-1', action: 'admin_login_success', targetType: 'admin', performedBy: 'admin@rewrew7.com', createdAt: new Date().toISOString() },
  { id: 'demo-log-2', action: 'create_tenant', targetType: 'tenant', targetId: 'demo-1', performedBy: 'super_admin', createdAt: new Date(Date.now() - 86400000).toISOString() },
  { id: 'demo-log-3', action: 'create_tenant', targetType: 'tenant', targetId: 'demo-2', performedBy: 'super_admin', createdAt: new Date(Date.now() - 172800000).toISOString() },
  { id: 'demo-log-4', action: 'edit_tenant', targetType: 'tenant', targetId: 'demo-3', performedBy: 'super_admin', createdAt: new Date(Date.now() - 259200000).toISOString() },
  { id: 'demo-log-5', action: 'suspend_tenant', targetType: 'tenant', targetId: 'demo-4', performedBy: 'super_admin', createdAt: new Date(Date.now() - 345600000).toISOString() },
]

export async function GET(request: NextRequest) {
  const denied = await requireAdmin(request)
  if (denied) return denied

  if (process.env.DEMO_MODE === 'true') {
    return NextResponse.json(DEMO_LOGS)
  }

  const { searchParams } = new URL(request.url)
  const tenantId = searchParams.get('tenantId')
  const action = searchParams.get('action')
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '100'), 500)

  let query = adminDb.collection('admin_logs').orderBy('createdAt', 'desc') as FirebaseFirestore.Query

  if (tenantId) query = query.where('targetId', '==', tenantId)
  if (action) query = query.where('action', '==', action)

  const snap = await query.limit(limit).get()
  const logs = snap.docs.map(d => {
    const data = d.data()
    return {
      id: d.id,
      ...data,
      createdAt: data.createdAt?.toDate?.()?.toISOString() ?? data.createdAt,
    }
  })

  return NextResponse.json(logs)
}