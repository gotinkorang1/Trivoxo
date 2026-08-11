import { ImageResponse } from 'next/og'

export const OG_IMAGE_SIZE = { width: 1200, height: 630 }

export function createDefaultOpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        alignItems: 'stretch',
        background: 'linear-gradient(135deg, #07131e 0%, #0e1c2b 58%, #7a2e12 100%)',
        color: '#ffffff',
        display: 'flex',
        height: '100%',
        padding: '64px 72px',
        position: 'relative',
        width: '100%',
      }}
    >
      <div
        style={{
          border: '1px solid rgba(255,255,255,.16)',
          borderRadius: '34px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '54px 58px',
          width: '100%',
        }}
      >
        <div style={{ color: '#f9b233', display: 'flex', fontSize: 28, fontWeight: 800, letterSpacing: 8 }}>
          TRIVOXO
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', fontSize: 72, fontWeight: 800, lineHeight: 1.05 }}>
            Experience Ghana
            <br />
            the Trivoxo Way
          </div>
          <div style={{ color: '#d8e0e8', display: 'flex', fontSize: 27, marginTop: 26 }}>
            Tours · Adventures · Events · Tailor-made travel
          </div>
        </div>
        <div style={{ alignItems: 'center', display: 'flex', fontSize: 23, justifyContent: 'space-between' }}>
          <span style={{ color: '#ff8a5b' }}>Experience. Explore. Express.</span>
          <span style={{ color: '#f9b233' }}>trivoxogh.com</span>
        </div>
      </div>
    </div>,
    OG_IMAGE_SIZE,
  )
}
