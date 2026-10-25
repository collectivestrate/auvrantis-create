import { NextRequest, NextResponse } from 'next/server';
import { auth, budget, cookie, cookieHeaders, cookies, fail, isObject, normalizeUser, originAllowed, pkcePair, randomSlug, readJson, ready, rest, rpc, validEmail, validId, validPassword, validateDraft, PKCE, type Result } from '@/lib/cloud/server';

type Ctx = { params: Promise<{ path: string[] }> };
const response = (r: Result) => NextResponse.json(r.body, { status: r.status, headers: r.headers });
const unavailable = () => fail(503, 'Cloud features are being connected. Your work is still available in this browser.');
async function gate() { try { return await ready(); } catch { return false; } }
async function limit(req: Request, scope: string, n: number, sec: number, identity?: string) {
  try { return await budget(req, scope, n, sec, identity); } catch { throw new Error('limiter'); }
}
async function userFor(req: Request) {
  const state = await (await import('@/lib/cloud/server')).currentUser(req);
  return state;
}
function idFrom(path: string[]) { const id = path[1] || ''; return validId(id) ? id : ''; }
function ownerFilter(userId: string, id?: string) {
  return `?select=id,owner_id,title,draft,updated_at,created_at${id ? `&id=eq.${id}` : ''}&owner_id=eq.${userId}&order=updated_at.desc`;
}

