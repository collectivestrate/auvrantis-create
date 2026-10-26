'use client';
import './marketing-panel.css';

import { useEffect, useState } from 'react';
import {
  canPrepareCampaign, createCampaignDraft, normalizeSubscriber,
  recordManualConsent, restoreCampaign, restoreSubscribers,
  type CampaignDraft, type Subscriber,
} from '@/lib/marketing';

const subscriberKey = 'auvrantis-create:marketing-subscribers';
const campaignKey = 'auvrantis-create:marketing-campaign';

export default function MarketingPanel() {
  const [email, setEmail] = useState('');
  const [consentNote, setConsentNote] = useState('');
  const [consentChecked, setConsentChecked] = useState(false);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [campaign, setCampaign] = useState<CampaignDraft>(() => createCampaignDraft());
  const [notice, setNotice] = useState('');
  const [ready, setReady] = useState(false);
  const [preview, setPreview] = useState(false);
  const [storageError, setStorageError] = useState('');

  useEffect(() => {
    try {
      setSubscribers(restoreSubscribers(JSON.parse(localStorage.getItem(subscriberKey) || '[]')));
      setCampaign(restoreCampaign(JSON.parse(localStorage.getItem(campaignKey) || 'null')));
      setReady(true);
    } catch {
      setStorageError('Saved marketing data could not be read. It has been left untouched. Restore browser storage access before editing.');
    }
  }, []);

  function save(key: string, value: unknown) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      setStorageError('');
      return true;
    } catch {
      setStorageError('Changes are only in memory because browser storage is unavailable. Download your campaign before leaving.');
      return false;
    }
  }

  function addSubscriber(event: React.FormEvent) {
    event.preventDefault();
    if (!ready) return;
    const normalized = normalizeSubscriber(email);
    if (!normalized) { setNotice('Enter a valid email address.'); return; }
    if (subscribers.some((item) => item.email === normalized.email)) {
      setNotice('This address is already listed. Unsubscribed contacts cannot be added again here.');
      return;
    }
    if (subscribers.length >= 5000) { setNotice('This local workspace supports up to 5,000 contacts.'); return; }
    if (!consentChecked) { setNotice('Confirm that this person explicitly requested marketing emails.'); return; }
    try {
      const subscriber = recordManualConsent(normalized, consentNote);
      const next = [...subscribers, subscriber];
      setSubscribers(next);
      const saved = save(subscriberKey, next);
      setEmail(''); setConsentNote(''); setConsentChecked(false);
      setNotice(saved ? 'Contact and your consent record saved on this device.' : 'Contact added to this session only.');
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Unable to add this contact.');
    }
  }

  function unsubscribe(id: string) {
    const next = subscribers.map((item) => item.id === id ? { ...item, status: 'unsubscribed' as const } : item);
    setSubscribers(next);
    save(subscriberKey, next);
    setNotice('Contact marked unsubscribed in this local workspace.');
  }

  function update(patch: Partial<CampaignDraft>) {
    const next = { ...campaign, ...patch, status: 'draft' as const };
    setCampaign(next);
    save(campaignKey, next);
  }

  function download() {
    const content = ['Subject: ' + campaign.subject, 'Preview: ' + campaign.preview, '', campaign.body, '', 'DRAFT — not sent. Add your verified sender, business address, and unsubscribe link before delivery.'].join('\n');
    const url = URL.createObjectURL(new Blob([content], { type: 'text/plain;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url; link.download = 'auvrantis-release-email-draft.txt'; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  const subscribed = subscribers.filter((item) => item.status === 'subscribed').length;
  const unverified = subscribers.filter((item) => item.status === 'unverified').length;
  return <section className="marketing-panel" aria-label="Email marketing">
    <div className="marketing-head"><div><span className="panel-label">AUVRANTIS MARKETING</span><h2>Keep people in the loop.</h2></div><span className="ai-pill">LOCAL DRAFTS</span></div>
    <p>Prepare feature announcements and keep consent records on this device. Public signup, shared team access, and email delivery are not connected yet.</p>
    {storageError && <p className="ai-message" role="alert">{storageError}</p>}
    <fieldset disabled={!ready} className="marketing-fields">
      <details>
        <summary>Contacts · {subscribed} with recorded consent</summary>
        <p className="marketing-help">{unverified > 0 ? unverified + ' older contacts need verified consent before use.' : 'Only add people who explicitly requested these updates.'}</p>
        <form onSubmit={addSubscriber} className="marketing-contact-form">
          <label className="field-label" htmlFor="marketing-contact-email">Email</label>
          <input id="marketing-contact-email" type="email" maxLength={254} value={email} onChange={(event) => setEmail(event.target.value)} required />
          <label className="field-label" htmlFor="marketing-consent-note">Where and when did they agree?</label>
          <textarea id="marketing-consent-note" value={consentNote} minLength={10} maxLength={500} onChange={(event) => setConsentNote(event.target.value)} placeholder="For example: requested product updates through our signup form on October 25." required />
          <label className="marketing-consent"><input type="checkbox" checked={consentChecked} onChange={(event) => setConsentChecked(event.target.checked)} required /> This person explicitly agreed to receive marketing updates.</label>
          <button type="submit" className="outline-button small">Save consent record</button>
        </form>
        <ul className="marketing-contacts">{subscribers.map((item) => <li key={item.id}>
          <span>{item.email}<small>{item.status}</small></span>
          {item.status !== 'unsubscribed' && <button type="button" className="outline-button small" onClick={() => unsubscribe(item.id)} aria-label={'Unsubscribe ' + item.email}>Unsubscribe</button>}
        </li>)}</ul>
      </details>
      <label className="field-label" htmlFor="campaign-subject">Campaign subject</label>
      <input id="campaign-subject" maxLength={160} value={campaign.subject} onChange={(event) => update({ subject: event.target.value })} placeholder="What’s new at Auvrantis?" />
      <label className="field-label" htmlFor="campaign-preview">Inbox preview text</label>
      <input id="campaign-preview" maxLength={200} value={campaign.preview} onChange={(event) => update({ preview: event.target.value })} placeholder="A quick look at this month’s improvements." />
      <label className="field-label" htmlFor="campaign-body">Release message</label>
      <textarea id="campaign-body" maxLength={20000} value={campaign.body} onChange={(event) => update({ body: event.target.value })} placeholder="Tell subscribers what you released and why it matters." />
      <div className="marketing-actions">
        <button className="button small" type="button" disabled={!canPrepareCampaign(campaign)} onClick={() => setPreview(!preview)} aria-expanded={preview}>{preview ? 'Hide preview' : 'Preview email'}</button>
        <button className="outline-button small" type="button" onClick={download} disabled={!canPrepareCampaign(campaign)}>Download draft</button>
        <button className="outline-button small" type="button" disabled aria-describedby="marketing-delivery-status">Send unavailable</button>
      </div>
    </fieldset>
    {preview && <article className="marketing-email-preview" aria-label="Email preview">
      <small>AUVRANTIS GROUP · EMAIL DRAFT</small><h3>{campaign.subject}</h3><p>{campaign.preview}</p><div>{campaign.body}</div>
      <footer>Delivery will require a verified sender, business address, and working unsubscribe link.</footer>
    </article>}
    <p id="marketing-delivery-status" className="marketing-help">Sending requires a connected email provider and authorized team account. No emails are sent from this panel.</p>
    {notice && <p className="ai-message" role="status">{notice}</p>}
  </section>;
}
