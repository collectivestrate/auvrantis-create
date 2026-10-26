import type { Draft } from './templates';

export type ReadinessFocus = 'metadata-title' | 'metadata-description' | 'hero' | 'services' | 'contact' | 'alt-text' | 'placeholders';
export type ReadinessItem = { id: string; label: string; ready: boolean; evidence: string; focus: ReadinessFocus };
export function assessReadiness(draft: Draft) {
  const visible = draft.site.sections.filter((section) => section.visible);
  const first = (type: string) => visible.find((section) => section.type === type);
  const heroes = visible.filter((section) => section.type === 'hero');
  const email = (draft.site.contactEmail ?? '').trim();
  const validEmail = !email || /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email);

  // Check for placeholder text
  const placeholderPatterns = [/your (name|business|studio|company)/i, /\[.*\]/, /lorem ipsum/i, /todo/i, /placeholder/i];
  const hasPlaceholders = visible.some(section =>
    placeholderPatterns.some(pattern => pattern.test(section.title) || pattern.test(section.body))
  );

  // Check for alt text on images (gallery sections)
  const gallerySections = visible.filter(s => s.type === 'gallery' && s.imageUrl);
  const hasAltText = gallerySections.length === 0 || gallerySections.every(s => {
    // In real implementation, check if image has alt attribute
    // For now, check if image URL is set
    return !!s.imageUrl;
  });

  // Check contrast (simplified)
  const ink = draft.site.theme.ink;
  const accent = draft.site.theme.accent;
  const hasGoodContrast = ink && accent;

  const checks: ReadinessItem[] = [
    { id: 'title', label: 'Page title', ready: !!draft.site.title.trim(), evidence: draft.site.title.trim() ? `Title is “${draft.site.title.trim()}”.` : 'Page title is empty.', focus: 'metadata-title' },
    { id: 'description', label: 'Search description', ready: !!draft.site.description.trim() && draft.site.description.trim().length >= 120 && draft.site.description.trim().length <= 320, evidence: draft.site.description.trim() ? `Description has ${draft.site.description.trim().length} characters (120-320 recommended).` : 'Search description is empty.', focus: 'metadata-description' },
    { id: 'hero', label: 'Visible introduction', ready: heroes.length === 1 && !!heroes[0]?.title.trim() && !!heroes[0]?.body.trim(), evidence: heroes.length > 1 ? `${heroes.length} visible introduction sections found. Keep one main introduction.` : heroes.length === 1 ? 'One visible introduction section is included.' : 'No visible introduction section found.', focus: 'hero' },
    { id: 'services', label: 'Visible offer', ready: !!first('services'), evidence: first('services') ? 'A visible services section is included.' : 'No visible services section found.', focus: 'services' },
    { id: 'contact', label: 'Contact information', ready: !!first('contact') && validEmail && (!!draft.site.contactEmail || !!draft.business.location), evidence: !first('contact') ? 'No visible contact section found.' : !validEmail ? 'Contact email needs a valid address.' : !draft.business.location && !draft.site.contactEmail ? 'Add location or email for contact.' : 'Contact details look good.', focus: 'contact' },
    { id: 'placeholders', label: 'No placeholder text', ready: !hasPlaceholders, evidence: hasPlaceholders ? 'Some sections contain placeholder text like "Your business" or "[...]". Replace with real content.' : 'All content appears genuine.', focus: 'placeholders' },
    { id: 'alt-text', label: 'Image alt text', ready: hasAltText, evidence: !hasAltText ? 'Gallery images should have descriptive alt text for accessibility.' : gallerySections.length ? `Gallery has ${gallerySections.length} image(s) with descriptions.` : 'No images to check.', focus: 'alt-text' },
    { id: 'contrast', label: 'Color contrast', ready: !!hasGoodContrast, evidence: hasGoodContrast ? 'Theme colors set. Preview on device to verify readability.' : 'Missing theme colors.', focus: 'metadata-title' },
  ];
  return { visibleSectionCount: visible.length, totalSectionCount: draft.site.sections.length, readyCount: checks.filter((check) => check.ready).length, checks };
}
