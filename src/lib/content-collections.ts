export type CollectionKind = 'services' | 'posts' | 'faqs' | 'testimonials' | 'team' | 'events' | 'gallery';
export type CollectionItem = { id: string; title: string; summary: string; published: boolean; updatedAt: string };

export function createCollectionItem(kind: CollectionKind, title = ''): CollectionItem {
  const labels: Record<CollectionKind, string> = { services: 'New service', posts: 'New post', faqs: 'New question', testimonials: 'New story', team: 'New team member', events: 'New event', gallery: 'New project' };
  return { id: `${kind}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`, title: title.trim() || labels[kind], summary: '', published: false, updatedAt: new Date().toISOString() };
}

export function reorderCollection(items: CollectionItem[], id: string, direction: -1 | 1): CollectionItem[] {
  const index = items.findIndex((item) => item.id === id); const next = index + direction;
  if (index < 0 || next < 0 || next >= items.length) return items;
  const copy = [...items]; [copy[index], copy[next]] = [copy[next], copy[index]]; return copy;
}
