'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Eye,
  FileText,
  MessageSquare,
  TrendingUp,
  Users,
  DollarSign,
  Filter,
  Search,
  Calendar,
  MoreHorizontal,
  Download,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Package,
  Building2,
  User,
  Timer,
  History,
  Settings,
  ExternalLink,
  AlertCircle as AlertIcon,
  Info,
  Zap,
  Lock,
  Unlock,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Cell,
} from 'recharts';
import { toast } from 'sonner';

interface EscrowTransaction {
  id: string;
  orderId: string;
  transactionId: string;
  amount: number;
  currency: string;
  status: 'held' | 'released' | 'disputed' | 'cancelled' | 'refunded' | 'expired';
  holdPeriodDays: number;
  holdUntil: string;
  createdAt: string;
  releasedAt?: string;
  disputedAt?: string;
  vendor: {
    id: string;
    businessName: string;
    avatar?: string;
  };
  customer: {
    id: string;
    name: string;
    avatar?: string;
  };
  releaseConditions: string[];
  releaseReason?: string;
  disputeReason?: string;
  releasedBy?: string;
  disputedBy?: string;
  priority: 'high' | 'medium' | 'low';
}

interface EscrowStats {
  totalEscrows: number;
  activeEscrows: number;
  totalValue: number;
  activeValue: number;
  disputedEscrows: number;
  disputeRate: number;
  avgHoldPeriod: number;
  autoReleaseRate: number;
}

const mockStats: EscrowStats = {
  totalEscrows: 1248,
  activeEscrows: 156,
  totalValue: 45750000,
  activeValue: 8920000,
  disputedEscrows: 12,
  disputeRate: 2.1,
  avgHoldPeriod: 2.8,
  autoReleaseRate: 87.5,
};

const mockEscrows: EscrowTransaction[] = [
  {
    id: 'esc_001',
    orderId: 'ORD_12345',
    transactionId: 'txn_001',
    amount: 250000,
    currency: 'NGN',
    status: 'held',
    holdPeriodDays: 3,
    holdUntil: '2024-01-18T14:30:00Z',
    createdAt: '2024-01-15T14:30:00Z',
    vendor: {
      id: 'vendor_001',
      businessName: 'TechHub Lagos',
      avatar: '/placeholder-avatar.jpg',
    },
    customer: {
      id: 'customer_001',
      name: 'John Doe',
      avatar: '/placeholder-avatar.jpg',
    },
    releaseConditions: ['order_delivered', 'customer_confirmed', 'auto_release_timer'],
    priority: 'medium',
  },
  {
    id: 'esc_002',
    orderId: 'ORD_12346',
    transactionId: 'txn_002',
    amount: 180000,
    currency: 'NGN',
    status: 'disputed',
    holdPeriodDays: 3,
    holdUntil: '2024-01-18T12:15:00Z',
    createdAt: '2024-01-15T12:15:00Z',
    disputedAt: '2024-01-17T10:30:00Z',
    vendor: {
      id: 'vendor_002',
      businessName: 'Apple Store Nigeria',
      avatar: '/placeholder-avatar.jpg',
    },
    customer: {
      id: 'customer_002',
      name: 'Jane Smith',
      avatar: '/placeholder-avatar.jpg',
    },
    releaseConditions: ['order_delivered', 'customer_confirmed'],
    disputeReason: 'Product not as described',
    disputedBy: 'customer',
    priority: 'high',
  },
  {
    id: 'esc_003',
    orderId: 'ORD_12347',
    transactionId: 'txn_003',
    amount: 450000,
    currency: 'NGN',
    status: 'released',
    holdPeriodDays: 3,
    holdUntil: '2024-01-17T09:00:00Z',
    createdAt: '2024-01-14T09:00:00Z',
    releasedAt: '2024-01-16T15:45:00Z',
    vendor: {
      id: 'vendor_003',
      businessName: 'Fashion Central',
      avatar: '/placeholder-avatar.jpg',
    },
    customer: {
      id: 'customer_003',
      name: 'Mike Johnson',
      avatar: '/placeholder-avatar.jpg',
    },
    releaseConditions: ['order_delivered', 'customer_confirmed'],
    releaseReason: 'Customer confirmed delivery',
    releasedBy: 'customer',
    priority: 'low',
  },
];

