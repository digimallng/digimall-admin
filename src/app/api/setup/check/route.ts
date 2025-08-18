import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Check if super admin exists by querying the admin service
    const adminServiceUrl = process.env.NODE_ENV === 'production' 
      ? 'https://admin.digimall.ng/api/v1'
      : process.env.ADMIN_SERVICE_URL 
        ? `${process.env.ADMIN_SERVICE_URL}/api/v1`
        : 'http://localhost:4800/api/v1';

    console.log('Checking setup status with admin service:', adminServiceUrl);

    // Query the admin service setup status endpoint
    const response = await fetch(`${adminServiceUrl}/setup/verify-setup`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      const setupRequired = data.setupRequired || false;
      
      console.log('Setup check result:', {
        setupRequired,
        message: data.message
      });

      return NextResponse.json({
        setupRequired: setupRequired,
        message: data.message || (setupRequired ? 'Setup required' : 'Setup complete')
      });

    } else {
      // If setup/status endpoint doesn't exist, try an alternative approach
      // Test if we can make a simple call to see if the service has been initialized
      try {
        const testResponse = await fetch(`${adminServiceUrl}/setup/create-super-admin`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: 'test@test.com',
            password: 'test',
            firstName: 'test',
            lastName: 'test',
            setupToken: 'invalid'
          }),
        });

        // If we get a validation error (not 404), it means the endpoint exists
        // and setup has been configured, so super admin likely exists
        if (testResponse.status === 400 || testResponse.status === 401 || testResponse.status === 422) {
          console.log('Setup endpoint exists and validates, assuming setup complete');
          return NextResponse.json({
            setupRequired: false,
            message: 'Setup endpoint accessible, assuming setup complete'
          });
        }
      } catch (testError) {
        console.log('Test call failed, assuming setup needed');
      }

      console.log('Setup status endpoint not found, assuming setup needed');
      return NextResponse.json({
        setupRequired: true,
        message: 'Setup status endpoint not available. Setup may be required.'
      });
    }

  } catch (error) {
    console.error('Setup check error:', error);
    
    // On network/other errors, assume setup is needed for safety
    return NextResponse.json({
      setupRequired: true,
      message: 'Unable to connect to admin service. Setup required.',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}