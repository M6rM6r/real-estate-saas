import { cert, getApps, initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

const REQUIRED_ENV = ['FIREBASE_PROJECT_ID', 'FIREBASE_CLIENT_EMAIL', 'FIREBASE_PRIVATE_KEY']
const missing = REQUIRED_ENV.filter((name) => !String(process.env[name] ?? '').trim())

if (missing.length > 0) {
  console.error(`[billing:reconcile] Missing env vars: ${missing.join(', ')}`)
  process.exit(1)
}

if (getApps().length === 0) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: String(process.env.FIREBASE_PRIVATE_KEY).replace(/\\n/g, '\n').replace(/^"|"$/g, '').trim(),
    }),
  })
}

const db = getFirestore()

const now = new Date()
const stalePendingMs = Number(process.env.BILLING_PENDING_STALE_MS || 6 * 60 * 60 * 1000)
const staleBefore = new Date(now.getTime() - stalePendingMs)
const autoHeal = String(process.env.BILLING_RECONCILE_AUTO_HEAL || '').toLowerCase() === 'true'

const report = {
  checkedAt: now.toISOString(),
  stalePendingAttempts: [],
  paidAttemptTenantMismatch: [],
  paidTenantsMissingPaymentRef: [],
  healed: [],
}

const [tenantsSnap, pendingAttemptsSnap, paidAttemptsSnap] = await Promise.all([
  db.collection('tenants').select('billing_status', 'billing_payment_ref', 'billing_attempt_id', 'name').get(),
  db.collection('billing_attempts').where('status', '==', 'pending').get(),
  db.collection('billing_attempts').where('status', '==', 'paid').get(),
])

const tenants = new Map()
tenantsSnap.docs.forEach((doc) => {
  tenants.set(doc.id, { id: doc.id, ...(doc.data() ?? {}) })
})

pendingAttemptsSnap.docs.forEach((doc) => {
  const data = doc.data() ?? {}
  const createdAt = data.created_at?.toDate?.() ?? null
  if (!createdAt) return
  if (createdAt <= staleBefore) {
    report.stalePendingAttempts.push({
      attemptId: doc.id,
      tenantId: String(data.tenant_id ?? ''),
      createdAt: createdAt.toISOString(),
      hoursPending: Number(((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60)).toFixed(1)),
    })
  }
})

for (const doc of paidAttemptsSnap.docs) {
  const data = doc.data() ?? {}
  const tenantId = String(data.tenant_id ?? '').trim()
  if (!tenantId) continue

  const tenant = tenants.get(tenantId)
  if (!tenant) continue

  const billingStatus = String(tenant.billing_status ?? '').toLowerCase()
  const tranRef = String(data.tran_ref ?? '').trim()

  if (billingStatus !== 'paid') {
    report.paidAttemptTenantMismatch.push({
      attemptId: doc.id,
      tenantId,
      tenantBillingStatus: billingStatus || 'unpaid',
      tranRef,
    })

    if (autoHeal) {
      await db.collection('tenants').doc(tenantId).set(
        {
          billing_status: 'paid',
          paid: true,
          billing_provider: 'paytabs',
          billing_payment_ref: tranRef || null,
          billing_attempt_id: doc.id,
          billing_activation_source: 'billing-reconcile',
          billing_last_paid_at: now.toISOString(),
          subscription_status: 'active',
          billing_activated_at: now.toISOString(),
        },
        { merge: true },
      )
      report.healed.push({ tenantId, action: 'tenant_marked_paid', attemptId: doc.id })
    }
  }
}

for (const tenant of tenants.values()) {
  const billingStatus = String(tenant.billing_status ?? '').toLowerCase()
  const paymentRef = String(tenant.billing_payment_ref ?? '').trim()
  if (billingStatus === 'paid' && !paymentRef) {
    report.paidTenantsMissingPaymentRef.push({
      tenantId: tenant.id,
      tenantName: String(tenant.name ?? ''),
      billingAttemptId: String(tenant.billing_attempt_id ?? ''),
    })
  }
}

const criticalCount = report.stalePendingAttempts.length + report.paidAttemptTenantMismatch.length
const warningCount = report.paidTenantsMissingPaymentRef.length

const summary = {
  ...report,
  counts: {
    critical: criticalCount,
    warning: warningCount,
    healed: report.healed.length,
  },
}

console.log(JSON.stringify(summary, null, 2))

try {
  if (criticalCount > 0 || warningCount > 0) {
    await db.collection('admin_logs').add({
      action: 'billing_reconciliation_alert',
      target_type: 'billing',
      target_id: 'billing_reconcile',
      performed_by: 'system',
      metadata: summary,
      created_at: new Date(),
    })
  }
} catch (error) {
  console.error('[billing:reconcile] Failed to write admin log', error)
}

const webhook = String(process.env.BILLING_RECONCILE_ALERT_WEBHOOK || '').trim()
if (webhook && (criticalCount > 0 || warningCount > 0)) {
  try {
    await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: `[billing:reconcile] critical=${criticalCount}, warning=${warningCount}, healed=${report.healed.length}`,
        summary,
      }),
    })
  } catch (error) {
    console.error('[billing:reconcile] Failed to send webhook alert', error)
  }
}

if (criticalCount > 0) {
  process.exit(2)
}
