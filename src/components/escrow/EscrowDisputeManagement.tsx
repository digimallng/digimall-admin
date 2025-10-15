'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  AlertTriangle, 
  MessageSquare, 
  Clock, 
  CheckCircle,
  XCircle,
  Eye,
  FileText,
  User,
  Calendar,
  Filter,
  Search,
  RefreshCw,
  Download,
  Gavel,
  Shield
} from 'lucide-react';
import { useEscrowDisputes, useResolveDispute } from '@/lib/hooks/use-escrow';
import { DisputeStatus, DisputeResolutionRequest } from '@/lib/api/types';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

interface EscrowDisputeManagementProps {
  className?: string;
}

const disputeStatuses = [
  { value: DisputeStatus.OPEN, label: 'Open', color: 'yellow' },
  { value: DisputeStatus.UNDER_REVIEW, label: 'Under Review', color: 'blue' },
  { value: DisputeStatus.RESOLVED, label: 'Resolved', color: 'green' },
  { value: DisputeStatus.ESCALATED, label: 'Escalated', color: 'red' },
  { value: DisputeStatus.CLOSED, label: 'Closed', color: 'gray' },
];

const resolutionTypes = [
  { value: 'release_to_vendor', label: 'Release to Vendor' },
  { value: 'refund_to_customer', label: 'Refund to Customer' },
  { value: 'partial_release', label: 'Partial Release' },
  { value: 'mediation_required', label: 'Mediation Required' },
  { value: 'no_action', label: 'No Action Required' },
];

