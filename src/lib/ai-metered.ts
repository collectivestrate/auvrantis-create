// Runs one AI action for a signed-in visitor and bills it by the token:
// quote → reserve the maximum → call the model → settle at real usage (or zero on failure).

import { NextResponse } from 'next/server';
import { budget, cookieHeaders, currentUser, originAllowed } from './cloud/server';
import { priceMc, providerCostUsd, quote, ratesFromEnv, type AiAction, type Rates, type Usage } from './ai-billing';
import { ensureWallet, newRunRef, reserve, settle, walletConfigured, WalletError } from './ai-wallet';
import { ModelError, providerConfig } from './ai-provider';

export type AiAvailability = { state: 'open' | 'closed'; reason?: 'no_provider' | 'no_pricing' | 'no_wallet'; rates: Rates | null };

export function aiAvailability(): AiAvailability {
  const rates = ratesFromEnv();
  if (!providerConfig()) return { state: 'closed', reason: 'no_provider', rates };
  if (!rates) return { state: 'closed', reason: 'no_pricing', rates };
  if (!walletConfigured()) return { state: 'closed', reason: 'no_wallet', rates };
  return { state: 'open', rates };
}

const MESSAGES: Record<string, string> = {
  ai_unavailable: 'AI is not open yet. Everything else in the Studio works as usual.',
  prompt_invalid: 'That request is too long or has characters we cannot send. Shorten it and try again.',
  sign_in: 'Sign in to use AI. New accounts get free credits to try it.',
  insufficient_credits: 'You need more credits for this. Nothing was charged.',
  rate_limited: 'That was a lot of AI runs in a short time. Wait a minute and try again.',
  ai_rate_limited: 'The AI provider is busy. Nothing was charged. Try again in a moment.',
  ai_invalid_output: 'The result did not pass our checks, so we discarded it. Nothing was charged.',
  ai_incomplete: 'The AI stopped before finishing. Nothing was charged.',
  ai_provider_error: 'The AI could not finish. Nothing was charged and your draft is unchanged.',
  wallet_unavailable: 'Credits are briefly unavailable. Nothing was charged. Try again shortly.',
  origin: 'Request origin could not be verified.',
};

const STATUS: Record<string, number> = { ai_unavailable: 503, prompt_invalid: 400, sign_in: 401, insufficient_credits: 402, rate_limited: 429, ai_rate_limited: 503, wallet_unavailable: 503, origin: 403 };

export function aiError(code: string, extra: Record<string, unknown> = {}, headers?: HeadersInit) {
  return NextResponse.json({ error: { code, message: MESSAGES[code] ?? MESSAGES.ai_provider_error, ...extra } }, { status: STATUS[code] ?? 502, headers });
}

export type Receipt = { chargedMc: number; balanceMc: number; inputTokens: number; outputTokens: number; model: string };

export async function runMetered<T>(req: Request, action: AiAction, quotedText: string, task: (safetyId: string) => Promise<{ value: T; usage: Usage; model: string }>) {
  if (!originAllowed(req)) return aiError('origin');
  const availability = aiAvailability();
  if (availability.state !== 'open' || !availability.rates) return aiError('ai_unavailable');
  const rates = availability.rates;

  let state: Awaited<ReturnType<typeof currentUser>>;
  try { state = await currentUser(req); } catch { return aiError('wallet_unavailable'); }
  const session = cookieHeaders(state.refreshed, state.refresh, state.invalid);
  if (!state.user) return aiError('sign_in', {}, session);
  const user = state.user;

  try {
    const allowed = (await budget(req, 'ai_run_minute', 8, 60, user.id)) && (await budget(req, 'ai_run_hour', 80, 3600, user.id));
    if (!allowed) return aiError('rate_limited', {}, session);
  } catch { return aiError('wallet_unavailable', {}, session); }

  const q = quote(action, quotedText, rates);
  const ref = newRunRef();
  let balanceMc: number;
  try {
    balanceMc = await ensureWallet(user.id);
    if (balanceMc < q.maxMc) return aiError('insufficient_credits', { balanceMc, neededMc: q.maxMc }, session);
    balanceMc = await reserve(user.id, ref, action, q.maxMc);
  } catch (error) {
    const code = error instanceof WalletError && error.message === 'insufficient_credits' ? 'insufficient_credits' : 'wallet_unavailable';
    return aiError(code, {}, session);
  }

  try {
    const result = await task(user.id);
    const chargedMc = Math.min(q.maxMc, priceMc(result.usage, rates));
    const after = await settle(ref, chargedMc, { model: result.model, inputTokens: result.usage.inputTokens, outputTokens: result.usage.outputTokens, providerCostUsd: Number(providerCostUsd(result.usage, rates).toFixed(8)) })
      .catch(() => balanceMc + q.maxMc - chargedMc);
    const receipt: Receipt = { chargedMc, balanceMc: after, inputTokens: result.usage.inputTokens, outputTokens: result.usage.outputTokens, model: result.model };
    return NextResponse.json({ result: result.value, receipt }, { headers: session });
  } catch (error) {
    // Failed and rejected runs are free: release the whole hold.
    const after = await settle(ref, 0).catch(() => balanceMc + q.maxMc);
    const code = error instanceof ModelError ? error.message : error instanceof Error && error.message === 'prompt_invalid' ? 'prompt_invalid' : 'ai_provider_error';
    return aiError(code, { balanceMc: after }, session);
  }
}
