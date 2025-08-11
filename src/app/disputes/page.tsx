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
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils/cn';

interface Dispute {
  id: string;
  orderId: string;
  customerId: string;
  customerName: string;
  vendorId: string;
  vendorName: string;
  productName: string;
  amount: number;
  type: 'refund' | 'quality' | 'delivery' | 'service' | 'fraud';
  status: 'open' | 'investigating' | 'resolved' | 'escalated' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  description: string;
  customerEvidence: string[];
  vendorResponse?: string;
  adminNotes?: string;
  resolution?: string;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  assignedTo?: string;
}

interface DisputeMessage {
  id: string;
  disputeId: string;
  senderId: string;
  senderName: string;
  senderType: 'customer' | 'vendor' | 'admin';
  message: string;
  attachments?: string[];
  timestamp: Date;
}

const mockDisputes: Dispute[] = [
  {
    id: 'DSP-001',
    orderId: 'ORD-12345',
    customerId: 'CUST-001',
    customerName: 'John Doe',
    vendorId: 'VEND-001',
    vendorName: 'TechHub Nigeria',
    productName: 'iPhone 15 Pro Max',
    amount: 850000,
    type: 'quality',
    status: 'investigating',
    priority: 'high',
    description: 'Received product with damaged screen and battery issues',
    customerEvidence: ['damaged-screen.jpg', 'battery-report.pdf'],
    vendorResponse: 'Product was inspected before shipping. Customer may have damaged it.',
    adminNotes: 'Investigating with photos and vendor response',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    assignedTo: 'Admin User',
  },
  {
    id: 'DSP-002',
    orderId: 'ORD-12346',
    customerId: 'CUST-002',
    customerName: 'Jane Smith',
    vendorId: 'VEND-002',
    vendorName: 'Fashion Forward',
    productName: 'Designer Handbag',
    amount: 125000,
    type: 'delivery',
    status: 'open',
    priority: 'medium',
    description: 'Order not delivered after 2 weeks, no tracking updates',
    customerEvidence: ['order-confirmation.pdf'],
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'DSP-003',
    orderId: 'ORD-12347',
    customerId: 'CUST-003',
    customerName: 'Mike Johnson',
    vendorId: 'VEND-003',
    vendorName: 'Home Essentials',
    productName: 'Smart TV 55"',
    amount: 425000,
    type: 'refund',
    status: 'resolved',
    priority: 'low',
    description: 'Customer changed mind, requesting refund',
    customerEvidence: [],
    vendorResponse: 'Product is in original condition, can accept return',
    adminNotes: 'Approved refund as per policy',
    resolution: 'Refund approved - ₦425,000 refunded to customer',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    resolvedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    assignedTo: 'Admin User',
  },
  {
    id: 'DSP-004',
    orderId: 'ORD-12348',
    customerId: 'CUST-004',
    customerName: 'Sarah Williams',
    vendorId: 'VEND-004',
    vendorName: 'QuickFix Electronics',
    productName: 'Phone Screen Repair',
    amount: 25000,
    type: 'service',
    status: 'escalated',
    priority: 'urgent',
    description: 'Phone damaged during repair, vendor refusing responsibility',
    customerEvidence: ['before-repair.jpg', 'after-damage.jpg'],
    vendorResponse: 'Customer phone was already damaged beyond repair',
    adminNotes: 'Escalated to legal team due to conflicting evidence',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    assignedTo: 'Legal Team',
  },
];

