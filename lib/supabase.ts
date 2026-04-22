// Firebase shim — backward-compatible exports replacing @supabase/supabase-js
// NOTE: no firebase-admin import here — this file is used by client components
import { auth } from './firebase'
import { signOut, updatePassword } from 'firebase/auth'

export const supabase = {
  auth: {
    getSession: async () => {
      const user = auth.currentUser
      if (!user) return { data: { session: null } }
      const access_token = await user.getIdToken()
      return { data: { session: { access_token, user } } }
    },
    getUser: async () => ({ data: { user: auth.currentUser } }),
    updateUser: async ({ password }: { password: string }) => {
      try {
        if (!auth.currentUser) throw new Error('Not authenticated')
        await updatePassword(auth.currentUser, password)
        return { error: null }
      } catch (e: unknown) {
        return { error: { message: (e as Error).message } }
      }
    },
    signOut: async () => { await signOut(auth); return { error: null } },
    signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
      const { signInWithEmailAndPassword } = await import('firebase/auth')
      try {
        const cred = await signInWithEmailAndPassword(auth, email, password)
        return { data: { user: cred.user }, error: null }
      } catch (e: unknown) {
        return { data: { user: null }, error: { message: (e as Error).message } }
      }
    },
    onAuthStateChange: (cb: (event: string, session: unknown) => void) => {
      const unsub = auth.onAuthStateChanged(user =>
        cb(user ? 'SIGNED_IN' : 'SIGNED_OUT', user)
      )
      return { data: { subscription: { unsubscribe: unsub } } }
    },
  },
}

// supabaseAdmin is not available client-side; only use in server/API routes via firebase-admin directly
export const supabaseAdmin = null