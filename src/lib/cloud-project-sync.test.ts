import { describe, expect, it } from 'vitest';
import { resolveConflict, syncProject } from './cloud-project-sync';
import { createDraft } from './templates';
const project = (updatedAt: string) => ({ id: 'p1', draft: createDraft('atelier', 'Site'), updatedAt });
describe('cloud sync decisions', () => {
  it('classifies local and remote versions without overwriting', () => { expect(syncProject(project('2026-10-26T00:00:00Z'), project('2026-10-25T00:00:00Z'))).toBe('local-newer'); expect(syncProject(project('2026-10-25T00:00:00Z'), project('2026-10-26T00:00:00Z'))).toBe('remote-newer'); });
  it('preserves both sides when the user chooses download both', () => { const local = project('2026-10-26T00:00:00Z'); const remote = project('2026-10-25T00:00:00Z'); expect(resolveConflict('download-both', local, remote)).toEqual({ local, remote }); });
});
