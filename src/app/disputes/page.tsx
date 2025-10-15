'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import {
  Shield,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  RefreshCw,
  Filter,
  Search,
  FileText,
  DollarSign,
  User,
  Store,
  Calendar,
  Flag,
} from 'lucide-react';
import { useDisputedEscrows, useEscrowStatistics, useResolveDispute } from '@/lib/hooks/use-escrow';
import type { EscrowAccount, ResolveDisputeRequest } from '@/lib/api/types/escrow.types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/Textarea';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function DisputesPage() {
  // State management
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDispute, setSelectedDispute] = useState<EscrowAccount | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [resolution, setResolution] = useState<'release_to_vendor' | 'refund_to_customer'>('release_to_vendor');
  const [resolutionNotes, setResolutionNotes] = useState('');

  // API hooks
  const {
    data: disputedEscrows,
    isLoading: disputedEscrowsLoading,
    error: disputedEscrowsError,
    refetch: refetchDisputedEscrows,
  } = useDisputedEscrows({ page, limit });

  const {
    data: escrowStatistics,
    isLoading: statisticsLoading,
  } = useEscrowStatistics();

  const resolveDisputeMutation = useResolveDispute();

  const disputes = disputedEscrows?.data || [];
  const stats = escrowStatistics?.data;

  const handleResolveDispute = async () => {
    if (!selectedDispute || !resolutionNotes.trim()) {
      toast.error('Please provide resolution notes');
      return;
    }

    try {
      const data: ResolveDisputeRequest = {
        resolution,
        resolutionNotes: resolutionNotes.trim(),
      };

      await resolveDisputeMutation.mutateAsync({
        id: selectedDispute._id,
        data,
      });

      toast.success('Dispute resolved successfully');
      setShowResolveModal(false);
      setShowDetails(false);
      setSelectedDispute(null);
      setResolution('release_to_vendor');
      setResolutionNotes('');
      refetchDisputedEscrows();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to resolve dispute');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const filteredDisputes = disputes.filter((dispute) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      dispute.escrowId.toLowerCase().includes(searchLower) ||
      dispute.orderId.orderNumber.toLowerCase().includes(searchLower) ||
      dispute.customerId.email.toLowerCase().includes(searchLower) ||
      dispute.vendorId.businessInfo.businessName.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-6 p-4 md:p-8 pt-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dispute Resolution</h2>
          <p className="text-muted-foreground mt-1">
            Manage and resolve disputed escrow accounts
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetchDisputedEscrows()} disabled={disputedEscrowsLoading}>
            <RefreshCw className={cn('w-4 h-4 mr-2', disputedEscrowsLoading && 'animate-spin')} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      {!statisticsLoading && stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Escrows</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalEscrows.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">All escrow accounts</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Disputed Escrows</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {stats.statusBreakdown.disputed.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">Requiring resolution</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalAmount)}</div>
              <p className="text-xs text-muted-foreground">In escrow</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Hold Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageHoldTime.toFixed(1)}</div>
              <p className="text-xs text-muted-foreground">Days average</p>
            </CardContent>
          </Card>
        </div>
      )}

      {statisticsLoading && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by escrow ID, order number, customer, or vendor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Disputes Table */}
      <Card>
        <CardHeader>
          <CardTitle>Disputed Escrow Accounts</CardTitle>
        </CardHeader>
        <CardContent>
          {disputedEscrowsLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : disputedEscrowsError ? (
            <div className="text-center py-12">
              <Shield className="mx-auto h-12 w-12 text-red-500 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Error Loading Disputes</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {disputedEscrowsError?.message || 'Failed to load disputed escrows'}
              </p>
              <Button onClick={() => refetchDisputedEscrows()}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </div>
          ) : filteredDisputes.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Escrow ID</TableHead>
                    <TableHead>Order</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Funded Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDisputes.map((dispute) => (
                    <TableRow key={dispute._id}>
                      <TableCell className="font-mono text-sm">{dispute.escrowId}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{dispute.orderId.orderNumber}</div>
                          <div className="text-xs text-muted-foreground">
                            {dispute.orderId.status}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {dispute.customerId.firstName} {dispute.customerId.lastName}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {dispute.customerId.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {dispute.vendorId.businessInfo.businessName}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {dispute.vendorId.businessInfo.contactEmail}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(dispute.amount)}
                      </TableCell>
                      <TableCell>
                        {dispute.fundedAt
                          ? format(new Date(dispute.fundedAt), 'MMM dd, yyyy')
                          : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Disputed
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedDispute(dispute);
                              setShowDetails(true);
                            }}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => {
                              setSelectedDispute(dispute);
                              setShowResolveModal(true);
                            }}
                          >
                            <Flag className="w-4 h-4 mr-1" />
                            Resolve
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Shield className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No disputes found</h3>
              <p className="text-sm text-muted-foreground">
                {searchTerm ? 'Try adjusting your search' : 'All disputes have been resolved'}
              </p>
            </div>
          )}

          {/* Pagination */}
          {disputedEscrows?.pagination && disputedEscrows.pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                Showing {((disputedEscrows.pagination.page - 1) * disputedEscrows.pagination.limit) + 1} to{' '}
                {Math.min(disputedEscrows.pagination.page * disputedEscrows.pagination.limit, disputedEscrows.pagination.total)} of{' '}
                {disputedEscrows.pagination.total} results
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground flex items-center px-3">
                  Page {page} of {disputedEscrows.pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page === disputedEscrows.pagination.totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Details Modal */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Escrow Dispute Details</DialogTitle>
            <DialogDescription>
              Complete information about this disputed escrow account
            </DialogDescription>
          </DialogHeader>

          {selectedDispute && (
            <div className="space-y-6">
              {/* Escrow Information */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Escrow ID</Label>
                  <p className="font-mono text-sm">{selectedDispute.escrowId}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Order Number</Label>
                  <p className="font-medium">{selectedDispute.orderId.orderNumber}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Amount</Label>
                  <p className="text-lg font-bold">{formatCurrency(selectedDispute.amount)}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Currency</Label>
                  <p>{selectedDispute.currency}</p>
                </div>
              </div>

              {/* Customer Information */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Customer Information
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Name</Label>
                    <p>
                      {selectedDispute.customerId.firstName} {selectedDispute.customerId.lastName}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Email</Label>
                    <p className="text-sm">{selectedDispute.customerId.email}</p>
                  </div>
                  {selectedDispute.customerId.phone && (
                    <div className="space-y-2">
                      <Label className="text-muted-foreground">Phone</Label>
                      <p className="text-sm">{selectedDispute.customerId.phone}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Vendor Information */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Store className="w-4 h-4" />
                  Vendor Information
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Business Name</Label>
                    <p>{selectedDispute.vendorId.businessInfo.businessName}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Contact Email</Label>
                    <p className="text-sm">{selectedDispute.vendorId.businessInfo.contactEmail}</p>
                  </div>
                  {selectedDispute.vendorId.businessInfo.contactPhone && (
                    <div className="space-y-2">
                      <Label className="text-muted-foreground">Contact Phone</Label>
                      <p className="text-sm">
                        {selectedDispute.vendorId.businessInfo.contactPhone}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Timeline */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Timeline
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Created</Label>
                    <p className="text-sm">
                      {format(new Date(selectedDispute.createdAt), 'PPP pp')}
                    </p>
                  </div>
                  {selectedDispute.fundedAt && (
                    <div className="space-y-2">
                      <Label className="text-muted-foreground">Funded</Label>
                      <p className="text-sm">
                        {format(new Date(selectedDispute.fundedAt), 'PPP pp')}
                      </p>
                    </div>
                  )}
                  {selectedDispute.expiresAt && (
                    <div className="space-y-2">
                      <Label className="text-muted-foreground">Expires</Label>
                      <p className="text-sm">
                        {format(new Date(selectedDispute.expiresAt), 'PPP pp')}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Release Conditions */}
              <div>
                <h4 className="font-semibold mb-3">Release Conditions</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Auto Release After</Label>
                    <p>{selectedDispute.releaseConditions.autoReleaseAfterDays} days</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Delivery Confirmation</Label>
                    <Badge variant={selectedDispute.releaseConditions.requiresDeliveryConfirmation ? 'default' : 'secondary'}>
                      {selectedDispute.releaseConditions.requiresDeliveryConfirmation ? 'Required' : 'Not Required'}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Customer Approval</Label>
                    <Badge variant={selectedDispute.releaseConditions.requiresCustomerApproval ? 'default' : 'secondary'}>
                      {selectedDispute.releaseConditions.requiresCustomerApproval ? 'Required' : 'Not Required'}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetails(false)}>
              Close
            </Button>
            {selectedDispute && (
              <Button
                onClick={() => {
                  setShowDetails(false);
                  setShowResolveModal(true);
                }}
              >
                <Flag className="w-4 h-4 mr-2" />
                Resolve Dispute
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Resolve Dispute Modal */}
      <Dialog open={showResolveModal} onOpenChange={setShowResolveModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resolve Dispute</DialogTitle>
            <DialogDescription>
              Choose resolution and provide notes for this disputed escrow account
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Resolution Decision</Label>
              <Select value={resolution} onValueChange={(value: any) => setResolution(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="release_to_vendor">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      Release to Vendor
                    </div>
                  </SelectItem>
                  <SelectItem value="refund_to_customer">
                    <div className="flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-red-600" />
                      Refund to Customer
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Resolution Notes</Label>
              <Textarea
                placeholder="Provide detailed notes explaining your resolution decision..."
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                rows={5}
              />
              <p className="text-xs text-muted-foreground">
                These notes will be visible to both customer and vendor
              </p>
            </div>

            {selectedDispute && (
              <div className="rounded-lg bg-muted p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Escrow ID:</span>
                  <span className="font-mono">{selectedDispute.escrowId}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Amount:</span>
                  <span className="font-bold">{formatCurrency(selectedDispute.amount)}</span>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowResolveModal(false);
                setResolution('release_to_vendor');
                setResolutionNotes('');
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleResolveDispute}
              disabled={resolveDisputeMutation.isPending || !resolutionNotes.trim()}
            >
              {resolveDisputeMutation.isPending ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Resolving...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Confirm Resolution
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
