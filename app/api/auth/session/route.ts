export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebase-admin'

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()
    if (!token || typeof token !== 'string') {
      return NextResponse.json({ error: 'Token required' }, { status: 400 })
    }

    // Verify the ID token with Firebase Admin
    const decoded = await adminAuth.verifyIdToken(token)
    const uid = decoded.uid

    // Ensure the user has a tenant mapping in Firestore
    const userDoc = await adminDb.collection('users').doc(uid).get()
    if (!userDoc.exists || !userDoc.data()?.tenantId) {
      return NextResponse.json(
        { error: 'Account not linked to a tenant. Contact support.' },
        { status: 403 }
      )
    }

    // Set httpOnly cookie so middleware can check it
    const response = NextResponse.json({ ok: true, tenantId: userDoc.data()!.tenantId })
    response.cookies.set('fb_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60, // 1 hour — short-lived; client refreshes via Firebase SDK
      path: '/',
    })
    return response
  } catch {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  }
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true })
  response.cookies.delete('fb_session')
  return response
}
