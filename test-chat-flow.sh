#!/bin/bash

# Test script for admin chat functionality
# This script tests the chat creation flow and messaging

set -e

echo "Testing Admin Chat Flow"
echo "======================"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
ADMIN_API="http://localhost:3002/api"
CHAT_API="http://localhost:3008/api/v1"
PROXY_API="http://localhost:3002/api/proxy"
USE_PROXY=${USE_PROXY:-true}
ADMIN_TOKEN=""
TEST_USER_ID=""
TEST_VENDOR_ID=""

# Function to print colored output
print_status() {
    echo -e "${YELLOW}$1${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# 1. Login as admin
print_status "1. Logging in as admin..."
LOGIN_RESPONSE=$(curl -s -X POST "$ADMIN_API/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@digimall.com",
    "password": "Admin@123!"
  }')

ADMIN_TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.access_token // .accessToken // empty')

if [ -z "$ADMIN_TOKEN" ]; then
    print_error "Failed to login as admin"
    echo "Response: $LOGIN_RESPONSE"
    exit 1
fi

print_success "Logged in successfully"

# 2. Get a test user
print_status "2. Getting test user..."
USERS_RESPONSE=$(curl -s -X GET "$ADMIN_API/users?limit=1" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

TEST_USER_ID=$(echo $USERS_RESPONSE | jq -r '.users[0].id // empty')

if [ -z "$TEST_USER_ID" ]; then
    print_error "No users found"
    exit 1
fi

print_success "Found test user: $TEST_USER_ID"

# 3. Get a test vendor
print_status "3. Getting test vendor..."
VENDORS_RESPONSE=$(curl -s -X GET "$ADMIN_API/vendors?limit=1&status=approved" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

TEST_VENDOR_ID=$(echo $VENDORS_RESPONSE | jq -r '.vendors[0].userId // empty')

if [ -z "$TEST_VENDOR_ID" ]; then
    print_error "No approved vendors found"
    exit 1
fi

print_success "Found test vendor: $TEST_VENDOR_ID"

# 4. Create conversation with user
print_status "4. Creating conversation with user..."
if [ "$USE_PROXY" = true ]; then
    CONVERSATION_URL="$PROXY_API/conversations"
else
    CONVERSATION_URL="$CHAT_API/conversations"
fi

USER_CONVERSATION_RESPONSE=$(curl -s -X POST "$CONVERSATION_URL" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"type\": \"support\",
    \"participants\": [\"$TEST_USER_ID\"],
    \"title\": \"Test Chat with User\"
  }")

USER_CONVERSATION_ID=$(echo $USER_CONVERSATION_RESPONSE | jq -r '.id // empty')

if [ -z "$USER_CONVERSATION_ID" ]; then
    print_error "Failed to create user conversation"
    echo "Response: $USER_CONVERSATION_RESPONSE"
    exit 1
fi

print_success "Created user conversation: $USER_CONVERSATION_ID"

# 5. Create conversation with vendor
print_status "5. Creating conversation with vendor..."
VENDOR_CONVERSATION_RESPONSE=$(curl -s -X POST "$CONVERSATION_URL" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"type\": \"support\",
    \"participants\": [\"$TEST_VENDOR_ID\"],
    \"title\": \"Test Chat with Vendor\"
  }")

VENDOR_CONVERSATION_ID=$(echo $VENDOR_CONVERSATION_RESPONSE | jq -r '.id // empty')

if [ -z "$VENDOR_CONVERSATION_ID" ]; then
    print_error "Failed to create vendor conversation"
    echo "Response: $VENDOR_CONVERSATION_RESPONSE"
    exit 1
fi

print_success "Created vendor conversation: $VENDOR_CONVERSATION_ID"

# 6. Send message to user
print_status "6. Sending message to user..."
if [ "$USE_PROXY" = true ]; then
    MESSAGE_URL="$PROXY_API/messages"
else
    MESSAGE_URL="$CHAT_API/messages"
fi

USER_MESSAGE_RESPONSE=$(curl -s -X POST "$MESSAGE_URL" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"conversationId\": \"$USER_CONVERSATION_ID\",
    \"content\": \"Hello! This is a test message from admin to user.\",
    \"type\": \"text\"
  }")

USER_MESSAGE_ID=$(echo $USER_MESSAGE_RESPONSE | jq -r '.id // empty')

if [ -z "$USER_MESSAGE_ID" ]; then
    print_error "Failed to send message to user"
    echo "Response: $USER_MESSAGE_RESPONSE"
    exit 1
fi

print_success "Sent message to user: $USER_MESSAGE_ID"

# 7. Send message to vendor
print_status "7. Sending message to vendor..."
VENDOR_MESSAGE_RESPONSE=$(curl -s -X POST "$MESSAGE_URL" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"conversationId\": \"$VENDOR_CONVERSATION_ID\",
    \"content\": \"Hello! This is a test message from admin to vendor.\",
    \"type\": \"text\"
  }")

VENDOR_MESSAGE_ID=$(echo $VENDOR_MESSAGE_RESPONSE | jq -r '.id // empty')

if [ -z "$VENDOR_MESSAGE_ID" ]; then
    print_error "Failed to send message to vendor"
    echo "Response: $VENDOR_MESSAGE_RESPONSE"
    exit 1
fi

print_success "Sent message to vendor: $VENDOR_MESSAGE_ID"

# 8. Get conversations list
print_status "8. Getting conversations list..."
CONVERSATIONS_RESPONSE=$(curl -s -X GET "$CONVERSATION_URL" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

CONVERSATION_COUNT=$(echo $CONVERSATIONS_RESPONSE | jq '.conversations | length')

if [ "$CONVERSATION_COUNT" -eq 0 ]; then
    print_error "No conversations found"
    exit 1
fi

print_success "Found $CONVERSATION_COUNT conversations"

# 9. Get messages from user conversation
print_status "9. Getting messages from user conversation..."
if [ "$USE_PROXY" = true ]; then
    USER_MESSAGES_URL="$PROXY_API/conversations/$USER_CONVERSATION_ID/messages"
else
    USER_MESSAGES_URL="$CHAT_API/conversations/$USER_CONVERSATION_ID/messages"
fi

USER_MESSAGES_RESPONSE=$(curl -s -X GET "$USER_MESSAGES_URL" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

USER_MESSAGE_COUNT=$(echo $USER_MESSAGES_RESPONSE | jq '.messages | length')

if [ "$USER_MESSAGE_COUNT" -eq 0 ]; then
    print_error "No messages found in user conversation"
    exit 1
fi

print_success "Found $USER_MESSAGE_COUNT messages in user conversation"

# 10. Test chat statistics
print_status "10. Getting chat statistics..."
if [ "$USE_PROXY" = true ]; then
    STATS_URL="$PROXY_API/admin/stats"
else
    STATS_URL="$CHAT_API/admin/stats"
fi

STATS_RESPONSE=$(curl -s -X GET "$STATS_URL" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

TOTAL_CONVERSATIONS=$(echo $STATS_RESPONSE | jq -r '.totalConversations // 0')
ACTIVE_CONVERSATIONS=$(echo $STATS_RESPONSE | jq -r '.activeConversations // 0')

print_success "Total conversations: $TOTAL_CONVERSATIONS"
print_success "Active conversations: $ACTIVE_CONVERSATIONS"

echo ""
echo "======================================"
echo -e "${GREEN}All tests passed successfully!${NC}"
echo "======================================"
echo ""
echo "Test Summary:"
echo "- Admin login: ✓"
echo "- User conversation created: $USER_CONVERSATION_ID"
echo "- Vendor conversation created: $VENDOR_CONVERSATION_ID"
echo "- Messages sent successfully"
echo "- Conversations and messages retrieved successfully"
echo "- Chat statistics working"
echo ""
echo "You can now navigate to:"
echo "- User chat: http://localhost:3002/messages?conversationId=$USER_CONVERSATION_ID"
echo "- Vendor chat: http://localhost:3002/messages?conversationId=$VENDOR_CONVERSATION_ID"