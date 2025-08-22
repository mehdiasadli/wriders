import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL!;

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/books`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/explore`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/wpm`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ];

  // Get popular books (published and public)
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
        },
      },
    },
    orderBy: [
      { followers: { _count: 'desc' } }, // Popular books first
      { publishedAt: 'desc' }, // Then recent
    ],
    take: 1000, // Limit for performance
  });

  const bookPages: MetadataRoute.Sitemap = books.map((book) => ({
    url: `${baseUrl}/books/${book.slug}`,
    lastModified: book.updatedAt,
    changeFrequency: book._count.chapters > 0 ? 'weekly' : ('monthly' as const),
    priority: Math.min(0.9, 0.7 + book._count.followers * 0.01), // Higher priority for popular books
  }));

  // Get popular chapters (published, from public books)
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
        },
      },
    },
    orderBy: [
      { reads: { _count: 'desc' } }, // Popular chapters first
      { publishedAt: 'desc' }, // Then recent
    ],
    take: 2000, // Limit for performance
  });

  const chapterPages: MetadataRoute.Sitemap = chapters.map((chapter) => ({
    url: `${baseUrl}/books/${chapter.book.slug}/chapters/${chapter.slug}`,
    lastModified: chapter.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: Math.min(0.8, 0.6 + chapter._count.reads * 0.005), // Higher priority for popular chapters
  }));

  // Get active user profiles (authors with published books)
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
          booksAuthored: true,
        },
      },
    },
    orderBy: {
      booksAuthored: { _count: 'desc' },
    },
    take: 500, // Limit for performance
  });

  const userPages: MetadataRoute.Sitemap = users.map((user) => ({
    url: `${baseUrl}/users/${user.slug}`,
    lastModified: user.updatedAt,
    changeFrequency: 'monthly' as const,
    priority: Math.min(0.7, 0.5 + user._count.booksAuthored * 0.1), // Higher priority for prolific authors
  }));

  return [...staticPages, ...bookPages, ...chapterPages, ...userPages];
}
