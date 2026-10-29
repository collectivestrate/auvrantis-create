'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import type { QuizQuestion } from '@/lib/learn-quizzes';

/** A short multiple-choice check at the end of a lesson. Nothing is saved. */
export function LessonQuiz({ questions }: { questions: QuizQuestion[] }) {
  const [picked, setPicked] = useState<(number | null)[]>(() => questions.map(() => null));
  const answered = picked.filter((choice) => choice !== null).length;
  const correct = picked.filter((choice, index) => choice === questions[index].answer).length;
  return (
    <section className="lc-section lc-quiz" aria-labelledby="quiz-title">
      <h2 id="quiz-title">Check your understanding</h2>
      {questions.map((q, qIndex) => (
        <fieldset key={q.question} className="lc-quiz-q">
          <legend>{qIndex + 1}. {q.question}</legend>
          {q.options.map((option, oIndex) => {
            const chosen = picked[qIndex] === oIndex;
            const state = picked[qIndex] === null ? '' : oIndex === q.answer ? ' lc-quiz-right' : chosen ? ' lc-quiz-wrong' : '';
            return (
              <button key={option} type="button" className={`lc-quiz-option${state}`} aria-pressed={chosen} disabled={picked[qIndex] !== null}
                onClick={() => setPicked((all) => all.map((value, i) => (i === qIndex ? oIndex : value)))}>
                {option}
              </button>
            );
          })}
          {picked[qIndex] !== null ? (
            <p className="lc-quiz-explain" role="status">
              <strong>{picked[qIndex] === q.answer ? 'Correct.' : 'Not quite.'}</strong> {q.explain}
            </p>
          ) : null}
        </fieldset>
      ))}
      {answered === questions.length ? (
        <p className="lc-quiz-score">
          You got {correct} of {questions.length}.{' '}
          <button type="button" className="lc-text-button lc-inline" onClick={() => setPicked(questions.map(() => null))}>Try again</button>
        </p>
      ) : null}
    </section>
  );
}

const STARTERS: Record<string, { label: string; html: string; css: string }> = {
  hero: {
    label: 'Welcome message',
    html: `<section class="hero">
  <h1>Fresh bread in Chicago</h1>
  <p>Baked every morning on Maple Street.</p>
  <a class="button" href="#">Plan your visit</a>
</section>`,
    css: `body {
  margin: 0;
  font-family: system-ui, sans-serif;
  color: #111111;
}

.hero {
  padding: 64px 24px;
  text-align: center;
}

.button {
  display: inline-block;
  padding: 14px 28px;
  border-radius: 999px;
  background: #2d45ff;
  color: #ffffff;
  text-decoration: none;
}`,
  },
  cards: {
    label: 'Menu cards',
    html: `<ul class="cards">
  <li><h3>Sourdough loaf</h3><p>$9</p></li>
  <li><h3>Seeded rye</h3><p>$8</p></li>
  <li><h3>Butter croissant</h3><p>$4</p></li>
</ul>`,
    css: `body {
  margin: 0;
  padding: 24px;
  font-family: system-ui, sans-serif;
}

.cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  padding: 0;
  list-style: none;
}

.cards li {
  padding: 20px;
  border-radius: 16px;
  background: #f5f5f7;
}`,
  },
  blank: { label: 'Start blank', html: '<h1>Hello!</h1>', css: 'body {\n  font-family: system-ui, sans-serif;\n}' },
};

