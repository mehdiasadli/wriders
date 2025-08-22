interface BookStructuredDataProps {
  book: {
    title: string;
    synopsis: string | null;
    slug: string;
    publishedAt: Date | null;
    author: {
      name: string;
      slug: string;
    };
    _count: {
      chapters: number;
      followers: number;
      favoritedBy: number;
    };
  };
  totalReads: number;
  totalComments: number;
}

interface ChapterStructuredDataProps {
  chapter: {
    title: string;
    synopsis: string | null;
    order: number;
    publishedAt: Date | null;
    content: string;
    book: {
      title: string;
      slug: string;
      author: {
        name: string;
        slug: string;
      };
    };
    _count: {
      reads: number;
      comments: number;
    };
  };
  bookSlug: string;
  chapterSlug: string;
  wordCount: number;
  readingTime: number;
}

export function BookStructuredData({ book, totalReads, totalComments }: BookStructuredDataProps) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Book',
    name: book.title,
    description: book.synopsis || `${book.title} by ${book.author.name} on Wriders`,
    author: {
      '@type': 'Person',
      name: book.author.name,
      url: `${process.env.NEXT_PUBLIC_APP_URL!}/users/${book.author.slug}`,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Wriders',
      url: process.env.NEXT_PUBLIC_APP_URL!,
    },
    url: `${process.env.NEXT_PUBLIC_APP_URL!}/books/${book.slug}`,
    datePublished: book.publishedAt?.toISOString(),
    inLanguage: 'en',
    genre: 'Fiction',
    bookFormat: 'EBook',
    isAccessibleForFree: true,
    numberOfPages: book._count.chapters,
    aggregateRating:
      book._count.favoritedBy > 0
        ? {
            '@type': 'AggregateRating',
            ratingValue: Math.min(5, Math.max(1, (book._count.favoritedBy / Math.max(totalReads, 1)) * 5)),
            reviewCount: totalComments,
            bestRating: 5,
            worstRating: 1,
          }
        : undefined,
    interactionStatistic: [
      {
        '@type': 'InteractionCounter',
        interactionType: 'https://schema.org/ReadAction',
        userInteractionCount: totalReads,
      },
      {
        '@type': 'InteractionCounter',
        interactionType: 'https://schema.org/CommentAction',
        userInteractionCount: totalComments,
      },
      {
        '@type': 'InteractionCounter',
        interactionType: 'https://schema.org/LikeAction',
        userInteractionCount: book._count.favoritedBy,
      },
    ],
  };

  return <script type='application/ld+json' dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />;
}

export function ChapterStructuredData({
  chapter,
  bookSlug,
  chapterSlug,
  wordCount,
  readingTime,
}: ChapterStructuredDataProps) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: chapter.title,
    description: chapter.synopsis || `Chapter ${chapter.order} of ${chapter.book.title} by ${chapter.book.author.name}`,
    author: {
      '@type': 'Person',
      name: chapter.book.author.name,
      url: `${process.env.NEXT_PUBLIC_APP_URL!}/users/${chapter.book.author.slug}`,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Wriders',
      url: process.env.NEXT_PUBLIC_APP_URL!,
      logo: {
        '@type': 'ImageObject',
        url: `${process.env.NEXT_PUBLIC_APP_URL!}/wriders-og.png`,
      },
    },
    url: `${process.env.NEXT_PUBLIC_APP_URL!}/books/${bookSlug}/chapters/${chapterSlug}`,
    datePublished: chapter.publishedAt?.toISOString(),
    inLanguage: 'en',
    articleSection: 'Chapters',
    wordCount: wordCount,
    timeRequired: `PT${readingTime}M`,
    isAccessibleForFree: true,
    isPartOf: {
      '@type': 'Book',
      name: chapter.book.title,
      url: `${process.env.NEXT_PUBLIC_APP_URL!}/books/${bookSlug}`,
      author: {
        '@type': 'Person',
        name: chapter.book.author.name,
      },
    },
    position: chapter.order,
    interactionStatistic: [
      {
        '@type': 'InteractionCounter',
        interactionType: 'https://schema.org/ReadAction',
        userInteractionCount: chapter._count.reads,
      },
      {
        '@type': 'InteractionCounter',
        interactionType: 'https://schema.org/CommentAction',
        userInteractionCount: chapter._count.comments,
      },
    ],
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${process.env.NEXT_PUBLIC_APP_URL!}/books/${bookSlug}/chapters/${chapterSlug}`,
    },
  };

  return <script type='application/ld+json' dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />;
}
