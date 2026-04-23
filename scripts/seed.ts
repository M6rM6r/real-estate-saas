/**
 * Seed script — populates Firestore with demo data for testing.
 * Run: npx ts-node --project tsconfig.json scripts/seed.ts
 */
import * as admin from 'firebase-admin'
import * as dotenv from 'dotenv'
import { resolve } from 'path'

dotenv.config({ path: resolve(__dirname, '../.env.local') })

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID!,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
      privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
    }),
  })
}

const db = admin.firestore()
const now = admin.firestore.Timestamp.now()

const TENANT_ID = 'demo-agency'

async function seed() {
  console.log('🌱 Seeding Firestore...')

  // ── Tenant ──────────────────────────────────────────────
  await db.collection('tenants').doc(TENANT_ID).set({
    name: 'Demo Agency',
    slug: 'demo',
    primary_color: '#2563eb',
    email: 'demo@demo.com',
    plan: 'pro',
    status: 'active',
    createdAt: now,
    updatedAt: now,
  })
  console.log('✅ Tenant created')

  // ── Agency profile ───────────────────────────────────────
  await db.collection('profiles').add({
    tenantId: TENANT_ID,
    name: 'Demo Agency',
    bio: 'Your trusted real estate partner with over 10 years of experience.',
    address: '123 Main Street, Dubai, UAE',
    phone: '+971 50 000 0000',
    logo_url: '',
    cover_url: '',
    createdAt: now,
  })
  console.log('✅ Profile created')

  // ── Listings ─────────────────────────────────────────────
  const listings = [
    {
      title: 'Luxury Villa in Palm Jumeirah',
      body: '5-bedroom villa with private pool and sea views.',
      price: 12000000,
      location: 'Palm Jumeirah, Dubai',
      bedrooms: 5,
      bathrooms: 6,
      area_sqm: 820,
      listing_status: 'available',
      type: 'listing',
      published: true,
      images: [],
      tenantId: TENANT_ID,
      createdAt: now,
      publishedAt: now,
    },
    {
      title: 'Modern Apartment in Downtown',
      body: '2-bedroom apartment with Burj Khalifa view.',
      price: 2800000,
      location: 'Downtown Dubai',
      bedrooms: 2,
      bathrooms: 2,
      area_sqm: 145,
      listing_status: 'available',
      type: 'listing',
      published: true,
      images: [],
      tenantId: TENANT_ID,
      createdAt: now,
      publishedAt: now,
    },
    {
      title: 'Studio in Business Bay',
      body: 'Fully furnished studio with canal view.',
      price: 750000,
      location: 'Business Bay, Dubai',
      bedrooms: 0,
      bathrooms: 1,
      area_sqm: 48,
      listing_status: 'sold',
      type: 'listing',
      published: true,
      images: [],
      tenantId: TENANT_ID,
      createdAt: now,
      publishedAt: now,
    },
  ]

  const batch = db.batch()
  for (const listing of listings) {
    batch.set(db.collection('posts').doc(), listing)
  }
  await batch.commit()
  console.log('✅ Listings created')

  // ── Leads ────────────────────────────────────────────────
  const leads = [
    {
      tenantId: TENANT_ID,
      name: 'Ahmed Al Rashid',
      email: 'ahmed@example.com',
      phone: '+971 55 111 2222',
      message: 'Interested in the Palm Jumeirah villa.',
      status: 'new',
      createdAt: now,
    },
    {
      tenantId: TENANT_ID,
      name: 'Sarah Johnson',
      email: 'sarah@example.com',
      phone: '+971 50 333 4444',
      message: 'Looking for a 2-bed in Downtown.',
      status: 'contacted',
      createdAt: now,
    },
    {
      tenantId: TENANT_ID,
      name: 'Carlos Ruiz',
      email: 'carlos@example.com',
      phone: '+971 54 555 6666',
      message: 'Need investment property advice.',
      status: 'new',
      createdAt: now,
    },
  ]

  const leadBatch = db.batch()
  for (const lead of leads) {
    leadBatch.set(db.collection('leads').doc(), lead)
  }
  await leadBatch.commit()
  console.log('✅ Leads created')

  // ── Admin user ───────────────────────────────────────────
  await db.collection('admin_users').doc('super_admin').set({
    email: process.env.ADMIN_EMAIL!,
    role: 'super_admin',
    createdAt: now,
  })
  console.log('✅ Admin user record created')

  console.log('\n🎉 Seeding complete!')
  process.exit(0)
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err)
  process.exit(1)
})
