import type { Metadata } from 'next';
import LearnAccount from '@/components/learn-account';
import { MkFooter, MkNav } from '@/components/mk-chrome';
import '../learn.css';

export const metadata: Metadata = {
  title: 'Your account — Learning Center — Auvrantis Create',
  description: 'Sign in, choose a plan and manage your Learning Center Pro membership.',
  robots: { index: false, follow: false },
};

export default function AccountPage() {
  return (
    <main className="mk">
      <MkNav />
      <section className="mk-section lc-account">
        <div className="mk-wrap">
          <LearnAccount />
        </div>
      </section>
      <MkFooter />
    </main>
  );
}
