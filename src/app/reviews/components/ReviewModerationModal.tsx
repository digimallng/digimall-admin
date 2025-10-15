'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AlertTriangle } from 'lucide-react';

export type ModerationAction = 'approve' | 'reject' | 'flag' | 'delete';

interface ReviewModerationModalProps {
  open: boolean;
  onClose: () => void;
  action: ModerationAction;
  selectedCount: number;
  onConfirm: (reason?: string) => void;
  isLoading?: boolean;
}

const actionConfig = {
  approve: {
    title: 'Approve Review(s)',
    description: 'This will make the review(s) publicly visible on the platform.',
    requiresReason: false,
    reasonLabel: 'Comment (Optional)',
    reasonPlaceholder: 'Add a comment about this approval...',
    confirmText: 'Approve',
    confirmVariant: 'default' as const,
    warningText: null,
  },
  reject: {
    title: 'Reject Review(s)',
    description: 'This will hide the review(s) from the platform.',
    requiresReason: true,
    reasonLabel: 'Rejection Reason (Required)',
    reasonPlaceholder: 'Explain why this review is being rejected...',
    confirmText: 'Reject',
    confirmVariant: 'destructive' as const,
    warningText: 'The rejection reason will be recorded for audit purposes.',
  },
  flag: {
    title: 'Flag Review(s) for Investigation',
    description: 'This will mark the review(s) as requiring investigation.',
    requiresReason: true,
    reasonLabel: 'Flag Reason (Required)',
    reasonPlaceholder: 'Explain why this review needs investigation...',
    confirmText: 'Flag',
    confirmVariant: 'default' as const,
    warningText: 'Flagged reviews will remain visible until further action is taken.',
  },
  delete: {
    title: 'Delete Review(s)',
    description: 'This will permanently delete the review(s) from the system.',
    requiresReason: false,
    reasonLabel: null,
    reasonPlaceholder: null,
    confirmText: 'Delete',
    confirmVariant: 'destructive' as const,
    warningText: 'This action cannot be undone. Product ratings will be recalculated automatically.',
  },
};

export function ReviewModerationModal({
  open,
  onClose,
  action,
  selectedCount,
  onConfirm,
  isLoading,
}: ReviewModerationModalProps) {
  const [reason, setReason] = useState('');
  const config = actionConfig[action];

  const handleConfirm = () => {
    if (config.requiresReason && !reason.trim()) {
      return;
    }
    onConfirm(reason || undefined);
    setReason('');
  };

  const handleClose = () => {
    setReason('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{config.title}</DialogTitle>
          <DialogDescription>
            {config.description}
            {selectedCount > 1 && (
              <span className="block mt-2 font-medium">
                {selectedCount} review(s) selected
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        {config.warningText && (
          <div className="flex gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-yellow-800">{config.warningText}</p>
          </div>
        )}

        {config.reasonLabel && (
          <div className="space-y-2">
            <Label htmlFor="reason">
              {config.reasonLabel}
              {config.requiresReason && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Textarea
              id="reason"
              placeholder={config.reasonPlaceholder || ''}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              required={config.requiresReason}
            />
            {config.requiresReason && !reason.trim() && (
              <p className="text-sm text-red-500">This field is required</p>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant={config.confirmVariant}
            onClick={handleConfirm}
            disabled={isLoading || (config.requiresReason && !reason.trim())}
          >
            {isLoading ? 'Processing...' : config.confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
