import { describe, expect, it } from 'vitest';
import { createLaunchProject, migrateDraftToLaunchProject, updateBrandKit } from './create-project';
import { createDraft } from '../templates';

describe('Create Launch Loop project model', () => {
  it('creates deterministic starter pages from a brief', () => {
    const project = createLaunchProject({ name: 'Acme', service: 'Landscaping', audience: 'Homeowners', location: 'Chicago', tone: 'Warm' }, 'fieldwork');
    expect(project.pages.map((page) => page.id)).toEqual(['home', 'about', 'services', 'faq', 'contact']);
    expect(project.brief.service).toBe('Landscaping');
  });

  it('patches the brand kit without changing pages', () => {
    const project = createLaunchProject({ name: 'Acme' }, 'atelier');
    const updated = updateBrandKit(project, { accent: '#FF745E', logoText: 'ACME' });
    expect(updated.brandKit.accent).toBe('#FF745E');
    expect(updated.pages).toEqual(project.pages);
  });

  it('migrates a v1 draft while preserving business copy', () => {
    const draft = createDraft('atelier', 'My Studio');
    const project = migrateDraftToLaunchProject(draft);
    expect(project.brief.name).toBe('My Studio');
    expect(project.pages[0].sections[0].title).toBe('Make room for good work.');
  });
});
