// Pay-per-token pricing for Auvrantis AI.
//
// How a run is priced:
//   provider cost (USD) = input tokens × input rate + output tokens × output rate
//   price (credits)     = provider cost × markup ÷ $0.01, rounded up, never below the minimum
//
// One credit is one US cent. Balances are stored in millicredits (1 credit = 1,000 mc)
// so small runs are charged exactly instead of being rounded to whole credits.
//
// Before a run we reserve its maximum price (output tokens are capped per action),
// then settle to the real price from the provider's usage report. A run that fails or
// returns output that does not pass validation is settled at zero: the visitor only
// pays for results they can use.
//
// Everything here is pure so it can be tested and shown on the pricing page.

export const MC_PER_CREDIT = 1000;
export const USD_PER_CREDIT = 0.01;

export type AiAction = 'plan' | 'write' | 'rewrite';

export type ActionProfile = {
  label: string;
  /** Tokens sent besides the visitor's own text: instructions, schema and context. */
  baseInputTokens: number;
  /** Output tokens a typical run uses. Used for the "usually" figure in quotes. */
  typicalOutputTokens: number;
  /** Hard cap sent to the provider. The reserve is priced at this cap. */
  maxOutputTokens: number;
};

export const ACTIONS: Record<AiAction, ActionProfile> = {
  plan: { label: 'Plan a site', baseInputTokens: 900, typicalOutputTokens: 1100, maxOutputTokens: 2400 },
  write: { label: 'Write a whole site', baseInputTokens: 1400, typicalOutputTokens: 2600, maxOutputTokens: 6000 },
  rewrite: { label: 'Rewrite a section', baseInputTokens: 700, typicalOutputTokens: 350, maxOutputTokens: 900 },
};

export function isAction(value: unknown): value is AiAction {
  return typeof value === 'string' && Object.prototype.hasOwnProperty.call(ACTIONS, value);
}

export type Rates = {
  /** USD per million input tokens. */
  inputPerMTok: number;
  /** USD per million output tokens. */
  outputPerMTok: number;
  /** Your multiple over provider cost. 4 means a run that costs you 1¢ is sold for 4¢. */
  markup: number;
  /** Smallest charge for any successful run, in credits. */
  minCredits: number;
};

export type Usage = { inputTokens: number; outputTokens: number };

export type Quote = {
  action: AiAction;
  label: string;
  typicalMc: number;
  maxMc: number;
  typicalCredits: number;
  maxCredits: number;
};

const positive = (value: number) => Number.isFinite(value) && value > 0;

function envNumber(name: string, env: Record<string, string | undefined>) {
  const raw = env[name];
  if (raw === undefined || raw.trim() === '') return undefined;
  const value = Number(raw);
  return Number.isFinite(value) ? value : NaN;
}

/**
 * Reads pricing from environment variables. Returns null when the provider's token
 * rates are missing or invalid, so AI stays closed rather than running at a loss.
 */
export function ratesFromEnv(env: Record<string, string | undefined> = process.env): Rates | null {
  const inputPerMTok = envNumber('AI_PRICE_INPUT_PER_MTOK', env);
  const outputPerMTok = envNumber('AI_PRICE_OUTPUT_PER_MTOK', env);
  const markup = envNumber('AI_MARKUP', env) ?? 4;
  const minCredits = envNumber('AI_MIN_CHARGE_CREDITS', env) ?? 1;
  if (inputPerMTok === undefined || outputPerMTok === undefined) return null;
  if (!positive(inputPerMTok) || !positive(outputPerMTok)) return null;
  // A markup under 1.5× cannot cover payment fees and failed-run absorption.
  if (!Number.isFinite(markup) || markup < 1.5 || markup > 50) return null;
  if (!Number.isFinite(minCredits) || minCredits < 0 || minCredits > 1000) return null;
  return { inputPerMTok, outputPerMTok, markup, minCredits };
}

/** Rough token count for text: about four characters per token for English. */
export function estimateTokens(text: string) {
  return Math.ceil(text.length / 4);
}

