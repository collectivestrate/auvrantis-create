import { describe, expect, it } from 'vitest';
import { normalizeProject, parseHandoff, serializeHandoff } from './contracts';

describe('Launch Loop contracts', () => {
  it('round-trips a valid handoff with evidence', () => {
    const handoff = { version: 1, projectId: 'p1', source: 'check', findings: [{ id: 'f1', status: 'open', title: 'Missing title', evidence: { url: 'https://example.com', rule: 'title', observed: '', expected: 'one title', checkedAt: '2026-10-25T00:00:00.000Z', method: 'static-html' } }] };
    expect(parseHandoff(serializeHandoff(handoff))).toEqual(handoff);
  });

  it('rejects oversized handoffs and unknown statuses', () => {
    expect(() => parseHandoff(JSON.stringify({ version: 1, projectId: 'p1', findings: [{ id: 'f', status: 'wat' }] }))).toThrow();
    expect(() => parseHandoff('x'.repeat(140 * 1024 + 1))).toThrow();
  });

  it('normalizes duplicate page IDs deterministically', () => {
    const project = normalizeProject({ id: 'p1', name: 'Site', pages: [{ id: 'home', title: 'Home' }, { id: 'home', title: 'About' }] });
    expect(project.pages.map((page) => page.id)).toEqual(['home', 'home-2']);
  });
});
