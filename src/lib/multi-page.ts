import type { SiteDocument } from './site-document';
import type { Draft } from './templates';

export type Page = {
  id: string;
  title: string;
  slug: string;
  sections: SiteDocument['sections'];
};

export type MultiPageSite = {
  title: string;
  description: string;
  templateId?: string;
  contactEmail?: string;
  theme: { ink: string; paper: string; accent: string };
  pages: Page[];
};

export function createMultiPageDraft(draft: Draft, pageCount: number = 2): Draft {
  const baseSections = draft.site.sections;
  const pages: Page[] = [
    {
      id: 'home',
      title: draft.site.title,
      slug: '/',
      sections: baseSections.filter(s => ['hero', 'services', 'about', 'gallery', 'cta', 'contact'].includes(s.type)),
    },
  ];

  if (pageCount > 1) {
    pages.push(
      {
        id: 'about-page',
        title: 'About',
        slug: '/about',
        sections: baseSections.filter(s => ['about', 'team', 'testimonials'].includes(s.type)).length > 0
          ? baseSections.filter(s => ['about', 'team', 'testimonials'].includes(s.type))
          : [{ id: 'about-default', type: 'about', visible: true, title: 'About us', body: 'Tell our story here.' }],
      },
      {
        id: 'contact-page',
        title: 'Contact',
        slug: '/contact',
        sections: baseSections.filter(s => ['contact', 'hours', 'booking'].includes(s.type)).length > 0
          ? baseSections.filter(s => ['contact', 'hours', 'booking'].includes(s.type))
          : [{ id: 'contact-default', type: 'contact', visible: true, title: 'Get in touch', body: 'Reach out to us.' }],
      }
    );
  }

  // Store pages as metadata in description for now (backwards compatible)
  const metadata = {
    pages: pages.map(p => ({ id: p.id, title: p.title, slug: p.slug, sectionIds: p.sections.map(s => s.id) })),
  };

  return {
    ...draft,
    site: {
      ...draft.site,
      description: draft.site.description + `\n<!-- MULTIPAGE:${JSON.stringify(metadata)} -->`,
    }
  };
}

export function exportMultiPageZip(site: MultiPageSite): string {
  // Simplified: returns HTML for each page
  const pages = site.pages.map(page => {
    const sections = page.sections.map(section => {
      const heading = escapeHtml(section.title);
      const body = escapeHtml(section.body);
      const isHero = section.type === 'hero';
      return `<section><h2>${heading}</h2><p>${body}</p></section>`;
    }).join('\n');

    return `<!doctype html>
<html>
<head><title>${escapeHtml(site.title)} - ${escapeHtml(page.title)}</title></head>
<body>
  <nav>${site.pages.map(p => `<a href="${p.slug}">${escapeHtml(p.title)}</a>`).join(' | ')}</nav>
  <main>${sections}</main>
</body>
</html>`;
  });

  return pages.join('\n---PAGE_SEPARATOR---\n');
}

function escapeHtml(value: unknown) {
  return String(value ?? '').replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c] as string));
}
