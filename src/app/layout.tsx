import type { Metadata } from 'next';
import './globals.css';
import './marketing.css';
import ProductAnalytics from '@/components/product-analytics';

export const metadata: Metadata = {
  metadataBase: new URL('https://auvrantis-create.vercel.app'),
  title: 'Auvrantis Create — Website Builder',
  description: 'Build a website and learn how it works. Pick a design, add your city and business, and see the code behind it.',
  openGraph: { title: 'Auvrantis Create — Website Builder', description: 'Build a website and learn how it works. Twelve designs, step-by-step lessons.', type: 'website', images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'Auvrantis Create — Website Builder' }] },
  twitter: { card: 'summary_large_image', title: 'Auvrantis Create — Website Builder', description: 'Build a website and learn how it works. Twelve designs, step-by-step lessons.', images: ['/opengraph-image'] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}{process.env.NEXT_PUBLIC_AUVRANTIS_ANALYTICS === 'true' && <ProductAnalytics />}</body></html>;
}
