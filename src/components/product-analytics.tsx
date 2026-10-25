'use client';

import { Analytics } from '@vercel/analytics/next';
import { track } from '@vercel/analytics/react';
import { isCreateAction, sanitizeAnalyticsEvent, type CreateAction } from '@/lib/analytics-privacy';

const enabled = process.env.NEXT_PUBLIC_AUVRANTIS_ANALYTICS === 'true';

export function trackCreateAction(action: CreateAction) {
  if (enabled && isCreateAction(action)) track(action);
}

export default function ProductAnalytics() {
  if (!enabled) return null;
  return <Analytics beforeSend={(event) => sanitizeAnalyticsEvent(event)} />;
}
