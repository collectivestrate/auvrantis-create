import { describe, expect, it } from 'vitest';
import { exportSettingsBundle, sanitizeWorkspaceSettings } from './account-settings';

describe('account settings', () => {
  it('bounds and normalizes workspace settings', () => {
    const value = sanitizeWorkspaceSettings({ workspaceName: '  Auvrantis  ', density: 'expressive', reducedMotion: true, shareDefaultDays: 30 });
    expect(value).toEqual({ workspaceName: 'Auvrantis', density: 'expressive', reducedMotion: true, shareDefaultDays: 30, analytics: false });
  });

  it('redacts private project fields from an export bundle', () => {
    const bundle = JSON.parse(exportSettingsBundle({ workspaceName: 'Studio', density: 'balanced', reducedMotion: false, shareDefaultDays: 7, analytics: false }, [{ id: 'p1', name: 'Site', privateNote: 'secret' }]));
    expect(bundle.settings.workspaceName).toBe('Studio');
    expect(bundle.projects[0]).toEqual({ id: 'p1', name: 'Site' });
    expect(JSON.stringify(bundle)).not.toContain('secret');
  });
});
