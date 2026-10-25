import { createHash, randomBytes } from 'node:crypto';
export type ShareRecord = { digest: string; resourceId: string; ownerId: string; expiresAt: string; revokedAt?: string };
export function createShareToken(): { token: string; digest: string } { const token = randomBytes(32).toString('base64url'); return { token, digest: digestShareToken(token) }; }
export function digestShareToken(token: string): string { return createHash('sha256').update(token).digest('hex'); }
export function isShareActive(record: ShareRecord, now = Date.now()): boolean { return !record.revokedAt && Date.parse(record.expiresAt) > now; }
