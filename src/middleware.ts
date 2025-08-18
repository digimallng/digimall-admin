import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from 'next-auth/middleware';

// Function to check if setup is required
async function checkSetupRequired(baseUrl: string): Promise<boolean> {
  try {
    const response = await fetch(`${baseUrl}/api/setup/check`, {
      headers: { 'Cache-Control': 'no-cache' }
    });
    if (response.ok) {
      const data = await response.json();
      return data.setupRequired || false;
    }
  } catch (error) {
    console.error('Middleware setup check failed:', error);
  }
  // Default to setup required on error for safety
  return true;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Allow API routes, static files, and setup pages to pass through
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/setup') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Check if setup is required for all other routes
  const baseUrl = request.nextUrl.origin;
  const setupRequired = await checkSetupRequired(baseUrl);
  
  if (setupRequired) {
    // If setup is required, redirect to setup page
    console.log('Setup required, redirecting to /setup from middleware');
    return NextResponse.redirect(new URL('/setup', request.url));
  }

  // If setup is complete, use NextAuth middleware for authentication
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
