import { createHash, createHmac, randomBytes } from 'node:crypto';
import { isIP } from 'node:net';
import { restoreDraft } from '../draft-storage';
import type { Draft } from '../templates';

export const MAX_BODY = 140_000;
export const ACCESS = 'auvrantis_create_access';
export const REFRESH = 'auvrantis_create_refresh';
export const PKCE = 'auvrantis_create_pkce';
const EMAIL = /^[^\s@<>]{1,128}@[a-z0-9.-]{1,190}\.[a-z]{2,}$/i;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type User = { id: string; email: string };
export type Result = { status: number; body: Record<string, unknown>; headers?: HeadersInit };
export const fail = (status: number, message: string): Result => ({ status, body: { error: message } });
export const okay = (body: Record<string, unknown>): Result => ({ status: 200, body });

export function config() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:' && parsed.hostname !== 'localhost') return null;
    return { base: parsed.origin, key };
  } catch { return null; }
}

export function originAllowed(req: Request) {
  const origin = req.headers.get('origin');
  if (!origin) return false;
  try { return new URL(origin).origin === new URL(req.url).origin; } catch { return false; }
}

export async function readJson(req: Request): Promise<unknown | null> {
  const len = Number(req.headers.get('content-length') || '0');
  if (len > MAX_BODY) return null;
  if (!req.body) return null;
  const reader = req.body.getReader();
  const chunks: Uint8Array[] = []; let size = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read(); if (done) break;
      size += value.byteLength;
      if (size > MAX_BODY) { await reader.cancel(); return null; }
      chunks.push(value);
    }
    const bytes = new Uint8Array(size); let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
    return JSON.parse(new TextDecoder().decode(bytes));
  } catch { return null; } finally { reader.releaseLock(); }
}

export function isObject(x: unknown): x is Record<string, unknown> { return !!x && typeof x === 'object' && !Array.isArray(x); }
function onlyKeys(x: Record<string, unknown>, keys: string[]) { return Object.keys(x).every((key) => keys.includes(key)); }
export function validateDraft(raw: unknown): Draft | null {
  if (!isObject(raw) || !onlyKeys(raw, ['version', 'updatedAt', 'templateId', 'business', 'site']) || typeof raw.updatedAt !== 'string' || !Number.isFinite(Date.parse(raw.updatedAt)) || !isObject(raw.business) || !isObject(raw.site)) return null;
  if (!onlyKeys(raw.business, ['name', 'service', 'audience', 'location', 'email', 'tone']) || !onlyKeys(raw.site, ['title', 'description', 'templateId', 'contactEmail', 'theme', 'sections'])) return null;
  if (Object.values(raw.business).some((v) => typeof v !== 'string' || v.length > 2000)) return null;
  if (!onlyKeys(raw.site, ['title', 'description', 'templateId', 'contactEmail', 'theme', 'sections']) || typeof raw.site.title !== 'string' || raw.site.title.length > 300 || typeof raw.site.description !== 'string' || raw.site.description.length > 2000 || (raw.site.contactEmail !== undefined && (typeof raw.site.contactEmail !== 'string' || raw.site.contactEmail.length > 254))) return null;
  if (!isObject(raw.site.theme) || !onlyKeys(raw.site.theme, ['ink', 'paper', 'accent']) || !Array.isArray(raw.site.sections) || raw.site.sections.length > 24 || raw.site.sections.some((s) => !isObject(s) || !onlyKeys(s, ['id', 'type', 'visible', 'title', 'body', 'imageUrl']) || typeof s.id !== 'string' || s.id.length > 80 || typeof s.title !== 'string' || s.title.length > 500 || typeof s.body !== 'string' || s.body.length > 5000 || (s.imageUrl !== undefined && (typeof s.imageUrl !== 'string' || s.imageUrl.length > 2048)))) return null;
  const restored = restoreDraft(JSON.stringify(raw));
  return restored.draft && !restored.recovered ? restored.draft : null;
}
export function validId(value: string) { return UUID.test(value); }
export function validEmail(value: unknown): value is string { return typeof value === 'string' && EMAIL.test(value.trim()) && value.length <= 254; }
export function validPassword(value: unknown): value is string { return typeof value === 'string' && value.length >= 12 && value.length <= 128 && !/[\u0000-\u001f\u007f]/.test(value); }
export function normalizeUser(x: unknown): User | null {
  if (!isObject(x) || typeof x.id !== 'string' || !validId(x.id) || !validEmail(x.email)) return null;
  return { id: x.id, email: x.email };
}
export function clientIp(req: Request) {
  const raw = req.headers.get('x-vercel-forwarded-for') || req.headers.get('x-forwarded-for') || '';
  const ip = raw.split(',')[0].trim();
  return isIP(ip) ? ip : 'unknown';
}
export function hashSubject(value: string) {
  const key = config()?.key;
  if (!key) throw new Error('Cloud is not configured');
  return createHmac('sha256', key).update(value).digest('hex');
}
export function cookie(name: string, value: string, maxAge: number) {
  return `${name}=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`;
}
export function clearCookie(name: string) { return cookie(name, '', 0); }
export function cookies(req: Request) {
  const out: Record<string, string> = {};
  for (const part of (req.headers.get('cookie') || '').split(';')) {
    const i = part.indexOf('='); if (i < 0) continue;
    try { out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim()); } catch { /* ignore malformed cookie */ }
  }
  return out;
}
export function randomSlug() { return randomBytes(12).toString('hex'); }
export function pkcePair() {
  const verifier = randomBytes(32).toString('base64url');
  return { verifier, challenge: createHash('sha256').update(verifier).digest('base64url') };
}