export default function DisputesPage() {
  const [disputes, setDisputes] = useState<Dispute[]>(mockDisputes);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [newMessage, setNewMessage] = useState('');

  const filteredDisputes = disputes.filter(dispute => {
    const matchesSearch =
      dispute.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dispute.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dispute.vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dispute.productName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || dispute.status === statusFilter;
    const matchesType = typeFilter === 'all' || dispute.type === typeFilter;
    const matchesPriority = priorityFilter === 'all' || dispute.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesType && matchesPriority;
  });

  const stats = {
    total: disputes.length,
    open: disputes.filter(d => d.status === 'open').length,
    investigating: disputes.filter(d => d.status === 'investigating').length,
    resolved: disputes.filter(d => d.status === 'resolved').length,
    escalated: disputes.filter(d => d.status === 'escalated').length,
    avgResolutionTime: 3.2, // days
    satisfactionRate: 87.5, // percentage
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-blue-100 text-blue-800';
      case 'investigating':
        return 'bg-yellow-100 text-yellow-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'escalated':
        return 'bg-red-100 text-red-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return AlertTriangle;
      case 'investigating':
        return Eye;
      case 'resolved':
        return CheckCircle;
      case 'escalated':
        return Flag;
      case 'closed':
        return XCircle;
      default:
        return Clock;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'refund':
        return DollarSign;
      case 'quality':
        return Package;
      case 'delivery':
        return MapPin;
      case 'service':
        return User;
      case 'fraud':
        return Shield;
      default:
        return AlertTriangle;
    }
  };

  const handleStatusChange = (disputeId: string, newStatus: string) => {
    setDisputes(prev =>
      prev.map(dispute =>
        dispute.id === disputeId
          ? {
              ...dispute,
              status: newStatus as any,
              updatedAt: new Date(),
              resolvedAt: newStatus === 'resolved' ? new Date() : undefined,
            }
          : dispute
      )
    );
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
              <GlowingButton size='sm' variant='secondary'>
                <Download className='h-4 w-4 mr-2' />
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
            <p className='text-2xl font-bold text-gray-900'>{stats.total}</p>
            <p className='text-sm text-gray-600'>Total Disputes</p>
          </div>
        </AnimatedCard>

        <AnimatedCard delay={100}>
          <div className='p-4 text-center'>
            <div className='rounded-lg bg-gradient-to-r from-blue-500 to-cyan-600 w-12 h-12 flex items-center justify-center mx-auto mb-3'>
              <AlertTriangle className='h-6 w-6 text-white' />
            </div>
            <p className='text-2xl font-bold text-gray-900'>{stats.open}</p>
            <p className='text-sm text-gray-600'>Open</p>
          </div>
        </AnimatedCard>

        <AnimatedCard delay={200}>
          <div className='p-4 text-center'>
            <div className='rounded-lg bg-gradient-to-r from-yellow-500 to-orange-600 w-12 h-12 flex items-center justify-center mx-auto mb-3'>
              <Eye className='h-6 w-6 text-white' />
            </div>
            <p className='text-2xl font-bold text-gray-900'>{stats.investigating}</p>
            <p className='text-sm text-gray-600'>Investigating</p>
          </div>
        </AnimatedCard>

        <AnimatedCard delay={300}>
          <div className='p-4 text-center'>
            <div className='rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 w-12 h-12 flex items-center justify-center mx-auto mb-3'>
              <CheckCircle className='h-6 w-6 text-white' />
            </div>
            <p className='text-2xl font-bold text-gray-900'>{stats.resolved}</p>
            <p className='text-sm text-gray-600'>Resolved</p>
          </div>
        </AnimatedCard>

        <AnimatedCard delay={400}>
          <div className='p-4 text-center'>
            <div className='rounded-lg bg-gradient-to-r from-red-500 to-pink-600 w-12 h-12 flex items-center justify-center mx-auto mb-3'>
              <Flag className='h-6 w-6 text-white' />
            </div>
            <p className='text-2xl font-bold text-gray-900'>{stats.escalated}</p>
            <p className='text-sm text-gray-600'>Escalated</p>
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
              onChange={e => setStatusFilter(e.target.value)}
              className='rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
            >
              <option value='all'>All Status</option>
              <option value='open'>Open</option>
              <option value='investigating'>Investigating</option>
              <option value='resolved'>Resolved</option>
              <option value='escalated'>Escalated</option>
              <option value='closed'>Closed</option>
            </select>
          </div>

          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className='rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
          >
            <option value='all'>All Types</option>
            <option value='refund'>Refund</option>
            <option value='quality'>Quality</option>
            <option value='delivery'>Delivery</option>
            <option value='service'>Service</option>
            <option value='fraud'>Fraud</option>
          </select>

          <select
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value)}
            className='rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
          >
            <option value='all'>All Priorities</option>
            <option value='urgent'>Urgent</option>
            <option value='high'>High</option>
            <option value='medium'>Medium</option>
            <option value='low'>Low</option>
          </select>
        </div>

        <div className='relative'>
          <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400' />
          <input
            type='search'
            placeholder='Search disputes...'
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
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
              <p className='text-sm text-gray-600'>Manage and resolve platform disputes</p>
            </div>
          </div>

          <div className='overflow-x-auto'>
            <table className='w-full text-sm'>
              <thead>
                <tr className='border-b'>
                  <th className='pb-3 text-left font-medium text-gray-600'>Dispute ID</th>
                  <th className='pb-3 text-left font-medium text-gray-600'>Customer</th>
                  <th className='pb-3 text-left font-medium text-gray-600'>Vendor</th>
                  <th className='pb-3 text-left font-medium text-gray-600'>Product</th>
                  <th className='pb-3 text-left font-medium text-gray-600'>Type</th>
                  <th className='pb-3 text-left font-medium text-gray-600'>Amount</th>
                  <th className='pb-3 text-left font-medium text-gray-600'>Priority</th>
                  <th className='pb-3 text-left font-medium text-gray-600'>Status</th>
                  <th className='pb-3 text-left font-medium text-gray-600'>Created</th>
                  <th className='pb-3 text-left font-medium text-gray-600'>Actions</th>
                </tr>
              </thead>
              <tbody className='divide-y'>
                {filteredDisputes.map(dispute => {
                  const StatusIcon = getStatusIcon(dispute.status);
                  const TypeIcon = getTypeIcon(dispute.type);

                  return (
                    <tr key={dispute.id} className='hover:bg-gray-50'>
                      <td className='py-4 font-medium text-gray-900'>{dispute.id}</td>
                      <td className='py-4 text-gray-600'>{dispute.customerName}</td>
                      <td className='py-4 text-gray-600'>{dispute.vendorName}</td>
                      <td className='py-4 text-gray-600'>{dispute.productName}</td>
                      <td className='py-4'>
                        <div className='flex items-center gap-2'>
                          <TypeIcon className='h-4 w-4 text-gray-500' />
                          <span className='capitalize'>{dispute.type}</span>
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
                          {dispute.status}
                        </span>
                      </td>
                      <td className='py-4 text-gray-600'>
                        {format(dispute.createdAt, 'MMM dd, yyyy')}
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
                          {dispute.status === 'open' && (
                            <button
                              onClick={() => handleStatusChange(dispute.id, 'investigating')}
                              className='text-yellow-600 hover:text-yellow-800 font-medium'
                            >
                              Investigate
                            </button>
                          )}
                          {dispute.status === 'investigating' && (
                            <button
                              onClick={() => handleStatusChange(dispute.id, 'resolved')}
                              className='text-green-600 hover:text-green-800 font-medium'
                            >
                              Resolve
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

          {filteredDisputes.length === 0 && (
            <div className='text-center py-12'>
              <Gavel className='h-12 w-12 text-gray-400 mx-auto mb-4' />
              <h3 className='text-lg font-semibold text-gray-900 mb-2'>No disputes found</h3>
              <p className='text-gray-600'>Try adjusting your search or filters</p>
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
                      <strong>Customer:</strong> {selectedDispute.customerName}
                    </p>
                    <p>
                      <strong>Vendor:</strong> {selectedDispute.vendorName}
                    </p>
                    <p>
                      <strong>Product:</strong> {selectedDispute.productName}
                    </p>
                    <p>
                      <strong>Amount:</strong> {formatCurrency(selectedDispute.amount)}
                    </p>
                    <p>
                      <strong>Type:</strong> {selectedDispute.type}
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

              {selectedDispute.vendorResponse && (
                <div>
                  <h3 className='font-semibold text-gray-900 mb-3'>Vendor Response</h3>
                  <p className='text-gray-700 bg-blue-50 p-4 rounded-lg'>
                    {selectedDispute.vendorResponse}
                  </p>
                </div>
              )}

              {selectedDispute.adminNotes && (
                <div>
                  <h3 className='font-semibold text-gray-900 mb-3'>Admin Notes</h3>
                  <p className='text-gray-700 bg-yellow-50 p-4 rounded-lg'>
                    {selectedDispute.adminNotes}
                  </p>
                </div>
              )}

              {selectedDispute.resolution && (
                <div>
                  <h3 className='font-semibold text-gray-900 mb-3'>Resolution</h3>
                  <p className='text-gray-700 bg-green-50 p-4 rounded-lg'>
                    {selectedDispute.resolution}
                  </p>
                </div>
              )}

              <div className='flex justify-end gap-3'>
                <GlowingButton variant='secondary' onClick={() => setShowDetails(false)}>
                  Close
                </GlowingButton>
                {selectedDispute.status === 'open' && (
                  <GlowingButton
                    variant='primary'
                    onClick={() => {
                      handleStatusChange(selectedDispute.id, 'investigating');
                      setShowDetails(false);
                    }}
                  >
                    Start Investigation
                  </GlowingButton>
                )}
                {selectedDispute.status === 'investigating' && (
                  <GlowingButton
                    variant='success'
                    onClick={() => {
                      handleStatusChange(selectedDispute.id, 'resolved');
                      setShowDetails(false);
                    }}
                  >
                    Mark Resolved
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
