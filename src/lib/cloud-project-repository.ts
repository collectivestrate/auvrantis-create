import type { Draft } from './templates';

/** Server-side boundary for future authenticated cloud storage.
 * No client implementation is wired until the owner verifies the additive schema,
 * auth callback configuration, and an approved service contract.
 */
export type CloudReadiness = { available: false; reason: 'not-configured' | 'schema-unverified' };
export type CloudProjectRecord = { id: string; title: string; createdAt: string; updatedAt: string; latestDraft: Draft | null };
export interface CloudProjectRepository {
  readiness(): Promise<CloudReadiness>;
  listOwnedProjects(ownerId: string): Promise<CloudProjectRecord[]>;
  createProject(ownerId: string, title: string, draft: Draft): Promise<CloudProjectRecord>;
  saveDraftVersion(ownerId: string, projectId: string, draft: Draft): Promise<CloudProjectRecord>;
  deleteOwnedProject(ownerId: string, projectId: string): Promise<void>;
}
