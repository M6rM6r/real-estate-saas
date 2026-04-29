import './globals.css';
import 'photoswipe/style.css';
import type { Metadata, Viewport } from 'next';
import { Cairo } from 'next/font/google';
import { Toaster } from '@/components/ui/toaster';

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  display: 'swap',
  variable: '--font-cairo',
});

export const metadata: Metadata = {
  title: 'منصة Rew',
  description: 'منصة إحترافية لإدارة وعرض المنتجات\الخدمات',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'https://real-estate-saas--rewrew7.us-east4.hosted.app'),
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className={cairo.className}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
