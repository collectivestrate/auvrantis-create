import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Auvrantis Create — Website Builder',
  description: 'Build a bold website. Make it yours.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
