# Security & Audit Implementation

## Overview

The Security & Audit module provides comprehensive security monitoring, threat detection, fraud prevention, and audit logging capabilities for the DigiMall Admin platform.

## Available Endpoints

Based on `ADMIN_API_DOCUMENTATION.md`, the following 9 endpoints are available:

### 1. **GET** `/admin/security/events`
Get security events with filtering options.

**Query Parameters:**
- `page` (number, optional): Page number
- `limit` (number, optional): Items per page
- `type` (string, optional): login, logout, permission_change, ip_blocked
- `severity` (string, optional): low, medium, high, critical
- `startDate` (string, optional): ISO date string
- `endDate` (string, optional): ISO date string

**Response:**
```json
{
  "data": [
    {
      "id": "event123",
      "type": "failed_login",
      "severity": "medium",
      "userId": "user456",
      "email": "john@example.com",
      "ipAddress": "192.168.1.100",
      "userAgent": "Mozilla/5.0...",
      "details": {
        "attempts": 5,
        "reason": "Invalid password"
      },
      "timestamp": "2025-10-07T18:30:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 156
  }
}
```

---

### 2. **GET** `/admin/security/alerts`
Get security alerts for active threats and suspicious activities.

**Response:**
```json
{
  "alerts": [
    {
      "id": "alert123",
      "type": "brute_force_attempt",
      "severity": "high",
      "ipAddress": "192.168.1.100",
      "details": "15 failed login attempts in 5 minutes",
      "status": "active",
      "createdAt": "2025-10-07T18:25:00Z"
    }
  ],
  "summary": {
    "total": 8,
    "active": 3,
    "investigating": 2,
    "resolved": 3
  }
}
```

---

### 3. **GET** `/admin/security/audit-log`
Get comprehensive audit log of all admin actions.

**Query Parameters:**
- `days` (number, optional): Number of days (default: 30)

**Response:**
```json
{
  "logs": [
    {
      "id": "log123",
      "action": "user_suspended",
      "performedBy": {
        "staffId": "staff123",
        "staffName": "Admin User",
        "role": "super_admin"
      },
      "target": {
        "type": "user",
        "id": "user456",
        "email": "john@example.com"
      },
      "details": {
        "reason": "Policy violation",
        "duration": 30
      },
      "ipAddress": "192.168.1.1",
      "timestamp": "2025-10-07T18:00:00Z"
    }
  ],
  "meta": {
    "period": "30 days",
    "total": 2450
  }
}
```

---

### 4. **GET** `/admin/security/fraud-detection`
Get fraud detection data for suspicious orders and users.

**Response:**
```json
{
  "suspicious": {
    "orders": 8,
    "users": 12,
    "transactions": 5
  },
  "flaggedOrders": [
    {
      "orderId": "order789",
      "reason": "Multiple cards same IP",
      "riskScore": 85,
      "timestamp": "2025-10-07T15:00:00Z"
    }
  ],
  "flaggedUsers": [
    {
      "userId": "user999",
      "email": "suspicious@example.com",
      "reason": "Multiple failed payments",
      "riskScore": 75,
      "timestamp": "2025-10-07T14:30:00Z"
    }
  ]
}
```

---

### 5. **GET** `/admin/security/threat-intelligence`
Get threat intelligence and known attack patterns.

**Response:**
```json
{
  "knownThreats": 25,
  "blockedIPs": 45,
  "blockedCountries": [],
  "recentThreats": [
    {
      "type": "brute_force",
      "source": "192.168.1.100",
      "attempts": 50,
      "lastAttempt": "2025-10-07T18:30:00Z",
      "status": "blocked"
    }
  ]
}
```

---

### 6. **GET** `/admin/security/login-analytics`
Get login analytics and patterns.

**Query Parameters:**
- `days` (number, optional): Number of days (default: 30)

**Response:**
```json
{
  "period": "30 days",
  "successful": 12500,
  "failed": 250,
  "successRate": 98.0,
  "byHour": [
    {
      "hour": 9,
      "count": 450
    }
  ],
  "byCountry": [
    {
      "country": "Nigeria",
      "count": 11000
    }
  ],
  "topIPs": [
    {
      "ip": "192.168.1.50",
      "count": 120,
      "lastLogin": "2025-10-07T18:30:00Z"
    }
  ]
}
```

---

### 7. **GET** `/admin/security/blocked-ips`
Get list of blocked IP addresses.

**Response:**
```json
{
  "blocked": [
    {
      "ip": "192.168.1.100",
      "reason": "Brute force attack",
      "blockedBy": "staff123",
      "blockedAt": "2025-10-07T18:30:00Z",
      "expiresAt": "2025-10-14T18:30:00Z"
    }
  ],
  "total": 45
}
```

---

### 8. **POST** `/admin/security/block-ip`
Block an IP address (SUPER_ADMIN only).

**Request Body:**
```json
{
  "ipAddress": "192.168.1.100",
  "reason": "Brute force attack detected",
  "duration": 7
}
```

**Response:**
```json
{
  "message": "IP address blocked successfully",
  "data": {
    "ip": "192.168.1.100",
    "blockedUntil": "2025-10-14T19:00:00Z"
  }
}
```

---

### 9. **DELETE** `/admin/security/unblock-ip/:ipAddress`
Unblock an IP address (SUPER_ADMIN only).

**Response:**
```json
{
  "message": "IP address unblocked successfully"
}
```

---

## Implementation Files

### Service Layer
**File:** `src/lib/api/services/security.service.ts`

