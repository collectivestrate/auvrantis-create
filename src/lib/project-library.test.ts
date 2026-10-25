import { describe, expect, it } from 'vitest';
import { createDraft } from './templates';
import {
  createSectionInstance,
  duplicateSection,
  deleteSection,
  parseProjectBackup,
  restoreProjectLibrary,
  serializeProjectBackup,
  type LocalProject,
} from './project-library';
import { assessReadiness } from './readiness';

const asProject = (): LocalProject => ({
  id: 'project-1',
  name: 'Northstar Ceramics',
  createdAt: '2026-10-25T12:00:00.000Z',
  updatedAt: '2026-10-25T12:00:00.000Z',
  draft: createDraft('atelier', 'Northstar Ceramics'),
});

describe('project library migration and portable backups', () => {
  it('migrates a legacy v1 draft without changing its content', () => {
    const legacy = createDraft('atelier', 'Northstar Ceramics');
    legacy.site.sections[0].body = 'Legacy line stays exactly as written.';
    const result = restoreProjectLibrary(null, JSON.stringify(legacy));
    expect(result.migratedLegacy).toBe(true);
    expect(result.projects).toHaveLength(1);
    expect(result.projects[0].draft.site.sections[0].body).toBe('Legacy line stays exactly as written.');
    expect(result.projects[0].draft.business).toEqual(legacy.business);
  });

  it('round-trips an editable project without exporting HTML or executable fields', () => {
    const project = asProject();
    const backup = serializeProjectBackup(project);
    expect(backup).not.toContain('<html');
    expect(backup).not.toContain('generatedHtml');
    expect(parseProjectBackup(backup).draft.site.sections[0].title).toBe(project.draft.site.sections[0].title);
  });

  it('rejects unknown HTML or code fields in imported backups', () => {
    const backup = JSON.parse(serializeProjectBackup(asProject()));
    backup.generatedHtml = { home: '<script>alert(1)</script>' };
    expect(() => parseProjectBackup(JSON.stringify(backup))).toThrow(/unsupported fields/i);
    delete backup.generatedHtml;
    backup.draft.site.sections[0].customHtml = '<img src=x onerror=alert(1)>';
    expect(() => parseProjectBackup(JSON.stringify(backup))).toThrow(/valid Auvrantis Create project backup/i);
  });

  it('rejects backups that exceed the portable file size limit', () => {
    const backup = serializeProjectBackup(asProject());
    expect(() => parseProjectBackup(backup, 20)).toThrow(/1 MB/i);
  });
});

describe('section instances', () => {
  it('duplicates with a new stable identifier and preserves the original', () => {
    const draft = createDraft();
    const original = draft.site.sections.find((section) => section.id === 'services');
    const next = duplicateSection(draft, 'services', 'section-new');
    expect(next.site.sections.map((section) => section.id)).toContain('section-new');
    expect(new Set(next.site.sections.map((section) => section.id)).size).toBe(next.site.sections.length);
    expect(next.site.sections.find((section) => section.id === 'services')).toEqual(original);
    expect(next.site.sections.find((section) => section.id === 'section-new')?.body).toBe(original?.body);
  });

  it('adds and removes a section by its stable id', () => {
    const draft = createDraft();
    const withSection = createSectionInstance(draft, 'testimonials', 'section-testimonials');
    expect(withSection.site.sections.at(-1)?.id).toBe('section-testimonials');
    const withoutSection = deleteSection(withSection, 'section-testimonials');
    expect(withoutSection.site.sections.map((section) => section.id)).not.toContain('section-testimonials');
  });

  it('does not remove the final remaining section', () => {
    const single = { ...createDraft(), site: { ...createDraft().site, sections: [createDraft().site.sections[0]] } };
    expect(() => deleteSection(single, 'hero')).toThrow(/one section/i);
  });
});

describe('readiness evidence', () => {
  it('reports evidence counts and a focused action for missing metadata', () => {
    const draft = createDraft();
    draft.site.title = '';
    draft.site.description = '';
    const result = assessReadiness(draft);
    expect(result.visibleSectionCount).toBe(5);
    expect(result.checks.filter((check) => check.ready)).toHaveLength(3);
    expect(result.checks.find((check) => check.id === 'title')?.focus).toBe('metadata-title');
    expect(result.checks.find((check) => check.id === 'title')?.evidence).toMatch(/empty/i);
  });
});
