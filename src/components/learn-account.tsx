'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState, type FormEvent } from 'react';

type Status = { configured: boolean; signedIn: boolean; email: string | null; active: boolean; plan: 'starter' | 'unlimited' | null };
type Plan = 'starter' | 'unlimited';

const PLAN_NAMES: Record<Plan, string> = { starter: 'Starter', unlimited: 'Unlimited' };

async function post(url: string, body?: unknown): Promise<{ ok: boolean; data: Record<string, unknown> }> {
  try {
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: body === undefined ? undefined : JSON.stringify(body) });
    const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    return { ok: res.ok, data };
  } catch {
    return { ok: false, data: { error: 'We could not reach the server. Check your connection and try again.' } };
  }
}

export default function LearnAccount() {
  const [status, setStatus] = useState<Status | null>(null);
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [wantedPlan, setWantedPlan] = useState<Plan | null>(null);
  const [checkout, setCheckout] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/learn/status', { cache: 'no-store' });
      setStatus((await res.json()) as Status);
    } catch {
      setStatus({ configured: false, signedIn: false, email: null, active: false, plan: null });
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const plan = params.get('plan');
    if (plan === 'starter' || plan === 'unlimited') setWantedPlan(plan);
    setCheckout(params.get('checkout'));
    void load();
  }, [load]);

  // After paying, Stripe confirms the plan in the background. Check a few times.
  useEffect(() => {
    if (checkout !== 'success' || !status || status.active) return;
    let tries = 0;
    const timer = window.setInterval(() => {
      tries += 1;
      void load();
      if (tries >= 10) window.clearInterval(timer);
    }, 3000);
    return () => window.clearInterval(timer);
  }, [checkout, status, load]);

  const submitAuth = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setMessage('');
    const r = await post(mode === 'signin' ? '/api/cloud/login' : '/api/cloud/signup', { email, password });
    setBusy(false);
    if (!r.ok) { setMessage(typeof r.data.error === 'string' ? r.data.error : 'That did not work. Please try again.'); return; }
    if (mode === 'signup' && r.data.authenticated === false) { setMessage(typeof r.data.message === 'string' ? r.data.message : 'Check your email to finish creating your account.'); return; }
    setPassword('');
    await load();
  };

  const choosePlan = async (plan: Plan) => {
    setBusy(true);
    setMessage('');
    const r = await post('/api/learn/checkout', { plan });
    if (r.ok && typeof r.data.url === 'string') { window.location.assign(r.data.url); return; }
    setBusy(false);
    setMessage(typeof r.data.error === 'string' ? r.data.error : 'Checkout could not be started. Please try again.');
  };

  const manageBilling = async () => {
    setBusy(true);
    const r = await post('/api/learn/portal');
    if (r.ok && typeof r.data.url === 'string') { window.location.assign(r.data.url); return; }
    setBusy(false);
    setMessage(typeof r.data.error === 'string' ? r.data.error : 'Billing could not be opened. Please try again.');
  };

  const signOut = async () => {
    await post('/api/cloud/logout');
    await load();
  };

  if (!status) return <div className="lc-account-card"><p>Loading your account…</p></div>;

  if (!status.configured) {
    return (
      <div className="lc-account-card">
        <h2>Pro opens soon.</h2>
        <p>We are finishing secure payments for Learning Center Pro. Until then, every Pro course has a free first lesson, and the full beginner course is free.</p>
        <div className="mk-hero-actions lc-locked-actions">
          <Link className="mk-btn" href="/learn/pro">See the Pro courses</Link>
          <Link className="mk-btn mk-btn-ghost" href="/learn">Take the free course</Link>
        </div>
      </div>
    );
  }

  if (!status.signedIn) {
    return (
      <div className="lc-account-card">
        <div className="lc-tabs" role="group" aria-label="Choose sign in or create account">
          <button type="button" aria-pressed={mode === 'signin'} onClick={() => { setMode('signin'); setMessage(''); }}>Sign in</button>
          <button type="button" aria-pressed={mode === 'signup'} onClick={() => { setMode('signup'); setMessage(''); }}>Create account</button>
        </div>
        <h2>{mode === 'signin' ? 'Welcome back.' : 'Create your account.'}</h2>
        <p>{wantedPlan ? `Next, you will choose the ${PLAN_NAMES[wantedPlan]} plan.` : 'Sign in to unlock Pro lessons and manage your plan.'}</p>
        <form className="lc-form" onSubmit={(event) => void submitAuth(event)}>
          <label htmlFor="account-email">Email address</label>
          <input id="account-email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
          <label htmlFor="account-password">Password</label>
          <input id="account-password" type="password" autoComplete={mode === 'signin' ? 'current-password' : 'new-password'} minLength={12} required value={password} onChange={(event) => setPassword(event.target.value)} />
          {mode === 'signup' ? <small>Use at least 12 characters.</small> : null}
          <button className="mk-btn" type="submit" disabled={busy}>{busy ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}</button>
        </form>
        {message ? <p className="lc-account-message" role="status">{message}</p> : null}
      </div>
    );
  }

  if (status.active && status.plan) {
    return (
      <div className="lc-account-card">
        <p className="lc-kicker">Signed in as {status.email}</p>
        <h2>You have full access.</h2>
        <p>Your {PLAN_NAMES[status.plan]} plan unlocks every Learning Center Pro course.</p>
        <div className="mk-hero-actions lc-locked-actions">
          <Link className="mk-btn" href="/learn/pro">Go to Pro courses</Link>
          <button className="mk-btn mk-btn-ghost" type="button" disabled={busy} onClick={() => void manageBilling()}>Manage billing</button>
        </div>
        <button className="lc-text-button" type="button" onClick={() => void signOut()}>Sign out</button>
        {message ? <p className="lc-account-message" role="status">{message}</p> : null}
      </div>
    );
  }

  return (
    <div className="lc-account-card lc-account-wide">
      <p className="lc-kicker">Signed in as {status.email}</p>
      <h2>{checkout === 'success' ? 'Payment received. Unlocking your courses…' : 'Choose your plan.'}</h2>
      <p>{checkout === 'cancelled' ? 'Checkout was cancelled and you have not been charged. You can choose a plan whenever you are ready.' : 'Both plans unlock every Learning Center Pro course. You can cancel any time.'}</p>
      {checkout === 'success' ? null : (
        <div className="lc-plan-choices">
          {(['starter', 'unlimited'] as Plan[]).map((plan) => (
            <button key={plan} type="button" className={plan === 'unlimited' ? 'lc-plan-choice lc-plan-choice-dark' : 'lc-plan-choice'} aria-pressed={wantedPlan === plan} disabled={busy} onClick={() => void choosePlan(plan)}>
              <strong>{PLAN_NAMES[plan]}</strong>
              <span>{plan === 'starter' ? '$5.99 / month' : '$15.99 / month'}</span>
              <small>{plan === 'starter' ? 'All Pro courses · limited Studio creations' : 'All Pro courses · unlimited Studio creations'}</small>
            </button>
          ))}
        </div>
      )}
      <button className="lc-text-button" type="button" onClick={() => void signOut()}>Sign out</button>
      {message ? <p className="lc-account-message" role="status">{message}</p> : null}
    </div>
  );
}
