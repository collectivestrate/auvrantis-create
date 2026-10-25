import { describe, expect, it } from 'vitest';
import { CREATE_ACTIONS, isCreateAction, sanitizeAnalyticsEvent } from './analytics-privacy';

describe('analytics minimization', () => {
  it('keeps only a path and strips query, fragment, and credentials', () => {
    expect(sanitizeAnalyticsEvent({ type: 'pageview' as const, url: 'https://person:secret@example.com/studio?project=Acme#private' }))
      .toEqual({ type: 'pageview', url: '/studio' });
  });

  it('drops public-site and account/cloud routes', () => {
    for (const url of ['/p/customer-site', '/account?email=hello@example.com', '/api/cloud/projects', '/cloud/private']) {
      expect(sanitizeAnalyticsEvent({ type: 'pageview' as const, url })).toBeNull();
    }
  });

  it('allows only the four fixed action names and no properties are needed', () => {
    expect(CREATE_ACTIONS).toEqual(['project_created', 'html_exported', 'backup_exported', 'template_changed']);
    expect(isCreateAction('html_exported')).toBe(true);
    expect(isCreateAction('project_created?business=Acme')).toBe(false);
  });
});
