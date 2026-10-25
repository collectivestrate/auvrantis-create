import Link from 'next/link';

export default function NotFound() {
  return <main className="wizard-screen"><header className="wizard-nav"><Link className="wordmark" href="/">AUVRANTIS <span>CREATE</span><small>WEBSITE BUILDER</small></Link></header><div className="wizard-main"><p className="kicker">404 / PAGE NOT FOUND</p><h1>Nothing here<br />just yet.</h1><p>Let’s get you back to a good starting point.</p><div className="wizard-actions"><Link className="button" href="/">Back to home <span aria-hidden>↗</span></Link><Link className="back-link" href="/studio">Open the editor</Link></div></div><footer className="studio-footer"><strong>By Auvrantis Group</strong><span>Auvrantis Create · Website Builder</span></footer></main>;
}
