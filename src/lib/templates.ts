import type { SiteDocument } from './site-document';

export type Template = { id: string; name: string; category: string; note: string; stamp: string; layout: string; accent: string };

export const templates: Template[] = [
  { id: 'atelier', name: 'Atelier', category: 'Creative studio', note: 'Quietly confident, image-led', stamp: '01', layout: 'template-atelier', accent: '#2448FF' },
  { id: 'fieldwork', name: 'Fieldwork', category: 'Outdoor services', note: 'Warm, grounded, practical', stamp: '02', layout: 'template-fieldwork', accent: '#D7FF3F' },
  { id: 'index', name: 'Index', category: 'Consultant', note: 'Clear thinking, in full view', stamp: '03', layout: 'template-index', accent: '#FF745E' },
  { id: 'goodday', name: 'Good Day', category: 'Wellness', note: 'Bright energy, easy rhythm', stamp: '04', layout: 'template-goodday', accent: '#FFC843' },
  { id: 'common', name: 'Common Ground', category: 'Neighborhood shop', note: 'Human, local, memorable', stamp: '05', layout: 'template-common', accent: '#A8E6CF' },
  { id: 'form', name: 'Form & Function', category: 'Architecture', note: 'Precise lines, bold scale', stamp: '06', layout: 'template-form', accent: '#B9A5FF' },
];

export type Draft = {
  version: 1;
  updatedAt: string;
  templateId: string;
  business: { name: string; service: string; audience: string; location: string; email: string; tone: string };
  site: SiteDocument;
};

export function createDraft(templateId = 'atelier', name = 'Your studio'): Draft {
  const template = templates.find((item) => item.id === templateId) ?? templates[0];
  const starter = ({
    atelier: { hero: ['Make room for good work.', 'A thoughtful place to share the work you do and the ideas behind it.'], services: ['Good work, clearly told', 'Describe your practice, your process, and the work you want to take on.'], about: ['Small studio. Big attention.', 'Introduce the people behind the work and what matters to you.'], gallery: ['Selected work', 'Choose a few projects and add the context that makes each one meaningful.'] },
    fieldwork: { hero: ['More outside. More often.', 'A practical introduction to the outdoor work and services you offer.'], services: ['Ready for the next season', 'Explain what you do, where you work, and how customers can get started.'], about: ['Good work starts on site.', 'Share how you approach each project and what customers can expect.'], gallery: ['Work in the field', 'Show real projects with permission and a short note about the work.'] },
    index: { hero: ['Make the next move count.', 'A clear starting point for people looking for your experience and perspective.'], services: ['A clearer way forward', 'Outline your areas of focus and the practical outcomes you help clients pursue.'], about: ['Experience, in context.', 'Share your point of view, background, and the way you work with clients.'], gallery: ['Selected engagements', 'Add examples you can share and explain your contribution to each one.'] },
    goodday: { hero: ['Feel more like yourself.', 'A welcoming introduction to the care, classes, or services you provide.'], services: ['Find your rhythm', 'Describe the options available and who each one may be a fit for.'], about: ['Care that meets you here.', 'Share your approach and the details a new customer may want to know.'], gallery: ['A look around', 'Add images that help visitors understand the experience you offer.'] },
    common: { hero: ['Good things grow here.', 'A warm welcome to your shop, studio, or neighborhood business.'], services: ['Made for your everyday', 'Show what customers can find, order, book, or ask you about.'], about: ['Part of the neighborhood.', 'Tell visitors what you care about and how your business came to be.'], gallery: ['Around the shop', 'Share real details, products, or spaces that show what you make.'] },
    form: { hero: ['Shape a better space.', 'An introduction to your design practice and the places you help shape.'], services: ['Space with a purpose', 'Describe your process, project types, and the people you work with.'], about: ['Thoughtful by design.', 'Share the principles that guide your work and how a project takes shape.'], gallery: ['Places and details', 'Feature work you have permission to share, with useful context.'] },
  } as Record<string, { hero: [string, string]; services: [string, string]; about: [string, string]; gallery: [string, string] }>)[template.id] ?? {
    hero: ['A good place to begin.', 'A thoughtful place to share the work you do and the ideas behind it.'],
    services: ['What you offer', 'Describe your services and what customers can expect.'],
    about: ['A little about you', 'Introduce the people behind the work and what matters to you.'],
    gallery: ['Selected work', 'Choose a few projects and add the context that makes each one meaningful.'],
  };
  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    templateId: template.id,
    business: { name, service: 'Thoughtful design for good ideas', audience: 'People building something meaningful', location: '', email: '', tone: 'Warm and direct' },
    site: {
      title: name,
      description: 'Independent work, made with care.',
      templateId: template.id,
      contactEmail: '',
      theme: { ink: '#111827', paper: '#FFFDF7', accent: template.accent },
      sections: [
        { id: 'hero', type: 'hero', visible: true, title: starter.hero[0], body: starter.hero[1] },
        { id: 'services', type: 'services', visible: true, title: starter.services[0], body: starter.services[1] },
        { id: 'about', type: 'about', visible: true, title: starter.about[0], body: starter.about[1] },
        { id: 'gallery', type: 'gallery', visible: true, title: starter.gallery[0], body: starter.gallery[1] },
        { id: 'faq', type: 'faq', visible: false, title: 'A few good questions', body: 'Tell us what you are working on. We will talk through the next step together.' },
        { id: 'contact', type: 'contact', visible: true, title: 'Have a good one in mind?', body: 'Tell us a little about it and we will be in touch.' },
      ],
    },
  };
}

export function personalizeDraft(draft: Draft, answers: Draft['business']): Draft {
  const name = answers.name.trim() || 'Your studio';
  const service = answers.service.trim();
  const audience = answers.audience.trim().toLowerCase();
  const voice = answers.tone === 'Playful and bright'
    ? `${service || 'A little more personality. A lot of care.'} — good things start here${audience ? `, for ${audience}` : ''}.`
    : answers.tone === 'Calm and considered'
      ? `${service || 'A considered approach, from first conversation to finished work.'}${audience ? ` for ${audience}` : ''}.`
      : answers.tone === 'Clear and expert'
        ? `${service || 'Clear information about the work you do and how to begin.'}${audience ? ` for ${audience}` : ''}.`
        : `${service || 'A welcoming place to learn about your work and what comes next.'}${audience ? `, for ${audience}` : ''}.`;
  const description = [service, answers.audience.trim() ? `for ${answers.audience.trim()}` : '', answers.location.trim() ? `in ${answers.location.trim()}` : ''].filter(Boolean).join(' ');
  return {
    ...draft,
    business: answers,
    site: {
      ...draft.site,
      title: name,
      description: description || 'A clear introduction to this business, its work, and how to get in touch.',
      contactEmail: answers.email.trim(),
      sections: draft.site.sections.map((section) => section.id === 'hero'
        ? { ...section, body: voice }
        : section),
    },
  };
}

export function switchDraftTemplate(draft: Draft, templateId: string): Draft {
  const template = templates.find((item) => item.id === templateId);
  if (!template) return draft;
  return {
    ...draft,
    templateId: template.id,
    updatedAt: new Date().toISOString(),
    site: {
      ...draft.site,
      templateId: template.id,
      theme: { ...draft.site.theme, accent: template.accent },
    },
  };
}
