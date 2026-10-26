export type SiteSection = {
  id: string;
  type: string;
  visible: boolean;
  title: string;
  body: string;
  imageUrl?: string;
};

export type SiteDocument = {
  title: string;
  description: string;
  templateId?: string;
  contactEmail?: string;
  theme: { ink: string; paper: string; accent: string };
  sections: SiteSection[];
};

const escapeHtml = (value: unknown) => String(value ?? '').replace(/[&<>"']/g, (character) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[character] as string));

function safeUrl(value: string | undefined) {
  const url = (value ?? '').trim();
  if (!url) return '';
  if (url.startsWith('/') && !url.startsWith('//')) return url;
  try {
    const parsed = new URL(url);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') return parsed.href;
  } catch { /* invalid URLs are rejected below */ }
  throw new Error('Unsafe URL: use an http or https address.');
}

function safeColor(value: string) {
  return /^#[\da-f]{6}$/i.test(value) ? value : '#2448FF';
}

function relativeLuminance(color: string) {
  const channels = [1, 3, 5].map((offset) => parseInt(color.slice(offset, offset + 2), 16) / 255)
    .map((channel) => channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4);
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function contrastRatio(first: string, second: string) {
  const [lighter, darker] = [relativeLuminance(first), relativeLuminance(second)].sort((a, b) => b - a);
  return (lighter + 0.05) / (darker + 0.05);
}

export function contrastTextColor(background: string) {
  const color = safeColor(background);
  return contrastRatio(color, '#111827') >= contrastRatio(color, '#FFFFFF') ? '#111827' : '#FFFFFF';
}

export function serializeSite(site: SiteDocument) {
  if (!site || typeof site.title !== 'string' || !Array.isArray(site.sections)) {
    throw new Error('Invalid site document.');
  }
  const theme = {
    ink: safeColor(site.theme?.ink ?? ''),
    paper: safeColor(site.theme?.paper ?? ''),
    accent: safeColor(site.theme?.accent ?? ''),
  };
  const contactEmail = (site.contactEmail ?? '').trim();
  if (contactEmail && !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(contactEmail)) {
    throw new Error('Invalid contact email.');
  }
  const knownTemplates = ['atelier', 'fieldwork', 'index', 'goodday', 'common', 'form', 'cafe', 'salon', 'trainer', 'photographer', 'trades', 'realtor'];
  const templateId = knownTemplates.includes(site.templateId ?? '') ? site.templateId : 'atelier';
  const sections = site.sections.filter((section) => section.visible).map((section) => {
    const imageUrl = safeUrl(section.imageUrl);
    const heading = escapeHtml(section.title);
    const body = escapeHtml(section.body);
    const image = imageUrl ? `<img class="work-image" src="${escapeHtml(imageUrl)}" alt="" loading="lazy">` : '';
    const id = section.type === 'contact' ? ' id="contact"' : '';
    const isHero = section.type === 'hero';
    const contact = section.type === 'contact' && contactEmail
      ? `<a class="button" href="mailto:${escapeHtml(contactEmail)}">Email ${escapeHtml(contactEmail)}</a>`
      : '';
    return `<section class="content-section${isHero ? ' hero-section' : ''}"${id}><p class="eyebrow">${escapeHtml(section.type)}</p>${isHero ? `<h1>${heading}</h1>` : `<h2>${heading}</h2>`}<p>${body}</p>${image}${contact}</section>`;
  }).join('\n');
  const title = escapeHtml(site.title);
  const description = escapeHtml(site.description);
  const templateStyles = `
body.template-fieldwork header{background:var(--accent)}body.template-fieldwork .hero-section h1{max-width:none;background:var(--accent);padding:5vw;border:2px solid var(--ink)}
body.template-index header{text-transform:uppercase;letter-spacing:.12em}body.template-index main{border-left:12px solid var(--accent)}body.template-index .content-section:nth-of-type(even){margin-left:8vw}
body.template-goodday main{text-align:center}body.template-goodday .hero-section h1{max-width:10ch;margin:0 auto 28px}body.template-goodday .hero-section p:not(.eyebrow){margin:0 auto}body.template-goodday .button{border-radius:40px}body.template-goodday .content-section{border-radius:42px;margin-top:30px;padding-left:5vw;padding-right:5vw;background:color-mix(in srgb,var(--accent) 14%,white)}
body.template-common header{background:var(--accent)}body.template-common main{padding-top:5vw}body.template-common .hero-section h1{max-width:9ch}body.template-common .content-section:nth-of-type(odd){background:color-mix(in srgb,var(--accent) 17%,white);padding-left:4vw;padding-right:4vw}
body.template-form .hero-section h1{max-width:8ch;border-left:14px solid var(--accent);padding-left:24px}body.template-form .content-section:not(.hero-section){display:grid;grid-template-columns:.42fr 1fr;column-gap:30px}body.template-form .content-section .eyebrow{grid-column:1}body.template-form .content-section h2,body.template-form .content-section p,body.template-form .content-section img{grid-column:2}
@media(max-width:620px){body.template-form .content-section{display:block}body.template-index .content-section:nth-of-type(even){margin-left:0}}
`;
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${title}</title><meta name="description" content="${description}"><style>
:root{--ink:${theme.ink};--paper:${theme.paper};--accent:${theme.accent};--accent-text:${contrastTextColor(theme.accent)}}*{box-sizing:border-box}body{margin:0;background:var(--paper);color:var(--ink);font-family:Arial,Helvetica,sans-serif}header{padding:24px 6vw;border-bottom:2px solid var(--ink);font-weight:800;letter-spacing:-.04em}main{max-width:1120px;margin:0 auto;padding:8vw 6vw}h1{font-size:clamp(3rem,9vw,8rem);line-height:.9;letter-spacing:-.075em;margin:0 0 28px;max-width:12ch}h2{font-size:clamp(2rem,5vw,4rem);line-height:.98;letter-spacing:-.06em;margin:8px 0 20px}.lede{font-size:1.25rem;line-height:1.5;max-width:42rem}.button{display:inline-block;margin-top:18px;background:var(--accent);color:var(--accent-text);padding:16px 22px;text-decoration:none;font-weight:800;border:2px solid var(--ink)}.content-section{padding:52px 0;border-top:2px solid var(--ink)}.hero-section{border-top:0;padding-top:0}.hero-section h1{max-width:12ch}.eyebrow{text-transform:uppercase;letter-spacing:.15em;font-size:.75rem;font-weight:800}.work-image{display:block;max-width:100%;max-height:480px;margin-top:24px;border:2px solid var(--ink)}footer{border-top:2px solid var(--ink);padding:28px 6vw;font-weight:800}@media(max-width:620px){main{padding:54px 7vw}.content-section{padding:38px 0}}
${templateStyles}</style></head><body class="template-${templateId}"><header>${title}</header><main>${sections}</main></body></html>`;
}
