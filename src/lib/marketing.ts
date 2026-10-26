export type Subscriber = { id: string; email: string; status: 'unverified' | 'subscribed' | 'unsubscribed'; consentedAt: string | null; consentNote: string; source: 'manual' | 'legacy' };
export type CampaignDraft = { id: string; subject: string; preview: string; body: string; status: 'draft' | 'ready'; createdAt: string };
const record = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object' && !Array.isArray(value);
const text = (value: unknown, limit: number) => typeof value === 'string' ? value.slice(0, limit) : '';
const date = (value: unknown) => typeof value === 'string' && Number.isFinite(Date.parse(value)) ? value : null;

// Email syntax alone is not evidence of marketing consent.
export function normalizeSubscriber(email: string): Subscriber | null {
  const value = email.trim().toLowerCase();
  if (value.length > 254 || !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(value)) return null;
  return { id: crypto.randomUUID(), email: value, status: 'unverified', consentedAt: null, consentNote: '', source: 'manual' };
}
export function recordManualConsent(subscriber: Subscriber, note: string): Subscriber {
  if (subscriber.status === 'unsubscribed') throw new Error('An unsubscribed contact must subscribe again through the public signup flow.');
  if (note.trim().length < 10 || note.length > 500) throw new Error('Describe where and when this person agreed to updates (10–500 characters).');
  return { ...subscriber, status: 'subscribed', consentedAt: new Date().toISOString(), consentNote: note.trim() };
}
export function restoreSubscribers(raw: unknown): Subscriber[] {
  if (!Array.isArray(raw)) return [];
  const seen = new Set<string>();
  const suppressed = new Set(raw.filter((item) => record(item) && item.status === 'unsubscribed' && typeof item.email === 'string').map((item) => (item.email as string).trim().toLowerCase()));
  return raw.slice(0, 5000).flatMap((item) => {
    if (!record(item) || typeof item.email !== 'string') return [];
    const normalized = normalizeSubscriber(item.email);
    if (!normalized || seen.has(normalized.email)) return [];
    seen.add(normalized.email);
    const consentedAt = date(item.consentedAt);
    const consentNote = text(item.consentNote, 500);
    const status = suppressed.has(normalized.email) ? 'unsubscribed' : item.status === 'subscribed' && consentedAt && consentNote.trim().length >= 10 ? 'subscribed' : 'unverified';
    return [{ ...normalized, id: text(item.id, 100) || normalized.id, source: item.source === 'manual' ? 'manual' : 'legacy', status, consentedAt: status === 'unverified' ? null : consentedAt, consentNote } as Subscriber];
  });
}
export function createCampaignDraft(subject = ''): CampaignDraft {
  return { id: crypto.randomUUID(), subject: subject.trim().slice(0, 160), preview: '', body: '', status: 'draft', createdAt: new Date().toISOString() };
}
export function restoreCampaign(raw: unknown): CampaignDraft {
  const fresh = createCampaignDraft();
  if (!record(raw)) return fresh;
  return { id: text(raw.id, 100) || fresh.id, subject: text(raw.subject, 160), preview: text(raw.preview, 200), body: text(raw.body, 20000), createdAt: date(raw.createdAt) || fresh.createdAt, status: 'draft' };
}
export function canPrepareCampaign(campaign: CampaignDraft) { return !!campaign.subject.trim() && !!campaign.body.trim(); }
export function canSendCampaign(campaign: CampaignDraft, verifiedDelivery = false): boolean {
  return verifiedDelivery && campaign.status === 'ready' && canPrepareCampaign(campaign);
}
