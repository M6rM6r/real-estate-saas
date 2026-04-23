export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { adminDb, adminAuth } from '@/lib/firebase-admin'
import { requireAdmin } from '@/lib/admin-auth'
import { z } from 'zod'
import { v4 as uuidv4 } from 'uuid'

const DEMO_TENANTS = [
  { id: 'demo-1', name: 'Luxury Homes Dubai', slug: 'luxury-homes-dubai', status: 'active', agentCount: 3, postCount: 45, createdAt: new Date('2024-08-15').toISOString() },
  { id: 'demo-2', name: 'Palm Realty', slug: 'palm-realty', status: 'active', agentCount: 2, postCount: 32, createdAt: new Date('2024-07-20').toISOString() },
  { id: 'demo-3', name: 'Marina Estates', slug: 'marina-estates', status: 'active', agentCount: 4, postCount: 28, createdAt: new Date('2024-09-05').toISOString() },
  { id: 'demo-4', name: 'Downtown Properties', slug: 'downtown-properties', status: 'suspended', agentCount: 1, postCount: 15, createdAt: new Date('2024-10-12').toISOString() },
  { id: 'demo-5', name: 'JBR Residences', slug: 'jbr-residences', status: 'active', agentCount: 2, postCount: 7, createdAt: new Date('2024-05-08').toISOString() },
]

export async function GET(request: NextRequest) {
  const denied = await requireAdmin(request)
  if (denied) return denied

  // Return demo data if in demo mode
  if (process.env.DEMO_MODE === 'true') {
    return NextResponse.json(DEMO_TENANTS)
  }

  const tenantsSnap = await adminDb.collection('tenants').orderBy('createdAt', 'desc').get()

  const tenants = await Promise.all(
    tenantsSnap.docs.map(async (doc) => {
      const [usersSnap, postsSnap] = await Promise.all([
        adminDb.collection('users').where('tenantId', '==', doc.id).count().get(),
        adminDb.collection('posts').where('tenantId', '==', doc.id).count().get(),
      ])
      return {
        id: doc.id,
        ...doc.data(),
        agentCount: usersSnap.data().count,
        postCount: postsSnap.data().count,
      }
    })
  )

  return NextResponse.json(tenants)
}

export async function POST(request: NextRequest) {
  const denied = await requireAdmin(request)
  if (denied) return denied

  // In demo mode, just return success without creating
  if (process.env.DEMO_MODE === 'true') {
    const body = await request.json()
    return NextResponse.json({
      id: 'demo-' + Date.now(),
      name: body.name,
      slug: body.slug,
      status: 'active',
      message: 'Demo mode: Tenant not actually created'
    })
  }

  const CreateTenantSchema = z.object({
    name: z.string().min(1).max(100),
    slug: z.string().min(1).max(60).regex(/^[a-z0-9-]+$/),
    email: z.string().email(),
    tempPassword: z.string().min(8),
  })

  let body: z.infer<typeof CreateTenantSchema>
  try {
    body = CreateTenantSchema.parse(await request.json())
  } catch (err: unknown) {
    const issues = err instanceof Error ? err.message : 'Validation error'
    return NextResponse.json({ error: issues }, { status: 400 })
  }

  const { name, slug, email, tempPassword } = body

  try {
    // Create Firebase Auth user
    const userRecord = await adminAuth.createUser({ email, password: tempPassword })

    const tenantId = uuidv4()

    // Create tenant document
    await adminDb.collection('tenants').doc(tenantId).set({
      name,
      slug,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    // Map user → tenant
    await adminDb.collection('users').doc(userRecord.uid).set({
      tenantId,
      email,
      role: 'admin',
      createdAt: new Date(),
    })

    // Log
    await adminDb.collection('admin_logs').add({
      action: 'create_tenant',
      targetId: tenantId,
      targetType: 'tenant',
      performedBy: 'super_admin',
      createdAt: new Date(),
    })

    return NextResponse.json({ id: tenantId, name, slug, status: 'active' })
  } catch (err: unknown) {
    console.error('[POST /api/admin/tenants]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}