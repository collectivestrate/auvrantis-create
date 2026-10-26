export type Subscriber = { id: string; email: string; consentedAt: string; source: 'website-signup' };
export type CampaignDraft = { id: string; subject: string; preview: string; body: string; status: 'draft' | 'ready'; createdAt: string };

export function normalizeSubscriber(email: string): Subscriber | null { const value = email.trim().toLowerCase(); if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return null; return { id: `sub-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`, email: value, consentedAt: new Date().toISOString(), source: 'website-signup' }; }
export function createCampaignDraft(subject = ''): CampaignDraft { return { id: `campaign-${Date.now().toString(36)}`, subject: subject.trim().slice(0, 160), preview: '', body: '', status: 'draft', createdAt: new Date().toISOString() }; }
export function canSendCampaign(campaign: CampaignDraft): boolean { return campaign.status === 'ready' && campaign.subject.length > 0 && campaign.body.trim().length > 0; }
