export const CREATE_ACTIONS = ['project_created', 'html_exported', 'backup_exported', 'template_changed'] as const;
export type CreateAction = (typeof CREATE_ACTIONS)[number];
export type AnalyticsPageEvent = { type: 'pageview' | 'event'; url: string };

const privatePath = /^\/(?:p(?:\/|$)|account(?:\/|$)|auth(?:\/|$)|cloud(?:\/|$)|api\/cloud(?:\/|$))/i;

export function isCreateAction(value: string): value is CreateAction {
  return (CREATE_ACTIONS as readonly string[]).includes(value);
}

export function sanitizeAnalyticsEvent<T extends AnalyticsPageEvent>(event: T): T | null {
  try {
    const parsed = new URL(event.url, 'https://auvrantis-create.vercel.app');
    const path = parsed.pathname || '/';
    if (privatePath.test(path)) return null;
    return { ...event, url: path };
  } catch {
    return null;
  }
}
