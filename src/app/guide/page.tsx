import { MkFooter, MkNav } from '@/components/mk-chrome';
import Link from 'next/link';

export const metadata = { title: 'Privacy & methodology — Auvrantis Create' };

export default function Guide() {
  return (
    <main className="mk">
      <MkNav />
      <article className="mk-doc"><h1>Privacy &amp; methodology.</h1><section><h2>Where drafts live</h2><p>Projects are saved in this browser on this device. Cloud saving, when configured, is optional and happens only when you explicitly choose to save a project to your account. Clearing browser storage can remove local projects. Use the JSON backup action to keep your own portable copy. <Link href="/privacy">Read the privacy details ↗</Link></p></section><section><h2>How the starter works</h2><p>The twelve designs and starter copy are hand-built, deterministic templates. A short questionnaire personalizes selected text using your answers. There is no AI text generation or hidden content service in this version. Check each statement before publishing your site.</p></section><section><h2>What quality checks mean</h2><p>The editor’s readiness list reports whether selected fields and visible sections are present in your draft. It does not test a hosted website, verify business claims, assess legal compliance, or predict search rankings, accessibility conformance, or sales.</p></section><section><h2>Sharing and hosting</h2><p>HTML export creates a file that you can host elsewhere; it does not publish a site. Account publishing is available only when the cloud publishing service is configured. The Create→Check handoff is available only when the Check app connection is configured and accepts a public URL you provide.</p></section><section><h2>Product pricing</h2><p>Auvrantis Create is planned in two plans: Starter at $5.99 per month with limited creations, and Unlimited at $15.99 per month. Auvrantis Check is a separate product with its own pricing. Checkout is not open and no payment is collected from this app.</p></section></article>
      <MkFooter />
    </main>
  );
}
