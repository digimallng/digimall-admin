import { useState, useMemo } from 'react';
import { EscrowFilters as EscrowFiltersType, Escrow } from '@/lib/api/types';
import { useEscrows } from '@/lib/hooks/use-escrow';
import { EscrowFilters } from './EscrowFilters';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { EscrowStatusBadge } from './EscrowStatusBadge';
import { 
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Loader2,
  Eye,
  MoreHorizontal
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format, formatDistanceToNow } from 'date-fns';

interface EscrowListProps {
  onViewEscrow?: (escrowId: string) => void;
  onEscrowAction?: (escrowId: string, action: string) => void;
}

const sortOptions = [
  { value: 'createdAt:desc', label: 'Newest First' },
  { value: 'createdAt:asc', label: 'Oldest First' },
  { value: 'amount:desc', label: 'Highest Amount' },
  { value: 'amount:asc', label: 'Lowest Amount' },
  { value: 'updatedAt:desc', label: 'Recently Updated' },
  { value: 'expiresAt:asc', label: 'Expiring Soon' },
];

export function EscrowList({ 
  onViewEscrow, 
  onEscrowAction
}: EscrowListProps) {
  const [filters, setFilters] = useState<EscrowFiltersType>({
    page: 1,
    limit: 20,
  });
  const [sortBy, setSortBy] = useState('createdAt:desc');

  // Parse sort value
  const [sortField, sortOrder] = sortBy.split(':') as [string, 'asc' | 'desc'];
  const queryFilters = {
    ...filters,
    sortBy: sortField,
    sortOrder: sortOrder.toUpperCase() as 'ASC' | 'DESC',
  };

  const { data, isLoading, error, refetch } = useEscrows(queryFilters);

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.status) count++;
    if (filters.search) count++;
    if (filters.minAmount || filters.maxAmount) count++;
    if (filters.startDate || filters.endDate) count++;
    if (filters.customerId) count++;
    if (filters.vendorId) count++;
    return count;
  }, [filters]);

  const handleFiltersChange = (newFilters: EscrowFiltersType) => {
    setFilters({ ...newFilters, page: 1 });
  };

  const handleResetFilters = () => {
    setFilters({ page: 1, limit: 20 });
  };

  const handlePageChange = (newPage: number) => {
    setFilters({ ...filters, page: newPage });
  };

  const formatAmount = (amount: number, currency = 'NGN') => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  const getAvailableActions = (escrow: Escrow) => {
    const actions = [];
    
    switch (escrow.status) {
      case 'funded':
      case 'pending':
        actions.push('release', 'refund', 'extend', 'dispute');
        break;
      case 'disputed':
        actions.push('resolve');
        break;
      case 'created':
        actions.push('cancel');
        break;
    }
    
    return actions;
  };

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load escrows. Please try again.
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="ml-2"
          >
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <EscrowFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onReset={handleResetFilters}
        activeCount={activeFilterCount}
      />

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600">
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading escrows...</span>
              </div>
            ) : data ? (
              `Showing ${data.data?.length || 0} of ${data.total || 0} escrows`
            ) : (
              'No escrows found'
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Sort */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-2">
          {[...Array(10)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : !(data?.data?.length) ? (
        <div className="text-center py-12">
          <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No escrows found</h3>
          <p className="text-gray-500 mb-4">
            {activeFilterCount > 0 
              ? 'Try adjusting your filters to see more results.'
              : 'No escrows have been created yet.'
            }
          </p>
          {activeFilterCount > 0 && (
            <Button variant="outline" onClick={handleResetFilters}>
              Clear Filters
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reference</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(data.data || []).map((escrow) => {
                  const availableActions = getAvailableActions(escrow);
                  
                  return (
                    <TableRow key={escrow.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">
                        <div>
                          <div className="font-medium">{escrow.reference}</div>
                          {escrow.description && (
                            <div className="text-xs text-gray-500 truncate max-w-[150px]">
                              {escrow.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">{escrow.customerName || 'N/A'}</div>
                          <div className="text-gray-500 text-xs">{escrow.customerId}</div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">{escrow.vendorName || 'N/A'}</div>
                          <div className="text-gray-500 text-xs">{escrow.vendorId}</div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="font-semibold text-green-600">
                          {formatAmount(escrow.amount, escrow.currency)}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <EscrowStatusBadge status={escrow.status} size="sm" />
                      </TableCell>
                      
                      <TableCell className="text-sm text-gray-500">
                        {formatDistanceToNow(new Date(escrow.createdAt))} ago
                      </TableCell>
                      
                      <TableCell className="text-sm text-gray-500">
                        {escrow.expiresAt ? (
                          <div>
                            <div>{format(new Date(escrow.expiresAt), 'MMM dd')}</div>
                            <div className="text-xs">
                              {new Date(escrow.expiresAt) < new Date() ? 'Expired' : 
                               formatDistanceToNow(new Date(escrow.expiresAt))}
                            </div>
                          </div>
                        ) : (
                          'No expiry'
                        )}
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onViewEscrow?.(escrow.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          
                          {availableActions.length > 0 && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {availableActions.map((action) => (
                                  <DropdownMenuItem 
                                    key={action}
                                    onClick={() => onEscrowAction?.(escrow.id, action)}
                                  >
                                    {action.charAt(0).toUpperCase() + action.slice(1)}
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {(data?.totalPages || 0) > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Page {data?.currentPage || 1} of {data?.totalPages || 1}
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange((data?.currentPage || 1) - 1)}
                  disabled={(data?.currentPage || 1) <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange((data?.currentPage || 1) + 1)}
                  disabled={(data?.currentPage || 1) >= (data?.totalPages || 1)}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}