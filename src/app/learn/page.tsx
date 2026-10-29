import type { Metadata } from 'next';
import Link from 'next/link';
import CodeLab from '@/components/code-lab';
import { LessonDoneMark, ProgressSummary } from '@/components/learn-client';
import { MkFooter, MkNav } from '@/components/mk-chrome';
import { glossary, lessons, parts, totalMinutes } from '@/lib/learn-content';
import { proCourses } from '@/lib/learn-pro';
import './learn.css';

export const metadata: Metadata = {
  title: 'Learning Center — Auvrantis Create',
  description: 'A free, step-by-step course on how to build a website: plan it, write the HTML and CSS, make it work on phones, and publish it.',
  alternates: { canonical: 'https://auvrantis-create.vercel.app/learn' },
};

const hours = Math.round(totalMinutes / 60);

export default function LearningCenter() {
  const first = lessons[0];
  return (
    <main className="mk">
      <MkNav />

      <section className="mk-hero lc-hero">
        <div className="mk-wrap">
          <p className="lc-kicker">Auvrantis Create Learning Center</p>
          <h1>Welcome. Let’s build your website.</h1>
          <p>A friendly, step-by-step course for complete beginners. Plan your site, write real HTML and CSS, make it work on every phone, and put it online. No experience needed.</p>
          <div className="mk-hero-actions">
            <Link className="mk-btn" href={`/learn/${first.slug}`}>Start the course</Link>
            <Link className="mk-btn mk-btn-ghost" href="/studio">Or build in the Studio</Link>
          </div>
          <ul className="lc-facts" aria-label="About this course">
            <li><strong>{lessons.length}</strong> lessons</li>
            <li><strong>About {hours}</strong> hours</li>
            <li><strong>{parts.length}</strong> parts</li>
            <li><strong>Free</strong> to learn</li>
          </ul>
        </div>
      </section>

      <section className="mk-section mk-section-mist" aria-labelledby="course-title">
        <div className="mk-wrap">
          <div className="mk-section-head">
            <h2 id="course-title">Build your first website, step by step.</h2>
            <p>Every lesson builds the same real example, a website for a neighborhood bakery, so you always see how each piece fits.</p>
          </div>
          <ProgressSummary slugs={lessons.map((lesson) => lesson.slug)} />
          <div className="lc-parts">
            {parts.map((part, partIndex) => (
              <section className="lc-part" key={part.id} aria-labelledby={`part-${part.id}`}>
                <div className="lc-part-head">
                  <span className="lc-part-num">Part {partIndex + 1}</span>
                  <h3 id={`part-${part.id}`}>{part.title}</h3>
                  <p>{part.description}</p>
                </div>
                <ol className="lc-cards">
                  {lessons.map((lesson, index) => lesson.part !== part.id ? null : (
                    <li key={lesson.slug}>
                      <Link className="lc-card" href={`/learn/${lesson.slug}`}>
                        <span className="lc-card-num">{index + 1}</span>
                        <span className="lc-card-body">
                          <strong>{lesson.title}</strong>
                          <span>{lesson.summary}</span>
                          <small>{lesson.minutes} min <LessonDoneMark slug={lesson.slug} /></small>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ol>
              </section>
            ))}
          </div>
        </div>
      </section>

      <section className="mk-section" aria-labelledby="try-title">
        <div className="mk-wrap">
          <div className="mk-section-head">
            <h2 id="try-title">Try it before you start.</h2>
            <p>Change the details and watch the page and its code update together. This is the same HTML you will write in the course.</p>
          </div>
          <CodeLab />
        </div>
      </section>

      <section className="mk-section mk-section-mist" aria-labelledby="glossary-title">
        <div className="mk-wrap">
          <div className="mk-section-head">
            <h2 id="glossary-title">Words you will meet.</h2>
            <p>New to the web? Here is what the common terms mean, in plain English.</p>
          </div>
          <dl className="lc-glossary">
            {glossary.map((item) => (
              <div key={item.term}>
                <dt>{item.term}</dt>
                <dd>{item.meaning}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="mk-section mk-section-dark" aria-labelledby="pro-title">
        <div className="mk-wrap">
          <div className="mk-section-head">
            <p className="lc-kicker">Learning Center Pro</p>
            <h2 id="pro-title">Ready for more?</h2>
            <p>Three in-depth courses for the next step. Each one starts with a free lesson.</p>
          </div>
          <div className="lc-course-grid">
            {proCourses.map((course) => (
              <Link className="lc-course lc-course-dark" key={course.slug} href={`/learn/pro/${course.slug}`}>
                <span className="lc-course-level">{course.level}</span>
                <strong>{course.title}</strong>
                <span>{course.tagline}</span>
                <small>{course.lessons.length} lessons · first lesson free</small>
              </Link>
            ))}
          </div>
          <div className="mk-center">
            <Link className="mk-btn mk-btn-light" href="/learn/pro">Explore Learning Center Pro</Link>
          </div>
        </div>
      </section>

      <section className="mk-section mk-closing" aria-labelledby="closing-title">
        <div className="mk-wrap">
          <h2 id="closing-title">Your website starts with one lesson.</h2>
          <div className="mk-hero-actions">
            <Link className="mk-btn" href={`/learn/${first.slug}`}>Start lesson 1</Link>
            <Link className="mk-btn mk-btn-ghost" href="/learn/the-complete-code">See the finished code</Link>
          </div>
        </div>
      </section>

      <MkFooter />
    </main>
  );
}
