import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#030303',
          position: 'relative',
        }}
      >
        {/* Subtle crimson glow */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(circle at 50% 50%, rgba(78,0,0,0.4) 0%, transparent 70%)',
          }}
        />
        {/* Z letterform */}
        <div
          style={{
            fontSize: '110px',
            fontWeight: 300,
            color: 'rgba(239,239,201,0.92)',
            fontFamily: 'Georgia, serif',
            lineHeight: 1,
            zIndex: 1,
            marginTop: '6px',
          }}
        >
          Z
        </div>
      </div>
    ),
    { width: 180, height: 180 },
  );
}
