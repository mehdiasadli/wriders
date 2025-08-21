import { auth } from '@/lib/auth';

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isAuthPage = req.nextUrl.pathname.startsWith('/auth');
  const isApiAuthRoute = req.nextUrl.pathname.startsWith('/api/auth');
  const isPublicApiRoute = req.nextUrl.pathname === '/api/users/create';

  // Allow access to auth pages, API auth routes, and public API routes without authentication
  if (isAuthPage || isApiAuthRoute || isPublicApiRoute) {
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
