import type { Metadata } from 'next';
import './globals.css';
import './marketing.css';
import ProductAnalytics from '@/components/product-analytics';

export const metadata: Metadata = {
  metadataBase: new URL('https://auvrantis-create.vercel.app'),
  title: 'Auvrantis Create — AI website builder, priced by the word',
  description: 'Describe your business and AI writes every section inside a design made by people. No subscription: pay only for the words it writes, with the price shown before every run.',
  openGraph: { title: 'Auvrantis Create — AI website builder, priced by the word', description: 'AI writes your site inside a hand-built design. No subscription; failed runs are free.', type: 'website', images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'Auvrantis Create — a website that sounds like your business, priced by the word' }] },
  twitter: { card: 'summary_large_image', title: 'Auvrantis Create — AI website builder, priced by the word', description: 'AI writes your site inside a hand-built design. No subscription; failed runs are free.', images: ['/opengraph-image'] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}{process.env.NEXT_PUBLIC_AUVRANTIS_ANALYTICS === 'true' && <ProductAnalytics />}</body></html>;
}
