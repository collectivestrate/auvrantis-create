import type { Draft } from '../templates';
import type { SiteSection } from '../site-document';

export type LaunchBrief = { name?: string; service?: string; audience?: string; location?: string; tone?: string };
export type BrandKit = { logoText: string; accent: string; ink: string; paper: string; typeScale: 'compact' | 'balanced' | 'expressive'; buttonStyle: 'square' | 'rounded' };
export type LaunchPage = { id: string; title: string; path: string; sections: SiteSection[] };
export type LaunchProject = { version: 1; id: string; name: string; templateId: string; updatedAt: string; brief: Required<LaunchBrief>; brandKit: BrandKit; pages: LaunchPage[] };

const defaultBrief = (brief: LaunchBrief): Required<LaunchBrief> => ({ name: brief.name?.trim() || 'Your studio', service: brief.service?.trim() || '', audience: brief.audience?.trim() || '', location: brief.location?.trim() || '', tone: brief.tone?.trim() || 'Warm and direct' });

export function createLaunchProject(brief: LaunchBrief, templateId: string): LaunchProject {
  const normalized = defaultBrief(brief);
  const page = (id: string, title: string, path: string, sections: SiteSection[]): LaunchPage => ({ id, title, path, sections });
  const hero: SiteSection = { id: 'hero', type: 'hero', visible: true, title: normalized.name, body: normalized.service || 'A clear place to share what you do and what comes next.' };
  const intro = (id: string, title: string): SiteSection => ({ id, type: id === 'faq' ? 'faq' : id === 'contact' ? 'contact' : 'about', visible: true, title, body: normalized.audience ? `A thoughtful place for ${normalized.audience}.` : 'Share the details people need to take the next step.' });
  return { version: 1, id: `project-${Date.now().toString(36)}`, name: normalized.name, templateId, updatedAt: new Date().toISOString(), brief: normalized, brandKit: { logoText: normalized.name.toUpperCase(), accent: '#2448FF', ink: '#111827', paper: '#FFFDF7', typeScale: 'balanced', buttonStyle: 'square' }, pages: [page('home', 'Home', '/', [hero]), page('about', 'About', '/about', [intro('about', 'A little about the work')]), page('services', 'Services', '/services', [intro('services', 'What we offer')]), page('faq', 'FAQ', '/faq', [intro('faq', 'A few good questions')]), page('contact', 'Contact', '/contact', [intro('contact', 'Start a conversation')])] };
}

export function updateBrandKit(project: LaunchProject, patch: Partial<BrandKit>): LaunchProject { return { ...project, updatedAt: new Date().toISOString(), brandKit: { ...project.brandKit, ...patch } }; }
export function migrateDraftToLaunchProject(draft: Draft): LaunchProject { const project = createLaunchProject(draft.business, draft.templateId); return { ...project, name: draft.business.name, brief: draft.business, pages: [{ id: 'home', title: 'Home', path: '/', sections: draft.site.sections }, ...project.pages.slice(1)] }; }
