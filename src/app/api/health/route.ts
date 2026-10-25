export function GET() {
  return Response.json({ ok: true, service: 'auvrantis-create', version: 'launch-loop-ai-planner' }, { headers: { 'cache-control': 'no-store' } });
}
