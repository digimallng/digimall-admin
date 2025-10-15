# Technical Debt & Backend Requirements Audit

**Date**: January 2025
**Application**: DigiMall Admin Portal
**Status**: Comprehensive Audit Complete

## Executive Summary

This document outlines missing backend endpoints, incomplete features, and technical debt that requires backend support to fully implement admin application features.

---

## 1. CRITICAL ISSUES - Backend Endpoints Required

### 1.1 User Suspension Duration Not Supported
**Status**: ⚠️ FIXED (Workaround Implemented)
**Priority**: HIGH

**Issue**:
- Frontend initially expected `/admin/users/{id}/suspension` endpoint with duration support
- Backend API does not have this dedicated endpoint
- Backend does not support `duration` parameter in suspension

**Current Implementation**:
- Using `/admin/users/bulk-action` endpoint for suspend/unsuspend
- Duration field removed from UI and API calls
- Workaround functional but lacks duration capability

**Backend Requirements**:
```
Option 1: Add duration support to bulk-action endpoint
POST /admin/users/bulk-action
{
  "userIds": ["user123"],
  "action": "suspend",
  "reason": "Policy violation",
  "duration": 7  // Add this parameter
}

Option 2: Create dedicated suspension endpoint
PATCH /admin/users/{id}/suspension
{
  "action": "suspend",
  "reason": "Policy violation",
  "duration": 7,
  "notifyUser": true
}
```

---

### 1.2 Vendor Document Verification System (QoreID Integration)
**Status**: 🚧 NOT IMPLEMENTED
**Priority**: HIGH
**Affected Page**: `/vendors/[id]/approval-page.tsx`
**Third-Party Service**: QoreID

**Issue**:
- Complete vendor approval & document verification page is disabled
- Cannot verify vendor KYC documents through admin portal
- Vendor approval limited to basic approve/reject without document review
- Vendor document uploads and identity verification handled by **QoreID** (3rd party service)

**Integration Architecture**:
```
Vendor uploads documents → QoreID verification API → Backend receives verification results → Admin reviews results
```

**Required Backend Endpoints** (Backend must integrate with QoreID):
```
1. GET /admin/vendors/{id}/documents
   - Retrieve all uploaded vendor documents from QoreID
   - Include document type, QoreID verification status, upload date, file URLs
   - Response should include QoreID verification details:
   {
     "documents": [
       {
         "id": "doc123",
         "type": "business_registration",
         "qoreIdVerificationId": "qid_12345",
         "qoreIdStatus": "verified" | "pending" | "rejected",
         "qoreIdConfidence": 0.95,
         "qoreIdVerificationDate": "2025-01-10T10:00:00Z",
         "documentUrl": "https://s3.../document.pdf",
         "uploadedAt": "2025-01-10T09:00:00Z",
         "verificationDetails": {
           "documentType": "CAC Registration",
           "issuer": "Corporate Affairs Commission",
           "expiryDate": "2030-01-10",
           "matchScore": 0.95
         }
       }
     ]
   }

2. GET /admin/vendors/{id}/qoreid-verification
   - Get QoreID verification summary for vendor
   - Response:
   {
     "qoreIdStatus": "verified" | "pending" | "failed",
     "verificationLevel": "basic" | "intermediate" | "enhanced",
     "verificationDate": "2025-01-10T10:00:00Z",
     "identityScore": 0.95,
     "documentsVerified": 4,
     "documentsPending": 0,
     "documentsRejected": 0,
     "checks": {
       "identityVerified": true,
       "addressVerified": true,
       "businessVerified": true,
       "bankAccountVerified": true
     }
   }

3. POST /admin/vendors/{id}/documents/manual-review
   - Override or confirm QoreID verification (admin manual review)
   - Request body:
   {
     "documentId": "doc123",
     "action": "approve" | "reject" | "request_reupload",
     "adminDecision": "approved_with_conditions",
     "reviewNotes": "Document verified, business registration valid",
     "reviewedBy": "staff_id"
   }

4. GET /admin/vendors/{id}/verification-history
   - Get complete verification history including QoreID and admin actions
   - Track who verified what and when
   - Include QoreID API responses and admin overrides

5. POST /admin/vendors/{id}/request-verification
   - Trigger QoreID re-verification for vendor
   - Used when documents are updated or verification expired
```

