// Designs shown on the marketing home page. Kept separate from the Studio's
// template engine so the marketing site never depends on its internals.
// When you add or remove a design in the Studio, update this list too: the
// count shown on the page comes from it.
export type MarketingDesign = { id: string; name: string; note: string; accent: string };

export const marketingDesigns: MarketingDesign[] = [
  { id: 'atelier', name: 'Atelier', note: 'Quietly confident, image-led', accent: '#2448FF' },
  { id: 'fieldwork', name: 'Fieldwork', note: 'Warm, grounded, practical', accent: '#D7FF3F' },
  { id: 'index', name: 'Index', note: 'Clear thinking, in full view', accent: '#FF745E' },
  { id: 'goodday', name: 'Good Day', note: 'Bright energy, easy rhythm', accent: '#FFC843' },
  { id: 'common', name: 'Common Ground', note: 'Human, local, memorable', accent: '#A8E6CF' },
  { id: 'form', name: 'Form & Function', note: 'Precise lines, bold scale', accent: '#B9A5FF' },
  { id: 'cafe', name: 'Café & Restaurant', note: 'Menu-first, warm hospitality', accent: '#8B5E3C' },
  { id: 'salon', name: 'Salon & Barber', note: 'Clean, inviting, service-focused', accent: '#D472A8' },
  { id: 'trainer', name: 'Personal Trainer', note: 'Energetic, results-driven', accent: '#FF4757' },
  { id: 'photographer', name: 'Photographer', note: 'Gallery-first, visual storytelling', accent: '#1A1A2E' },
  { id: 'trades', name: 'Home Services & Trades', note: 'Trust-building, clear pricing', accent: '#2E86AB' },
  { id: 'realtor', name: 'Real Estate Agent', note: 'Listing-led, local expertise', accent: '#007B5E' },
];
