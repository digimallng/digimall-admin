import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Get the session
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const categoryId = formData.get('categoryId') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!categoryId) {
      return NextResponse.json({ error: 'Category ID required' }, { status: 400 });
    }

    // Proxy the request to the unified backend category image upload endpoint
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';
    const uploadUrl = `${backendUrl}/api/v1/categories/${categoryId}/upload-image`;

    // Create FormData for the backend request
    const backendFormData = new FormData();
    backendFormData.append('image', file);

    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: backendFormData,
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        {
          error: errorData.message || 'Upload failed',
          details: errorData.details || 'Failed to upload to backend service',
        },
        { status: response.status }
      );
    }

    const result = await response.json();

    return NextResponse.json({
      url: result.url,
      cdnUrl: result.cdnUrl,
      key: result.key,
      bucket: result.bucket,
      size: result.size,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
    });
  } catch (error) {
    console.error('Media upload error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
