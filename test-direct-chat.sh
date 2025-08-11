#!/bin/bash

# Direct test of chat service and proxy
echo "Testing Chat Service Direct Access"
echo "=================================="

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 1. Test direct chat service
echo -e "\n${YELLOW}1. Testing direct chat service health...${NC}"
HEALTH_RESPONSE=$(curl -s http://localhost:3005/api/v1/health)
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Chat service is running${NC}"
    echo "$HEALTH_RESPONSE" | jq '.' 2>/dev/null || echo "$HEALTH_RESPONSE"
else
    echo -e "${RED}✗ Chat service not accessible${NC}"
fi

# 2. Test admin service
echo -e "\n${YELLOW}2. Testing admin service health...${NC}"
ADMIN_HEALTH=$(curl -s http://localhost:4800/api/v1/health)
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Admin service is running${NC}"
    echo "$ADMIN_HEALTH" | jq '.' 2>/dev/null || echo "$ADMIN_HEALTH"
else
    echo -e "${RED}✗ Admin service not accessible${NC}"
fi

# 3. Get auth token from admin service
echo -e "\n${YELLOW}3. Getting admin auth token...${NC}"
AUTH_RESPONSE=$(curl -s -X POST http://localhost:4800/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@digimall.com","password":"Admin@123!"}')

TOKEN=$(echo "$AUTH_RESPONSE" | jq -r '.access_token // .accessToken // .token // empty')

if [ -z "$TOKEN" ]; then
    echo -e "${RED}✗ Failed to get auth token${NC}"
    echo "Response: $AUTH_RESPONSE"
    exit 1
fi

echo -e "${GREEN}✓ Got auth token${NC}"

# 4. Test conversation creation directly
echo -e "\n${YELLOW}4. Testing conversation creation directly...${NC}"
CONV_RESPONSE=$(curl -s -X POST http://localhost:3005/api/v1/conversations \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "customer_support",
    "participants": ["0e1f6bd5-b50d-4307-9a12-034eb2e70f9e", "test-user-id"],
    "title": "Test Direct Chat"
  }')

CONV_ID=$(echo "$CONV_RESPONSE" | jq -r '.id // empty')

if [ -z "$CONV_ID" ]; then
    echo -e "${RED}✗ Failed to create conversation${NC}"
    echo "Response: $CONV_RESPONSE"
else
    echo -e "${GREEN}✓ Created conversation: $CONV_ID${NC}"
fi

# 5. Test proxy route (requires admin app running)
echo -e "\n${YELLOW}5. Testing proxy route...${NC}"
curl -s http://localhost:3300/api/proxy/health \
  -H "Authorization: Bearer $TOKEN" | jq '.' 2>/dev/null && \
  echo -e "${GREEN}✓ Proxy route is working${NC}" || \
  echo -e "${RED}✗ Proxy route not working${NC}"

echo -e "\n${GREEN}Test complete!${NC}"