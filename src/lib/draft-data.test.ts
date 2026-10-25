import { describe, expect, it } from 'vitest';
import { createDraft, personalizeDraft, switchDraftTemplate } from './templates';
import { restoreDraft } from './draft-storage';
import { contrastTextColor } from './site-document';

describe('draft recovery and template data', () => {
  it('recovers from malformed saved sections without keeping an unsafe shape', () => {
    const malformed = JSON.stringify({
      ...createDraft(),
      business: {},
      site: { ...createDraft().site, sections: [null] },
    });
    const result = restoreDraft(malformed);
    if (!result.draft) throw new Error('Expected malformed stored data to recover to a starter draft.');
    expect(result.recovered).toBe(true);
    expect(result.draft.site.sections.every((section) => typeof section.id === 'string')).toBe(true);
    expect(result.draft.business.name).toBe('Your studio');
  });

  it('keeps a valid saved draft when restoring it', () => {
    const saved = createDraft('atelier', 'Northstar');
    saved.site.sections[0].title = 'My own title';
    const result = restoreDraft(JSON.stringify(saved));
    if (!result.draft) throw new Error('Expected a valid stored draft to restore.');
    expect(result.recovered).toBe(false);
    expect(result.draft.site.sections[0].title).toBe('My own title');
  });

  it('changes the design without discarding edited page content', () => {
    const draft = createDraft('atelier', 'Northstar');
    draft.site.sections[1].body = 'My original services copy';
    const changed = switchDraftTemplate(draft, 'fieldwork');
    expect(changed.templateId).toBe('fieldwork');
    expect(changed.site.sections[1].body).toBe('My original services copy');
    expect(changed.business.name).toBe('Northstar');
    expect(changed.site.theme.accent).toBe('#D7FF3F');
  });

  it('uses the selected voice in deterministic starter copy', () => {
    const draft = createDraft('atelier', 'Northstar');
    const answers = { ...draft.business, service: 'Custom ceramics', audience: 'Home cooks', tone: 'Playful and bright' };
    const result = personalizeDraft(draft, answers);
    expect(result.site.sections[0].body).toContain('good things start here');
  });

  it('chooses dark foreground text for lime and light text for cobalt buttons', () => {
    expect(contrastTextColor('#D7FF3F')).toBe('#111827');
    expect(contrastTextColor('#2448FF')).toBe('#FFFFFF');
  });
});
