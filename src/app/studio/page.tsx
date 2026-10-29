import type { Metadata } from 'next';
export const metadata: Metadata = { robots: { index: false, follow: false } };
import Studio from '@/components/studio';
import './studio.css';

export default function StudioPage() { return <div className="studio-root"><Studio /></div>; }