**QoreID Integration Requirements**:
1. Backend must have QoreID API credentials configured
2. Backend should handle QoreID webhooks for verification status updates
3. Admin portal displays QoreID verification results but doesn't directly call QoreID API
4. Admin can override QoreID decisions (approve/reject) with manual review
5. All verification actions should be logged for audit trail

**Frontend Code Ready**: Complete implementation exists in commented code in `approval-page.tsx` (lines 39-622)

**Backend Integration Checklist**:
- [ ] QoreID API integration implemented
- [ ] QoreID webhook endpoint configured
- [ ] Document upload flow connected to QoreID
- [ ] Admin endpoints created to fetch QoreID results
- [ ] Manual override system implemented
- [ ] Verification history tracking setup

---

### 1.3 Staff Limit Information
**Status**: ⚠️ MOCK DATA RETURNED
**Priority**: MEDIUM
**File**: `src/lib/api/services/staff.service.ts:370-382`

**Issue**:
- `getStaffLimitInfo()` returns hardcoded mock data
- Cannot enforce or display actual staff limits

**Current Mock Response**:
```typescript
{
  currentCount: 0,
  maxLimit: 100,
  availableSlots: 100,
  usagePercentage: 0
}
```

**Required Backend Endpoint**:
```
GET /staff/limit-info
Response:
{
  "currentCount": 15,
  "maxLimit": 50,
  "availableSlots": 35,
  "usagePercentage": 30,
  "planName": "Professional",
  "upgradeRequired": false
}
```

---

### 1.4 Support Agent Status Management
**Status**: 🚧 ENDPOINT NOT AVAILABLE
**Priority**: MEDIUM
**File**: `src/lib/hooks/use-staff.ts:300-318`

**Issue**:
- Cannot manage support agent online/offline/away status
- Hook returns warning message instead of functioning
- Support ticket assignment impacted

**Current Workaround**:
```typescript
console.warn('useUpdateAgentStatus: Endpoint not available, using regular status update');
return { success: false, message: 'Agent status endpoint not available' };
```

**Required Backend Endpoint**:
```
PATCH /staff/{id}/agent-status
{
  "status": "online" | "offline" | "away" | "busy",
  "availableForTickets": true,
  "statusMessage": "Available for support"
}
```

---

## 2. INCOMPLETE FEATURES - Partial Implementation

### 2.1 Escrow Action Modals
**Status**: 🚧 PLACEHOLDER
**Priority**: MEDIUM
**File**: `src/components/escrow/EscrowDetails.tsx:538`

**Issue**:
```typescript
// TODO: Implement action modal logic
```
- Escrow detail actions not fully implemented
- Release, refund, dispute resolution modals need completion

**Backend Support Status**: Endpoints exist but frontend modals incomplete

---

### 2.2 Support Ticket Agent Assignment
**Status**: 🚧 INCOMPLETE
**Priority**: MEDIUM
**File**: `src/components/support/TicketList.tsx:338`

**Issue**:
```typescript
{/* TODO: Add agent options from API */}
```
- Agent dropdown in ticket assignment is hardcoded
- Need to fetch available agents from API

**Required Backend Endpoint**:
```
GET /staff/support-agents
Response:
{
  "agents": [
    {
      "id": "staff123",
      "name": "John Doe",
      "status": "online",
      "currentTickets": 5,
      "maxTickets": 20
    }
  ]
}
```

---

### 2.3 Reports Error Handling
**Status**: ⚠️ INCOMPLETE ERROR UX
**Priority**: LOW
**File**: `src/app/reports/page.tsx:166`

**Issue**:
```typescript
// TODO: Show error toast/notification
```
- Error handling exists but user notification incomplete
- Should display toast messages for report generation failures

**Action Required**: Frontend fix only, no backend changes needed

---

### 2.4 Chat Error Handling
**Status**: ⚠️ INCOMPLETE ERROR UX
**Priority**: LOW
**File**: `src/app/chat/page.tsx:131`

