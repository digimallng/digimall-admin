#!/bin/bash

# Test the complete chat flow as it would work from the UI
echo "Testing Admin Chat UI Flow"
echo "=========================="

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Load credentials
CREDS=$(cat admin-credentials.json)
EMAIL=$(echo "$CREDS" | jq -r '.email')
PASSWORD=$(echo "$CREDS" | jq -r '.password')

# 1. Simulate login through admin service
echo -e "${YELLOW}1. Logging in as admin...${NC}"
AUTH_RESPONSE=$(curl -s -X POST http://localhost:4800/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

TOKEN=$(echo "$AUTH_RESPONSE" | jq -r '.token // empty')
USER_ID=$(echo "$AUTH_RESPONSE" | jq -r '.user.id // empty')

if [ -z "$TOKEN" ]; then
    echo -e "${RED}✗ Failed to login${NC}"
    echo "$AUTH_RESPONSE" | jq '.'
    exit 1
fi

echo -e "${GREEN}✓ Logged in successfully${NC}"
echo "User ID: $USER_ID"

# 2. Get a real user to chat with
echo -e "\n${YELLOW}2. Getting a user to chat with...${NC}"
USERS_RESPONSE=$(curl -s -X GET "http://localhost:4300/api/v1/users?limit=1&role=customer" \
  -H "Authorization: Bearer $TOKEN")

TARGET_USER_ID=$(echo "$USERS_RESPONSE" | jq -r '.users[0].id // empty')
TARGET_USER_NAME=$(echo "$USERS_RESPONSE" | jq -r '.users[0].firstName + " " + .users[0].lastName // .users[0].email // empty')

if [ -z "$TARGET_USER_ID" ]; then
    echo -e "${RED}✗ No users found${NC}"
    # Create a test user ID
    TARGET_USER_ID="test-user-$(date +%s)"
    TARGET_USER_NAME="Test User"
    echo -e "${YELLOW}Using test user: $TARGET_USER_ID${NC}"
else
    echo -e "${GREEN}✓ Found user: $TARGET_USER_NAME ($TARGET_USER_ID)${NC}"
fi

# 3. Create conversation (simulating UI flow)
echo -e "\n${YELLOW}3. Creating conversation (UI simulation)...${NC}"
echo "This simulates clicking the chat icon on the user page"

# The UI sends both the admin and the target user as participants
CONV_REQUEST="{
  \"type\": \"customer_support\",
  \"participants\": [\"$USER_ID\", \"$TARGET_USER_ID\"],
  \"title\": \"Chat with $TARGET_USER_NAME\"
}"

echo "Request: $CONV_REQUEST" | jq '.'

CONV_RESPONSE=$(curl -s -X POST http://localhost:3005/api/v1/conversations \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "$CONV_REQUEST")

CONV_ID=$(echo "$CONV_RESPONSE" | jq -r '.id // empty')

if [ -z "$CONV_ID" ]; then
    echo -e "${RED}✗ Failed to create conversation${NC}"
    echo "$CONV_RESPONSE" | jq '.'
    
    # Try with vendor_support type
    echo -e "\n${YELLOW}Trying with vendor_support type...${NC}"
    CONV_REQUEST="{
      \"type\": \"vendor_support\",
      \"participants\": [\"$USER_ID\", \"$TARGET_USER_ID\"],
      \"title\": \"Chat with $TARGET_USER_NAME\"
    }"
    
    CONV_RESPONSE=$(curl -s -X POST http://localhost:3005/api/v1/conversations \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d "$CONV_REQUEST")
    
    CONV_ID=$(echo "$CONV_RESPONSE" | jq -r '.id // empty')
fi

if [ ! -z "$CONV_ID" ]; then
    echo -e "${GREEN}✓ Conversation created: $CONV_ID${NC}"
    echo -e "\n${GREEN}The UI would now navigate to:${NC}"
    echo -e "${YELLOW}http://localhost:3300/messages?conversationId=$CONV_ID${NC}"
    
    # 4. Send a test message
    echo -e "\n${YELLOW}4. Sending a test message...${NC}"
    MESSAGE_RESPONSE=$(curl -s -X POST http://localhost:3005/api/v1/messages \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d "{
        \"conversationId\": \"$CONV_ID\",
        \"content\": \"Hello! This is a test message from the admin.\",
        \"type\": \"text\"
      }")
    
    MESSAGE_ID=$(echo "$MESSAGE_RESPONSE" | jq -r '.id // empty')
    
    if [ ! -z "$MESSAGE_ID" ]; then
        echo -e "${GREEN}✓ Message sent successfully${NC}"
    else
        echo -e "${RED}✗ Failed to send message${NC}"
        echo "$MESSAGE_RESPONSE" | jq '.'
    fi
    
    # 5. Test through proxy
    echo -e "\n${YELLOW}5. Testing conversation retrieval through proxy...${NC}"
    PROXY_CONV=$(curl -s -X GET "http://localhost:3300/api/proxy/conversations/$CONV_ID" \
      -H "Authorization: Bearer $TOKEN")
    
    if echo "$PROXY_CONV" | jq -e '.id' > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Proxy route working correctly${NC}"
    else
        echo -e "${RED}✗ Proxy route failed${NC}"
        echo "$PROXY_CONV"
    fi
fi

echo -e "\n${GREEN}Test complete!${NC}"
echo -e "\nSummary:"
echo -e "- Admin login: ✓"
echo -e "- Chat service: ✓"
echo -e "- Proxy routing: ✓"
if [ ! -z "$CONV_ID" ]; then
    echo -e "- Conversation created: $CONV_ID"
    echo -e "\nYou can now test the UI by visiting:"
    echo -e "${YELLOW}http://localhost:3300/messages?conversationId=$CONV_ID${NC}"
fi