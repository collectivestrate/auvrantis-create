import { ImageResponse } from 'next/og';

export const alt = 'Auvrantis Create — Website Builder';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{ width: '100%', height: '100%', display: 'flex', position: 'relative', overflow: 'hidden', background: '#FFFDF7', color: '#111827', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ width: '72%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '56px 68px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 22, fontWeight: 800, letterSpacing: '-1px' }}>
          <span>AUVRANTIS</span><span style={{ color: '#2448FF' }}>CREATE</span>
          <span style={{ fontSize: 12, letterSpacing: 2, fontWeight: 500, marginLeft: 6 }}>WEBSITE BUILDER</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontFamily: 'monospace', fontSize: 16, letterSpacing: 2, marginBottom: 24 }}>A LITTLE GUIDANCE. A LOT OF ROOM.</span>
          <span style={{ fontSize: 86, lineHeight: 0.89, letterSpacing: -8, fontWeight: 800 }}>Make a good<br />website.</span>
          <span style={{ marginTop: 27, fontSize: 24, lineHeight: 1.35, maxWidth: 660 }}>Twelve thoughtful starting designs. Your words, your work, your way.</span>
        </div>
        <div style={{ borderTop: '2px solid #111827', paddingTop: 18, display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 15, fontWeight: 700 }}>
          <span>auvrantis-create.vercel.app</span><span>BY AUVRANTIS GROUP</span>
        </div>
      </div>
      <div style={{ width: '28%', height: '100%', background: '#2448FF', borderLeft: '2px solid #111827', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ position: 'absolute', width: 260, height: 260, borderRadius: 999, background: '#D7FF3F', border: '3px solid #111827', right: -35, top: 45 }} />
        <div style={{ position: 'relative', width: 235, minHeight: 310, background: '#FFFDF7', border: '3px solid #111827', boxShadow: '10px 10px 0 #111827', padding: 20, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', transform: 'rotate(-5deg)' }}>
          <div style={{ borderBottom: '2px solid #111827', paddingBottom: 10, display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 800 }}><span>YOUR WEBSITE</span><span>↗</span></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}><span style={{ fontFamily: 'monospace', fontSize: 10 }}>INDEPENDENT WORK</span><span style={{ fontSize: 34, lineHeight: 0.95, letterSpacing: -2, fontWeight: 800 }}>Make room<br />for good work.</span><span style={{ width: 130, background: '#D7FF3F', border: '2px solid #111827', padding: 9, fontSize: 9, fontWeight: 800 }}>EXPLORE ↗</span></div>
          <div style={{ fontFamily: 'monospace', fontSize: 9 }}>A FIRST DRAFT, SHAPED BY YOU</div>
        </div>
      </div>
    </div>,
    { ...size },
  );
}
