import type { Metadata } from 'next';
import Link from 'next/link';
import { MkFooter, MkNav } from '@/components/mk-chrome';
import { CodePlayground } from '@/components/learn-tools';
import '../learn.css';

export const metadata: Metadata = {
  title: 'Code playground — Learning Center — Auvrantis Create',
  description: 'Practice HTML and CSS in your browser and see the result instantly. Nothing to install.',
  alternates: { canonical: 'https://auvrantis-create.vercel.app/learn/playground' },
};

export default function PlaygroundPage() {
  return (
    <main className="mk">
      <MkNav />
      <section className="mk-section lc-play-page">
        <div className="mk-wrap">
          <div className="mk-section-head">
            <p className="lc-kicker"><Link href="/learn">Learning Center</Link></p>
            <h2>Code playground.</h2>
            <p>Type HTML and CSS and watch the preview update. Try the code from any lesson. Nothing is saved or sent anywhere.</p>
          </div>
          <CodePlayground />
        </div>
      </section>
      <MkFooter />
    </main>
  );
}
