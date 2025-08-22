import { auth } from '@/lib/auth';

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;

  // Check if it's a bot/crawler (for social media metadata)
  const userAgent = req.headers.get('user-agent') || '';
  const isBot =
    /bot|crawler|spider|crawling|facebookexternalhit|twitterbot|whatsapp|telegram|linkedinbot|pinterest|slackbot|googlebot/i.test(
      userAgent
    );

  // Define public routes that don't require authentication
  const publicRoutes = [
    '/', // Homepage
    '/auth',
    '/api/auth',
    '/api/users/create',
    '/api/og', // OG image generation
    '/books', // Public book listings
    '/explore', // Public explore page
    '/wpm', // Public WPM test
  ];

  // Define public dynamic routes (for specific content)
  const publicDynamicRoutes = [
    /^\/books\/[^/]+$/, // Individual book pages: /books/[slug]
    /^\/books\/[^/]+\/chapters\/[^/]+$/, // Individual chapter pages: /books/[slug]/chapters/[slug]
    /^\/books\/[^/]+\/chapters\/[^/]+\/comments$/, // Chapter comments
    /^\/books\/[^/]+\/chapters\/[^/]+\/download$/, // Chapter downloads
    /^\/users\/[^/]+$/, // Public user profiles: /users/[slug]
    /^\/users\/[^/]+\/books$/, // User's public books
    /^\/users\/[^/]+\/comments$/, // User's public comments
  ];

  // Check if current path is public
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));
  const isPublicDynamicRoute = publicDynamicRoutes.some((pattern) => pattern.test(pathname));

  // Allow bots to access public content for metadata
  if (isBot && (isPublicRoute || isPublicDynamicRoute)) {
    return null;
  }

  // Allow all users to access public routes
  if (isPublicRoute || isPublicDynamicRoute) {
    return null;
  }

  // Require authentication for all other paths
  if (!isLoggedIn) {
    return Response.redirect(new URL('/auth/signin', req.nextUrl));
  }

  return null;
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
