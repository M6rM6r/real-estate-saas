import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Wa9l — واصل | المنصة الاحترافية لإدارة صفحات الأعمال';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #06061a 0%, #0d0d2e 40%, #110a2e 70%, #0a0617 100%)',
          position: 'relative',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Grid overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'linear-gradient(rgba(99,102,241,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.06) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        {/* Glow orb top-left */}
        <div
          style={{
            position: 'absolute',
            top: '-120px',
            left: '-120px',
            width: '500px',
            height: '500px',
            borderRadius: '9999px',
            background: 'radial-gradient(circle, rgba(99,102,241,0.22) 0%, transparent 70%)',
          }}
        />
        {/* Glow orb bottom-right */}
        <div
          style={{
            position: 'absolute',
            bottom: '-140px',
            right: '-140px',
            width: '560px',
            height: '560px',
            borderRadius: '9999px',
            background: 'radial-gradient(circle, rgba(139,92,246,0.18) 0%, transparent 70%)',
          }}
        />

        {/* Logo */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '120px',
            height: '120px',
            borderRadius: '28px',
            overflow: 'hidden',
            marginBottom: '32px',
            boxShadow: '0 0 60px rgba(99,102,241,0.45)',
            border: '1px solid rgba(99,102,241,0.3)',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://real-estate-saas--rewrew7.us-east4.hosted.app/logo.png"
            width="120"
            height="120"
            alt="Wa9l logo"
            style={{ objectFit: 'cover' }}
          />
        </div>

        {/* Brand name */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <div
            style={{
              fontSize: '96px',
              fontWeight: 900,
              letterSpacing: '-3px',
              background: 'linear-gradient(90deg, #a5b4fc, #c4b5fd, #d8b4fe)',
              backgroundClip: 'text',
              color: 'transparent',
              lineHeight: 1,
            }}
          >
            Wa9l
          </div>
          <div
            style={{
              fontSize: '36px',
              fontWeight: 700,
              color: 'rgba(165,180,252,0.75)',
              letterSpacing: '2px',
            }}
          >
            واصل
          </div>
        </div>

        {/* Divider */}
        <div
          style={{
            width: '80px',
            height: '2px',
            background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.8), transparent)',
            margin: '28px 0',
          }}
        />

        {/* Tagline */}
        <div
          style={{
            fontSize: '24px',
            color: 'rgba(203,213,225,0.65)',
            textAlign: 'center',
            maxWidth: '680px',
            lineHeight: 1.5,
          }}
        >
          المنصة الاحترافية لإدارة صفحات الأعمال الحديثة
        </div>

        {/* Domain badge */}
        <div
          style={{
            position: 'absolute',
            bottom: '36px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(99,102,241,0.12)',
            border: '1px solid rgba(99,102,241,0.25)',
            borderRadius: '9999px',
            padding: '8px 20px',
            color: 'rgba(165,180,252,0.7)',
            fontSize: '18px',
          }}
        >
          wa9l.app
        </div>
      </div>
    ),
    { ...size },
  );
}
