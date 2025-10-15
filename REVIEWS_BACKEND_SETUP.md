# Reviews Backend Setup Guide

## Issue: 404 Errors on All Review Endpoints

### Problem
All review endpoints are returning **404 Not Found** errors because the backend API has not implemented the reviews endpoints yet.

### Verification
```bash
# Test reviews endpoint - Returns 404 ❌
curl http://localhost:4000/api/v1/admin/reviews

# Test other admin endpoints - Returns 401 (Unauthorized) ✅
curl http://localhost:4000/api/v1/admin/vendors
```

**Result:**
- Reviews endpoint: `404` - Endpoint does not exist
- Other endpoints: `401` - Endpoint exists but requires authentication

---

## Frontend Implementation Status: ✅ COMPLETE

The admin frontend has **fully implemented** all 10 review management endpoints:

1. ✅ GET `/admin/reviews` - Get all reviews
2. ✅ GET `/admin/reviews/:id` - Get review by ID
3. ✅ POST `/admin/reviews/:id/approve` - Approve review
4. ✅ POST `/admin/reviews/:id/reject` - Reject review
5. ✅ POST `/admin/reviews/:id/flag` - Flag review
6. ✅ DELETE `/admin/reviews/:id` - Delete review
7. ✅ GET `/admin/reviews/stats` - Get statistics
8. ✅ POST `/admin/reviews/bulk/moderate` - Bulk moderation
9. ✅ GET `/admin/reviews/vendor/:vendorId/analytics` - Vendor analytics
10. ✅ GET `/admin/reviews/product/:productId/analytics` - Product analytics

### Frontend Components Created
- ✅ Complete type system (TypeScript + Zod)
- ✅ API service layer
- ✅ React Query hooks
- ✅ UI components (ReviewCard, ReviewFilters, etc.)
- ✅ Main reviews dashboard page
- ✅ Review details page
- ✅ Sidebar navigation integration

---

## Required Backend Implementation

### 1. Reviews Model/Schema

The backend needs to create a Review model with the following structure:

```typescript
interface Review {
  _id: string;
  type: 'PRODUCT' | 'VENDOR';
  productId?: ObjectId; // Reference to Product
  vendorId: ObjectId; // Reference to Vendor
  customerId: ObjectId; // Reference to User/Customer
  orderId?: ObjectId; // Reference to Order (for verification)
  rating: number; // 1-5
  title: string;
  content: string;
  images?: string[];
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'FLAGGED';
  verifiedPurchase: boolean;
  helpfulVotes: number;
  isFlagged: boolean;
  flagReason?: string;
  rejectionReason?: string;
  vendorResponse?: {
    message: string;
    respondedAt: Date;
    respondedBy: ObjectId;
  };
  moderatedBy?: ObjectId; // Reference to Staff
  approvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### 2. Backend Routes Required

Create the following routes in the backend (likely in a reviews controller):

#### Base: `/api/v1/admin/reviews`

```javascript
// 1. GET /api/v1/admin/reviews
// Get all reviews with filtering
router.get('/', adminAuth, reviewsController.getAllReviews);

// 2. GET /api/v1/admin/reviews/stats
// Get platform statistics (MUST BE BEFORE /:id route)
router.get('/stats', adminAuth, reviewsController.getStatistics);

// 3. POST /api/v1/admin/reviews/bulk/moderate
// Bulk moderation
router.post('/bulk/moderate', adminAuth, reviewsController.bulkModerate);

// 4. GET /api/v1/admin/reviews/vendor/:vendorId/analytics
// Vendor analytics
router.get('/vendor/:vendorId/analytics', adminAuth, reviewsController.getVendorAnalytics);

// 5. GET /api/v1/admin/reviews/product/:productId/analytics
// Product analytics
router.get('/product/:productId/analytics', adminAuth, reviewsController.getProductAnalytics);

// 6. GET /api/v1/admin/reviews/:id
// Get single review
router.get('/:id', adminAuth, reviewsController.getReviewById);

