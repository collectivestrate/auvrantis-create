import { ImageResponse } from 'next/og';

export const alt = 'Auvrantis Create — a website that sounds like your business, priced by the word';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{ width: '100%', height: '100%', display: 'flex', background: '#2D45FF', color: '#FFFFFF', fontFamily: 'Arial, sans-serif', padding: '64px 72px', position: 'relative' }}>
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: '62%' }}>
        <div style={{ display: 'flex', fontSize: 26, fontWeight: 700, letterSpacing: -0.5 }}>Auvrantis<span style={{ color: '#DFE4FF', fontWeight: 400, marginLeft: 8 }}>Create</span></div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: 72, lineHeight: 1.02, letterSpacing: -3, fontWeight: 700 }}>A website that sounds like your business.</span>
          <span style={{ marginTop: 22, fontSize: 34, color: '#DFE4FF', fontWeight: 700 }}>Priced by the word.</span>
        </div>
        <span style={{ fontSize: 20, color: '#DFE4FF' }}>No subscription · Price shown before every run · Failed runs are free</span>
      </div>
      <div style={{ position: 'absolute', right: 72, top: 150, width: 300, display: 'flex', flexDirection: 'column', background: '#FFFFFF', color: '#1D1D1F', padding: '26px 28px', borderRadius: 6, transform: 'rotate(-3deg)', fontSize: 22 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}><span>Write my site</span><span>Done</span></div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, color: '#6E6E73' }}><span>Tokens in</span><span>1,486</span></div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, color: '#6E6E73' }}><span>Tokens out</span><span>912</span></div>
        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px dashed #C7C7CC', paddingTop: 14, fontWeight: 700 }}><span>You pay for</span><span style={{ color: '#2D45FF' }}>what ran</span></div>
      </div>
    </div>,
    { ...size },
  );
}
