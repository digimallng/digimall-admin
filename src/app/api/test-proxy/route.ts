import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Test direct connection to unified backend
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';
    const backendHealthResponse = await fetch(`${backendUrl}/health`);
    const backendHealth = await backendHealthResponse.json();

    return NextResponse.json({
      success: true,
      services: {
        backend: {
          url: backendUrl,
          health: backendHealth,
          status: backendHealthResponse.ok ? 'connected' : 'error',
        },
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        services: {
          backend: { status: 'disconnected' },
        },
      },
      { status: 500 }
    );
  }
}
