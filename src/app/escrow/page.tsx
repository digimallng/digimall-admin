'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { GlowingButton } from '@/components/ui/AnimatedCard';
import { Modal, ModalBody, ModalFooter } from '@/components/ui/Modal';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatsCard } from '@/components/ui/StatsCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import {
  useEscrowTransactions,
  useEscrowStats,
  useReleaseFunds,
  useRefundFunds,
  useResolveDispute,
  useExportEscrowTransactions,
} from '@/lib/hooks/use-escrow';
import {
  Shield,
  Search,
  Filter,
  Eye,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  Package,
  CreditCard,
  Calendar,
  RefreshCw,
  Lock,
  Unlock,
  Info,
  FileText,
  ArrowUpRight,
  ArrowDownLeft,
  Wallet,
  Building,
  User,
  Store,
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils/cn';

interface EscrowTransaction {
  id: string;
  orderId: string;
  buyerId: string;
  buyerName: string;
  sellerId: string;
  sellerName: string;
  amount: number;
  currency: string;
  status: 'pending' | 'held' | 'disputed' | 'released' | 'refunded' | 'cancelled';
  type: 'purchase' | 'service' | 'rental' | 'subscription';
  createdAt: Date;
  updatedAt: Date;

  // Escrow specific
  escrowAgent: string;
  releaseConditions: string[];
  milestones: EscrowMilestone[];
  disputeReason?: string;
  disputeDate?: Date;
  releaseDate?: Date;
  refundDate?: Date;

  // Additional info
  productName: string;
  category: string;
  description: string;
  terms: string;
  attachments: string[];

  // Fees
  escrowFeeRate: number;
  escrowFeeAmount: number;
  platformFeeRate: number;
  platformFeeAmount: number;

  // Security
  securityDeposit?: number;
  insuranceAmount?: number;

  // Timeline
  expectedDelivery?: Date;
  actualDelivery?: Date;
  releaseDeadline?: Date;

  // Communication
  buyerNotes?: string;
  sellerNotes?: string;
  adminNotes?: string;

  // Risk assessment
  riskLevel: 'low' | 'medium' | 'high';
  riskFactors: string[];

  // Automatic release
  autoReleaseEnabled: boolean;
  autoReleaseDate?: Date;
}

interface EscrowMilestone {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  completedDate?: Date;
  isCompleted: boolean;
  amount: number;
  verificationRequired: boolean;
  verifiedBy?: string;
  verificationDate?: Date;
}

export default function EscrowPage() {
  const [transactions, setTransactions] = useState<EscrowTransaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<EscrowTransaction[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [selectedTransaction, setSelectedTransaction] = useState<EscrowTransaction | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showReleaseModal, setShowReleaseModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [actionNotes, setActionNotes] = useState('');

  const generateMockTransactions = (): EscrowTransaction[] => {
    const mockTransactions: EscrowTransaction[] = [
      {
        id: 'ESC-001',
        orderId: 'ORD-12345',
        buyerId: 'buyer-1',
        buyerName: 'John Doe',
        sellerId: 'seller-1',
        sellerName: 'TechStore Nigeria',
        amount: 250000,
        currency: 'NGN',
        status: 'held',
        type: 'purchase',
        createdAt: new Date('2024-01-15T10:30:00'),
        updatedAt: new Date('2024-01-16T14:20:00'),
        escrowAgent: 'admin-1',
        releaseConditions: ['Product delivered', 'Buyer confirmation', 'Quality verified'],
        milestones: [
          {
            id: 'M1',
            title: 'Order Confirmation',
            description: 'Seller confirms order and begins processing',
            dueDate: new Date('2024-01-15T23:59:59'),
            completedDate: new Date('2024-01-15T11:00:00'),
            isCompleted: true,
            amount: 0,
            verificationRequired: false,
          },
          {
            id: 'M2',
            title: 'Product Shipped',
            description: 'Product shipped with tracking number',
            dueDate: new Date('2024-01-17T23:59:59'),
            completedDate: new Date('2024-01-16T09:15:00'),
            isCompleted: true,
            amount: 0,
            verificationRequired: true,
            verifiedBy: 'admin-1',
            verificationDate: new Date('2024-01-16T14:20:00'),
          },
          {
            id: 'M3',
            title: 'Product Delivered',
            description: 'Product delivered to buyer',
            dueDate: new Date('2024-01-20T23:59:59'),
            isCompleted: false,
            amount: 250000,
            verificationRequired: true,
          },
        ],
        productName: 'MacBook Pro 14" M3 Chip',
        category: 'Electronics',
        description: 'Brand new MacBook Pro with M3 chip, 16GB RAM, 512GB SSD',
        terms: 'Payment held until delivery confirmed and 48-hour inspection period completed',
        attachments: ['receipt.pdf', 'warranty.pdf'],
        escrowFeeRate: 2.5,
        escrowFeeAmount: 6250,
        platformFeeRate: 1.0,
        platformFeeAmount: 2500,
        securityDeposit: 25000,
        insuranceAmount: 12500,
        expectedDelivery: new Date('2024-01-20T12:00:00'),
        releaseDeadline: new Date('2024-01-22T23:59:59'),
        buyerNotes: 'Please ensure original packaging and all accessories are included',
        sellerNotes: 'Item is brand new, unopened. Will ship with express delivery',
        adminNotes: 'High-value transaction, requires manual verification',
        riskLevel: 'medium',
        riskFactors: ['High value amount', 'New seller account'],
        autoReleaseEnabled: true,
        autoReleaseDate: new Date('2024-01-22T23:59:59'),
      },
      {
        id: 'ESC-002',
        orderId: 'ORD-12346',
        buyerId: 'buyer-2',
        buyerName: 'Jane Smith',
        sellerId: 'seller-2',
        sellerName: 'Fashion Hub Lagos',
        amount: 45000,
        currency: 'NGN',
        status: 'disputed',
        type: 'purchase',
        createdAt: new Date('2024-01-10T09:15:00'),
        updatedAt: new Date('2024-01-18T16:45:00'),
        escrowAgent: 'admin-2',
        releaseConditions: ['Product delivered', 'Quality as described', 'Buyer satisfaction'],
        milestones: [
          {
            id: 'M1',
            title: 'Order Processed',
            description: 'Order confirmed and item reserved',
            dueDate: new Date('2024-01-10T23:59:59'),
            completedDate: new Date('2024-01-10T10:00:00'),
            isCompleted: true,
            amount: 0,
            verificationRequired: false,
          },
          {
            id: 'M2',
            title: 'Item Delivered',
            description: 'Fashion item delivered to buyer',
            dueDate: new Date('2024-01-13T23:59:59'),
            completedDate: new Date('2024-01-13T14:30:00'),
            isCompleted: true,
            amount: 45000,
            verificationRequired: true,
            verifiedBy: 'admin-2',
            verificationDate: new Date('2024-01-13T15:00:00'),
          },
        ],
        disputeReason: 'Item not as described - different color and size than advertised',
        disputeDate: new Date('2024-01-18T16:45:00'),
        productName: 'Designer Dress - African Print',
        category: 'Fashion',
        description: 'Elegant African print dress, size M, blue and gold pattern',
        terms: 'Standard escrow terms with 7-day inspection period',
        attachments: ['product_photos.jpg', 'size_chart.pdf'],
        escrowFeeRate: 2.0,
        escrowFeeAmount: 900,
        platformFeeRate: 1.0,
        platformFeeAmount: 450,
        expectedDelivery: new Date('2024-01-13T12:00:00'),
        actualDelivery: new Date('2024-01-13T14:30:00'),
        buyerNotes: 'Received item in wrong color (red instead of blue) and size L instead of M',
        sellerNotes: 'Item matches description, buyer may have ordered wrong specifications',
        adminNotes: 'Dispute under review, requesting additional photos from both parties',
        riskLevel: 'high',
        riskFactors: ['Buyer dispute', 'Description mismatch', 'Size/color issues'],
        autoReleaseEnabled: false,
      },
      {
        id: 'ESC-003',
        orderId: 'ORD-12347',
        buyerId: 'buyer-3',
        buyerName: 'Michael Johnson',
        sellerId: 'seller-3',
        sellerName: 'HomeDecor Plus',
        amount: 125000,
        currency: 'NGN',
        status: 'released',
        type: 'purchase',
        createdAt: new Date('2024-01-05T14:20:00'),
        updatedAt: new Date('2024-01-15T10:30:00'),
        escrowAgent: 'admin-1',
        releaseConditions: ['Furniture delivered', 'Assembly completed', 'Buyer approval'],
        milestones: [
          {
            id: 'M1',
            title: 'Order Confirmed',
            description: 'Custom furniture order confirmed',
            dueDate: new Date('2024-01-05T23:59:59'),
            completedDate: new Date('2024-01-05T15:00:00'),
            isCompleted: true,
            amount: 0,
            verificationRequired: false,
          },
          {
            id: 'M2',
            title: 'Manufacturing Complete',
            description: 'Custom furniture manufacturing completed',
            dueDate: new Date('2024-01-12T23:59:59'),
            completedDate: new Date('2024-01-11T16:00:00'),
            isCompleted: true,
            amount: 62500,
            verificationRequired: true,
            verifiedBy: 'admin-1',
            verificationDate: new Date('2024-01-11T17:00:00'),
          },
          {
            id: 'M3',
            title: 'Delivery & Assembly',
            description: 'Furniture delivered and assembled at buyer location',
            dueDate: new Date('2024-01-15T23:59:59'),
            completedDate: new Date('2024-01-15T09:30:00'),
            isCompleted: true,
            amount: 62500,
            verificationRequired: true,
            verifiedBy: 'admin-1',
            verificationDate: new Date('2024-01-15T10:30:00'),
          },
        ],
        releaseDate: new Date('2024-01-15T10:30:00'),
        productName: 'Custom Dining Table Set',
        category: 'Furniture',
        description: 'Handcrafted dining table with 6 chairs, solid wood construction',
        terms: 'Payment released upon delivery and assembly completion',
        attachments: ['design_specs.pdf', 'assembly_guide.pdf'],
        escrowFeeRate: 2.0,
        escrowFeeAmount: 2500,
        platformFeeRate: 1.0,
        platformFeeAmount: 1250,
        expectedDelivery: new Date('2024-01-15T10:00:00'),
        actualDelivery: new Date('2024-01-15T09:30:00'),
        buyerNotes: 'Excellent craftsmanship, very satisfied with the quality',
        sellerNotes: 'Custom order completed as per specifications',
        adminNotes: 'Successful transaction, both parties satisfied',
        riskLevel: 'low',
        riskFactors: [],
        autoReleaseEnabled: true,
        autoReleaseDate: new Date('2024-01-17T23:59:59'),
      },
      {
        id: 'ESC-004',
        orderId: 'ORD-12348',
        buyerId: 'buyer-4',
        buyerName: 'Sarah Wilson',
        sellerId: 'seller-4',
        sellerName: 'Digital Services Pro',
        amount: 75000,
        currency: 'NGN',
        status: 'pending',
        type: 'service',
        createdAt: new Date('2024-01-20T08:00:00'),
        updatedAt: new Date('2024-01-20T08:00:00'),
        escrowAgent: 'admin-3',
        releaseConditions: ['Service delivered', 'Requirements met', 'Client approval'],
        milestones: [
          {
            id: 'M1',
            title: 'Project Kickoff',
            description: 'Initial consultation and project scope definition',
            dueDate: new Date('2024-01-21T23:59:59'),
            isCompleted: false,
            amount: 0,
            verificationRequired: false,
          },
          {
            id: 'M2',
            title: 'Design Phase',
            description: 'Website design mockups and client feedback',
            dueDate: new Date('2024-01-25T23:59:59'),
            isCompleted: false,
            amount: 37500,
            verificationRequired: true,
          },
          {
            id: 'M3',
            title: 'Development Complete',
            description: 'Full website development and testing',
            dueDate: new Date('2024-02-01T23:59:59'),
            isCompleted: false,
            amount: 37500,
            verificationRequired: true,
          },
        ],
        productName: 'E-commerce Website Development',
        category: 'Digital Services',
        description: 'Complete e-commerce website with payment integration and admin panel',
        terms: 'Milestone-based payment release upon completion of each phase',
        attachments: ['project_brief.pdf', 'technical_specs.pdf'],
        escrowFeeRate: 3.0,
        escrowFeeAmount: 2250,
        platformFeeRate: 1.5,
        platformFeeAmount: 1125,
        expectedDelivery: new Date('2024-02-01T23:59:59'),
        buyerNotes: 'Need modern design with mobile responsiveness',
        sellerNotes: 'Will deliver high-quality website as per specifications',
        adminNotes: 'New service-based escrow, monitoring milestone progress',
        riskLevel: 'medium',
        riskFactors: ['Service-based transaction', 'Long delivery timeline'],
        autoReleaseEnabled: false,
      },
      {
        id: 'ESC-005',
        orderId: 'ORD-12349',
        buyerId: 'buyer-5',
        buyerName: 'David Brown',
        sellerId: 'seller-5',
        sellerName: 'Auto Parts Direct',
        amount: 85000,
        currency: 'NGN',
        status: 'refunded',
        type: 'purchase',
        createdAt: new Date('2024-01-08T11:30:00'),
        updatedAt: new Date('2024-01-14T09:15:00'),
        escrowAgent: 'admin-2',
        releaseConditions: ['Parts delivered', 'Compatibility verified', 'Installation successful'],
        milestones: [
          {
            id: 'M1',
            title: 'Parts Shipped',
            description: 'Auto parts shipped to buyer',
            dueDate: new Date('2024-01-10T23:59:59'),
            completedDate: new Date('2024-01-09T16:00:00'),
            isCompleted: true,
            amount: 0,
            verificationRequired: false,
          },
          {
            id: 'M2',
            title: 'Parts Delivered',
            description: 'Auto parts delivered to buyer location',
            dueDate: new Date('2024-01-12T23:59:59'),
            completedDate: new Date('2024-01-12T10:30:00'),
            isCompleted: true,
            amount: 85000,
            verificationRequired: true,
            verifiedBy: 'admin-2',
            verificationDate: new Date('2024-01-12T11:00:00'),
          },
        ],
        refundDate: new Date('2024-01-14T09:15:00'),
        productName: 'BMW Engine Parts Kit',
        category: 'Automotive',
        description: 'Complete engine parts kit for BMW 3 Series 2018 model',
        terms: 'Full refund if parts are incompatible or defective',
        attachments: ['part_numbers.pdf', 'compatibility_chart.pdf'],
        escrowFeeRate: 2.0,
        escrowFeeAmount: 1700,
        platformFeeRate: 1.0,
        platformFeeAmount: 850,
        expectedDelivery: new Date('2024-01-12T12:00:00'),
        actualDelivery: new Date('2024-01-12T10:30:00'),
        buyerNotes: 'Parts received but wrong specifications for my car model',
        sellerNotes: 'Buyer provided incorrect vehicle information initially',
        adminNotes: 'Refund processed due to part incompatibility, seller error confirmed',
        riskLevel: 'medium',
        riskFactors: ['Technical compatibility', 'Specialized parts'],
        autoReleaseEnabled: false,
      },
    ];

    return mockTransactions;
  };

  useEffect(() => {
    const mockData = generateMockTransactions();
    setTransactions(mockData);
    setFilteredTransactions(mockData);
  }, []);

  useEffect(() => {
    let filtered = transactions;

    if (searchTerm) {
      filtered = filtered.filter(
        tx =>
          tx.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          tx.buyerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          tx.sellerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          tx.productName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(tx => tx.status === statusFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(tx => tx.type === typeFilter);
    }

    if (riskFilter !== 'all') {
      filtered = filtered.filter(tx => tx.riskLevel === riskFilter);
    }

    setFilteredTransactions(filtered);
  }, [searchTerm, statusFilter, typeFilter, riskFilter, transactions]);

  const handleViewDetails = (transaction: EscrowTransaction) => {
    setSelectedTransaction(transaction);
    setShowDetailModal(true);
  };

  const handleReleaseEscrow = (transaction: EscrowTransaction) => {
    setSelectedTransaction(transaction);
    setShowReleaseModal(true);
  };

  const handleRefundEscrow = (transaction: EscrowTransaction) => {
    setSelectedTransaction(transaction);
    setShowRefundModal(true);
  };

  const confirmReleaseEscrow = () => {
    if (selectedTransaction) {
      setTransactions(prev =>
        prev.map(tx =>
          tx.id === selectedTransaction.id
            ? { ...tx, status: 'released', releaseDate: new Date(), adminNotes: actionNotes }
            : tx
        )
      );
      setShowReleaseModal(false);
      setActionNotes('');
    }
  };

  const confirmRefundEscrow = () => {
    if (selectedTransaction) {
      setTransactions(prev =>
        prev.map(tx =>
          tx.id === selectedTransaction.id
            ? { ...tx, status: 'refunded', refundDate: new Date(), adminNotes: actionNotes }
            : tx
        )
      );
      setShowRefundModal(false);
      setActionNotes('');
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'held':
        return 'bg-blue-100 text-blue-800';
      case 'disputed':
        return 'bg-red-100 text-red-800';
      case 'released':
        return 'bg-green-100 text-green-800';
      case 'refunded':
        return 'bg-purple-100 text-purple-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return Clock;
      case 'held':
        return Lock;
      case 'disputed':
        return AlertTriangle;
      case 'released':
        return CheckCircle;
      case 'refunded':
        return RefreshCw;
      case 'cancelled':
        return XCircle;
      default:
        return Info;
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const stats = {
    total: transactions.length,
    pending: transactions.filter(tx => tx.status === 'pending').length,
    held: transactions.filter(tx => tx.status === 'held').length,
    disputed: transactions.filter(tx => tx.status === 'disputed').length,
    released: transactions.filter(tx => tx.status === 'released').length,
    refunded: transactions.filter(tx => tx.status === 'refunded').length,
    totalValue: transactions.reduce((sum, tx) => sum + tx.amount, 0),
    totalFees: transactions.reduce((sum, tx) => sum + tx.escrowFeeAmount + tx.platformFeeAmount, 0),
    avgTransactionValue:
      transactions.length > 0
        ? transactions.reduce((sum, tx) => sum + tx.amount, 0) / transactions.length
        : 0,
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>Escrow Management</h1>
          <p className='text-gray-600'>Manage secure payment transactions and disputes</p>
        </div>
        <div className='flex items-center gap-3'>
          <GlowingButton size='sm' variant='secondary' icon={<Download className='h-4 w-4' />}>
            Export
          </GlowingButton>
          <GlowingButton size='sm' variant='primary' icon={<FileText className='h-4 w-4' />}>
            Reports
          </GlowingButton>
        </div>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-gray-600'>Total Transactions</p>
                <p className='text-2xl font-bold'>{stats.total}</p>
              </div>
              <Shield className='h-8 w-8 text-blue-500' />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-gray-600'>Held in Escrow</p>
                <p className='text-2xl font-bold'>{stats.held}</p>
              </div>
              <Lock className='h-8 w-8 text-yellow-500' />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-gray-600'>Disputed</p>
                <p className='text-2xl font-bold'>{stats.disputed}</p>
              </div>
              <AlertTriangle className='h-8 w-8 text-red-500' />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-gray-600'>Total Value</p>
                <p className='text-lg font-bold'>{formatCurrency(stats.totalValue)}</p>
              </div>
              <DollarSign className='h-8 w-8 text-green-500' />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats */}
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-gray-600'>Released</p>
                <p className='text-2xl font-bold'>{stats.released}</p>
              </div>
              <CheckCircle className='h-8 w-8 text-green-500' />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-gray-600'>Refunded</p>
                <p className='text-2xl font-bold'>{stats.refunded}</p>
              </div>
              <RefreshCw className='h-8 w-8 text-purple-500' />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-gray-600'>Escrow Fees</p>
                <p className='text-lg font-bold'>{formatCurrency(stats.totalFees)}</p>
              </div>
              <Wallet className='h-8 w-8 text-indigo-500' />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-gray-600'>Avg Transaction</p>
                <p className='text-lg font-bold'>{formatCurrency(stats.avgTransactionValue)}</p>
              </div>
              <TrendingUp className='h-8 w-8 text-teal-500' />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Transaction List */}
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <CardTitle>Escrow Transactions</CardTitle>
            <div className='flex items-center gap-4'>
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400' />
                <input
                  type='search'
                  placeholder='Search transactions...'
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className='w-64 rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
                />
              </div>

              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className='rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
              >
                <option value='all'>All Status</option>
                <option value='pending'>Pending</option>
                <option value='held'>Held</option>
                <option value='disputed'>Disputed</option>
                <option value='released'>Released</option>
                <option value='refunded'>Refunded</option>
              </select>

              <select
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value)}
                className='rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
              >
                <option value='all'>All Types</option>
                <option value='purchase'>Purchase</option>
                <option value='service'>Service</option>
                <option value='rental'>Rental</option>
                <option value='subscription'>Subscription</option>
              </select>

              <select
                value={riskFilter}
                onChange={e => setRiskFilter(e.target.value)}
                className='rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
              >
                <option value='all'>All Risk Levels</option>
                <option value='low'>Low Risk</option>
                <option value='medium'>Medium Risk</option>
                <option value='high'>High Risk</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className='overflow-x-auto'>
            <table className='w-full text-sm'>
              <thead>
                <tr className='border-b'>
                  <th className='pb-3 text-left font-medium text-gray-600'>Transaction ID</th>
                  <th className='pb-3 text-left font-medium text-gray-600'>Buyer / Seller</th>
                  <th className='pb-3 text-left font-medium text-gray-600'>Product</th>
                  <th className='pb-3 text-left font-medium text-gray-600'>Amount</th>
                  <th className='pb-3 text-left font-medium text-gray-600'>Status</th>
                  <th className='pb-3 text-left font-medium text-gray-600'>Risk</th>
                  <th className='pb-3 text-left font-medium text-gray-600'>Created</th>
                  <th className='pb-3 text-left font-medium text-gray-600'>Actions</th>
                </tr>
              </thead>
              <tbody className='divide-y'>
                {filteredTransactions.map(transaction => {
                  const StatusIcon = getStatusIcon(transaction.status);
                  return (
                    <tr key={transaction.id} className='hover:bg-gray-50'>
                      <td className='py-4'>
                        <div className='flex items-center gap-2'>
                          <Shield className='h-4 w-4 text-blue-500' />
                          <span className='font-medium text-gray-900'>{transaction.id}</span>
                        </div>
                      </td>
                      <td className='py-4'>
                        <div className='space-y-1'>
                          <div className='flex items-center gap-2'>
                            <User className='h-3 w-3 text-gray-400' />
                            <span className='text-gray-900'>{transaction.buyerName}</span>
                          </div>
                          <div className='flex items-center gap-2'>
                            <Store className='h-3 w-3 text-gray-400' />
                            <span className='text-gray-600'>{transaction.sellerName}</span>
                          </div>
                        </div>
                      </td>
                      <td className='py-4'>
                        <div>
                          <p className='font-medium text-gray-900'>{transaction.productName}</p>
                          <p className='text-xs text-gray-500'>{transaction.category}</p>
                        </div>
                      </td>
                      <td className='py-4'>
                        <div>
                          <p className='font-medium text-gray-900'>
                            {formatCurrency(transaction.amount)}
                          </p>
                          <p className='text-xs text-gray-500'>
                            Fee: {formatCurrency(transaction.escrowFeeAmount)}
                          </p>
                        </div>
                      </td>
                      <td className='py-4'>
                        <div className='flex items-center gap-2'>
                          <StatusIcon className='h-4 w-4' />
                          <span
                            className={cn(
                              'px-2 py-1 text-xs rounded-full',
                              getStatusColor(transaction.status)
                            )}
                          >
                            {transaction.status}
                          </span>
                        </div>
                      </td>
                      <td className='py-4'>
                        <span
                          className={cn(
                            'px-2 py-1 text-xs rounded-full',
                            getRiskColor(transaction.riskLevel)
                          )}
                        >
                          {transaction.riskLevel}
                        </span>
                      </td>
                      <td className='py-4 text-gray-600'>
                        {format(transaction.createdAt, 'MMM dd, yyyy')}
                      </td>
                      <td className='py-4'>
                        <div className='flex items-center gap-2'>
                          <button
                            onClick={() => handleViewDetails(transaction)}
                            className='p-1 text-blue-600 hover:bg-blue-50 rounded'
                          >
                            <Eye className='h-4 w-4' />
                          </button>
                          {transaction.status === 'held' && (
                            <button
                              onClick={() => handleReleaseEscrow(transaction)}
                              className='p-1 text-green-600 hover:bg-green-50 rounded'
                            >
                              <Unlock className='h-4 w-4' />
                            </button>
                          )}
                          {(transaction.status === 'held' || transaction.status === 'disputed') && (
                            <button
                              onClick={() => handleRefundEscrow(transaction)}
                              className='p-1 text-purple-600 hover:bg-purple-50 rounded'
                            >
                              <RefreshCw className='h-4 w-4' />
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
        </CardContent>
      </Card>

      {/* Transaction Detail Modal */}
      {selectedTransaction && (
        <Modal
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          title={`Escrow Transaction - ${selectedTransaction.id}`}
          size='xl'
        >
          <ModalBody>
            <div className='space-y-6'>
              {/* Transaction Overview */}
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div>
                  <h4 className='font-medium text-gray-900 mb-3'>Transaction Details</h4>
                  <div className='space-y-2'>
                    <p>
                      <strong>Order ID:</strong> {selectedTransaction.orderId}
                    </p>
                    <p>
                      <strong>Amount:</strong> {formatCurrency(selectedTransaction.amount)}
                    </p>
                    <p>
                      <strong>Type:</strong> {selectedTransaction.type}
                    </p>
                    <p>
                      <strong>Status:</strong>
                      <span
                        className={cn(
                          'ml-2 px-2 py-1 text-xs rounded-full',
                          getStatusColor(selectedTransaction.status)
                        )}
                      >
                        {selectedTransaction.status}
                      </span>
                    </p>
                    <p>
                      <strong>Risk Level:</strong>
                      <span
                        className={cn(
                          'ml-2 px-2 py-1 text-xs rounded-full',
                          getRiskColor(selectedTransaction.riskLevel)
                        )}
                      >
                        {selectedTransaction.riskLevel}
                      </span>
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className='font-medium text-gray-900 mb-3'>Parties</h4>
                  <div className='space-y-2'>
                    <p>
                      <strong>Buyer:</strong> {selectedTransaction.buyerName}
                    </p>
                    <p>
                      <strong>Seller:</strong> {selectedTransaction.sellerName}
                    </p>
                    <p>
                      <strong>Escrow Agent:</strong> {selectedTransaction.escrowAgent}
                    </p>
                  </div>
                </div>
              </div>

              {/* Product Information */}
              <div>
                <h4 className='font-medium text-gray-900 mb-3'>Product Information</h4>
                <div className='bg-gray-50 p-4 rounded-lg'>
                  <p>
                    <strong>Product:</strong> {selectedTransaction.productName}
                  </p>
                  <p>
                    <strong>Category:</strong> {selectedTransaction.category}
                  </p>
                  <p>
                    <strong>Description:</strong> {selectedTransaction.description}
                  </p>
                  <p>
                    <strong>Terms:</strong> {selectedTransaction.terms}
                  </p>
                </div>
              </div>

              {/* Milestones */}
              <div>
                <h4 className='font-medium text-gray-900 mb-3'>Milestones</h4>
                <div className='space-y-3'>
                  {selectedTransaction.milestones.map((milestone, index) => (
                    <div
                      key={milestone.id}
                      className='flex items-start gap-3 p-3 bg-gray-50 rounded-lg'
                    >
                      <div
                        className={cn(
                          'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold',
                          milestone.isCompleted
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-300 text-gray-600'
                        )}
                      >
                        {index + 1}
                      </div>
                      <div className='flex-1'>
                        <p className='font-medium text-gray-900'>{milestone.title}</p>
                        <p className='text-sm text-gray-600'>{milestone.description}</p>
                        <p className='text-xs text-gray-500 mt-1'>
                          Due: {format(milestone.dueDate, 'MMM dd, yyyy')}
                          {milestone.completedDate && (
                            <span className='ml-2 text-green-600'>
                              (Completed: {format(milestone.completedDate, 'MMM dd, yyyy')})
                            </span>
                          )}
                        </p>
                      </div>
                      <div className='text-right'>
                        <p className='text-sm font-medium'>{formatCurrency(milestone.amount)}</p>
                        {milestone.isCompleted && (
                          <CheckCircle className='h-4 w-4 text-green-500 mt-1' />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                {selectedTransaction.buyerNotes && (
                  <div>
                    <h5 className='font-medium text-gray-900 mb-2'>Buyer Notes</h5>
                    <p className='text-sm text-gray-600 bg-blue-50 p-3 rounded-lg'>
                      {selectedTransaction.buyerNotes}
                    </p>
                  </div>
                )}
                {selectedTransaction.sellerNotes && (
                  <div>
                    <h5 className='font-medium text-gray-900 mb-2'>Seller Notes</h5>
                    <p className='text-sm text-gray-600 bg-purple-50 p-3 rounded-lg'>
                      {selectedTransaction.sellerNotes}
                    </p>
                  </div>
                )}
                {selectedTransaction.adminNotes && (
                  <div>
                    <h5 className='font-medium text-gray-900 mb-2'>Admin Notes</h5>
                    <p className='text-sm text-gray-600 bg-orange-50 p-3 rounded-lg'>
                      {selectedTransaction.adminNotes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <GlowingButton variant='secondary' onClick={() => setShowDetailModal(false)}>
              Close
            </GlowingButton>
            {selectedTransaction.status === 'held' && (
              <>
                <GlowingButton
                  variant='success'
                  onClick={() => {
                    setShowDetailModal(false);
                    handleReleaseEscrow(selectedTransaction);
                  }}
                >
                  Release Escrow
                </GlowingButton>
                <GlowingButton
                  variant='danger'
                  onClick={() => {
                    setShowDetailModal(false);
                    handleRefundEscrow(selectedTransaction);
                  }}
                >
                  Process Refund
                </GlowingButton>
              </>
            )}
          </ModalFooter>
        </Modal>
      )}

      {/* Release Escrow Modal */}
      <Modal
        isOpen={showReleaseModal}
        onClose={() => setShowReleaseModal(false)}
        title='Release Escrow'
        size='md'
      >
        <ModalBody>
          <div className='space-y-4'>
            <div className='bg-green-50 p-4 rounded-lg border border-green-200'>
              <div className='flex items-center gap-2 mb-2'>
                <CheckCircle className='h-5 w-5 text-green-600' />
                <span className='font-medium text-green-800'>Release Escrow Payment</span>
              </div>
              <p className='text-sm text-green-700'>
                You are about to release {formatCurrency(selectedTransaction?.amount || 0)} to the
                seller. This action cannot be undone.
              </p>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>Release Notes</label>
              <textarea
                value={actionNotes}
                onChange={e => setActionNotes(e.target.value)}
                rows={3}
                className='w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
                placeholder='Enter reason for releasing escrow...'
              />
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <GlowingButton variant='secondary' onClick={() => setShowReleaseModal(false)}>
            Cancel
          </GlowingButton>
          <GlowingButton variant='success' onClick={confirmReleaseEscrow}>
            Release Escrow
          </GlowingButton>
        </ModalFooter>
      </Modal>

      {/* Refund Escrow Modal */}
      <Modal
        isOpen={showRefundModal}
        onClose={() => setShowRefundModal(false)}
        title='Process Refund'
        size='md'
      >
        <ModalBody>
          <div className='space-y-4'>
            <div className='bg-red-50 p-4 rounded-lg border border-red-200'>
              <div className='flex items-center gap-2 mb-2'>
                <RefreshCw className='h-5 w-5 text-red-600' />
                <span className='font-medium text-red-800'>Process Refund</span>
              </div>
              <p className='text-sm text-red-700'>
                You are about to refund {formatCurrency(selectedTransaction?.amount || 0)} to the
                buyer. This action cannot be undone.
              </p>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>Refund Reason</label>
              <textarea
                value={actionNotes}
                onChange={e => setActionNotes(e.target.value)}
                rows={3}
                className='w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
                placeholder='Enter reason for refund...'
              />
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <GlowingButton variant='secondary' onClick={() => setShowRefundModal(false)}>
            Cancel
          </GlowingButton>
          <GlowingButton variant='danger' onClick={confirmRefundEscrow}>
            Process Refund
          </GlowingButton>
        </ModalFooter>
      </Modal>
    </div>
  );
}
