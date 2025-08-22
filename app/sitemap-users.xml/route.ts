import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL!;

  try {
    // Get active authors with published public books
    const users = await prisma.user.findMany({
      where: {
        booksAuthored: {
          some: {
            status: 'PUBLISHED',
            visibility: 'PUBLIC',
          },
        },
      },
      select: {
        slug: true,
        updatedAt: true,
        _count: {
          select: {
            booksAuthored: {
              where: {
                status: 'PUBLISHED',
                visibility: 'PUBLIC',
              },
            },
            comments: true,
          },
        },
      },
      orderBy: [
        { booksAuthored: { _count: 'desc' } }, // Prolific authors first
        { comments: { _count: 'desc' } }, // Then active commenters
        { updatedAt: 'desc' }, // Then recently updated
      ],
      take: 2000, // Reasonable limit for XML sitemap
    });

    const urls = users
      .map((user) => {
        const bookScore = user._count.booksAuthored * 0.1;
        const commentScore = user._count.comments * 0.01;
        const priority = Math.min(0.7, 0.4 + bookScore + commentScore);

        return `  <url>
    <loc>${baseUrl}/users/${user.slug}</loc>
    <lastmod>${user.updatedAt.toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
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
        'Cache-Control': 'public, max-age=7200, s-maxage=7200', // Cache for 2 hours (users change less frequently)
      },
    });
  } catch (error) {
    console.error('Error generating users sitemap:', error);

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
