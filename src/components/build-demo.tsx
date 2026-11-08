'use client';

// The home page's one authored moment: a sentence is typed, a real-looking site assembles
// in a browser frame, and a receipt prints what that run used. Starts after first paint,
// plays once, and shows the finished state straight away for reduced-motion visitors.

import { useEffect, useRef, useState } from 'react';
import { DEMO_USAGE } from '@/lib/demo-usage';

const PROMPT = 'A family bakery in Pilsen, Chicago. Conchas, sourdough and Saturday baking classes.';
const SECTIONS = [
  { label: 'Hero', title: 'Warm conchas before the 18th Street bus.', body: 'Family recipes, baked every morning in Pilsen.' },
  { label: 'What we bake', title: 'Out of the oven by 7.', body: 'Sourdough, conchas and pan dulce, made in small batches.' },
  { label: 'Classes', title: 'Shape your own conchas.', body: 'Saturday mornings, small groups, flour on us.' },
  { label: 'Visit', title: 'Come say hello.', body: '[your address] · [your hours]' },
];

type Phase = 'typing' | 'building' | 'done';

export default function BuildDemo({ chargedLabel }: { chargedLabel: string | null }) {
  const [typed, setTyped] = useState(0);
  const [built, setBuilt] = useState(0);
  const [phase, setPhase] = useState<Phase>('typing');
  const [run, setRun] = useState(0);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    timers.current.forEach(window.clearTimeout);
    timers.current = [];
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) { setTyped(PROMPT.length); setBuilt(SECTIONS.length); setPhase('done'); return; }
    setTyped(0); setBuilt(0); setPhase('typing');
    const at = (ms: number, fn: () => void) => timers.current.push(window.setTimeout(fn, ms));
    const start = 500;
    for (let i = 1; i <= PROMPT.length; i++) at(start + i * 28, () => setTyped(i));
    const typedAt = start + PROMPT.length * 28 + 350;
    at(typedAt, () => setPhase('building'));
    SECTIONS.forEach((_, index) => at(typedAt + 260 + index * 520, () => setBuilt(index + 1)));
    at(typedAt + 260 + SECTIONS.length * 520 + 200, () => setPhase('done'));
    return () => timers.current.forEach(window.clearTimeout);
  }, [run]);

  const progress = phase === 'typing' ? 0 : phase === 'done' ? 1 : built / SECTIONS.length;
  const inTokens = Math.round(DEMO_USAGE.inputTokens * (phase === 'typing' ? typed / PROMPT.length : 1));
  const outTokens = Math.round(DEMO_USAGE.outputTokens * progress);

  return (
    <div className="demo" aria-label="Example: AI writing a bakery website">
      <div className="demo-prompt">
        <span className="demo-prompt-label">Describe your business</span>
        <p aria-live="off">{PROMPT.slice(0, typed)}<span className={`demo-caret ${phase === 'typing' ? 'on' : ''}`} aria-hidden /></p>
      </div>

      <div className="demo-browser">
        <div className="demo-bar" aria-hidden><i /><i /><i /><span>rosaspanaderia.com</span></div>
        <div className="demo-site">
          <div className="demo-site-top"><b>Rosa&rsquo;s Panadería</b><span>Menu</span></div>
          {SECTIONS.map((section, index) => (
            <section key={section.label} className={`demo-block ${index === 0 ? 'demo-block-hero' : ''} ${index < built ? 'in' : ''}`}>
              {index === 0 ? <h3>{section.title}</h3> : <h4>{section.title}</h4>}
              <p>{section.body}</p>
              {index === 0 && <span className="demo-site-cta">Order for pickup</span>}
            </section>
          ))}
        </div>
      </div>

      <div className={`demo-receipt ${phase === 'done' ? 'printed' : ''}`} role="status">
        <div className="demo-receipt-row"><span>Write my site</span><span>{phase === 'done' ? 'Done' : phase === 'building' ? 'Writing' : 'Ready'}</span></div>
        <div className="demo-receipt-row"><span>Tokens in</span><span>{inTokens.toLocaleString('en-US')}</span></div>
        <div className="demo-receipt-row"><span>Tokens out</span><span>{outTokens.toLocaleString('en-US')}</span></div>
        <div className="demo-receipt-total"><span>Charged</span><span>{phase === 'done' ? (chargedLabel ?? 'Shown before you run') : '—'}</span></div>
        {phase === 'done' && <button type="button" className="demo-replay" onClick={() => setRun((n) => n + 1)}>Play again</button>}
      </div>
    </div>
  );
}
