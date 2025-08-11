'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { GlowingButton } from '@/components/ui/AnimatedCard';
import { Modal, ModalBody, ModalFooter } from '@/components/ui/Modal';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatsCard } from '@/components/ui/StatsCard';
import {
  DollarSign,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Plus,
  TrendingUp,
  TrendingDown,
  Users,
  Package,
  Store,
  Settings,
  Calendar,
  Download,
  Upload,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  Percent,
  CreditCard,
  RefreshCw,
  User,
  Building,
  ShoppingCart,
  Wallet,
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils/cn';

interface CommissionRule {
  id: string;
  name: string;
  description: string;
  type: 'vendor' | 'category' | 'product' | 'global';
  rateType: 'percentage' | 'fixed' | 'tiered';
  rate: number;
  minAmount?: number;
  maxAmount?: number;
  isActive: boolean;
  priority: number;
  createdAt: Date;
  updatedAt: Date;

  // Conditions
  categoryIds?: string[];
  vendorIds?: string[];
  productIds?: string[];
  minimumOrderValue?: number;
  maximumOrderValue?: number;

  // Tiered rates
  tiers?: {
    minAmount: number;
    maxAmount: number;
    rate: number;
  }[];

  // Statistics
  totalTransactions: number;
  totalCommission: number;
  averageOrderValue: number;
}

interface CommissionTransaction {
  id: string;
  orderId: string;
  vendorId: string;
  vendorName: string;
  customerId: string;
  customerName: string;
  orderAmount: number;
  commissionRate: number;
  commissionAmount: number;
  ruleId: string;
  ruleName: string;
  status: 'pending' | 'paid' | 'disputed' | 'cancelled';
  createdAt: Date;
  paidAt?: Date;

  // Order details
  productName: string;
  productCategory: string;
  orderStatus: string;

  // Payment info
  paymentMethod: string;
  paymentStatus: string;

  // Metadata
  notes?: string;
  disputeReason?: string;
}

export default function CommissionsPage() {
  const [commissionRules, setCommissionRules] = useState<CommissionRule[]>([]);
  const [transactions, setTransactions] = useState<CommissionTransaction[]>([]);
  const [filteredRules, setFilteredRules] = useState<CommissionRule[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<CommissionTransaction[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [typeFilter, setTypeFilter] = useState<
    'all' | 'vendor' | 'category' | 'product' | 'global'
  >('all');
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [editingRule, setEditingRule] = useState<CommissionRule | null>(null);
  const [activeTab, setActiveTab] = useState<'rules' | 'transactions' | 'analytics'>('rules');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'vendor' as 'vendor' | 'category' | 'product' | 'global',
    rateType: 'percentage' as 'percentage' | 'fixed' | 'tiered',
    rate: 0,
    minAmount: 0,
    maxAmount: 0,
    isActive: true,
    priority: 1,
    minimumOrderValue: 0,
    maximumOrderValue: 0,
  });

  // Mock data generator
  const generateMockRules = (): CommissionRule[] => {
    const mockRules: CommissionRule[] = [
      {
        id: '1',
        name: 'Electronics Commission',
        description: 'Commission for all electronics products',
        type: 'category',
        rateType: 'percentage',
        rate: 5.0,
        isActive: true,
        priority: 1,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-20'),
        categoryIds: ['electronics'],
        totalTransactions: 1250,
        totalCommission: 2500000,
        averageOrderValue: 125000,
      },
      {
        id: '2',
        name: 'Fashion Vendor Premium',
        description: 'Higher commission for premium fashion vendors',
        type: 'vendor',
        rateType: 'percentage',
        rate: 7.5,
        isActive: true,
        priority: 2,
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-01-18'),
        vendorIds: ['fashion-hub', 'style-world'],
        minimumOrderValue: 50000,
        totalTransactions: 850,
        totalCommission: 1800000,
        averageOrderValue: 95000,
      },
      {
        id: '3',
        name: 'Global Base Commission',
        description: 'Default commission for all products',
        type: 'global',
        rateType: 'percentage',
        rate: 3.0,
        isActive: true,
        priority: 100,
        createdAt: new Date('2024-01-05'),
        updatedAt: new Date('2024-01-15'),
        totalTransactions: 5200,
        totalCommission: 4500000,
        averageOrderValue: 85000,
      },
      {
        id: '4',
        name: 'High-Value Orders',
        description: 'Special commission for orders above ₦500,000',
        type: 'global',
        rateType: 'tiered',
        rate: 0,
        isActive: true,
        priority: 1,
        createdAt: new Date('2024-01-08'),
        updatedAt: new Date('2024-01-22'),
        minimumOrderValue: 500000,
        tiers: [
          { minAmount: 500000, maxAmount: 1000000, rate: 4.0 },
          { minAmount: 1000000, maxAmount: 2000000, rate: 3.5 },
          { minAmount: 2000000, maxAmount: 999999999, rate: 3.0 },
        ],
        totalTransactions: 120,
        totalCommission: 850000,
        averageOrderValue: 750000,
      },
      {
        id: '5',
        name: 'New Vendor Incentive',
        description: 'Higher commission for new vendors first 30 days',
        type: 'vendor',
        rateType: 'percentage',
        rate: 10.0,
        isActive: false,
        priority: 1,
        createdAt: new Date('2024-01-12'),
        updatedAt: new Date('2024-01-25'),
        totalTransactions: 45,
        totalCommission: 180000,
        averageOrderValue: 60000,
      },
    ];

    return mockRules;
  };

  const generateMockTransactions = (): CommissionTransaction[] => {
    const mockTransactions: CommissionTransaction[] = [
      {
        id: '1',
        orderId: 'ORD-2024-001',
        vendorId: 'vendor-1',
        vendorName: 'TechStore Nigeria',
        customerId: 'customer-1',
        customerName: 'John Doe',
        orderAmount: 250000,
        commissionRate: 5.0,
        commissionAmount: 12500,
        ruleId: '1',
        ruleName: 'Electronics Commission',
        status: 'paid',
        createdAt: new Date('2024-01-20'),
        paidAt: new Date('2024-01-25'),
        productName: 'iPhone 15 Pro',
        productCategory: 'Electronics',
        orderStatus: 'delivered',
        paymentMethod: 'card',
        paymentStatus: 'completed',
      },
      {
        id: '2',
        orderId: 'ORD-2024-002',
        vendorId: 'vendor-2',
        vendorName: 'Fashion Hub Lagos',
        customerId: 'customer-2',
        customerName: 'Jane Smith',
        orderAmount: 75000,
        commissionRate: 7.5,
        commissionAmount: 5625,
        ruleId: '2',
        ruleName: 'Fashion Vendor Premium',
        status: 'pending',
        createdAt: new Date('2024-01-22'),
        productName: 'Designer Dress',
        productCategory: 'Fashion',
        orderStatus: 'processing',
        paymentMethod: 'card',
        paymentStatus: 'completed',
      },
      {
        id: '3',
        orderId: 'ORD-2024-003',
        vendorId: 'vendor-3',
        vendorName: 'HomeEssentials',
        customerId: 'customer-3',
        customerName: 'Mike Johnson',
        orderAmount: 180000,
        commissionRate: 3.0,
        commissionAmount: 5400,
        ruleId: '3',
        ruleName: 'Global Base Commission',
        status: 'paid',
        createdAt: new Date('2024-01-18'),
        paidAt: new Date('2024-01-23'),
        productName: 'Dining Table Set',
        productCategory: 'Home & Garden',
        orderStatus: 'delivered',
        paymentMethod: 'bank_transfer',
        paymentStatus: 'completed',
      },
      {
        id: '4',
        orderId: 'ORD-2024-004',
        vendorId: 'vendor-1',
        vendorName: 'TechStore Nigeria',
        customerId: 'customer-4',
        customerName: 'Sarah Wilson',
        orderAmount: 750000,
        commissionRate: 4.0,
        commissionAmount: 30000,
        ruleId: '4',
        ruleName: 'High-Value Orders',
        status: 'pending',
        createdAt: new Date('2024-01-24'),
        productName: 'MacBook Pro M3',
        productCategory: 'Electronics',
        orderStatus: 'processing',
        paymentMethod: 'card',
        paymentStatus: 'completed',
      },
      {
        id: '5',
        orderId: 'ORD-2024-005',
        vendorId: 'vendor-4',
        vendorName: 'SportZone',
        customerId: 'customer-5',
        customerName: 'David Brown',
        orderAmount: 125000,
        commissionRate: 3.0,
        commissionAmount: 3750,
        ruleId: '3',
        ruleName: 'Global Base Commission',
        status: 'disputed',
        createdAt: new Date('2024-01-19'),
        productName: 'Running Shoes',
        productCategory: 'Sports',
        orderStatus: 'returned',
        paymentMethod: 'card',
        paymentStatus: 'refunded',
        disputeReason: 'Product quality issue',
      },
    ];

    return mockTransactions;
  };

  useEffect(() => {
    const mockRules = generateMockRules();
    const mockTransactions = generateMockTransactions();
    setCommissionRules(mockRules);
    setTransactions(mockTransactions);
    setFilteredRules(mockRules);
    setFilteredTransactions(mockTransactions);
  }, []);

  useEffect(() => {
    let filtered = commissionRules;

    if (searchTerm) {
      filtered = filtered.filter(
        rule =>
          rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          rule.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(rule =>
        statusFilter === 'active' ? rule.isActive : !rule.isActive
      );
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(rule => rule.type === typeFilter);
    }

    setFilteredRules(filtered);
  }, [searchTerm, statusFilter, typeFilter, commissionRules]);

  const handleAddRule = () => {
    setEditingRule(null);
    setFormData({
      name: '',
      description: '',
      type: 'vendor',
      rateType: 'percentage',
      rate: 0,
      minAmount: 0,
      maxAmount: 0,
      isActive: true,
      priority: 1,
      minimumOrderValue: 0,
      maximumOrderValue: 0,
    });
    setShowRuleModal(true);
  };

  const handleEditRule = (rule: CommissionRule) => {
    setEditingRule(rule);
    setFormData({
      name: rule.name,
      description: rule.description,
      type: rule.type,
      rateType: rule.rateType,
      rate: rule.rate,
      minAmount: rule.minAmount || 0,
      maxAmount: rule.maxAmount || 0,
      isActive: rule.isActive,
      priority: rule.priority,
      minimumOrderValue: rule.minimumOrderValue || 0,
      maximumOrderValue: rule.maximumOrderValue || 0,
    });
    setShowRuleModal(true);
  };

  const handleSaveRule = () => {
    if (editingRule) {
      // Update existing rule
      setCommissionRules(prev =>
        prev.map(rule =>
          rule.id === editingRule.id ? { ...rule, ...formData, updatedAt: new Date() } : rule
        )
      );
    } else {
      // Add new rule
      const newRule: CommissionRule = {
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date(),
        updatedAt: new Date(),
        totalTransactions: 0,
        totalCommission: 0,
        averageOrderValue: 0,
      };
      setCommissionRules(prev => [...prev, newRule]);
    }
    setShowRuleModal(false);
  };

  const handleDeleteRule = (ruleId: string) => {
    if (confirm('Are you sure you want to delete this commission rule?')) {
      setCommissionRules(prev => prev.filter(rule => rule.id !== ruleId));
    }
  };

  const handleToggleRuleStatus = (ruleId: string) => {
    setCommissionRules(prev =>
      prev.map(rule =>
        rule.id === ruleId ? { ...rule, isActive: !rule.isActive, updatedAt: new Date() } : rule
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'disputed':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'vendor':
        return 'bg-blue-100 text-blue-800';
      case 'category':
        return 'bg-purple-100 text-purple-800';
      case 'product':
        return 'bg-green-100 text-green-800';
      case 'global':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const stats = {
    totalRules: commissionRules.length,
    activeRules: commissionRules.filter(r => r.isActive).length,
    totalTransactions: transactions.length,
    totalCommission: transactions.reduce((sum, t) => sum + t.commissionAmount, 0),
    pendingPayments: transactions.filter(t => t.status === 'pending').length,
    averageCommission:
      transactions.length > 0
        ? transactions.reduce((sum, t) => sum + t.commissionAmount, 0) / transactions.length
        : 0,
  };

  return (
    <div className='space-y-8'>
      {/* Header */}
      <PageHeader
        title='Commission Management'
        description='Manage commission rules and track payments'
        icon={DollarSign}
        actions={[
          {
            label: 'Export',
            icon: Download,
            variant: 'secondary',
          },
          {
            label: 'Add Rule',
            icon: Plus,
            variant: 'primary',
            onClick: handleAddRule,
          },
        ]}
      />

      {/* Stats Cards */}
      <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-6'>
        <StatsCard
          title='Total Rules'
          value={stats.totalRules}
          icon={Settings}
          gradient='from-blue-500 to-purple-600'
          delay={0}
        />
        <StatsCard
          title='Active Rules'
          value={stats.activeRules}
          icon={CheckCircle}
          gradient='from-green-500 to-emerald-600'
          delay={100}
        />
        <StatsCard
          title='Transactions'
          value={stats.totalTransactions}
          icon={ShoppingCart}
          gradient='from-purple-500 to-pink-600'
          delay={200}
        />
        <StatsCard
          title='Total Commission'
          value={stats.totalCommission}
          icon={DollarSign}
          gradient='from-green-500 to-emerald-600'
          format='currency'
          delay={300}
        />
        <StatsCard
          title='Pending Payments'
          value={stats.pendingPayments}
          icon={Clock}
          gradient='from-orange-500 to-red-600'
          delay={400}
        />
        <StatsCard
          title='Avg Commission'
          value={stats.averageCommission}
          icon={BarChart3}
          gradient='from-indigo-500 to-purple-600'
          format='currency'
          delay={500}
        />
      </div>

      {/* Tabs */}
      <div className='border-b border-gray-200'>
        <nav className='flex space-x-8'>
          {['rules', 'transactions', 'analytics'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={cn(
                'py-2 px-1 border-b-2 font-medium text-sm capitalize transition-colors',
                activeTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              )}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'rules' && (
        <Card>
          <CardHeader>
            <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
              <CardTitle>Commission Rules</CardTitle>
              <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4'>
                <div className='relative'>
                  <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400' />
                  <input
                    type='search'
                    placeholder='Search rules...'
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className='w-full sm:w-64 rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value as any)}
                  className='rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
                >
                  <option value='all'>All Status</option>
                  <option value='active'>Active</option>
                  <option value='inactive'>Inactive</option>
                </select>

                <select
                  value={typeFilter}
                  onChange={e => setTypeFilter(e.target.value as any)}
                  className='rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
                >
                  <option value='all'>All Types</option>
                  <option value='vendor'>Vendor</option>
                  <option value='category'>Category</option>
                  <option value='product'>Product</option>
                  <option value='global'>Global</option>
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className='overflow-x-auto'>
              <table className='w-full text-sm'>
                <thead>
                  <tr className='border-b'>
                    <th className='pb-3 text-left font-medium text-gray-600'>Rule</th>
                    <th className='pb-3 text-left font-medium text-gray-600'>Type</th>
                    <th className='pb-3 text-left font-medium text-gray-600'>Rate</th>
                    <th className='pb-3 text-left font-medium text-gray-600'>Transactions</th>
                    <th className='pb-3 text-left font-medium text-gray-600'>Commission</th>
                    <th className='pb-3 text-left font-medium text-gray-600'>Status</th>
                    <th className='pb-3 text-left font-medium text-gray-600'>Actions</th>
                  </tr>
                </thead>
                <tbody className='divide-y'>
                  {filteredRules.map(rule => (
                    <tr key={rule.id} className='hover:bg-gray-50'>
                      <td className='py-4'>
                        <div>
                          <p className='font-medium text-gray-900'>{rule.name}</p>
                          <p className='text-xs text-gray-500'>{rule.description}</p>
                        </div>
                      </td>
                      <td className='py-4'>
                        <span
                          className={cn(
                            'px-2 py-1 text-xs rounded-full capitalize',
                            getTypeColor(rule.type)
                          )}
                        >
                          {rule.type}
                        </span>
                      </td>
                      <td className='py-4 text-gray-600'>
                        {rule.rateType === 'percentage'
                          ? `${rule.rate}%`
                          : formatCurrency(rule.rate)}
                      </td>
                      <td className='py-4 text-gray-600'>{rule.totalTransactions}</td>
                      <td className='py-4 text-gray-600'>{formatCurrency(rule.totalCommission)}</td>
                      <td className='py-4'>
                        <span
                          className={cn(
                            'px-2 py-1 text-xs rounded-full',
                            rule.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          )}
                        >
                          {rule.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className='py-4'>
                        <div className='flex items-center gap-2'>
                          <button
                            onClick={() => handleEditRule(rule)}
                            className='p-1 text-blue-600 hover:bg-blue-50 rounded'
                          >
                            <Edit className='h-4 w-4' />
                          </button>
                          <button
                            onClick={() => handleToggleRuleStatus(rule.id)}
                            className={cn(
                              'p-1 rounded',
                              rule.isActive
                                ? 'text-red-600 hover:bg-red-50'
                                : 'text-green-600 hover:bg-green-50'
                            )}
                          >
                            {rule.isActive ? (
                              <AlertTriangle className='h-4 w-4' />
                            ) : (
                              <CheckCircle className='h-4 w-4' />
                            )}
                          </button>
                          <button
                            onClick={() => handleDeleteRule(rule.id)}
                            className='p-1 text-red-600 hover:bg-red-50 rounded'
                          >
                            <Trash2 className='h-4 w-4' />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'transactions' && (
        <Card>
          <CardHeader>
            <CardTitle>Commission Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='overflow-x-auto'>
              <table className='w-full text-sm'>
                <thead>
                  <tr className='border-b'>
                    <th className='pb-3 text-left font-medium text-gray-600'>Order</th>
                    <th className='pb-3 text-left font-medium text-gray-600'>Vendor</th>
                    <th className='pb-3 text-left font-medium text-gray-600'>Product</th>
                    <th className='pb-3 text-left font-medium text-gray-600'>Order Amount</th>
                    <th className='pb-3 text-left font-medium text-gray-600'>Commission</th>
                    <th className='pb-3 text-left font-medium text-gray-600'>Status</th>
                    <th className='pb-3 text-left font-medium text-gray-600'>Date</th>
                    <th className='pb-3 text-left font-medium text-gray-600'>Actions</th>
                  </tr>
                </thead>
                <tbody className='divide-y'>
                  {filteredTransactions.map(transaction => (
                    <tr key={transaction.id} className='hover:bg-gray-50'>
                      <td className='py-4'>
                        <div>
                          <p className='font-medium text-gray-900'>{transaction.orderId}</p>
                          <p className='text-xs text-gray-500'>{transaction.ruleName}</p>
                        </div>
                      </td>
                      <td className='py-4'>
                        <div>
                          <p className='font-medium text-gray-900'>{transaction.vendorName}</p>
                          <p className='text-xs text-gray-500'>{transaction.customerName}</p>
                        </div>
                      </td>
                      <td className='py-4'>
                        <div>
                          <p className='font-medium text-gray-900'>{transaction.productName}</p>
                          <p className='text-xs text-gray-500'>{transaction.productCategory}</p>
                        </div>
                      </td>
                      <td className='py-4 text-gray-600'>
                        {formatCurrency(transaction.orderAmount)}
                      </td>
                      <td className='py-4'>
                        <div>
                          <p className='font-medium text-gray-900'>
                            {formatCurrency(transaction.commissionAmount)}
                          </p>
                          <p className='text-xs text-gray-500'>{transaction.commissionRate}%</p>
                        </div>
                      </td>
                      <td className='py-4'>
                        <span
                          className={cn(
                            'px-2 py-1 text-xs rounded-full',
                            getStatusColor(transaction.status)
                          )}
                        >
                          {transaction.status}
                        </span>
                      </td>
                      <td className='py-4 text-gray-600'>
                        {format(transaction.createdAt, 'MMM dd, yyyy')}
                      </td>
                      <td className='py-4'>
                        <div className='flex items-center gap-2'>
                          <button className='p-1 text-blue-600 hover:bg-blue-50 rounded'>
                            <Eye className='h-4 w-4' />
                          </button>
                          {transaction.status === 'pending' && (
                            <button className='p-1 text-green-600 hover:bg-green-50 rounded'>
                              <CheckCircle className='h-4 w-4' />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'analytics' && (
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <Card>
            <CardHeader>
              <CardTitle>Commission Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                <div className='flex justify-between items-center'>
                  <span className='text-sm text-gray-600'>Total Commission Earned</span>
                  <span className='font-bold text-lg'>{formatCurrency(stats.totalCommission)}</span>
                </div>
                <div className='flex justify-between items-center'>
                  <span className='text-sm text-gray-600'>Average Commission per Transaction</span>
                  <span className='font-medium'>{formatCurrency(stats.averageCommission)}</span>
                </div>
                <div className='flex justify-between items-center'>
                  <span className='text-sm text-gray-600'>Total Transactions</span>
                  <span className='font-medium'>{stats.totalTransactions}</span>
                </div>
                <div className='flex justify-between items-center'>
                  <span className='text-sm text-gray-600'>Active Rules</span>
                  <span className='font-medium'>{stats.activeRules}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                <div className='flex justify-between items-center'>
                  <span className='text-sm text-gray-600'>Pending Payments</span>
                  <span className='font-bold text-orange-600'>{stats.pendingPayments}</span>
                </div>
                <div className='flex justify-between items-center'>
                  <span className='text-sm text-gray-600'>Disputed Transactions</span>
                  <span className='font-medium text-red-600'>
                    {transactions.filter(t => t.status === 'disputed').length}
                  </span>
                </div>
                <div className='flex justify-between items-center'>
                  <span className='text-sm text-gray-600'>Completed Payments</span>
                  <span className='font-medium text-green-600'>
                    {transactions.filter(t => t.status === 'paid').length}
                  </span>
                </div>
                <div className='flex justify-between items-center'>
                  <span className='text-sm text-gray-600'>Success Rate</span>
                  <span className='font-medium'>
                    {(
                      (transactions.filter(t => t.status === 'paid').length / transactions.length) *
                      100
                    ).toFixed(1)}
                    %
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Commission Rule Modal */}
      <Modal
        isOpen={showRuleModal}
        onClose={() => setShowRuleModal(false)}
        title={editingRule ? 'Edit Commission Rule' : 'Add New Commission Rule'}
        size='lg'
      >
        <ModalBody>
          <div className='space-y-6'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Rule Name *</label>
                <input
                  type='text'
                  value={formData.name}
                  onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className='w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
                  placeholder='Enter rule name'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Type *</label>
                <select
                  value={formData.type}
                  onChange={e => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                  className='w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
                >
                  <option value='vendor'>Vendor</option>
                  <option value='category'>Category</option>
                  <option value='product'>Product</option>
                  <option value='global'>Global</option>
                </select>
              </div>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>Description</label>
              <textarea
                value={formData.description}
                onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className='w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
                placeholder='Enter rule description'
              />
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Rate Type *</label>
                <select
                  value={formData.rateType}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, rateType: e.target.value as any }))
                  }
                  className='w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
                >
                  <option value='percentage'>Percentage</option>
                  <option value='fixed'>Fixed Amount</option>
                  <option value='tiered'>Tiered</option>
                </select>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Rate *</label>
                <input
                  type='number'
                  value={formData.rate}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, rate: parseFloat(e.target.value) }))
                  }
                  className='w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
                  placeholder='0.00'
                  step='0.01'
                />
              </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Minimum Order Value
                </label>
                <input
                  type='number'
                  value={formData.minimumOrderValue}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      minimumOrderValue: parseFloat(e.target.value),
                    }))
                  }
                  className='w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
                  placeholder='0'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Priority</label>
                <input
                  type='number'
                  value={formData.priority}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, priority: parseInt(e.target.value) }))
                  }
                  className='w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
                  placeholder='1'
                />
              </div>
            </div>

            <div className='flex items-center gap-2'>
              <input
                type='checkbox'
                id='isActive'
                checked={formData.isActive}
                onChange={e => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
              />
              <label htmlFor='isActive' className='text-sm text-gray-700'>
                Active
              </label>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <GlowingButton variant='secondary' onClick={() => setShowRuleModal(false)}>
            Cancel
          </GlowingButton>
          <GlowingButton variant='primary' onClick={handleSaveRule}>
            {editingRule ? 'Update Rule' : 'Create Rule'}
          </GlowingButton>
        </ModalFooter>
      </Modal>
    </div>
  );
}
