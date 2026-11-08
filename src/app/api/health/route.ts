export function GET() {
  return Response.json({ ok: true, service: 'auvrantis-create', version: 'pay-per-token-ai' }, { headers: { 'cache-control': 'no-store' } });
}
