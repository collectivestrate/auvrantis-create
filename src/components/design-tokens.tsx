"use client";

export default function DesignTokens() {
  return (
    <div className="design-tokens">
      <h2>Design Tokens</h2>
      <div className="token-grid">
        <div className="token-row">
          <span className="token-name">Colors</span>
          <div className="token-values">
            <div className="token-item">
              <span className="token-color" style={{ backgroundColor: '#FFFFFF' }} />
              <span>White (#FFFFFF)</span>
            </div>
            <div className="token-item">
              <span className="token-color" style={{ backgroundColor: '#F5F5F7' }} />
              <span>Mist (#F5F5F7)</span>
            </div>
            <div className="token-item">
              <span className="token-color" style={{ backgroundColor: '#000000' }} />
              <span>Black (#000000)</span>
            </div>
            <div className="token-item">
              <span className="token-color" style={{ backgroundColor: '#1D1D1F' }} />
              <span>Ink (#1D1D1F)</span>
            </div>
            <div className="token-item">
              <span className="token-color" style={{ backgroundColor: '#6E6E73' }} />
              <span>Graphite (#6E6E73)</span>
            </div>
            <div className="token-item">
              <span className="token-color" style={{ backgroundColor: '#2D45FF' }} />
              <span>Ultramarine (#2D45FF)</span>
            </div>
          </div>
        </div>
        <div className="token-row">
          <span className="token-name">Typography</span>
          <div className="token-values">
            <div className="token-item">
              <span>Font: Mona Sans (Variable grotesk)</span>
            </div>
            <div className="token-item">
              <span>Display: 600–800 weight, tracking -0.02 to -0.04em</span>
            </div>
            <div className="token-item">
              <span>Body: 17–19px, line-height 1.5</span>
            </div>
            <div className="token-item">
              <span>Sentence case everywhere</span>
            </div>
          </div>
        </div>
        <div className="token-row">
          <span className="token-name">Layout</span>
          <div className="token-values">
            <div className="token-item">
              <span>Full-bleed chapters</span>
            </div>
            <div className="token-item">
              <span>Content max width: 1200px</span>
            </div>
            <div className="token-item">
              <span>Vertical rhythm: 120–200px desktop</span>
            </div>
            <div className="token-item">
              <span>Center headlines, left-align body</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}