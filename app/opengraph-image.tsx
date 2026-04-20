import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'ZIBARASTUDIO — For Nights That Matter';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#030303',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Crimson atmospheric glow */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(ellipse at 18% 50%, rgba(78,0,0,0.45) 0%, transparent 55%), radial-gradient(ellipse at 82% 50%, rgba(78,0,0,0.3) 0%, transparent 55%)',
          }}
        />

        {/* Gold hairline top */}
        <div
          style={{
            position: 'absolute',
            top: '64px',
            left: '72px',
            right: '72px',
            height: '1px',
            background: 'rgba(201,169,110,0.18)',
          }}
        />
        {/* Gold hairline bottom */}
        <div
          style={{
            position: 'absolute',
            bottom: '64px',
            left: '72px',
            right: '72px',
            height: '1px',
            background: 'rgba(201,169,110,0.18)',
          }}
        />

        {/* Content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0px',
            zIndex: 1,
          }}
        >
          {/* Brand name */}
          <div
            style={{
              fontSize: '82px',
              fontWeight: 300,
              letterSpacing: '0.32em',
              color: '#EFEFC9',
              fontFamily: 'Georgia, serif',
              textTransform: 'uppercase',
              lineHeight: 1,
              paddingRight: '0.32em', // compensate for letter-spacing on last char
            }}
          >
            ZIBARASTUDIO
          </div>

          {/* Gold rule */}
          <div
            style={{
              width: '48px',
              height: '1px',
              background: 'rgba(201,169,110,0.65)',
              marginTop: '28px',
              marginBottom: '24px',
            }}
          />

          {/* Tagline */}
          <div
            style={{
              fontSize: '12px',
              letterSpacing: '0.55em',
              color: 'rgba(239,239,201,0.45)',
              fontFamily: 'monospace',
              textTransform: 'uppercase',
              paddingRight: '0.55em',
            }}
          >
            FOR NIGHTS THAT MATTER
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
