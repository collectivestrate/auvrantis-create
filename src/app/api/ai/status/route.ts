import { NextResponse } from 'next/server';
import { aiAvailability } from '@/lib/ai-metered';
import { providerConfig } from '@/lib/ai-provider';

export async function GET() {
  const availability = aiAvailability();
  return NextResponse.json({
    configured: availability.state === 'open',
    provider: providerConfig()?.provider ?? 'none',
    metering: availability.rates ? 'per-token' : 'not-configured',
  }, { headers: { 'Cache-Control': 'no-store, max-age=0' } });
}
