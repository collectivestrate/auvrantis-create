import type { Metadata } from 'next';
import Link from 'next/link';
import BuildDemo, { DEMO_USAGE } from '@/components/build-demo';
import CodeLab from '@/components/code-lab';
import CostCalculator from '@/components/cost-calculator';
import { MkFooter, MkNav } from '@/components/mk-chrome';
import { ACTIONS, CREDIT_PACKS, formatCredits, priceMc, quote, ratesFromEnv, signupCredits, type AiAction } from '@/lib/ai-billing';
import { creditsCheckoutOpen } from '@/lib/learn-access';
import { marketingDesigns } from '@/lib/marketing-designs';
import './home.css';

export const metadata: Metadata = { alternates: { canonical: 'https://auvrantis-create.vercel.app/' } };

const MENU: Array<{ action: AiAction; name: string; text: string }> = [
  { action: 'write', name: 'Write my site', text: 'Headlines and text for every section, in your town and your voice.' },
  { action: 'rewrite', name: 'Rewrite a section', text: 'Warmer, shorter, more local. Say what you want changed.' },
  { action: 'plan', name: 'Plan from an idea', text: 'Pages, sections, a palette and the questions you still need to answer.' },
];

const CONTRAST: Array<[string, string]> = [
  ['A monthly fee, whether you build or not.', 'No monthly fee. Pay when AI works for you.'],
  ['Credits drain on attempts that go nowhere.', 'Failed or rejected runs cost nothing.'],
  ['You learn the price after it has gone.', 'The price is on the button before you press it.'],
  ['Layouts that look like every other AI site.', 'Twelve hand-built designs. AI writes the words.'],
  ['Made-up reviews, awards and statistics.', 'AI is not allowed to invent facts about your business.'],
  ['Your site lives on their servers.', 'Download clean HTML and host it anywhere.'],
];

