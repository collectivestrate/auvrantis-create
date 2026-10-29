import { NextResponse } from 'next/server';
import { isObject, originAllowed } from '@/lib/cloud/server';
import { accessFor, stripe, subscriptionFor } from '@/lib/learn-access';

export const dynamic = 'force-dynamic';

const error = (status: number, message: string) => NextResponse.json({ error: message }, { status });

export async function POST(req: Request) {
  if (!originAllowed(req)) return error(403, 'Request origin could not be verified.');
  const access = await accessFor(req);
  if (!access.configured) return error(503, 'Payments are not open yet.');
  if (!access.user) return error(401, 'Sign in to manage your plan.');
  const sub = await subscriptionFor(access.user.id).catch(() => null);
  if (!sub?.customer) return error(404, 'No plan was found for this account.');
  try {
    const r = await stripe('/billing_portal/sessions', { customer: sub.customer, return_url: `${new URL(req.url).origin}/learn/account` });
    if (r.status !== 200 || !isObject(r.data) || typeof r.data.url !== 'string') return error(502, 'Billing could not be opened. Please try again.');
    return NextResponse.json({ url: r.data.url });
  } catch {
    return error(502, 'Billing could not be opened. Please try again.');
  }
}
