export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { adminDb, adminAuth } from '@/lib/firebase-admin'
import { requireAdmin } from '@/lib/admin-auth'
import { getRequestId, logRouteError, logRouteInfo } from '@/lib/observability'
import { z } from 'zod'
import { v4 as uuidv4 } from 'uuid'

const DEMO_TENANTS = [
  { id: 'demo-1', name: 'Luxury Homes Dubai', slug: 'demo', status: 'active', agentCount: 3, postCount: 45, createdAt: new Date('2024-08-15').toISOString() },
  { id: 'demo-2', name: 'Palm Realty', slug: 'palm-realty', status: 'active', agentCount: 2, postCount: 32, createdAt: new Date('2024-07-20').toISOString() },
  { id: 'demo-3', name: 'Marina Estates', slug: 'marina-estates', status: 'active', agentCount: 4, postCount: 28, createdAt: new Date('2024-09-05').toISOString() },
  { id: 'demo-4', name: 'Downtown Properties', slug: 'downtown-properties', status: 'suspended', agentCount: 1, postCount: 15, createdAt: new Date('2024-10-12').toISOString() },
  { id: 'demo-5', name: 'JBR Residences', slug: 'jbr-residences', status: 'active', agentCount: 2, postCount: 7, createdAt: new Date('2024-05-08').toISOString() },
]

export async function GET(request: NextRequest) {
  const startedAt = Date.now()
  const denied = await requireAdmin(request)
  if (denied) return denied

  try {
    if (process.env.DEMO_MODE === 'true') {
      const response = NextResponse.json(DEMO_TENANTS)
      response.headers.set('x-request-id', getRequestId(request))
      return response
    }

    const [tenantsSnap, usersSnap, postsSnap] = await Promise.all([
      adminDb.collection('tenants').orderBy('createdAt', 'desc').get(),
      adminDb.collection('users').select('tenantId').get(),
      adminDb.collection('posts').select('tenantId').get(),
    ])

    const userCountByTenant = new Map<string, number>()
    usersSnap.docs.forEach((doc) => {
      const tenantId = doc.data().tenantId as string | undefined
      if (!tenantId) return
      userCountByTenant.set(tenantId, (userCountByTenant.get(tenantId) ?? 0) + 1)
    })

    const postCountByTenant = new Map<string, number>()
    postsSnap.docs.forEach((doc) => {
      const tenantId = doc.data().tenantId as string | undefined
      if (!tenantId) return
      postCountByTenant.set(tenantId, (postCountByTenant.get(tenantId) ?? 0) + 1)
    })

    const tenants = tenantsSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      created_at: (doc.data().createdAt?.toDate?.()?.toISOString() ?? doc.data().createdAt ?? null),
      createdAt: undefined,
      agentCount: userCountByTenant.get(doc.id) ?? 0,
      postCount: postCountByTenant.get(doc.id) ?? 0,
    }))

    const response = NextResponse.json(tenants)
    response.headers.set('x-request-id', getRequestId(request))
    logRouteInfo(request, 'GET /api/admin/tenants', {
      message: 'Admin tenants fetched',
      durationMs: Date.now() - startedAt,
      status: 200,
      tenantCount: tenants.length,
    })
    return response
  } catch (error) {
    logRouteError(request, 'GET /api/admin/tenants', error, {
      durationMs: Date.now() - startedAt,
      status: 500,
    })
    const response = NextResponse.json({ error: 'Failed to fetch tenants' }, { status: 500 })
    response.headers.set('x-request-id', getRequestId(request))
    return response
  }
}

export async function POST(request: NextRequest) {
  const startedAt = Date.now()
  const denied = await requireAdmin(request)
  if (denied) return denied

  // In demo mode, just return success without creating
  if (process.env.DEMO_MODE === 'true') {
    const body = await request.json()
    const response = NextResponse.json({
      id: 'demo-' + Date.now(),
      name: body.name,
      slug: body.slug,
      status: 'active',
      message: 'Demo mode: Tenant not actually created'
    })
    response.headers.set('x-request-id', getRequestId(request))
    return response
  }

  const CreateTenantSchema = z.object({
    name: z.string().min(1).max(100),
    slug: z.string().min(1).max(60).regex(/^[a-z0-9-]+$/),
    email: z.string().email(),
    tempPassword: z.string().min(6),
    primary_color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional().default('#3B82F6'),
  })

  let body: z.infer<typeof CreateTenantSchema>
  try {
    body = CreateTenantSchema.parse(await request.json())
  } catch (err: unknown) {
    const issues = err instanceof Error ? err.message : 'Validation error'
    return NextResponse.json({ error: issues }, { status: 400 })
  }

  const { name, slug, email, tempPassword, primary_color } = body

  try {
    // Check slug uniqueness before creating auth user
    const slugCheck = await adminDb.collection('tenants').where('slug', '==', slug).limit(1).get()
    if (!slugCheck.empty) {
      return NextResponse.json({ error: 'Slug already in use' }, { status: 409 })
    }

    // Create Firebase Auth user (or reuse existing)
    let userRecord: { uid: string }
    try {
      userRecord = await adminAuth.createUser({ email, password: tempPassword })
    } catch (authErr: unknown) {
      const code = (authErr as { code?: string }).code
      if (code === 'auth/email-already-exists') {
        userRecord = await adminAuth.getUserByEmail(email)
        // Update password to the new temp password
        await adminAuth.updateUser(userRecord.uid, { password: tempPassword })
      } else {
        throw authErr
      }
    }

    const tenantId = uuidv4()

    // Create tenant document
    await adminDb.collection('tenants').doc(tenantId).set({
      name,
      slug,
      status: 'active',
      primary_color,
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

    const response = NextResponse.json({ id: tenantId, name, slug, status: 'active', primary_color }, { status: 201 })
    response.headers.set('x-request-id', getRequestId(request))
    logRouteInfo(request, 'POST /api/admin/tenants', {
      message: 'Admin tenant created',
      durationMs: Date.now() - startedAt,
      status: 201,
      tenantId,
      slug,
    })
    return response
  } catch (err: unknown) {
    logRouteError(request, 'POST /api/admin/tenants', err, {
      durationMs: Date.now() - startedAt,
      status: 500,
      slug,
    })
    const msg = (err as { message?: string }).message ?? 'Internal server error'
    const response = NextResponse.json({ error: msg }, { status: 500 })
    response.headers.set('x-request-id', getRequestId(request))
    return response
  }
}