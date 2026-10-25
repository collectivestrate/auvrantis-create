'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { createDraft, personalizeDraft, templates, type Draft } from '@/lib/templates';
import { serializeSite, type SiteSection } from '@/lib/site-document';

const STORAGE_KEY = 'auvrantis-create:draft:v1';
const sectionNames: Record<string, string> = { hero: 'Hero', services: 'Services', about: 'About', gallery: 'Work & images', faq: 'FAQs', contact: 'Contact' };

function Footer({ compact = false }: { compact?: boolean }) {
  return <footer className="studio-footer"><strong>By Auvrantis Group</strong><span>{compact ? 'AUVRANTIS CREATE · WEBSITE BUILDER' : 'Auvrantis Create · Website Builder'}</span><span>Draft storage: this browser only</span></footer>;
}

function Wordmark() {
  return <Link className="wordmark" href="/">AUVRANTIS <span>CREATE</span><small>WEBSITE BUILDER</small></Link>;
}

export default function Studio() {
  const [draft, setDraft] = useState<Draft>(() => createDraft());
  const [ready, setReady] = useState(false);
  const [mode, setMode] = useState<'design' | 'questions' | 'edit'>('design');
  const [selectedTemplate, setSelectedTemplate] = useState('atelier');
  const [answers, setAnswers] = useState(createDraft().business);
  const [saveState, setSaveState] = useState<'saving' | 'saved'>('saved');
  const [error, setError] = useState('');
  const [selectedSection, setSelectedSection] = useState('hero');
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [history, setHistory] = useState<Draft[]>([]);
  const [future, setFuture] = useState<Draft[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Draft;
        if (parsed.version === 1 && parsed.site && Array.isArray(parsed.site.sections) && parsed.business) {
          setDraft(parsed);
          setSelectedTemplate(parsed.templateId);
          setAnswers(parsed.business);
          setMode('edit');
        }
      }
    } catch { setError('Your saved browser draft could not be read. You can start a fresh one.'); }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    setSaveState('saving');
    const timer = window.setTimeout(() => {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...draft, updatedAt: new Date().toISOString() }));
        setSaveState('saved');
      } catch { setSaveState('saved'); setError('This browser could not store the draft. Download an HTML copy to keep your work.'); }
    }, 350);
    return () => window.clearTimeout(timer);
  }, [draft, ready]);

  const commit = useCallback((next: Draft) => {
    setHistory((items) => [...items.slice(-49), draft]);
    setFuture([]);
    setDraft(next);
  }, [draft]);

  const undo = useCallback(() => {
    setHistory((items) => {
      if (!items.length) return items;
      const previous = items[items.length - 1];
      setFuture((redo) => [draft, ...redo]);
      setDraft(previous);
      return items.slice(0, -1);
    });
  }, [draft]);
  const redo = useCallback(() => {
    setFuture((items) => {
      if (!items.length) return items;
      const next = items[0];
      setHistory((past) => [...past, draft]);
      setDraft(next);
      return items.slice(1);
    });
  }, [draft]);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      const modifier = event.metaKey || event.ctrlKey;
      if (!modifier || event.key.toLowerCase() !== 'z') return;
      const target = event.target;
      if (target instanceof HTMLElement && (target.isContentEditable || ['INPUT', 'TEXTAREA'].includes(target.tagName))) return;
      event.preventDefault();
      if (event.shiftKey) redo(); else undo();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [undo, redo]);

  const beginQuestionnaire = () => { setDraft(createDraft(selectedTemplate)); setAnswers(createDraft(selectedTemplate).business); setError(''); setMode('questions'); };
  const finishQuestionnaire = () => {
    if (!answers.name.trim()) { setError('Add your business or project name to continue.'); return; }
    if (answers.email.trim() && !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(answers.email.trim())) { setError('Enter a valid email address, or leave the field blank.'); return; }
    const next = personalizeDraft(createDraft(selectedTemplate, answers.name), answers);
    setDraft(next); setSelectedSection('hero'); setHistory([]); setFuture([]); setMode('edit'); setError('');
  };
  const setAnswer = (key: keyof typeof answers, value: string) => setAnswers((current) => ({ ...current, [key]: value }));
  const updateSection = (id: string, changes: Partial<SiteSection>) => commit({ ...draft, site: { ...draft.site, sections: draft.site.sections.map((section) => section.id === id ? { ...section, ...changes } : section) } });
  const activeSection = draft.site.sections.find((section) => section.id === selectedSection) ?? draft.site.sections[0];
  const setTheme = (key: keyof Draft['site']['theme'], value: string) => commit({ ...draft, site: { ...draft.site, theme: { ...draft.site.theme, [key]: value } } });

  const moveSection = (index: number, delta: number) => {
    const target = index + delta;
    if (target < 0 || target >= draft.site.sections.length) return;
    const sections = [...draft.site.sections];
    [sections[index], sections[target]] = [sections[target], sections[index]];
    commit({ ...draft, site: { ...draft.site, sections } });
  };
  const exportHtml = () => {
    try {
      const html = serializeSite(draft.site);
      const file = new Blob([html], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(file);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `${(draft.business.name || 'my-website').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'my-website'}.html`;
      anchor.click();
      URL.revokeObjectURL(url);
      setError('');
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'This page could not be exported.'); }
  };
  const selectedTemplateData = useMemo(() => templates.find((item) => item.id === (mode === 'edit' ? draft.templateId : selectedTemplate)) ?? templates[0], [draft.templateId, mode, selectedTemplate]);

  if (!ready) return <main className="wizard-screen"><header className="wizard-nav"><Wordmark /><span className="local-badge"><i /> Draft storage: this browser only</span></header><div className="wizard-main"><p className="kicker">AUVRANTIS CREATE</p><h1>Let’s make<br />something good.</h1><p>Loading your local draft…</p></div><Footer /></main>;

  if (mode === 'design') return <main className="wizard-screen">
    <header className="wizard-nav"><Wordmark /><span className="local-badge"><i /> Draft storage: this browser only</span></header>
    <div className="wizard-main"><p className="wizard-progress">START HERE　/　01</p><h1>Pick your<br />starting point.</h1><p>Choose a design with a point of view. You can edit its words, colors, and sections later. Hand-built starting templates; no AI-generated copy.</p>
      <div className="template-choice-grid">{templates.map((template, index) => <button type="button" key={template.id} className="template-choice" aria-pressed={selectedTemplate === template.id} onClick={() => setSelectedTemplate(template.id)}><div className="choice-swatch" style={{ background: template.accent }}><span>{template.category.toUpperCase()}</span><strong>{['Make room for good work.','More outside. More often.','Make the next move count.','Feel more like yourself.','Good things grow here.','Shape a better space.'][index]}</strong><span>AUVRANTIS CREATE　/　0{index + 1}</span></div><div className="choice-details"><span>{template.category}</span><h2>{template.name}</h2><p>{template.note}</p></div></button>)}</div>
      {error && <p className="wizard-error" role="alert">{error}</p>}
      <div className="wizard-actions"><button className="button" type="button" onClick={beginQuestionnaire}>Continue with {selectedTemplateData.name} <span aria-hidden>↗</span></button><a className="back-link" href="/">Back to home</a></div>
    </div><Footer />
  </main>;

  if (mode === 'questions') return <main className="wizard-screen">
    <header className="wizard-nav"><Wordmark /><span className="local-badge"><i /> Draft storage: this browser only</span></header>
    <div className="wizard-main"><p className="wizard-progress">START HERE　/　02　·　{selectedTemplateData.name}</p><h1>Give it the<br />good details.</h1><p>This helps shape a useful first draft. Every line stays editable. We will never invent credentials, customer reviews, or promises for you.</p>
      <div className="questionnaire"><div><label className="field-label" htmlFor="biz-name">Business or project name *</label><input id="biz-name" autoFocus value={answers.name} onChange={(e) => setAnswer('name', e.target.value)} placeholder="e.g. Northstar Ceramics" /></div><div><label className="field-label" htmlFor="biz-service">What do you do?</label><input id="biz-service" value={answers.service} onChange={(e) => setAnswer('service', e.target.value)} placeholder="e.g. Handmade ceramic tableware" /></div><div><label className="field-label" htmlFor="biz-audience">Who do you help?</label><input id="biz-audience" value={answers.audience} onChange={(e) => setAnswer('audience', e.target.value)} placeholder="e.g. People who love to host" /></div><div><label className="field-label" htmlFor="biz-location">Where are you based?</label><input id="biz-location" value={answers.location} onChange={(e) => setAnswer('location', e.target.value)} placeholder="e.g. Chicago, IL" /></div><div><label className="field-label" htmlFor="biz-email">Contact email (optional)</label><input id="biz-email" type="email" value={answers.email} onChange={(e) => setAnswer('email', e.target.value)} placeholder="hello@example.com" /></div><div><label className="field-label" htmlFor="biz-tone">How should it sound?</label><select id="biz-tone" value={answers.tone} onChange={(e) => setAnswer('tone', e.target.value)}><option>Warm and direct</option><option>Playful and bright</option><option>Calm and considered</option><option>Clear and expert</option></select></div></div>
      {error && <p className="wizard-error" role="alert">{error}</p>}
      <div className="wizard-actions"><button className="button" type="button" onClick={finishQuestionnaire}>Build my first draft <span aria-hidden>↗</span></button><button className="back-link" type="button" onClick={() => setMode('design')}>Back to designs</button></div>
    </div><Footer />
  </main>;

  return <main className="studio-shell">
    <header className="studio-topbar"><div className="studio-brand"><Wordmark /><span className="crumb">EDITOR / {draft.business.name.toUpperCase()}</span></div><div className="studio-tools"><span className="draft-state">{saveState === 'saved' ? 'Saved locally' : 'Saving…'}</span><button className="tool-button" type="button" onClick={undo} disabled={!history.length} aria-label="Undo change">↶ Undo</button><button className="tool-button" type="button" onClick={redo} disabled={!future.length} aria-label="Redo change">↷ Redo</button><button className="tool-button" type="button" onClick={() => setMode('design')}>Design</button><button className="tool-button primary" type="button" onClick={exportHtml}>Export HTML ↗</button></div></header>
    <div className="studio-layout">
      <aside className="editor-panel" aria-label="Website editor"><div className="editor-header"><div><small>YOUR WEBSITE</small><h1>Make it yours.</h1></div><button className="icon-button" type="button" title="Change template" onClick={() => setMode('design')}>◫</button></div><div className="local-badge"><i /> Browser-local draft</div>
        <label className="panel-label" htmlFor="site-title">Website name</label><input id="site-title" value={draft.site.title} onChange={(e) => commit({ ...draft, site: { ...draft.site, title: e.target.value } })} />
        <span className="panel-label">Page sections <span>· reorder or hide</span></span>
        <div className="section-list">{draft.site.sections.map((section, index) => <div className={`section-row ${selectedSection === section.id ? 'selected' : ''}`} key={section.id}><button type="button" className="visibility-toggle" aria-label={`${section.visible ? 'Hide' : 'Show'} ${sectionNames[section.type]}`} aria-pressed={section.visible} onClick={() => updateSection(section.id, { visible: !section.visible })}>{section.visible ? '◉' : '○'}</button><button type="button" className="section-row-title" onClick={() => setSelectedSection(section.id)}><small>{sectionNames[section.type]}</small>{section.title || 'Untitled section'}</button><span className="row-actions"><button type="button" onClick={() => moveSection(index, -1)} disabled={index === 0} aria-label={`Move ${sectionNames[section.type]} up`}>↑</button><button type="button" onClick={() => moveSection(index, 1)} disabled={index === draft.site.sections.length - 1} aria-label={`Move ${sectionNames[section.type]} down`}>↓</button></span></div>)}</div>
        {activeSection && <><span className="panel-label">Edit {sectionNames[activeSection.type]}</span><label className="field-label" htmlFor="section-heading">Heading</label><input id="section-heading" value={activeSection.title} onChange={(e) => updateSection(activeSection.id, { title: e.target.value })} /><label className="field-label" htmlFor="section-copy">Text</label><textarea id="section-copy" value={activeSection.body} onChange={(e) => updateSection(activeSection.id, { body: e.target.value })} />{activeSection.type === 'gallery' && <><label className="field-label" htmlFor="gallery-url">Image URL (optional)</label><input id="gallery-url" type="url" placeholder="https://example.com/image.jpg" value={activeSection.imageUrl ?? ''} onChange={(e) => updateSection(activeSection.id, { imageUrl: e.target.value })} /></>}</>}
        <span className="panel-label">Color palette</span><div className="theme-row">{(['ink', 'paper', 'accent'] as const).map((color) => <label className="color-picker" key={color}>{color}<input aria-label={`${color} color`} type="color" value={draft.site.theme[color]} onChange={(e) => setTheme(color, e.target.value)} /></label>)}</div>
        <span className="panel-label">Your starting design</span><button className="template-chip" type="button" onClick={() => setMode('design')}>{selectedTemplateData.stamp} / {selectedTemplateData.name}　↗</button>
        {error && <p className="wizard-error" role="alert">{error}</p>}
      </aside>
      <section className="preview-area" aria-label="Website preview"><div className="preview-toolbar"><span>Live preview <small>· unsaved changes update as you edit</small></span><div className="toggle-group" aria-label="Preview size"><button type="button" className={device === 'desktop' ? 'active' : ''} aria-pressed={device === 'desktop'} onClick={() => setDevice('desktop')}>Desktop</button><button type="button" className={device === 'mobile' ? 'active' : ''} aria-pressed={device === 'mobile'} onClick={() => setDevice('mobile')}>Mobile</button></div></div><SitePreview draft={draft} device={device} onNavigate={() => setMenuOpen((open) => !open)} menuOpen={menuOpen} /></section>
    </div>
    <Footer compact />
  </main>;
}

