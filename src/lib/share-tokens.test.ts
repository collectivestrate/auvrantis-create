import { describe, expect, it } from 'vitest';
import { createShareToken, digestShareToken, isShareActive } from './share-tokens';

describe('share tokens', () => {
  it('creates high-entropy digestable tokens without exposing the token in the digest', () => { const first = createShareToken(); const second = createShareToken(); expect(first.token).not.toBe(second.token); expect(first.token.length).toBeGreaterThan( thirty()); expect(first.digest).toBe(digestShareToken(first.token)); expect(first.digest).not.toContain(first.token); });
  it('expires and revokes links', () => { const now = Date.parse('2026-10-25T00:00:00.000Z'); expect(isShareActive({ digest: 'a', resourceId: 'p1', ownerId: 'u1', expiresAt: '2026-10-26T00:00:00.000Z' }, now)).toBe(true); expect(isShareActive({ digest: 'a', resourceId: 'p1', ownerId: 'u1', expiresAt: '2026-10-26T00:00:00.000Z', revokedAt: '2026-10-25T00:00:00.000Z' }, now)).toBe(false); });
});
function thirty() { return 30; }
