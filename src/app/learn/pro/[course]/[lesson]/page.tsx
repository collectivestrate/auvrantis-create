import type { Metadata } from 'next';
import { headers } from 'next/headers';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MarkCompleteButton } from '@/components/learn-client';
import { LessonMistakes, LessonSteps } from '@/components/lesson-steps';
import { MkFooter, MkNav } from '@/components/mk-chrome';
import { ProPlans } from '@/components/pro-plans';
import { RichText } from '@/components/rich-text';
import { accessFor, requestFromCookies } from '@/lib/learn-access';
import { getProLesson, proCourses } from '@/lib/learn-pro';
import '../../../learn.css';

type Props = { params: Promise<{ course: string; lesson: string }> };

// Locked lessons are checked against the visitor's plan on every request,
// so paid content is never sent to someone without access.
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { course, lesson } = await params;
  const found = getProLesson(course, lesson);
  if (!found) return {};
  return {
    title: `${found.lesson.title} — ${found.course.title} — Auvrantis Create`,
    description: found.lesson.summary,
    alternates: { canonical: `https://auvrantis-create.vercel.app/learn/pro/${found.course.slug}/${found.lesson.slug}` },
  };
}

export default async function ProLessonPage({ params }: Props) {
  const { course: courseSlug, lesson: lessonSlug } = await params;
  const found = getProLesson(courseSlug, lessonSlug);
  if (!found) notFound();
  const { course, lesson, index } = found;

  const access = lesson.preview ? null : await accessFor(requestFromCookies((await headers()).get('cookie')));
  const unlocked = lesson.preview || !!access?.active;
  const previous = course.lessons[index - 1];
  const next = course.lessons[index + 1];
  const progressKey = `pro/${course.slug}/${lesson.slug}`;

  return (
    <main className="mk">
      <MkNav />

      <div className="mk-wrap lc-layout">
        <aside className="lc-outline" aria-label="Course outline">
          <Link className="lc-outline-home" href={`/learn/pro/${course.slug}`}>← {course.title}</Link>
          <p className="lc-outline-part">Lessons</p>
          <ol>
            {course.lessons.map((entry, entryIndex) => (
              <li key={entry.slug}>
                <Link href={`/learn/pro/${course.slug}/${entry.slug}`} aria-current={entry.slug === lesson.slug ? 'page' : undefined}>
                  <span>{entryIndex + 1}</span> {entry.title} {entry.preview ? <em className="lc-outline-free">Free</em> : null}
                </Link>
              </li>
            ))}
          </ol>
          <p className="lc-outline-part">Other Pro courses</p>
          <ol>
            {proCourses.filter((other) => other.slug !== course.slug).map((other) => (
              <li key={other.slug}><Link href={`/learn/pro/${other.slug}`}>{other.title}</Link></li>
            ))}
          </ol>
        </aside>

        <article className="lc-lesson">
          <nav className="lc-crumbs" aria-label="Breadcrumb">
            <Link href="/learn/pro">Learning Center Pro</Link>
            <span aria-hidden="true">/</span>
            <Link href={`/learn/pro/${course.slug}`}>{course.title}</Link>
          </nav>

          <header className="lc-lesson-head">
            <p className="lc-kicker">Lesson {index + 1} of {course.lessons.length} · {lesson.minutes} min{lesson.preview ? ' · Free preview' : ''}</p>
            <h1>{lesson.title}</h1>
            <p>{lesson.summary}</p>
          </header>

          <section className="lc-box" aria-labelledby="outcomes-title">
            <h2 id="outcomes-title">In this lesson, you will</h2>
            <ul className="lc-ticks">
              {lesson.outcomes.map((outcome) => <li key={outcome}>{outcome}</li>)}
            </ul>
          </section>

          {unlocked ? (
            <>
              <LessonSteps steps={lesson.steps} />
              <LessonMistakes mistakes={lesson.mistakes} />
              <section className="lc-box lc-box-dark" aria-labelledby="checklist-title">
                <h2 id="checklist-title">Before you move on</h2>
                <ul className="lc-ticks">
                  {lesson.checklist.map((item) => <li key={item}><RichText text={item} /></li>)}
                </ul>
                <MarkCompleteButton slug={progressKey} />
              </section>
            </>
          ) : (
            <section className="lc-locked" aria-labelledby="locked-title">
              <p className="lc-kicker">Learning Center Pro</p>
              <h2 id="locked-title">{access?.configured ? 'Unlock this lesson and every Pro course.' : 'Pro lessons open soon.'}</h2>
              <p>
                {access?.configured
                  ? access.signedIn
                    ? `You are signed in as ${access.email}. Choose a plan to continue with ${lesson.steps.length} steps, code you can copy and a checklist.`
                    : `This lesson has ${lesson.steps.length} steps, code you can copy and a checklist. Choose a plan, or sign in if you already have one.`
                  : 'We are putting the finishing touches on payments. In the meantime, the free preview lesson of every Pro course is open, and so is the full free course.'}
              </p>
              {access?.configured ? (
                <>
                  <ProPlans cta="Choose this plan" />
                  {!access.signedIn ? <p className="lc-locked-signin">Already a member? <Link href="/learn/account">Sign in</Link></p> : null}
                </>
              ) : (
                <div className="mk-hero-actions lc-locked-actions">
                  <Link className="mk-btn" href={`/learn/pro/${course.slug}/${course.lessons[0].slug}`}>Read the free lesson</Link>
                  <Link className="mk-btn mk-btn-ghost" href="/learn">Take the free course</Link>
                </div>
              )}
            </section>
          )}

          <nav className="lc-pager" aria-label="Lessons">
            {previous ? (
              <Link className="lc-pager-link" href={`/learn/pro/${course.slug}/${previous.slug}`}>
                <small>Previous</small>
                <strong>{previous.title}</strong>
              </Link>
            ) : <span />}
            {next ? (
              <Link className="lc-pager-link lc-pager-next" href={`/learn/pro/${course.slug}/${next.slug}`}>
                <small>Next</small>
                <strong>{next.title}</strong>
              </Link>
            ) : (
              <Link className="lc-pager-link lc-pager-next" href="/learn/pro">
                <small>You finished this course</small>
                <strong>More Pro courses</strong>
              </Link>
            )}
          </nav>
        </article>
      </div>

      <MkFooter />
    </main>
  );
}
