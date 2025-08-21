import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, password } = body;

    // Basic validation
    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    if (!email.includes('@')) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    // Get admin service URL
    const adminServiceUrl = process.env.NODE_ENV === 'production' 
      ? 'https://admin.digimall.ng/api/v1'
      : process.env.ADMIN_SERVICE_URL 
        ? `${process.env.ADMIN_SERVICE_URL}/api/v1`
        : 'http://localhost:4800/api/v1';

    console.log('Creating super admin via admin service:', adminServiceUrl);
    console.log('Setup request data:', {
      firstName,
      lastName,
      email,
      passwordLength: password.length
    });

    // Call the actual admin service to create super admin
    const response = await fetch(`${adminServiceUrl}/setup/create-super-admin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        firstName,
        lastName,
        setupToken: process.env.SETUP_TOKEN || 'DIGIMALL_SUPER_SETUP_2024_SECURE_TOKEN_X9K2M8P5'
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: errorText || 'Setup failed' };
      }

      console.error('Admin service setup error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });

      return NextResponse.json(
        { error: errorData.error || errorData.message || 'Failed to create super admin account' },
        { status: response.status }
      );
    }

    const result = await response.json();
    
    console.log('Super admin created successfully:', {
      userId: result.user?.id,
      email: result.user?.email
    });

    return NextResponse.json({
      success: true,
      message: 'Super admin account created successfully',
      user: result.user
    });

  } catch (error) {
    console.error('Setup API error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to connect to admin service',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}