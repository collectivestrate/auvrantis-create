import { restoreDraft } from './draft-storage';
import { createDraft, type Draft } from './templates';
import type { SiteSection } from './site-document';

export type LocalProject = { id: string; name: string; createdAt: string; updatedAt: string; draft: Draft };
export type LibraryRestore = { projects: LocalProject[]; migratedLegacy: boolean; recovered: boolean };
const FORMAT = 'auvrantis-create-project';
const MAX_BYTES = 1_000_000;
const TYPES = ['hero', 'services', 'about', 'gallery', 'faq', 'contact', 'testimonials', 'pricing', 'team', 'hours', 'booking', 'cta', 'footer'];

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function exactKeys(value: Record<string, unknown>, allowed: string[]) {
  return Object.keys(value).every((key) => allowed.includes(key));
}
function newId() {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `project-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
function validDraftShape(draft: unknown): draft is Draft {
  if (!record(draft) || !exactKeys(draft, ['version', 'updatedAt', 'templateId', 'business', 'site'])) return false;
  if (!record(draft.business) || !exactKeys(draft.business, ['name', 'service', 'audience', 'location', 'email', 'tone'])) return false;
  if (!record(draft.site) || !exactKeys(draft.site, ['title', 'description', 'templateId', 'contactEmail', 'theme', 'sections'])) return false;
  if (!record(draft.site.theme) || !exactKeys(draft.site.theme, ['ink', 'paper', 'accent']) || !Array.isArray(draft.site.sections)) return false;
  const sectionKeys = ['id', 'type', 'visible', 'title', 'body', 'imageUrl'];
  return draft.site.sections.every((section) => record(section) && exactKeys(section, sectionKeys) &&
    typeof section.id === 'string' && typeof section.type === 'string' && TYPES.includes(section.type) &&
    typeof section.visible === 'boolean' && typeof section.title === 'string' && typeof section.body === 'string' &&
    (section.imageUrl === undefined || typeof section.imageUrl === 'string'));
}
function validProject(value: unknown): value is LocalProject {
  if (!record(value) || !exactKeys(value, ['id', 'name', 'createdAt', 'updatedAt', 'draft'])) return false;
  return typeof value.id === 'string' && /^[a-zA-Z0-9_-]{1,80}$/.test(value.id) && typeof value.name === 'string' && !!value.name.trim() && value.name.length <= 120 &&
    typeof value.createdAt === 'string' && value.createdAt.length <= 64 && Number.isFinite(Date.parse(value.createdAt)) && typeof value.updatedAt === 'string' && value.updatedAt.length <= 64 && Number.isFinite(Date.parse(value.updatedAt)) && validDraftShape(value.draft);
}
function canonicalProject(project: LocalProject): LocalProject {
  const restored = restoreDraft(JSON.stringify(project.draft));
  if (!restored.draft || restored.recovered) throw new Error('Project draft is invalid.');
  return { id: project.id, name: project.name, createdAt: project.createdAt, updatedAt: project.updatedAt, draft: restored.draft };
}

export function restoreProjectLibrary(raw: string | null, legacyRaw: string | null): LibraryRestore {
  if (raw) {
    try {
      const parsed: unknown = JSON.parse(raw);
      if (record(parsed) && exactKeys(parsed, ['schemaVersion', 'projects']) && parsed.schemaVersion === 2 && Array.isArray(parsed.projects) && parsed.projects.length <= 100 && parsed.projects.every(validProject) && new Set(parsed.projects.map(p => p.id)).size === parsed.projects.length) {
        return { projects: parsed.projects.map(canonicalProject), migratedLegacy: false, recovered: false };
      }
      return { ...restoreProjectLibrary(null, legacyRaw), recovered: true };
    } catch { return { ...restoreProjectLibrary(null, legacyRaw), recovered: true }; }
  }
  if (legacyRaw) {
    const restored = restoreDraft(legacyRaw);
    if (restored.draft && !restored.recovered) {
      const now = restored.draft.updatedAt || new Date().toISOString();
      return { projects: [{ id: 'migrated-v1-draft', name: restored.draft.business.name || restored.draft.site.title || 'My website', createdAt: now, updatedAt: now, draft: restored.draft }], migratedLegacy: true, recovered: false };
    }
    return { projects: [], migratedLegacy: false, recovered: true };
  }
  return { projects: [], migratedLegacy: false, recovered: false };
}

export function serializeProjectLibrary(projects: LocalProject[]) {
  return JSON.stringify({ schemaVersion: 2, projects: projects.map(canonicalProject) });
}
export function serializeProjectBackup(project: LocalProject) {
  return JSON.stringify({ format: FORMAT, schemaVersion: 1, name: project.name, draft: canonicalProject(project).draft }, null, 2);
}
export function parseProjectBackup(raw: string, maxBytes = MAX_BYTES): { name: string; draft: Draft } {
  if (new TextEncoder().encode(raw).byteLength > maxBytes) throw new Error('Backup exceeds the 1 MB import limit.');
  let parsed: unknown;
  try { parsed = JSON.parse(raw); } catch { throw new Error('This file is not valid JSON.'); }
  if (!record(parsed) || !exactKeys(parsed, ['format', 'schemaVersion', 'name', 'draft'])) throw new Error('Backup contains unsupported fields.');
  if (parsed.format !== FORMAT || parsed.schemaVersion !== 1 || typeof parsed.name !== 'string' || !parsed.name.trim() || !validDraftShape(parsed.draft)) throw new Error('This is not a valid Auvrantis Create project backup.');
  const restored = restoreDraft(JSON.stringify(parsed.draft));
  if (!restored.draft || restored.recovered) throw new Error('Project content failed schema validation.');
  return { name: parsed.name.trim().slice(0, 120), draft: restored.draft };
}

function emptySection(type: string, id: string): SiteSection {
  const labels: Record<string, [string, string]> = {
    hero: ['Your headline', 'Add a short introduction in your own words.'],
    services: ['What you offer', 'Describe your services and what customers can expect.'],
    about: ['A little about you', 'Share the details that help people understand your work.'],
    gallery: ['Selected work', 'Add a short note about the work you want to show.'],
    faq: ['Frequently asked questions', 'Add a question and answer your customers often need.'],
    contact: ['Get in touch', 'Tell visitors how they can reach you.'],
    testimonials: ['Customer stories', 'Add a real customer quote only after you have permission to share it.'],
    pricing: ['Simple pricing', 'List your plans or packages with what is included.'],
    team: ['Meet the team', 'Introduce the people behind the work.'],
    hours: ['Hours & location', 'Share when and where customers can find you.'],
    booking: ['Book an appointment', 'Link to your scheduling tool or add a contact note.'],
    cta: ['Ready to start?', 'A clear next step for visitors who want to work with you.'],
    footer: ['Stay in touch', 'A quiet close with the essentials.'],
  };
  if (!TYPES.includes(type)) throw new Error('Choose a supported section type.');
  const [title, body] = labels[type];
  return { id, type, visible: true, title, body };
}
function uniqueId(draft: Draft, id: string) {
  if (!id || draft.site.sections.some((section) => section.id === id)) throw new Error('Section IDs must be unique.');
}
export function createSectionInstance(draft: Draft, type: string, id = newId()): Draft {
  uniqueId(draft, id);
  return { ...draft, updatedAt: new Date().toISOString(), site: { ...draft.site, sections: [...draft.site.sections, emptySection(type, id)] } };
}
export function duplicateSection(draft: Draft, sectionId: string, id = newId()): Draft {
  const source = draft.site.sections.find((section) => section.id === sectionId);
  if (!source) throw new Error('Section no longer exists.');
  uniqueId(draft, id);
  const index = draft.site.sections.indexOf(source);
  const sections = [...draft.site.sections];
  sections.splice(index + 1, 0, { ...source, id });
  return { ...draft, updatedAt: new Date().toISOString(), site: { ...draft.site, sections } };
}
export function deleteSection(draft: Draft, sectionId: string): Draft {
  if (draft.site.sections.length <= 1) throw new Error('Keep at least one section on your website.');
  if (!draft.site.sections.some((section) => section.id === sectionId)) return draft;
  return { ...draft, updatedAt: new Date().toISOString(), site: { ...draft.site, sections: draft.site.sections.filter((section) => section.id !== sectionId) } };
}
export function cloneProject(project: LocalProject, id = newId()): LocalProject {
  const now = new Date().toISOString();
  return { ...project, id, name: `${project.name} copy`, createdAt: now, updatedAt: now, draft: structuredClone(project.draft) };
}
export function createProject(draft: Draft, id = newId()): LocalProject {
  const now = new Date().toISOString();
  return { id, name: draft.business.name || draft.site.title || 'Untitled website', createdAt: now, updatedAt: now, draft: structuredClone(draft) };
}
