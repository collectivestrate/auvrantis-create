import type { Metadata } from 'next';
export const metadata: Metadata = { robots: { index: false, follow: false } };
import Studio from '@/components/studio';

export default function StudioPage() { return <Studio />; }