export default function Home() {
  const checkUrl = process.env.NEXT_PUBLIC_AUVRANTIS_CHECK_URL;
  const rates = ratesFromEnv();
  const checkoutOpen = creditsCheckoutOpen();
  const welcome = signupCredits();
  const quotes = rates ? Object.fromEntries((Object.keys(ACTIONS) as AiAction[]).map((action) => [action, quote(action, 600, rates)])) as Record<AiAction, ReturnType<typeof quote>> : null;
  const demoCharge = rates ? `${formatCredits(priceMc(DEMO_USAGE, rates))} credits` : null;

  return (
    <main className="mk">
      <MkNav checkUrl={checkUrl} />

      <section className="hx" aria-labelledby="hero-title">
        <div className="hx-inner">
          <div className="hx-copy">
            <h1 id="hero-title">A website that sounds like your business. Priced by the word.</h1>
            <p>Describe what you do. AI writes every section inside a design made by people, and you pay only for the words it writes. The price is on the button before you press it.</p>
            <div className="hx-actions">
              <Link className="mk-btn mk-btn-light" href="/studio">Start building free</Link>
              <a className="hx-link" href="#pricing">See what it costs</a>
            </div>
            <p className="hx-note">No subscription. {welcome > 0 ? `${welcome} free credits when you make an account.` : 'Free to start.'} Failed runs are free.</p>
          </div>
          <BuildDemo chargedLabel={demoCharge} />
        </div>
      </section>

      <section className="mk-section vs" aria-labelledby="vs-title">
        <div className="mk-wrap">
          <h2 id="vs-title" className="vs-title">Many AI builders charge for the trying. We charge for the result.</h2>
          <div className="vs-table" role="table" aria-label="How Auvrantis Create is different">
            <div className="vs-row vs-head" role="row"><span role="columnheader">What you often get</span><span role="columnheader">What you get here</span></div>
            {CONTRAST.map(([them, us]) => (
              <div className="vs-row" role="row" key={us}><span role="cell">{them}</span><span role="cell">{us}</span></div>
            ))}
          </div>
        </div>
      </section>

      <section className="mk-section mk-section-mist" aria-labelledby="menu-title">
        <div className="mk-wrap menu-wrap">
          <div className="menu-intro">
            <h2 id="menu-title">The menu.</h2>
            <p>Three things AI does for you. Each one shows its price first, charges what it actually used after, and lands as one change you can undo.</p>
            <Link className="mk-btn" href="/studio">Try it in the Studio</Link>
          </div>
          <ul className="menu-list">
            {MENU.map((item) => (
              <li key={item.action}>
                <div className="menu-line"><h3>{item.name}</h3><i aria-hidden /><span className="menu-price">{quotes ? `~${formatCredits(quotes[item.action].typicalMc)}¢` : 'Priced per run'}</span></div>
                <p>{item.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mk-section" id="designs" aria-labelledby="designs-title">
        <div className="mk-wrap">
          <div className="mk-section-head">
            <h2 id="designs-title">Designed by people. Written by AI. Checked by you.</h2>
            <p>{marketingDesigns.length} hand-built designs for real kinds of business. Your words change; the craft stays.</p>
          </div>
          <div className="mk-designs">
            {marketingDesigns.map((design) => (
              <Link className="mk-design" href="/studio" key={design.id} style={{ '--d-accent': design.accent } as React.CSSProperties}>
                <div className="mk-design-frame" aria-hidden>
                  <span className="mk-design-bar" />
                  <span className="mk-design-head" />
                  <span className="mk-design-line" />
                  <span className="mk-design-line short" />
                  <span className="mk-design-block" />
                </div>
                <h3>{design.name}</h3>
                <p>{design.note}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mk-section mk-section-mist" aria-labelledby="lab-title">
        <div className="mk-wrap">
          <div className="mk-section-head">
            <h2 id="lab-title">Change a word. See the code change.</h2>
            <p>Every site is plain HTML you own. Type your details and watch the page and its code update together.</p>
          </div>
          <CodeLab compact />
          <div className="mk-center">
            <Link className="mk-btn mk-btn-ghost" href="/learn">Learn how it works</Link>
          </div>
        </div>
      </section>

      <section className="mk-section pricing" id="pricing" aria-labelledby="pricing-title">
        <div className="mk-wrap">
          <div className="mk-section-head">
            <h2 id="pricing-title">Pay for words, not months.</h2>
            <p>The builder, every design, export and the starter lessons are free. AI is pay as you go: 1 credit is 1¢.</p>
          </div>

          <div className="packs">
            <article className="pack pack-free">
              <h3>Free</h3>
              <p className="pack-price">$0</p>
              <ul>
                <li>All {marketingDesigns.length} designs and the full editor</li>
                <li>HTML export and backups</li>
                <li>Starter lessons and code view</li>
                {welcome > 0 && <li>{welcome} AI credits to try it</li>}
              </ul>
              <Link className="mk-btn mk-btn-ghost" href="/studio">Start building</Link>
            </article>
            {CREDIT_PACKS.map((pack, index) => (
              <article className={`pack ${index === 1 ? 'pack-featured' : ''}`} key={pack.id}>
                <h3>{pack.name}</h3>
                <p className="pack-price">${pack.usd}</p>
                <p className="pack-credits">{pack.credits.toLocaleString('en-US')} credits</p>
                <p className="pack-note">{pack.note}</p>
                <Link className={`mk-btn ${index === 1 ? 'mk-btn-light' : ''}`} href="/studio">{checkoutOpen ? 'Get credits in the Studio' : 'Start free'}</Link>
              </article>
            ))}
          </div>

          {quotes && <CostCalculator writeMc={quotes.write.typicalMc} rewriteMc={quotes.rewrite.typicalMc} packs={CREDIT_PACKS} />}

          <p className="mk-fineprint">
            Each run is charged on the tokens it actually used, never more than the price shown before it started. Credits don&rsquo;t expire.
            {!checkoutOpen && ' Credit packs go on sale when payments open; everything else is free today.'}
            {' '}Want the full course? <Link href="/learn/pro">Learning Center Pro</Link> is a separate plan.
          </p>
        </div>
      </section>

      <section className="closing" aria-labelledby="closing-title">
        <div className="mk-wrap">
          <h2 id="closing-title">Your street deserves a better website than a template with your name pasted in.</h2>
          <Link className="mk-btn mk-btn-light" href="/studio">Start building free</Link>
        </div>
      </section>

      <MkFooter />
    </main>
  );
}