export function EscrowDisputeManagement({ className }: EscrowDisputeManagementProps) {
  const [activeTab, setActiveTab] = useState<'active' | 'resolved' | 'escalated'>('active');
  const [selectedDispute, setSelectedDispute] = useState<string | null>(null);
  const [showResolutionForm, setShowResolutionForm] = useState(false);
  const [resolutionData, setResolutionData] = useState<Partial<DisputeResolutionRequest>>({});
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: disputes, isLoading, error, refetch } = useEscrowDisputes({
    status: filterStatus === 'all' ? undefined : filterStatus,
    search: searchQuery || undefined,
    includeEscrowDetails: true,
  });

  const resolveMutation = useResolveDispute();

  const handleDisputeSelect = (disputeId: string) => {
    setSelectedDispute(disputeId);
    setShowResolutionForm(false);
  };

  const handleStartResolution = () => {
    setShowResolutionForm(true);
    setResolutionData({
      disputeId: selectedDispute!,
      resolution: '',
      resolutionNotes: '',
    });
  };

  const handleResolveDispute = async () => {
    if (!selectedDispute || !resolutionData.resolution) return;

    try {
      await resolveMutation.mutateAsync({
        disputeId: selectedDispute,
        data: resolutionData as DisputeResolutionRequest,
      });
      
      setShowResolutionForm(false);
      setSelectedDispute(null);
      refetch();
    } catch (error) {
      console.error('Failed to resolve dispute:', error);
    }
  };

  const getDisputePriorityColor = (createdAt: string) => {
    const daysSinceCreated = Math.floor(
      (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (daysSinceCreated > 7) return 'red';
    if (daysSinceCreated > 3) return 'yellow';
    return 'green';
  };

  const selectedDisputeData = disputes?.data?.find(d => d.id === selectedDispute);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Failed to load dispute data. Please try again.
        </AlertDescription>
      </Alert>
    );
  }

  const activeDisputes = disputes?.data?.filter(d => 
    [DisputeStatus.OPEN, DisputeStatus.UNDER_REVIEW].includes(d.status)
  ) || [];

  const resolvedDisputes = disputes?.data?.filter(d => 
    d.status === DisputeStatus.RESOLVED
  ) || [];

  const escalatedDisputes = disputes?.data?.filter(d => 
    d.status === DisputeStatus.ESCALATED
  ) || [];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Disputes</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{activeDisputes.length}</div>
            <p className="text-xs text-muted-foreground">Requiring resolution</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {resolvedDisputes.filter(d => 
                new Date(d.resolvedAt || '').toDateString() === new Date().toDateString()
              ).length}
            </div>
            <p className="text-xs text-muted-foreground">Completed today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Resolution Time</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">2.3d</div>
            <p className="text-xs text-muted-foreground">Average time to resolve</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-[300px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search disputes by reference, customer, or reason..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {disputeStatuses.map((status) => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button variant="outline" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>

        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Dispute List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Gavel className="h-5 w-5" />
                <span>Dispute Queue</span>
              </CardTitle>
              <CardDescription>
                Select a dispute to view details and take action
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-96 overflow-y-auto">
                {disputes?.data?.map((dispute) => {
                  const priorityColor = getDisputePriorityColor(dispute.createdAt);
                  const statusConfig = disputeStatuses.find(s => s.value === dispute.status);

                  return (
                    <div
                      key={dispute.id}
                      className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                        selectedDispute === dispute.id ? 'bg-blue-50 border-blue-200' : ''
                      }`}
                      onClick={() => handleDisputeSelect(dispute.id)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full bg-${priorityColor}-500`} />
                          <span className="text-sm font-medium">
                            {dispute.escrow?.reference || dispute.id}
                          </span>
                        </div>
                        <Badge 
                          variant="secondary" 
                          className={`text-${statusConfig?.color}-700 bg-${statusConfig?.color}-100`}
                        >
                          {statusConfig?.label}
                        </Badge>
                      </div>
                      
                      <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                        {dispute.reason || 'No reason provided'}
                      </p>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{format(new Date(dispute.createdAt), 'MMM dd, HH:mm')}</span>
                        <span>₦{dispute.escrow?.amount?.toLocaleString()}</span>
                      </div>
                    </div>
                  );
                })}

                {disputes?.data?.length === 0 && (
                  <div className="p-8 text-center text-gray-500">
                    <MessageSquare className="mx-auto h-12 w-12 mb-4 opacity-50" />
                    <p>No disputes found</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Dispute Details */}
        <div className="lg:col-span-2">
          {selectedDisputeData ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="h-5 w-5" />
                    <span>Dispute Details</span>
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant="secondary"
                      className={`text-${disputeStatuses.find(s => s.value === selectedDisputeData.status)?.color}-700 bg-${disputeStatuses.find(s => s.value === selectedDisputeData.status)?.color}-100`}
                    >
                      {disputeStatuses.find(s => s.value === selectedDisputeData.status)?.label}
                    </Badge>
                    {!showResolutionForm && selectedDisputeData.status === DisputeStatus.OPEN && (
                      <Button onClick={handleStartResolution} size="sm">
                        <Gavel className="h-4 w-4 mr-2" />
                        Resolve
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Escrow Information */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Escrow Reference</Label>
                    <p className="text-sm">{selectedDisputeData.escrow?.reference}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Amount</Label>
                    <p className="text-sm font-bold">₦{selectedDisputeData.escrow?.amount?.toLocaleString()}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Customer</Label>
                    <p className="text-sm">{selectedDisputeData.escrow?.customer?.fullName || 'Unknown'}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Vendor</Label>
                    <p className="text-sm">{selectedDisputeData.escrow?.vendor?.fullName || 'Unknown'}</p>
                  </div>
                </div>

                {/* Dispute Information */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Dispute Reason</Label>
                    <p className="text-sm bg-gray-50 p-3 rounded-md">
                      {selectedDisputeData.reason || 'No reason provided'}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Additional Details</Label>
                    <p className="text-sm bg-gray-50 p-3 rounded-md">
                      {selectedDisputeData.description || 'No additional details provided'}
                    </p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Filed Date</Label>
                      <p className="text-sm">{format(new Date(selectedDisputeData.createdAt), 'MMM dd, yyyy HH:mm')}</p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Filed By</Label>
                      <p className="text-sm">{selectedDisputeData.filedBy || 'Customer'}</p>
                    </div>
                  </div>
                </div>

                {/* Evidence/Attachments */}
                {selectedDisputeData.evidence && selectedDisputeData.evidence.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Evidence</Label>
                    <div className="space-y-2">
                      {selectedDisputeData.evidence.map((item: any, index: number) => (
                        <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                          <FileText className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">{item.filename || `Evidence ${index + 1}`}</span>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Resolution Form */}
                {showResolutionForm && (
                  <div className="border-t pt-6 space-y-4">
                    <h3 className="text-lg font-semibold">Resolve Dispute</h3>
                    
                    <div className="space-y-2">
                      <Label>Resolution Type</Label>
                      <Select 
                        value={resolutionData.resolution} 
                        onValueChange={(value) => setResolutionData(prev => ({ ...prev, resolution: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select resolution type" />
                        </SelectTrigger>
                        <SelectContent>
                          {resolutionTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Resolution Notes</Label>
                      <Textarea
                        value={resolutionData.resolutionNotes || ''}
                        onChange={(e) => setResolutionData(prev => ({ ...prev, resolutionNotes: e.target.value }))}
                        placeholder="Provide detailed notes about your decision..."
                        rows={4}
                      />
                    </div>

                    <div className="flex items-center space-x-4">
                      <Button 
                        onClick={handleResolveDispute}
                        disabled={!resolutionData.resolution || resolveMutation.isPending}
                      >
                        {resolveMutation.isPending ? 'Resolving...' : 'Resolve Dispute'}
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setShowResolutionForm(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                {/* Resolution History */}
                {selectedDisputeData.resolutionHistory && selectedDisputeData.resolutionHistory.length > 0 && (
                  <div className="border-t pt-6 space-y-4">
                    <h3 className="text-lg font-semibold">Resolution History</h3>
                    <div className="space-y-3">
                      {selectedDisputeData.resolutionHistory.map((entry: any, index: number) => (
                        <div key={index} className="border-l-2 border-blue-200 pl-4">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{entry.action}</span>
                            <span className="text-sm text-gray-500">
                              {format(new Date(entry.timestamp), 'MMM dd, HH:mm')}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">{entry.notes}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Dispute</h3>
                <p className="text-gray-500">
                  Choose a dispute from the list to view details and take action
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}