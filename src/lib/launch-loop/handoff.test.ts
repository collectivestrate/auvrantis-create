import { describe, expect, it } from 'vitest';
import { createLaunchProject } from './create-project';
import { createCheckHandoff } from './handoff';

describe('Create Check handoff', () => {
  it('creates a portable handoff with a redacted site URL', () => {
    const project = createLaunchProject({ name: 'Acme' }, 'atelier');
    const handoff = JSON.parse(createCheckHandoff(project, 'https://example.com/?token=secret#top'));
    expect(handoff.projectId).toBe(project.id);
    expect(handoff.siteUrl).toBe('https://example.com/');
    expect(handoff.findings).toEqual([]);
  });
});
