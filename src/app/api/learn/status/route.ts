import { NextResponse } from 'next/server';
import { cookieHeaders } from '@/lib/cloud/server';
import { accessFor } from '@/lib/learn-access';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const access = await accessFor(req);
  return NextResponse.json(
    { configured: access.configured, signedIn: access.signedIn, email: access.email, active: access.active, plan: access.plan },
    { headers: cookieHeaders(access.refreshed, access.refresh, access.invalid) },
  );
}
