import { describe, expect, it } from 'vitest';
import { applyAiSitePlan, validateAiSitePlan, type AiSitePlan } from './ai-plan';

const valid: AiSitePlan = { version: 1, brief: { name: 'Northstar', service: 'Ceramics', audience: 'Hosts', location: 'Chicago', tone: 'Warm', primaryCta: 'Shop pieces' }, pages: [{ id: 'home', title: 'Home', path: '/', goal: 'Introduce the studio', sectionTypes: ['hero', 'services', 'contact'] }], theme: { mode: 'dark', accent: '#FF745E', ink: '#FFFDF7', paper: '#111827', typeScale: 'expressive', density: 'balanced' }, contentPrompts: [{ sectionId: 'hero', factsNeeded: ['What makes the studio different?'] }], seo: { title: 'Northstar Ceramics', description: 'Handmade ceramics in Chicago.', keywords: ['ceramics'] }, missingInformation: ['Shipping details'], warnings: [] };

describe('AI site plans', () => {
  it('accepts a bounded structured plan', () => { expect(validateAiSitePlan(valid)).toEqual(valid); });
  it('rejects unknown sections and unsafe colors', () => { expect(() => validateAiSitePlan({ ...valid, pages: [{ ...valid.pages[0], sectionTypes: ['script'] }] })).toThrow(); expect(() => validateAiSitePlan({ ...valid, theme: { ...valid.theme, accent: 'red' } })).toThrow(); });
  it('maps a plan to an editable project without changing the source plan', () => { const project = applyAiSitePlan(valid); expect(project.pages[0].id).toBe('home'); expect(project.brandKit.accent).toBe('#FF745E'); expect(valid.pages[0].sectionTypes).toEqual(['hero', 'services', 'contact']); });
});
