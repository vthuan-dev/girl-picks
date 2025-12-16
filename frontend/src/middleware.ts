import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Public routes that don't require authentication
const publicRoutes = [
  '/',
  '/auth/login',
  '/auth/register',
  '/girls',
  '/phim-sex',
  '/anh-sex',
  '/chat-sex',
  '/posts',
  '/gai-goi',
  '/search',
];

// Admin routes - require ADMIN role
const adminRoutes = [
  '/admin',
  '/(admin)',
];

// Girl routes - require GIRL role
const girlRoutes = [
  '/girl',
  '/(girl)',
];

// Customer routes - require CUSTOMER, STAFF_UPLOAD, or GIRL role
const customerRoutes = [
  '/client',
  '/(client)',
  '/(customer)',
];

// Check if path matches any route pattern
function matchesRoute(pathname: string, routes: string[]): boolean {
  return routes.some(route => {
    if (route.startsWith('/')) {
      return pathname === route || pathname.startsWith(route + '/');
    }
    // Handle route groups like (admin)
    return pathname.includes(route);
  });
}

// Check if route is public
function isPublicRoute(pathname: string): boolean {
  // Check exact matches
  if (publicRoutes.includes(pathname)) {
    return true;
  }
  
  // Check if it's a public dynamic route
  if (pathname.startsWith('/girls/') || 
      pathname.startsWith('/posts/') || 
      pathname.startsWith('/gai-goi/') ||
      pathname.startsWith('/phim-sex') ||
      pathname.startsWith('/anh-sex') ||
      pathname.startsWith('/chat-sex') ||
      pathname.startsWith('/search')) {
    return true;
  }
  
  return false;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Legacy redirect: /girls/:id/:slug -> /girls/:slug
  const legacyGirlMatch = pathname.match(/^\/girls\/[^/]+\/([^/]+)\/?$/);
  if (legacyGirlMatch) {
    const slug = legacyGirlMatch[1];
    const url = request.nextUrl.clone();
    url.pathname = `/girls/${slug}`;
    return NextResponse.redirect(url, 301);
  }
  
  // Allow public routes
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }
  
  // Check for access token in cookies
  const accessToken = request.cookies.get('accessToken')?.value;
  
  // If no token and trying to access protected route, allow through
  // Client-side will handle redirect to login
  // This prevents server-side redirect loops
  if (!accessToken) {
    // Allow through - client-side auth will handle redirect
    return NextResponse.next();
  }
  
  // For protected routes, we let client-side handle role checking
  // Server-side can't easily read user role from token without decoding JWT
  // So we rely on client-side protection in layouts
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