function SitePreview({ draft, device, onNavigate, menuOpen }: { draft: Draft; device: 'desktop' | 'mobile'; onNavigate: () => void; menuOpen: boolean }) {
  const visible = draft.site.sections.filter((section) => section.visible);
  const hero = visible.find((section) => section.type === 'hero');
  const rest = visible.filter((section) => section.type !== 'hero');
  const displayName = draft.business.name || draft.site.title || 'Your studio';
  return <div className="preview-stage"><div className={`site-preview ${device} template-${templates.some((template) => template.id === draft.templateId) ? draft.templateId : 'atelier'}`} style={{ '--preview-ink': draft.site.theme.ink, '--preview-paper': draft.site.theme.paper, '--preview-accent': draft.site.theme.accent } as React.CSSProperties}>
    <div className="site-preview-top"><b>{draft.site.title || displayName}</b><button type="button" aria-expanded={menuOpen} onClick={onNavigate} style={{ border: 0, background: 'transparent', font: 'inherit', cursor: 'pointer' }}>{menuOpen ? 'CLOSE ×' : 'MENU　↗'}</button></div>{menuOpen && <div className="preview-nav-menu">{rest.map((section) => <a key={section.id} href={`#preview-${section.id}`}>{sectionNames[section.type]}　↗</a>)}</div>}
    {hero && <section className="site-preview-hero"><div><span className="preview-label">{draft.business.service || 'INDEPENDENT WORK, MADE WITH CARE'}</span><h1>{hero.title}</h1><p>{hero.body}</p><span className="preview-cta">{draft.business.email ? `CONTACT ${displayName.toUpperCase()}` : 'MADE WITH CARE'}</span></div><div className="preview-orb"><span>{draft.templateId === 'fieldwork' ? '↗' : draft.templateId === 'goodday' ? '☼' : '✳'}</span></div></section>}
    {rest.map((section) => <section id={`preview-${section.id}`} className={`site-preview-section ${section.type === 'services' ? 'accent-section' : ''} ${section.type === 'gallery' ? 'image-section' : ''}`} key={section.id}><div><span className="preview-label">{sectionNames[section.type]}</span><h2>{section.title}</h2><p>{section.body}</p></div>{section.type === 'gallery' && <GalleryImage url={section.imageUrl} />}</section>)}
    <footer className="site-preview-foot">{displayName}{draft.site.contactEmail && <a style={{ float: 'right' }} href={`mailto:${draft.site.contactEmail}`}>{draft.site.contactEmail}</a>}</footer>
  </div></div>;
}

function GalleryImage({ url }: { url?: string }) {
  const value = (url ?? '').trim();
  let safe: string | null = null;
  try {
    const parsed = new URL(value);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') safe = parsed.href;
  } catch { /* the editor keeps an empty placeholder for invalid URLs */ }
  return safe ? <img className="mini-image" src={safe} alt="" /> : <div className="mini-image">✳</div>;
}
