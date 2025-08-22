import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL!;

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/auth/signin',
          '/auth/signup',
          '/auth/signout',
          '/auth/verify/',
          '/settings',
          '*/edit',
          '*/create',
          '*/delete',
        ],
      },
      {
        userAgent: ['GPTBot', 'ChatGPT-User', 'CCBot', 'anthropic-ai', 'Claude-Web'],
        disallow: '/',
      },
    ],
    sitemap: [
      `${baseUrl}/sitemap.xml`,
      `${baseUrl}/sitemap-index.xml`,
      `${baseUrl}/sitemap-static.xml`,
      `${baseUrl}/sitemap-books.xml`,
      `${baseUrl}/sitemap-chapters.xml`,
      `${baseUrl}/sitemap-users.xml`,
    ],
    host: baseUrl,
  };
}
