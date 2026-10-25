export type WorkspaceSettings = { workspaceName: string; density: 'compact' | 'balanced' | 'expressive'; reducedMotion: boolean; shareDefaultDays: 1 | 7 | 30; analytics: boolean };
const defaults: WorkspaceSettings = { workspaceName: 'Auvrantis Workspace', density: 'balanced', reducedMotion: false, shareDefaultDays: 7, analytics: false };

export function sanitizeWorkspaceSettings(input: unknown): WorkspaceSettings {
  const value = input && typeof input === 'object' ? input as Record<string, unknown> : {};
  const days = value.shareDefaultDays === 1 || value.shareDefaultDays === 30 ? value.shareDefaultDays : 7;
  return { workspaceName: typeof value.workspaceName === 'string' ? value.workspaceName.trim().slice(0, 120) || defaults.workspaceName : defaults.workspaceName, density: value.density === 'compact' || value.density === 'expressive' ? value.density : 'balanced', reducedMotion: value.reducedMotion === true, shareDefaultDays: days, analytics: value.analytics === true };
}

export function exportSettingsBundle(settings: unknown, projects: unknown[]): string {
  const safe = sanitizeWorkspaceSettings(settings);
  const rows = (Array.isArray(projects) ? projects : []).slice(0, 100).map((project) => { const value = project && typeof project === 'object' ? project as Record<string, unknown> : {}; return { id: typeof value.id === 'string' ? value.id.slice(0, 120) : 'project', name: typeof value.name === 'string' ? value.name.slice(0, 300) : 'Untitled project' }; });
  return JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), settings: safe, projects: rows });
}
