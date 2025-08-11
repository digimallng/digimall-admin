#!/bin/bash

# Test proxy routing without auth
echo "Testing Proxy Routing"
echo "===================="

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Test if admin app is running
echo -e "\n${YELLOW}1. Checking if admin app is running...${NC}"
curl -s http://localhost:3300 > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Admin app is running on port 3300${NC}"
else
    echo -e "${RED}✗ Admin app not running${NC}"
    exit 1
fi

# Test proxy route exists
echo -e "\n${YELLOW}2. Testing proxy route exists...${NC}"
PROXY_TEST=$(curl -s -X GET http://localhost:3300/api/proxy/test 2>&1)
echo "Response: $PROXY_TEST"

# Test conversations endpoint through proxy (will fail auth but shows routing)
echo -e "\n${YELLOW}3. Testing conversations endpoint through proxy...${NC}"
CONV_TEST=$(curl -s -X GET http://localhost:3300/api/proxy/conversations \
  -H "Authorization: Bearer test-token" 2>&1)
echo "Response: $CONV_TEST"

# Test chat service health through proxy
echo -e "\n${YELLOW}4. Testing chat service health through proxy...${NC}"
HEALTH_TEST=$(curl -s -X GET http://localhost:3300/api/proxy/health \
  -H "Authorization: Bearer test-token" 2>&1)
echo "Response: $HEALTH_TEST"

echo -e "\n${GREEN}Proxy routing test complete!${NC}"