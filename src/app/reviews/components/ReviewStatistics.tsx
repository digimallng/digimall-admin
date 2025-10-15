'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatsCard } from '@/components/ui/StatsCard';
import { RatingStars } from '@/components/ui/rating-stars';
import {
  Star,
  MessageSquare,
  Clock,
  CheckCircle,
  XCircle,
  Flag,
  TrendingUp,
  ShieldCheck,
} from 'lucide-react';
import type { ReviewStatistics } from '@/lib/api/types/reviews.types';
import { cn } from '@/lib/utils';

interface ReviewStatisticsProps {
  stats: ReviewStatistics;
}

export function ReviewStatisticsComponent({ stats }: ReviewStatisticsProps) {
  const ratingDistributionData = Object.entries(stats.ratingDistribution).reverse();
  const maxCount = Math.max(...Object.values(stats.ratingDistribution));

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Reviews"
          value={stats.total.toLocaleString()}
          icon={MessageSquare}
          trend={{
            value: stats.reviewsLast30Days,
            label: 'Last 30 days',
            isPositive: true,
          }}
        />
        <StatsCard
          title="Average Rating"
          value={stats.averageRating.toFixed(1)}
          icon={Star}
          description={
            <RatingStars rating={stats.averageRating} size="sm" showValue={false} />
          }
        />
        <StatsCard
          title="Pending Moderation"
          value={stats.pending.toLocaleString()}
          icon={Clock}
          variant={stats.pending > 0 ? 'warning' : 'default'}
        />
        <StatsCard
          title="Response Rate"
          value={`${stats.vendorResponseRate.toFixed(1)}%`}
          icon={MessageSquare}
          description={`Avg: ${stats.averageResponseTime}`}
        />
      </div>

      {/* Status Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Approved"
          value={stats.approved.toLocaleString()}
          icon={CheckCircle}
          variant="success"
          description={`${((stats.approved / stats.total) * 100).toFixed(1)}% of total`}
        />
        <StatsCard
          title="Rejected"
          value={stats.rejected.toLocaleString()}
          icon={XCircle}
          variant="danger"
          description={`${((stats.rejected / stats.total) * 100).toFixed(1)}% of total`}
        />
        <StatsCard
          title="Flagged"
          value={stats.flagged.toLocaleString()}
          icon={Flag}
          variant={stats.flagged > 0 ? 'warning' : 'default'}
        />
        <StatsCard
          title="Verified Purchase"
          value={`${stats.verifiedPurchasePercentage.toFixed(1)}%`}
          icon={ShieldCheck}
          description={`${Math.round((stats.total * stats.verifiedPurchasePercentage) / 100)} reviews`}
        />
      </div>

      {/* Rating Distribution & Recent Activity */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Rating Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Rating Distribution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {ratingDistributionData.map(([rating, count]) => {
              const percentage = (count / stats.total) * 100;
              const width = (count / maxCount) * 100;

              return (
                <div key={rating} className="flex items-center gap-3">
                  <span className="text-sm font-medium w-6">{rating}</span>
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all',
                        parseInt(rating) >= 4
                          ? 'bg-green-500'
                          : parseInt(rating) === 3
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                      )}
                      style={{ width: `${width}%` }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground w-20 text-right">
                    {count.toLocaleString()} ({percentage.toFixed(1)}%)
                  </span>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Recent Activity & Moderation */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity & Moderation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Recent Activity */}
            <div>
              <h4 className="text-sm font-medium mb-2">Recent Reviews</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Last 24 hours</span>
                  <span className="font-medium">{stats.reviewsLast24Hours}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Last 7 days</span>
                  <span className="font-medium">{stats.reviewsLast7Days}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Last 30 days</span>
                  <span className="font-medium">{stats.reviewsLast30Days}</span>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="text-sm font-medium mb-2">Moderation Metrics</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Avg approval time</span>
                  <span className="font-medium">{stats.moderationMetrics.averageApprovalTime}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Auto-approved</span>
                  <span className="font-medium">
                    {stats.moderationMetrics.autoApprovedPercentage.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Manual moderation</span>
                  <span className="font-medium">
                    {stats.moderationMetrics.manuallyModeratedPercentage.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="text-sm font-medium mb-2">Review Types</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Product reviews</span>
                  <span className="font-medium">{stats.productReviews.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Vendor reviews</span>
                  <span className="font-medium">{stats.vendorReviews.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Rated Products & Vendors */}
      {(stats.topRatedProducts.length > 0 || stats.topRatedVendors.length > 0) && (
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Top Rated Products */}
          {stats.topRatedProducts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Top Rated Products</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.topRatedProducts.map((product, index) => (
                    <div
                      key={product.productId}
                      className="flex items-center justify-between py-2 border-b last:border-0"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-lg text-muted-foreground">
                            #{index + 1}
                          </span>
                          <div>
                            <p className="font-medium text-sm">{product.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {product.reviewCount} reviews
                            </p>
                          </div>
                        </div>
                      </div>
                      <RatingStars rating={product.averageRating} size="sm" showValue />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Top Rated Vendors */}
          {stats.topRatedVendors.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Top Rated Vendors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.topRatedVendors.map((vendor, index) => (
                    <div
                      key={vendor.vendorId}
                      className="flex items-center justify-between py-2 border-b last:border-0"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-lg text-muted-foreground">
                            #{index + 1}
                          </span>
                          <div>
                            <p className="font-medium text-sm">{vendor.businessName}</p>
                            <p className="text-xs text-muted-foreground">
                              {vendor.reviewCount} reviews
                            </p>
                          </div>
                        </div>
                      </div>
                      <RatingStars rating={vendor.averageRating} size="sm" showValue />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
