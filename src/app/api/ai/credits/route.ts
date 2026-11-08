import { NextResponse } from 'next/server';
import { currentUser, isObject, originAllowed, readJson } from '@/lib/cloud/server';
import { packById } from '@/lib/ai-billing';
import { creditsCheckoutOpen, stripe } from '@/lib/learn-access';

export const dynamic = 'force-dynamic';

const error = (status: number, message: string) => NextResponse.json({ error: message }, { status });

/** Starts a one-time Stripe Checkout for a credit pack. Credits are added by the signed webhook, never here. */
export async function POST(req: Request) {
  if (!originAllowed(req)) return error(403, 'Request origin could not be verified.');
  if (!creditsCheckoutOpen()) return error(503, 'Credit purchases are not open yet.');
  let user;
  try { user = (await currentUser(req)).user; } catch { return error(503, 'Sign-in is briefly unavailable. Try again shortly.'); }
  if (!user) return error(401, 'Sign in to buy credits.');
  const body = await readJson(req);
  const pack = packById(isObject(body) ? body.pack : null);
  if (!pack) return error(400, 'Choose a credit pack.');
  const origin = new URL(req.url).origin;
  try {
    const r = await stripe('/checkout/sessions', {
      mode: 'payment',
      'line_items[0][quantity]': '1',
      'line_items[0][price_data][currency]': 'usd',
      'line_items[0][price_data][unit_amount]': String(Math.round(pack.usd * 100)),
      'line_items[0][price_data][product_data][name]': `Auvrantis AI credits — ${pack.name}`,
      'line_items[0][price_data][product_data][description]': `${pack.credits.toLocaleString('en-US')} credits. 1 credit = 1¢ of AI usage. Credits do not expire.`,
      success_url: `${origin}/studio?credits=success`,
      cancel_url: `${origin}/studio?credits=cancelled`,
      client_reference_id: user.id,
      customer_email: user.email,
      'metadata[kind]': 'ai_credits',
      'metadata[pack]': pack.id,
      'metadata[user_id]': user.id,
      'payment_intent_data[metadata][kind]': 'ai_credits',
      'payment_intent_data[metadata][user_id]': user.id,
    });
    if (r.status !== 200 || !isObject(r.data) || typeof r.data.url !== 'string') return error(502, 'Checkout could not be started. Please try again.');
    return NextResponse.json({ url: r.data.url });
  } catch {
    return error(502, 'Checkout could not be started. Please try again.');
  }
}
