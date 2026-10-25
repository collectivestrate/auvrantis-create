import type { Draft } from './templates';
export type SyncProject = { id: string; draft: Draft; updatedAt: string };
export type SyncDecision = 'keep-device' | 'keep-cloud' | 'download-both';
export function syncProject(local: SyncProject, remote: SyncProject): 'local-newer' | 'remote-newer' | 'same' { const localTime = Date.parse(local.updatedAt); const remoteTime = Date.parse(remote.updatedAt); return localTime === remoteTime ? 'same' : localTime > remoteTime ? 'local-newer' : 'remote-newer'; }
export function resolveConflict(decision: SyncDecision, local: SyncProject, remote: SyncProject): SyncProject | { local: SyncProject; remote: SyncProject } { if (decision === 'keep-device') return local; if (decision === 'keep-cloud') return remote; return { local, remote }; }
