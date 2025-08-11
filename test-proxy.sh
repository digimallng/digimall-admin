#!/bin/bash

# Simple test to verify proxy routing is working

echo "Testing Admin Proxy Routes"
echo "========================="

# 1. Test direct chat service
echo -e "\n1. Testing direct chat service..."
curl -s -X GET "http://localhost:3008/api/v1/health" | jq '.' || echo "Direct chat service not accessible"

# 2. Test proxy route to chat service
echo -e "\n2. Testing proxy route to chat service..."
curl -s -X GET "http://localhost:3002/api/proxy/conversations" \
  -H "Cookie: next-auth.session-token=test" | jq '.' || echo "Proxy route failed"

# 3. Test creating conversation via proxy (will fail without auth)
echo -e "\n3. Testing POST via proxy..."
curl -s -X POST "http://localhost:3002/api/proxy/conversations" \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=test" \
  -d '{"type":"support","participants":["test"],"title":"Test"}' | jq '.'

echo -e "\nProxy test complete."