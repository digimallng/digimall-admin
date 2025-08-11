import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Service mappings
const SERVICE_ROUTES = {
  // Chat service routes (port 4700)
  chat: 'http://localhost:4700',

  // User service routes (port 4300)
  users: 'http://localhost:4300/api/v1',
  'user-management': 'http://localhost:4300/api/v1',

  // Vendor service routes (same as user service)
  vendors: 'http://localhost:4300/api/v1',
  'vendor-management': 'http://localhost:4300/api/v1',

  // Auth service routes (port 4200)
  auth: 'http://localhost:4200/api/v1',

  // Product service routes (port 4100)
  products: 'http://localhost:4100/api/v1',
  'product-management': 'http://localhost:4100/api/v1',

  // Order service routes (port 4400)
  orders: 'http://localhost:4400/api/v1',
  'order-management': 'http://localhost:4400/api/v1',

  // Admin service routes (port 4800)
  analytics: 'http://localhost:4800/api/v1',
  settings: 'http://localhost:4800/api/v1',
  admin: 'http://localhost:4800/api/v1',
  categories: 'http://localhost:4800/api/v1',
  audit: 'http://localhost:4800/api/v1',
};

function getServiceUrl(path: string): { serviceUrl: string; servicePath: string } {
  // Remove leading slash
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  const segments = cleanPath.split('/');
  const firstSegment = segments[0];

  // Handle chat routes specially
  if (firstSegment === 'chat') {
    // Remove 'chat' prefix and build the path
    const chatPath = segments.slice(1).join('/');
    return {
      serviceUrl: SERVICE_ROUTES.chat,
      servicePath: `api/v1/${chatPath}`,
    };
  }

  // Handle messages routes
  if (firstSegment === 'messages') {
    return {
      serviceUrl: SERVICE_ROUTES.chat,
      servicePath: `api/v1/${cleanPath}`,
    };
  }

  // Find matching service
  for (const [route, serviceUrl] of Object.entries(SERVICE_ROUTES)) {
    if (cleanPath.startsWith(route)) {
      // Special handling for admin routes - remove 'admin/' prefix from path
      if (route === 'admin' && cleanPath.startsWith('admin/')) {
        const adminPath = cleanPath.replace('admin/', '');
        return {
          serviceUrl,
          servicePath: adminPath,
        };
      }
      return {
        serviceUrl,
        servicePath: cleanPath,
      };
    }
  }

  // Default to admin service
  return {
    serviceUrl: 'http://localhost:4800/api/v1',
    servicePath: cleanPath,
  };
}

async function handler(request: NextRequest) {
  try {
    // Get the session
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Extract the path from the URL
    const { pathname } = request.nextUrl;
    const pathMatch = pathname.match(/\/api\/proxy\/(.+)/);

    if (!pathMatch) {
      return NextResponse.json({ error: 'Invalid proxy path' }, { status: 400 });
    }

    const proxyPath = pathMatch[1];
    const { serviceUrl, servicePath } = getServiceUrl(proxyPath);

    // Build the target URL
    const targetUrl = new URL(`${serviceUrl}/${servicePath}`);

    // Copy query parameters
    request.nextUrl.searchParams.forEach((value, key) => {
      targetUrl.searchParams.append(key, value);
    });

    // Prepare headers
    const headers = new Headers(request.headers);
    headers.set('Authorization', `Bearer ${session.accessToken}`);

    // Add user information headers that microservices might need
    headers.set('x-user-id', session.user.id);
    headers.set('x-user-email', session.user.email);
    headers.set('x-user-role', session.user.role);

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
