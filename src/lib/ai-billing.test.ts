import { describe, expect, it } from 'vitest';
import { ACTIONS, CREDIT_PACKS, packMargin, priceMc, quote, ratesFromEnv, settleMc, signupCredits, type Rates } from './ai-billing';

const rates: Rates = { inputPerMTok: 2, outputPerMTok: 8, markup: 4, minCredits: 1 };

describe('ratesFromEnv', () => {
  it('stays closed without provider rates', () => {
    expect(ratesFromEnv({})).toBeNull();
    expect(ratesFromEnv({ AI_PRICE_INPUT_PER_MTOK: '2' })).toBeNull();
  });
  it('rejects invalid or loss-making settings', () => {
    expect(ratesFromEnv({ AI_PRICE_INPUT_PER_MTOK: 'abc', AI_PRICE_OUTPUT_PER_MTOK: '8' })).toBeNull();
    expect(ratesFromEnv({ AI_PRICE_INPUT_PER_MTOK: '0', AI_PRICE_OUTPUT_PER_MTOK: '8' })).toBeNull();
    expect(ratesFromEnv({ AI_PRICE_INPUT_PER_MTOK: '2', AI_PRICE_OUTPUT_PER_MTOK: '8', AI_MARKUP: '1.1' })).toBeNull();
  });
  it('reads rates with defaults', () => {
    expect(ratesFromEnv({ AI_PRICE_INPUT_PER_MTOK: '2', AI_PRICE_OUTPUT_PER_MTOK: '8' })).toEqual(rates);
  });
});

describe('priceMc', () => {
  it('charges provider cost times markup, in millicredits', () => {
    // 10,000 in × $2/M + 5,000 out × $8/M = $0.06; × 4 = $0.24 = 24 credits
    expect(priceMc({ inputTokens: 10_000, outputTokens: 5_000 }, rates)).toBe(24_000);
  });
  it('never charges below the minimum', () => {
    expect(priceMc({ inputTokens: 10, outputTokens: 10 }, rates)).toBe(1_000);
  });
  it('rounds up, never down', () => {
    // 1,001 out × $8/M × 4 = $0.032032 → 3.2032 credits → 3,204 mc after rounding up
    expect(priceMc({ inputTokens: 0, outputTokens: 1001 }, { ...rates, minCredits: 0 })).toBe(3_204);
  });
  it('ignores negative or fractional token counts', () => {
    expect(priceMc({ inputTokens: -50, outputTokens: 0.5 }, { ...rates, minCredits: 0 })).toBe(0);
  });
});

describe('quote and settle', () => {
  it('keeps the typical price at or under the maximum', () => {
    for (const action of Object.keys(ACTIONS) as Array<keyof typeof ACTIONS>) {
      const q = quote(action, 'A bakery in Chicago with weekend classes', rates);
      expect(q.typicalMc).toBeLessThanOrEqual(q.maxMc);
    }
  });
  it('settles at real usage, capped by the reserve', () => {
    expect(settleMc({ inputTokens: 10_000, outputTokens: 5_000 }, 50_000, rates)).toBe(24_000);
    expect(settleMc({ inputTokens: 10_000_000, outputTokens: 0 }, 50_000, rates)).toBe(50_000);
  });
  it('settles failed runs at zero', () => {
    expect(settleMc(null, 50_000, rates)).toBe(0);
  });
});

describe('packs', () => {
  it('stays profitable on every pack at the default markup', () => {
    for (const pack of CREDIT_PACKS) expect(packMargin(pack, rates)).toBeGreaterThan(0.6);
  });
  it('bounds signup credits', () => {
    expect(signupCredits({})).toBe(25);
    expect(signupCredits({ AI_SIGNUP_CREDITS: '5000' })).toBe(25);
    expect(signupCredits({ AI_SIGNUP_CREDITS: '40' })).toBe(40);
  });
});
