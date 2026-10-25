import type { Metadata } from 'next';
import './globals.css';
import ProductAnalytics from '@/components/product-analytics';

export const metadata: Metadata = {
  metadataBase: new URL('https://auvrantis-create.vercel.app'),
  title: 'Auvrantis Create — Website Builder',
  description: 'Build a bold website. Make it yours.',
  openGraph: { title: 'Auvrantis Create — Website Builder', description: 'Six hand-built starting designs. One website shaped by you.', type: 'website', images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'Auvrantis Create — Website Builder' }] },
  twitter: { card: 'summary_large_image', title: 'Auvrantis Create — Website Builder', description: 'Six hand-built starting designs. One website shaped by you.', images: ['/opengraph-image'] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}{process.env.NEXT_PUBLIC_AUVRANTIS_ANALYTICS === 'true' && <ProductAnalytics />}</body></html>;
}
