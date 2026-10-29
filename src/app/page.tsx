import type { Metadata } from 'next';
import Link from 'next/link';
import CodeLab from '@/components/code-lab';
import { MkFooter, MkNav } from '@/components/mk-chrome';
import { marketingDesigns } from '@/lib/marketing-designs';

export const metadata: Metadata = { alternates: { canonical: 'https://auvrantis-create.vercel.app/' } };

export default function Home() {
  const checkUrl = process.env.NEXT_PUBLIC_AUVRANTIS_CHECK_URL;
  return (
    <main className="mk">
      <MkNav checkUrl={checkUrl} />

      <section className="mk-hero">
        <div className="mk-wrap">
          <h1>Build your website. Learn how it works.</h1>
          <p>Pick a design, tell us about your business, and make it yours. Along the way, see the code behind a page and learn what each part does.</p>
          <div className="mk-hero-actions">
            <Link className="mk-btn" href="/studio">Start building</Link>
            <Link className="mk-btn mk-btn-ghost" href="/learn">See how it works</Link>
          </div>
          <p className="mk-hero-note">Free to start. Your drafts stay in your browser.</p>
        </div>
      </section>

      <section className="mk-section mk-section-mist" aria-labelledby="lab-title">
        <div className="mk-wrap">
          <div className="mk-section-head">
            <h2 id="lab-title">Change a word. See the code change.</h2>
            <p>This is a real page and the real HTML behind it. Type your own details and watch both update.</p>
          </div>
          <CodeLab compact />
        </div>
      </section>

      <section className="mk-section" aria-labelledby="why-title">
        <div className="mk-wrap">
          <div className="mk-section-head">
            <h2 id="why-title">Not just a website. A skill.</h2>
            <p>Most builders hide how a site works. We show you, so you can run it yourself.</p>
          </div>
          <div className="mk-trio">
            <article>
              <h3>Learn as you build</h3>
              <p>Short lessons cover headlines, color, sections, contact links and search basics. Each one ends with something you can try in your own site.</p>
            </article>
            <article>
              <h3>See the code</h3>
              <p>See the HTML and CSS behind a page, with a short note on what each part does, so the code stops being a mystery.</p>
            </article>
            <article>
              <h3>Made for your town</h3>
              <p>Add your city and what you do, and your site says it. Neighborhood shops, trades, salons, studios and more.</p>
            </article>
          </div>
          <div className="mk-center">
            <Link className="mk-btn mk-btn-ghost" href="/learn">Browse the lessons</Link>
          </div>
        </div>
      </section>

      <section className="mk-section mk-section-mist" id="designs" aria-labelledby="designs-title">
        <div className="mk-wrap">
          <div className="mk-section-head">
            <h2 id="designs-title">{marketingDesigns.length} designs for the way you work.</h2>
            <p>Hand-built starting points for different kinds of business. Pick one, then change anything.</p>
          </div>
          <div className="mk-designs">
            {marketingDesigns.map((template) => (
              <Link className="mk-design" href="/studio" key={template.id}>
                <div className="mk-design-swatch" style={{ background: template.accent }} aria-hidden />
                <h3>{template.name}</h3>
                <p>{template.note}</p>
              </Link>
            ))}
          </div>
          <div className="mk-center">
            <Link className="mk-btn" href="/studio">Choose a design</Link>
          </div>
        </div>
      </section>

      <section className="mk-section mk-section-dark" aria-labelledby="ways-title">
        <div className="mk-wrap">
          <div className="mk-section-head">
            <h2 id="ways-title">Your site. Your home for it.</h2>
            <p>Keep your website wherever you like, and keep editing it with the tools you already use.</p>
          </div>
          <div className="mk-ways">
            <article>
              <span className="mk-status mk-status-live">Available now</span>
              <h3>Export and host anywhere</h3>
              <p>Download a complete HTML file and put it on any host you choose. Download a backup to edit again later.</p>
            </article>
            <article>
              <span className="mk-status">Coming soon</span>
              <h3>Save to the cloud</h3>
              <p>Keep your projects in your account and open them on any device.</p>
            </article>
            <article>
              <span className="mk-status">Coming soon</span>
              <h3>Edit with Claude or ChatGPT</h3>
              <p>Connect your favorite assistant to keep improving your site. Until then, you can paste your exported code into any assistant.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="mk-section" id="pricing" aria-labelledby="pricing-title">
        <div className="mk-wrap">
          <div className="mk-section-head">
            <h2 id="pricing-title">Simple pricing.</h2>
            <p>Start with a free draft. Choose a plan when you are ready to build more.</p>
          </div>
          <div className="mk-plans">
            <article className="mk-plan">
              <h3>Starter</h3>
              <p className="mk-plan-sub">For your first website.</p>
              <p className="mk-price">$5.99<span> / month</span></p>
              <ul>
                <li>Limited creations</li>
                <li>All {marketingDesigns.length} designs</li>
                <li>Step-by-step lessons and code view</li>
                <li>HTML export and backups</li>
              </ul>
              <Link className="mk-btn" href="/studio">Start building</Link>
            </article>
            <article className="mk-plan mk-plan-dark">
              <h3>Unlimited</h3>
              <p className="mk-plan-sub">For everything you want to make.</p>
              <p className="mk-price">$15.99<span> / month</span></p>
              <ul>
                <li>Unlimited creations</li>
                <li>Everything in Starter</li>
                <li>New designs and tools as they launch</li>
              </ul>
              <Link className="mk-btn" href="/studio">Start building</Link>
            </article>
          </div>
          <p className="mk-fineprint">Plans start at launch. Checkout is not open yet and no payment is collected on this site. Auvrantis Check is a separate product.</p>
        </div>
      </section>

      <section className="mk-section mk-section-mist mk-closing" aria-labelledby="closing-title">
        <div className="mk-wrap">
          <h2 id="closing-title">Make something good. Understand it too.</h2>
          <Link className="mk-btn" href="/studio">Start building</Link>
        </div>
      </section>

      <MkFooter />
    </main>
  );
}
