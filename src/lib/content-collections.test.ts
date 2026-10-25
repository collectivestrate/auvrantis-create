import { describe, expect, it } from 'vitest';
import { createCollectionItem, reorderCollection } from './content-collections';

describe('content collections', () => {
  it('creates safe draft items for each collection type', () => {
    expect(createCollectionItem('services').title).toBe('New service');
    expect(createCollectionItem('posts', ' Launch note ').title).toBe('Launch note');
  });
  it('reorders without mutating the source', () => {
    const items = [createCollectionItem('faqs', 'A'), createCollectionItem('faqs', 'B')]; const next = reorderCollection(items, items[1].id, -1);
    expect(next.map((item) => item.title)).toEqual(['B', 'A']); expect(items.map((item) => item.title)).toEqual(['A', 'B']);
  });
});
