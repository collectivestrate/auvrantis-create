import { NextResponse } from 'next/server';
import { cookieHeaders, currentUser } from '@/lib/cloud/server';
import { ACTIONS, CREDIT_PACKS, quote, type AiAction } from '@/lib/ai-billing';
import { ensureWallet, recentLedger } from '@/lib/ai-wallet';
import { aiAvailability } from '@/lib/ai-metered';
import { creditsCheckoutOpen } from '@/lib/learn-access';

export const dynamic = 'force-dynamic';

const noStore = { 'Cache-Control': 'no-store, max-age=0' };

/** What the Studio needs to show AI: open or not, the visitor's balance, recent charges and live prices. */
export async function GET(req: Request) {
  const availability = aiAvailability();
  const chars = Math.min(Math.max(Number(new URL(req.url).searchParams.get('chars')) || 400, 0), 40_000);
  const quotes = availability.rates
    ? (Object.keys(ACTIONS) as AiAction[]).map((action) => quote(action, chars, availability.rates!))
    : [];
  const base = { state: availability.state, quotes, packs: CREDIT_PACKS, checkoutOpen: creditsCheckoutOpen() };
  if (availability.state !== 'open') return NextResponse.json({ ...base, signedIn: false, balanceMc: null, ledger: [] }, { headers: noStore });

  let state: Awaited<ReturnType<typeof currentUser>>;
  try { state = await currentUser(req); } catch { return NextResponse.json({ ...base, state: 'closed', signedIn: false, balanceMc: null, ledger: [] }, { headers: noStore }); }
  const headers = cookieHeaders(state.refreshed, state.refresh, state.invalid);
  Object.entries(noStore).forEach(([key, value]) => headers.set(key, value));
  if (!state.user) return NextResponse.json({ ...base, signedIn: false, balanceMc: null, ledger: [] }, { headers });
  try {
    const balanceMc = await ensureWallet(state.user.id);
    const ledger = await recentLedger(state.user.id);
    return NextResponse.json({ ...base, signedIn: true, email: state.user.email, balanceMc, ledger }, { headers });
  } catch {
    return NextResponse.json({ ...base, state: 'closed', signedIn: true, balanceMc: null, ledger: [] }, { headers });
  }
}
