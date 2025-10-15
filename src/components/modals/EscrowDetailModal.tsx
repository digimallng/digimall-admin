'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Shield,
  DollarSign,
  User,
  Store,
  Package,
  Calendar,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useReleaseEscrow, useRefundEscrow, useResolveDispute } from '@/lib/hooks/use-escrow';
import type { EscrowAccount } from '@/lib/api/types/escrow.types';

interface EscrowDetailModalProps {
  escrow: EscrowAccount | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EscrowDetailModal({ escrow, open, onOpenChange }: EscrowDetailModalProps) {
  const [actionType, setActionType] = useState<'release' | 'refund' | 'resolve' | null>(null);
  const [reason, setReason] = useState('');
  const [resolution, setResolution] = useState<'release_to_vendor' | 'refund_to_customer'>('release_to_vendor');
  const [forceAction, setForceAction] = useState(false);

  const releaseEscrow = useReleaseEscrow();
  const refundEscrow = useRefundEscrow();
  const resolveDispute = useResolveDispute();

  if (!escrow) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount / 100);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'released':
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle className="w-3 h-3 mr-1" />
            Released
          </Badge>
        );
      case 'refunded':
        return (
          <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">
            <XCircle className="w-3 h-3 mr-1" />
            Refunded
          </Badge>
        );
      case 'disputed':
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Disputed
          </Badge>
        );
      case 'funded':
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            <DollarSign className="w-3 h-3 mr-1" />
            Funded
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">
            <Clock className="w-3 h-3 mr-1" />
            {status}
          </Badge>
        );
    }
  };

  const handleRelease = async () => {
    if (!reason.trim()) {
      toast.error('Please provide a reason for releasing the escrow');
      return;
    }

    try {
      await releaseEscrow.mutateAsync({
        id: escrow._id,
        data: {
          reason,
          forceRelease: forceAction,
        },
      });

      toast.success('Escrow funds released successfully');
      setActionType(null);
      setReason('');
      setForceAction(false);
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to release escrow');
    }
  };

  const handleRefund = async () => {
    if (!reason.trim()) {
      toast.error('Please provide a reason for refunding the escrow');
      return;
    }

    try {
      await refundEscrow.mutateAsync({
        id: escrow._id,
        data: {
          reason,
          forceRefund: forceAction,
        },
      });

      toast.success('Escrow funds refunded successfully');
      setActionType(null);
      setReason('');
      setForceAction(false);
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to refund escrow');
    }
  };

  const handleResolveDispute = async () => {
    if (!reason.trim()) {
      toast.error('Please provide resolution notes');
      return;
    }

    try {
      await resolveDispute.mutateAsync({
        id: escrow._id,
        data: {
          resolution,
          resolutionNotes: reason,
        },
      });

      toast.success('Dispute resolved successfully');
      setActionType(null);
      setReason('');
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to resolve dispute');
    }
  };

  const isProcessing = releaseEscrow.isPending || refundEscrow.isPending || resolveDispute.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Escrow Details - {escrow.escrowId}
          </DialogTitle>
          <DialogDescription>
            View and manage escrow account details
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status and Amount */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground">Status</Label>
              <div className="mt-1">{getStatusBadge(escrow.status)}</div>
            </div>
            <div>
              <Label className="text-muted-foreground">Amount</Label>
              <div className="text-2xl font-bold mt-1">{formatCurrency(escrow.amount)}</div>
            </div>
          </div>

          <Separator />

          {/* Order Information */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Package className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-semibold">Order Information</h3>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <Label className="text-muted-foreground">Order Number</Label>
                <p className="font-medium mt-1">{escrow.orderId.orderNumber}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Order Status</Label>
                <p className="font-medium mt-1 capitalize">{escrow.orderId.status}</p>
              </div>
              {escrow.orderId.totalAmount && (
                <div>
                  <Label className="text-muted-foreground">Order Total</Label>
                  <p className="font-medium mt-1">{formatCurrency(escrow.orderId.totalAmount)}</p>
                </div>
              )}
              {escrow.parentOrderId && (
                <div>
                  <Label className="text-muted-foreground">Parent Order</Label>
                  <p className="font-medium mt-1">{escrow.parentOrderId.parentOrderNumber}</p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Customer Information */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <User className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-semibold">Customer Information</h3>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <Label className="text-muted-foreground">Name</Label>
                <p className="font-medium mt-1">
                  {escrow.customerId.firstName} {escrow.customerId.lastName}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground">Email</Label>
                <p className="font-medium mt-1">{escrow.customerId.email}</p>
              </div>
              {escrow.customerId.phone && (
                <div>
                  <Label className="text-muted-foreground">Phone</Label>
                  <p className="font-medium mt-1">{escrow.customerId.phone}</p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Vendor Information */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Store className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-semibold">Vendor Information</h3>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <Label className="text-muted-foreground">Business Name</Label>
                <p className="font-medium mt-1">{escrow.vendorId.businessInfo.businessName}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Contact Email</Label>
                <p className="font-medium mt-1">{escrow.vendorId.businessInfo.contactEmail}</p>
              </div>
              {escrow.vendorId.businessInfo.contactPhone && (
                <div>
                  <Label className="text-muted-foreground">Contact Phone</Label>
                  <p className="font-medium mt-1">{escrow.vendorId.businessInfo.contactPhone}</p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Release Conditions */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-semibold">Release Conditions</h3>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <Label className="text-muted-foreground">Auto-release After</Label>
                <p className="font-medium mt-1">{escrow.releaseConditions.autoReleaseAfterDays} days</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Requires Delivery Confirmation</Label>
                <p className="font-medium mt-1">
                  {escrow.releaseConditions.requiresDeliveryConfirmation ? 'Yes' : 'No'}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground">Requires Customer Approval</Label>
                <p className="font-medium mt-1">
                  {escrow.releaseConditions.requiresCustomerApproval ? 'Yes' : 'No'}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Dates */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-semibold">Important Dates</h3>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <Label className="text-muted-foreground">Created At</Label>
                <p className="font-medium mt-1">
                  {format(new Date(escrow.createdAt), 'MMM dd, yyyy HH:mm')}
                </p>
              </div>
              {escrow.fundedAt && (
                <div>
                  <Label className="text-muted-foreground">Funded At</Label>
                  <p className="font-medium mt-1">
                    {format(new Date(escrow.fundedAt), 'MMM dd, yyyy HH:mm')}
                  </p>
                </div>
              )}
              {escrow.releasedAt && (
                <div>
                  <Label className="text-muted-foreground">Released At</Label>
                  <p className="font-medium mt-1">
                    {format(new Date(escrow.releasedAt), 'MMM dd, yyyy HH:mm')}
                  </p>
                </div>
              )}
              {escrow.refundedAt && (
                <div>
                  <Label className="text-muted-foreground">Refunded At</Label>
                  <p className="font-medium mt-1">
                    {format(new Date(escrow.refundedAt), 'MMM dd, yyyy HH:mm')}
                  </p>
                </div>
              )}
              {escrow.expiresAt && (
                <div>
                  <Label className="text-muted-foreground">Expires At</Label>
                  <p className="font-medium mt-1 text-orange-600">
                    {format(new Date(escrow.expiresAt), 'MMM dd, yyyy HH:mm')}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Action Section */}
          {escrow.status === 'funded' && !actionType && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold mb-3">Actions</h3>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setActionType('release')}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Release to Vendor
                  </Button>
                  <Button
                    onClick={() => setActionType('refund')}
                    variant="outline"
                    className="border-purple-300 text-purple-700 hover:bg-purple-50"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Refund to Customer
                  </Button>
                </div>
              </div>
            </>
          )}

          {escrow.status === 'disputed' && !actionType && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold mb-3">Dispute Resolution</h3>
                <Button
                  onClick={() => setActionType('resolve')}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Resolve Dispute
                </Button>
              </div>
            </>
          )}

          {/* Release Form */}
          {actionType === 'release' && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3 className="font-semibold text-green-700">Release Escrow to Vendor</h3>
                <div>
                  <Label htmlFor="release-reason">Reason for Release *</Label>
                  <Textarea
                    id="release-reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Provide a detailed reason for releasing the escrow..."
                    rows={4}
                    className="mt-1"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="force-release"
                    checked={forceAction}
                    onChange={(e) => setForceAction(e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor="force-release" className="text-sm font-normal">
                    Force release (bypass release conditions)
                  </Label>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleRelease}
                    disabled={isProcessing}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isProcessing ? 'Processing...' : 'Confirm Release'}
                  </Button>
                  <Button
                    onClick={() => {
                      setActionType(null);
                      setReason('');
                      setForceAction(false);
                    }}
                    variant="outline"
                    disabled={isProcessing}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </>
          )}

          {/* Refund Form */}
          {actionType === 'refund' && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3 className="font-semibold text-purple-700">Refund Escrow to Customer</h3>
                <div>
                  <Label htmlFor="refund-reason">Reason for Refund *</Label>
                  <Textarea
                    id="refund-reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Provide a detailed reason for refunding the escrow..."
                    rows={4}
                    className="mt-1"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="force-refund"
                    checked={forceAction}
                    onChange={(e) => setForceAction(e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor="force-refund" className="text-sm font-normal">
                    Force refund (bypass refund conditions)
                  </Label>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleRefund}
                    disabled={isProcessing}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {isProcessing ? 'Processing...' : 'Confirm Refund'}
                  </Button>
                  <Button
                    onClick={() => {
                      setActionType(null);
                      setReason('');
                      setForceAction(false);
                    }}
                    variant="outline"
                    disabled={isProcessing}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </>
          )}

          {/* Resolve Dispute Form */}
          {actionType === 'resolve' && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3 className="font-semibold text-red-700">Resolve Dispute</h3>
                <div>
                  <Label htmlFor="resolution">Resolution *</Label>
                  <Select value={resolution} onValueChange={(value: any) => setResolution(value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="release_to_vendor">Release to Vendor</SelectItem>
                      <SelectItem value="refund_to_customer">Refund to Customer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="resolution-notes">Resolution Notes *</Label>
                  <Textarea
                    id="resolution-notes"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Provide detailed notes explaining the resolution decision..."
                    rows={4}
                    className="mt-1"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleResolveDispute}
                    disabled={isProcessing}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {isProcessing ? 'Processing...' : 'Confirm Resolution'}
                  </Button>
                  <Button
                    onClick={() => {
                      setActionType(null);
                      setReason('');
                    }}
                    variant="outline"
                    disabled={isProcessing}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
