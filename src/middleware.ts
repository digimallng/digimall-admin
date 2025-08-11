import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
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
        // Allow access to auth pages without token
        if (req.nextUrl.pathname.startsWith('/auth')) {
          return true;
        }

        // Require token for all other pages
        return !!token;
      },
    },
  }
);

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
