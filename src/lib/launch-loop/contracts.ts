export type FindingStatus = 'open' | 'acknowledged' | 'fixed' | 'verified';

export type LaunchEvidence = { url: string; rule: string; observed: string; expected: string; checkedAt: string; method: string };
export type LaunchFinding = { id: string; status: FindingStatus; title: string; evidence: LaunchEvidence };
export type LaunchPage = { id: string; title: string; path?: string };
export type LaunchProject = { id: string; name: string; pages: LaunchPage[]; updatedAt: string };
export type LaunchHandoff = { version: 1; projectId: string; source: 'create' | 'check'; findings: LaunchFinding[]; siteUrl?: string };

const MAX = 140 * 1024;
const statuses = new Set<FindingStatus>(['open', 'acknowledged', 'fixed', 'verified']);
const text = (value: unknown, max: number, label: string) => {
  if (typeof value !== 'string' || !value.trim() || value.length > max || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(value)) throw new Error(`invalid ${label}`);
  return value;
};

function evidence(value: unknown): LaunchEvidence {
  if (!value || typeof value !== 'object') throw new Error('missing evidence');
  const item = value as Record<string, unknown>;
  return { url: text(item.url, 2048, 'evidence url'), rule: text(item.rule, 120, 'evidence rule'), observed: typeof item.observed === 'string' ? item.observed.slice(0, 2000) : '', expected: text(item.expected, 2000, 'evidence expected'), checkedAt: text(item.checkedAt, 64, 'evidence timestamp'), method: text(item.method, 120, 'evidence method') };
}

export function normalizeProject(input: unknown): LaunchProject {
  if (!input || typeof input !== 'object') throw new Error('invalid project');
  const item = input as Record<string, unknown>;
  const pages = Array.isArray(item.pages) ? item.pages : [];
  const used = new Set<string>();
  const normalized = pages.slice(0, 50).map((page, index) => {
    const row = (page && typeof page === 'object' ? page : {}) as Record<string, unknown>;
    const base = typeof row.id === 'string' && /^[A-Za-z0-9_-]{1,80}$/.test(row.id) ? row.id : `page-${index + 1}`;
    let id = base; let n = 2;
    while (used.has(id)) id = `${base}-${n++}`;
    used.add(id);
    return { id, title: text(typeof row.title === 'string' ? row.title : `Page ${index + 1}`, 300, 'page title'), ...(typeof row.path === 'string' ? { path: row.path.slice(0, 300) } : {}) };
  });
  return { id: text(item.id, 120, 'project id'), name: text(item.name, 300, 'project name'), pages: normalized, updatedAt: typeof item.updatedAt === 'string' ? item.updatedAt : new Date(0).toISOString() };
}

export function parseHandoff(raw: unknown): LaunchHandoff {
  const source = typeof raw === 'string' ? raw : JSON.stringify(raw);
  if (!source || source.length > MAX) throw new Error('handoff too large');
  const item = JSON.parse(source) as Record<string, unknown>;
  if (item.version !== 1 || (item.source !== 'create' && item.source !== 'check')) throw new Error('invalid handoff');
  if (!Array.isArray(item.findings) || item.findings.length > 100) throw new Error('invalid findings');
  const findings = item.findings.map((value) => {
    if (!value || typeof value !== 'object') throw new Error('invalid finding');
    const row = value as Record<string, unknown>;
    if (typeof row.status !== 'string' || !statuses.has(row.status as FindingStatus)) throw new Error('invalid status');
    return { id: text(row.id, 120, 'finding id'), status: row.status as FindingStatus, title: text(row.title, 500, 'finding title'), evidence: evidence(row.evidence) };
  });
  return { version: 1, projectId: text(item.projectId, 120, 'project id'), source: item.source as 'create' | 'check', findings, ...(typeof item.siteUrl === 'string' ? { siteUrl: text(item.siteUrl, 2048, 'site url') } : {}) };
}

export const serializeHandoff = (handoff: unknown) => {
  const value = JSON.stringify(parseHandoff(handoff));
  if (value.length > MAX) throw new Error('handoff too large');
  return value;
};