// 7. POST /api/v1/admin/reviews/:id/approve
// Approve review
router.post('/:id/approve', adminAuth, reviewsController.approveReview);

// 8. POST /api/v1/admin/reviews/:id/reject
// Reject review
router.post('/:id/reject', adminAuth, reviewsController.rejectReview);

// 9. POST /api/v1/admin/reviews/:id/flag
// Flag review
router.post('/:id/flag', adminAuth, reviewsController.flagReview);

// 10. DELETE /api/v1/admin/reviews/:id
// Delete review
router.delete('/:id', adminAuth, reviewsController.deleteReview);
```

**IMPORTANT:** Route order matters! Specific routes (`/stats`, `/bulk/moderate`) must come BEFORE parameterized routes (`/:id`).

### 3. Controller Functions

Each endpoint needs a controller function. Here's a template:

```javascript
// Get all reviews
async getAllReviews(req, res) {
  const {
    page = 1,
    limit = 20,
    type,
    status,
    minRating,
    maxRating,
    productId,
    vendorId,
    customerId,
    isFlagged,
    needsModeration,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    search
  } = req.query;

  const query = {};

  // Apply filters
  if (type) query.type = type;
  if (status) query.status = status;
  if (minRating) query.rating = { $gte: minRating };
  if (maxRating) query.rating = { ...query.rating, $lte: maxRating };
  if (productId) query.productId = productId;
  if (vendorId) query.vendorId = vendorId;
  if (customerId) query.customerId = customerId;
  if (isFlagged) query.isFlagged = true;
  if (needsModeration) query.status = 'PENDING';
  if (search) query.content = { $regex: search, $options: 'i' };

  // Execute query with pagination
  const reviews = await Review.find(query)
    .populate('customerId', 'firstName lastName email avatar')
    .populate('productId', 'title images')
    .populate('vendorId', 'businessName email')
    .populate('moderatedBy', 'firstName lastName email')
    .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
    .skip((page - 1) * limit)
    .limit(limit);

  const total = await Review.countDocuments(query);

  res.json({
    success: true,
    data: {
      reviews,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / limit)
    }
  });
}

// Get statistics
async getStatistics(req, res) {
  const total = await Review.countDocuments();
  const pending = await Review.countDocuments({ status: 'PENDING' });
  const approved = await Review.countDocuments({ status: 'APPROVED' });
  const rejected = await Review.countDocuments({ status: 'REJECTED' });
  const flagged = await Review.countDocuments({ isFlagged: true });

  // Calculate average rating
  const ratingStats = await Review.aggregate([
    { $group: { _id: null, avgRating: { $avg: '$rating' } } }
  ]);

  // Rating distribution
  const ratingDistribution = {};
  for (let i = 1; i <= 5; i++) {
    ratingDistribution[i] = await Review.countDocuments({ rating: i });
  }

  // More statistics...

  res.json({
    success: true,
    data: {
      total,
      pending,
      approved,
      rejected,
      flagged,
      averageRating: ratingStats[0]?.avgRating || 0,
      ratingDistribution,
      // ... more stats
    }
  });
}

// Approve review
async approveReview(req, res) {
  const { id } = req.params;
  const { comment } = req.body;
  const staffId = req.user.id; // From auth middleware

  const review = await Review.findByIdAndUpdate(
    id,
    {
      status: 'APPROVED',
      approvedAt: new Date(),
      moderatedBy: staffId,
      // Store comment if provided
    },
    { new: true }
  ).populate('moderatedBy', 'firstName lastName email');

  // Recalculate product rating
  if (review.productId) {
    await recalculateProductRating(review.productId);
  }

  res.json({
    success: true,
    message: 'Review approved successfully',
    data: review
  });
}

