import type { MetadataRoute } from 'next';
import { lessons } from '@/lib/learn-content';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://auvrantis-create.vercel.app';
  const paths = ['/', '/learn', ...lessons.map((lesson) => `/learn/${lesson.slug}`), '/guide', '/privacy'];
  return paths.map((path) => ({ url: `${base}${path}`, lastModified: new Date() }));
}
