import { describe, expect, it } from 'vitest';
import { hashSafetyId, providerConfig, validateBrief, validatePrompt, validateRewrite, validateSections, validateWrittenSite } from './ai-provider';

describe('AI provider boundary', () => {
  it('bounds prompts and rejects control characters', () => { expect(validatePrompt('Build a studio website')).toBe('Build a studio website'); expect(() => validatePrompt('x'.repeat(8001))).toThrow(); expect(() => validatePrompt('bad\u0000prompt')).toThrow(); });
  it('hashes a stable privacy-preserving safety identifier', () => { expect(hashSafetyId('user@example.com')).toHaveLength(64); expect(hashSafetyId('user@example.com')).toBe(hashSafetyId('user@example.com')); });
  it('picks a provider only when its key is set', () => {
    expect(providerConfig({})).toBeNull();
    expect(providerConfig({ OPENAI_API_KEY: 'k' })?.provider).toBe('openai');
    expect(providerConfig({ ANTHROPIC_API_KEY: 'k' })?.provider).toBe('anthropic');
    expect(providerConfig({ AI_PROVIDER: 'anthropic', OPENAI_API_KEY: 'k' })).toBeNull();
  });
});

const sections = validateSections([{ id: 'hero-1', type: 'hero', title: 'Old', body: 'Old body' }, { id: 'contact-1', type: 'contact', title: 'Say hi', body: '' }]);

describe('written site validation', () => {
  it('needs a name or a service in the brief', () => {
    expect(() => validateBrief({})).toThrow();
    expect(validateBrief({ name: 'Maple Street Bakery', location: 'Chicago' }).name).toBe('Maple Street Bakery');
  });
  it('rejects malformed section lists', () => {
    expect(() => validateSections([])).toThrow();
    expect(() => validateSections([{ id: '<script>', type: 'hero' }])).toThrow();
  });
  it('accepts copy for every section, in draft order, with tags stripped', () => {
    const site = validateWrittenSite({ title: 'Maple Street Bakery — Chicago', description: 'Fresh bread every morning in Chicago.', sections: [
      { id: 'contact-1', title: 'Come say hello', body: 'Stop by or <b>email</b> us.' },
      { id: 'hero-1', title: 'Bread worth the early alarm', body: 'Baked before sunrise on Maple Street.' },
      { id: 'unknown', title: 'Ignored', body: 'Ignored' },
    ] }, sections);
    expect(site.sections.map((s) => s.id)).toEqual(['hero-1', 'contact-1']);
    expect(site.sections[1].body).toBe('Stop by or email us.');
  });
  it('rejects a half-written site', () => {
    expect(() => validateWrittenSite({ title: 'T', description: 'D', sections: [{ id: 'hero-1', title: 'A', body: 'B' }] }, sections)).toThrow();
  });
  it('rejects empty rewrites', () => {
    expect(() => validateRewrite({ title: '', body: 'x' })).toThrow();
    expect(validateRewrite({ title: 'Warmer headline', body: 'Short body.' }).title).toBe('Warmer headline');
  });
});
