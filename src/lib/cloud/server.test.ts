import { describe, expect, it } from 'vitest';
import { clientIp, cookies, originAllowed, readJson, validateDraft } from './server';
import { createDraft } from '../templates';

describe('cloud request validation', () => {
  it('allows only the exact request origin', () => {
    expect(originAllowed(new Request('https://create.example/api/cloud/projects', { headers: { origin: 'https://create.example' } }))).toBe(true);
    expect(originAllowed(new Request('https://create.example/api/cloud/projects', { headers: { origin: 'https://evil.example' } }))).toBe(false);
    expect(originAllowed(new Request('https://create.example/api/cloud/projects'))).toBe(false);
  });

  it('rejects oversized and malformed JSON request bodies', async () => {
    const tooLarge = new Request('https://create.example/api/cloud/projects', { method: 'POST', body: ' '.repeat(140_001) });
    expect(await readJson(tooLarge)).toBeNull();
    const malformed = new Request('https://create.example/api/cloud/projects', { method: 'POST', body: '{bad' });
    expect(await readJson(malformed)).toBeNull();
  });

  it('restores only valid drafts and rejects corrupt stored JSON shapes', () => {
    const draft = createDraft();
    expect(validateDraft(draft)).toMatchObject({ version: 1, templateId: 'atelier' });
    expect(validateDraft({ ...draft, site: { ...draft.site, sections: [{ ...draft.site.sections[0], visible: 'yes' }] } })).toBeNull();
    expect(validateDraft({ ...draft, updatedAt: 'not-a-date' })).toBeNull();
    expect(validateDraft({ ...draft, unexpected: { private: true } })).toBeNull();
    expect(validateDraft({ ...draft, site: { ...draft.site, sections: Array.from({ length: 25 }, (_, i) => ({ ...draft.site.sections[0], id: `s-${i}` })) } })).toBeNull();
  });

  it('uses Vercel-provided address first and ignores invalid forwarded data', () => {
    expect(clientIp(new Request('https://create.example', { headers: { 'x-vercel-forwarded-for': '203.0.113.8', 'x-forwarded-for': '198.51.100.4' } }))).toBe('203.0.113.8');
    expect(clientIp(new Request('https://create.example', { headers: { 'x-forwarded-for': 'not-an-ip' } }))).toBe('unknown');
  });

  it('ignores malformed cookie encodings instead of throwing', () => {
    expect(cookies(new Request('https://create.example', { headers: { cookie: 'good=ok; broken=%ZZ' } }))).toEqual({ good: 'ok' });
  });
});

describe('stream limits', () => {
  it('cancels an oversized request stream before reading its remainder', async () => {
    let cancelled = false;
    let chunks = 0;
    const stream = new ReadableStream({
      pull(controller) { chunks += 1; if (chunks <= 20) controller.enqueue(new Uint8Array(70_000)); else controller.close(); },
      cancel() { cancelled = true; },
    });
    const request = new Request('https://create.example/api/cloud/projects', { method: 'POST', body: stream, duplex: 'half' } as RequestInit & { duplex: string });
    expect(await readJson(request)).toBeNull();
    expect(cancelled).toBe(true);
    expect(chunks).toBeLessThan(10);
  });
});
