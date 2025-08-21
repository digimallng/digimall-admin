import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // TEMPORARY: Check if we have a flag indicating setup was completed
    // This is a workaround until the admin microservice implements proper setup verification
    const setupCompleted = process.env.SETUP_COMPLETED === 'true';
    
    if (setupCompleted) {
      console.log('Setup completion flag found, skipping microservice check');
      return NextResponse.json({
        setupRequired: false,
        message: 'Setup completed (via environment flag)'
      });
    }

    // Check if super admin exists by querying the admin service
    const adminServiceUrl = process.env.NODE_ENV === 'production' 
      ? 'https://admin.digimall.ng/api/v1'
      : process.env.ADMIN_SERVICE_URL 
        ? `${process.env.ADMIN_SERVICE_URL}/api/v1`
        : 'http://localhost:4800/api/v1';

    console.log('Checking setup status with admin service:', adminServiceUrl);

    // Query the admin service setup status endpoint
    const response = await fetch(`${adminServiceUrl}/setup/verify-setup`, {
      method: 'POST',
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
      console.log('Setup verify endpoint returned non-200 response:', response.status, response.statusText);
      
      // Try alternative verification - check if any admins exist
      try {
        console.log('Trying alternative admin verification...');
        const adminCheckResponse = await fetch(`${adminServiceUrl}/users/admins`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (adminCheckResponse.ok) {
          const adminData = await adminCheckResponse.json();
          const hasAdmins = adminData && (adminData.length > 0 || adminData.total > 0);
          
          console.log('Alternative admin check result:', { hasAdmins, adminData });
          
          return NextResponse.json({
            setupRequired: !hasAdmins,
            message: hasAdmins ? 'Admins found - setup complete' : 'No admins found - setup required'
          });
        }
      } catch (altError) {
        console.log('Alternative admin check also failed:', altError);
      }
      
      console.log('All verification methods failed, assuming setup needed');
      
      return NextResponse.json({
        setupRequired: true,
        message: 'Admin service not accessible or not initialized. Setup required.'
      });
    }

  } catch (error) {
    console.error('Setup check error:', error);
    
    // If it's a connection error (service not running), assume setup is needed
    if (error instanceof Error && error.message.includes('ECONNREFUSED')) {
      console.log('Admin service not running, setup required');
      return NextResponse.json({
        setupRequired: true,
        message: 'Admin service not running. Setup required.'
      });
    }
    
    // On other network/errors, assume setup is needed for safety
    return NextResponse.json({
      setupRequired: true,
      message: 'Unable to connect to admin service. Setup required.',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}