import { NextRequest } from 'next/server';
import { isObject, rest } from '@/lib/cloud/server';
import { serializeSite, type SiteDocument } from '@/lib/site-document';

const headers = {
  'Content-Type': 'text/html; charset=utf-8',
  'Cache-Control': 'no-store, max-age=0',
  'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; img-src https: http:; base-uri 'none'; form-action 'none'; frame-ancestors 'none'; object-src 'none'; script-src 'none'; connect-src 'none'",
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
};
const notFound = () => new Response('Page not found.', { status: 404, headers: { ...headers, 'Content-Type': 'text/plain; charset=utf-8' } });

export async function GET(_req: NextRequest, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  if (!/^[a-z0-9]{16,32}$/.test(slug)) return notFound();
  try {
    const result = await rest(`/auvrantis_publications?select=document&slug=eq.${slug}&active=eq.true&limit=1`);
    if (result.status !== 200 || !Array.isArray(result.data) || !isObject(result.data[0]) || !isObject(result.data[0].document)) return notFound();
    const html = serializeSite(result.data[0].document as unknown as SiteDocument);
    return new Response(html, { status: 200, headers });
  } catch { return notFound(); }
}
