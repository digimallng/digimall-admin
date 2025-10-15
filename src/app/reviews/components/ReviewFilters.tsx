'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';
import type { GetAllReviewsParams, ReviewStatus, ReviewType } from '@/lib/api/types/reviews.types';

interface ReviewFiltersProps {
  filters: GetAllReviewsParams;
  onFiltersChange: (filters: GetAllReviewsParams) => void;
  onClearFilters: () => void;
}

export function ReviewFilters({
  filters,
  onFiltersChange,
  onClearFilters,
}: ReviewFiltersProps) {
  const updateFilter = (key: keyof GetAllReviewsParams, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const hasActiveFilters = Object.keys(filters).some(
    (key) => key !== 'page' && key !== 'limit' && filters[key as keyof GetAllReviewsParams]
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Filters</CardTitle>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={onClearFilters}>
            <X className="mr-1 h-4 w-4" />
            Clear
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div className="space-y-2">
          <Label htmlFor="search">Search</Label>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Search review content..."
              value={filters.search || ''}
              onChange={(e) => updateFilter('search', e.target.value || undefined)}
              className="pl-8"
            />
          </div>
        </div>

        {/* Status Filter */}
        <div className="space-y-2">
          <Label>Status</Label>
          <Select
            value={filters.status || 'all'}
            onValueChange={(value) =>
              updateFilter('status', value === 'all' ? undefined : (value as ReviewStatus))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="APPROVED">Approved</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
              <SelectItem value="FLAGGED">Flagged</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Type Filter */}
        <div className="space-y-2">
          <Label>Type</Label>
          <Select
            value={filters.type || 'all'}
            onValueChange={(value) =>
              updateFilter('type', value === 'all' ? undefined : (value as ReviewType))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="PRODUCT">Product Reviews</SelectItem>
              <SelectItem value="VENDOR">Vendor Reviews</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Rating Filter */}
        <div className="space-y-2">
          <Label>Rating</Label>
          <div className="grid grid-cols-2 gap-2">
            <Select
              value={filters.minRating?.toString() || 'any'}
              onValueChange={(value) =>
                updateFilter('minRating', value === 'any' ? undefined : parseInt(value))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Min" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any</SelectItem>
                <SelectItem value="1">1 Star</SelectItem>
                <SelectItem value="2">2 Stars</SelectItem>
                <SelectItem value="3">3 Stars</SelectItem>
                <SelectItem value="4">4 Stars</SelectItem>
                <SelectItem value="5">5 Stars</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.maxRating?.toString() || 'any'}
              onValueChange={(value) =>
                updateFilter('maxRating', value === 'any' ? undefined : parseInt(value))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Max" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any</SelectItem>
                <SelectItem value="1">1 Star</SelectItem>
                <SelectItem value="2">2 Stars</SelectItem>
                <SelectItem value="3">3 Stars</SelectItem>
                <SelectItem value="4">4 Stars</SelectItem>
                <SelectItem value="5">5 Stars</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Special Filters */}
        <div className="space-y-2">
          <Label>Special Filters</Label>
          <div className="space-y-2">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={filters.needsModeration || false}
                onChange={(e) => updateFilter('needsModeration', e.target.checked || undefined)}
              />
              <span className="text-sm">Needs Moderation</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={filters.isFlagged || false}
                onChange={(e) => updateFilter('isFlagged', e.target.checked || undefined)}
              />
              <span className="text-sm">Flagged Only</span>
            </label>
          </div>
        </div>

        {/* Sort Options */}
        <div className="space-y-2">
          <Label>Sort By</Label>
          <Select
            value={filters.sortBy || 'createdAt'}
            onValueChange={(value) => updateFilter('sortBy', value as any)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt">Date Created</SelectItem>
              <SelectItem value="rating">Rating</SelectItem>
              <SelectItem value="helpfulVotes">Helpful Votes</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Order</Label>
          <Select
            value={filters.sortOrder || 'desc'}
            onValueChange={(value) => updateFilter('sortOrder', value as 'asc' | 'desc')}
          >
            <SelectTrigger>
              <SelectValue placeholder="Order" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">Newest First</SelectItem>
              <SelectItem value="asc">Oldest First</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
