import { serializeHandoff, type LaunchHandoff, type LaunchProject } from './contracts';
export function createCheckHandoff(project: LaunchProject, url: string): string {
  const value = new URL(url); value.username = ''; value.password = ''; value.search = ''; value.hash = '';
  const handoff: LaunchHandoff = { version: 1, projectId: project.id, source: 'create', findings: [] };
  return serializeHandoff({ ...handoff, siteUrl: value.href });
}