const escrowTrendsData = [
  { month: 'Jul', total: 890000, active: 245000, disputes: 18000 },
  { month: 'Aug', total: 1200000, active: 310000, disputes: 24000 },
  { month: 'Sep', total: 980000, active: 290000, disputes: 15000 },
  { month: 'Oct', total: 1450000, active: 380000, disputes: 32000 },
  { month: 'Nov', total: 1650000, active: 420000, disputes: 28000 },
  { month: 'Dec', total: 1820000, active: 485000, disputes: 35000 },
  { month: 'Jan', total: 2100000, active: 560000, disputes: 42000 },
];

const statusDistribution = [
  { name: 'Held', value: 65, count: 156, color: '#3b82f6' },
  { name: 'Released', value: 28, count: 67, color: '#10b981' },
  { name: 'Disputed', value: 5, count: 12, color: '#f59e0b' },
  { name: 'Cancelled', value: 2, count: 5, color: '#ef4444' },
];

export function EscrowManagementDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState('30');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedEscrow, setSelectedEscrow] = useState<EscrowTransaction | null>(null);

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'held':
        return 'bg-blue-100 text-blue-800';
      case 'released':
        return 'bg-green-100 text-green-800';
      case 'disputed':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-purple-100 text-purple-800';
      case 'expired':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'held':
        return <Clock className='h-4 w-4' />;
      case 'released':
        return <CheckCircle className='h-4 w-4' />;
      case 'disputed':
        return <AlertTriangle className='h-4 w-4' />;
      case 'cancelled':
        return <XCircle className='h-4 w-4' />;
      case 'refunded':
        return <ArrowDownRight className='h-4 w-4' />;
      case 'expired':
        return <Timer className='h-4 w-4' />;
      default:
        return <Shield className='h-4 w-4' />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const getTimeRemaining = (holdUntil: string) => {
    const remaining = new Date(holdUntil).getTime() - new Date().getTime();
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (remaining <= 0) return 'Expired';
    if (days > 0) return `${days}d ${hours % 24}h`;
    return `${hours}h`;
  };

  const handleEscrowAction = (action: string, escrowId: string) => {
    switch (action) {
      case 'release':
        toast.success(`Escrow ${escrowId} released successfully`);
        break;
      case 'dispute':
        toast.info(`Dispute raised for escrow ${escrowId}`);
        break;
      case 'cancel':
        toast.warning(`Escrow ${escrowId} cancelled`);
        break;
      default:
        break;
    }
  };

  const filteredEscrows = mockEscrows.filter(escrow => {
    const matchesStatus = filterStatus === 'all' || escrow.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || escrow.priority === filterPriority;
    const matchesSearch =
      searchQuery === '' ||
      escrow.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      escrow.transactionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      escrow.vendor.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      escrow.customer.name.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesPriority && matchesSearch;
  });

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold'>Escrow Management</h1>
          <p className='text-muted-foreground'>
            Monitor and manage escrow transactions across the platform
          </p>
        </div>
        <div className='flex items-center gap-3'>
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className='w-32'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='7'>Last 7 days</SelectItem>
              <SelectItem value='30'>Last 30 days</SelectItem>
              <SelectItem value='90'>Last 3 months</SelectItem>
              <SelectItem value='365'>Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant='outline' size='sm'>
            <Download className='h-4 w-4 mr-2' />
            Export
          </Button>
          <Button variant='outline' size='sm'>
            <RefreshCw className='h-4 w-4 mr-2' />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-muted-foreground'>Active Escrows</p>
                <p className='text-2xl font-bold'>{mockStats.activeEscrows}</p>
                <p className='text-xs text-blue-600'>
                  {formatPrice(mockStats.activeValue)} total value
                </p>
              </div>
              <div className='p-3 rounded-full bg-blue-100'>
                <Shield className='h-5 w-5 text-blue-600' />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-muted-foreground'>Total Value</p>
                <p className='text-2xl font-bold'>{formatPrice(mockStats.totalValue)}</p>
                <p className='text-xs text-green-600'>+12.5% vs last month</p>
              </div>
              <div className='p-3 rounded-full bg-green-100'>
                <DollarSign className='h-5 w-5 text-green-600' />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-muted-foreground'>Dispute Rate</p>
                <p className='text-2xl font-bold'>{mockStats.disputeRate}%</p>
                <p className='text-xs text-red-600'>{mockStats.disputedEscrows} active disputes</p>
              </div>
              <div className='p-3 rounded-full bg-yellow-100'>
                <AlertTriangle className='h-5 w-5 text-yellow-600' />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-muted-foreground'>Auto-Release Rate</p>
                <p className='text-2xl font-bold'>{mockStats.autoReleaseRate}%</p>
                <p className='text-xs text-green-600'>Avg {mockStats.avgHoldPeriod}d hold</p>
              </div>
              <div className='p-3 rounded-full bg-purple-100'>
                <Zap className='h-5 w-5 text-purple-600' />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className='space-y-6'>
        <TabsList className='grid w-full grid-cols-4'>
          <TabsTrigger value='overview'>Overview</TabsTrigger>
          <TabsTrigger value='escrows'>All Escrows</TabsTrigger>
          <TabsTrigger value='disputes'>Disputes</TabsTrigger>
          <TabsTrigger value='analytics'>Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value='overview' className='space-y-6'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {/* Escrow Trends */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <TrendingUp className='h-5 w-5' />
                  Escrow Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width='100%' height={300}>
                  <AreaChart data={escrowTrendsData}>
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis dataKey='month' />
                    <YAxis tickFormatter={value => `₦${(value / 1000000).toFixed(1)}M`} />
                    <Tooltip
                      formatter={(value: any, name: string) => [
                        formatPrice(value),
                        name === 'total'
                          ? 'Total Value'
                          : name === 'active'
                            ? 'Active Value'
                            : 'Disputes',
                      ]}
                      labelFormatter={label => `Month: ${label}`}
                    />
                    <Area
                      type='monotone'
                      dataKey='total'
                      stackId='1'
                      stroke='#3b82f6'
                      fill='#3b82f6'
                      fillOpacity={0.3}
                    />
                    <Area
                      type='monotone'
                      dataKey='active'
                      stackId='2'
                      stroke='#10b981'
                      fill='#10b981'
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Shield className='h-5 w-5' />
                  Escrow Status Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  {statusDistribution.map((status, index) => (
                    <div key={index} className='flex items-center justify-between'>
                      <div className='flex items-center gap-3'>
                        <div
                          className='w-4 h-4 rounded-full'
                          style={{ backgroundColor: status.color }}
                        />
                        <span className='text-sm font-medium'>{status.name}</span>
                      </div>
                      <div className='text-right'>
                        <p className='text-sm font-semibold'>{status.count}</p>
                        <p className='text-xs text-muted-foreground'>{status.value}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <History className='h-5 w-5' />
                Recent Escrow Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {mockEscrows.slice(0, 5).map(escrow => (
                  <div
                    key={escrow.id}
                    className='flex items-center justify-between p-3 border rounded-lg'
                  >
                    <div className='flex items-center gap-3'>
                      <div className='p-2 rounded-full bg-muted'>
                        {getStatusIcon(escrow.status)}
                      </div>
                      <div>
                        <p className='font-medium'>Order {escrow.orderId}</p>
                        <p className='text-sm text-muted-foreground'>
                          {escrow.vendor.businessName} • {formatPrice(escrow.amount)}
                        </p>
                      </div>
                    </div>
                    <div className='text-right'>
                      <Badge className={getStatusColor(escrow.status)}>{escrow.status}</Badge>
                      <p className='text-xs text-muted-foreground mt-1'>
                        {escrow.status === 'held'
                          ? getTimeRemaining(escrow.holdUntil)
                          : new Date(escrow.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='escrows' className='space-y-6'>
          {/* Filters */}
          <Card>
            <CardContent className='p-6'>
              <div className='flex flex-col md:flex-row gap-4'>
                <div className='flex-1'>
                  <div className='relative'>
                    <Search className='absolute left-3 top-2.5 h-4 w-4 text-muted-foreground' />
                    <Input
                      placeholder='Search by order ID, transaction ID, vendor, or customer...'
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className='pl-9'
                    />
                  </div>
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className='w-48'>
                    <SelectValue placeholder='Filter by status' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>All Status</SelectItem>
                    <SelectItem value='held'>Held</SelectItem>
                    <SelectItem value='released'>Released</SelectItem>
                    <SelectItem value='disputed'>Disputed</SelectItem>
                    <SelectItem value='cancelled'>Cancelled</SelectItem>
                    <SelectItem value='expired'>Expired</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterPriority} onValueChange={setFilterPriority}>
                  <SelectTrigger className='w-48'>
                    <SelectValue placeholder='Filter by priority' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>All Priority</SelectItem>
                    <SelectItem value='high'>High</SelectItem>
                    <SelectItem value='medium'>Medium</SelectItem>
                    <SelectItem value='low'>Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Escrows Table */}
          <Card>
            <CardHeader>
              <CardTitle>Escrow Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order/Transaction</TableHead>
                    <TableHead>Parties</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Hold Period</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEscrows.map(escrow => (
                    <TableRow key={escrow.id}>
                      <TableCell>
                        <div>
                          <p className='font-medium'>{escrow.orderId}</p>
                          <p className='text-xs text-muted-foreground font-mono'>
                            {escrow.transactionId}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className='space-y-1'>
                          <div className='flex items-center gap-2'>
                            <Building2 className='h-3 w-3 text-muted-foreground' />
                            <span className='text-sm'>{escrow.vendor.businessName}</span>
                          </div>
                          <div className='flex items-center gap-2'>
                            <User className='h-3 w-3 text-muted-foreground' />
                            <span className='text-sm'>{escrow.customer.name}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className='font-semibold'>{formatPrice(escrow.amount)}</p>
                        <p className='text-xs text-muted-foreground'>{escrow.currency}</p>
                      </TableCell>
                      <TableCell>
                        <div className='space-y-1'>
                          <Badge className={getStatusColor(escrow.status)}>{escrow.status}</Badge>
                          {escrow.status === 'held' && (
                            <p className='text-xs text-blue-600'>
                              {getTimeRemaining(escrow.holdUntil)} remaining
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className='text-sm'>{escrow.holdPeriodDays} days</p>
                          {escrow.status === 'held' && (
                            <Progress
                              value={
                                ((new Date().getTime() - new Date(escrow.createdAt).getTime()) /
                                  (new Date(escrow.holdUntil).getTime() -
                                    new Date(escrow.createdAt).getTime())) *
                                100
                              }
                              className='h-1 mt-1'
                            />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className='text-sm'>{new Date(escrow.createdAt).toLocaleDateString()}</p>
                        <p className='text-xs text-muted-foreground'>
                          {new Date(escrow.createdAt).toLocaleTimeString()}
                        </p>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant='ghost' size='sm'>
                              <MoreHorizontal className='h-4 w-4' />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => setSelectedEscrow(escrow)}>
                              <Eye className='h-4 w-4 mr-2' />
                              View Details
                            </DropdownMenuItem>
                            {escrow.status === 'held' && (
                              <>
                                <DropdownMenuItem
                                  onClick={() => handleEscrowAction('release', escrow.id)}
                                >
                                  <Unlock className='h-4 w-4 mr-2' />
                                  Release Escrow
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleEscrowAction('dispute', escrow.id)}
                                >
                                  <AlertTriangle className='h-4 w-4 mr-2' />
                                  Raise Dispute
                                </DropdownMenuItem>
                              </>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <ExternalLink className='h-4 w-4 mr-2' />
                              View Order
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='disputes' className='space-y-6'>
          {/* Dispute Stats */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            <Card>
              <CardContent className='p-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm font-medium text-muted-foreground'>Active Disputes</p>
                    <p className='text-2xl font-bold'>{mockStats.disputedEscrows}</p>
                  </div>
                  <AlertTriangle className='h-8 w-8 text-yellow-600' />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className='p-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm font-medium text-muted-foreground'>Dispute Rate</p>
                    <p className='text-2xl font-bold'>{mockStats.disputeRate}%</p>
                  </div>
                  <TrendingDown className='h-8 w-8 text-green-600' />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className='p-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm font-medium text-muted-foreground'>Avg Resolution</p>
                    <p className='text-2xl font-bold'>2.3d</p>
                  </div>
                  <Timer className='h-8 w-8 text-blue-600' />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Disputed Escrows */}
          <Card>
            <CardHeader>
              <CardTitle>Disputed Escrows</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {mockEscrows
                  .filter(escrow => escrow.status === 'disputed')
                  .map(escrow => (
                    <div
                      key={escrow.id}
                      className='p-4 border rounded-lg border-yellow-200 bg-yellow-50'
                    >
                      <div className='flex items-start justify-between'>
                        <div className='flex-1'>
                          <div className='flex items-center gap-2 mb-2'>
                            <AlertTriangle className='h-5 w-5 text-yellow-600' />
                            <h4 className='font-semibold'>Order {escrow.orderId}</h4>
                            <Badge className='bg-red-100 text-red-800'>
                              {getPriorityColor(escrow.priority)} Priority
                            </Badge>
                          </div>
                          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                            <div>
                              <p className='text-sm font-medium'>
                                Amount: {formatPrice(escrow.amount)}
                              </p>
                              <p className='text-sm text-muted-foreground'>
                                Vendor: {escrow.vendor.businessName}
                              </p>
                              <p className='text-sm text-muted-foreground'>
                                Customer: {escrow.customer.name}
                              </p>
                            </div>
                            <div>
                              <p className='text-sm font-medium'>Dispute Reason:</p>
                              <p className='text-sm text-muted-foreground'>
                                {escrow.disputeReason}
                              </p>
                              <p className='text-sm text-muted-foreground'>
                                Disputed by: {escrow.disputedBy}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className='flex gap-2'>
                          <Button size='sm' variant='outline'>
                            <MessageSquare className='h-4 w-4 mr-2' />
                            Contact Parties
                          </Button>
                          <Button size='sm'>
                            <CheckCircle className='h-4 w-4 mr-2' />
                            Resolve
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='analytics' className='space-y-6'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {/* Volume Analytics */}
            <Card>
              <CardHeader>
                <CardTitle>Escrow Volume Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width='100%' height={400}>
                  <BarChart data={escrowTrendsData}>
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis dataKey='month' />
                    <YAxis tickFormatter={value => `₦${(value / 1000000).toFixed(1)}M`} />
                    <Tooltip
                      formatter={(value: any) => [formatPrice(value), 'Total Value']}
                      labelFormatter={label => `Month: ${label}`}
                    />
                    <Bar dataKey='total' fill='#3b82f6' radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent className='space-y-6'>
                <div>
                  <div className='flex justify-between text-sm mb-2'>
                    <span>Auto-Release Rate</span>
                    <span>{mockStats.autoReleaseRate}%</span>
                  </div>
                  <Progress value={mockStats.autoReleaseRate} className='h-2' />
                </div>

                <div>
                  <div className='flex justify-between text-sm mb-2'>
                    <span>Customer Satisfaction</span>
                    <span>94.2%</span>
                  </div>
                  <Progress value={94.2} className='h-2' />
                </div>

                <div>
                  <div className='flex justify-between text-sm mb-2'>
                    <span>Vendor Satisfaction</span>
                    <span>91.8%</span>
                  </div>
                  <Progress value={91.8} className='h-2' />
                </div>

                <Separator />

                <div className='space-y-3'>
                  <div className='flex justify-between'>
                    <span className='text-sm text-muted-foreground'>Average Hold Period</span>
                    <span className='text-sm font-medium'>{mockStats.avgHoldPeriod} days</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-sm text-muted-foreground'>Dispute Resolution Time</span>
                    <span className='text-sm font-medium'>2.3 days</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-sm text-muted-foreground'>Success Rate</span>
                    <span className='text-sm font-medium'>97.9%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Escrow Details Dialog */}
      <Dialog open={!!selectedEscrow} onOpenChange={() => setSelectedEscrow(null)}>
        <DialogContent className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle>Escrow Details</DialogTitle>
          </DialogHeader>
          {selectedEscrow && (
            <div className='space-y-6'>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label className='text-sm font-medium'>Order ID</label>
                  <p className='text-sm text-muted-foreground'>{selectedEscrow.orderId}</p>
                </div>
                <div>
                  <label className='text-sm font-medium'>Transaction ID</label>
                  <p className='text-sm text-muted-foreground font-mono'>
                    {selectedEscrow.transactionId}
                  </p>
                </div>
                <div>
                  <label className='text-sm font-medium'>Amount</label>
                  <p className='text-sm font-semibold'>{formatPrice(selectedEscrow.amount)}</p>
                </div>
                <div>
                  <label className='text-sm font-medium'>Status</label>
                  <Badge className={getStatusColor(selectedEscrow.status)}>
                    {selectedEscrow.status}
                  </Badge>
                </div>
              </div>

              <Separator />

              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label className='text-sm font-medium'>Vendor</label>
                  <p className='text-sm text-muted-foreground'>
                    {selectedEscrow.vendor.businessName}
                  </p>
                </div>
                <div>
                  <label className='text-sm font-medium'>Customer</label>
                  <p className='text-sm text-muted-foreground'>{selectedEscrow.customer.name}</p>
                </div>
              </div>

              <div>
                <label className='text-sm font-medium'>Release Conditions</label>
                <ul className='text-sm text-muted-foreground mt-1'>
                  {selectedEscrow.releaseConditions.map((condition, index) => (
                    <li key={index} className='flex items-center gap-2'>
                      <CheckCircle className='h-3 w-3 text-green-600' />
                      {condition.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </li>
                  ))}
                </ul>
              </div>

              {selectedEscrow.disputeReason && (
                <Alert>
                  <AlertIcon className='h-4 w-4' />
                  <AlertDescription>
                    <strong>Dispute:</strong> {selectedEscrow.disputeReason}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
