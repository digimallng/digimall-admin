import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ApiError } from '@/lib/api/types/shared.types';

// Unified Backend URL - all services are now consolidated
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';
const API_BASE_URL = `${BACKEND_URL}/api/v1`;

// Request timeout (30 seconds)
const REQUEST_TIMEOUT = 30000;

function getServiceUrl(path: string): { serviceUrl: string; servicePath: string } {
  // Remove leading slash
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;

  // All routes now go to the unified backend
  // The backend expects paths in the format: /api/v1/{endpoint}
  // Examples:
  // - admin/vendors -> /api/v1/admin/vendors
  // - admin/products -> /api/v1/admin/products
  // - staff/auth/login -> /api/v1/staff/auth/login
  // - analytics/dashboard -> /api/v1/analytics/dashboard

  return {
    serviceUrl: API_BASE_URL,
    servicePath: cleanPath,
  };
}

async function handler(request: NextRequest) {
  try {
    // Extract the path from the URL
    const { pathname } = request.nextUrl;
    const pathMatch = pathname.match(/\/api\/proxy\/(.+)/);
    const proxyPath = pathMatch ? pathMatch[1] : '';

    // Allow auth endpoints without authentication (login, register, etc.)
    const isAuthEndpoint = proxyPath.startsWith('staff/auth/login') ||
                          proxyPath.startsWith('staff/auth/refresh-token') ||
                          proxyPath.startsWith('staff/auth/logout') ||
                          proxyPath.startsWith('staff/setup/') ||
                          proxyPath.startsWith('auth/') ||
                          proxyPath.startsWith('setup/');

    // Get the session (unless it's an auth endpoint)
    const session = !isAuthEndpoint ? await getServerSession(authOptions) : null;

    // Check for Authorization header as fallback (for API test suite)
    const authHeader = request.headers.get('authorization');
    const hasBearerToken = authHeader?.startsWith('Bearer ');

    // Debug logging for auth issues
    if (!isAuthEndpoint && !session) {
      console.log('Auth check:', {
        path: proxyPath,
        hasSession: !!session,
        authHeader: authHeader?.substring(0, 50),
        hasBearerToken,
      });
    }

    // Require either session OR bearer token for non-auth endpoints
    if (!isAuthEndpoint && !session && !hasBearerToken) {
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

    // Only add auth headers for non-auth endpoints
    if (!isAuthEndpoint) {
      if (session) {
        // Use session token for authenticated dashboard requests
        headers.set('Authorization', `Bearer ${session.accessToken}`);
        // Add user information headers that backend might need
        headers.set('x-user-id', session.user.id);
        headers.set('x-user-email', session.user.email);
        headers.set('x-user-role', session.user.role);
      } else if (hasBearerToken) {
        // For API test suite - forward the Authorization header as-is
        // The header is already in the request, but we ensure it's preserved
        headers.set('Authorization', authHeader);
      }
    }

    // Add service identification headers
    headers.set('X-Client-Service', 'admin-frontend');
    headers.set('X-Request-Source', 'admin-panel');

    // Remove Next.js specific headers
    headers.delete('host');
    headers.delete('x-forwarded-host');
    headers.delete('x-forwarded-proto');
    headers.delete('x-forwarded-for');

    // Handle body for non-GET requests
    let body: any = undefined;
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      const contentType = headers.get('content-type');

      if (contentType?.includes('multipart/form-data')) {
        // For multipart data, stream the original body directly to avoid corruption
        body = request.body;
      } else if (contentType?.includes('application/json')) {
        body = await request.json();
      } else {
        body = await request.text();
      }
    }

    // Log the request for debugging
    console.log('Proxy request:', {
      targetUrl: targetUrl.toString(),
      method: request.method,
      hasAuth: !!headers.get('Authorization'),
      authHeader: headers.get('Authorization')?.substring(0, 30) + '...',
      hasSession: !!session,
      hasBearerToken,
      body: body ? JSON.stringify(body) : undefined,
    });

    // Make the request to the target service with timeout
    let fetchBody: any = undefined;
    if (body) {
      if (headers.get('content-type')?.includes('multipart/form-data')) {
        // Stream multipart data directly
        fetchBody = body;
      } else if (body instanceof FormData) {
        fetchBody = body;
      } else if (typeof body === 'string') {
        fetchBody = body;
      } else {
        fetchBody = JSON.stringify(body);
      }
    }

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    try {
      const response = await fetch(targetUrl.toString(), {
        method: request.method,
        headers,
        body: fetchBody,
        signal: controller.signal,
        // @ts-ignore - duplex option is required for streaming bodies in Node.js 18+
        duplex: 'half',
      });

      clearTimeout(timeoutId);

      // Check if response is binary (for file downloads)
      const contentType = response.headers.get('content-type') || '';
      const isBinary = contentType.includes('application/octet-stream') ||
                       contentType.includes('application/vnd.openxmlformats-officedocument') ||
                       contentType.includes('application/vnd.ms-excel') ||
                       contentType.includes('application/pdf') ||
                       contentType.includes('image/') ||
                       contentType.includes('video/') ||
                       contentType.includes('audio/');

      // Get response data - use arrayBuffer for binary, text for others
      let responseData: string | ArrayBuffer;
      if (isBinary) {
        responseData = await response.arrayBuffer();
        console.log('Proxy response:', {
          status: response.status,
          statusText: response.statusText,
          contentType,
          size: responseData.byteLength,
          type: 'binary',
        });
      } else {
        responseData = await response.text();
        console.log('Proxy response:', {
          status: response.status,
          statusText: response.statusText,
          data: responseData.substring(0, 200),
          type: 'text',
        });
      }

      // Create response with appropriate headers
      const proxyResponse = new NextResponse(responseData, {
        status: response.status,
        statusText: response.statusText,
      });

      // Copy response headers
      response.headers.forEach((value, key) => {
        // Skip some headers that shouldn't be forwarded
        if (
          !['content-encoding', 'content-length', 'transfer-encoding'].includes(
            key.toLowerCase()
          )
        ) {
          proxyResponse.headers.set(key, value);
        }
      });

      return proxyResponse;
    } catch (fetchError) {
      clearTimeout(timeoutId);

      // Handle timeout
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        return NextResponse.json(
          {
            success: false,
            error: 'Request timeout',
            message: 'The request took too long to complete',
          },
          { status: 504 }
        );
      }

      // Handle fetch errors
      throw fetchError;
    }
  } catch (error) {
    console.error('Proxy error:', error);

    // Handle specific error types
    if (error instanceof ApiError) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          code: error.code,
          data: error.data,
        },
        { status: error.status }
      );
    }

    // Handle network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Network error',
          message: 'Unable to connect to the backend service',
        },
        { status: 503 }
      );
    }

    // Generic error handler
    return NextResponse.json(
      {
        success: false,
        error: 'Internal proxy error',
        message: error instanceof Error ? error.message : 'Unknown error',
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
