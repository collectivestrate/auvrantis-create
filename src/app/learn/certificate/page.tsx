import type { Metadata } from 'next';
import { MkFooter, MkNav } from '@/components/mk-chrome';
import { Certificate } from '@/components/learn-tools';
import { lessons } from '@/lib/learn-content';
import '../learn.css';

export const metadata: Metadata = {
  title: 'Your certificate — Learning Center — Auvrantis Create',
  description: 'Print your certificate of completion for Build your first website, step by step.',
  robots: { index: false, follow: false },
};

export default function CertificatePage() {
  return (
    <main className="mk">
      <MkNav />
      <section className="mk-section lc-cert-page">
        <div className="mk-wrap">
          <Certificate slugs={lessons.map((lesson) => lesson.slug)} />
        </div>
      </section>
      <MkFooter />
    </main>
  );
}
