'use client';

import Link from 'next/link';
import CloudPanel from './cloud-panel';
import { trackCreateAction } from './product-analytics';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createDraft, personalizeDraft, switchDraftTemplate, templates, type Draft } from '@/lib/templates';
import { contrastTextColor, serializeSite, type SiteSection } from '@/lib/site-document';
import { restoreDraft } from '@/lib/draft-storage';
import { assessReadiness } from '@/lib/readiness';
import { cloneProject, createProject, createSectionInstance, deleteSection, duplicateSection, parseProjectBackup, restoreProjectLibrary, serializeProjectBackup, serializeProjectLibrary, type LocalProject } from '@/lib/project-library';
import { createLaunchProject } from '@/lib/launch-loop/create-project';

const STORAGE_KEY = 'auvrantis-create:projects:v2';
const LEGACY_STORAGE_KEY = 'auvrantis-create:draft:v1';
const sectionNames: Record<string, string> = { hero: 'Hero', services: 'Services', about: 'About', gallery: 'Work & images', faq: 'FAQs', contact: 'Contact', testimonials: 'Customer stories' };

function Footer({ compact = false }: { compact?: boolean }) {
  return <footer className="studio-footer"><strong>By Auvrantis Group</strong><span>{compact ? 'AUVRANTIS CREATE · WEBSITE BUILDER' : 'Auvrantis Create · Website Builder'}</span><span>Draft storage: this browser only</span><Link href="/privacy">Privacy</Link></footer>;
}

function Wordmark() {
  return <Link className="wordmark" href="/">AUVRANTIS <span>CREATE</span><small>WEBSITE BUILDER</small></Link>;
}

