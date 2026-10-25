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
        { id: 'hero', type: 'hero', visible: true, title: 'Make room for good work.', body: 'Thoughtful design for good ideas, from first sketch to final detail.' },
        { id: 'services', type: 'services', visible: true, title: 'What we make possible', body: 'A clear point of view. A useful plan. Beautiful work that does its job.' },
        { id: 'about', type: 'about', visible: true, title: 'Small studio. Big attention.', body: 'We partner closely with good people to shape ideas into something real.' },
        { id: 'gallery', type: 'gallery', visible: true, title: 'Selected work', body: 'A small collection of the things we are proud to put into the world.' },
        { id: 'faq', type: 'faq', visible: false, title: 'A few good questions', body: 'Tell us what you are working on. We will talk through the next step together.' },
        { id: 'contact', type: 'contact', visible: true, title: 'Have a good one in mind?', body: 'Tell us a little about it and we will be in touch.' },
      ],
    },
  };
}

export function personalizeDraft(draft: Draft, answers: Draft['business']): Draft {
  const name = answers.name.trim() || 'Your studio';
  const service = answers.service.trim() || 'Thoughtful work, made with care.';
  return {
    ...draft,
    business: answers,
    site: {
      ...draft.site,
      title: name,
      description: `${service} ${answers.location ? `in ${answers.location}.` : ''}`.trim(),
      contactEmail: answers.email.trim(),
      sections: draft.site.sections.map((section) => section.id === 'hero'
        ? { ...section, body: `${service}${answers.audience ? `, for ${answers.audience.toLowerCase()}.` : '.'}` }
        : section),
    },
  };
}
