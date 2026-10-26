import { describe, expect, it } from 'vitest';
import { canSendCampaign, createCampaignDraft, normalizeSubscriber, recordManualConsent, restoreCampaign, restoreSubscribers } from './marketing';

describe('marketing consent and recovery', () => {
  it('does not infer consent from a valid email', () => {
    expect(normalizeSubscriber('person@example.com')).toMatchObject({ status: 'unverified', consentedAt: null });
    expect(normalizeSubscriber('bad')).toBeNull();
  });
  it('requires evidence and refuses manual reactivation', () => {
    const subscriber = normalizeSubscriber('person@example.com')!;
    expect(() => recordManualConsent(subscriber, '')).toThrow();
    expect(recordManualConsent(subscriber, 'Requested product updates in October.').status).toBe('subscribed');
    expect(() => recordManualConsent({ ...subscriber, status: 'unsubscribed' }, 'Requested updates yesterday.')).toThrow();
  });
  it('treats old auto-consented records as unverified and removes duplicates', () => {
    const rows = restoreSubscribers([{ email: 'Person@example.com', consentedAt: new Date().toISOString(), source: 'website-signup' }, { email: 'person@example.com' }, null]);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ status: 'unverified', consentedAt: null });
    expect(restoreSubscribers({ broken: true })).toEqual([]);
  });
  it('preserves unsubscribe suppression after reload', () => {
    expect(restoreSubscribers([{ email: 'person@example.com', status: 'unsubscribed' }])[0].status).toBe('unsubscribed');
    expect(restoreSubscribers([{ email: 'person@example.com' }, { email: 'PERSON@example.com', status: 'unsubscribed' }])[0].status).toBe('unsubscribed');
  });
  it('fails closed without configured delivery', () => {
    const ready = { ...createCampaignDraft('News'), body: 'A new release', status: 'ready' as const };
    expect(canSendCampaign(ready)).toBe(false);
    expect(canSendCampaign(ready, true)).toBe(true);
    expect(canSendCampaign({ ...ready, body: ' ' }, true)).toBe(false);
  });
  it('bounds restored content and requires fresh review', () => {
    const restored = restoreCampaign({ subject: [], body: 'x'.repeat(21000), status: 'ready' });
    expect(restored.subject).toBe('');
    expect(restored.body).toHaveLength(20000);
    expect(restored.status).toBe('draft');
    expect(createCampaignDraft().id).not.toBe(createCampaignDraft().id);
  });
});
