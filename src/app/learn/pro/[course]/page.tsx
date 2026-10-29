import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MkFooter, MkNav } from '@/components/mk-chrome';
import { getProCourse, proCourses } from '@/lib/learn-pro';
import '../../learn.css';

type Props = { params: Promise<{ course: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return proCourses.map((course) => ({ course: course.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const course = getProCourse((await params).course);
  if (!course) return {};
  return {
    title: `${course.title} — Learning Center Pro — Auvrantis Create`,
    description: course.tagline,
    alternates: { canonical: `https://auvrantis-create.vercel.app/learn/pro/${course.slug}` },
  };
}

export default async function ProCoursePage({ params }: Props) {
  const course = getProCourse((await params).course);
  if (!course) notFound();
  const minutes = course.lessons.reduce((sum, lesson) => sum + lesson.minutes, 0);
  const first = course.lessons[0];

  return (
    <main className="mk">
      <MkNav />

      <section className="mk-hero lc-hero">
        <div className="mk-wrap">
          <p className="lc-kicker"><Link href="/learn/pro">Learning Center Pro</Link></p>
          <h1>{course.title}</h1>
          <p>{course.description}</p>
          <div className="mk-hero-actions">
            <Link className="mk-btn" href={`/learn/pro/${course.slug}/${first.slug}`}>Start the free lesson</Link>
            <Link className="mk-btn mk-btn-ghost" href="/learn/pro#plans">See plans</Link>
          </div>
          <ul className="lc-facts" aria-label="About this course">
            <li><strong>{course.lessons.length}</strong> lessons</li>
            <li><strong>{minutes}</strong> minutes</li>
            <li><strong>{course.level}</strong></li>
          </ul>
        </div>
      </section>

      <section className="mk-section mk-section-mist" aria-labelledby="course-lessons-title">
        <div className="mk-wrap">
          <div className="mk-section-head">
            <h2 id="course-lessons-title">What you will learn.</h2>
            <p>The first lesson is free. The rest unlock with a Starter or Unlimited plan.</p>
          </div>
          <ol className="lc-cards lc-cards-narrow">
            {course.lessons.map((lesson, index) => (
              <li key={lesson.slug}>
                <Link className="lc-card" href={`/learn/pro/${course.slug}/${lesson.slug}`}>
                  <span className="lc-card-num">{index + 1}</span>
                  <span className="lc-card-body">
                    <strong>{lesson.title}</strong>
                    <span>{lesson.summary}</span>
                    <small>
                      {lesson.minutes} min
                      {lesson.preview ? <span className="lc-badge lc-badge-free">Free preview</span> : <span className="lc-badge">Pro</span>}
                    </small>
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <MkFooter />
    </main>
  );
}
