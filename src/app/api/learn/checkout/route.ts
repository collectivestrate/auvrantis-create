import { NextResponse } from 'next/server';
import { isObject, originAllowed, readJson } from '@/lib/cloud/server';
import { accessFor, isPlan, stripe, stripeConfig, subscriptionFor } from '@/lib/learn-access';

export const dynamic = 'force-dynamic';

const error = (status: number, message: string) => NextResponse.json({ error: message }, { status });

export async function POST(req: Request) {
  if (!originAllowed(req)) return error(403, 'Request origin could not be verified.');
  const c = stripeConfig();
  const access = await accessFor(req);
  if (!c || !access.configured) return error(503, 'Payments are not open yet. Please check back soon.');
  if (!access.user) return error(401, 'Sign in to choose a plan.');
  if (access.active) return error(409, 'You already have an active plan.');

  const body = await readJson(req);
  if (!isObject(body) || !isPlan(body.plan)) return error(400, 'Choose the Starter or Unlimited plan.');
  const plan = body.plan;
  const origin = new URL(req.url).origin;

  const params: Record<string, string> = {
    mode: 'subscription',
    'line_items[0][price]': c.prices[plan],
    'line_items[0][quantity]': '1',
    success_url: `${origin}/learn/account?checkout=success`,
    cancel_url: `${origin}/learn/account?checkout=cancelled`,
    client_reference_id: access.user.id,
    allow_promotion_codes: 'true',
    'metadata[plan]': plan,
    'metadata[user_id]': access.user.id,
    'subscription_data[metadata][plan]': plan,
    'subscription_data[metadata][user_id]': access.user.id,
  };
  const existing = await subscriptionFor(access.user.id).catch(() => null);
  if (existing?.customer) params.customer = existing.customer;
  else params.customer_email = access.user.email;

  try {
    const r = await stripe('/checkout/sessions', params);
    if (r.status !== 200 || !isObject(r.data) || typeof r.data.url !== 'string') return error(502, 'Checkout could not be started. Please try again.');
    return NextResponse.json({ url: r.data.url });
  } catch {
    return error(502, 'Checkout could not be started. Please try again.');
  }
}