async function call(path: string, init: RequestInit = {}, userToken?: string) {
  const c = config(); if (!c) throw new Error('unconfigured');
  const headers = new Headers({ apikey: c.key, Authorization: `Bearer ${userToken || c.key}`, 'Content-Type': 'application/json' });
  new Headers(init.headers).forEach((value, key) => headers.set(key, value));
  const res = await fetch(`${c.base}${path}`, { ...init, cache: 'no-store', signal: AbortSignal.timeout(8000), headers });
  const text = await res.text();
  let data: unknown = null; try { data = text ? JSON.parse(text) : null; } catch { /* discard malformed upstream response */ }
  return { status: res.status, data, headers: res.headers };
}
export async function auth(path: string, init: RequestInit = {}, req?: Request) {
  const headers = new Headers(init.headers);
  if (req) headers.set('Sb-Forwarded-For', clientIp(req));
  return call(`/auth/v1${path}`, { ...init, headers });
}
export async function rest(path: string, init: RequestInit = {}) { return call(`/rest/v1${path}`, init); }
export async function rpc(name: string, args: unknown = {}) { return rest(`/rpc/${name}`, { method: 'POST', body: JSON.stringify(args) }); }
export async function ready() {
  const r = await rpc('auvrantis_cloud_ready');
  return r.status === 200 && isObject(r.data) && r.data.ready === true && r.data.schema_version === 1;
}
export async function budget(req: Request, scope: string, limit: number, seconds: number, identity?: string) {
  const subject = hashSubject(identity ? `${scope}:${identity}` : `${scope}:${clientIp(req)}`);
  const r = await rpc('consume_auvrantis_request_budget', { p_subject_hash: subject, p_scope: scope, p_window_seconds: seconds, p_limit: limit });
  if (r.status !== 200 || typeof r.data !== 'boolean') throw new Error('budget_unavailable');
  return r.data;
}
export async function currentUser(req: Request): Promise<{ user: User | null; refreshed?: string; refresh?: string; invalid?: boolean }> {
  const c = cookies(req); const token = c[ACCESS]; if (!token && !c[REFRESH]) return { user: null };
  let r = token ? await auth('/user', { headers: { Authorization: `Bearer ${token}` } }) : { status: 401, data: null };
  if (r.status === 200) { const user = normalizeUser(r.data); return user ? { user } : { user: null, invalid: true }; }
  if (r.status !== 401) throw new Error('auth_unavailable');
  if (!c[REFRESH]) return { user: null, invalid: true };
  r = await auth('/token?grant_type=refresh_token', { method: 'POST', body: JSON.stringify({ refresh_token: c[REFRESH] }) }, req);
  if (r.status === 400 || r.status === 401) return { user: null, invalid: true };
  if (r.status !== 200 || !isObject(r.data)) throw new Error('auth_unavailable');
  const u = normalizeUser(r.data.user);
  return u && typeof r.data.access_token === 'string' && typeof r.data.refresh_token === 'string'
    ? { user: u, refreshed: r.data.access_token, refresh: r.data.refresh_token } : { user: null, invalid: true };
}
export function cookieHeaders(access?: string, refresh?: string, clear = false) {
  const h = new Headers();
  if (clear) { h.append('Set-Cookie', clearCookie(ACCESS)); h.append('Set-Cookie', clearCookie(REFRESH)); }
  else if (access && refresh) { h.append('Set-Cookie', cookie(ACCESS, access, 3600)); h.append('Set-Cookie', cookie(REFRESH, refresh, 60 * 60 * 24 * 30)); }
  return h;
}
