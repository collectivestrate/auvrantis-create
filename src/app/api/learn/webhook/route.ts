import { NextResponse } from 'next/server';
import { isObject } from '@/lib/cloud/server';
import { isPlan, saveSubscription, stripe, stripeConfig, verifyStripeSignature } from '@/lib/learn-access';

export const dynamic = 'force-dynamic';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const text = (value: unknown) => (typeof value === 'string' ? value : null);

/** Saves a Stripe subscription object, using the user and plan stored in its metadata. */
async function saveFromSubscription(sub: Record<string, unknown>, deleted = false) {
  const meta: Record<string, unknown> = isObject(sub.metadata) ? sub.metadata : {};
  const userId = text(meta.user_id);
  const plan = meta.plan;
  if (!userId || !UUID.test(userId) || !isPlan(plan)) return;
  await saveSubscription({
    user_id: userId,
    plan,
    status: deleted ? 'canceled' : text(sub.status) ?? 'incomplete',
    stripe_customer_id: text(sub.customer),
    stripe_subscription_id: text(sub.id),
  });
}

export async function POST(req: Request) {
  const c = stripeConfig();
  if (!c) return NextResponse.json({ error: 'Not configured.' }, { status: 503 });
  const raw = await req.text();
  if (raw.length > 500_000 || !verifyStripeSignature(raw, req.headers.get('stripe-signature'), c.webhook)) {
    return NextResponse.json({ error: 'Invalid signature.' }, { status: 400 });
  }

  let event: unknown;
  try { event = JSON.parse(raw); } catch { return NextResponse.json({ error: 'Invalid body.' }, { status: 400 }); }
  if (!isObject(event) || !isObject(event.data) || !isObject(event.data.object)) return NextResponse.json({ received: true });
  const object = event.data.object;

  try {
    if (event.type === 'checkout.session.completed') {
      // Read the subscription itself so the saved status is Stripe's real status.
      const subId = text(object.subscription);
      if (subId) {
        const r = await stripe(`/subscriptions/${encodeURIComponent(subId)}`, undefined, 'GET');
        if (r.status === 200 && isObject(r.data)) await saveFromSubscription(r.data);
      }
    } else if (event.type === 'customer.subscription.created' || event.type === 'customer.subscription.updated') {
      await saveFromSubscription(object);
    } else if (event.type === 'customer.subscription.deleted') {
      await saveFromSubscription(object, true);
    }
  } catch {
    // A 500 tells Stripe to retry the event later.
    return NextResponse.json({ error: 'Could not save.' }, { status: 500 });
  }
  return NextResponse.json({ received: true });
}
