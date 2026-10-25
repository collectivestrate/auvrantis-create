import type { Draft } from './templates';

export type ReadinessFocus = 'metadata-title' | 'metadata-description' | 'hero' | 'services' | 'contact';
export type ReadinessItem = { id: string; label: string; ready: boolean; evidence: string; focus: ReadinessFocus };
export function assessReadiness(draft: Draft) {
  const visible = draft.site.sections.filter((section) => section.visible);
  const first = (type: string) => visible.find((section) => section.type === type);
  const email = (draft.site.contactEmail ?? '').trim();
  const validEmail = !email || /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email);
  const checks: ReadinessItem[] = [
    { id: 'title', label: 'Page title', ready: !!draft.site.title.trim(), evidence: draft.site.title.trim() ? `Title is “${draft.site.title.trim()}”.` : 'Page title is empty.', focus: 'metadata-title' },
    { id: 'description', label: 'Search description', ready: !!draft.site.description.trim(), evidence: draft.site.description.trim() ? `Description has ${draft.site.description.trim().length} characters.` : 'Search description is empty.', focus: 'metadata-description' },
    { id: 'hero', label: 'Visible introduction', ready: !!first('hero')?.title.trim() && !!first('hero')?.body.trim(), evidence: first('hero') ? 'A visible introduction section is included.' : 'No visible introduction section found.', focus: 'hero' },
    { id: 'services', label: 'Visible offer', ready: !!first('services'), evidence: first('services') ? 'A visible services section is included.' : 'No visible services section found.', focus: 'services' },
    { id: 'contact', label: 'Visible contact section', ready: !!first('contact') && validEmail, evidence: !first('contact') ? 'No visible contact section found.' : !validEmail ? 'Contact email needs a valid address before the export can link to it.' : email ? `Contact section is visible and links to ${email}.` : 'Contact section is visible; add an email to enable a direct contact link.', focus: 'contact' },
  ];
  return { visibleSectionCount: visible.length, totalSectionCount: draft.site.sections.length, readyCount: checks.filter((check) => check.ready).length, checks };
}
