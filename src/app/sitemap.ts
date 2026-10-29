import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://auvrantis-create.vercel.app';
  return ['/', '/learn', '/guide', '/privacy'].map((path) => ({ url: `${base}${path}`, lastModified: new Date() }));
}