export default function Studio() {
  const [draft, setDraft] = useState<Draft>(() => createDraft());
  const [ready, setReady] = useState(false);
  const [mode, setMode] = useState<'library' | 'design' | 'questions' | 'edit'>('library');
  const [projects, setProjects] = useState<LocalProject[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [libraryNotice, setLibraryNotice] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('atelier');
  const [answers, setAnswers] = useState(createDraft().business);
  const [saveState, setSaveState] = useState<'saving' | 'saved' | 'error'>('saved');
  const [error, setError] = useState('');
  const [isChangingTemplate, setIsChangingTemplate] = useState(false);
  const [selectedSection, setSelectedSection] = useState('hero');
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [history, setHistory] = useState<Draft[]>([]);
  const [future, setFuture] = useState<Draft[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [metadataOpen, setMetadataOpen] = useState(false);
  const [launchUrl, setLaunchUrl] = useState('');
  const importInput = useRef<HTMLInputElement>(null);
  const readiness = useMemo(() => assessReadiness(draft), [draft]);

  useEffect(() => {
    try {
      const restored = restoreProjectLibrary(window.localStorage.getItem(STORAGE_KEY), window.localStorage.getItem(LEGACY_STORAGE_KEY));
      setProjects(restored.projects);
      if (restored.migratedLegacy) setLibraryNotice('Your previous website draft is now in this library. Its content has been kept.');
      if (restored.recovered) setError('A saved project library could not be read. Your old browser draft, if present, was preserved.');
    } catch { setSaveState('error'); setError('This browser could not read saved projects. You can still create a website and export a backup.'); }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    setSaveState('saving');
    const timer = window.setTimeout(() => {
      try {
        window.localStorage.setItem(STORAGE_KEY, serializeProjectLibrary(projects));
        setSaveState('saved');
        setError((current) => current === 'Could not save on this device; export a backup.' ? '' : current);
      } catch { setSaveState('error'); setError('Could not save on this device; export a backup.'); }
    }, 350);
    return () => window.clearTimeout(timer);
  }, [projects, ready]);

  const commit = useCallback((next: Draft) => {
    setHistory((items) => [...items.slice(-49), draft]);
    setFuture([]);
    setDraft(next);
    if (activeProjectId) setProjects((items) => items.map((project) => project.id === activeProjectId ? { ...project, updatedAt: new Date().toISOString(), draft: next } : project));
  }, [activeProjectId, draft]);

  const undo = useCallback(() => {
    setHistory((items) => {
      if (!items.length) return items;
      const previous = items[items.length - 1];
      setFuture((redo) => [draft, ...redo]);
      setDraft(previous);
      if (activeProjectId) setProjects((projects) => projects.map((project) => project.id === activeProjectId ? { ...project, draft: previous, updatedAt: new Date().toISOString() } : project));
      return items.slice(0, -1);
    });
  }, [activeProjectId, draft]);
  const redo = useCallback(() => {
    setFuture((items) => {
      if (!items.length) return items;
      const next = items[0];
      setHistory((past) => [...past, draft]);
      setDraft(next);
      if (activeProjectId) setProjects((projects) => projects.map((project) => project.id === activeProjectId ? { ...project, draft: next, updatedAt: new Date().toISOString() } : project));
      return items.slice(1);
    });
  }, [activeProjectId, draft]);

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

  const beginQuestionnaire = () => { const fresh = createDraft(selectedTemplate); setDraft(fresh); setActiveProjectId(null); setAnswers({ ...fresh.business, name: '', service: '', audience: '', location: '', email: '' }); setError(''); setMode('questions'); };
  const beginTemplateChange = () => { setSelectedTemplate(draft.templateId); setIsChangingTemplate(true); setMode('design'); setError(''); };
  const applyTemplateChange = () => { trackCreateAction('template_changed'); commit(switchDraftTemplate(draft, selectedTemplate)); setIsChangingTemplate(false); setMode('edit'); setError(''); };
  const finishQuestionnaire = () => {
    if (!answers.name.trim()) { setError('Add your business or project name to continue.'); return; }
    if (answers.email.trim() && !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(answers.email.trim())) { setError('Enter a valid email address, or leave the field blank.'); return; }
    const next = personalizeDraft(createDraft(selectedTemplate, answers.name), answers);
    const project = createProject(next);
    trackCreateAction('project_created');
    setDraft(next); setProjects((items) => [project, ...items]); setActiveProjectId(project.id); setSelectedSection('hero'); setHistory([]); setFuture([]); setMode('edit'); setError('');
  };
  const openProject = (project: LocalProject) => { setDraft(project.draft); setActiveProjectId(project.id); setSelectedTemplate(project.draft.templateId); setAnswers(project.draft.business); setHistory([]); setFuture([]); setSelectedSection(project.draft.site.sections[0]?.id ?? ''); setMode('edit'); setError(''); };
  const renameProject = (project: LocalProject) => { const name = window.prompt('Name this website', project.name); if (name === null || !name.trim()) return; setProjects((items) => items.map((item) => item.id === project.id ? { ...item, name: name.trim().slice(0, 120), updatedAt: new Date().toISOString() } : item)); };
  const duplicateProject = (project: LocalProject) => { const copy = cloneProject(project); setProjects((items) => [copy, ...items]); setLibraryNotice(`“${copy.name}” was duplicated.`); };
  const removeProject = (project: LocalProject) => { if (!window.confirm(`Delete “${project.name}” from this browser? This cannot be undone.`)) return; setProjects((items) => items.filter((item) => item.id !== project.id)); if (activeProjectId === project.id) { setActiveProjectId(null); setMode('library'); } };
  const download = (name: string, content: string, type: string) => { const blob = new Blob([content], { type }); const url = URL.createObjectURL(blob); const anchor = document.createElement('a'); anchor.href = url; anchor.download = name; anchor.click(); URL.revokeObjectURL(url); };
  const exportBackup = () => { if (!activeProjectId) return; const project = projects.find((item) => item.id === activeProjectId); if (!project) return; download(`${project.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'website'}-backup.json`, serializeProjectBackup({ ...project, draft }), 'application/json'); trackCreateAction('backup_exported'); };
  const importBackup = async (file?: File) => { if (!file) return; try { if (file.size > 1_000_000) throw new Error('Backup exceeds the 1 MB import limit.'); const parsed = parseProjectBackup(await file.text()); const project = createProject(parsed.draft); project.name = parsed.name; setProjects((items) => [project, ...items]); setLibraryNotice(`“${project.name}” was imported as a new project.`); setError(''); } catch (cause) { setError(cause instanceof Error ? cause.message : 'This backup could not be imported.'); } finally { if (importInput.current) importInput.current.value = ''; } };
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
      trackCreateAction('html_exported');
      URL.revokeObjectURL(url);
      setError('');
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'This page could not be exported.'); }
  };
  const exportShareCard = () => {
    const canvas = document.createElement('canvas'); canvas.width = 1200; canvas.height = 630;
    const context = canvas.getContext('2d'); if (!context) { setError('Your browser could not create a share image.'); return; }
    context.fillStyle = draft.site.theme.paper; context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = draft.site.theme.accent; context.fillRect(800, 0, 400, 630);
    context.fillStyle = draft.site.theme.ink; context.font = '800 28px Arial'; context.fillText('AUVRANTIS CREATE', 72, 86);
    context.font = '800 68px Arial'; context.textBaseline = 'top';
    const words = (draft.site.sections.find((section) => section.type === 'hero')?.title || draft.site.title || 'A website in progress').split(/\s+/);
    let line = '', y = 190; for (const word of words) { const test = line ? `${line} ${word}` : word; if (context.measureText(test).width > 650 && line) { context.fillText(line, 72, y); y += 82; line = word; } else line = test; }
    context.fillText(line, 72, y); context.font = '400 28px Arial'; context.fillText(draft.business.name || draft.site.title || 'Your website draft', 72, Math.min(550, y + 100));
    context.fillStyle = draft.site.theme.ink; context.font = '800 70px Arial'; context.fillText('✳', 930, 265); context.font = '800 26px Arial'; context.fillText('A FIRST LOOK', 872, 365); context.font = '400 22px Arial'; context.fillText('Website draft · not yet hosted', 825, 410);
    canvas.toBlob((blob) => { if (blob) { const url = URL.createObjectURL(blob); const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'auvrantis-create-share.png'; anchor.click(); URL.revokeObjectURL(url); } }, 'image/png');
  };
  const copyLaunchCopy = async () => {
    const name = draft.business.name || draft.site.title || 'my website'; const hero = draft.site.sections.find((section) => section.type === 'hero');
    const copy = `I’m building a new website for ${name}. ${hero?.body || 'More details coming soon.'}\n\nWebsite draft made with Auvrantis Create. I’ll share the link when it’s hosted.`;
    try { await navigator.clipboard.writeText(copy); setLibraryNotice('Launch copy copied. Add your hosted website link when it is ready.'); } catch { setError('Clipboard access is unavailable. Select and copy your launch copy from the toolkit.'); }
  };
  const focusReadiness = (focus: string) => {
    if (focus === 'metadata-title' || focus === 'metadata-description') { setMetadataOpen(true); window.setTimeout(() => document.getElementById(focus === 'metadata-title' ? 'site-title' : 'site-description')?.focus(), 0); }
    else { const section = draft.site.sections.find((item) => item.type === focus); if (section) { setSelectedSection(section.id); document.getElementById('section-heading')?.focus(); } else setError(`Add a ${focus} section to address this item.`); }
  };
  const checkBase = process.env.NEXT_PUBLIC_AUVRANTIS_CHECK_URL;
  const checkUrl = () => {
    const value = launchUrl.trim();
    if (!value) { setError('Paste the public URL for your hosted website first.'); return; }
    try { const parsed = new URL(value); if (!['https:', 'http:'].includes(parsed.protocol) || parsed.username || parsed.password) throw new Error(); if (!checkBase) throw new Error('The Auvrantis Check connection is not configured yet.'); const base = new URL(checkBase); if (!['https:', 'http:'].includes(base.protocol)) throw new Error(); window.open(`${base.origin}/dashboard?url=${encodeURIComponent(parsed.href)}`, '_blank', 'noopener,noreferrer'); setError(''); }
    catch (cause) { setError(cause instanceof Error && cause.message.includes('not configured') ? cause.message : 'Enter a complete public website URL starting with https:// or http://.'); }
  };
  const selectedTemplateData = useMemo(() => templates.find((item) => item.id === (mode === 'edit' ? draft.templateId : selectedTemplate)) ?? templates[0], [draft.templateId, mode, selectedTemplate]);
  const launchBlueprint = useMemo(() => createLaunchProject(answers, selectedTemplate), [answers, selectedTemplate]);

  if (!ready) return <main className="wizard-screen"><header className="wizard-nav"><Wordmark /><span className="local-badge"><i /> Draft storage: this browser only</span></header><div className="wizard-main"><p className="kicker">AUVRANTIS CREATE</p><h1>Let’s make<br />something good.</h1><p>Loading your local draft…</p></div><Footer /></main>;

  if (mode === 'library') return <main className="wizard-screen library-screen">
    <header className="wizard-nav"><Wordmark /><span className="local-badge"><i /> Your projects stay in this browser</span></header>
    <div className="library-main"><p className="wizard-progress">AUVRANTIS CREATE　/　YOUR WORKSPACE</p><h1>Your ideas,<br />in good shape.</h1><p>Make a website, keep the editable draft on this device, and export a portable copy whenever you need it.</p>
      <div className="library-actions"><button className="button" type="button" onClick={() => { setIsChangingTemplate(false); setSelectedTemplate('atelier'); setMode('design'); setError(''); }}>＋ Start a website</button><button className="outline-button" type="button" onClick={() => importInput.current?.click()}>Import backup</button><input ref={importInput} className="visually-hidden" type="file" accept="application/json,.json" onChange={(event) => void importBackup(event.target.files?.[0])} /></div>
      {libraryNotice && <p className="library-notice" role="status">{libraryNotice}</p>}{error && <p className="wizard-error" role="alert">{error}</p>}
      <div className="project-library-heading"><h2>Your websites <span>{projects.length.toString().padStart(2, '0')}</span></h2><small>LOCAL DRAFTS · THIS DEVICE ONLY</small></div>
      {projects.length ? <div className="project-grid">{projects.map((project) => <article className="project-card" key={project.id}><div className="project-card-top" style={{ background: project.draft.site.theme.accent }}><span>{templates.find((item) => item.id === project.draft.templateId)?.name ?? 'Website'}</span><b>{project.draft.site.sections.filter((section) => section.visible).length} visible sections</b></div><div className="project-card-body"><small>WEBSITE PROJECT</small><h3>{project.name}</h3><p>{project.draft.site.description || 'Add a search description in the editor.'}</p><div className="project-card-actions"><button className="button small" type="button" onClick={() => openProject(project)}>Open editor ↗</button><details className="project-menu"><summary aria-label={`Actions for ${project.name}`}>•••</summary><div><button type="button" onClick={() => renameProject(project)}>Rename</button><button type="button" onClick={() => duplicateProject(project)}>Duplicate</button><button type="button" onClick={() => removeProject(project)}>Delete…</button></div></details></div><span className="project-updated">Updated {new Date(project.updatedAt).toLocaleDateString()}</span></div></article>)}</div> : <div className="empty-library"><span>✳</span><h2>Your first website starts here.</h2><p>Pick a design and tell us a little about your work. You can edit every section before exporting.</p></div>}
      <div className="availability-note"><strong>Cloud sync and hosted publishing are not connected yet.</strong><span>These projects are stored in this browser. Export an HTML website or JSON backup to keep a copy.</span></div>
    </div><Footer />
  </main>;

  if (mode === 'design') return <main className="wizard-screen">
    <header className="wizard-nav"><Wordmark /><span className="local-badge"><i /> Draft storage: this browser only</span></header>
    <div className="wizard-main"><p className="wizard-progress">{isChangingTemplate ? 'CHANGE DESIGN' : 'START HERE　/　01'}</p><h1>{isChangingTemplate ? <>A new look.<br />Your words stay.</> : <>Pick your<br />starting point.</>}</h1><p>{isChangingTemplate ? 'Your section order, copy, and business details stay as they are. The new design updates the layout and accent color.' : 'Choose a design with a point of view. You can edit its words, colors, and sections later. Hand-built starting templates; no AI-generated copy.'}</p>
      <div className="template-choice-grid">{templates.map((template, index) => <button type="button" key={template.id} className="template-choice" aria-pressed={selectedTemplate === template.id} onClick={() => setSelectedTemplate(template.id)}><div className="choice-swatch" style={{ background: template.accent }}><span>{template.category.toUpperCase()}</span><strong>{['Make room for good work.','More outside. More often.','Make the next move count.','Feel more like yourself.','Good things grow here.','Shape a better space.'][index]}</strong><span>AUVRANTIS CREATE　/　0{index + 1}</span></div><div className="choice-details"><span>{template.category}</span><h2>{template.name}</h2><p>{template.note}</p></div></button>)}</div>
      {error && <p className="wizard-error" role="alert">{error}</p>}
      <div className="wizard-actions"><button className="button" type="button" onClick={isChangingTemplate ? applyTemplateChange : beginQuestionnaire}>{isChangingTemplate ? `Keep my content & apply ${selectedTemplateData.name}` : `Continue with ${selectedTemplateData.name}`} <span aria-hidden>↗</span></button>{isChangingTemplate ? <button className="back-link" type="button" onClick={() => { setIsChangingTemplate(false); setMode('edit'); }}>Back to editor</button> : <a className="back-link" href="/">Back to home</a>}</div>
    </div><Footer />
  </main>;

  if (mode === 'questions') return <main className="wizard-screen">
    <header className="wizard-nav"><Wordmark /><span className="local-badge"><i /> Draft storage: this browser only</span></header>
    <div className="wizard-main"><p className="wizard-progress">START HERE　/　02　·　{selectedTemplateData.name}</p><h1>Give it the<br />good details.</h1><p>This helps shape a useful first draft. Every line stays editable. We will never invent credentials, customer reviews, or promises for you.</p>
      <div className="questionnaire"><div><label className="field-label" htmlFor="biz-name">Business or project name *</label><input id="biz-name" autoFocus value={answers.name} onChange={(e) => setAnswer('name', e.target.value)} placeholder="e.g. Northstar Ceramics" /></div><div><label className="field-label" htmlFor="biz-service">What do you do?</label><input id="biz-service" value={answers.service} onChange={(e) => setAnswer('service', e.target.value)} placeholder="e.g. Handmade ceramic tableware" /></div><div><label className="field-label" htmlFor="biz-audience">Who do you help?</label><input id="biz-audience" value={answers.audience} onChange={(e) => setAnswer('audience', e.target.value)} placeholder="e.g. People who love to host" /></div><div><label className="field-label" htmlFor="biz-location">Where are you based?</label><input id="biz-location" value={answers.location} onChange={(e) => setAnswer('location', e.target.value)} placeholder="e.g. Chicago, IL" /></div><div><label className="field-label" htmlFor="biz-email">Contact email (optional)</label><input id="biz-email" type="email" value={answers.email} onChange={(e) => setAnswer('email', e.target.value)} placeholder="hello@example.com" /></div><div><label className="field-label" htmlFor="biz-tone">How should it sound?</label><select id="biz-tone" value={answers.tone} onChange={(e) => setAnswer('tone', e.target.value)}><option>Warm and direct</option><option>Playful and bright</option><option>Calm and considered</option><option>Clear and expert</option></select></div></div>
      <div className="blueprint-card"><span className="panel-label">Your launch blueprint</span><strong>{launchBlueprint.pages.length} page starter</strong><div>{launchBlueprint.pages.map((page) => <span key={page.id}>{page.title}</span>)}</div><small>We’ll build this structure first. Every page and section stays editable.</small></div>
      {error && <p className="wizard-error" role="alert">{error}</p>}
      <div className="wizard-actions"><button className="button" type="button" onClick={finishQuestionnaire}>Build my first draft <span aria-hidden>↗</span></button><button className="back-link" type="button" onClick={() => setMode('design')}>Back to designs</button></div>
    </div><Footer />
  </main>;

  return <main className="studio-shell">
    <header className="studio-topbar"><div className="studio-brand"><Wordmark /><span className="crumb">EDITOR / {(draft.business.name || 'YOUR WEBSITE').toUpperCase()}</span></div><div className="studio-tools"><span className="draft-state">{saveState === 'saved' ? 'Saved in this browser' : saveState === 'error' ? 'Local save unavailable' : 'Saving…'}</span><button className="tool-button" type="button" onClick={() => setMode('library')}>My websites</button><button className="tool-button" type="button" onClick={undo} disabled={!history.length} aria-label="Undo change">↶ Undo</button><button className="tool-button" type="button" onClick={redo} disabled={!future.length} aria-label="Redo change">↷ Redo</button><button className="tool-button" type="button" onClick={beginTemplateChange}>Design</button><button className="tool-button" type="button" onClick={exportBackup}>JSON backup</button><button className="tool-button primary" type="button" onClick={exportHtml}>Export website ↗</button></div></header>
    <div className="studio-layout">
      <aside className="editor-panel" aria-label="Website editor"><div className="editor-header"><div><small>YOUR WEBSITE</small><h1>Make it yours.</h1></div><button className="icon-button" type="button" title="Change template" onClick={beginTemplateChange}>◫</button></div><div className="local-badge"><i /> Browser-local draft</div>{saveState === 'error' && <p className="wizard-error" role="alert">{error || 'Could not save on this device; export a backup.'}</p>}{error && saveState !== 'error' && <p className="wizard-error" role="alert">{error}</p>}
        <label className="panel-label" htmlFor="site-title">Website name</label><input id="site-title" value={draft.site.title} onChange={(e) => commit({ ...draft, site: { ...draft.site, title: e.target.value } })} />
        <button className="disclosure-button" type="button" aria-expanded={metadataOpen} onClick={() => setMetadataOpen((open) => !open)}>Search details & contact <span>{metadataOpen ? '−' : '+'}</span></button>
        {metadataOpen && <div className="metadata-fields"><label className="field-label" htmlFor="site-description">Search description</label><textarea id="site-description" maxLength={320} value={draft.site.description} onChange={(e) => commit({ ...draft, site: { ...draft.site, description: e.target.value } })} placeholder="A short, accurate summary of this website." /><small>{draft.site.description.length}/320 characters</small><label className="field-label" htmlFor="contact-email">Contact email</label><input id="contact-email" type="email" value={draft.site.contactEmail ?? ''} onChange={(e) => commit({ ...draft, site: { ...draft.site, contactEmail: e.target.value }, business: { ...draft.business, email: e.target.value } })} placeholder="hello@example.com" /></div>}
        <span className="panel-label">Page sections <span>· reorder, add, or hide</span></span>
        <div className="section-list">{draft.site.sections.map((section, index) => <div className={`section-row ${selectedSection === section.id ? 'selected' : ''}`} key={section.id}><button type="button" className="visibility-toggle" aria-label={`${section.visible ? 'Hide' : 'Show'} ${sectionNames[section.type]}`} aria-pressed={section.visible} onClick={() => updateSection(section.id, { visible: !section.visible })}>{section.visible ? '◉' : '○'}</button><button type="button" className="section-row-title" onClick={() => setSelectedSection(section.id)}><small>{sectionNames[section.type]}</small>{section.title || 'Untitled section'}</button><span className="row-actions"><button type="button" onClick={() => moveSection(index, -1)} disabled={index === 0} aria-label={`Move ${sectionNames[section.type]} up`}>↑</button><button type="button" onClick={() => moveSection(index, 1)} disabled={index === draft.site.sections.length - 1} aria-label={`Move ${sectionNames[section.type]} down`}>↓</button></span></div>)}</div>
        <div className="add-section-row"><label className="visually-hidden" htmlFor="new-section-type">New section type</label><select id="new-section-type" value="" onChange={(e) => { const type = e.target.value; if (!type) return; const next = createSectionInstance(draft, type); commit(next); setSelectedSection(next.site.sections.at(-1)?.id ?? ''); e.target.value = ''; }}><option value="">＋ Add section…</option>{Object.entries(sectionNames).map(([type, label]) => <option key={type} value={type}>{label}</option>)}</select></div>
        {activeSection && <><span className="panel-label">Edit {sectionNames[activeSection.type]}</span><label className="field-label" htmlFor="section-heading">Heading</label><input id="section-heading" value={activeSection.title} onChange={(e) => updateSection(activeSection.id, { title: e.target.value })} /><label className="field-label" htmlFor="section-copy">Text</label><textarea id="section-copy" value={activeSection.body} onChange={(e) => updateSection(activeSection.id, { body: e.target.value })} />{activeSection.type === 'gallery' && <><label className="field-label" htmlFor="gallery-url">Image URL (optional)</label><input id="gallery-url" type="url" placeholder="https://example.com/image.jpg" value={activeSection.imageUrl ?? ''} onChange={(e) => updateSection(activeSection.id, { imageUrl: e.target.value })} /></>}<div className="section-edit-actions"><button className="outline-button small" type="button" onClick={() => { const oldIndex = draft.site.sections.findIndex((section) => section.id === activeSection.id); const next = duplicateSection(draft, activeSection.id); commit(next); setSelectedSection(next.site.sections[oldIndex + 1]?.id ?? ''); }}>Duplicate section</button><button className="text-danger" type="button" onClick={() => { if (!window.confirm(`Delete “${activeSection.title || sectionNames[activeSection.type]}”?`)) return; const next = deleteSection(draft, activeSection.id); commit(next); setSelectedSection(next.site.sections[0]?.id ?? ''); }}>Delete section…</button></div></>}
        <span className="panel-label">Color palette</span><div className="theme-row">{(['ink', 'paper', 'accent'] as const).map((color) => <label className="color-picker" key={color}>{color}<input aria-label={`${color} color`} type="color" value={draft.site.theme[color]} onChange={(e) => setTheme(color, e.target.value)} /></label>)}</div>
        <span className="panel-label">Your starting design</span><button className="template-chip" type="button" onClick={beginTemplateChange}>{selectedTemplateData.stamp} / {selectedTemplateData.name}　↗</button>
        <div className="readiness-card"><div><span className="panel-label">Before you share</span><b>{readiness.readyCount}/{readiness.checks.length} checks ready</b><small>{readiness.visibleSectionCount} visible of {readiness.totalSectionCount} sections</small></div>{readiness.checks.map((check) => <button key={check.id} type="button" className={`readiness-row ${check.ready ? 'ready' : ''}`} onClick={() => focusReadiness(check.focus)}><span>{check.ready ? '✓' : '○'}</span><span><b>{check.label}</b><small>{check.evidence}</small></span><i>Fix ↗</i></button>)}</div>
        <div className="launch-toolkit"><span className="panel-label">Share & improve</span><p>Make a share image or copy launch text. Your website stays a draft until you host it.</p><button className="outline-button" type="button" onClick={exportShareCard}>Download share image</button><button className="outline-button" type="button" onClick={() => void copyLaunchCopy()}>Copy launch copy</button><label className="field-label" htmlFor="hosted-site-url">Your hosted website URL</label><input id="hosted-site-url" type="url" placeholder="https://yourdomain.com" value={launchUrl} onChange={(e) => setLaunchUrl(e.target.value)} /><button className="button small" type="button" onClick={checkUrl} disabled={!checkBase}>Open in Auvrantis Check ↗</button>{!checkBase && <small>Auvrantis Check connection is not configured yet.</small>}</div>
      <CloudPanel draft={draft} onLoad={(loaded) => commit(loaded)} /></aside>
      <section className="preview-area" aria-label="Website preview"><div className="preview-toolbar"><span>Live preview <small>· unsaved changes update as you edit</small></span><div className="toggle-group" aria-label="Preview size"><button type="button" className={device === 'desktop' ? 'active' : ''} aria-pressed={device === 'desktop'} onClick={() => setDevice('desktop')}>Desktop</button><button type="button" className={device === 'mobile' ? 'active' : ''} aria-pressed={device === 'mobile'} onClick={() => setDevice('mobile')}>Mobile</button></div></div><SitePreview draft={draft} device={device} onNavigate={() => setMenuOpen((open) => !open)} menuOpen={menuOpen} /></section>
    </div>
    <Footer compact />
  </main>;
}

