'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { RatingStars } from '@/components/ui/rating-stars';
import { ReviewStatusBadge } from '@/components/ui/review-status-badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  CheckCircle,
  XCircle,
  Flag,
  Trash2,
  Eye,
  MoreVertical,
  ShieldCheck,
  MessageSquare,
  Image as ImageIcon,
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { Review } from '@/lib/api/types/reviews.types';

interface ReviewCardProps {
  review: Review;
  isSelected?: boolean;
  onSelect?: (selected: boolean) => void;
  onApprove?: (review: Review) => void;
  onReject?: (review: Review) => void;
  onFlag?: (review: Review) => void;
  onDelete?: (review: Review) => void;
  onView?: (review: Review) => void;
}

export function ReviewCard({
  review,
  isSelected,
  onSelect,
  onApprove,
  onReject,
  onFlag,
  onDelete,
  onView,
}: ReviewCardProps) {
  const customerName = `${review.customerId.firstName} ${review.customerId.lastName}`;
  const customerInitials = `${review.customerId.firstName[0]}${review.customerId.lastName[0]}`;

  return (
    <Card className={cn('hover:shadow-md transition-shadow', isSelected && 'ring-2 ring-primary')}>
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex items-start gap-3 flex-1">
            {/* Checkbox */}
            {onSelect && (
              <input
                type="checkbox"
                checked={isSelected}
                onChange={(e) => onSelect(e.target.checked)}
                className="mt-1"
              />
            )}

            {/* Customer Info */}
            <Avatar className="h-10 w-10">
              <AvatarImage src={review.customerId.avatar} alt={customerName} />
              <AvatarFallback>{customerInitials}</AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium text-sm truncate">{customerName}</h4>
                {review.verifiedPurchase && (
                  <Badge variant="outline" className="text-xs">
                    <ShieldCheck className="mr-1 h-3 w-3" />
                    Verified
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <RatingStars rating={review.rating} size="sm" />
                <span>{format(new Date(review.createdAt), 'MMM d, yyyy')}</span>
              </div>
            </div>
          </div>

          {/* Status & Actions */}
          <div className="flex items-center gap-2">
            <ReviewStatusBadge status={review.status} />
            {review.isFlagged && (
              <Badge variant="destructive">
                <Flag className="mr-1 h-3 w-3" />
                Flagged
              </Badge>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onView && (
                  <DropdownMenuItem onClick={() => onView(review)}>
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                  </DropdownMenuItem>
                )}
                {review.status === 'PENDING' && onApprove && (
                  <DropdownMenuItem onClick={() => onApprove(review)}>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Approve
                  </DropdownMenuItem>
                )}
                {onReject && review.status !== 'REJECTED' && (
                  <DropdownMenuItem onClick={() => onReject(review)}>
                    <XCircle className="mr-2 h-4 w-4" />
                    Reject
                  </DropdownMenuItem>
                )}
                {onFlag && !review.isFlagged && (
                  <DropdownMenuItem onClick={() => onFlag(review)}>
                    <Flag className="mr-2 h-4 w-4" />
                    Flag
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onDelete(review)}
                      className="text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Review Type & Product/Vendor Info */}
        <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
          <Badge variant="secondary">{review.type}</Badge>
          {review.type === 'PRODUCT' && review.productId && (
            <span className="truncate">{review.productId.title}</span>
          )}
          {review.vendorId && (
            <span className="truncate">by {review.vendorId.businessName}</span>
          )}
        </div>

        {/* Review Title */}
        {review.title && (
          <h3 className="font-semibold text-sm mb-2">{review.title}</h3>
        )}

        {/* Review Content */}
        <p className="text-sm text-gray-700 mb-3 line-clamp-3">
          {review.content}
        </p>

        {/* Review Images */}
        {review.images && review.images.length > 0 && (
          <div className="flex gap-2 mb-3">
            {review.images.slice(0, 3).map((image, index) => (
              <div
                key={index}
                className="relative h-16 w-16 rounded overflow-hidden border"
              >
                <img
                  src={image}
                  alt={`Review image ${index + 1}`}
                  className="h-full w-full object-cover"
                />
              </div>
            ))}
            {review.images.length > 3 && (
              <div className="h-16 w-16 rounded border flex items-center justify-center bg-gray-50 text-xs text-muted-foreground">
                +{review.images.length - 3}
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
          <div className="flex items-center gap-4">
            <span>{review.helpfulVotes} helpful</span>
            {review.vendorResponse && (
              <span className="flex items-center gap-1">
                <MessageSquare className="h-3 w-3" />
                Vendor responded
              </span>
            )}
          </div>
          {review.moderatedBy && (
            <span>
              Moderated by {review.moderatedBy.firstName} {review.moderatedBy.lastName}
            </span>
          )}
        </div>

        {/* Rejection/Flag Reason */}
        {(review.rejectionReason || review.flagReason) && (
          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs">
            <span className="font-medium">
              {review.rejectionReason ? 'Rejection reason: ' : 'Flag reason: '}
            </span>
            {review.rejectionReason || review.flagReason}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
