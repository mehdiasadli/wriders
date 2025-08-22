import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL!;

  try {
    // Get popular published books
    const books = await prisma.book.findMany({
      where: {
        visibility: 'PUBLIC',
        status: 'PUBLISHED',
      },
      select: {
        slug: true,
        updatedAt: true,
        publishedAt: true,
        _count: {
          select: {
            followers: true,
            chapters: true,
            favoritedBy: true,
          },
        },
      },
      orderBy: [
        { followers: { _count: 'desc' } }, // Popular books first
        { favoritedBy: { _count: 'desc' } }, // Then favorited
        { publishedAt: 'desc' }, // Then recent
      ],
      take: 5000, // Reasonable limit for XML sitemap
    });

    const urls = books
      .map((book) => {
        const priority = Math.min(0.9, 0.7 + book._count.followers * 0.01 + book._count.favoritedBy * 0.005);
        const changefreq = book._count.chapters > 0 ? 'weekly' : 'monthly';

        return `  <url>
    <loc>${baseUrl}/books/${book.slug}</loc>
    <lastmod>${book.updatedAt.toISOString()}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority.toFixed(2)}</priority>
  </url>`;
      })
      .join('\n');

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

    return new NextResponse(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600', // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error('Error generating books sitemap:', error);

    // Return empty sitemap on error
    const emptySitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
</urlset>`;

    return new NextResponse(emptySitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=300, s-maxage=300', // Cache for 5 minutes on error
      },
    });
  }
}