/** Live HTML/CSS editor. The preview runs in a sandboxed frame with scripts disabled. */
export function CodePlayground() {
  const [html, setHtml] = useState(STARTERS.hero.html);
  const [css, setCss] = useState(STARTERS.hero.css);
  const [doc, setDoc] = useState('');
  useEffect(() => {
    const timer = window.setTimeout(() => setDoc(`<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head><body>${html}</body></html>`), 250);
    return () => window.clearTimeout(timer);
  }, [html, css]);
  return (
    <div className="lc-play">
      <div className="lc-play-starters" role="group" aria-label="Starting points">
        {Object.entries(STARTERS).map(([key, starter]) => (
          <button key={key} type="button" className="lc-chip" onClick={() => { setHtml(starter.html); setCss(starter.css); }}>{starter.label}</button>
        ))}
      </div>
      <div className="lc-play-grid">
        <label className="lc-play-editor">
          <span>HTML</span>
          <textarea value={html} onChange={(e) => setHtml(e.target.value)} spellCheck={false} />
        </label>
        <label className="lc-play-editor">
          <span>CSS</span>
          <textarea value={css} onChange={(e) => setCss(e.target.value)} spellCheck={false} />
        </label>
        <div className="lc-play-preview">
          <span>Preview</span>
          <iframe title="Live preview" sandbox="" srcDoc={doc} />
        </div>
      </div>
    </div>
  );
}

/** Glossary with a filter box. */
export function GlossarySearch({ items }: { items: { term: string; meaning: string }[] }) {
  const [query, setQuery] = useState('');
  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? items.filter((item) => `${item.term} ${item.meaning}`.toLowerCase().includes(q)) : items;
  }, [items, query]);
  return (
    <>
      <label className="lc-search">
        <input type="search" aria-label="Search the glossary" placeholder="Search terms, like “domain” or “CSS”" value={query} onChange={(e) => setQuery(e.target.value)} />
      </label>
      {shown.length === 0 ? <p className="lc-empty">No terms match “{query}”.</p> : (
        <dl className="lc-glossary">
          {shown.map((item) => (
            <div key={item.term}><dt>{item.term}</dt><dd>{item.meaning}</dd></div>
          ))}
        </dl>
      )}
    </>
  );
}

const PROGRESS_KEY = 'auvrantis-learn-progress-v1';
const NAME_KEY = 'auvrantis-learn-certificate-name';

/** Printable certificate once every free lesson is marked complete. */
export function Certificate({ slugs }: { slugs: string[] }) {
  const [done, setDone] = useState<number | null>(null);
  const [name, setName] = useState('');
  useEffect(() => {
    try {
      const saved: unknown = JSON.parse(window.localStorage.getItem(PROGRESS_KEY) ?? '[]');
      setDone(Array.isArray(saved) ? slugs.filter((slug) => saved.includes(slug)).length : 0);
      setName(window.localStorage.getItem(NAME_KEY) ?? '');
    } catch { setDone(0); }
  }, [slugs]);
  const saveName = (value: string) => {
    setName(value);
    try { window.localStorage.setItem(NAME_KEY, value); } catch { /* storage blocked */ }
  };
  if (done === null) return <p>Loading your progress…</p>;
  if (done < slugs.length) {
    return (
      <div className="lc-account-card">
        <h2>Almost there.</h2>
        <p>You have completed {done} of {slugs.length} lessons. Mark every lesson complete to unlock your certificate.</p>
        <Link className="mk-btn" href="/learn">Continue the course</Link>
      </div>
    );
  }
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  return (
    <>
      <div className="lc-cert-controls">
        <label htmlFor="cert-name">Name on certificate</label>
        <input id="cert-name" value={name} maxLength={60} onChange={(e) => saveName(e.target.value)} placeholder="Your full name" />
        <button className="mk-btn" type="button" onClick={() => window.print()} disabled={!name.trim()}>Print or save as PDF</button>
      </div>
      <div className="lc-cert" aria-label="Certificate of completion">
        <p className="lc-kicker">Auvrantis Create Learning Center</p>
        <h2>Certificate of completion</h2>
        <p>This certifies that</p>
        <p className="lc-cert-name">{name.trim() || 'Your name'}</p>
        <p>completed all {slugs.length} lessons of <strong>Build your first website, step by step</strong>.</p>
        <p className="lc-cert-date">{today}</p>
      </div>
    </>
  );
}
