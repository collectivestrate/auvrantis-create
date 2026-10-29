import Link from 'next/link';

export function MkNav({ checkUrl }: { checkUrl?: string }) {
  return (
    <>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Mona+Sans:wght@400;500;600;700;800&display=swap" />
    <header className="mk-nav">
      <div className="mk-nav-inner">
        <Link className="mk-brand" href="/" aria-label="Auvrantis Create home">
          Auvrantis <span>Create</span>
        </Link>
        <nav aria-label="Main navigation" className="mk-nav-links">
          <Link href="/learn">Learn</Link>
          <Link href="/#designs">Designs</Link>
          <Link href="/#pricing">Pricing</Link>
          {checkUrl ? <a href={checkUrl}>Auvrantis Check</a> : null}
        </nav>
        <Link className="mk-btn mk-btn-sm" href="/studio">Start building</Link>
      </div>
    </header>
    </>
  );
}

export function MkFooter() {
  return (
    <footer className="mk-footer">
      <div className="mk-wrap mk-footer-inner">
        <div>
          <strong>Auvrantis Create</strong>
          <p>Build a website. Learn how it works. By Auvrantis Group.</p>
        </div>
        <nav aria-label="Footer navigation">
          <Link href="/learn">Learn</Link>
          <Link href="/studio">Studio</Link>
          <Link href="/guide">Privacy &amp; methodology</Link>
          <Link href="/privacy">Privacy details</Link>
        </nav>
        <p className="mk-footer-copy">© Auvrantis Group 2026</p>
      </div>
    </footer>
  );
}