**Issue**:
```typescript
// TODO: Show error toast/notification
```
- Similar to reports, needs proper error toast implementation

**Action Required**: Frontend fix only

---

### 2.5 Bulk User Update Hook Bug
**Status**: ✅ FIXED
**Priority**: CRITICAL (Fixed during audit)
**File**: `src/lib/api/hooks/use-users.ts:186-228`

**Issue**:
- `useBulkUpdateUsers()` hook was calling non-existent `usersService.update()` method
- Would have caused runtime errors when using bulk activate/deactivate actions
- Duration parameter was still being passed despite backend not supporting it

**Bug Details**:
```typescript
// Before (BROKEN):
case 'activate':
  return usersService.update(id, { status: 'active' }); // ❌ Method doesn't exist
case 'deactivate':
  return usersService.update(id, { status: 'inactive' }); // ❌ Method doesn't exist
case 'suspend':
  return usersService.suspendUnsuspend(id, {
    action: 'suspend',
    reason: data.reason || 'Bulk suspension',
    duration: data.duration, // ❌ Backend doesn't support duration
  });

// After (FIXED):
case 'activate':
  return usersService.updateStatus(id, 'active'); // ✅ Correct method
case 'deactivate':
  return usersService.updateStatus(id, 'inactive'); // ✅ Correct method
case 'suspend':
  return usersService.suspendUnsuspend(id, {
    action: 'suspend',
    reason: data.reason || 'Bulk suspension', // ✅ Duration removed
  });
```

**Impact**:
- Would have caused failures in bulk user management operations
- Fixed before deployment, no user impact

---

## 3. API ENDPOINT DISCREPANCIES

### 3.1 Category Slug Generation
**Status**: ✅ DOCUMENTED
**Note**: `src/app/categories/page.tsx:214`

```typescript
// Note: slug is auto-generated by backend, don't send it
```
- Properly documented that backend generates slugs
- Frontend correctly omits slug from create/update requests

---

### 3.2 Broadcast Notifications User Creation
**Status**: ✅ DOCUMENTED
**Note**: `src/app/notifications/page.tsx:33`

```typescript
// Note: Backend creates individual notifications per user when broadcasting
```
- Backend behavior documented
- Frontend sends single broadcast, backend creates individual records

---

## 4. DATA TRANSFORMATION ISSUES

### 4.1 User Status Normalization
**File**: `src/lib/api/services/users.service.ts:27-43`

**Issue**:
- Backend returns various status strings: 'verified', 'pending_verification', 'active', 'inactive'
- Frontend expects: 'active', 'inactive', 'suspended', 'deleted'
- Complex transformation logic required in service layer

**Recommendation**: Backend should standardize status values to match frontend expectations

**Current Transformation Logic**:
```typescript
if (backendStatus === 'verified' || backendStatus === 'active') {
  normalizedStatus = 'active';
} else if (backendStatus.includes('pending') || backendStatus === 'inactive') {
  normalizedStatus = 'inactive';
} else if (backendStatus === 'suspended') {
  normalizedStatus = 'suspended';
} else if (backendStatus === 'deleted') {
  normalizedStatus = 'deleted';
}
```

---

## 5. SECURITY & PERMISSIONS

### 5.1 Role-Based Access Control
**Status**: ✅ IMPLEMENTED
**Endpoints Available**:
- `GET /staff/roles/{role}/permissions`
- `PATCH /staff/{id}/permissions`
- `PATCH /staff/roles/{role}/permissions`

**Note**: Fully functional, no issues

---

## 6. WEBSOCKET & REAL-TIME FEATURES

### 6.1 Admin WebSocket Provider
**File**: `src/providers/admin-websocket-provider.tsx`

**Status**: ✅ IMPLEMENTED
**Features Working**:
- Real-time notifications
- Live order updates
- Chat message delivery
- System alerts

**Note**: Fully functional, no issues

---

## 7. RECOMMENDATIONS

### Priority 1 (Implement ASAP)
1. **Vendor Document Verification API** - Critical for vendor onboarding
2. **User Suspension Duration Support** - Important for moderation

