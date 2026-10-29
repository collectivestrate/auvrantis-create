// Server-only helpers for Learning Center Pro: who is signed in, whether they
// have an active plan, and small wrappers around the Stripe REST API.
// Everything stays off until STRIPE_* and SUPABASE_* are set in Vercel.

import { createHmac, timingSafeEqual } from 'node:crypto';
import { config as cloudConfig, currentUser, isObject, rest, type User } from './cloud/server';

export type Plan = 'starter' | 'unlimited';
export const PLANS: Plan[] = ['starter', 'unlimited'];
export const SUBSCRIPTIONS = 'auvrantis_learn_subscriptions';
const ACTIVE = ['active', 'trialing'];

export type Access = {
  configured: boolean;
  signedIn: boolean;
  email: string | null;
  active: boolean;
  plan: Plan | null;
  user: User | null;
  refreshed?: string;
  refresh?: string;
  invalid?: boolean;
};

export function isPlan(value: unknown): value is Plan {
  return typeof value === 'string' && (PLANS as string[]).includes(value);
}

export function stripeConfig() {
  const secret = process.env.STRIPE_SECRET_KEY;
  const webhook = process.env.STRIPE_WEBHOOK_SECRET;
  const prices: Record<Plan, string | undefined> = { starter: process.env.STRIPE_PRICE_STARTER, unlimited: process.env.STRIPE_PRICE_UNLIMITED };
  if (!secret || !webhook || !prices.starter || !prices.unlimited) return null;
  return { secret, webhook, prices: prices as Record<Plan, string> };
}

export function billingConfigured() {
  return !!stripeConfig() && !!cloudConfig();
}

export async function subscriptionFor(userId: string): Promise<{ plan: Plan | null; status: string | null; customer: string | null }> {
  const r = await rest(`/${SUBSCRIPTIONS}?user_id=eq.${encodeURIComponent(userId)}&select=plan,status,stripe_customer_id&limit=1`);
  if (r.status !== 200 || !Array.isArray(r.data) || !isObject(r.data[0])) return { plan: null, status: null, customer: null };
  const row = r.data[0];
  return {
    plan: isPlan(row.plan) ? row.plan : null,
    status: typeof row.status === 'string' ? row.status : null,
    customer: typeof row.stripe_customer_id === 'string' ? row.stripe_customer_id : null,
  };
}

/** Works out access from the request's cookies. Never throws; failures mean "no access". */
export async function accessFor(req: Request): Promise<Access> {
  const none: Access = { configured: billingConfigured(), signedIn: false, email: null, active: false, plan: null, user: null };
  if (!none.configured) return none;
  try {
    const state = await currentUser(req);
    if (!state.user) return { ...none, invalid: state.invalid };
    const sub = await subscriptionFor(state.user.id);
    const active = !!sub.status && ACTIVE.includes(sub.status) && !!sub.plan;
    return { ...none, signedIn: true, email: state.user.email, user: state.user, active, plan: active ? sub.plan : null, refreshed: state.refreshed, refresh: state.refresh };
  } catch {
    return none;
  }
}

/** Builds a Request from page headers so server components can reuse accessFor. */
export function requestFromCookies(cookieHeader: string | null) {
  return new Request('https://auvrantis-create.local/', { headers: cookieHeader ? { cookie: cookieHeader } : {} });
}

export async function stripe(path: string, params?: Record<string, string>, method: 'GET' | 'POST' = 'POST') {
  const c = stripeConfig();
  if (!c) throw new Error('stripe_unconfigured');
  const res = await fetch(`https://api.stripe.com/v1${path}`, {
    method,
    headers: { Authorization: `Bearer ${c.secret}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: method === 'POST' && params ? new URLSearchParams(params).toString() : undefined,
    cache: 'no-store',
    signal: AbortSignal.timeout(10000),
  });
  let data: unknown = null;
  try { data = await res.json(); } catch { /* non-JSON response */ }
  return { status: res.status, data };
}

/** Verifies a Stripe-Signature header (t=timestamp,v1=signature) against the raw body. */
export function verifyStripeSignature(rawBody: string, header: string | null, secret: string, toleranceSeconds = 300, now = Date.now()) {
  if (!header) return false;
  const parts = header.split(',').map((part) => part.split('='));
  const timestamp = parts.find(([key]) => key === 't')?.[1];
  const signatures = parts.filter(([key]) => key === 'v1').map(([, value]) => value);
  if (!timestamp || !/^\d+$/.test(timestamp) || signatures.length === 0) return false;
  if (Math.abs(now / 1000 - Number(timestamp)) > toleranceSeconds) return false;
  const expected = createHmac('sha256', secret).update(`${timestamp}.${rawBody}`).digest();
  return signatures.some((signature) => {
    if (!/^[0-9a-f]{64}$/.test(signature)) return false;
    const given = Buffer.from(signature, 'hex');
    return given.length === expected.length && timingSafeEqual(given, expected);
  });
}

export async function saveSubscription(row: { user_id: string; plan: Plan; status: string; stripe_customer_id: string | null; stripe_subscription_id: string | null }) {
  const r = await rest(`/${SUBSCRIPTIONS}?on_conflict=user_id`, {
    method: 'POST',
    headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify({ ...row, updated_at: new Date().toISOString() }),
  });
  if (r.status < 200 || r.status >= 300) throw new Error('subscription_save_failed');
}