Implements all 9 endpoints with proper TypeScript typing:
- `getEvents()` - Get security events
- `getAlerts()` - Get security alerts
- `getAuditLog()` - Get audit log
- `getFraudDetection()` - Get fraud detection data
- `getThreatIntelligence()` - Get threat intelligence
- `getLoginAnalytics()` - Get login analytics
- `getBlockedIPs()` - Get blocked IPs
- `blockIP()` - Block IP address
- `unblockIP()` - Unblock IP address

### Type Definitions
**File:** `src/lib/api/types/security.types.ts`

Complete TypeScript interfaces for:
- SecurityEvent
- SecurityAlert
- IPBlock
- FraudDetectionData
- ThreatIntelligence
- LoginAnalytics
- AuditLogEntry
- Request/Response types

### React Hooks
**File:** `src/lib/api/hooks/use-security.ts`

React Query hooks for all security operations:
- `useSecurityEvents()` - Query security events
- `useSecurityAlerts()` - Query security alerts
- `useAuditLog()` - Query audit log
- `useFraudDetection()` - Query fraud detection
- `useThreatIntelligence()` - Query threats
- `useLoginAnalytics()` - Query login data
- `useBlockedIPs()` - Query blocked IPs
- `useBlockIP()` - Mutation to block IP
- `useUnblockIP()` - Mutation to unblock IP

### UI Page
**File:** `src/app/security/page.tsx`

Comprehensive security dashboard with:
- Overview statistics
- Security events table
- Active alerts
- Fraud detection dashboard
- Login analytics charts
- Blocked IPs management
- Audit log viewer
- Real-time monitoring

---

## Key Features

### 1. Security Event Monitoring
- Track all security-related events
- Filter by type, severity, date range
- Real-time event streaming
- Detailed event metadata

### 2. Alert Management
- Active threat detection
- Severity-based prioritization
- Alert investigation workflow
- Resolution tracking

### 3. Audit Logging
- Complete admin action tracking
- User accountability
- Compliance reporting
- Historical analysis

### 4. Fraud Detection
- Suspicious order detection
- User behavior analysis
- Risk scoring
- Pattern recognition

### 5. Threat Intelligence
- Known threat tracking
- Attack pattern recognition
- IP reputation monitoring
- Geolocation analysis

### 6. Login Analytics
- Success/failure rates
- Geographic distribution
- Temporal patterns
- Device tracking

### 7. IP Management
- Block/unblock capabilities
- Temporary and permanent blocks
- Automated threat response
- Whitelist management

---

## Role Requirements

### SUPER_ADMIN
- Full access to all endpoints
- Can block/unblock IPs
- Can modify security settings
- Can export security data

### ADMIN
- Read access to all data
- Can investigate alerts
- Can view audit logs
- Cannot modify security settings

### STAFF
- Limited read access
- Cannot modify security settings
- Cannot access sensitive audit data

---

## Usage Examples

### Fetch Security Events
```typescript
import { useSecurityEvents } from '@/lib/api/hooks/use-security';

function SecurityEventsTable() {
  const { data, isLoading } = useSecurityEvents({
    page: 1,
    limit: 20,
    severity: 'high',
    type: 'failed_login',
  });

  if (isLoading) return <Skeleton />;

  return (
    <div>
      {data?.data.map(event => (
        <div key={event.id}>{event.description}</div>
      ))}
    </div>
  );
}
```

### Block an IP Address
```typescript
import { useBlockIP } from '@/lib/api/hooks/use-security';

function BlockIPButton() {
  const blockIP = useBlockIP();

  const handleBlock = () => {
    blockIP.mutate({
      ipAddress: '192.168.1.100',
      reason: 'Brute force attack detected',
      duration: 7, // days
    });
  };

  return <Button onClick={handleBlock}>Block IP</Button>;
}
```

### View Fraud Detection
```typescript
import { useFraudDetection } from '@/lib/api/hooks/use-security';

function FraudDashboard() {
  const { data } = useFraudDetection();

  return (
    <div>
      <h2>Suspicious Orders: {data?.suspicious.orders}</h2>
      <h2>Flagged Users: {data?.suspicious.users}</h2>
      {data?.flaggedOrders.map(order => (
        <div key={order.orderId}>
          {order.reason} - Risk: {order.riskScore}
        </div>
      ))}
    </div>
  );
}
```

---

## Security Best Practices

1. **Access Control**
   - Role-based permissions enforced
   - Sensitive operations require SUPER_ADMIN
   - Audit all security actions

2. **Data Protection**
   - Encrypt sensitive security data
   - Secure API endpoints
   - Rate limiting on security endpoints

3. **Monitoring**
   - Real-time alert notifications
   - Automated threat response
   - Regular security audits

4. **Compliance**
   - Maintain comprehensive audit logs
   - Track all administrative actions
   - Generate compliance reports

5. **Incident Response**
   - Documented investigation workflow
   - Clear escalation procedures
   - Post-incident analysis

---

## Next Steps

1. **Enhanced Threat Detection**
   - Machine learning-based fraud detection
   - Behavioral analytics
   - Advanced pattern recognition

2. **Automated Response**
   - Auto-block suspicious IPs
   - Automated alert escalation
   - Intelligent threat mitigation

3. **Integration**
   - SIEM integration
   - Third-party threat feeds
   - Security information sharing

4. **Reporting**
   - Executive security dashboards
   - Compliance reports
   - Trend analysis

---

## Support

For security concerns or questions:
- Documentation: See `ADMIN_API_DOCUMENTATION.md`
- API Reference: `/api/v1/admin/security/*`
- Emergency: Contact platform security team
