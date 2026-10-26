import { serializeSite } from './site-document';
import type { SiteDocument } from './site-document';

export function exportMultiPageZip(site: SiteDocument, pages: Array<{title: string, slug: string, sections: SiteDocument['sections']}>) {
  // Simple multi-page HTML export with shared CSS
  const theme = site.theme;
  const contrastTextColor = (bg: string) => {
    const hex = bg.replace('#', '');
    const r = parseInt(hex.slice(0,2), 16) / 255;
    const g = parseInt(hex.slice(2,4), 16) / 255;
    const b = parseInt(hex.slice(4,6), 16) / 255;
    const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    return lum > 0.5 ? '#111827' : '#FFFFFF';
  };

  const baseStyles = `
:root {
  --ink: ${theme.ink};
  --paper: ${theme.paper};
  --accent: ${theme.accent};
  --accent-text: ${contrastTextColor(theme.accent)};
}
* { box-sizing: border-box; }
body { margin: 0; background: var(--paper); color: var(--ink); font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; }
header { padding: 24px 6vw; border-bottom: 2px solid var(--ink); }
nav { display: flex; gap: 24px; font-weight: 600; }
main { max-width: 1120px; margin: 0 auto; padding: 8vw 6vw; }
h1 { font-size: clamp(2.5rem, 6vw, 4rem); line-height: 1.1; margin: 0 0 20px; }
section { padding: 40px 0; border-top: 2px solid var(--ink); }
footer { border-top: 2px solid var(--ink); padding: 28px 6vw; font-weight: 600; }
.button { display: inline-block; background: var(--accent); color: var(--accent-text); padding: 12px 20px; text-decoration: none; font-weight: 600; }
`;

  const files: Array<{name: string, content: string}> = [];

  // Index page
  const navLinks = pages.map(p =>
    `<a href="${p.slug === '/' ? 'index.html' : p.slug.replace(/^\//, '') + '.html'}">${p.title}</a>`
  ).join('');

  pages.forEach((page, idx) => {
    const sectionHtml = page.sections.filter(s => s.visible).map(section => {
      const heading = escapeHtml(section.title);
      const body = escapeHtml(section.body);
      return `
      <section id="${section.id}">
        <h2>${heading}</h2>
        <p>${body}</p>
      </section>`;
    }).join('\n');

    const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(site.title)} - ${escapeHtml(page.title)}</title>
  <meta name="description" content="${escapeHtml(site.description)}">
  <style>${baseStyles}</style>
</head>
<body>
  <header>
    <h1>${escapeHtml(site.title)}</h1>
    <nav>${navLinks}</nav>
  </header>
  <main>${sectionHtml}</main>
  <footer>
    <p>${escapeHtml(site.title)} - ${site.contactEmail ? `<a href="mailto:${escapeHtml(site.contactEmail)}">${escapeHtml(site.contactEmail)}</a>` : ''}</p>
  </footer>
</body>
</html>`;

    const filename = page.slug === '/' ? 'index.html' : page.slug.replace(/^\//, '') + '.html';
    files.push({ name: filename, content: html });
  });

  return files;
}

function escapeHtml(value: unknown) {
  return String(value ?? '').replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c] as string));
}
