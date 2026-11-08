// Server-only wrappers around the AI credit functions in migrations/003_ai_credits.sql.

import { randomBytes } from 'node:crypto';
import { config as cloudConfig, isObject, rest, rpc } from './cloud/server';
import { MC_PER_CREDIT, signupCredits } from './ai-billing';

export class WalletError extends Error {}

export function walletConfigured() {
  return !!cloudConfig();
}

export function newRunRef() {
  return `run_${randomBytes(16).toString('hex')}`;
}

function errorCode(data: unknown) {
  return isObject(data) && typeof data.message === 'string' ? data.message : '';
}

/** Returns the balance in millicredits, creating the wallet with signup credits if needed. */
export async function ensureWallet(userId: string) {
  const r = await rpc('auvrantis_ai_wallet_ensure', { p_user: userId, p_grant_mc: signupCredits() * MC_PER_CREDIT });
  if (r.status !== 200 || typeof r.data !== 'number') throw new WalletError('wallet_unavailable');
  return r.data;
}

export async function reserve(userId: string, ref: string, action: string, amountMc: number) {
  const r = await rpc('auvrantis_ai_reserve', { p_user: userId, p_ref: ref, p_action: action, p_amount_mc: amountMc });
  if (r.status === 200 && typeof r.data === 'number') return r.data;
  if (errorCode(r.data).includes('insufficient_credits')) throw new WalletError('insufficient_credits');
  throw new WalletError('wallet_unavailable');
}

export async function settle(ref: string, chargeMc: number, details: { model?: string; inputTokens?: number; outputTokens?: number; providerCostUsd?: number } = {}) {
  // Retried once: a missed settle would leave credits held for 15 minutes.
  for (let attempt = 0; attempt < 2; attempt++) {
    const r = await rpc('auvrantis_ai_settle', {
      p_ref: ref,
      p_charge_mc: Math.max(0, Math.round(chargeMc)),
      p_model: details.model ?? null,
      p_input_tokens: details.inputTokens ?? null,
      p_output_tokens: details.outputTokens ?? null,
      p_provider_cost_usd: details.providerCostUsd ?? null,
    }).catch(() => null);
    if (r && r.status === 200 && typeof r.data === 'number') return r.data;
  }
  throw new WalletError('settle_failed');
}

/** Adds purchased credits once per reference (the Stripe Checkout Session ID). */
export async function credit(userId: string, ref: string, amountMc: number, kind: 'purchase' | 'refund' | 'adjustment' = 'purchase') {
  const r = await rpc('auvrantis_ai_credit', { p_user: userId, p_kind: kind, p_ref: ref, p_amount_mc: amountMc });
  if (r.status !== 200 || typeof r.data !== 'boolean') throw new WalletError('credit_failed');
  return r.data;
}

export type LedgerRow = { kind: string; delta_mc: number; action: string | null; input_tokens: number | null; output_tokens: number | null; created_at: string };

export async function recentLedger(userId: string, limit = 12): Promise<LedgerRow[]> {
  const r = await rest(`/auvrantis_ai_ledger?user_id=eq.${encodeURIComponent(userId)}&select=kind,delta_mc,action,input_tokens,output_tokens,created_at&order=created_at.desc&limit=${Math.min(Math.max(limit, 1), 50)}`);
  if (r.status !== 200 || !Array.isArray(r.data)) return [];
  return r.data.filter(isObject).map((row) => ({
    kind: String(row.kind),
    delta_mc: Number(row.delta_mc) || 0,
    action: typeof row.action === 'string' ? row.action : null,
    input_tokens: typeof row.input_tokens === 'number' ? row.input_tokens : null,
    output_tokens: typeof row.output_tokens === 'number' ? row.output_tokens : null,
    created_at: String(row.created_at),
  }));
}