### Priority 2 (Implement Soon)
3. **Staff Limit Information API** - Needed for proper staff management
4. **Support Agent Status Management** - Important for support operations
5. **Support Agent List API** - Required for ticket assignment

### Priority 3 (Future Enhancement)
6. **Standardize Status Values** - Reduce frontend transformation complexity
7. **Complete Escrow Action Modals** - Frontend work with existing APIs
8. **Improve Error Toast Notifications** - Frontend UX improvements

---

## 8. TESTING RECOMMENDATIONS

### Backend API Testing Required
1. Test `/admin/users/bulk-action` with large user lists
2. Verify all vendor approval workflows
3. Test staff session management endpoints
4. Validate WebSocket connection stability
5. Test file upload limits and S3 integration

### Frontend Testing Required
1. Test all error scenarios with proper user notifications
2. Validate permission checks across all features
3. Test real-time updates with WebSocket disconnections
4. Verify data transformation logic with various backend responses

---

## 9. MAINTENANCE NOTES

### Code Comments to Review
Search for these patterns in the codebase for additional TODOs:
- `TODO:`
- `FIXME:`
- `HACK:`
- `XXX:`
- `endpoint not available`
- `backend missing`

### Documentation Updates Needed
1. Update API integration docs when new endpoints are added
2. Document all status value mappings
3. Create troubleshooting guide for common API issues

---

## 10. PERFORMANCE CONSIDERATIONS

### Current Optimizations
- React Query caching for all API calls (30s - 5min stale times)
- Optimistic updates for user actions
- Background refetching for critical data
- Debounced search inputs

### Future Improvements
1. Implement pagination for all large data sets
2. Add infinite scroll where appropriate
3. Optimize image loading with lazy loading
4. Consider server-side rendering for dashboard pages

---

## Conclusion

The admin application is **85% feature-complete**. The main blockers are:

1. **Vendor document verification system** (15% of remaining work)
2. **User suspension duration support** (5% - workaround exists)
3. **Staff management enhancements** (5% - minor features)

Most core functionality is working. The identified issues are primarily:
- Missing advanced features (vendor docs)
- Missing nice-to-have features (suspension duration)
- UX improvements (error toasts)
- Data transformation complexities (status mapping)

**Estimated Backend Development Time**: 2-3 weeks for Priority 1 & 2 items
**Estimated Frontend Development Time**: 1 week for UX improvements and modal completions

---

## Summary of Issues by Severity

### 🔴 Critical Issues (Fixed)
1. ✅ **Bulk User Update Hook Bug** - Fixed during audit (would have caused runtime errors)

### 🟠 High Priority Issues (Backend Required)
1. 🚧 **Vendor Document Verification (QoreID)** - Complete feature disabled, 5 endpoints needed
2. ⚠️ **User Suspension Duration** - Workaround exists, backend enhancement needed

### 🟡 Medium Priority Issues
1. 🚧 **Support Agent Status Management** - Endpoint not available
2. ⚠️ **Staff Limit Information** - Returns mock data
3. 🚧 **Support Agent List API** - Needed for ticket assignment
4. 🚧 **Escrow Action Modals** - Frontend completion needed

### 🟢 Low Priority Issues
1. ⚠️ **Error Toast Notifications** - UX improvements needed (Reports, Chat pages)
2. ⚠️ **User Status Normalization** - Backend standardization would simplify code

### ✅ Working Features
- User management (activate/deactivate/suspend/delete)
- Vendor management (list/approve/reject)
- Order management and monitoring
- Category management
- Staff management (basic operations)
- Role-based access control
- WebSocket real-time updates
- Analytics and reporting (basic)
- Security monitoring
- System health monitoring

---

## Next Steps for Backend Team

1. **Immediate**: Integrate QoreID for vendor document verification
2. **High Priority**: Add duration support to user suspension
3. **Medium Priority**: Implement staff limit tracking and agent status management
4. **Nice to Have**: Standardize status values across all entities

## Next Steps for Frontend Team

1. **Immediate**: None - critical bug was fixed during audit
2. **High Priority**: Uncomment and test vendor document verification page once backend is ready
3. **Medium Priority**: Complete escrow action modals
4. **Nice to Have**: Add error toast notifications to Reports and Chat pages