export function providerCostUsd(usage: Usage, rates: Rates) {
  return (usage.inputTokens * rates.inputPerMTok + usage.outputTokens * rates.outputPerMTok) / 1_000_000;
}

/** Price of a finished run in millicredits. */
export function priceMc(usage: Usage, rates: Rates) {
  const inputTokens = Math.max(0, Math.floor(usage.inputTokens));
  const outputTokens = Math.max(0, Math.floor(usage.outputTokens));
  const usd = providerCostUsd({ inputTokens, outputTokens }, rates) * rates.markup;
  // Round up to the nearest millicredit; float noise must never undercharge by one.
  const mc = Math.ceil((usd / USD_PER_CREDIT) * MC_PER_CREDIT - 1e-9);
  return Math.max(Math.round(rates.minCredits * MC_PER_CREDIT), mc);
}

export function mcToCredits(mc: number) {
  return Math.round(mc / 100) / 10; // one decimal place
}

export function formatCredits(mc: number) {
  const credits = mc / MC_PER_CREDIT;
  if (credits >= 100) return Math.round(credits).toLocaleString('en-US');
  return (Math.ceil(credits * 10) / 10).toLocaleString('en-US', { maximumFractionDigits: 1 });
}

/** Typical and maximum price for an action, given the visitor's own text. */
export function quote(action: AiAction, userText: string | number, rates: Rates): Quote {
  const profile = ACTIONS[action];
  const userTokens = typeof userText === 'number' ? Math.ceil(Math.min(Math.max(userText, 0), 40_000) / 4) : estimateTokens(userText);
  const inputTokens = profile.baseInputTokens + userTokens;
  // Allow 25% headroom on input estimates; tokenizers vary by language.
  const maxInput = Math.ceil(inputTokens * 1.25);
  const typicalMc = priceMc({ inputTokens, outputTokens: profile.typicalOutputTokens }, rates);
  const maxMc = priceMc({ inputTokens: maxInput, outputTokens: profile.maxOutputTokens }, rates);
  return { action, label: profile.label, typicalMc, maxMc, typicalCredits: mcToCredits(typicalMc), maxCredits: mcToCredits(maxMc) };
}

/** The amount to settle a reserved run at: real usage, never above what was reserved. */
export function settleMc(usage: Usage | null, reservedMc: number, rates: Rates) {
  if (!usage) return 0;
  return Math.min(reservedMc, priceMc(usage, rates));
}

// ---------------------------------------------------------------------------
// Credit packs. Larger packs carry bonus credits; the effective markup stays
// well above cost at every size (see packMargin).

export type CreditPack = { id: 'spark' | 'studio' | 'agency'; name: string; usd: number; credits: number; note: string };

export const CREDIT_PACKS: CreditPack[] = [
  { id: 'spark', name: 'Spark', usd: 10, credits: 1000, note: 'For one site and a few rounds of edits.' },
  { id: 'studio', name: 'Studio', usd: 25, credits: 2750, note: '10% bonus credits. For a busy month.' },
  { id: 'agency', name: 'Agency', usd: 60, credits: 7200, note: '20% bonus credits. For client work.' },
];

export function packById(id: unknown) {
  return CREDIT_PACKS.find((pack) => pack.id === id) ?? null;
}

/** Credits given once to every new account so people can try AI before buying. */
export function signupCredits(env: Record<string, string | undefined> = process.env) {
  const value = envNumber('AI_SIGNUP_CREDITS', env) ?? 25;
  return Number.isFinite(value) && value >= 0 && value <= 1000 ? Math.floor(value) : 25;
}

/**
 * Gross margin on AI spend for a pack after card fees, as a fraction (0.7 = 70%).
 * Card fees default to 2.9% + 30¢.
 */
export function packMargin(pack: CreditPack, rates: Rates, feePct = 0.029, feeFixed = 0.3) {
  const revenue = pack.usd - (pack.usd * feePct + feeFixed);
  const providerCost = (pack.credits * USD_PER_CREDIT) / rates.markup;
  return (revenue - providerCost) / pack.usd;
}
