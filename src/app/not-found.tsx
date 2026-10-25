import Link from 'next/link';

export default function NotFound() {
  return <main className="guide-page"><header className="site-nav"><Link className="wordmark" href="/">AUVRANTIS <span>CREATE</span><small>WEBSITE BUILDER</small></Link></header><article><p className="kicker">AUVRANTIS CREATE / 404</p><h1>This page<br /><em>isn’t here.</em></h1><p>That link may be out of date. Your saved projects are still in the editor on this device.</p><Link className="button" href="/studio">Open your websites ↗</Link></article><footer className="brand-footer"><strong>By Auvrantis Group</strong></footer></main>;
}
