import { ImageResponse } from 'next/og'
import { adminDb } from '@/lib/firebase-admin'

export const revalidate = 300
export const alt = 'Agency Profile Image'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

async function getTenantData(slug: string) {
  const tenantsSnap = await adminDb.collection('tenants').where('slug', '==', slug).limit(1).get()
  if (tenantsSnap.empty) return null
  const tenantDoc = tenantsSnap.docs[0]
  return { id: tenantDoc.id, ...tenantDoc.data() } as any
}

async function getProfileData(tenantId: string) {
  try {
    const profileDoc = await adminDb.collection('tenants').doc(tenantId).collection('profiles').doc(tenantId).get()
    if (profileDoc.exists) return profileDoc.data() as any

    const fallbackSnap = await adminDb.collection('profiles').where('tenantId', '==', tenantId).limit(1).get()
    return fallbackSnap.empty ? null : fallbackSnap.docs[0].data() as any
  } catch {
    return null
  }
}

function generateFallbackImage(rawName: string = 'REW') {
  // Strip Arabic/RTL characters to avoid Satori font shaping crash
  const name = rawName.replace(/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]+/g, '').trim() || 'REW'
  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          width: '100%',
          backgroundColor: '#0b1220',
          backgroundImage: 'linear-gradient(135deg,#111827,#0b1220,#1e293b)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            height: '100%',
            padding: '40px',
            position: 'relative',
          }}
        >
          <h1
            style={{
              fontSize: '74px',
              fontWeight: 800,
              color: 'white',
              marginBottom: '12px',
              textAlign: 'center',
              letterSpacing: '-1.5px',
            }}
          >
            {name}
          </h1>

          <div
            style={{
              fontSize: '30px',
              fontWeight: 500,
              color: '#dbeafe',
              textAlign: 'center',
            }}
          >
            Premium Real Estate Platform
          </div>

          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '10px',
              backgroundColor: '#2563eb',
            }}
          />
        </div>
      </div>
    ),
    { ...size }
  )
}

export default async function Image({ params }: { params: { slug: string } }) {
  const { slug } = params

  try {
    const tenant = await getTenantData(slug)
    if (!tenant) return generateFallbackImage()

    const profile = await getProfileData(tenant.id)

    const primaryColor = tenant.primary_color || '#2563eb'
    const coverUrl = profile?.coverUrl || profile?.cover_url
    // Strip Arabic characters — Satori edge runtime can't handle Arabic OpenType shaping
    const strip = (s: string) => s.replace(/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]+/g, '').trim()
    const tenantName = strip(tenant.name || '') || tenant.name || 'REW'
    const tagline = strip(profile?.tagline || '') || 'Leading Business Experiences'

    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            width: '100%',
            backgroundColor: '#0b1220',
            backgroundImage: coverUrl ? `url(${coverUrl})` : 'linear-gradient(135deg,#111827,#0b1220,#1e293b)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(180deg, rgba(4,10,18,0.52) 0%, rgba(4,10,18,0.88) 100%)',
              display: 'flex',
            }}
          />

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              width: '100%',
              height: '100%',
              padding: '40px',
              position: 'relative',
            }}
          >
            <h1
              style={{
                fontSize: '74px',
                fontWeight: 800,
                color: 'white',
                marginBottom: '12px',
                textAlign: 'center',
                letterSpacing: '-1.5px',
                maxWidth: '1000px',
              }}
            >
              {tenantName}
            </h1>

            <div
              style={{
                fontSize: '30px',
                fontWeight: 500,
                color: '#dbeafe',
                textAlign: 'center',
                maxWidth: '900px',
                lineHeight: 1.3,
              }}
            >
              {tagline}
            </div>

            <div
              style={{
                position: 'absolute',
                top: '28px',
                right: '32px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                backgroundColor: 'rgba(2,6,23,0.55)',
                border: `1px solid ${primaryColor}55`,
                borderRadius: '9999px',
                padding: '10px 18px',
              }}
            >
              <div
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '9999px',
                  backgroundColor: primaryColor,
                }}
              />
              <span
                style={{
                  fontSize: '22px',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  color: 'white',
                }}
              >
                REW
              </span>
            </div>

            <div
              style={{
                position: 'absolute',
                bottom: '36px',
                left: '40px',
                fontSize: '22px',
                fontWeight: 500,
                color: 'white',
                opacity: 0.9,
              }}
            >
              Discover premium listings
            </div>

            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '10px',
                backgroundColor: primaryColor,
                display: 'flex',
              }}
            />
          </div>
        </div>
      ),
      { ...size }
    )
  } catch (error) {
    console.error('OG image generation error:', error)
    return generateFallbackImage()
  }
}
