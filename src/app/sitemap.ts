import type { MetadataRoute } from 'next';
import { lessons } from '@/lib/learn-content';
import { proCourses } from '@/lib/learn-pro';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://auvrantis-create.vercel.app';
  const paths = [
    '/',
    '/learn',
    ...lessons.map((lesson) => `/learn/${lesson.slug}`),
    '/learn/pro',
    ...proCourses.flatMap((course) => [`/learn/pro/${course.slug}`, ...course.lessons.map((lesson) => `/learn/pro/${course.slug}/${lesson.slug}`)]),
    '/guide',
    '/privacy',
  ];
  return paths.map((path) => ({ url: `${base}${path}`, lastModified: new Date() }));
}
