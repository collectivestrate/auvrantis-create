'use client';

// Auvrantis AI in the Studio: write the whole site, rewrite one section, or plan from an idea.
// Every run shows its price before it starts and a token receipt after. Results land as one
// undoable change, and failed runs cost nothing.

import { useCallback, useEffect, useMemo, useState } from 'react';
import { createDraft, type Draft } from '@/lib/templates';
import { applyAiSitePlan, type AiSitePlan } from '@/lib/ai-plan';

type Quote = { action: 'plan' | 'write' | 'rewrite'; typicalMc: number; maxMc: number };
type Pack = { id: string; name: string; usd: number; credits: number; note: string };
type LedgerRow = { kind: string; delta_mc: number; action: string | null; input_tokens: number | null; output_tokens: number | null; created_at: string };
type Wallet = { state: 'open' | 'closed'; signedIn: boolean; balanceMc: number | null; quotes: Quote[]; packs: Pack[]; checkoutOpen: boolean; ledger: LedgerRow[] };
type Receipt = { chargedMc: number; balanceMc: number; inputTokens: number; outputTokens: number };
type Tab = 'write' | 'rewrite' | 'plan';

const credits = (mc: number) => {
  const value = mc / 1000;
  return value >= 100 ? Math.round(value).toLocaleString('en-US') : (Math.ceil(value * 10) / 10).toLocaleString('en-US', { maximumFractionDigits: 1 });
};
const tokens = (n: number) => n.toLocaleString('en-US');
const ACTION_NAMES: Record<string, string> = { write: 'Wrote site', rewrite: 'Rewrote section', plan: 'Planned site' };
const REWRITE_STARTERS = ['Make it warmer', 'Make it shorter', 'Mention our neighborhood', 'Stronger call to action'];

