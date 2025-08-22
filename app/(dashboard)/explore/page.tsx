import { getCurrentUser } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { ContentStatus, BookVisibility, Prisma } from '@prisma/client';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Explore - Discover New Stories and Authors',
  description:
    'Explore a diverse collection of books, stories, and talented writers. Find your next great read and discover emerging authors on Wriders.',
  keywords: [
    'explore books',
    'discover authors',
    'new stories',
    'book search',
    'writer discovery',
    'reading community',
  ],
  openGraph: {
    title: 'Explore - Discover New Stories and Authors | Wriders',
    description:
      'Explore a diverse collection of books, stories, and talented writers. Find your next great read and discover emerging authors on Wriders.',
    url: `${process.env.NEXT_PUBLIC_APP_URL!}/explore`,
    type: 'website',
  },
  twitter: {
    title: 'Explore - Discover New Stories and Authors | Wriders',
    description:
      'Explore a diverse collection of books, stories, and talented writers. Find your next great read and discover emerging authors on Wriders.',
  },
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_APP_URL!}/explore`,
  },
};

interface ExplorePageProps {
  searchParams: Promise<{ search?: string }>;
}

type ResourceType = 'book' | 'user' | 'chapter';

interface ExploreItem {
  id: string;
  type: ResourceType;
  title: string;
  subtitle?: string;
  description?: string;
  href: string;
  metadata?: string;
  status?: string;
  visibility?: string;
}

// Utility function to shuffle array
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default async function ExplorePage({ searchParams }: ExplorePageProps) {
  const user = await getCurrentUser();
  const userId = user?.id;
  const { search } = await searchParams;
  const query = search?.trim();

  const results = await prisma.$transaction(async (tx) => {
    // Optimized Books Query
    const bookVisibilityWhere = userId
      ? {
          OR: [
            { authorId: userId },
            {
              status: { in: [ContentStatus.SOON, ContentStatus.PUBLISHED] },
              visibility: BookVisibility.PUBLIC,
            },
            {
              status: { in: [ContentStatus.SOON, ContentStatus.PUBLISHED] },
              visibility: BookVisibility.PRIVATE,
              followers: { some: { userId } },
            },
          ],
        }
      : {
          status: { in: [ContentStatus.SOON, ContentStatus.PUBLISHED] },
          visibility: BookVisibility.PUBLIC,
        };

    const books = await tx.book.findMany({
      take: query ? 10 : 3,
      where: {
        AND: [
          bookVisibilityWhere,
          ...(query
            ? [
                {
                  OR: [
                    { title: { contains: query, mode: Prisma.QueryMode.insensitive } },
                    { synopsis: { contains: query, mode: Prisma.QueryMode.insensitive } },
                    { author: { name: { contains: query, mode: Prisma.QueryMode.insensitive } } },
                  ],
                },
              ]
            : []),
        ],
      },
      select: {
        id: true,
        slug: true,
        title: true,
        synopsis: true,
        status: true,
        visibility: true,
        publishedAt: true,
        author: {
          select: {
            name: true,
            slug: true,
          },
        },
        _count: {
          select: { chapters: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Optimized Users Query
    const users = await tx.user.findMany({
      take: query ? 10 : 3,
      where: query
        ? {
            name: { contains: query, mode: Prisma.QueryMode.insensitive },
          }
        : {},
      select: {
        id: true,
        slug: true,
        name: true,
        roles: true,
        createdAt: true,
        _count: {
          select: {
            booksAuthored: true,
            comments: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Optimized Chapters Query
    const chapters = await tx.chapter.findMany({
      take: query ? 10 : 3,
      where: {
        AND: [
          { status: ContentStatus.PUBLISHED },
          {
            book: userId
              ? {
                  OR: [
                    { authorId: userId },
                    {
                      status: { in: [ContentStatus.SOON, ContentStatus.PUBLISHED] },
                      visibility: BookVisibility.PUBLIC,
                    },
                    {
                      status: { in: [ContentStatus.SOON, ContentStatus.PUBLISHED] },
                      visibility: BookVisibility.PRIVATE,
                      followers: { some: { userId } },
                    },
                  ],
                }
              : {
                  status: { in: [ContentStatus.SOON, ContentStatus.PUBLISHED] },
                  visibility: BookVisibility.PUBLIC,
                },
          },
          ...(query
            ? [
                {
                  OR: [
                    { title: { contains: query, mode: Prisma.QueryMode.insensitive } },
                    { synopsis: { contains: query, mode: Prisma.QueryMode.insensitive } },
                  ],
                },
              ]
            : []),
        ],
      },
      select: {
        id: true,
        slug: true,
        title: true,
        synopsis: true,
        status: true,
        order: true,
        publishedAt: true,
        book: {
          select: {
            title: true,
            slug: true,
            author: {
              select: {
                name: true,
                slug: true,
              },
            },
          },
        },
        _count: {
          select: { comments: true },
        },
      },
      orderBy: { publishedAt: 'desc' },
    });

    return { books, users, chapters };
  });

  // Transform all results into unified format
  const allItems: ExploreItem[] = [
    ...results.books.map(
      (book): ExploreItem => ({
        id: book.id,
        type: 'book',
        title: book.title,
        subtitle: book.author.name,
        description: book.synopsis || undefined,
        href: `/books/${book.slug}`,
        metadata: `${book._count.chapters} chapters`,
        status: book.status,
        visibility: book.visibility,
      })
    ),
    ...results.users.map(
      (user): ExploreItem => ({
        id: user.id,
        type: 'user',
        title: user.name,
        subtitle: user.roles.includes('AUTHOR') ? 'Author' : 'Reader',
        href: `/users/${user.slug}`,
        metadata: `${user._count.booksAuthored} books • ${user._count.comments} comments`,
      })
    ),
    ...results.chapters.map(
      (chapter): ExploreItem => ({
        id: chapter.id,
        type: 'chapter',
        title: chapter.title,
        subtitle: `${chapter.book.title} by ${chapter.book.author.name}`,
        description: chapter.synopsis || undefined,
        href: `/books/${chapter.book.slug}/chapters/${chapter.slug}`,
        metadata: `Chapter ${chapter.order} • ${chapter._count.comments} comments`,
      })
    ),
  ];

  // Shuffle the combined results to avoid grouping by type
  const shuffledItems = shuffleArray(allItems);

  const totalResults = shuffledItems.length;

  return (
    <div className='min-h-screen bg-white'>
      <div className='max-w-6xl mx-auto px-4 py-8'>
        {/* Search Form - keeping as requested */}
        <form className='max-w-2xl mx-auto'>
          <div className='mb-6'>
            <input
              type='text'
              placeholder='Search books, users or chapters...'
              className='w-full px-4 py-3 text-sm border border-gray-200 rounded-none focus:outline-none focus:border-gray-400 bg-white'
              defaultValue={search}
              name='search'
            />
          </div>

          <div className='text-center mt-6'>
            <button
              type='submit'
              className='text-sm text-gray-600 hover:text-gray-900 transition-colors border-b border-gray-200 hover:border-gray-400 pb-1'
            >
              Search
            </button>
          </div>
        </form>

        {/* Results Section */}
        <div className='mt-12'>
          {query ? (
            <div className='mb-8'>
              <h2 className='text-3xl font-serif text-gray-900 mb-2'>Search Results</h2>
              <p className='text-sm text-gray-600'>
                Found {totalResults} results for &quot;{query}&quot;
              </p>
            </div>
          ) : (
            <div className='mb-8 text-center'>
              <h2 className='text-3xl font-serif text-gray-900 mb-2'>Explore</h2>
              <p className='text-sm text-gray-600'>Discover books, authors, chapters, and more</p>
            </div>
          )}

          {shuffledItems.length === 0 ? (
            <div className='text-center py-12'>
              <p className='text-gray-500'>
                {query ? 'No results found for your search.' : 'No content available to explore.'}
              </p>
            </div>
          ) : (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {shuffledItems.map((item) => (
                <ExploreCard key={`${item.type}-${item.id}`} item={item} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ExploreCard({ item }: { item: ExploreItem }) {
  const typeConfig = {
    book: { label: 'Book' },
    user: { label: item.subtitle === 'Author' ? 'Author' : 'Reader' },
    chapter: { label: 'Chapter' },
  };

  const config = typeConfig[item.type];

  return (
    <Link href={item.href}>
      <article className='border border-gray-200 hover:border-gray-400 transition-colors p-6 bg-white h-full flex flex-col group'>
        <div className='flex items-start justify-between mb-4'>
          <span className='text-xs text-gray-700 bg-white border border-gray-300 px-2 py-1'>{config.label}</span>
          {item.status && (
            <span className='text-xs text-gray-500 border border-gray-300 px-2 py-1 bg-white'>{item.status}</span>
          )}
        </div>

        <div className='flex-1'>
          <h3 className='text-lg font-serif text-gray-900 mb-3 group-hover:text-gray-700 transition-colors'>
            {item.title}
          </h3>

          {item.subtitle && <p className='text-sm text-gray-600 mb-3'>{item.subtitle}</p>}

          {item.description && <p className='text-sm text-gray-500 leading-relaxed'>{item.description}</p>}
        </div>

        {item.metadata && (
          <div className='mt-6 pt-4 border-t border-gray-100'>
            <p className='text-xs text-gray-500'>{item.metadata}</p>
          </div>
        )}
      </article>
    </Link>
  );
}
