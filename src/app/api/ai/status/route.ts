import { NextResponse } from 'next/server';

export async function GET() {
  const openAiKey = process.env.OPENAI_API_KEY;
  return NextResponse.json({
    configured: Boolean(openAiKey),
    provider: openAiKey ? 'openai' : 'none',
  }, {
    status: 200,
    headers: {
      'Cache-Control': 'no-store, max-age=0',
      'Content-Type': 'application/json',
    },
  });
}