import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL!;

  try {
    // Get popular published chapters from public books
    const chapters = await prisma.chapter.findMany({
      where: {
        status: 'PUBLISHED',
        book: {
          visibility: 'PUBLIC',
          status: 'PUBLISHED',
        },
      },
      select: {
        slug: true,
        updatedAt: true,
        publishedAt: true,
        book: {
          select: {
            slug: true,
          },
        },
        _count: {
          select: {
            reads: true,
            comments: true,
            favoritedBy: true,
          },
        },
      },
      orderBy: [
        { reads: { _count: 'desc' } }, // Popular chapters first
        { comments: { _count: 'desc' } }, // Then discussed
        { favoritedBy: { _count: 'desc' } }, // Then favorited
        { publishedAt: 'desc' }, // Then recent
      ],
      take: 10000, // Reasonable limit for XML sitemap
    });

    const urls = chapters
      .map((chapter) => {
        const readScore = chapter._count.reads * 0.005;
        const commentScore = chapter._count.comments * 0.01;
        const favoriteScore = chapter._count.favoritedBy * 0.02;
        const priority = Math.min(0.8, 0.5 + readScore + commentScore + favoriteScore);

        return `  <url>
    <loc>${baseUrl}/books/${chapter.book.slug}/chapters/${chapter.slug}</loc>
    <lastmod>${chapter.updatedAt.toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
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
    console.error('Error generating chapters sitemap:', error);

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
