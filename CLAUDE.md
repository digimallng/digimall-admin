# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with the digiMall Admin Application.

## Project Overview

The **digiMall Admin Application** is a dedicated Next.js 15 application for platform administration within the digiMall e-commerce ecosystem. This standalone admin portal provides comprehensive tools for platform management, vendor oversight, order monitoring, dispute resolution, analytics, and system administration.

## Repository Information

- **Location**: `/Users/tanta/WebstormProjects/jyv-desktop-landing/project-digimall-admin`
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Package Manager**: pnpm

## Common Development Commands

### Environment Setup
```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Configure all required variables for admin app
```

### Development Servers
```bash
# Start development server
pnpm dev

# Build application
pnpm build

# Start production server
pnpm start

# Type checking
pnpm type-check

# Linting
pnpm lint
pnpm lint:fix
```

### Testing
```bash
# Run tests
pnpm test

# Run tests with coverage
pnpm test:coverage

# Run E2E tests
pnpm test:e2e
```

## Architecture Overview

### Core Structure
- **Next.js 15 App Router**: Modern routing with server components
- **TypeScript**: Full type safety throughout the application
- **Tailwind CSS**: Utility-first CSS framework
- **Component Library**: Custom UI components with shadcn/ui base
- **API Integration**: RESTful API calls to digiMall microservices
- **Real-time Features**: WebSocket integration for live updates
- **Authentication**: NextAuth.js for secure admin authentication

### Key Features

#### Platform Administration
- **Dashboard Overview**: Real-time platform metrics and KPIs
- **System Health**: Service monitoring and status checks
- **Configuration**: Platform settings and feature flags
- **Security Monitoring**: Security alerts and threat detection

#### Vendor Management
- **Vendor Approval**: Review and approve vendor applications
- **Vendor Performance**: Track vendor metrics and ratings
- **Account Management**: Vendor account status and permissions
- **Compliance Monitoring**: Ensure vendor policy compliance

#### Order Oversight
- **Order Monitoring**: Real-time order tracking across platform
- **Dispute Resolution**: Handle customer-vendor disputes
- **Refund Management**: Process and approve refunds
- **Fraud Detection**: Identify and prevent fraudulent activities

#### User Administration
- **User Management**: Customer and vendor account administration
- **Role Management**: Admin role and permission management
- **Support Tickets**: Handle customer support requests
- **Account Verification**: Manual verification processes

#### Financial Operations
- **Commission Management**: Platform commission tracking and adjustment
- **Payment Oversight**: Monitor payment flows and escrow operations
- **Revenue Analytics**: Platform revenue and financial reporting
- **Payout Management**: Vendor payout processing and scheduling

#### Content Management
- **Category Management**: Product category structure and policies
- **Product Moderation**: Review and approve product listings
- **Content Policies**: Enforce platform content guidelines
- **Promotional Management**: Platform-wide promotions and campaigns

#### Analytics & Reporting
- **Platform Analytics**: Comprehensive platform performance metrics
- **Business Intelligence**: Advanced reporting and insights
- **Market Analysis**: Market trends and competitive analysis
- **Operational Reports**: Detailed operational performance reports

#### Communication Systems
- **Admin Chat**: Real-time communication with vendors and customers
- **Notification Center**: Platform-wide notification management
- **Broadcast Messaging**: System-wide announcements and alerts
- **Support Integration**: Integrated customer support system

## Directory Structure

```
src/
├── app/                    # Next.js 15 App Router
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Main dashboard page
│   ├── users/             # User management
│   ├── vendors/           # Vendor management
│   ├── orders/            # Order oversight
│   ├── products/          # Product moderation
│   ├── categories/        # Category management
│   ├── disputes/          # Dispute resolution
│   ├── escrow/            # Escrow management
│   ├── analytics/         # Analytics and reporting
│   ├── notifications/     # Notification management
│   ├── settings/          # Platform settings
│   ├── security/          # Security monitoring
│   ├── reports/           # Financial and operational reports
│   ├── system/            # System administration
│   ├── chat/              # Admin chat system
│   ├── support/           # Customer support
│   └── api/               # API routes and utilities
├── components/            # Reusable UI components
│   ├── chat/              # Chat system components
│   ├── layout/            # Layout components
│   ├── modals/            # Modal dialogs
│   ├── notifications/     # Notification components
│   ├── escrow/            # Escrow management components
│   ├── ui/                # Base UI components
│   └── vendor/            # Vendor-specific components
├── hooks/                 # Custom React hooks
├── services/              # API service functions
├── lib/                   # Utility functions and configurations
├── providers/             # React context providers
├── contexts/              # React contexts
└── types/                 # TypeScript type definitions
```

