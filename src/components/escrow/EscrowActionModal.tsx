import { useState } from 'react';
import { Escrow, EscrowActionRequest } from '@/lib/api/types';
import { useEscrowAction, useReleaseEscrow, useRefundEscrow, useExtendEscrow, useCancelEscrow, useForceReleaseEscrow } from '@/lib/hooks/use-escrow';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/Textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  CheckCircle, 
  RefreshCw, 
  Timer,
  Ban,
  Shield,
  AlertTriangle,
  DollarSign,
  Calendar,
  Loader2
} from 'lucide-react';

interface EscrowActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  escrow: Escrow;
  action: string;
  onSuccess?: () => void;
}

interface ActionFormData {
  reason: string;
  amount?: number;
  days?: number;
  actionType?: string;
}

const actionConfig = {
  release: {
    title: 'Release Escrow',
    description: 'Release the funds to the vendor. This action cannot be undone.',
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
  },
  refund: {
    title: 'Refund Escrow',
    description: 'Refund the funds to the customer. This action cannot be undone.',
    icon: RefreshCw,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
  extend: {
    title: 'Extend Escrow',
    description: 'Extend the escrow expiry date by the specified number of days.',
    icon: Timer,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
  },
  cancel: {
    title: 'Cancel Escrow',
    description: 'Cancel this escrow. Funds will be returned to the customer if already funded.',
    icon: Ban,
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
  },
  force_release: {
    title: 'Force Release Escrow',
    description: 'Force release the funds despite disputes. Use with extreme caution.',
    icon: Shield,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
  },
  dispute: {
    title: 'Create Dispute',
    description: 'Create a dispute for this escrow that requires manual resolution.',
    icon: AlertTriangle,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
  },
};

const refundOptions = [
  { value: 'full', label: 'Full Refund', description: 'Refund the entire escrow amount' },
  { value: 'partial', label: 'Partial Refund', description: 'Refund a specific amount' },
];

const disputeReasons = [
  'Product not received',
  'Product not as described',
  'Damaged product',
  'Quality issues',
  'Delivery problems',
  'Vendor unresponsive',
  'Customer complaint',
  'Other',
];

export function EscrowActionModal({ 
  isOpen, 
  onClose, 
  escrow, 
  action, 
  onSuccess 
}: EscrowActionModalProps) {
  const [formData, setFormData] = useState<ActionFormData>({
    reason: '',
    amount: undefined,
    days: 7,
    actionType: 'full',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const config = actionConfig[action as keyof typeof actionConfig];
  const Icon = config?.icon || AlertTriangle;

  // Mutations
  const escrowActionMutation = useEscrowAction();
  const releaseMutation = useReleaseEscrow();
  const refundMutation = useRefundEscrow();
  const extendMutation = useExtendEscrow();
  const cancelMutation = useCancelEscrow();
  const forceReleaseMutation = useForceReleaseEscrow();

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: escrow.currency || 'NGN',
    }).format(amount);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      switch (action) {
        case 'release':
          await releaseMutation.mutateAsync({
            escrowId: escrow.id,
            reason: formData.reason || 'Manual release by admin',
          });
          break;

        case 'refund':
          const refundAmount = formData.actionType === 'partial' ? formData.amount : undefined;
          await refundMutation.mutateAsync({
            escrowId: escrow.id,
            reason: formData.reason || 'Manual refund by admin',
            amount: refundAmount,
          });
          break;

        case 'extend':
          if (!formData.days || formData.days < 1) {
            throw new Error('Please specify a valid number of days');
          }
          await extendMutation.mutateAsync({
            escrowId: escrow.id,
            days: formData.days,
            reason: formData.reason || `Extended by ${formData.days} days`,
          });
          break;

        case 'cancel':
          await cancelMutation.mutateAsync({
            escrowId: escrow.id,
            reason: formData.reason || 'Cancelled by admin',
          });
          break;

        case 'force_release':
          if (!formData.reason.trim()) {
            throw new Error('Reason is required for force release');
          }
          await forceReleaseMutation.mutateAsync({
            escrowId: escrow.id,
            reason: formData.reason,
          });
          break;

        case 'dispute':
          const disputeData: EscrowActionRequest = {
            action: 'dispute',
            reason: formData.reason || 'Dispute created by admin',
          };
          await escrowActionMutation.mutateAsync({
            escrowId: escrow.id,
            data: disputeData,
          });
          break;

        default:
          throw new Error('Unknown action');
      }

      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateFormData = (key: keyof ActionFormData, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const isFormValid = () => {
    switch (action) {
      case 'extend':
        return formData.days && formData.days > 0;
      case 'force_release':
        return formData.reason.trim().length > 0;
      case 'refund':
        if (formData.actionType === 'partial') {
          return formData.amount && formData.amount > 0 && formData.amount <= escrow.amount;
        }
        return true;
      case 'dispute':
        return formData.reason.trim().length > 0;
      default:
        return true;
    }
  };

  if (!config) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <div className={`p-2 rounded-full ${config.bgColor}`}>
              <Icon className={`h-5 w-5 ${config.color}`} />
            </div>
            <span>{config.title}</span>
          </DialogTitle>
          <DialogDescription>
            {config.description}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Escrow Summary */}
          <div className={`p-4 rounded-lg border ${config.borderColor} ${config.bgColor}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">{escrow.reference}</span>
              <Badge variant="outline">{escrow.status}</Badge>
            </div>
            <div className="text-sm text-gray-600 space-y-1">
              <div className="flex justify-between">
                <span>Amount:</span>
                <span className="font-semibold">{formatAmount(escrow.amount)}</span>
              </div>
              <div className="flex justify-between">
                <span>Customer:</span>
                <span>{escrow.customerName || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span>Vendor:</span>
                <span>{escrow.vendorName || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Action-specific fields */}
          {action === 'refund' && (
            <div className="space-y-3">
              <div>
                <Label>Refund Type</Label>
                <Select 
                  value={formData.actionType} 
                  onValueChange={(value) => updateFormData('actionType', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {refundOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div>
                          <div className="font-medium">{option.label}</div>
                          <div className="text-xs text-gray-500">{option.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {formData.actionType === 'partial' && (
                <div>
                  <Label htmlFor="amount">Refund Amount</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="amount"
                      type="number"
                      placeholder="0.00"
                      value={formData.amount || ''}
                      onChange={(e) => updateFormData('amount', parseFloat(e.target.value) || 0)}
                      className="pl-10"
                      min="0"
                      max={escrow.amount}
                      step="0.01"
                    />
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Maximum: {formatAmount(escrow.amount)}
                  </div>
                </div>
              )}
            </div>
          )}

          {action === 'extend' && (
            <div>
              <Label htmlFor="days">Extension Days</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="days"
                  type="number"
                  placeholder="7"
                  value={formData.days || ''}
                  onChange={(e) => updateFormData('days', parseInt(e.target.value) || 0)}
                  className="pl-10"
                  min="1"
                  max="365"
                />
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Number of days to extend the escrow
              </div>
            </div>
          )}

          {action === 'dispute' && (
            <div>
              <Label>Dispute Reason</Label>
              <Select 
                value={formData.reason} 
                onValueChange={(value) => updateFormData('reason', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  {disputeReasons.map((reason) => (
                    <SelectItem key={reason} value={reason}>
                      {reason}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Reason field */}
          <div>
            <Label htmlFor="reason">
              {action === 'force_release' ? 'Reason (Required)' : 'Additional Notes (Optional)'}
            </Label>
            <Textarea
              id="reason"
              placeholder={
                action === 'force_release' 
                  ? 'Explain why you are force releasing this escrow...'
                  : 'Add any additional notes or reason for this action...'
              }
              value={formData.reason}
              onChange={(e) => updateFormData('reason', e.target.value)}
              className="resize-none"
              rows={3}
              required={action === 'force_release'}
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isFormValid() || isSubmitting}
              className={`min-w-24 ${
                action === 'force_release' ? 'bg-red-600 hover:bg-red-700' :
                action === 'release' ? 'bg-green-600 hover:bg-green-700' :
                action === 'refund' ? 'bg-blue-600 hover:bg-blue-700' : ''
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Icon className="h-4 w-4 mr-2" />
                  {config.title}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}