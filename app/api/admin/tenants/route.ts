export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { adminDb, adminAuth } from '@/lib/firebase-admin'
import { v4 as uuidv4 } from 'uuid'

export async function GET() {
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
  const { name, slug, email, tempPassword } = await request.json()

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
}