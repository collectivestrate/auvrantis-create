'use client';

import { useId, useState } from 'react';

type Props = {
  writeMc: number;
  rewriteMc: number;
  packs: Array<{ id: string; name: string; usd: number; credits: number }>;
};

const dollars = (credits: number) => (credits / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' });

/** Estimates a month of AI use from the live, configured prices. */
export default function CostCalculator({ writeMc, rewriteMc, packs }: Props) {
  const [sites, setSites] = useState(1);
  const [rewrites, setRewrites] = useState(10);
  const sitesId = useId();
  const rewritesId = useId();
  const credits = Math.ceil((sites * writeMc + sites * rewrites * rewriteMc) / 1000);
  const pack = packs.find((item) => item.credits >= credits) ?? null;

  return (
    <div className="calc">
      <div className="calc-inputs">
        <label htmlFor={sitesId}>
          <span>Sites written by AI this month</span>
          <output htmlFor={sitesId}>{sites}</output>
        </label>
        <input id={sitesId} type="range" min={1} max={20} value={sites} onChange={(event) => setSites(Number(event.target.value))} />
        <label htmlFor={rewritesId}>
          <span>Section rewrites per site</span>
          <output htmlFor={rewritesId}>{rewrites}</output>
        </label>
        <input id={rewritesId} type="range" min={0} max={40} value={rewrites} onChange={(event) => setRewrites(Number(event.target.value))} />
      </div>
      <div className="calc-result" aria-live="polite">
        <p className="calc-figure">{dollars(credits)}</p>
        <p className="calc-sub">about {credits.toLocaleString('en-US')} credits at typical length</p>
        <p className="calc-compare">No monthly fee. In a month you don&rsquo;t use AI, you pay nothing.</p>
        <p className="calc-pack">{pack ? <>The <b>{pack.name}</b> pack covers it, with {(pack.credits - credits).toLocaleString('en-US')} credits left over.</> : 'Buy any combination of packs to cover it.'}</p>
      </div>
    </div>
  );
}