## Key Patterns and Conventions

### Component Structure
- **Server Components**: Use by default for better performance
- **Client Components**: Only when interactivity is needed
- **Admin-specific Components**: Specialized components for admin workflows
- **Custom Hooks**: Extract reusable admin logic
- **TypeScript**: Strict typing for all admin operations

### API Integration
- **Service Layer**: Centralized API calls in `lib/api/services/` directory
- **React Query**: Data fetching, caching, and synchronization
- **Error Handling**: Comprehensive error boundaries and admin notifications
- **Loading States**: Proper loading indicators for all async operations
- **Proxy System**: Smart proxy routing to microservices

### State Management
- **React Context**: Global admin state management
- **React Query**: Server state management
- **Local State**: useState for component-specific state
- **Chat Context**: Real-time chat state management

### Security Implementation
- **NextAuth.js**: Secure admin authentication
- **Role-based Access**: Admin permission levels
- **JWT Validation**: Token-based API security
- **Audit Logging**: Track all admin actions

## API Integration

### Service Endpoints
The admin app integrates with all digiMall microservices:

- **Auth Service**: `http://localhost:4200` - Authentication and authorization
- **Product Service**: `http://localhost:4400` - Product management
- **User Service**: `http://localhost:4300` - User administration
- **Order Service**: `http://localhost:4500` - Order processing
- **Payment Service**: `http://localhost:3006` - Payment processing
- **Bargaining Service**: `http://localhost:4600` - Price negotiation oversight
- **Admin Service**: `http://localhost:4800` - Admin operations
- **Wallet Service**: `http://localhost:4900` - Financial operations
- **Chat Service**: `http://localhost:4700` - Real-time messaging
- **Notification Service**: `http://localhost:5100` - Notifications

### Proxy Configuration
The app uses a comprehensive proxy system (`/api/proxy/[...path]/route.ts`) that:
- Routes requests to appropriate microservices
- Handles admin authentication headers automatically
- Provides service discovery and load balancing
- Includes request/response logging for audit trails

### Data Fetching Patterns
```typescript
// Admin service layer example
export class VendorService {
  async getVendorsPendingApproval(): Promise<Vendor[]> {
    const response = await api.get<VendorResponse>('/vendors/pending');
    return response.data;
  }

  async approveVendor(vendorId: string): Promise<void> {
    await api.patch(`/vendors/${vendorId}/approve`);
  }
}

// Admin hook usage
export function usePendingVendors() {
  return useQuery({
    queryKey: ['vendors', 'pending'],
    queryFn: () => vendorService.getVendorsPendingApproval(),
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}

// Admin component usage
function VendorApprovalDashboard() {
  const { data: vendors, loading, error } = usePendingVendors();
  
  if (loading) return <LoadingDashboard />;
  if (error) return <ErrorMessage error={error} />;
  
  return <VendorApprovalList vendors={vendors} />;
}
```

## Security Features

### Authentication & Authorization
- **Admin Authentication**: NextAuth.js with custom providers
- **Multi-factor Authentication**: 2FA for enhanced security
- **Session Management**: Secure session handling
- **Role-based Permissions**: Granular admin permissions

### Audit & Compliance
- **Action Logging**: Log all admin actions with timestamps
- **Data Privacy**: GDPR and privacy compliance tools
- **Security Monitoring**: Real-time security threat detection
- **Access Controls**: IP restrictions and access logging

## Chat System Implementation

### Real-time Communication
- **WebSocket Integration**: Live chat with vendors and customers
- **File Sharing**: Secure file upload and sharing
- **Chat History**: Complete conversation history
- **Multi-participant**: Group chat capabilities

