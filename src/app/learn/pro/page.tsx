import type { Metadata } from 'next';
import Link from 'next/link';
import { MkFooter, MkNav } from '@/components/mk-chrome';
import { ProPlans } from '@/components/pro-plans';
import { proCourses } from '@/lib/learn-pro';
import '../learn.css';

export const metadata: Metadata = {
  title: 'Learning Center Pro — Auvrantis Create',
  description: 'Go further: code a full website, build websites with AI, and automate the repetitive work. Start every course with a free lesson.',
  alternates: { canonical: 'https://auvrantis-create.vercel.app/learn/pro' },
};

export default function ProHome() {
  return (
    <main className="mk">
      <MkNav />

      <section className="mk-hero lc-hero">
        <div className="mk-wrap">
          <p className="lc-kicker">Learning Center Pro</p>
          <h1>Keep learning. Build more.</h1>
          <p>Three in-depth courses for the next step: code a complete website, use AI as your coding partner, and let automation handle the busywork. Every course starts with a free lesson.</p>
          <div className="mk-hero-actions">
            <Link className="mk-btn" href={`/learn/pro/${proCourses[0].slug}`}>Explore the courses</Link>
            <Link className="mk-btn mk-btn-ghost" href="/learn">Start with the free course</Link>
          </div>
        </div>
      </section>

      <section className="mk-section mk-section-mist" aria-labelledby="pro-courses-title">
        <div className="mk-wrap">
          <div className="mk-section-head">
            <h2 id="pro-courses-title">Three courses. One clear path.</h2>
            <p>Each course is step by step, with real code you can copy and checklists to keep you on track.</p>
          </div>
          <div className="lc-course-grid">
            {proCourses.map((course) => (
              <Link className="lc-course" key={course.slug} href={`/learn/pro/${course.slug}`}>
                <span className="lc-course-level">{course.level}</span>
                <strong>{course.title}</strong>
                <span>{course.tagline}</span>
                <small>{course.lessons.length} lessons · {course.lessons.reduce((sum, lesson) => sum + lesson.minutes, 0)} min · first lesson free</small>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mk-section" id="plans" aria-labelledby="pro-plans-title">
        <div className="mk-wrap">
          <div className="mk-section-head">
            <h2 id="pro-plans-title">Included in every plan.</h2>
            <p>Both plans unlock all Pro courses. Cancel any time from your account.</p>
          </div>
          <ProPlans />
          <p className="mk-fineprint">Prices in US dollars. Payments are handled securely by Stripe; we never see your card details.</p>
        </div>
      </section>

      <MkFooter />
    </main>
  );
}
