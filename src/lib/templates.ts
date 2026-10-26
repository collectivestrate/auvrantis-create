import type { SiteDocument } from './site-document';

export type Template = { id: string; name: string; category: string; note: string; stamp: string; layout: string; accent: string };

export const templates: Template[] = [
  { id: 'atelier', name: 'Atelier', category: 'Creative studio', note: 'Quietly confident, image-led', stamp: '01', layout: 'template-atelier', accent: '#2448FF' },
  { id: 'fieldwork', name: 'Fieldwork', category: 'Outdoor services', note: 'Warm, grounded, practical', stamp: '02', layout: 'template-fieldwork', accent: '#D7FF3F' },
  { id: 'index', name: 'Index', category: 'Consultant', note: 'Clear thinking, in full view', stamp: '03', layout: 'template-index', accent: '#FF745E' },
  { id: 'goodday', name: 'Good Day', category: 'Wellness', note: 'Bright energy, easy rhythm', stamp: '04', layout: 'template-goodday', accent: '#FFC843' },
  { id: 'common', name: 'Common Ground', category: 'Neighborhood shop', note: 'Human, local, memorable', stamp: '05', layout: 'template-common', accent: '#A8E6CF' },
  { id: 'form', name: 'Form & Function', category: 'Architecture', note: 'Precise lines, bold scale', stamp: '06', layout: 'template-form', accent: '#B9A5FF' },
  // New templates for Phase 5
  { id: 'cafe', name: 'Café & Restaurant', category: 'Food & drink', note: 'Menu-first, warm hospitality', stamp: '07', layout: 'template-cafe', accent: '#8B5E3C' },
  { id: 'salon', name: 'Salon & Barber', category: 'Personal care', note: 'Clean, inviting, service-focused', stamp: '08', layout: 'template-salon', accent: '#D472A8' },
  { id: 'trainer', name: 'Personal Trainer', category: 'Fitness', note: 'Energetic, results-driven, motivating', stamp: '09', layout: 'template-trainer', accent: '#FF4757' },
  { id: 'photographer', name: 'Photographer', category: 'Creative', note: 'Gallery-first, visual storytelling', stamp: '10', layout: 'template-photographer', accent: '#1A1A2E' },
  { id: 'trades', name: 'Home Services & Trades', category: 'Services', note: 'Trust-building, practical, clear pricing', stamp: '11', layout: 'template-trades', accent: '#2E86AB' },
  { id: 'realtor', name: 'Real Estate Agent', category: 'Property', note: 'Listing-led, professional, local expertise', stamp: '12', layout: 'template-realtor', accent: '#007B5E' },
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
    cafe: { hero: ['Good food. Good company.', 'A warm place to gather, order, and linger a little longer.'], services: ['What\'s on the menu', 'Show your dishes, drinks, and daily specials.'], about: ['A little about us', 'Share your story, origins, and what drives the kitchen.'], gallery: ['A taste of the place', 'Show your space, plates, and people enjoying the meal.'] },
    salon: { hero: ['Modern care. Made personal.', 'Expert styling and treatments with a calm, welcoming space.'], services: ['What we offer', 'List cuts, colors, treatments, and the products you recommend.'], about: ['Your team', 'Introduce the stylists and the care they bring to each appointment.'], gallery: ['Recent work', 'Share finished looks with permission and a short note about the service.'] },
    trainer: { hero: ['Stronger. Steadier. Clearer.', 'Training programs that fit your life and support real progress.'], services: ['Programs that work', 'Outline personal training, group classes, and virtual options.'], about: ['Your coach', 'Share your background, approach, and the results your clients see.'], gallery: ['Progress in motion', 'Show training spaces, workouts, and results with permission.'] },
    photographer: { hero: ['Images that tell a story.', 'Portrait, event, and product photography with attention to light and moment.'], services: ['What I shoot', 'List specialties and the way you work with clients.'], about: ['My work', 'Share your point of view and the way you approach each project.'], gallery: ['Selected images', 'Show work you can share with context and permission.'] },
    trades: { hero: ['Solid work. Clear pricing.', 'Home services done right, on time, and with honest communication.'], services: ['What we do', 'List services, service areas, and how to get a quote.'], about: ['Why choose us', 'Share your approach, standards, and guarantees.'], gallery: ['Recent projects', 'Show completed work with permission and a short note.'] },
    realtor: { hero: ['Listings you can trust.', 'Local market expertise and clear guidance through every step.'], services: ['Buying, selling, renting', 'Outline your process and the support you provide.'], about: ['Your agent', 'Share your experience, neighborhood knowledge, and values.'], gallery: ['Featured listings', 'Show current homes with permission and a short description.'] },
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
        { id: 'cta', type: 'cta', visible: false, title: 'Ready to talk?', body: 'Tell us a little about your project and we will be in touch.' },
        { id: 'pricing', type: 'pricing', visible: false, title: 'Simple pricing', body: 'Clear rates and what is included.' },
        { id: 'hours', type: 'hours', visible: false, title: 'Hours & location', body: 'Where to find us and when we are open.' },
        { id: 'testimonials', type: 'testimonials', visible: false, title: 'What people say', body: 'Share permissioned testimonials from customers.' },
        { id: 'faq', type: 'faq', visible: false, title: 'A few good questions', body: 'Tell us what you are working on. We will talk through the next step together.' },
        { id: 'booking', type: 'booking', visible: false, title: 'Book a session', body: 'Link to your scheduling tool or add a contact note.' },
        { id: 'team', type: 'team', visible: false, title: 'Meet the team', body: 'Introduce the people behind the work.' },
        { id: 'contact', type: 'contact', visible: true, title: 'Have a good one in mind?', body: 'Tell us a little about it and we will be in touch.' },
        { id: 'footer', type: 'footer', visible: true, title: '', body: '© Your business. All rights reserved.' },
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
