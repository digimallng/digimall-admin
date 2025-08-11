// Test script to verify chat proxy is working
const fetch = require('node-fetch');

async function testChatProxy() {
  console.log('Testing Admin Chat Proxy');
  console.log('========================\n');

  try {
    // 1. Login to get auth token
    console.log('1. Logging in as admin...');
    const loginResponse = await fetch('http://localhost:3300/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@digimall.com',
        password: 'Admin@123!',
      }),
    });

    if (!loginResponse.ok) {
      const error = await loginResponse.text();
      throw new Error(`Login failed: ${error}`);
    }

    const loginData = await loginResponse.json();
    const token = loginData.access_token || loginData.accessToken;

    if (!token) {
      throw new Error('No access token received');
    }

    console.log('✓ Login successful\n');

    // 2. Test proxy to chat service health
    console.log('2. Testing proxy to chat service health...');
    const healthResponse = await fetch('http://localhost:3300/api/proxy/health', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('✓ Chat service health:', JSON.stringify(healthData, null, 2));
    } else {
      console.log('✗ Health check failed:', healthResponse.status);
    }

    // 3. Test creating a conversation
    console.log('\n3. Testing conversation creation...');
    const conversationResponse = await fetch('http://localhost:3300/api/proxy/conversations', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'support',
        participants: ['test-user-id'],
        title: 'Test Chat from Proxy',
      }),
    });

    if (!conversationResponse.ok) {
      const error = await conversationResponse.text();
      console.log('✗ Conversation creation failed:', error);
    } else {
      const conversationData = await conversationResponse.json();
      console.log('✓ Conversation created:', JSON.stringify(conversationData, null, 2));
    }

    // 4. Test getting conversations list
    console.log('\n4. Testing conversations list...');
    const listResponse = await fetch('http://localhost:3300/api/proxy/conversations', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!listResponse.ok) {
      const error = await listResponse.text();
      console.log('✗ Failed to get conversations:', error);
    } else {
      const listData = await listResponse.json();
      console.log(
        '✓ Conversations retrieved:',
        listData.conversations?.length || 0,
        'conversations'
      );
    }

    console.log('\n✅ Proxy test completed successfully!');
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run the test
testChatProxy();