// Reject review
async rejectReview(req, res) {
  const { id } = req.params;
  const { reason } = req.body;
  const staffId = req.user.id;

  if (!reason) {
    return res.status(400).json({
      success: false,
      error: 'Rejection reason is required'
    });
  }

  const review = await Review.findByIdAndUpdate(
    id,
    {
      status: 'REJECTED',
      rejectionReason: reason,
      moderatedBy: staffId,
    },
    { new: true }
  ).populate('moderatedBy', 'firstName lastName email');

  // Recalculate product rating (exclude rejected)
  if (review.productId) {
    await recalculateProductRating(review.productId);
  }

  res.json({
    success: true,
    message: 'Review rejected successfully',
    data: review
  });
}

// Flag review
async flagReview(req, res) {
  const { id } = req.params;
  const { reason } = req.body;
  const staffId = req.user.id;

  if (!reason) {
    return res.status(400).json({
      success: false,
      error: 'Flag reason is required'
    });
  }

  const review = await Review.findByIdAndUpdate(
    id,
    {
      isFlagged: true,
      status: 'FLAGGED',
      flagReason: reason,
      moderatedBy: staffId,
    },
    { new: true }
  ).populate('moderatedBy', 'firstName lastName email');

  res.json({
    success: true,
    message: 'Review flagged successfully',
    data: review
  });
}

// Delete review
async deleteReview(req, res) {
  const { id } = req.params;

  const review = await Review.findById(id);
  if (!review) {
    return res.status(404).json({
      success: false,
      error: 'Review not found'
    });
  }

  await review.deleteOne();

  // Recalculate product rating
  if (review.productId) {
    await recalculateProductRating(review.productId);
  }

  res.json({
    success: true,
    message: 'Review deleted successfully'
  });
}

// Bulk moderate
async bulkModerate(req, res) {
  const { reviewIds, action, reason } = req.body;
  const staffId = req.user.id;

  if (!reviewIds || reviewIds.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'No review IDs provided'
    });
  }

  if (['reject', 'flag'].includes(action) && !reason) {
    return res.status(400).json({
      success: false,
      error: 'Reason is required for this action'
    });
  }

  let updateData = {};

  switch (action) {
    case 'approve':
      updateData = {
        status: 'APPROVED',
        approvedAt: new Date(),
        moderatedBy: staffId,
      };
      break;
    case 'reject':
      updateData = {
        status: 'REJECTED',
        rejectionReason: reason,
        moderatedBy: staffId,
      };
      break;
    case 'flag':
      updateData = {
        isFlagged: true,
        status: 'FLAGGED',
        flagReason: reason,
        moderatedBy: staffId,
      };
      break;
    case 'delete':
      await Review.deleteMany({ _id: { $in: reviewIds } });
      return res.json({
        success: true,
        message: `Successfully deleted ${reviewIds.length} reviews`,
        data: { processed: reviewIds.length, action }
      });
  }

  const result = await Review.updateMany(
    { _id: { $in: reviewIds } },
    updateData
  );

  // Recalculate ratings for affected products
  const reviews = await Review.find({ _id: { $in: reviewIds } });
  const productIds = [...new Set(reviews.map(r => r.productId).filter(Boolean))];
  for (const productId of productIds) {
    await recalculateProductRating(productId);
  }

  res.json({
    success: true,
    message: `Successfully ${action}d ${result.modifiedCount} reviews`,
    data: {
      processed: result.modifiedCount,
      action
    }
  });
}

// Vendor analytics
async getVendorAnalytics(req, res) {
  const { vendorId } = req.params;

  const totalReviews = await Review.countDocuments({ vendorId });

  const ratingStats = await Review.aggregate([
    { $match: { vendorId: new ObjectId(vendorId) } },
    { $group: { _id: null, avgRating: { $avg: '$rating' } } }
  ]);

  const ratingDistribution = {};
  for (let i = 1; i <= 5; i++) {
    ratingDistribution[i] = await Review.countDocuments({
      vendorId,
      rating: i
    });
  }

  // More analytics...

  res.json({
    success: true,
    data: {
      vendorId,
      totalReviews,
      averageRating: ratingStats[0]?.avgRating || 0,
      ratingDistribution,
      // ... more data
    }
  });
}