export default function AiCopilot({ draft, selectedSectionId, onCommit, onOpenAccount, accountOpen = false }: { draft: Draft; selectedSectionId: string; onCommit: (next: Draft) => void; onOpenAccount: () => void; accountOpen?: boolean }) {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [tab, setTab] = useState<Tab>('write');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ tone: 'ok' | 'warn'; text: string } | null>(null);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [needsCredits, setNeedsCredits] = useState(false);
  const [instruction, setInstruction] = useState('');
  const [idea, setIdea] = useState('');
  const [plan, setPlan] = useState<AiSitePlan | null>(null);
  const [showLedger, setShowLedger] = useState(false);

  const section = draft.site.sections.find((item) => item.id === selectedSectionId) ?? draft.site.sections[0];
  const brief = useMemo(() => ({ name: draft.business.name || draft.site.title, service: draft.business.service, audience: draft.business.audience, location: draft.business.location, tone: draft.business.tone }), [draft.business, draft.site.title]);
  const sections = useMemo(() => draft.site.sections.slice(0, 16).map(({ id, type, title, body }) => ({ id, type, title, body })), [draft.site.sections]);
  const writeChars = JSON.stringify({ brief, sections }).length;

  const refresh = useCallback(async () => {
    try {
      const response = await fetch(`/api/ai/wallet?chars=${writeChars}`, { cache: 'no-store' });
      if (response.ok) setWallet(await response.json());
    } catch { /* the panel shows its closed state */ }
  }, [writeChars]);

  // Re-check the wallet on load and whenever the account panel closes (the visitor may have signed in).
  useEffect(() => { if (!accountOpen) void refresh(); }, [refresh, accountOpen]);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('credits') === 'success') setNotice({ tone: 'ok', text: 'Payment received. Your credits appear as soon as the payment confirms, usually within a minute.' });
    if (params.get('credits') === 'cancelled') setNotice({ tone: 'warn', text: 'Checkout was cancelled. Nothing was charged.' });
  }, []);

  const quoteFor = (action: Tab) => wallet?.quotes.find((item) => item.action === action) ?? null;
  const quote = quoteFor(tab);
  const balance = wallet?.balanceMc ?? null;

  async function run(path: string, body: unknown) {
    setBusy(true); setNotice(null); setNeedsCredits(false);
    try {
      const response = await fetch(path, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        if (payload?.error?.code === 'insufficient_credits') setNeedsCredits(true);
        if (payload?.error?.code === 'sign_in') onOpenAccount();
        setNotice({ tone: 'warn', text: payload?.error?.message || 'AI could not finish. Nothing was charged.' });
        if (typeof payload?.error?.balanceMc === 'number') setWallet((current) => current && { ...current, balanceMc: payload.error.balanceMc });
        return null;
      }
      setReceipt(payload.receipt);
      setWallet((current) => current && { ...current, balanceMc: payload.receipt.balanceMc });
      void refresh();
      return payload.result;
    } catch {
      setNotice({ tone: 'warn', text: 'Connection lost. Nothing was charged.' });
      return null;
    } finally { setBusy(false); }
  }

  async function writeSite() {
    const result = await run('/api/ai/write', { brief, sections, design: draft.templateId });
    if (!result) return;
    const written = new Map<string, { title: string; body: string }>(result.sections.map((item: { id: string; title: string; body: string }) => [item.id, item]));
    onCommit({ ...draft, site: { ...draft.site, title: result.title, description: result.description, sections: draft.site.sections.map((item) => { const next = written.get(item.id); return next ? { ...item, title: next.title, body: next.body } : item; }) } });
    setNotice({ tone: 'ok', text: 'Every section now has new words. Read them through, then undo if you prefer the old ones.' });
  }

  async function rewrite() {
    if (!section || !instruction.trim()) return;
    const target = section.id;
    const result = await run('/api/ai/rewrite', { brief, section: { id: section.id, type: section.type, title: section.title, body: section.body }, instruction });
    if (!result) return;
    onCommit({ ...draft, site: { ...draft.site, sections: draft.site.sections.map((item) => item.id === target ? { ...item, title: result.title, body: result.body } : item) } });
    setNotice({ tone: 'ok', text: 'Section rewritten. Undo brings the old version back.' });
  }

  async function planSite() {
    if (!idea.trim()) return;
    setPlan(null);
    const result = await run('/api/ai/plan', { prompt: idea });
    if (result) setPlan(result);
  }

  function applyPlan() {
    if (!plan) return;
    const project = applyAiSitePlan(plan);
    const next = createDraft(draft.templateId, project.brief.name);
    next.business = { ...project.brief, email: draft.business.email };
    next.site.title = project.brief.name;
    next.site.description = plan.seo.description || project.brief.service || next.site.description;
    next.site.theme = { ink: project.brandKit.ink, paper: project.brandKit.paper, accent: project.brandKit.accent };
    next.site.sections = project.pages[0]?.sections || next.site.sections;
    onCommit(next);
    setPlan(null);
    setNotice({ tone: 'ok', text: 'Plan applied. Use “Write my site” next to fill every section with real words.' });
  }

  async function buy(pack: string) {
    setBusy(true);
    try {
      const response = await fetch('/api/ai/credits', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ pack }) });
      const payload = await response.json().catch(() => null);
      if (response.ok && typeof payload?.url === 'string') { window.location.assign(payload.url); return; }
      if (response.status === 401) onOpenAccount();
      setNotice({ tone: 'warn', text: payload?.error || 'Checkout could not start. Nothing was charged.' });
    } catch { setNotice({ tone: 'warn', text: 'Checkout could not start. Nothing was charged.' }); }
    finally { setBusy(false); }
  }

  const closed = !wallet || wallet.state !== 'open';
  const priceLine = quote ? `Usually about ${credits(quote.typicalMc)} credits · never more than ${credits(quote.maxMc)}` : null;
  const short = balance !== null && quote !== null && balance < quote.maxMc;

  return <section className="copilot" aria-labelledby="copilot-title">
    <div className="copilot-head">
      <div><span className="panel-label">Auvrantis AI</span><h2 id="copilot-title">Let AI do the writing.</h2></div>
      {wallet?.signedIn && balance !== null && <button type="button" className="copilot-balance" onClick={() => setShowLedger((open) => !open)} aria-expanded={showLedger}><b>{credits(balance)}</b> credits</button>}
    </div>

    {closed && <p className="copilot-note">AI writing opens soon. Your editor, designs and export all work without it.</p>}

    {wallet && wallet.state === 'open' && !wallet.signedIn && <div className="copilot-signin"><p>Sign in to use AI. New accounts start with free credits, and you only pay for what you use: 1 credit is 1¢.</p><button className="button small" type="button" onClick={onOpenAccount}>Sign in or create account</button></div>}

    {wallet && wallet.state === 'open' && wallet.signedIn && <>
      {showLedger && <div className="copilot-ledger"><b>Recent activity</b>{wallet.ledger.length === 0 ? <small>No charges yet.</small> : <ul>{wallet.ledger.map((row, index) => <li key={`${row.created_at}-${index}`}><span>{row.kind === 'usage' ? ACTION_NAMES[row.action ?? ''] ?? 'AI run' : row.kind === 'purchase' ? 'Credits added' : row.kind === 'signup_grant' ? 'Welcome credits' : 'Adjustment'}{row.input_tokens !== null && row.output_tokens !== null && <small>{tokens(row.input_tokens)} in · {tokens(row.output_tokens)} out</small>}</span><span className={row.delta_mc < 0 ? 'minus' : 'plus'}>{row.delta_mc < 0 ? '−' : '+'}{credits(Math.abs(row.delta_mc))}</span></li>)}</ul>}</div>}

      <div className="copilot-tabs" role="tablist" aria-label="AI actions">
        {(['write', 'rewrite', 'plan'] as Tab[]).map((item) => <button key={item} type="button" role="tab" aria-selected={tab === item} onClick={() => { setTab(item); setNotice(null); }}>{item === 'write' ? 'Write my site' : item === 'rewrite' ? 'Rewrite section' : 'Plan from an idea'}</button>)}
      </div>

      {tab === 'write' && <div className="copilot-body" role="tabpanel">
        <p>Writes headlines and text for all {sections.length} sections of <b>{brief.name || 'your site'}</b>{brief.location ? ` in ${brief.location}` : ''}, in the voice of your design. Nothing invented: no fake reviews, prices or awards.</p>
        <button className="button small" type="button" disabled={busy || short} onClick={() => void writeSite()}>{busy ? 'Writing…' : quote ? `Write my site · up to ${credits(quote.maxMc)} credits` : 'Write my site'}</button>
      </div>}

      {tab === 'rewrite' && <div className="copilot-body" role="tabpanel">
        <p>Rewriting <b>{section?.title || 'the selected section'}</b>. Pick a section in the list above to change which one.</p>
        <label className="field-label" htmlFor="copilot-instruction">What should change?</label>
        <input id="copilot-instruction" value={instruction} maxLength={300} onChange={(event) => setInstruction(event.target.value)} placeholder="Make it warmer and mention Saturday classes" />
        <div className="ai-examples">{REWRITE_STARTERS.map((starter) => <button key={starter} type="button" onClick={() => setInstruction(starter)}>{starter}</button>)}</div>
        <button className="button small" type="button" disabled={busy || short || !instruction.trim()} onClick={() => void rewrite()}>{busy ? 'Rewriting…' : quote ? `Rewrite · up to ${credits(quote.maxMc)} credits` : 'Rewrite'}</button>
      </div>}

      {tab === 'plan' && <div className="copilot-body" role="tabpanel">
        <label className="field-label" htmlFor="copilot-idea">Describe the business</label>
        <textarea id="copilot-idea" value={idea} maxLength={8000} onChange={(event) => setIdea(event.target.value)} placeholder="A family-run taquería in Monterrey with late-night hours and catering" />
        <button className="button small" type="button" disabled={busy || short || !idea.trim()} onClick={() => void planSite()}>{busy ? 'Planning…' : quote ? `Plan it · up to ${credits(quote.maxMc)} credits` : 'Plan it'}</button>
        {plan && <div className="ai-plan-preview"><div className="ai-plan-theme" style={{ background: plan.theme.paper, color: plan.theme.ink }}><strong>{plan.brief.name}</strong><span style={{ background: plan.theme.accent }}>Palette</span></div><b>{plan.pages.length} {plan.pages.length === 1 ? 'page' : 'pages'} suggested</b><div className="ai-page-chips">{plan.pages.map((page) => <span key={page.id}>{page.title}</span>)}</div>{plan.missingInformation.length > 0 && <small>Still needed: {plan.missingInformation.slice(0, 3).join('; ')}</small>}<button className="button small" type="button" onClick={applyPlan}>Apply as an editable draft</button></div>}
      </div>}

      {priceLine && <p className="copilot-price">{priceLine}. Charged on actual tokens after it finishes. Failed runs are free.</p>}

      {receipt && <p className="copilot-receipt" role="status">Charged <b>{credits(receipt.chargedMc)} credits</b> for {tokens(receipt.inputTokens)} tokens in and {tokens(receipt.outputTokens)} out. Balance {credits(receipt.balanceMc)}.</p>}

      {(needsCredits || short) && <div className="copilot-packs"><b>{short ? 'Top up to run this' : 'Add credits'}</b>{wallet.checkoutOpen ? wallet.packs.map((pack) => <button key={pack.id} type="button" disabled={busy} onClick={() => void buy(pack.id)}><span>{pack.name}<small>{pack.credits.toLocaleString('en-US')} credits</small></span><b>${pack.usd}</b></button>) : <small>Credit packs go on sale soon.</small>}</div>}
    </>}

    {notice && <p className={`copilot-notice ${notice.tone}`} role="status">{notice.text}</p>}
  </section>;
}
