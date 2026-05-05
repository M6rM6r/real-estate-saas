/**
 * Firestore Security Rules — unit test scaffold
 *
 * Prerequisites:
 *   1. Firebase CLI installed: npm i -g firebase-tools
 *   2. Emulator started before running these tests:
 *      firebase emulators:start --only firestore --project demo-test
 *   3. Set env: FIRESTORE_EMULATOR_HOST=127.0.0.1:8080
 *
 * Run with:
 *   npm run test:rules
 *   (add "test:rules": "FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 jest --testPathPattern firestore-rules" to package.json scripts)
 *
 * The tests use @firebase/rules-unit-testing v3 which requires the emulator.
 * Each test suite tears down its app to avoid resource leaks.
 */

import {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
  RulesTestEnvironment,
} from '@firebase/rules-unit-testing'
import { readFileSync } from 'fs'
import { join } from 'path'

// ── skip entire file when emulator isn't available ────────────────────────────
const EMULATOR_HOST = process.env.FIRESTORE_EMULATOR_HOST
const describeIfEmulator = EMULATOR_HOST ? describe : describe.skip

// ── load rules from disk ───────────────────────────────────────────────────────
const RULES_PATH = join(process.cwd(), 'firestore.rules')
let testEnv: RulesTestEnvironment

describeIfEmulator('Firestore Security Rules', () => {
  beforeAll(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: 'demo-test',
      firestore: {
        rules: readFileSync(RULES_PATH, 'utf8'),
        host: '127.0.0.1',
        port: 8080,
      },
    })
  })

  afterEach(async () => {
    await testEnv.clearFirestore()
  })

  afterAll(async () => {
    await testEnv.cleanup()
  })

  // ── /tenants/{tenantId} ─────────────────────────────────────────────────────
  describe('/tenants/{tenantId}', () => {
    it('allows unauthenticated read', async () => {
      const db = testEnv.unauthenticatedContext().firestore()
      await assertSucceeds(db.collection('tenants').doc('tenant-1').get())
    })

    it('denies unauthenticated write', async () => {
      const db = testEnv.unauthenticatedContext().firestore()
      await assertFails(db.collection('tenants').doc('tenant-1').set({ name: 'Hack' }))
    })

    it('allows owner to write their own tenant', async () => {
      const db = testEnv
        .authenticatedContext('user-1', { tenantId: 'tenant-1' })
        .firestore()
      await assertSucceeds(db.collection('tenants').doc('tenant-1').set({ name: 'My Agency' }))
    })

    it('denies a different tenant writing to this tenant', async () => {
      const db = testEnv
        .authenticatedContext('user-2', { tenantId: 'tenant-2' })
        .firestore()
      await assertFails(db.collection('tenants').doc('tenant-1').set({ name: 'Hijack' }))
    })

    it('allows platform admin to write any tenant', async () => {
      const db = testEnv
        .authenticatedContext('admin-user', { admin: true })
        .firestore()
      await assertSucceeds(db.collection('tenants').doc('tenant-1').set({ name: 'Admin Updated' }))
    })
  })

  // ── /tenants/{tenantId}/posts/{postId} ──────────────────────────────────────
  describe('/tenants/{tenantId}/posts/{postId}', () => {
    beforeEach(async () => {
      // seed a published and an unpublished post via admin context
      await testEnv.withSecurityRulesDisabled(async (ctx) => {
        const db = ctx.firestore()
        await db.doc('tenants/t1/posts/pub').set({ published: true, title: 'Public' })
        await db.doc('tenants/t1/posts/priv').set({ published: false, title: 'Draft' })
      })
    })

    it('allows public to read a published post', async () => {
      const db = testEnv.unauthenticatedContext().firestore()
      await assertSucceeds(db.doc('tenants/t1/posts/pub').get())
    })

    it('denies public from reading an unpublished post', async () => {
      const db = testEnv.unauthenticatedContext().firestore()
      await assertFails(db.doc('tenants/t1/posts/priv').get())
    })

    it('allows owner to read their unpublished post', async () => {
      const db = testEnv.authenticatedContext('owner', { tenantId: 't1' }).firestore()
      await assertSucceeds(db.doc('tenants/t1/posts/priv').get())
    })

    it('denies a different tenant from reading an unpublished post', async () => {
      const db = testEnv.authenticatedContext('other', { tenantId: 't2' }).firestore()
      await assertFails(db.doc('tenants/t1/posts/priv').get())
    })

    it('allows owner to write a post', async () => {
      const db = testEnv.authenticatedContext('owner', { tenantId: 't1' }).firestore()
      await assertSucceeds(db.doc('tenants/t1/posts/new').set({ published: false, title: 'New' }))
    })
  })

  // ── /tenants/{tenantId}/leads/{leadId} ──────────────────────────────────────
  describe('/tenants/{tenantId}/leads/{leadId}', () => {
    it('allows public to create a lead (contact form)', async () => {
      const db = testEnv.unauthenticatedContext().firestore()
      await assertSucceeds(
        db.doc('tenants/t1/leads/lead-1').set({ name: 'John', phone: '0501234567' })
      )
    })

    it('denies public from reading leads', async () => {
      const db = testEnv.unauthenticatedContext().firestore()
      await assertFails(db.collection('tenants/t1/leads').get())
    })

    it('allows owner to read leads', async () => {
      const db = testEnv.authenticatedContext('owner', { tenantId: 't1' }).firestore()
      await assertSucceeds(db.collection('tenants/t1/leads').get())
    })

    it('denies a different tenant from reading leads', async () => {
      const db = testEnv.authenticatedContext('other', { tenantId: 't2' }).firestore()
      await assertFails(db.collection('tenants/t1/leads').get())
    })
  })

  // ── /tenants/{tenantId}/audit_logs/{logId} ──────────────────────────────────
  describe('/tenants/{tenantId}/audit_logs/{logId}', () => {
    it('denies anyone from writing audit logs directly', async () => {
      const ownerDb = testEnv.authenticatedContext('owner', { tenantId: 't1' }).firestore()
      // Re-check via the actual DB object
      await assertFails(ownerDb.doc('tenants/t1/audit_logs/x').set({ action: 'tamper' }))
    })

    it('allows owner to read audit logs', async () => {
      const db = testEnv.authenticatedContext('owner', { tenantId: 't1' }).firestore()
      await assertSucceeds(db.collection('tenants/t1/audit_logs').get())
    })
  })

  // ── /admin_logs/{logId} ────────────────────────────────────────────────────
  describe('/admin_logs/{logId}', () => {
    it('denies unauthenticated read', async () => {
      const db = testEnv.unauthenticatedContext().firestore()
      await assertFails(db.collection('admin_logs').get())
    })

    it('allows platform admin to read admin_logs', async () => {
      const db = testEnv.authenticatedContext('admin', { admin: true }).firestore()
      await assertSucceeds(db.collection('admin_logs').get())
    })

    it('denies write even for platform admin (server-side only)', async () => {
      const db = testEnv.authenticatedContext('admin', { admin: true }).firestore()
      await assertFails(db.collection('admin_logs').add({ action: 'direct_write' }))
    })
  })
})
