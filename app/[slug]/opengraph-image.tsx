import { ImageResponse } from 'next/og'
import { adminDb } from '@/lib/firebase-admin'

export const revalidate = 60
export const alt = 'Agency Profile Image'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image({ params }: { params: { slug: string } }) {
  const { slug } = params

  try {
    const tenantsSnap = await adminDb.collection('tenants').where('slug', '==', slug).limit(1).get()
    if (tenantsSnap.empty) {
      return new Response('Not Found', { status: 404 })
    }
    const tenantDoc = tenantsSnap.docs[0]
    const tenant = { id: tenantDoc.id, ...tenantDoc.data() } as any

    const profilesSnap = await adminDb.collection('profiles').where('tenantId', '==', tenantDoc.id).limit(1).get()
    const profile = profilesSnap.empty ? null : (profilesSnap.docs[0].data() as any)

    const primaryColor = tenant.primary_color || '#2563eb'
    const logoUrl = profile?.logoUrl || profile?.logo_url
    const coverUrl = profile?.coverUrl || profile?.cover_url
    const tagline = profile?.tagline || 'Leading Real Estate Experiences'

    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            height: '100%',
            width: '100%',
            backgroundColor: '#ffffff',
            backgroundImage: coverUrl ? `url(${coverUrl})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            position: 'relative',
          }}
        >
          {/* Overlay */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
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
            {logoUrl && (
              <img
                src={logoUrl}
                alt="Logo"
                style={{
                  width: 150,
                  height: 150,
                  objectFit: 'contain',
                  borderRadius: '100px',
                  backgroundColor: 'white',
                  padding: '10px',
                  marginBottom: '20px',
                  boxShadow: `0 0 20px ${primaryColor}40`,
                }}
              />
            )}
            
            <h1
              style={{
                fontSize: '72px',
                fontWeight: 900,
                color: 'white',
                marginBottom: '10px',
                textAlign: 'center',
                letterSpacing: '-1.5px',
              }}
            >
              {tenant.name}
            </h1>
            
            <div
              style={{
                fontSize: '32px',
                fontWeight: 500,
                color: primaryColor,
                textAlign: 'center',
                maxWidth: '800px',
              }}
            >
              {tagline}
            </div>
            
            <div
              style={{
                position: 'absolute',
                bottom: '40px',
                fontSize: '24px',
                fontWeight: 600,
                color: 'white',
                opacity: 0.8,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              Explore Exclusive Properties
            </div>
            
            {/* Colorful neon accent bar at bottom */}
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '12px',
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
    return new Response('Failed to generate image', { status: 500 })
  }
}
