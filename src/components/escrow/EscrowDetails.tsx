import { useState } from 'react';
import { Escrow } from '@/lib/api/types';
import { useEscrowManagement } from '@/lib/hooks/use-escrow';
import { EscrowStatusBadge } from './EscrowStatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  User, 
  Store, 
  DollarSign, 
  Calendar,
  Clock,
  AlertTriangle,
  FileText,
  Shield,
  Activity,
  ExternalLink,
  RefreshCw,
  CheckCircle,
  XCircle,
  Ban,
  Timer,
  MessageSquare
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

// Safe date formatting functions
const safeFormat = (dateString: string | undefined, formatString: string) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    return format(date, formatString);
  } catch {
    return 'Invalid date';
  }
};

const safeFormatDistanceToNow = (dateString: string | undefined) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    return formatDistanceToNow(date);
  } catch {
    return 'Invalid date';
  }
};

interface EscrowDetailsProps {
  escrowId: string;
  onClose?: () => void;
  onActionComplete?: () => void;
}

export function EscrowDetails({ escrowId, onClose, onActionComplete }: EscrowDetailsProps) {
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  
  const {
    escrow,
    isLoading,
    error,
    refetch,
    performAction,
    release,
    refund,
    extend,
    cancel,
    forceRelease,
    validateAction,
    formatAmount,
    calculateAge,
    calculateTimeToExpiry
  } = useEscrowManagement(escrowId);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-24" />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="space-y-6">
            {[...Array(2)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !escrow) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Failed to load escrow details. Please try again.
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

  const escrowAge = calculateAge();
  const timeToExpiry = calculateTimeToExpiry();
  const isExpired = timeToExpiry?.expired;
  const isExpiringSoon = timeToExpiry && !timeToExpiry.expired && 
    timeToExpiry.days === 0 && timeToExpiry.hours <= 24;

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'release':
        return CheckCircle;
      case 'refund':
        return RefreshCw;
      case 'extend':
        return Timer;
      case 'cancel':
        return Ban;
      case 'force_release':
        return Shield;
      case 'dispute':
        return AlertTriangle;
      default:
        return Activity;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'release':
        return 'bg-green-600 hover:bg-green-700';
      case 'refund':
        return 'bg-blue-600 hover:bg-blue-700';
      case 'extend':
        return 'bg-yellow-600 hover:bg-yellow-700';
      case 'cancel':
        return 'bg-gray-600 hover:bg-gray-700';
      case 'force_release':
        return 'bg-red-600 hover:bg-red-700';
      case 'dispute':
        return 'bg-orange-600 hover:bg-orange-700';
      default:
        return 'bg-primary hover:bg-primary/90';
    }
  };

  const getAvailableActions = () => {
    const actions = [];
    
    switch (escrow.status) {
      case 'funded':
      case 'pending':
        actions.push('release', 'refund', 'extend', 'dispute');
        break;
      case 'disputed':
        actions.push('force_release');
        break;
      case 'created':
        actions.push('cancel');
        break;
    }
    
    return actions.filter(action => validateAction(action).valid);
  };

  const availableActions = getAvailableActions();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{escrow.reference}</h1>
          <div className="flex items-center space-x-4 mt-2">
            <EscrowStatusBadge status={escrow.status} />
            {(isExpired || isExpiringSoon) && (
              <Badge 
                variant="outline" 
                className={`${isExpired ? 'text-red-600 border-red-200' : 'text-orange-600 border-orange-200'}`}
              >
                <AlertTriangle className="h-3 w-3 mr-1" />
                {isExpired ? 'Expired' : 'Expires Soon'}
              </Badge>
            )}
          </div>
        </div>
        
        {onClose && (
          <Button variant="outline" onClick={onClose}>
            <XCircle className="h-4 w-4 mr-2" />
            Close
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Basic Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <User className="h-5 w-5 text-gray-400" />
                    <div>
                      <div className="text-sm text-gray-600">Customer</div>
                      <div className="font-semibold">{escrow.customerName || 'N/A'}</div>
                      <div className="text-xs text-gray-500">{escrow.customerId}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Store className="h-5 w-5 text-gray-400" />
                    <div>
                      <div className="text-sm text-gray-600">Vendor</div>
                      <div className="font-semibold">{escrow.vendorName || 'N/A'}</div>
                      <div className="text-xs text-gray-500">{escrow.vendorId}</div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <DollarSign className="h-5 w-5 text-gray-400" />
                    <div>
                      <div className="text-sm text-gray-600">Amount</div>
                      <div className="text-xl font-bold text-green-600">
                        {formatAmount ? formatAmount(escrow.amount) : `₦${escrow.amount.toLocaleString()}`}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <div>
                      <div className="text-sm text-gray-600">Created</div>
                      <div className="font-semibold">
                        {safeFormat(escrow.createdAt, 'MMM dd, yyyy HH:mm')}
                      </div>
                      <div className="text-xs text-gray-500">
                        {safeFormatDistanceToNow(escrow.createdAt)} ago
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {escrow.description && (
                <>
                  <Separator />
                  <div>
                    <div className="text-sm text-gray-600 mb-2">Description</div>
                    <p className="text-gray-900">{escrow.description}</p>
                  </div>
                </>
              )}
              
              {escrow.orderId && (
                <>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-gray-600">Related Order</div>
                      <div className="font-semibold">{escrow.orderId}</div>
                    </div>
                    <Button variant="outline" size="sm">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Order
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Timeline</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Escrow Created</span>
                      <span className="text-sm text-gray-500">
                        {safeFormat(escrow.createdAt, 'MMM dd, HH:mm')}
                      </span>
                    </div>
                  </div>
                </div>
                
                {escrow.fundedAt && (
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Escrow Funded</span>
                        <span className="text-sm text-gray-500">
                          {safeFormat(escrow.fundedAt, 'MMM dd, HH:mm')}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                
                {escrow.updatedAt !== escrow.createdAt && (
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Last Updated</span>
                        <span className="text-sm text-gray-500">
                          {safeFormat(escrow.updatedAt, 'MMM dd, HH:mm')}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Dispute Information */}
          {escrow.dispute && (
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-red-700">
                  <AlertTriangle className="h-5 w-5" />
                  <span>Dispute Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-gray-600">Reason</div>
                    <div className="font-medium">{escrow.dispute.reason}</div>
                  </div>
                  
                  {escrow.dispute.description && (
                    <div>
                      <div className="text-sm text-gray-600">Description</div>
                      <p className="text-gray-900">{escrow.dispute.description}</p>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div>
                      <div className="text-sm text-gray-600">Created</div>
                      <div className="font-medium">
                        {safeFormat(escrow.dispute.createdAt, 'MMM dd, yyyy')}
                      </div>
                    </div>
                    
                    <Button variant="outline" size="sm">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Age</span>
                <span className="font-medium">
                  {escrowAge ? `${escrowAge.days}d ${escrowAge.hours}h` : 'N/A'}
                </span>
              </div>
              
              {escrow.expiresAt && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    {isExpired ? 'Expired' : 'Expires in'}
                  </span>
                  <span className={`font-medium ${isExpired ? 'text-red-600' : isExpiringSoon ? 'text-orange-600' : ''}`}>
                    {timeToExpiry ? (
                      isExpired ? 
                        `${Math.abs(timeToExpiry.days)}d ago` : 
                        `${timeToExpiry.days}d ${timeToExpiry.hours}h`
                    ) : 'N/A'}
                  </span>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Currency</span>
                <span className="font-medium">{escrow.currency || 'NGN'}</span>
              </div>
              
              {escrow.type && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Type</span>
                  <Badge variant="outline">{escrow.type}</Badge>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          {availableActions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {availableActions.map((action) => {
                  const Icon = getActionIcon(action);
                  const validation = validateAction(action);
                  
                  return (
                    <Button
                      key={action}
                      className={`w-full justify-start ${getActionColor(action)}`}
                      disabled={!validation.valid}
                      onClick={() => setSelectedAction(action)}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {action.charAt(0).toUpperCase() + action.slice(1).replace('_', ' ')}
                    </Button>
                  );
                })}
                
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => refetch()}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Data
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Metadata */}
          {escrow.metadata && Object.keys(escrow.metadata).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Additional Info</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  {Object.entries(escrow.metadata).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-gray-600 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <span className="font-medium">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Action Modal Placeholder */}
      {selectedAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">
              {selectedAction.charAt(0).toUpperCase() + selectedAction.slice(1).replace('_', ' ')} Escrow
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to {selectedAction} this escrow? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => setSelectedAction(null)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  // TODO: Implement action modal logic
                  setSelectedAction(null);
                  onActionComplete?.();
                }}
                className="flex-1"
              >
                Confirm
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}