function SitePreview({ draft, device, onNavigate, menuOpen }: { draft: Draft; device: 'desktop' | 'mobile'; onNavigate: () => void; menuOpen: boolean }) {
  const visible = draft.site.sections.filter((section) => section.visible);
  const displayName = draft.business.name || draft.site.title || 'Your studio';
  return <div className="preview-stage"><div className={`site-preview ${device} template-${templates.some((template) => template.id === draft.templateId) ? draft.templateId : 'atelier'}`} style={{ '--preview-ink': draft.site.theme.ink, '--preview-paper': draft.site.theme.paper, '--preview-accent': draft.site.theme.accent, '--preview-accent-text': contrastTextColor(draft.site.theme.accent) } as React.CSSProperties}>
    <div className="site-preview-top"><b>{draft.site.title || displayName}</b><button type="button" aria-expanded={menuOpen} onClick={onNavigate} style={{ border: 0, background: 'transparent', font: 'inherit', cursor: 'pointer' }}>{menuOpen ? 'CLOSE ×' : 'MENU　↗'}</button></div>{menuOpen && <div className="preview-nav-menu">{visible.filter((section) => section.type !== 'hero').map((section) => <a key={section.id} href={`#preview-${section.id}`}>{sectionNames[section.type]}　↗</a>)}</div>}
    {visible.map((section) => section.type === 'hero'
      ? <section id={`preview-${section.id}`} className="site-preview-hero" key={section.id}><div><span className="preview-label">{draft.business.service || 'INDEPENDENT WORK, MADE WITH CARE'}</span><h1>{section.title}</h1><p>{section.body}</p><span className="preview-cta">{draft.business.email ? `CONTACT ${displayName.toUpperCase()}` : 'MADE WITH CARE'}</span></div><div className="preview-orb"><span>{draft.templateId === 'fieldwork' ? '↗' : draft.templateId === 'goodday' ? '☼' : '✳'}</span></div></section>
      : <section id={`preview-${section.id}`} className={`site-preview-section ${section.type === 'services' ? 'accent-section' : ''} ${section.type === 'gallery' ? 'image-section' : ''}`} key={section.id}><div><span className="preview-label">{sectionNames[section.type]}</span><h2>{section.title}</h2><p>{section.body}</p></div>{section.type === 'gallery' && <GalleryImage url={section.imageUrl} />}{section.type === 'contact' && draft.site.contactEmail && <a className="preview-cta" href={`mailto:${draft.site.contactEmail}`}>Email {draft.site.contactEmail}</a>}</section>)}
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