### Chat Features
- **Typing Indicators**: Real-time typing status
- **Message Status**: Read receipts and delivery confirmation
- **File Attachments**: Support for documents, images, and media
- **Offline Support**: Message queuing for offline scenarios
- **Mobile Optimization**: Touch-friendly mobile interface

## Performance Optimization

### Next.js 15 Features
- **Server Components**: Reduced client-side JavaScript
- **Streaming**: Progressive page loading for large datasets
- **Image Optimization**: Optimized admin dashboard images
- **Bundle Optimization**: Code splitting for admin modules

### Caching Strategy
- **React Query**: Intelligent admin data caching
- **Real-time Updates**: WebSocket updates for live data
- **Background Refresh**: Automatic data refresh
- **Offline Capability**: Basic offline functionality

## Development Guidelines

### Code Quality
- **ESLint**: Admin-specific linting rules
- **Prettier**: Consistent code formatting
- **TypeScript**: Strict type checking for admin operations
- **Testing**: Comprehensive testing for critical admin functions

### Admin-Specific Patterns
- **Confirmation Dialogs**: Require confirmation for destructive actions
- **Audit Trails**: Log all admin operations
- **Error Handling**: Graceful handling of admin errors
- **Data Validation**: Server-side validation for all admin inputs

### Security Best Practices
- **Input Sanitization**: Sanitize all admin inputs
- **Permission Checks**: Verify permissions for all actions
- **Secure Communication**: HTTPS enforcement
- **Data Encryption**: Encrypt sensitive admin data

## Environment Configuration

### Environment Variables
```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000/api/proxy
NEXT_PUBLIC_WS_URL=ws://localhost:3000

# Authentication
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=http://localhost:3000

# Database (if needed)
DATABASE_URL=postgresql://admin:password@localhost:5432/digimall_admin

# External Services
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
SENTRY_DSN=your-sentry-dsn

# Feature Flags
NEXT_PUBLIC_ENABLE_CHAT=true
NEXT_PUBLIC_ENABLE_ANALYTICS=true
```

## Testing Strategy

### Test Types
- **Unit Tests**: Admin component and function testing
- **Integration Tests**: Admin API integration testing
- **E2E Tests**: Complete admin workflow testing
- **Security Tests**: Admin security and permission testing

### Testing Critical Flows
- **Vendor Approval Process**: Complete approval workflow
- **Dispute Resolution**: End-to-end dispute handling
- **Payment Processing**: Financial operation testing
- **Chat Functionality**: Real-time communication testing

## Deployment

### Build Process
```bash
# Production build
pnpm build

# Docker build
docker build -t digimall-admin .

# Start production server
pnpm start
```

### Production Considerations
- **Environment Variables**: Production admin configurations
- **SSL Certificates**: Enhanced security for admin portal
- **Access Restrictions**: IP whitelisting for admin access
- **Monitoring**: Comprehensive admin action monitoring

## Important Notes

### Development Workflow
- **Work Directory**: Always work in `/Users/tanta/WebstormProjects/jyv-desktop-landing/project-digimall-admin`
- **Ignore Monorepo**: Do NOT work on admin code in the main monorepo's `apps/admin/` directory
- **Independent Repository**: This is a standalone application
- **Dependencies**: Manage dependencies independently

### Admin Responsibilities
- **Platform Health**: Monitor overall platform performance
- **User Safety**: Ensure user safety and security
- **Business Operations**: Support business operations and growth
- **Compliance**: Maintain regulatory and policy compliance

### Code Standards
- **No Emojis**: Avoid emojis in commits and documentation unless explicitly requested
- **Conventional Commits**: Use conventional commit format
- **Security First**: Prioritize security in all admin operations
- **User Experience**: Ensure efficient admin workflows

### Critical Operations
- **Data Integrity**: Maintain data integrity across all operations
- **System Reliability**: Ensure high availability for admin functions
- **Audit Compliance**: Maintain comprehensive audit trails
- **Security Monitoring**: Continuous security monitoring and alerts

This admin application is designed to provide a comprehensive, secure, and efficient platform administration experience for the digiMall e-commerce platform.