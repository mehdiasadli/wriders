import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { SessionProvider } from 'next-auth/react';
import { Toaster } from 'sonner';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL!),
  title: {
    default: 'Wriders - Platform for Writers and Readers',
    template: '%s | Wriders',
  },
  description:
    'Discover, read, and publish amazing stories, books, and chapters. Join a community of writers and readers passionate about storytelling.',
  keywords: [
    'writing platform',
    'online books',
    'stories',
    'chapters',
    'reading',
    'writers',
    'authors',
    'literature',
    'storytelling',
    'book publishing',
    'online reading',
    'creative writing',
  ],
  authors: [{ name: 'Wriders Team' }],
  creator: 'Wriders',
  publisher: 'Wriders',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: 'Wriders',
    title: 'Wriders - Platform for Writers and Readers',
    description:
      'Discover, read, and publish amazing stories, books, and chapters. Join a community of writers and readers passionate about storytelling.',
    images: [
      {
        url: '/wriders-og.png',
        width: 1200,
        height: 630,
        alt: 'Wriders - Platform for Writers and Readers',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Wriders - Platform for Writers and Readers',
    description:
      'Discover, read, and publish amazing stories, books, and chapters. Join a community of writers and readers passionate about storytelling.',
    images: ['/wriders-og.png'],
    creator: '@wriders',
    site: '@wriders',
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32', type: 'image/x-icon' },
      { url: '/icon1.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [{ url: '/apple-icon.png', sizes: '180x180', type: 'image/png' }],
    other: [
      {
        rel: 'mask-icon',
        url: '/icon0.svg',
        color: '#000000',
      },
    ],
  },
  // verification: {
  //   google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  //   yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION,
  //   other: {
  //     'msvalidate.01': process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION || '',
  //   },
  // },
  category: 'education',
  alternates: {
    canonical: process.env.NEXT_PUBLIC_APP_URL!,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <head>
        <meta name='apple-mobile-web-app-title' content='Wriders' />
        <link rel='sitemap' type='application/xml' href='/sitemap.xml' />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <SessionProvider>{children}</SessionProvider>
        <Toaster
          position='top-center'
          richColors={false}
          toastOptions={{
            style: {
              background: '#ffffff',
              border: '1px solid #e5e7eb',
              color: '#374151',
              fontSize: '14px',
              fontFamily: 'inherit',
            },
            className: 'toaster-toast',
          }}
        />
      </body>
    </html>
  );
}
