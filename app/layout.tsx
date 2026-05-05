import './globals.css';
import 'photoswipe/style.css';
import type { Metadata, Viewport } from 'next';
import { Cairo, Inter } from 'next/font/google';
import { Toaster } from '@/components/ui/toaster';

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  display: 'swap',
  variable: '--font-cairo',
  weight: ['300', '400', '500', '600', '700', '800'],
});

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  weight: ['300', '400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: 'منصة Rew',
  description: 'المنصة الاحترافية لإدارة صفحات الأعمال الحديثة.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'https://real-estate-saas--rewrew7.us-east4.hosted.app'),
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: [{ url: '/apple-touch-icon.png' }],
    other: [{ rel: 'manifest', url: '/site.webmanifest' }],
  },
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
      <body className={`${inter.variable} ${cairo.variable} font-sans`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
