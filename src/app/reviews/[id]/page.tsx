'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { RatingStars } from '@/components/ui/rating-stars';
import { ReviewStatusBadge } from '@/components/ui/review-status-badge';
import {
  useReview,
  useApproveReview,
  useRejectReview,
  useFlagReview,
  useDeleteReview,
} from '@/lib/hooks/use-reviews';
import {
  ReviewModerationModal,
  type ModerationAction,
} from '../components/ReviewModerationModal';
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Flag,
  Trash2,
  ShieldCheck,
  MessageSquare,
  Package,
  Store,
  Calendar,
  ThumbsUp,
  Image as ImageIcon,
  User,
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface ReviewDetailsPageProps {
  params: {
    id: string;
  };
}

export default function ReviewDetailsPage({ params }: ReviewDetailsPageProps) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState<ModerationAction>('approve');

  // Queries & Mutations
  const { data: reviewData, isLoading, error, refetch } = useReview(params.id);
  const approveMutation = useApproveReview();
  const rejectMutation = useRejectReview();
  const flagMutation = useFlagReview();
  const deleteMutation = useDeleteReview();

  const review = reviewData?.data;

  const handleAction = (action: ModerationAction) => {
    setModalAction(action);
    setModalOpen(true);
  };

  const handleModerationConfirm = async (reason?: string) => {
    if (!review) return;

    try {
      if (modalAction === 'approve') {
        await approveMutation.mutateAsync({
          id: review._id,
          data: reason ? { comment: reason } : undefined,
        });
        toast.success('Review approved successfully');
      } else if (modalAction === 'reject') {
        await rejectMutation.mutateAsync({
          id: review._id,
          data: { reason: reason! },
        });
        toast.success('Review rejected successfully');
      } else if (modalAction === 'flag') {
        await flagMutation.mutateAsync({
          id: review._id,
          data: { reason: reason! },
        });
        toast.success('Review flagged successfully');
      } else if (modalAction === 'delete') {
        await deleteMutation.mutateAsync(review._id);
        toast.success('Review deleted successfully');
        router.push('/reviews');
        return;
      }

      setModalOpen(false);
      refetch();
    } catch (error: any) {
      toast.error(error.message || `Failed to ${modalAction} review`);
    }
  };

  const isMutating =
    approveMutation.isPending ||
    rejectMutation.isPending ||
    flagMutation.isPending ||
    deleteMutation.isPending;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !review) {
    return (
      <div className="p-6">
        <ErrorMessage
          title="Failed to load review"
          message={error?.message || 'Review not found'}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  const customerName = `${review.customerId.firstName} ${review.customerId.lastName}`;
  const customerInitials = `${review.customerId.firstName[0]}${review.customerId.lastName[0]}`;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Review Details</h1>
            <p className="text-muted-foreground">
              Review ID: {review._id}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {review.status === 'PENDING' && (
            <Button onClick={() => handleAction('approve')}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Approve
            </Button>
          )}
          {review.status !== 'REJECTED' && (
            <Button variant="outline" onClick={() => handleAction('reject')}>
              <XCircle className="mr-2 h-4 w-4" />
              Reject
            </Button>
          )}
          {!review.isFlagged && (
            <Button variant="outline" onClick={() => handleAction('flag')}>
              <Flag className="mr-2 h-4 w-4" />
              Flag
            </Button>
          )}
          <Button variant="destructive" onClick={() => handleAction('delete')}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Review Card */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={review.customerId.avatar} alt={customerName} />
                    <AvatarFallback>{customerInitials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{customerName}</h3>
                      {review.verifiedPurchase && (
                        <Badge variant="outline" className="text-xs">
                          <ShieldCheck className="mr-1 h-3 w-3" />
                          Verified Purchase
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <RatingStars rating={review.rating} size="sm" />
                      <span>{format(new Date(review.createdAt), 'MMM d, yyyy h:mm a')}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <ReviewStatusBadge status={review.status} />
                  {review.isFlagged && (
                    <Badge variant="destructive">
                      <Flag className="mr-1 h-3 w-3" />
                      Flagged
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Review Type & Target */}
              <div className="flex items-center gap-4">
                <Badge variant="secondary">{review.type} REVIEW</Badge>
                {review.type === 'PRODUCT' && review.productId && (
                  <div className="flex items-center gap-2 text-sm">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <Link
                      href={`/products/${review.productId._id}`}
                      className="hover:underline"
                    >
                      {review.productId.title}
                    </Link>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <Store className="h-4 w-4 text-muted-foreground" />
                  <Link
                    href={`/vendors/${review.vendorId._id}`}
                    className="hover:underline"
                  >
                    {review.vendorId.businessName}
                  </Link>
                </div>
              </div>

              <Separator />

              {/* Review Title */}
              {review.title && (
                <div>
                  <h4 className="font-semibold text-lg mb-2">{review.title}</h4>
                </div>
              )}

              {/* Review Content */}
              <div className="prose prose-sm max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap">{review.content}</p>
              </div>

              {/* Review Images */}
              {review.images && review.images.length > 0 && (
                <div className="space-y-2">
                  <h5 className="font-medium flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" />
                    Review Images ({review.images.length})
                  </h5>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {review.images.map((image, index) => (
                      <div
                        key={index}
                        className="relative aspect-square rounded-lg overflow-hidden border cursor-pointer hover:opacity-90 transition"
                        onClick={() => window.open(image, '_blank')}
                      >
                        <img
                          src={image}
                          alt={`Review image ${index + 1}`}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Helpful Votes */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ThumbsUp className="h-4 w-4" />
                <span>{review.helpfulVotes} people found this helpful</span>
              </div>
            </CardContent>
          </Card>

          {/* Vendor Response */}
          {review.vendorResponse && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Vendor Response
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-gray-700">{review.vendorResponse.message}</p>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    Responded by {review.vendorResponse.respondedBy.firstName}{' '}
                    {review.vendorResponse.respondedBy.lastName}
                  </span>
                  <span>
                    {format(new Date(review.vendorResponse.respondedAt), 'MMM d, yyyy h:mm a')}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Rejection/Flag Reason */}
          {(review.rejectionReason || review.flagReason) && (
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="text-red-700">
                  {review.rejectionReason ? 'Rejection Reason' : 'Flag Reason'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-red-800">
                  {review.rejectionReason || review.flagReason}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <User className="h-4 w-4" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={review.customerId.avatar} alt={customerName} />
                  <AvatarFallback>{customerInitials}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{customerName}</p>
                  <p className="text-sm text-muted-foreground">{review.customerId.email}</p>
                </div>
              </div>
              {review.customerId.phone && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Phone:</span> {review.customerId.phone}
                </div>
              )}
              {review.orderId && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Order ID:</span>{' '}
                  <Link href={`/orders/${review.orderId}`} className="hover:underline">
                    {review.orderId}
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Moderation Info */}
          {review.moderatedBy && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Moderation Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Moderated by:</span>
                  <p className="font-medium">
                    {review.moderatedBy.firstName} {review.moderatedBy.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground">{review.moderatedBy.email}</p>
                </div>
                {review.approvedAt && (
                  <div>
                    <span className="text-muted-foreground">Approved at:</span>
                    <p className="font-medium">
                      {format(new Date(review.approvedAt), 'MMM d, yyyy h:mm a')}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Timestamps */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Timestamps
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div>
                <span className="text-muted-foreground">Created:</span>
                <p className="font-medium">
                  {format(new Date(review.createdAt), 'MMM d, yyyy h:mm a')}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Last updated:</span>
                <p className="font-medium">
                  {format(new Date(review.updatedAt), 'MMM d, yyyy h:mm a')}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Moderation Modal */}
      <ReviewModerationModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        action={modalAction}
        selectedCount={1}
        onConfirm={handleModerationConfirm}
        isLoading={isMutating}
      />
    </div>
  );
}
