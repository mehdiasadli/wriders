/**
 * Utility functions for sitemap generation
 */

export interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

/**
 * Generate XML sitemap from URLs
 */
export function generateSitemapXML(urls: SitemapUrl[]): string {
  const urlEntries = urls
    .map((url) => {
      let entry = `  <url>\n    <loc>${url.loc}</loc>`;

      if (url.lastmod) {
        entry += `\n    <lastmod>${url.lastmod}</lastmod>`;
      }

      if (url.changefreq) {
        entry += `\n    <changefreq>${url.changefreq}</changefreq>`;
      }

      if (url.priority !== undefined) {
        entry += `\n    <priority>${url.priority.toFixed(2)}</priority>`;
      }

      entry += '\n  </url>';
      return entry;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;
}

/**
 * Calculate priority based on popularity metrics
 */
export function calculatePriority(
  baseScore: number,
  metrics: {
    reads?: number;
    comments?: number;
    favorites?: number;
    followers?: number;
  },
  weights: {
    reads?: number;
    comments?: number;
    favorites?: number;
    followers?: number;
  } = {}
): number {
  const { reads = 0.001, comments = 0.01, favorites = 0.02, followers = 0.05 } = weights;

  const popularityScore =
    (metrics.reads || 0) * reads +
    (metrics.comments || 0) * comments +
    (metrics.favorites || 0) * favorites +
    (metrics.followers || 0) * followers;

  return Math.min(1.0, Math.max(0.1, baseScore + popularityScore));
}

/**
 * Get cache headers for sitemap responses
 */
export function getSitemapCacheHeaders(maxAge: number = 3600) {
  return {
    'Content-Type': 'application/xml',
    'Cache-Control': `public, max-age=${maxAge}, s-maxage=${maxAge}`,
  };
}

/**
 * Handle sitemap errors gracefully
 */
export function handleSitemapError(error: unknown, routeName: string): string {
  console.error(`Error generating ${routeName} sitemap:`, error);

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
</urlset>`;
}
