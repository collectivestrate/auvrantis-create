import { describe, expect, it } from 'vitest';
import { canSendCampaign, createCampaignDraft, normalizeSubscriber } from './marketing';
describe('marketing foundations', () => { it('requires a valid opted-in email', () => { expect(normalizeSubscriber(' BAD ')).toBeNull(); expect(normalizeSubscriber('Person@Example.com')?.email).toBe('person@example.com'); }); it('keeps campaigns draft until explicitly ready', () => { const draft = createCampaignDraft('News'); expect(canSendCampaign(draft)).toBe(false); expect(canSendCampaign({ ...draft, body: 'Hello', status: 'ready' })).toBe(true); }); });
