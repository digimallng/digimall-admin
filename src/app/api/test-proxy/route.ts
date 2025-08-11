import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Test direct connection to chat service
  try {
    const chatHealthResponse = await fetch('http://localhost:3005/api/v1/health');
    const chatHealth = await chatHealthResponse.json();

    const adminHealthResponse = await fetch('http://localhost:4800/api/v1/health');
    const adminHealth = await adminHealthResponse.json();

    return NextResponse.json({
      success: true,
      services: {
        chat: {
          url: 'http://localhost:3005/api/v1',
          health: chatHealth,
          status: chatHealthResponse.ok ? 'connected' : 'error',
        },
        admin: {
          url: 'http://localhost:4800/api/v1',
          health: adminHealth,
          status: adminHealthResponse.ok ? 'connected' : 'error',
        },
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        services: {
          chat: { status: 'disconnected' },
          admin: { status: 'disconnected' },
        },
      },
      { status: 500 }
    );
  }
}
