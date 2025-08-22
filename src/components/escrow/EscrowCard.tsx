import { Escrow } from '@/lib/api/types';
import { EscrowStatusBadge } from './EscrowStatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  User, 
  Store, 
  DollarSign, 
  Clock,
  AlertTriangle,
  Eye,
  MoreHorizontal
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface EscrowCardProps {
  escrow: Escrow;
  onView?: (escrowId: string) => void;
  onAction?: (escrowId: string, action: string) => void;
  compact?: boolean;
}

export function EscrowCard({ escrow, onView, onAction, compact = false }: EscrowCardProps) {
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: escrow.currency || 'NGN',
    }).format(amount);
  };

  const isExpiringSoon = () => {
    if (!escrow.expiresAt) return false;
    const expiryDate = new Date(escrow.expiresAt);
    const now = new Date();
    const hoursUntilExpiry = (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    return hoursUntilExpiry > 0 && hoursUntilExpiry <= 24;
  };

  const isExpired = () => {
    if (!escrow.expiresAt) return false;
    return new Date(escrow.expiresAt) < new Date();
  };

  const getAvailableActions = () => {
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

  const availableActions = getAvailableActions();

  if (compact) {
    return (
      <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
        <div className="flex items-center space-x-4">
          <div>
            <div className="font-medium text-sm">{escrow.reference}</div>
            <div className="text-xs text-gray-500">
              {escrow.customerName} → {escrow.vendorName}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="text-right">
            <div className="font-semibold">{formatAmount(escrow.amount)}</div>
            {isExpiringSoon() && (
              <Badge variant="outline" className="text-xs text-orange-600 border-orange-200">
                <Clock className="h-3 w-3 mr-1" />
                Expires Soon
              </Badge>
            )}
          </div>
          <EscrowStatusBadge status={escrow.status} size="sm" />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onView?.(escrow.id)}
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">
              {escrow.reference}
            </CardTitle>
            <div className="text-sm text-gray-500 mt-1">
              Created {formatDistanceToNow(new Date(escrow.createdAt))} ago
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {(isExpiringSoon() || isExpired()) && (
              <Badge 
                variant="outline" 
                className={`text-xs ${isExpired() ? 'text-red-600 border-red-200' : 'text-orange-600 border-orange-200'}`}
              >
                <AlertTriangle className="h-3 w-3 mr-1" />
                {isExpired() ? 'Expired' : 'Expires Soon'}
              </Badge>
            )}
            <EscrowStatusBadge status={escrow.status} />
            
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
                      onClick={() => onAction?.(escrow.id, action)}
                    >
                      {action.charAt(0).toUpperCase() + action.slice(1)}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm">
              <User className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600">Customer:</span>
              <span className="font-medium">{escrow.customerName || 'N/A'}</span>
            </div>
            
            <div className="flex items-center space-x-2 text-sm">
              <Store className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600">Vendor:</span>
              <span className="font-medium">{escrow.vendorName || 'N/A'}</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm">
              <DollarSign className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600">Amount:</span>
              <span className="font-semibold text-green-600">
                {formatAmount(escrow.amount)}
              </span>
            </div>
            
            {escrow.expiresAt && (
              <div className="flex items-center space-x-2 text-sm">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">Expires:</span>
                <span className="font-medium">
                  {format(new Date(escrow.expiresAt), 'MMM dd, yyyy')}
                </span>
              </div>
            )}
          </div>
        </div>
        
        {escrow.description && (
          <div className="mb-4">
            <p className="text-sm text-gray-600 line-clamp-2">
              {escrow.description}
            </p>
          </div>
        )}
        
        {escrow.dispute && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <span className="text-sm font-medium text-red-700">
                Active Dispute
              </span>
            </div>
            <p className="text-xs text-red-600 mt-1">
              {escrow.dispute.reason || 'Dispute reason not specified'}
            </p>
          </div>
        )}
        
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="text-xs text-gray-500">
            Updated {formatDistanceToNow(new Date(escrow.updatedAt))} ago
          </div>
          
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onView?.(escrow.id)}
            >
              <Eye className="h-4 w-4 mr-1" />
              View Details
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}