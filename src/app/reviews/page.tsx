'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  useReviews,
  useReviewStatistics,
  useApproveReview,
  useRejectReview,
  useFlagReview,
  useDeleteReview,
  useBulkModerateReviews,
} from '@/lib/hooks/use-reviews';
import { ReviewCard } from './components/ReviewCard';
import { ReviewFilters } from './components/ReviewFilters';
import { BulkActionsToolbar } from './components/BulkActionsToolbar';
import {
  ReviewModerationModal,
  type ModerationAction,
} from './components/ReviewModerationModal';
import type { GetAllReviewsParams, Review } from '@/lib/api/types/reviews.types';
import {
  Search,
  Filter,
  Download,
  RefreshCw,
  BarChart3,
  MessageSquare,
  Star,
  CheckCircle,
  XCircle,
  AlertTriangle,
  TrendingUp,
  Package,
  Store,
  Activity,
} from 'lucide-react';
import { toast } from 'sonner';

export default function ReviewsPage() {
  const { data: session } = useSession();
  const router = useRouter();

  // Filters & Pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  const [filters, setFilters] = useState<GetAllReviewsParams>({});
  const [showFilters, setShowFilters] = useState(false);

  // Selection & Modals
  const [selectedReviews, setSelectedReviews] = useState<Set<string>>(new Set());
  const [modalOpen, setModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState<ModerationAction>('approve');
  const [currentReview, setCurrentReview] = useState<Review | null>(null);

  // Active tab
  const [activeTab, setActiveTab] = useState<string>('all');

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Build query params based on active tab
  const queryParams: GetAllReviewsParams = useMemo(() => {
    const baseParams: GetAllReviewsParams = {
      page: currentPage,
      limit: pageSize,
      search: debouncedSearch || undefined,
      sortBy: 'createdAt',
      sortOrder: 'desc',
      ...filters,
    };

    // Apply tab filters
    switch (activeTab) {
      case 'pending':
        return { ...baseParams, status: 'PENDING' };
      case 'flagged':
        return { ...baseParams, isFlagged: true };
      default:
        return baseParams;
    }
  }, [currentPage, pageSize, debouncedSearch, filters, activeTab]);

  // Queries
  const { data: reviewsData, isLoading, error, refetch } = useReviews(queryParams);
  const { data: statsData } = useReviewStatistics();

  // Mutations
  const approveMutation = useApproveReview();
  const rejectMutation = useRejectReview();
  const flagMutation = useFlagReview();
  const deleteMutation = useDeleteReview();
  const bulkMutation = useBulkModerateReviews();

  const reviews = reviewsData?.data.reviews || [];
  const total = reviewsData?.data.total || 0;
  const pages = reviewsData?.data.pages || 0;
  const stats = statsData?.data;

  // Handlers
  const handleSelectReview = (reviewId: string, selected: boolean) => {
    const newSelection = new Set(selectedReviews);
    if (selected) {
      newSelection.add(reviewId);
    } else {
      newSelection.delete(reviewId);
    }
    setSelectedReviews(newSelection);
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedReviews(new Set(reviews.map((r) => r._id)));
    } else {
      setSelectedReviews(new Set());
    }
  };

  const handleSingleAction = (review: Review, action: ModerationAction) => {
    setCurrentReview(review);
    setModalAction(action);
    setModalOpen(true);
  };

  const handleBulkAction = (action: ModerationAction) => {
    setCurrentReview(null);
    setModalAction(action);
    setModalOpen(true);
  };

  const handleModerationConfirm = async (reason?: string) => {
    try {
      const reviewIds = currentReview
        ? [currentReview._id]
        : Array.from(selectedReviews);

      if (reviewIds.length === 0) {
        toast.error('No reviews selected');
        return;
      }

      if (modalAction === 'approve') {
        if (currentReview) {
          await approveMutation.mutateAsync({
            id: currentReview._id,
            data: reason ? { comment: reason } : undefined,
          });
        } else {
          await bulkMutation.mutateAsync({
            reviewIds,
            action: 'approve',
            reason,
          });
        }
        toast.success(`Successfully approved ${reviewIds.length} review(s)`);
      } else if (modalAction === 'reject') {
        if (currentReview) {
          await rejectMutation.mutateAsync({
            id: currentReview._id,
            data: { reason: reason! },
          });
        } else {
          await bulkMutation.mutateAsync({
            reviewIds,
            action: 'reject',
            reason: reason!,
          });
        }
        toast.success(`Successfully rejected ${reviewIds.length} review(s)`);
      } else if (modalAction === 'flag') {
        if (currentReview) {
          await flagMutation.mutateAsync({
            id: currentReview._id,
            data: { reason: reason! },
          });
        } else {
          await bulkMutation.mutateAsync({
            reviewIds,
            action: 'flag',
            reason: reason!,
          });
        }
        toast.success(`Successfully flagged ${reviewIds.length} review(s)`);
      } else if (modalAction === 'delete') {
        if (currentReview) {
          await deleteMutation.mutateAsync(currentReview._id);
        } else {
          await bulkMutation.mutateAsync({
            reviewIds,
            action: 'delete',
          });
        }
        toast.success(`Successfully deleted ${reviewIds.length} review(s)`);
      }

      setModalOpen(false);
      setSelectedReviews(new Set());
      setCurrentReview(null);
      refetch();
    } catch (error: any) {
      toast.error(error.message || `Failed to ${modalAction} review(s)`);
    }
  };

  const handleClearFilters = () => {
    setFilters({});
    setSearchTerm('');
    setCurrentPage(1);
  };

  const isAllSelected = reviews.length > 0 && selectedReviews.size === reviews.length;
  const isMutating =
    approveMutation.isPending ||
    rejectMutation.isPending ||
    flagMutation.isPending ||
    deleteMutation.isPending ||
    bulkMutation.isPending;

  if (isLoading && !stats) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reviews Management</h1>
          <p className="text-muted-foreground">Moderate customer reviews and ensure quality</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reviews Management</h1>
          <p className="text-muted-foreground">Moderate customer reviews and ensure quality</p>
        </div>
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Failed to load reviews</h3>
              <p className="text-muted-foreground mb-4">{error?.message || 'An error occurred'}</p>
              <Button onClick={() => refetch()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reviews Management</h1>
          <p className="text-muted-foreground mt-1">
            Moderate customer reviews and ensure quality across the platform
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Reviews
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">All platform reviews</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Approval
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pending || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting moderation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Average Rating
            </CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.averageRating?.toFixed(1) || '0.0'}</div>
            <p className="text-xs text-muted-foreground mt-1">Platform average</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Flagged Reviews
            </CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.flagged || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Need attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">
            All Reviews {total > 0 && `(${total})`}
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pending {stats && stats.pending > 0 && `(${stats.pending})`}
          </TabsTrigger>
          <TabsTrigger value="flagged">
            Flagged {stats && stats.flagged > 0 && `(${stats.flagged})`}
          </TabsTrigger>
          <TabsTrigger value="statistics">
            <BarChart3 className="mr-2 h-4 w-4" />
            Statistics
          </TabsTrigger>
        </TabsList>

        {/* Statistics Tab */}
        <TabsContent value="statistics">
          {stats ? <StatisticsContent stats={stats} /> : <LoadingSpinner />}
        </TabsContent>

        {/* Reviews Lists */}
        <TabsContent value="all" className="space-y-4">
          <ReviewsContent />
        </TabsContent>
        <TabsContent value="pending" className="space-y-4">
          <ReviewsContent />
        </TabsContent>
        <TabsContent value="flagged" className="space-y-4">
          <ReviewsContent />
        </TabsContent>
      </Tabs>

      {/* Moderation Modal */}
      <ReviewModerationModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        action={modalAction}
        selectedCount={currentReview ? 1 : selectedReviews.size}
        onConfirm={handleModerationConfirm}
        isLoading={isMutating}
      />

      {/* Bulk Actions Toolbar */}
      <BulkActionsToolbar
        selectedCount={selectedReviews.size}
        onApprove={() => handleBulkAction('approve')}
        onReject={() => handleBulkAction('reject')}
        onFlag={() => handleBulkAction('flag')}
        onDelete={() => handleBulkAction('delete')}
        onClearSelection={() => setSelectedReviews(new Set())}
      />
    </div>
  );

  function ReviewsContent() {
    return (
      <>
        {/* Filters & Search Bar */}
        <div className="flex gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search reviews by content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Button
            variant={showFilters ? 'default' : 'outline'}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
          {/* Main Content */}
          <div className="space-y-4">
            {/* Select All */}
            {reviews.length > 0 && (
              <Card>
                <CardContent className="p-4 flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                    />
                    <span className="text-sm font-medium">
                      {isAllSelected ? 'Deselect all' : 'Select all'} ({reviews.length} reviews)
                    </span>
                  </label>
                  <div className="text-sm text-muted-foreground">
                    {selectedReviews.size} selected
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="flex justify-center py-12">
                <LoadingSpinner />
              </div>
            )}

            {/* Error State */}
            {error && (
              <ErrorMessage
                title="Failed to load reviews"
                message={error.message}
                onRetry={() => refetch()}
              />
            )}

            {/* Reviews List */}
            {!isLoading && !error && reviews.length > 0 && (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <ReviewCard
                    key={review._id}
                    review={review}
                    isSelected={selectedReviews.has(review._id)}
                    onSelect={(selected) => handleSelectReview(review._id, selected)}
                    onApprove={() => handleSingleAction(review, 'approve')}
                    onReject={() => handleSingleAction(review, 'reject')}
                    onFlag={() => handleSingleAction(review, 'flag')}
                    onDelete={() => handleSingleAction(review, 'delete')}
                    onView={() => router.push(`/reviews/${review._id}`)}
                  />
                ))}
              </div>
            )}

            {/* Empty State */}
            {!isLoading && !error && reviews.length === 0 && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No reviews found</h3>
                  <p className="text-muted-foreground text-center max-w-md">
                    {debouncedSearch || Object.keys(filters).length > 0
                      ? 'Try adjusting your filters or search terms'
                      : 'No reviews available yet'}
                  </p>
                  {(debouncedSearch || Object.keys(filters).length > 0) && (
                    <Button variant="outline" className="mt-4" onClick={handleClearFilters}>
                      Clear filters
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Pagination */}
            {!isLoading && pages > 1 && (
              <Card>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Page {currentPage} of {pages} ({total} total reviews)
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === pages}
                      onClick={() => setCurrentPage((p) => Math.min(pages, p + 1))}
                    >
                      Next
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar Filters */}
          {showFilters && (
            <div className="lg:sticky lg:top-6 h-fit">
              <ReviewFilters
                filters={filters}
                onFiltersChange={setFilters}
                onClearFilters={handleClearFilters}
              />
            </div>
          )}
        </div>
      </>
    );
  }

  function StatisticsContent({ stats }: { stats: any }) {
    return (
      <div className="space-y-6">
        {/* Additional Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Approved
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.approved || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Approved reviews</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Rejected
              </CardTitle>
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.rejected || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Rejected reviews</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Product Reviews
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.productReviews || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Product feedback</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Vendor Reviews
              </CardTitle>
              <Store className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.vendorReviews || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Vendor feedback</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                5-Star Rate
              </CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.fiveStarPercentage?.toFixed(1) || '0.0'}%</div>
              <p className="text-xs text-muted-foreground mt-1">Five star reviews</p>
            </CardContent>
          </Card>
        </div>

        {/* Rating Distribution & Recent Activity */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Rating Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[5, 4, 3, 2, 1].map((rating) => {
                  const count = stats.ratingDistribution?.[rating as keyof typeof stats.ratingDistribution] || 0;
                  const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
                  return (
                    <div key={rating} className="flex items-center gap-3">
                      <div className="flex items-center gap-1 w-12">
                        <span className="text-sm font-medium">{rating}</span>
                        <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                      </div>
                      <div className="flex-1">
                        <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                          <div
                            className="h-2 rounded-full bg-yellow-400"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-sm text-muted-foreground w-16 text-right">
                        {count} ({percentage.toFixed(0)}%)
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-transparent dark:border-gray-700/50">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-blue-100 dark:bg-blue-900/30 p-2">
                      <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="font-medium">Last 24 Hours</span>
                  </div>
                  <span className="text-2xl font-bold">{stats.recentActivity?.last24Hours || 0}</span>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-transparent dark:border-gray-700/50">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-green-100 dark:bg-green-900/30 p-2">
                      <Activity className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="font-medium">Last 7 Days</span>
                  </div>
                  <span className="text-2xl font-bold">{stats.recentActivity?.last7Days || 0}</span>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-transparent dark:border-gray-700/50">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-purple-100 dark:bg-purple-900/30 p-2">
                      <Activity className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <span className="font-medium">Last 30 Days</span>
                  </div>
                  <span className="text-2xl font-bold">{stats.recentActivity?.last30Days || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Vendors */}
        {stats.topVendors && stats.topVendors.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Top Rated Vendors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.topVendors.map((vendor: any, index: number) => (
                  <div key={vendor.vendorId} className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-transparent dark:border-gray-700/50">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 dark:bg-primary/20 flex h-8 w-8 items-center justify-center rounded">
                        <span className="text-primary text-sm font-bold">#{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium">{vendor.businessName}</p>
                        <p className="text-sm text-muted-foreground">
                          {vendor.reviewCount} reviews
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                      <span className="text-lg font-bold">{vendor.averageRating.toFixed(1)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quality Metrics */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Positive Reviews
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.positiveReviewPercentage?.toFixed(1) || '0.0'}%</div>
              <p className="text-xs text-muted-foreground mt-1">4+ star reviews</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
}
