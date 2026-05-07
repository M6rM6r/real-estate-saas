export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { adminDb, adminAuth } from '@/lib/firebase-admin'
import { requireAdmin } from '@/lib/admin-auth'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const denied = await requireAdmin(request)
  if (denied) return denied

  try {
    const usersSnap = await adminDb.collection('users').where('tenantId', '==', params.id).limit(1).get()
    if (usersSnap.empty) {
      return NextResponse.json({ error: 'No user found for this tenant' }, { status: 404 })
    }
    const email = usersSnap.docs[0].data().email as string | undefined
    if (!email) {
      return NextResponse.json({ error: 'User has no email on record' }, { status: 400 })
    }
    const link = await adminAuth.generatePasswordResetLink(email)
    return NextResponse.json({ link, email })
  } catch (err) {
    const msg = (err as { message?: string }).message ?? 'Failed to generate reset link'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
