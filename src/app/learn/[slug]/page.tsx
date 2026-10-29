import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CopyCodeButton, LessonDoneMark, MarkCompleteButton } from '@/components/learn-client';
import { LessonQuiz } from '@/components/learn-tools';
import { MkFooter, MkNav } from '@/components/mk-chrome';
import { RichText } from '@/components/rich-text';
import { getLesson, getLessonNeighbors, lessonNumber, lessons, parts } from '@/lib/learn-content';
import { quizzes } from '@/lib/learn-quizzes';
import '../learn.css';

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return lessons.map((lesson) => ({ slug: lesson.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const lesson = getLesson(slug);
  if (!lesson) return {};
  return {
    title: `${lesson.title} — Learning Center — Auvrantis Create`,
    description: lesson.summary,
    alternates: { canonical: `https://auvrantis-create.vercel.app/learn/${lesson.slug}` },
  };
}

export default async function LessonPage({ params }: Props) {
  const { slug } = await params;
  const lesson = getLesson(slug);
  if (!lesson) notFound();
  const number = lessonNumber(lesson.slug);
  const part = parts.find((item) => item.id === lesson.part);
  const partNumber = parts.findIndex((item) => item.id === lesson.part) + 1;
  const { previous, next } = getLessonNeighbors(lesson.slug);

  return (
    <main className="mk">
      <MkNav />

      <div className="mk-wrap lc-layout">
        <aside className="lc-outline" aria-label="Course outline">
          <Link className="lc-outline-home" href="/learn">← Learning Center</Link>
          {parts.map((item) => (
            <div key={item.id}>
              <p className="lc-outline-part">{item.title}</p>
              <ol>
                {lessons.map((entry, index) => entry.part !== item.id ? null : (
                  <li key={entry.slug}>
                    <Link href={`/learn/${entry.slug}`} aria-current={entry.slug === lesson.slug ? 'page' : undefined}>
                      <span>{index + 1}</span> {entry.title} <LessonDoneMark slug={entry.slug} />
                    </Link>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </aside>

        <article className="lc-lesson">
          <nav className="lc-crumbs" aria-label="Breadcrumb">
            <Link href="/learn">Learning Center</Link>
            <span aria-hidden="true">/</span>
            <span>Part {partNumber}: {part?.title}</span>
          </nav>

          <header className="lc-lesson-head">
            <p className="lc-kicker">Lesson {number} of {lessons.length} · {lesson.minutes} min</p>
            <h1>{lesson.title}</h1>
            <p>{lesson.summary}</p>
          </header>

          <section className="lc-box" aria-labelledby="outcomes-title">
            <h2 id="outcomes-title">In this lesson, you will</h2>
            <ul className="lc-ticks">
              {lesson.outcomes.map((outcome) => <li key={outcome}>{outcome}</li>)}
            </ul>
          </section>

          <ol className="lc-steps">
            {lesson.steps.map((step, index) => (
              <li className="lc-step" key={step.title}>
                <h2><span className="lc-step-num" aria-hidden="true">{index + 1}</span>{step.title}</h2>
                {step.text.map((paragraph) => <p key={paragraph}><RichText text={paragraph} /></p>)}
                {step.code ? (
                  <figure className="lc-code">
                    <figcaption>
                      <span>{step.code.file}</span>
                      <CopyCodeButton code={step.code.code} />
                    </figcaption>
                    <pre tabIndex={0} aria-label={`Code for step ${index + 1}: ${step.code.file}`}><code>{step.code.code}</code></pre>
                  </figure>
                ) : null}
                {step.tip ? <p className="lc-tip"><strong>Tip</strong> <RichText text={step.tip} /></p> : null}
              </li>
            ))}
          </ol>

          {lesson.mistakes.length > 0 ? (
            <section className="lc-section" aria-labelledby="mistakes-title">
              <h2 id="mistakes-title">Common mistakes</h2>
              <dl className="lc-mistakes">
                {lesson.mistakes.map((mistake) => (
                  <div key={mistake.problem}>
                    <dt><RichText text={mistake.problem} /></dt>
                    <dd><RichText text={mistake.fix} /></dd>
                  </div>
                ))}
              </dl>
            </section>
          ) : null}

          {quizzes[lesson.slug] ? <LessonQuiz questions={quizzes[lesson.slug]} /> : null}

          <section className="lc-box lc-box-dark" aria-labelledby="checklist-title">
            <h2 id="checklist-title">Before you move on</h2>
            <ul className="lc-ticks">
              {lesson.checklist.map((item) => <li key={item}><RichText text={item} /></li>)}
            </ul>
            <MarkCompleteButton slug={lesson.slug} />
          </section>

          <nav className="lc-pager" aria-label="Lessons">
            {previous ? (
              <Link className="lc-pager-link" href={`/learn/${previous.slug}`}>
                <small>Previous</small>
                <strong>{previous.title}</strong>
              </Link>
            ) : <span />}
            {next ? (
              <Link className="lc-pager-link lc-pager-next" href={`/learn/${next.slug}`}>
                <small>Next</small>
                <strong>{next.title}</strong>
              </Link>
            ) : (
              <Link className="lc-pager-link lc-pager-next" href="/studio">
                <small>You finished the course</small>
                <strong>Open the Studio</strong>
              </Link>
            )}
          </nav>
        </article>
      </div>

      <MkFooter />
    </main>
  );
}
