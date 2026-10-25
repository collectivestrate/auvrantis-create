import { createDraft, templates, type Draft } from './templates';

const sectionTypes = new Set(['hero', 'services', 'about', 'gallery', 'faq', 'contact']);
const colorPattern = /^#[\da-f]{6}$/i;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isValidDraft(value: unknown): value is Draft {
  if (!isRecord(value) || value.version !== 1 || typeof value.updatedAt !== 'string') return false;
  if (typeof value.templateId !== 'string' || !templates.some((template) => template.id === value.templateId)) return false;
  const business = value.business;
  if (!isRecord(business) || !['name', 'service', 'audience', 'location', 'email', 'tone'].every((key) => typeof business[key] === 'string')) return false;
  if (typeof business.email !== 'string' || (business.email.trim() && !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(business.email.trim()))) return false;
  const site = value.site;
  if (!isRecord(site) || typeof site.title !== 'string' || typeof site.description !== 'string') return false;
  if (site.templateId !== value.templateId) return false;
  const theme = site.theme;
  if (!isRecord(theme) || !['ink', 'paper', 'accent'].every((key) => typeof theme[key] === 'string' && colorPattern.test(theme[key] as string))) return false;
  if (site.contactEmail !== undefined && typeof site.contactEmail !== 'string') return false;
  if (typeof site.contactEmail === 'string' && site.contactEmail.trim() && !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(site.contactEmail.trim())) return false;
  const sections = site.sections;
  if (!Array.isArray(sections) || sections.length === 0) return false;
  const ids = new Set<string>();
  return sections.every((section) => {
    if (!isRecord(section) || typeof section.id !== 'string' || !section.id || ids.has(section.id)) return false;
    if (typeof section.type !== 'string' || !sectionTypes.has(section.type) || typeof section.visible !== 'boolean') return false;
    if (typeof section.title !== 'string' || typeof section.body !== 'string') return false;
    if (section.imageUrl !== undefined && typeof section.imageUrl !== 'string') return false;
    ids.add(section.id);
    return true;
  });
}

export function restoreDraft(raw: string | null): { draft: Draft; recovered: boolean } | { draft: null; recovered: false } {
  if (raw === null) return { draft: null, recovered: false };
  try {
    const parsed: unknown = JSON.parse(raw);
    if (isValidDraft(parsed)) {
      return {
        recovered: false,
        draft: {
          version: 1,
          updatedAt: parsed.updatedAt,
          templateId: parsed.templateId,
          business: {
            name: parsed.business.name,
            service: parsed.business.service,
            audience: parsed.business.audience,
            location: parsed.business.location,
            email: parsed.business.email,
            tone: parsed.business.tone,
          },
          site: {
            title: parsed.site.title,
            description: parsed.site.description,
            templateId: parsed.templateId,
            contactEmail: parsed.site.contactEmail?.trim() ?? '',
            theme: { ink: parsed.site.theme.ink, paper: parsed.site.theme.paper, accent: parsed.site.theme.accent },
            sections: parsed.site.sections.map((section) => ({
              id: section.id,
              type: section.type,
              visible: section.visible,
              title: section.title,
              body: section.body,
              imageUrl: section.imageUrl,
            })),
          },
        },
      };
    }
  } catch { /* malformed JSON is treated as an interrupted local save */ }
  return { draft: createDraft(), recovered: true };
}