async function run(req: NextRequest, path: string[]) {
  const method = req.method;
  const mutating = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);
  if (mutating && !originAllowed(req)) return response(fail(403, 'Request origin could not be verified.'));
  if (!await gate()) return response(unavailable());

  if (path[0] === 'callback' && method === 'GET') {
    const code = req.nextUrl.searchParams.get('code'); const verifier = (await import('@/lib/cloud/server')).cookies(req)[PKCE];
    if (!code || code.length > 2048 || !verifier || verifier.length > 256) return NextResponse.redirect(new URL('/studio?cloud=signin-expired', req.url));
    const r = await auth('/token?grant_type=pkce', { method: 'POST', body: JSON.stringify({ auth_code: code, code_verifier: verifier }) }, req).catch(() => null);
    if (!r || r.status !== 200 || !isObject(r.data) || !normalizeUser(r.data.user) || typeof r.data.access_token !== 'string' || typeof r.data.refresh_token !== 'string') return NextResponse.redirect(new URL('/studio?cloud=signin-expired', req.url));
    const h = cookieHeaders(r.data.access_token, r.data.refresh_token); h.append('Set-Cookie', cookie(PKCE, '', 0));
    return NextResponse.redirect(new URL('/studio?cloud=signed-in', req.url), { headers: h });
  }

  if (path[0] === 'session' && method === 'GET') {
    try {
      const s = await userFor(req);
      return NextResponse.json({ configured: true, authenticated: !!s.user, email: s.user?.email || null }, { headers: cookieHeaders(s.refreshed, s.refresh, s.invalid) });
    } catch { return response(unavailable()); }
  }
  if (path[0] === 'logout' && method === 'POST') return NextResponse.json({ ok: true }, { headers: cookieHeaders(undefined, undefined, true) });

  if (path[0] === 'signup' && method === 'POST') {
    const body = await readJson(req);
    if (!isObject(body) || !validEmail(body.email) || !validPassword(body.password)) return response(fail(400, 'Enter a valid email and a password of at least 12 characters.'));
    let allowed = false;
    try { allowed = (await limit(req, 'signup_global_minute', 30, 60, 'global')) && (await limit(req, 'signup_global_hour', 300, 3600, 'global')) && (await limit(req, 'signup_minute', 2, 60)) && (await limit(req, 'signup_hour', 3, 3600)) && (await limit(req, 'signup_day', 8, 86400)) && (await limit(req, 'signup_email_hour', 2, 3600, body.email.trim().toLowerCase())); }
    catch { return response(unavailable()); }
    if (!allowed) return response(fail(429, 'Please wait before trying to create another account.'));
    const origin = new URL(req.url).origin;
    const pair = pkcePair();
    const r = await auth(`/signup?redirect_to=${encodeURIComponent(`${origin}/api/cloud/callback`)}`, { method: 'POST', body: JSON.stringify({ email: body.email.trim(), password: body.password, code_challenge: pair.challenge, code_challenge_method: 's256' }) }, req);
    if (r.status >= 500) return response(unavailable());
    if (r.status === 429) return response(fail(429, 'Sign up is temporarily limited. Please try again later.'));
    if (r.status < 200 || r.status >= 300 || !isObject(r.data)) return response(fail(400, 'We could not create that account. Check the email and try again.'));
    const u = normalizeUser(r.data.user);
    if (u && typeof r.data.access_token === 'string' && typeof r.data.refresh_token === 'string') {
      return NextResponse.json({ ok: true, authenticated: true, email: u.email }, { headers: cookieHeaders(r.data.access_token, r.data.refresh_token) });
    }
    return NextResponse.json({ ok: true, authenticated: false, message: 'Check your email to finish creating your account.' }, { headers: { 'Set-Cookie': cookie(PKCE, pair.verifier, 600) } });
  }
  if (path[0] === 'login' && method === 'POST') {
    const body = await readJson(req);
    if (!isObject(body) || !validEmail(body.email) || !validPassword(body.password)) return response(fail(400, 'Enter a valid email and password.'));
    let allowed = false;
    try { allowed = (await limit(req, 'login_global_minute', 100, 60, 'global')) && (await limit(req, 'login_global_hour', 1000, 3600, 'global')) && (await limit(req, 'login_minute', 10, 60)) && (await limit(req, 'login_hour', 30, 3600)) && (await limit(req, 'login_day', 50, 86400)) && (await limit(req, 'login_email_hour', 10, 3600, body.email.trim().toLowerCase())); }
    catch { return response(unavailable()); }
    if (!allowed) return response(fail(429, 'Please wait before trying to sign in again.'));
    const r = await auth('/token?grant_type=password', { method: 'POST', body: JSON.stringify({ email: body.email.trim(), password: body.password }) }, req);
    if (r.status >= 500) return response(unavailable());
    if (r.status !== 200 || !isObject(r.data) || !normalizeUser(r.data.user) || typeof r.data.access_token !== 'string' || typeof r.data.refresh_token !== 'string') return response(fail(401, 'Email or password was not accepted.'));
    const u = normalizeUser(r.data.user)!;
    return NextResponse.json({ ok: true, email: u.email }, { headers: cookieHeaders(r.data.access_token, r.data.refresh_token) });
  }

  const state = await userFor(req).catch(() => null);
  if (!state) return response(unavailable());
  if (!state.user) return NextResponse.json({ error: 'Sign in to use cloud features.' }, { status: 401, headers: cookieHeaders(undefined, undefined, state.invalid) });
  const uid = state.user.id;
  const sessionHeaders = cookieHeaders(state.refreshed, state.refresh, state.invalid);
  let allowed = false;
  try { allowed = (await limit(req, 'cloud_minute', 60, 60)) && (await limit(req, 'cloud_day', 500, 86400)); }
  catch { return response(unavailable()); }
  if (!allowed) return response(fail(429, 'Cloud requests are temporarily limited.'));

  if (path[0] === 'projects' && path.length === 1 && method === 'GET') {
    const r = await rest(`/auvrantis_create_projects${ownerFilter(uid)}`);
    if (r.status !== 200 || !Array.isArray(r.data)) return response(unavailable());
    const pubs = await rest(`/auvrantis_publications?select=project_id,slug,active&owner_id=eq.${uid}`);
    const byId = new Map(Array.isArray(pubs.data) ? pubs.data.filter(isObject).map((p) => [String(p.project_id), { slug: p.slug, active: p.active === true }]) : []);
    const projects = r.data.filter(isObject).flatMap((p) => {
      const draft = validateDraft(p.draft);
      return draft && typeof p.id === 'string' && typeof p.title === 'string' && typeof p.updated_at === 'string'
        ? [{ id: p.id, title: p.title, draft, updatedAt: p.updated_at, publication: byId.get(String(p.id)) || null }]
        : [];
    });
    return NextResponse.json({ projects }, { headers: sessionHeaders });
  }
  if (path[0] === 'projects' && path.length === 1 && method === 'POST') {
    const body = await readJson(req); const draft = isObject(body) ? validateDraft(body.draft) : null;
    if (!draft) return response(fail(400, 'This draft could not be validated.'));
    const title = draft.business.name.trim().slice(0, 120) || 'Untitled site';
    const r = await rest('/auvrantis_create_projects?select=id,title,draft,updated_at,created_at', { method: 'POST', headers: { Prefer: 'return=representation' }, body: JSON.stringify({ owner_id: uid, title, draft, schema_version: 1 }) });
    if (r.status !== 201 || !Array.isArray(r.data) || !r.data[0]) return response(unavailable());
    return NextResponse.json({ project: r.data[0] }, { status: 201, headers: sessionHeaders });
  }
  if (path[0] === 'projects' && path.length === 2) {
    const id = idFrom(path); if (!id) return response(fail(400, 'Invalid project id.'));
    if (method === 'GET') {
      const r = await rest(`/auvrantis_create_projects${ownerFilter(uid, id)}`);
      if (r.status !== 200 || !Array.isArray(r.data)) return response(unavailable());
      const item = r.data[0]; if (!item) return response(fail(404, 'Project not found.'));
      const draft = validateDraft(item.draft);
      if (!draft) return response(fail(422, 'This saved project could not be safely loaded.'));
      return NextResponse.json({ project: { id: item.id, title: item.title, draft, updatedAt: item.updated_at } }, { headers: sessionHeaders });
    }
    if (method === 'PUT') {
      const body = await readJson(req); const draft = isObject(body) ? validateDraft(body.draft) : null;
      if (!draft || !isObject(body) || typeof body.expectedUpdatedAt !== 'string' || !Number.isFinite(Date.parse(body.expectedUpdatedAt))) return response(fail(400, 'This draft could not be validated.'));
      const q = `?id=eq.${id}&owner_id=eq.${uid}&updated_at=eq.${encodeURIComponent(body.expectedUpdatedAt)}&select=id,title,draft,updated_at`;
      const r = await rest(`/auvrantis_create_projects${q}`, { method: 'PATCH', headers: { Prefer: 'return=representation' }, body: JSON.stringify({ draft, title: draft.business.name.trim().slice(0, 120) || 'Untitled site', updated_at: new Date().toISOString() }) });
      if (r.status !== 200 || !Array.isArray(r.data)) return response(unavailable());
      if (!r.data[0]) return response(fail(409, 'This project changed since it was loaded. Reload before saving.'));
      return NextResponse.json({ project: r.data[0] }, { headers: sessionHeaders });
    }
    if (method === 'DELETE') {
      const r = await rest(`/auvrantis_create_projects?id=eq.${id}&owner_id=eq.${uid}`, { method: 'DELETE', headers: { Prefer: 'return=representation' } });
      if (r.status < 200 || r.status >= 300) return response(unavailable());
      return NextResponse.json({ ok: true }, { headers: sessionHeaders });
    }
  }
  if (path[0] === 'publish' && method === 'POST') {
    if (process.env.AUVRANTIS_BETA_PUBLISH !== 'true') return response(fail(503, 'Publishing is not enabled yet.'));
    const body = await readJson(req); const id = isObject(body) && typeof body.projectId === 'string' && validId(body.projectId) ? body.projectId : '';
    if (!id) return response(fail(400, 'Invalid project id.'));
    try { if (!await limit(req, 'publish_day', 5, 86400)) return response(fail(429, 'Publishing is temporarily limited.')); } catch { return response(unavailable()); }
    const pr = await rest(`/auvrantis_create_projects${ownerFilter(uid, id)}`);
    if (pr.status !== 200 || !Array.isArray(pr.data)) return response(unavailable());
    if (!isObject(pr.data[0])) return response(fail(404, 'Project not found.'));
    const draft = validateDraft(pr.data[0].draft); if (!draft) return response(fail(422, 'The saved project needs to be repaired before publishing.'));
    const prior = await rest(`/auvrantis_publications?select=slug&project_id=eq.${id}&owner_id=eq.${uid}&limit=1`);
    const previous = Array.isArray(prior.data) && isObject(prior.data[0]) ? prior.data[0].slug : null;
    const slug = typeof previous === 'string' && /^[a-z0-9]{16,32}$/.test(previous) ? previous : randomSlug();
    const r = await rpc('publish_auvrantis_project', { p_owner_id: uid, p_project_id: id, p_slug: slug, p_document: draft.site });
    if (r.status !== 200 || !isObject(r.data)) return response(unavailable());
    if (r.data.ok !== true) return response(fail(r.data.reason === 'limit' ? 409 : 404, r.data.reason === 'limit' ? 'Beta publishing is limited to three active sites.' : 'Could not publish this project.'));
    return NextResponse.json({ ok: true, slug, url: `${new URL(req.url).origin}/p/${slug}` }, { headers: sessionHeaders });
  }
  if (path[0] === 'publications' && path.length === 2 && method === 'DELETE') {
    const id = idFrom(path); if (!id) return response(fail(400, 'Invalid project id.'));
    const r = await rest(`/auvrantis_publications?project_id=eq.${id}&owner_id=eq.${uid}`, { method: 'PATCH', headers: { Prefer: 'return=representation' }, body: JSON.stringify({ active: false }) });
    if (r.status !== 200) return response(unavailable());
    return NextResponse.json({ ok: true }, { headers: sessionHeaders });
  }
  return response(fail(404, 'Cloud endpoint not found.'));
}

async function safeRun(req: NextRequest, ctx: Ctx) {
  try { return await run(req, (await ctx.params).path); }
  catch { return response(unavailable()); }
}
export async function GET(req: NextRequest, ctx: Ctx) { return safeRun(req, ctx); }
export async function POST(req: NextRequest, ctx: Ctx) { return safeRun(req, ctx); }
export async function PUT(req: NextRequest, ctx: Ctx) { return safeRun(req, ctx); }
export async function PATCH(req: NextRequest, ctx: Ctx) { return safeRun(req, ctx); }
export async function DELETE(req: NextRequest, ctx: Ctx) { return safeRun(req, ctx); }