// Product analytics
async getProductAnalytics(req, res) {
  const { productId } = req.params;

  const totalReviews = await Review.countDocuments({ productId });

  const ratingStats = await Review.aggregate([
    { $match: { productId: new ObjectId(productId) } },
    { $group: { _id: null, avgRating: { $avg: '$rating' } } }
  ]);

  const ratingDistribution = {};
  for (let i = 1; i <= 5; i++) {
    ratingDistribution[i] = await Review.countDocuments({
      productId,
      rating: i
    });
  }

  // More analytics...

  res.json({
    success: true,
    data: {
      productId,
      totalReviews,
      averageRating: ratingStats[0]?.avgRating || 0,
      ratingDistribution,
      // ... more data
    }
  });
}

// Helper: Recalculate product rating
async function recalculateProductRating(productId) {
  const stats = await Review.aggregate([
    {
      $match: {
        productId: new ObjectId(productId),
        status: 'APPROVED' // Only count approved reviews
      }
    },
    {
      $group: {
        _id: null,
        avgRating: { $avg: '$rating' },
        count: { $sum: 1 }
      }
    }
  ]);

  await Product.findByIdAndUpdate(productId, {
    rating: stats[0]?.avgRating || 0,
    reviewCount: stats[0]?.count || 0
  });
}
```

### 4. Authentication Middleware

Ensure the admin authentication middleware is applied:

```javascript
// Middleware to check admin role
const adminAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const staff = await Staff.findById(decoded.id);

    if (!staff || !['ADMIN', 'SUPER_ADMIN'].includes(staff.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    req.user = staff;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};
```

---

## Testing the Backend Implementation

Once the backend is implemented, test with these curl commands:

### 1. Test Get All Reviews
```bash
curl -X GET http://localhost:4000/api/v1/admin/reviews \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 2. Test Get Statistics
```bash
curl -X GET http://localhost:4000/api/v1/admin/reviews/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Test Approve Review
```bash
curl -X POST http://localhost:4000/api/v1/admin/reviews/REVIEW_ID/approve \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"comment": "Looks good!"}'
```

### 4. Test Reject Review
```bash
curl -X POST http://localhost:4000/api/v1/admin/reviews/REVIEW_ID/reject \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"reason": "Inappropriate content"}'
```

---

## Integration Steps

1. **Backend Team**: Implement the 10 review endpoints following the specification above
2. **Backend Team**: Create database migrations for the Review model
3. **Backend Team**: Add reviews routes to the main API router
4. **Backend Team**: Test all endpoints with Postman/Thunder Client
5. **Frontend Team**: Test the admin UI once backend is ready
6. **Both Teams**: Coordinate on any data structure adjustments needed

---

## Expected Response Formats

All backend responses should follow this structure:

### Success Response
```json
{
  "success": true,
  "message": "Optional success message",
  "data": {
    // Response data here
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

---

## Next Steps

1. **Immediate**: Share this document with the backend development team
2. **Backend**: Implement all 10 review endpoints
3. **Backend**: Add database indexes for performance
4. **Backend**: Test endpoints thoroughly
5. **Frontend**: Test the UI once backend is ready
6. **Both**: Deploy to staging for integration testing

---

## Questions?

If you have questions about:
- **Frontend implementation**: Check `REVIEWS_IMPLEMENTATION.md`
- **API specification**: Check `ADMIN_API_DOCUMENTATION.md` (lines 4081-4755)
- **Type definitions**: Check `src/lib/api/types/reviews.types.ts`
- **Backend questions**: Contact the backend development team

---

## Summary

✅ **Frontend**: Fully implemented and ready
❌ **Backend**: Needs implementation
📋 **Status**: Waiting for backend API endpoints

Once the backend implements these endpoints, the reviews management system will be fully operational!
