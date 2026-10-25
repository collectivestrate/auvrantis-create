'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Draft } from '@/lib/templates';
import styles from './cloud-panel.module.css';

type Project = { id: string; title: string; draft: Draft; updatedAt: string; publication?: { slug: string; active: boolean } | null };
type Session = { configured: boolean; authenticated: boolean; email: string | null };
async function request(path: string, method = 'GET', body?: unknown) {
  const res = await fetch(`/api/cloud/${path}`, { method, credentials: 'same-origin', headers: body ? { 'Content-Type': 'application/json' } : undefined, body: body ? JSON.stringify(body) : undefined, cache: 'no-store' });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(typeof data.error === 'string' ? data.error : 'That request could not be completed.');
  return data;
}

export default function CloudPanel({ draft, onLoad }: { draft: Draft; onLoad: (draft: Draft) => void }) {
  const [session, setSession] = useState<Session | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selected, setSelected] = useState('');
  const [savedAt, setSavedAt] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [conflict, setConflict] = useState<{ id: string; local: Draft } | null>(null);
  const refresh = useCallback(async () => {
    try {
      const s = await request('session'); setSession(s);
      if (s.authenticated) {
        const p = await request('projects'); setProjects(p.projects || []);
      } else setProjects([]);
    } catch (e) { setSession({ configured: false, authenticated: false, email: null }); setMessage(e instanceof Error ? e.message : 'Cloud is unavailable.'); }
  }, []);
  useEffect(() => { void refresh(); }, [refresh]);

  async function act(fn: () => Promise<void>) {
    setBusy(true); setMessage('');
    try { await fn(); } catch (e) { setMessage(e instanceof Error ? e.message : 'That request could not be completed.'); }
    finally { setBusy(false); }
  }
  async function authAction() {
    await act(async () => {
      const result = await request(mode, 'POST', { email, password });
      setPassword(''); setMessage(result.message || (mode === 'signup' ? 'Account created.' : 'Signed in.'));
      await refresh();
    });
  }
  async function save() {
    await act(async () => {
      if (selected) {
        const prior = projects.find((p) => p.id === selected);
        if (!prior) throw new Error('Choose a project first.');
        let p;
        try { p = await request(`projects/${selected}`, 'PUT', { draft, expectedUpdatedAt: prior.updatedAt }); } catch (error) { if (error instanceof Error && error.message.toLowerCase().includes('conflict')) setConflict({ id: selected, local: draft }); throw error; }
        setSavedAt(p.project.updated_at || p.project.updatedAt || new Date().toISOString());
        setMessage('Saved to your account.');
      } else {
        const p = await request('projects', 'POST', { draft });
        setSelected(p.project.id); setSavedAt(p.project.updated_at || new Date().toISOString());
        setMessage('New cloud project created.');
      }
      await refresh();
    });
  }
  async function load() {
    await act(async () => {
      if (!selected) throw new Error('Choose a project to load.');
      const p = await request(`projects/${selected}`);
      onLoad(p.project.draft); setMessage('Loaded from your account.');
    });
  }
  async function publish() {
    await act(async () => {
      if (!selected) throw new Error('Save a cloud project before publishing.');
      const p = await request('publish', 'POST', { projectId: selected });
      await refresh(); setMessage(`Published: ${p.url}`);
    });
  }
  async function unpublish() {
    await act(async () => { await request(`publications/${selected}`, 'DELETE'); await refresh(); setMessage('Your published page is offline.'); });
  }
  const chosen = projects.find((p) => p.id === selected);
  return <section className={styles.panel} aria-labelledby="cloud-title">
    <div className={styles.heading}><div><p className={styles.kicker}>YOUR ACCOUNT</p><h2 id="cloud-title">Cloud projects</h2><p>Save when you choose. Your editor remains available on this device.</p></div><span className={session?.authenticated ? styles.pill : styles.pillQuiet}>{session?.authenticated ? 'Signed in' : 'Optional'}</span></div>
    {!session?.configured ? <div className={styles.notice} role="status">Cloud accounts are being connected. Continue building here; your draft is stored in this browser.</div> : session.authenticated ? <>
      <div className={styles.account}><span>{session.email}</span><button type="button" className={styles.textButton} disabled={busy} onClick={() => void act(async () => { await request('logout', 'POST', {}); setSelected(''); await refresh(); setMessage('Signed out on this device.'); })}>Sign out</button></div>
      <label className={styles.field}>Project<select value={selected} onChange={(e) => setSelected(e.target.value)}><option value="">Create a new cloud project</option>{projects.map((p) => <option key={p.id} value={p.id}>{p.title}{p.publication?.active ? ' · published' : ''}</option>)}</select></label>
      <div className={styles.actions}><button type="button" className={styles.secondary} disabled={busy || !selected} onClick={() => void load()}>Load selected</button><button type="button" className={styles.primary} disabled={busy} onClick={() => void save()}>{selected ? 'Save to cloud' : 'Create cloud project'}</button></div>
      {conflict && <div className={styles.notice} role="alert"><strong>Cloud version changed.</strong><span>Your local draft was not overwritten.</span><div className={styles.actions}><button type="button" className={styles.secondary} onClick={() => { setConflict(null); void load(); }}>Keep cloud</button><button type="button" className={styles.primary} onClick={() => { setConflict(null); void request(`projects/${conflict.id}`).then((p) => request(`projects/${conflict.id}`, 'PUT', { draft: conflict.local, expectedUpdatedAt: p.project.updated_at })).then(() => refresh()).catch((e) => setMessage(e instanceof Error ? e.message : 'Could not keep this draft.')); }}>Keep device</button></div></div>}
      {chosen?.publication?.active && <div className={styles.published}><a href={`/p/${chosen.publication.slug}`} target="_blank" rel="noreferrer">Open published page</a><button type="button" className={styles.textButton} disabled={busy} onClick={() => void unpublish()}>Unpublish</button></div>}
      {!chosen?.publication?.active && <button type="button" className={styles.textButton} disabled={busy || !selected} onClick={() => void publish()}>Publish saved project</button>}
      {savedAt && <small>Last saved {new Date(savedAt).toLocaleString()}</small>}
    </> : <>
      <form className={styles.form} onSubmit={(e) => { e.preventDefault(); void authAction(); }}>
        <label className={styles.field}>Email<input type="email" autoComplete="email" maxLength={254} value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
        <label className={styles.field}>Password<input type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} minLength={12} maxLength={128} value={password} onChange={(e) => setPassword(e.target.value)} required /><small>Use at least 12 characters.</small></label>
        <div className={styles.actions}><button className={styles.primary} disabled={busy}>{mode === 'login' ? 'Sign in' : 'Create account'}</button><button type="button" className={styles.textButton} onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}>{mode === 'login' ? 'Create an account' : 'I already have an account'}</button></div>
      </form>
    </>}
    {message && <p className={styles.message} role="status">{message}</p>}
    <small className={styles.footnote}>Cloud saving is explicit. Publishing is a beta feature and appears only when enabled.</small>
  </section>;
}
