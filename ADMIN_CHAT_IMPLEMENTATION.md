# Admin Chat Implementation

## Overview

The admin chat system has been implemented with a simple, navigation-based
approach where admins can initiate conversations with users and vendors, then
communicate through a dedicated messages page.

## Key Design Decisions

### 1. No Floating Chat Window

- Instead of a floating chat widget, the system uses a navigation-based approach
- Clicking chat icons creates conversations and navigates to the messages page
- This provides a cleaner, less intrusive user experience

### 2. WebSocket Integration

- WebSocket connections are only established when on the messages page
- Prevents unnecessary connections when chat is not active
- Improves performance and reduces resource usage

### 3. Split-View Layout

- Messages page uses a split-view design
- Conversations list on the left, active chat on the right
- Mobile responsive with proper view switching

## Implementation Details

### Chat Service Integration

The admin app integrates with the chat microservice running on port 3008. All
API endpoints have been updated to match the service routes:

```typescript
// API endpoints (no /chat prefix)
POST   /api/v1/conversations          - Create conversation
GET    /api/v1/conversations          - Get conversations list
GET    /api/v1/conversations/:id      - Get conversation details
POST   /api/v1/messages               - Send message
GET    /api/v1/conversations/:id/messages - Get messages
POST   /api/v1/conversations/:id/mark-read - Mark as read
GET    /api/v1/admin/stats            - Get chat statistics
```

### Key Components

1. **Chat Service** (`/lib/api/services/chat.service.ts`)
   - Handles all chat-related API calls
   - Provides methods for conversations, messages, and admin operations

2. **Chat Hooks** (`/hooks/use-chat.ts`)
   - React Query hooks for chat operations
   - Automatic cache invalidation and optimistic updates

3. **WebSocket Provider** (`/providers/chat-websocket-provider.tsx`)
   - Manages real-time connections
   - Only used within chat components, not globally

4. **InlineChat Component** (`/components/chat/InlineChat.tsx`)
   - Self-contained chat interface
   - Includes its own WebSocket provider
   - Handles real-time messaging

5. **Messages Page** (`/app/messages/page.tsx`)
   - Split-view layout for conversations and chat
   - Auto-opens conversations from URL parameters
   - Mobile responsive design

### User Flow

1. **Starting a Chat from Users Page**

   ```typescript
   // Click chat icon on user row
   const conversation = await createConversationMutation.mutateAsync({
     type: 'support',
     participants: [user.id],
     title: `Chat with ${user.firstName} ${user.lastName}`,
   });
   router.push(`/messages?conversationId=${conversation.id}`);
   ```

2. **Starting a Chat from Vendor Detail Page**

   ```typescript
   // Click "Start Chat with Vendor" button
   const conversation = await createConversationMutation.mutateAsync({
     type: 'support',
     participants: [vendor.userId],
     title: `Chat with ${vendor.businessName}`,
   });
   router.push(`/messages?conversationId=${conversation.id}`);
   ```

3. **Messages Page Behavior**
   - Automatically opens conversation from URL parameter
   - Shows split view on desktop
   - Switches to full chat view on mobile
   - Real-time updates via WebSocket

## Testing

A test script is provided at `/apps/admin/test-chat-flow.sh` to verify the
implementation:

```bash
# Run the test script
./test-chat-flow.sh

# The script will:
# 1. Login as admin
# 2. Create conversations with users and vendors
# 3. Send test messages
# 4. Verify message delivery
# 5. Check chat statistics
```

## WebSocket Events

The system handles these real-time events:

- `message:new` - New message received
- `message:read` - Message marked as read
- `user:typing` - Typing indicators
- `user:online` - Online status updates
- `conversation:updated` - Conversation metadata changes

## Security Considerations

1. **Authentication**
   - JWT tokens required for all API calls
   - WebSocket connections authenticated on connect

2. **Authorization**
   - Admins can access all conversations
   - Participants verified on message send

3. **Data Validation**
   - All inputs validated on both client and server
   - Message content sanitized

## Future Enhancements

1. **Message Features**
   - File attachments
   - Image/video sharing
   - Voice messages

2. **Admin Features**
   - Conversation assignment
   - Priority management
   - Canned responses

3. **Analytics**
   - Response time tracking
   - Conversation metrics
   - User satisfaction ratings
