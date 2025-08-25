'use client';

import { useState, useEffect } from 'react';
import { AnimatedCard, GlowingButton, AnimatedNumber } from '@/components/ui/AnimatedCard';
import {
  AlertTriangle,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  MessageCircle,
  Eye,
  Shield,
  TrendingUp,
  TrendingDown,
  User,
  Store,
  Package,
  DollarSign,
  Calendar,
  Flag,
  Gavel,
  FileText,
  Phone,
  Mail,
  MapPin,
  Star,
  ThumbsUp,
  ThumbsDown,
  MoreVertical,
  Download,
  Send,
  Paperclip,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils/cn';
import { 
  useDisputes, 
  useDisputeCounts, 
  useUpdateDispute, 
  useResolveDispute,
  useExportDisputes
} from '@/lib/hooks/use-disputes';
import type { 
  Dispute, 
  DisputeFilter,
  DisputeStatus,
  DisputeType,
  DisputePriority 
} from '@/lib/api/types/dispute.types';
import { toast } from 'sonner';

// Remove mock data interfaces and data since we're using real API types and data now

export default function DisputesPage() {
  // State for filters and UI
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Build filter object
  const disputeFilter: DisputeFilter = {
    page: currentPage,
    limit: pageSize,
    searchTerm: searchTerm || undefined,
    status: statusFilter !== 'all' ? (statusFilter as DisputeStatus) : undefined,
    type: typeFilter !== 'all' ? (typeFilter as DisputeType) : undefined,
    priority: priorityFilter !== 'all' ? (priorityFilter as DisputePriority) : undefined,
    sortBy: 'updatedAt',
    sortOrder: 'desc',
  };

  // API hooks
  const { 
    disputes: disputesResponse, 
    isLoading, 
    error, 
    refetch 
  } = useDisputes(disputeFilter);
  
  const { 
    data: disputeCounts, 
    isLoading: countsLoading 
  } = useDisputeCounts();
  
  const updateDisputeMutation = useUpdateDispute();
  const resolveDisputeMutation = useResolveDispute();
  const exportDisputesMutation = useExportDisputes();

  // Get disputes from API response
  const disputes = disputesResponse?.disputes || [];
  
  // Calculate stats from API counts
  const stats = {
    total: disputeCounts?.total || 0,
    open: disputeCounts?.open || 0,
    investigating: disputeCounts?.investigating || 0,
    resolved: disputeCounts?.resolved || 0,
    escalated: disputeCounts?.escalated || 0,
    avgResolutionTime: 3.2, // This would come from analytics API
    satisfactionRate: 87.5, // This would come from analytics API
  };

  const getStatusColor = (status: DisputeStatus) => {
    switch (status) {
      case DisputeStatus.OPEN:
        return 'bg-blue-100 text-blue-800';
      case DisputeStatus.UNDER_REVIEW:
      case DisputeStatus.INVESTIGATING:
        return 'bg-yellow-100 text-yellow-800';
      case DisputeStatus.RESOLVED:
        return 'bg-green-100 text-green-800';
      case DisputeStatus.ESCALATED:
        return 'bg-red-100 text-red-800';
      case DisputeStatus.CLOSED:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: DisputeStatus) => {
    switch (status) {
      case DisputeStatus.OPEN:
        return AlertTriangle;
      case DisputeStatus.UNDER_REVIEW:
      case DisputeStatus.INVESTIGATING:
        return Eye;
      case DisputeStatus.RESOLVED:
        return CheckCircle;
      case DisputeStatus.ESCALATED:
        return Flag;
      case DisputeStatus.CLOSED:
        return XCircle;
      default:
        return Clock;
    }
  };

  const getPriorityColor = (priority: DisputePriority) => {
    switch (priority) {
      case DisputePriority.URGENT:
        return 'bg-red-100 text-red-800';
      case DisputePriority.HIGH:
        return 'bg-orange-100 text-orange-800';
      case DisputePriority.MEDIUM:
        return 'bg-yellow-100 text-yellow-800';
      case DisputePriority.LOW:
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: DisputeType) => {
    switch (type) {
      case DisputeType.REFUND_REQUEST:
        return DollarSign;
      case DisputeType.QUALITY_ISSUE:
      case DisputeType.ITEM_NOT_AS_DESCRIBED:
      case DisputeType.DAMAGED_ITEM:
        return Package;
      case DisputeType.ORDER_NOT_RECEIVED:
      case DisputeType.DELIVERY_ISSUE:
        return MapPin;
      case DisputeType.SERVICE_ISSUE:
        return User;
      case DisputeType.FRAUD_COMPLAINT:
        return Shield;
      default:
        return AlertTriangle;
    }
  };

  const handleStatusChange = async (disputeId: string, newStatus: DisputeStatus) => {
    try {
      if (newStatus === 'resolved') {
        // For resolved status, we need to use the resolve mutation
        await resolveDisputeMutation.mutateAsync({
          disputeId,
          data: {
            resolution: 'no_action', // Default resolution, would be customizable
            resolutionNotes: 'Marked as resolved by admin',
            notifyCustomer: true,
            notifyVendor: true,
          },
        });
      } else {
        // For other status changes, use the update mutation
        await updateDisputeMutation.mutateAsync({
          disputeId,
          data: { status: newStatus },
        });
      }
      
      // Refresh the list
      refetch();
    } catch (error) {
      console.error('Failed to update dispute status:', error);
    }
  };

  const handleExport = async (format: 'csv' | 'xlsx' | 'pdf' = 'csv') => {
    try {
      await exportDisputesMutation.mutateAsync({
        filter: disputeFilter,
        format,
      });
    } catch (error) {
      console.error('Failed to export disputes:', error);
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

  return (
    <div className='space-y-8'>
      {/* Header */}
      <div className='relative'>
        <div className='absolute inset-0 -z-10 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-pink-600/5 rounded-3xl' />
        <div className='p-8'>
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent'>
                Dispute Resolution
              </h1>
              <p className='text-gray-600 mt-2 flex items-center gap-2'>
                <Gavel className='h-4 w-4' />
                Platform dispute management and mediation system
              </p>
            </div>
            <div className='flex items-center gap-3'>
              <GlowingButton 
                size='sm' 
                variant='secondary'
                onClick={() => handleExport('csv')}
                disabled={exportDisputesMutation.isLoading}
              >
                {exportDisputesMutation.isLoading ? (
                  <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                ) : (
                  <Download className='h-4 w-4 mr-2' />
                )}
                Export Report
              </GlowingButton>
              <GlowingButton size='sm' variant='primary'>
                <FileText className='h-4 w-4 mr-2' />
                Create Case
              </GlowingButton>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className='grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4'>
        <AnimatedCard delay={0}>
          <div className='p-4 text-center'>
            <div className='rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 w-12 h-12 flex items-center justify-center mx-auto mb-3'>
              <Gavel className='h-6 w-6 text-white' />
            </div>
            {countsLoading ? (
              <div className='animate-pulse'>
                <div className='h-8 bg-gray-200 rounded w-16 mx-auto mb-2'></div>
                <div className='h-4 bg-gray-200 rounded w-20 mx-auto'></div>
              </div>
            ) : (
              <>
                <p className='text-2xl font-bold text-gray-900'>{stats.total}</p>
                <p className='text-sm text-gray-600'>Total Disputes</p>
              </>
            )}
          </div>
        </AnimatedCard>

        <AnimatedCard delay={100}>
          <div className='p-4 text-center'>
            <div className='rounded-lg bg-gradient-to-r from-blue-500 to-cyan-600 w-12 h-12 flex items-center justify-center mx-auto mb-3'>
              <AlertTriangle className='h-6 w-6 text-white' />
            </div>
            {countsLoading ? (
              <div className='animate-pulse'>
                <div className='h-8 bg-gray-200 rounded w-16 mx-auto mb-2'></div>
                <div className='h-4 bg-gray-200 rounded w-12 mx-auto'></div>
              </div>
            ) : (
              <>
                <p className='text-2xl font-bold text-gray-900'>{stats.open}</p>
                <p className='text-sm text-gray-600'>Open</p>
              </>
            )}
          </div>
        </AnimatedCard>

        <AnimatedCard delay={200}>
          <div className='p-4 text-center'>
            <div className='rounded-lg bg-gradient-to-r from-yellow-500 to-orange-600 w-12 h-12 flex items-center justify-center mx-auto mb-3'>
              <Eye className='h-6 w-6 text-white' />
            </div>
            {countsLoading ? (
              <div className='animate-pulse'>
                <div className='h-8 bg-gray-200 rounded w-16 mx-auto mb-2'></div>
                <div className='h-4 bg-gray-200 rounded w-20 mx-auto'></div>
              </div>
            ) : (
              <>
                <p className='text-2xl font-bold text-gray-900'>{stats.investigating}</p>
                <p className='text-sm text-gray-600'>Investigating</p>
              </>
            )}
          </div>
        </AnimatedCard>

        <AnimatedCard delay={300}>
          <div className='p-4 text-center'>
            <div className='rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 w-12 h-12 flex items-center justify-center mx-auto mb-3'>
              <CheckCircle className='h-6 w-6 text-white' />
            </div>
            {countsLoading ? (
              <div className='animate-pulse'>
                <div className='h-8 bg-gray-200 rounded w-16 mx-auto mb-2'></div>
                <div className='h-4 bg-gray-200 rounded w-16 mx-auto'></div>
              </div>
            ) : (
              <>
                <p className='text-2xl font-bold text-gray-900'>{stats.resolved}</p>
                <p className='text-sm text-gray-600'>Resolved</p>
              </>
            )}
          </div>
        </AnimatedCard>

        <AnimatedCard delay={400}>
          <div className='p-4 text-center'>
            <div className='rounded-lg bg-gradient-to-r from-red-500 to-pink-600 w-12 h-12 flex items-center justify-center mx-auto mb-3'>
              <Flag className='h-6 w-6 text-white' />
            </div>
            {countsLoading ? (
              <div className='animate-pulse'>
                <div className='h-8 bg-gray-200 rounded w-16 mx-auto mb-2'></div>
                <div className='h-4 bg-gray-200 rounded w-16 mx-auto'></div>
              </div>
            ) : (
              <>
                <p className='text-2xl font-bold text-gray-900'>{stats.escalated}</p>
                <p className='text-sm text-gray-600'>Escalated</p>
              </>
            )}
          </div>
        </AnimatedCard>

        <AnimatedCard delay={500}>
          <div className='p-4 text-center'>
            <div className='rounded-lg bg-gradient-to-r from-purple-500 to-indigo-600 w-12 h-12 flex items-center justify-center mx-auto mb-3'>
              <Clock className='h-6 w-6 text-white' />
            </div>
            <p className='text-2xl font-bold text-gray-900'>{stats.avgResolutionTime}</p>
            <p className='text-sm text-gray-600'>Avg Days</p>
          </div>
        </AnimatedCard>
      </div>

      {/* Filters */}
      <div className='flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between'>
        <div className='flex flex-wrap items-center gap-4'>
          <div className='flex items-center gap-2'>
            <Filter className='h-4 w-4 text-gray-500' />
            <select
              value={statusFilter}
              onChange={e => {
                setStatusFilter(e.target.value);
                setCurrentPage(1); // Reset to first page when filter changes
              }}
              className='rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
            >
              <option value='all'>All Status</option>
              <option value='open'>Open</option>
              <option value='under_review'>Under Review</option>
              <option value='investigating'>Investigating</option>
              <option value='resolved'>Resolved</option>
              <option value='escalated'>Escalated</option>
              <option value='closed'>Closed</option>
            </select>
          </div>

          <select
            value={typeFilter}
            onChange={e => {
              setTypeFilter(e.target.value);
              setCurrentPage(1);
            }}
            className='rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
          >
            <option value='all'>All Types</option>
            <option value='order_not_received'>Order Not Received</option>
            <option value='item_not_as_described'>Item Not As Described</option>
            <option value='damaged_item'>Damaged Item</option>
            <option value='quality_issue'>Quality Issue</option>
            <option value='refund_request'>Refund Request</option>
            <option value='delivery_issue'>Delivery Issue</option>
            <option value='service_issue'>Service Issue</option>
            <option value='fraud_complaint'>Fraud Complaint</option>
            <option value='other'>Other</option>
          </select>

          <select
            value={priorityFilter}
            onChange={e => {
              setPriorityFilter(e.target.value);
              setCurrentPage(1);
            }}
            className='rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
          >
            <option value='all'>All Priorities</option>
            <option value='urgent'>Urgent</option>
            <option value='high'>High</option>
            <option value='medium'>Medium</option>
            <option value='low'>Low</option>
          </select>
          
          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className='inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50'
          >
            <RefreshCw className={cn('h-4 w-4 mr-2', isLoading && 'animate-spin')} />
            Refresh
          </button>
        </div>

        <div className='relative'>
          <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400' />
          <input
            type='search'
            placeholder='Search disputes...'
            value={searchTerm}
            onChange={e => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className='w-64 rounded-lg border border-gray-300 py-2 pl-10 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
          />
        </div>
      </div>

      {/* Disputes Table */}
      <AnimatedCard delay={600}>
        <div className='p-6'>
          <div className='flex items-center justify-between mb-6'>
            <div>
              <h3 className='text-lg font-semibold text-gray-900'>Active Disputes</h3>
              <p className='text-sm text-gray-600'>
                {isLoading ? (
                  'Loading disputes...'
                ) : (
                  `${disputesResponse?.total || 0} total disputes found`
                )}
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className='space-y-4'>
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className='animate-pulse'>
                  <div className='h-16 bg-gray-200 rounded'></div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className='text-center py-12 text-red-600'>
              <AlertTriangle className='h-12 w-12 mx-auto mb-4' />
              <h3 className='text-lg font-semibold mb-2'>Error Loading Disputes</h3>
              <p className='text-sm text-gray-600 mb-4'>
                {error?.message || 'Failed to load disputes'}
              </p>
              <button
                onClick={() => refetch()}
                className='inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700'
              >
                <RefreshCw className='h-4 w-4 mr-2' />
                Try Again
              </button>
            </div>
          ) : (
            <div className='overflow-x-auto'>
              <table className='w-full text-sm'>
                <thead>
                  <tr className='border-b'>
                    <th className='pb-3 text-left font-medium text-gray-600'>Dispute ID</th>
                    <th className='pb-3 text-left font-medium text-gray-600'>Customer</th>
                    <th className='pb-3 text-left font-medium text-gray-600'>Vendor</th>
                    <th className='pb-3 text-left font-medium text-gray-600'>Subject</th>
                    <th className='pb-3 text-left font-medium text-gray-600'>Type</th>
                    <th className='pb-3 text-left font-medium text-gray-600'>Amount</th>
                    <th className='pb-3 text-left font-medium text-gray-600'>Priority</th>
                    <th className='pb-3 text-left font-medium text-gray-600'>Status</th>
                    <th className='pb-3 text-left font-medium text-gray-600'>Created</th>
                    <th className='pb-3 text-left font-medium text-gray-600'>Actions</th>
                  </tr>
                </thead>
                <tbody className='divide-y'>
                  {disputes.map(dispute => {
                    const StatusIcon = getStatusIcon(dispute.status);
                    const TypeIcon = getTypeIcon(dispute.type);

                    return (
                      <tr key={dispute.id} className='hover:bg-gray-50'>
                        <td className='py-4 font-medium text-gray-900'>{dispute.reference}</td>
                        <td className='py-4 text-gray-600'>{dispute.customer.name}</td>
                        <td className='py-4 text-gray-600'>{dispute.vendor.name}</td>
                        <td className='py-4 text-gray-600 max-w-xs truncate'>{dispute.subject}</td>
                        <td className='py-4'>
                          <div className='flex items-center gap-2'>
                            <TypeIcon className='h-4 w-4 text-gray-500' />
                            <span className='capitalize'>{dispute.type.replace(/_/g, ' ')}</span>
                          </div>
                        </td>
                        <td className='py-4 font-medium text-gray-900'>
                          {formatCurrency(dispute.amount)}
                        </td>
                        <td className='py-4'>
                          <span
                            className={cn(
                              'inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold',
                              getPriorityColor(dispute.priority)
                            )}
                          >
                            {dispute.priority}
                          </span>
                        </td>
                        <td className='py-4'>
                          <span
                            className={cn(
                              'inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold',
                              getStatusColor(dispute.status)
                            )}
                          >
                            <StatusIcon className='h-3 w-3' />
                            {dispute.status.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className='py-4 text-gray-600'>
                          {format(new Date(dispute.createdAt), 'MMM dd, yyyy')}
                        </td>
                        <td className='py-4'>
                          <div className='flex items-center gap-2'>
                            <button
                              onClick={() => {
                                setSelectedDispute(dispute);
                                setShowDetails(true);
                              }}
                              className='text-blue-600 hover:text-blue-800 font-medium'
                            >
                              View
                            </button>
                            {dispute.status === DisputeStatus.OPEN && (
                              <button
                                onClick={() => handleStatusChange(dispute.id, DisputeStatus.INVESTIGATING)}
                                className='text-yellow-600 hover:text-yellow-800 font-medium'
                                disabled={updateDisputeMutation.isLoading}
                              >
                                {updateDisputeMutation.isLoading ? 'Loading...' : 'Investigate'}
                              </button>
                            )}
                            {dispute.status === DisputeStatus.INVESTIGATING && (
                              <button
                                onClick={() => handleStatusChange(dispute.id, DisputeStatus.RESOLVED)}
                                className='text-green-600 hover:text-green-800 font-medium'
                                disabled={resolveDisputeMutation.isLoading}
                              >
                                {resolveDisputeMutation.isLoading ? 'Loading...' : 'Resolve'}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {!isLoading && !error && disputes.length === 0 && (
            <div className='text-center py-12'>
              <Gavel className='h-12 w-12 text-gray-400 mx-auto mb-4' />
              <h3 className='text-lg font-semibold text-gray-900 mb-2'>No disputes found</h3>
              <p className='text-gray-600'>Try adjusting your search or filters</p>
            </div>
          )}

          {/* Pagination */}
          {disputesResponse && disputesResponse.totalPages > 1 && (
            <div className='flex items-center justify-between px-6 py-4 border-t'>
              <div className='text-sm text-gray-700'>
                Showing {((disputesResponse.page - 1) * disputesResponse.limit) + 1} to{' '}
                {Math.min(disputesResponse.page * disputesResponse.limit, disputesResponse.total)} of{' '}
                {disputesResponse.total} results
              </div>
              <div className='flex items-center space-x-2'>
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage <= 1 || isLoading}
                  className='px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50'
                >
                  Previous
                </button>
                <span className='text-sm text-gray-700'>
                  Page {currentPage} of {disputesResponse.totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(Math.min(disputesResponse.totalPages, currentPage + 1))}
                  disabled={currentPage >= disputesResponse.totalPages || isLoading}
                  className='px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50'
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </AnimatedCard>

      {/* Dispute Details Modal */}
      {showDetails && selectedDispute && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
          <div className='bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto'>
            <div className='p-6 border-b'>
              <div className='flex items-center justify-between'>
                <h2 className='text-xl font-semibold'>Dispute Details - {selectedDispute.id}</h2>
                <button
                  onClick={() => setShowDetails(false)}
                  className='text-gray-500 hover:text-gray-700'
                >
                  <XCircle className='h-6 w-6' />
                </button>
              </div>
            </div>

            <div className='p-6 space-y-6'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div>
                  <h3 className='font-semibold text-gray-900 mb-3'>Dispute Information</h3>
                  <div className='space-y-2'>
                    <p>
                      <strong>Order ID:</strong> {selectedDispute.orderId}
                    </p>
                    <p>
                      <strong>Customer:</strong> {selectedDispute.customer.name}
                    </p>
                    <p>
                      <strong>Vendor:</strong> {selectedDispute.vendor.name}
                    </p>
                    <p>
                      <strong>Subject:</strong> {selectedDispute.subject}
                    </p>
                    <p>
                      <strong>Amount:</strong> {formatCurrency(selectedDispute.amount)}
                    </p>
                    <p>
                      <strong>Type:</strong> {selectedDispute.type.replace(/_/g, ' ')}
                    </p>
                    <p>
                      <strong>Priority:</strong> {selectedDispute.priority}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className='font-semibold text-gray-900 mb-3'>Status & Timeline</h3>
                  <div className='space-y-2'>
                    <p>
                      <strong>Status:</strong>
                      <span
                        className={cn(
                          'ml-2 inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold',
                          getStatusColor(selectedDispute.status)
                        )}
                      >
                        {selectedDispute.status}
                      </span>
                    </p>
                    <p>
                      <strong>Created:</strong>{' '}
                      {format(selectedDispute.createdAt, 'MMM dd, yyyy HH:mm')}
                    </p>
                    <p>
                      <strong>Updated:</strong>{' '}
                      {format(selectedDispute.updatedAt, 'MMM dd, yyyy HH:mm')}
                    </p>
                    {selectedDispute.resolvedAt && (
                      <p>
                        <strong>Resolved:</strong>{' '}
                        {format(selectedDispute.resolvedAt, 'MMM dd, yyyy HH:mm')}
                      </p>
                    )}
                    <p>
                      <strong>Assigned To:</strong> {selectedDispute.assignedTo || 'Unassigned'}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className='font-semibold text-gray-900 mb-3'>Description</h3>
                <p className='text-gray-700 bg-gray-50 p-4 rounded-lg'>
                  {selectedDispute.description}
                </p>
              </div>

              {selectedDispute.adminNotes && (
                <div>
                  <h3 className='font-semibold text-gray-900 mb-3'>Admin Notes</h3>
                  <p className='text-gray-700 bg-yellow-50 p-4 rounded-lg'>
                    {selectedDispute.adminNotes}
                  </p>
                </div>
              )}

              {selectedDispute.resolutionNotes && (
                <div>
                  <h3 className='font-semibold text-gray-900 mb-3'>Resolution</h3>
                  <p className='text-gray-700 bg-green-50 p-4 rounded-lg'>
                    {selectedDispute.resolutionNotes}
                  </p>
                </div>
              )}

              {/* Evidence Section */}
              {selectedDispute.evidence && selectedDispute.evidence.length > 0 && (
                <div>
                  <h3 className='font-semibold text-gray-900 mb-3'>Evidence</h3>
                  <div className='grid gap-2'>
                    {selectedDispute.evidence.map((evidence) => (
                      <div key={evidence.id} className='flex items-center space-x-3 p-3 bg-gray-50 rounded-lg'>
                        <FileText className='h-5 w-5 text-gray-500' />
                        <div className='flex-1'>
                          <p className='text-sm font-medium text-gray-900'>{evidence.filename}</p>
                          <p className='text-xs text-gray-500'>
                            {(evidence.size / 1024).toFixed(1)} KB • Uploaded {format(new Date(evidence.uploadedAt), 'MMM dd, yyyy')}
                          </p>
                        </div>
                        <button
                          onClick={() => window.open(evidence.url, '_blank')}
                          className='text-blue-600 hover:text-blue-800 text-sm font-medium'
                        >
                          View
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Timeline Section */}
              {selectedDispute.timeline && selectedDispute.timeline.length > 0 && (
                <div>
                  <h3 className='font-semibold text-gray-900 mb-3'>Timeline</h3>
                  <div className='space-y-3'>
                    {selectedDispute.timeline.map((entry) => (
                      <div key={entry.id} className='border-l-2 border-blue-200 pl-4'>
                        <div className='flex items-center justify-between'>
                          <span className='font-medium text-gray-900'>{entry.action}</span>
                          <span className='text-sm text-gray-500'>
                            {format(new Date(entry.createdAt), 'MMM dd, HH:mm')}
                          </span>
                        </div>
                        <p className='text-sm text-gray-600'>{entry.description}</p>
                        {entry.performedByName && (
                          <p className='text-xs text-gray-500 mt-1'>by {entry.performedByName}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className='flex justify-end gap-3'>
                <GlowingButton variant='secondary' onClick={() => setShowDetails(false)}>
                  Close
                </GlowingButton>
                {selectedDispute.status === DisputeStatus.OPEN && (
                  <GlowingButton
                    variant='primary'
                    onClick={() => {
                      handleStatusChange(selectedDispute.id, DisputeStatus.INVESTIGATING);
                      setShowDetails(false);
                    }}
                    disabled={updateDisputeMutation.isLoading}
                  >
                    {updateDisputeMutation.isLoading ? 'Processing...' : 'Start Investigation'}
                  </GlowingButton>
                )}
                {selectedDispute.status === DisputeStatus.INVESTIGATING && (
                  <GlowingButton
                    variant='success'
                    onClick={() => {
                      handleStatusChange(selectedDispute.id, DisputeStatus.RESOLVED);
                      setShowDetails(false);
                    }}
                    disabled={resolveDisputeMutation.isLoading}
                  >
                    {resolveDisputeMutation.isLoading ? 'Resolving...' : 'Mark Resolved'}
                  </GlowingButton>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
