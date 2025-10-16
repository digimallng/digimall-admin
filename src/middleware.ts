import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from 'next-auth/middleware';

// Check if setup is required using environment variable
// This avoids fetch calls in Edge Runtime which can fail in production
function isSetupRequired(): boolean {
  // If SETUP_COMPLETED is explicitly set to 'true', setup is not required
  if (process.env.SETUP_COMPLETED === 'true') {
    return false;
  }
  
  // If SETUP_REQUIRED is explicitly set to 'true', setup is required
  if (process.env.SETUP_REQUIRED === 'true') {
    return true;
  }
  
  // Default: In production and development, assume setup is NOT required
  // This allows normal operation unless explicitly configured otherwise
  // The /api/setup/check endpoint will verify with backend if needed
  return false;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Allow API routes, static files, setup pages, and test pages to pass through
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/setup') ||
    pathname.startsWith('/api-test') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Check if setup is required for all other routes
  const setupRequired = isSetupRequired();
  
  if (setupRequired) {
    // If setup is required, redirect to setup page
    console.log('Setup required, redirecting to /setup from middleware');
    return NextResponse.redirect(new URL('/setup', request.url));
  }

  // If setup is complete, use NextAuth middleware for authentication
  // @ts-ignore - withAuth types can be inconsistent
  return withAuth(
    function middleware(req) {
      const token = req.nextauth.token;
      const isAuth = !!token;
      const isAuthPage = req.nextUrl.pathname.startsWith('/auth');

      // If user is authenticated and trying to access auth pages, redirect to dashboard
      if (isAuthPage && isAuth) {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }

      // If user is not authenticated and trying to access protected pages, redirect to login
      if (!isAuthPage && !isAuth) {
        let from = req.nextUrl.pathname;
        if (req.nextUrl.search) {
          from += req.nextUrl.search;
        }

        return NextResponse.redirect(
          new URL(`/auth/login?callbackUrl=${encodeURIComponent(from)}`, req.url)
        );
      }

      // Check role-based access
      if (isAuth && token) {
        const userRole = token.role as string;

        // Only allow admin and super_admin roles
        if (userRole !== 'admin' && userRole !== 'super_admin') {
          return NextResponse.redirect(new URL('/auth/error?error=AccessDenied', req.url));
        }

        // Super Admin only routes
        const superAdminRoutes = ['/settings', '/security', '/system'];
        const isSuperAdminRoute = superAdminRoutes.some(route =>
          req.nextUrl.pathname.startsWith(route)
        );

        if (isSuperAdminRoute && userRole !== 'super_admin') {
          return NextResponse.redirect(new URL('/dashboard', req.url));
        }
      }

      return NextResponse.next();
    },
    {
      callbacks: {
        authorized: ({ token, req }) => {
          // Allow access to auth and setup pages without token
          if (req.nextUrl.pathname.startsWith('/auth') || 
              req.nextUrl.pathname.startsWith('/setup')) {
            return true;
          }

          // Require token for all other pages
          return !!token;
        },
      },
    }
  )(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
