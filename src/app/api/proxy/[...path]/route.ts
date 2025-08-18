import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Admin service base URL - environment aware
const getAdminServiceUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    return 'https://admin.digimall.ng/api/v1';
  }
  return process.env.ADMIN_SERVICE_URL 
    ? `${process.env.ADMIN_SERVICE_URL}/api/v1`
    : 'http://localhost:4800/api/v1';
};

// All routes go to admin service now - admin service handles all admin operations
const ADMIN_SERVICE_URL = getAdminServiceUrl();

// Special routes that need different handling
const SPECIAL_ROUTES = {
  // Chat service - direct connection for WebSocket compatibility
  chat: process.env.NODE_ENV === 'production' 
    ? 'https://chat.digimall.ng/api/v1'
    : 'http://localhost:4700/api/v1',
};

function getServiceUrl(path: string): { serviceUrl: string; servicePath: string } {
  // Remove leading slash
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  const segments = cleanPath.split('/');
  const firstSegment = segments[0];

  // Handle chat routes specially - direct to chat service
  if (firstSegment === 'chat' || firstSegment === 'messages') {
    return {
      serviceUrl: SPECIAL_ROUTES.chat,
      servicePath: cleanPath,
    };
  }

  // All other routes go to admin service
  // The admin service handles all admin operations including:
  // vendors, users, orders, products, categories, analytics, audit, etc.
  return {
    serviceUrl: ADMIN_SERVICE_URL,
    servicePath: cleanPath,
  };
}

async function handler(request: NextRequest) {
  try {
    // Extract the path from the URL
    const { pathname } = request.nextUrl;
    const pathMatch = pathname.match(/\/api\/proxy\/(.+)/);
    const proxyPath = pathMatch ? pathMatch[1] : '';

    // Allow setup endpoints without authentication
    const isSetupEndpoint = proxyPath.startsWith('setup/') || proxyPath.startsWith('admin/setup/');
    
    // Get the session (unless it's a setup endpoint)
    const session = !isSetupEndpoint ? await getServerSession(authOptions) : null;

    if (!isSetupEndpoint && !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!pathMatch) {
      return NextResponse.json({ error: 'Invalid proxy path' }, { status: 400 });
    }
    const { serviceUrl, servicePath } = getServiceUrl(proxyPath);

    // Build the target URL
    const targetUrl = new URL(`${serviceUrl}/${servicePath}`);

    // Copy query parameters
    request.nextUrl.searchParams.forEach((value, key) => {
      targetUrl.searchParams.append(key, value);
    });

    // Prepare headers
    const headers = new Headers(request.headers);
    
    // Only add auth headers for non-setup endpoints
    if (!isSetupEndpoint && session) {
      headers.set('Authorization', `Bearer ${session.accessToken}`);
      // Add user information headers that microservices might need
      headers.set('x-user-id', session.user.id);
      headers.set('x-user-email', session.user.email);
      headers.set('x-user-role', session.user.role);
    }

    // Remove Next.js specific headers
    headers.delete('host');
    headers.delete('x-forwarded-host');
    headers.delete('x-forwarded-proto');
    headers.delete('x-forwarded-for');

    // Handle body for non-GET requests
    let body: any = undefined;
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      const contentType = headers.get('content-type');

      if (contentType?.includes('application/json')) {
        body = await request.json();
      } else if (contentType?.includes('multipart/form-data')) {
        body = await request.formData();
      } else {
        body = await request.text();
      }
    }

    // Log the request for debugging
    console.log('Proxy request:', {
      targetUrl: targetUrl.toString(),
      method: request.method,
      hasAuth: !!headers.get('Authorization'),
      body: body ? JSON.stringify(body) : undefined,
    });

    // Make the request to the target service
    const response = await fetch(targetUrl.toString(), {
      method: request.method,
      headers,
      body: body ? (body instanceof FormData ? body : JSON.stringify(body)) : undefined,
    });

    // Get response data
    const responseData = await response.text();

    console.log('Proxy response:', {
      status: response.status,
      statusText: response.statusText,
      data: responseData,
    });

    // Create response with appropriate headers
    const proxyResponse = new NextResponse(responseData, {
      status: response.status,
      statusText: response.statusText,
    });

    // Copy response headers
    response.headers.forEach((value, key) => {
      // Skip some headers that shouldn't be forwarded
      if (
        !['content-encoding', 'content-length', 'transfer-encoding'].includes(key.toLowerCase())
      ) {
        proxyResponse.headers.set(key, value);
      }
    });

    return proxyResponse;
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      {
        error: 'Internal proxy error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Export handlers for all HTTP methods
export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
export const HEAD = handler;
export const OPTIONS = handler;
