'use client';

import { useEffect, useState } from 'react';

// Lesson progress lives in this browser only, like Studio drafts.
const STORAGE_KEY = 'auvrantis-learn-progress-v1';
const CHANGE_EVENT = 'auvrantis-learn-progress';

function readProgress(): string[] {
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '[]');
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : [];
  } catch {
    return [];
  }
}

function writeProgress(slugs: string[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(slugs));
  } catch {
    // Storage can be blocked (private windows). Progress then lasts for this visit only.
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

function useProgress(): string[] {
  const [done, setDone] = useState<string[]>([]);
  useEffect(() => {
    const sync = () => setDone(readProgress());
    sync();
    window.addEventListener(CHANGE_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(CHANGE_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);
  return done;
}

export function CopyCodeButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };
  return (
    <button className="lc-copy" type="button" onClick={() => void copy()} aria-live="polite">
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

export function MarkCompleteButton({ slug }: { slug: string }) {
  const done = useProgress();
  const isDone = done.includes(slug);
  const toggle = () => {
    const current = readProgress();
    writeProgress(isDone ? current.filter((item) => item !== slug) : [...current, slug]);
  };
  return (
    <button className={isDone ? 'mk-btn lc-complete lc-complete-done' : 'mk-btn lc-complete'} type="button" onClick={toggle} aria-pressed={isDone}>
      {isDone ? 'Lesson complete ✓' : 'Mark lesson complete'}
    </button>
  );
}

export function LessonDoneMark({ slug }: { slug: string }) {
  const done = useProgress();
  if (!done.includes(slug)) return null;
  return <span className="lc-done-mark">Done</span>;
}

export function ProgressSummary({ slugs }: { slugs: string[] }) {
  const done = useProgress().filter((slug) => slugs.includes(slug));
  const percent = Math.round((done.length / slugs.length) * 100);
  return (
    <div className="lc-progress">
      <div className="lc-progress-text">
        <strong>{done.length === 0 ? 'Start whenever you are ready.' : done.length === slugs.length ? 'You finished the course.' : 'Welcome back.'}</strong>
        <span>{done.length} of {slugs.length} lessons complete</span>
      </div>
      <div className="lc-progress-bar" role="progressbar" aria-label="Course progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent}>
        <i style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
