import { describe, expect, it } from 'vitest';
import { hashSafetyId, validatePrompt } from './ai-provider';

describe('AI provider boundary', () => {
  it('bounds prompts and rejects control characters', () => { expect(validatePrompt('Build a studio website')).toBe('Build a studio website'); expect(() => validatePrompt('x'.repeat(8001))).toThrow(); expect(() => validatePrompt('bad\u0000prompt')).toThrow(); });
  it('hashes a stable privacy-preserving safety identifier', () => { expect(hashSafetyId('user@example.com')).toHaveLength(64); expect(hashSafetyId('user@example.com')).toBe(hashSafetyId('user@example.com')); });
});
