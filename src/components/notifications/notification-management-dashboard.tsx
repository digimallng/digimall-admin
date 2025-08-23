'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { notificationsService } from '@/lib/api/services/notifications.service';
import { subDays, format } from 'date-fns';
import {
  Bell,
  Send,
  Users,
  Mail,
  MessageSquare,
  TrendingUp,
  TrendingDown,
  Eye,
  Edit,
  Trash2,
  Plus,
  Filter,
  Search,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Zap,
  BarChart3,
  PieChart,
  Settings,
  Download,
  RefreshCw,
  Target,
  Activity,
  Smartphone,
  Globe,
  Shield,
  Pause,
  Play,
  Copy,
  ExternalLink,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/Textarea';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
  PieChart as RechartsPieChart,
  Cell,
} from 'recharts';
import { toast } from 'sonner';

interface NotificationStats {
  totalSent: number;
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  unsubscribeRate: number;
  failureRate: number;
  avgResponseTime: number;
  activeTemplates: number;
}

interface NotificationTemplate {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'push' | 'in_app';
  category: string;
  subject?: string;
  content: string;
  isActive: boolean;
  usageCount: number;
  lastUsed?: string;
  createdAt: string;
  updatedAt: string;
  variables: string[];
}

interface NotificationCampaign {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'push' | 'bulk';
  status: 'draft' | 'scheduled' | 'running' | 'completed' | 'paused' | 'failed';
  templateId: string;
  templateName: string;
  targetAudience: {
    type: 'all' | 'segment' | 'individual';
    count: number;
    criteria?: string;
  };
  scheduledFor?: string;
  sentAt?: string;
  completedAt?: string;
  metrics: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    failed: number;
  };
  createdBy: string;
  createdAt: string;
}

interface NotificationLog {
  id: string;
  userId: string;
  userName: string;
  type: 'email' | 'sms' | 'push' | 'in_app';
  category: string;
  subject?: string;
  content: string;
  status: 'sent' | 'delivered' | 'opened' | 'clicked' | 'failed' | 'bounced';
  sentAt: string;
  deliveredAt?: string;
  openedAt?: string;
  clickedAt?: string;
  errorMessage?: string;
  campaignId?: string;
  templateId?: string;
}

const mockTemplates: NotificationTemplate[] = [
  {
    id: 'tpl_001',
    name: 'Order Confirmation',
    type: 'email',
    category: 'order',
    subject: 'Order Confirmation - #{orderNumber}',
    content: 'Thank you for your order...',
    isActive: true,
    usageCount: 15680,
    lastUsed: '2024-01-15T10:30:00Z',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    variables: ['customerName', 'orderNumber', 'total', 'items'],
  },
  {
    id: 'tpl_002',
    name: 'Bargain Notification',
    type: 'sms',
    category: 'bargaining',
    content: 'New bargain offer received...',
    isActive: true,
    usageCount: 8940,
    lastUsed: '2024-01-15T09:15:00Z',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T09:15:00Z',
    variables: ['productName', 'offerAmount', 'timeRemaining'],
  },
];

const mockCampaigns: NotificationCampaign[] = [
  {
    id: 'camp_001',
    name: 'New Year Sale Announcement',
    type: 'email',
    status: 'completed',
    templateId: 'tpl_marketing_001',
    templateName: 'Sale Announcement Template',
    targetAudience: {
      type: 'segment',
      count: 25600,
      criteria: 'Active customers from last 6 months',
    },
    sentAt: '2024-01-01T08:00:00Z',
    completedAt: '2024-01-01T12:00:00Z',
    metrics: {
      sent: 25600,
      delivered: 25134,
      opened: 6283,
      clicked: 892,
      failed: 466,
    },
    createdBy: 'admin_001',
    createdAt: '2023-12-28T00:00:00Z',
  },
];

const mockLogs: NotificationLog[] = [
  {
    id: 'log_001',
    userId: 'user_001',
    userName: 'John Doe',
    type: 'email',
    category: 'order',
    subject: 'Order Confirmation - #ORD12345',
    content: 'Thank you for your order...',
    status: 'delivered',
    sentAt: '2024-01-15T10:30:00Z',
    deliveredAt: '2024-01-15T10:31:00Z',
    templateId: 'tpl_001',
  },
];

const deliveryTrendsData = [
  { date: 'Jan 10', sent: 8500, delivered: 8245, opened: 2100, clicked: 285 },
  { date: 'Jan 11', sent: 9200, delivered: 9024, opened: 2260, clicked: 312 },
  { date: 'Jan 12', sent: 7800, delivered: 7644, opened: 1950, clicked: 265 },
  { date: 'Jan 13', sent: 10100, delivered: 9919, opened: 2480, clicked: 342 },
  { date: 'Jan 14', sent: 11500, delivered: 11270, opened: 2870, clicked: 398 },
  { date: 'Jan 15', sent: 12800, delivered: 12544, opened: 3200, clicked: 448 },
];

const channelDistribution = [
  { name: 'Email', value: 65, count: 81471, color: '#3b82f6' },
  { name: 'SMS', value: 25, count: 31335, color: '#10b981' },
  { name: 'Push', value: 8, count: 10027, color: '#f59e0b' },
  { name: 'In-App', value: 2, count: 2507, color: '#8b5cf6' },
];

export function NotificationManagementDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState('7');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedTemplate, setSelectedTemplate] = useState<NotificationTemplate | null>(null);
  const [isCreateTemplateOpen, setIsCreateTemplateOpen] = useState(false);
  const [isCreateCampaignOpen, setIsCreateCampaignOpen] = useState(false);

  // Calculate date range based on selected period
  const getDateRange = () => {
    const endDate = new Date();
    const startDate = subDays(endDate, parseInt(selectedPeriod));
    return {
      startDate: format(startDate, 'yyyy-MM-dd'),
      endDate: format(endDate, 'yyyy-MM-dd'),
    };
  };

  // Fetch real notification statistics
  const { data: notificationStats, isLoading: statsLoading } = useQuery({
    queryKey: ['notification-stats', selectedPeriod],
    queryFn: () => notificationsService.getNotificationStats(getDateRange()),
    staleTime: 60000,
  });

  // Fetch real notification templates
  const { data: templates = mockTemplates, isLoading: templatesLoading } = useQuery({
    queryKey: ['notification-templates'],
    queryFn: () => notificationsService.getNotificationTemplates(),
    staleTime: 300000,
  });

  // Fetch delivery analytics
  const { data: deliveryAnalytics, isLoading: deliveryLoading } = useQuery({
    queryKey: ['delivery-analytics', selectedPeriod],
    queryFn: () => notificationsService.getDeliveryRates(getDateRange()),
    staleTime: 60000,
  });

  // Fetch engagement analytics
  const { data: engagementAnalytics, isLoading: engagementLoading } = useQuery({
    queryKey: ['engagement-analytics', selectedPeriod],
    queryFn: () => notificationsService.getEngagementAnalytics(getDateRange()),
    staleTime: 60000,
  });

  // Create computed stats from real data
  const mockStats = {
    totalSent: notificationStats?.summary.totalNotifications || 0,
    deliveryRate: deliveryAnalytics?.metrics?.deliveryRate || 0,
    openRate: deliveryAnalytics?.metrics?.readRate || 0,
    clickRate: engagementAnalytics?.insights?.averageEngagement || 0,
    unsubscribeRate: 0.8,
    failureRate: 100 - (deliveryAnalytics?.metrics?.deliveryRate || 0),
    avgResponseTime: 2.3,
    activeTemplates: templates.filter(t => t.isActive).length,
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
      case 'delivered':
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'opened':
      case 'running':
        return 'bg-blue-100 text-blue-800';
      case 'clicked':
        return 'bg-purple-100 text-purple-800';
      case 'failed':
      case 'bounced':
        return 'bg-red-100 text-red-800';
      case 'scheduled':
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'paused':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <Mail className='h-4 w-4' />;
      case 'sms':
        return <MessageSquare className='h-4 w-4' />;
      case 'push':
        return <Smartphone className='h-4 w-4' />;
      case 'in_app':
        return <Globe className='h-4 w-4' />;
      default:
        return <Bell className='h-4 w-4' />;
    }
  };

  const handleTemplateAction = (action: string, templateId: string) => {
    switch (action) {
      case 'edit':
        const template = mockTemplates.find(t => t.id === templateId);
        setSelectedTemplate(template || null);
        break;
      case 'duplicate':
        toast.success(`Template ${templateId} duplicated`);
        break;
      case 'delete':
        toast.success(`Template ${templateId} deleted`);
        break;
      case 'toggle':
        toast.success(`Template ${templateId} status toggled`);
        break;
      default:
        break;
    }
  };

  const handleCampaignAction = (action: string, campaignId: string) => {
    switch (action) {
      case 'pause':
        toast.success(`Campaign ${campaignId} paused`);
        break;
      case 'resume':
        toast.success(`Campaign ${campaignId} resumed`);
        break;
      case 'stop':
        toast.success(`Campaign ${campaignId} stopped`);
        break;
      case 'duplicate':
        toast.success(`Campaign ${campaignId} duplicated`);
        break;
      default:
        break;
    }
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold'>Notification Management</h1>
          <p className='text-muted-foreground'>
            Manage templates, campaigns, and monitor notification performance
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
                <p className='text-sm font-medium text-muted-foreground'>Total Sent</p>
                <p className='text-2xl font-bold'>{formatNumber(mockStats.totalSent)}</p>
                <p className='text-xs text-green-600'>+12.5% vs last period</p>
              </div>
              <div className='p-3 rounded-full bg-blue-100'>
                <Send className='h-5 w-5 text-blue-600' />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-muted-foreground'>Delivery Rate</p>
                <p className='text-2xl font-bold'>{mockStats.deliveryRate}%</p>
                <p className='text-xs text-green-600'>+0.8% vs last period</p>
              </div>
              <div className='p-3 rounded-full bg-green-100'>
                <CheckCircle className='h-5 w-5 text-green-600' />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-muted-foreground'>Open Rate</p>
                <p className='text-2xl font-bold'>{mockStats.openRate}%</p>
                <p className='text-xs text-red-600'>-1.2% vs last period</p>
              </div>
              <div className='p-3 rounded-full bg-purple-100'>
                <Eye className='h-5 w-5 text-purple-600' />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-muted-foreground'>Click Rate</p>
                <p className='text-2xl font-bold'>{mockStats.clickRate}%</p>
                <p className='text-xs text-green-600'>+0.3% vs last period</p>
              </div>
              <div className='p-3 rounded-full bg-orange-100'>
                <Target className='h-5 w-5 text-orange-600' />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className='space-y-6'>
        <TabsList className='grid w-full grid-cols-5'>
          <TabsTrigger value='overview'>Overview</TabsTrigger>
          <TabsTrigger value='templates'>Templates</TabsTrigger>
          <TabsTrigger value='campaigns'>Campaigns</TabsTrigger>
          <TabsTrigger value='logs'>Logs</TabsTrigger>
          <TabsTrigger value='analytics'>Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value='overview' className='space-y-6'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {/* Delivery Trends */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Activity className='h-5 w-5' />
                  Delivery Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width='100%' height={300}>
                  <AreaChart data={deliveryTrendsData}>
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis dataKey='date' />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type='monotone'
                      dataKey='sent'
                      stackId='1'
                      stroke='#3b82f6'
                      fill='#3b82f6'
                      fillOpacity={0.3}
                    />
                    <Area
                      type='monotone'
                      dataKey='delivered'
                      stackId='2'
                      stroke='#10b981'
                      fill='#10b981'
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Channel Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <PieChart className='h-5 w-5' />
                  Channel Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  {channelDistribution.map((channel, index) => (
                    <div key={index} className='flex items-center justify-between'>
                      <div className='flex items-center gap-3'>
                        <div
                          className='w-4 h-4 rounded-full'
                          style={{ backgroundColor: channel.color }}
                        />
                        <div className='flex items-center gap-2'>
                          {getTypeIcon(channel.name.toLowerCase())}
                          <span className='font-medium'>{channel.name}</span>
                        </div>
                      </div>
                      <div className='text-right'>
                        <p className='font-semibold'>{channel.value}%</p>
                        <p className='text-xs text-muted-foreground'>
                          {formatNumber(channel.count)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
                <Button
                  className='h-20 flex flex-col gap-2'
                  onClick={() => setIsCreateTemplateOpen(true)}
                >
                  <Plus className='h-5 w-5' />
                  <span>Create Template</span>
                </Button>
                <Button
                  variant='outline'
                  className='h-20 flex flex-col gap-2'
                  onClick={() => setIsCreateCampaignOpen(true)}
                >
                  <Send className='h-5 w-5' />
                  <span>New Campaign</span>
                </Button>
                <Button variant='outline' className='h-20 flex flex-col gap-2'>
                  <BarChart3 className='h-5 w-5' />
                  <span>View Analytics</span>
                </Button>
                <Button variant='outline' className='h-20 flex flex-col gap-2'>
                  <Settings className='h-5 w-5' />
                  <span>Settings</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='templates' className='space-y-6'>
          {/* Filters */}
          <Card>
            <CardContent className='p-6'>
              <div className='flex flex-col md:flex-row gap-4'>
                <div className='flex-1'>
                  <div className='relative'>
                    <Search className='absolute left-3 top-2.5 h-4 w-4 text-muted-foreground' />
                    <Input
                      placeholder='Search templates...'
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className='pl-9'
                    />
                  </div>
                </div>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className='w-48'>
                    <SelectValue placeholder='Filter by type' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>All Types</SelectItem>
                    <SelectItem value='email'>Email</SelectItem>
                    <SelectItem value='sms'>SMS</SelectItem>
                    <SelectItem value='push'>Push</SelectItem>
                    <SelectItem value='in_app'>In-App</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={() => setIsCreateTemplateOpen(true)}>
                  <Plus className='h-4 w-4 mr-2' />
                  Create Template
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Templates Table */}
          <Card>
            <CardHeader>
              <CardTitle>Notification Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Template</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Used</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockTemplates.map(template => (
                    <TableRow key={template.id}>
                      <TableCell>
                        <div>
                          <p className='font-medium'>{template.name}</p>
                          {template.subject && (
                            <p className='text-sm text-muted-foreground'>{template.subject}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className='flex items-center gap-2'>
                          {getTypeIcon(template.type)}
                          <span className='capitalize'>{template.type}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant='outline'>{template.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className='font-medium'>{formatNumber(template.usageCount)}</p>
                          <p className='text-xs text-muted-foreground'>times used</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className='flex items-center gap-2'>
                          <Switch
                            checked={template.isActive}
                            onCheckedChange={() => handleTemplateAction('toggle', template.id)}
                          />
                          <span className='text-sm'>
                            {template.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {template.lastUsed ? (
                          <div>
                            <p className='text-sm'>
                              {new Date(template.lastUsed).toLocaleDateString()}
                            </p>
                            <p className='text-xs text-muted-foreground'>
                              {new Date(template.lastUsed).toLocaleTimeString()}
                            </p>
                          </div>
                        ) : (
                          <span className='text-muted-foreground'>Never</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant='ghost' size='sm'>
                              <Settings className='h-4 w-4' />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem
                              onClick={() => handleTemplateAction('edit', template.id)}
                            >
                              <Edit className='h-4 w-4 mr-2' />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleTemplateAction('duplicate', template.id)}
                            >
                              <Copy className='h-4 w-4 mr-2' />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleTemplateAction('delete', template.id)}
                              className='text-red-600'
                            >
                              <Trash2 className='h-4 w-4 mr-2' />
                              Delete
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

        <TabsContent value='campaigns' className='space-y-6'>
          {/* Campaign Stats */}
          <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
            <Card>
              <CardContent className='p-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm font-medium text-muted-foreground'>Active Campaigns</p>
                    <p className='text-2xl font-bold'>3</p>
                  </div>
                  <Activity className='h-8 w-8 text-blue-600' />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className='p-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm font-medium text-muted-foreground'>Scheduled</p>
                    <p className='text-2xl font-bold'>8</p>
                  </div>
                  <Clock className='h-8 w-8 text-yellow-600' />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className='p-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm font-medium text-muted-foreground'>Completed</p>
                    <p className='text-2xl font-bold'>156</p>
                  </div>
                  <CheckCircle className='h-8 w-8 text-green-600' />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className='p-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm font-medium text-muted-foreground'>Avg CTR</p>
                    <p className='text-2xl font-bold'>3.4%</p>
                  </div>
                  <Target className='h-8 w-8 text-purple-600' />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Campaigns Table */}
          <Card>
            <CardHeader>
              <div className='flex items-center justify-between'>
                <CardTitle>Campaigns</CardTitle>
                <Button onClick={() => setIsCreateCampaignOpen(true)}>
                  <Plus className='h-4 w-4 mr-2' />
                  New Campaign
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Campaign</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Audience</TableHead>
                    <TableHead>Performance</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockCampaigns.map(campaign => (
                    <TableRow key={campaign.id}>
                      <TableCell>
                        <div>
                          <p className='font-medium'>{campaign.name}</p>
                          <p className='text-sm text-muted-foreground'>{campaign.templateName}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className='flex items-center gap-2'>
                          {getTypeIcon(campaign.type)}
                          <span className='capitalize'>{campaign.type}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(campaign.status)}>{campaign.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className='font-medium'>
                            {formatNumber(campaign.targetAudience.count)}
                          </p>
                          <p className='text-xs text-muted-foreground'>
                            {campaign.targetAudience.type}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className='space-y-1'>
                          <div className='flex justify-between text-xs'>
                            <span>Delivered:</span>
                            <span>{formatNumber(campaign.metrics.delivered)}</span>
                          </div>
                          <div className='flex justify-between text-xs'>
                            <span>Opened:</span>
                            <span>{formatNumber(campaign.metrics.opened)}</span>
                          </div>
                          <div className='flex justify-between text-xs'>
                            <span>Clicked:</span>
                            <span>{formatNumber(campaign.metrics.clicked)}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className='text-sm'>
                          {new Date(campaign.createdAt).toLocaleDateString()}
                        </p>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant='ghost' size='sm'>
                              <Settings className='h-4 w-4' />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            {campaign.status === 'running' && (
                              <DropdownMenuItem
                                onClick={() => handleCampaignAction('pause', campaign.id)}
                              >
                                <Pause className='h-4 w-4 mr-2' />
                                Pause
                              </DropdownMenuItem>
                            )}
                            {campaign.status === 'paused' && (
                              <DropdownMenuItem
                                onClick={() => handleCampaignAction('resume', campaign.id)}
                              >
                                <Play className='h-4 w-4 mr-2' />
                                Resume
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() => handleCampaignAction('duplicate', campaign.id)}
                            >
                              <Copy className='h-4 w-4 mr-2' />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <ExternalLink className='h-4 w-4 mr-2' />
                              View Report
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

        <TabsContent value='logs' className='space-y-6'>
          {/* Filters */}
          <Card>
            <CardContent className='p-6'>
              <div className='flex flex-col md:flex-row gap-4'>
                <div className='flex-1'>
                  <div className='relative'>
                    <Search className='absolute left-3 top-2.5 h-4 w-4 text-muted-foreground' />
                    <Input
                      placeholder='Search logs...'
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className='pl-9'
                    />
                  </div>
                </div>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className='w-48'>
                    <SelectValue placeholder='Filter by type' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>All Types</SelectItem>
                    <SelectItem value='email'>Email</SelectItem>
                    <SelectItem value='sms'>SMS</SelectItem>
                    <SelectItem value='push'>Push</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className='w-48'>
                    <SelectValue placeholder='Filter by status' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>All Status</SelectItem>
                    <SelectItem value='sent'>Sent</SelectItem>
                    <SelectItem value='delivered'>Delivered</SelectItem>
                    <SelectItem value='opened'>Opened</SelectItem>
                    <SelectItem value='clicked'>Clicked</SelectItem>
                    <SelectItem value='failed'>Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Logs Table */}
          <Card>
            <CardHeader>
              <CardTitle>Notification Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Recipient</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Subject/Content</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Sent At</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockLogs.map(log => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <div>
                          <p className='font-medium'>{log.userName}</p>
                          <p className='text-sm text-muted-foreground'>{log.userId}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className='flex items-center gap-2'>
                          {getTypeIcon(log.type)}
                          <span className='capitalize'>{log.type}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          {log.subject && <p className='font-medium text-sm'>{log.subject}</p>}
                          <p className='text-sm text-muted-foreground truncate max-w-xs'>
                            {log.content}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(log.status)}>{log.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className='text-sm'>{new Date(log.sentAt).toLocaleDateString()}</p>
                          <p className='text-xs text-muted-foreground'>
                            {new Date(log.sentAt).toLocaleTimeString()}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button variant='ghost' size='sm'>
                          <Eye className='h-4 w-4' />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='analytics' className='space-y-6'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {/* Performance Analytics */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width='100%' height={400}>
                  <LineChart data={deliveryTrendsData}>
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis dataKey='date' />
                    <YAxis />
                    <Tooltip />
                    <Line type='monotone' dataKey='delivered' stroke='#10b981' strokeWidth={3} />
                    <Line type='monotone' dataKey='opened' stroke='#3b82f6' strokeWidth={3} />
                    <Line type='monotone' dataKey='clicked' stroke='#8b5cf6' strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Key Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Key Metrics</CardTitle>
              </CardHeader>
              <CardContent className='space-y-6'>
                <div>
                  <div className='flex justify-between text-sm mb-2'>
                    <span>Delivery Rate</span>
                    <span>{mockStats.deliveryRate}%</span>
                  </div>
                  <Progress value={mockStats.deliveryRate} className='h-2' />
                </div>

                <div>
                  <div className='flex justify-between text-sm mb-2'>
                    <span>Open Rate</span>
                    <span>{mockStats.openRate}%</span>
                  </div>
                  <Progress value={mockStats.openRate} className='h-2' />
                </div>

                <div>
                  <div className='flex justify-between text-sm mb-2'>
                    <span>Click Rate</span>
                    <span>{mockStats.clickRate}%</span>
                  </div>
                  <Progress value={mockStats.clickRate * 10} className='h-2' />
                </div>

                <div>
                  <div className='flex justify-between text-sm mb-2'>
                    <span>Unsubscribe Rate</span>
                    <span>{mockStats.unsubscribeRate}%</span>
                  </div>
                  <Progress value={mockStats.unsubscribeRate * 10} className='h-2' />
                </div>

                <Separator />

                <div className='space-y-3'>
                  <div className='flex justify-between'>
                    <span className='text-sm text-muted-foreground'>Active Templates</span>
                    <span className='text-sm font-medium'>{mockStats.activeTemplates}</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-sm text-muted-foreground'>Avg Response Time</span>
                    <span className='text-sm font-medium'>{mockStats.avgResponseTime}s</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-sm text-muted-foreground'>Failure Rate</span>
                    <span className='text-sm font-medium'>{mockStats.failureRate}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Template Dialog */}
      <Dialog open={isCreateTemplateOpen} onOpenChange={setIsCreateTemplateOpen}>
        <DialogContent className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle>Create Notification Template</DialogTitle>
          </DialogHeader>
          <div className='space-y-4'>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <Label htmlFor='template-name'>Template Name</Label>
                <Input id='template-name' placeholder='Enter template name...' />
              </div>
              <div>
                <Label htmlFor='template-type'>Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder='Select type' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='email'>Email</SelectItem>
                    <SelectItem value='sms'>SMS</SelectItem>
                    <SelectItem value='push'>Push Notification</SelectItem>
                    <SelectItem value='in_app'>In-App</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor='template-subject'>Subject (Email only)</Label>
              <Input id='template-subject' placeholder='Enter subject...' />
            </div>
            <div>
              <Label htmlFor='template-content'>Content</Label>
              <Textarea id='template-content' placeholder='Enter template content...' rows={6} />
            </div>
            <div className='flex justify-end gap-2'>
              <Button variant='outline' onClick={() => setIsCreateTemplateOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsCreateTemplateOpen(false)}>Create Template</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Campaign Dialog */}
      <Dialog open={isCreateCampaignOpen} onOpenChange={setIsCreateCampaignOpen}>
        <DialogContent className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle>Create Notification Campaign</DialogTitle>
          </DialogHeader>
          <div className='space-y-4'>
            <div>
              <Label htmlFor='campaign-name'>Campaign Name</Label>
              <Input id='campaign-name' placeholder='Enter campaign name...' />
            </div>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <Label htmlFor='campaign-template'>Template</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder='Select template' />
                  </SelectTrigger>
                  <SelectContent>
                    {mockTemplates.map(template => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor='campaign-audience'>Target Audience</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder='Select audience' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>All Users</SelectItem>
                    <SelectItem value='customers'>Customers Only</SelectItem>
                    <SelectItem value='vendors'>Vendors Only</SelectItem>
                    <SelectItem value='segment'>Custom Segment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor='campaign-schedule'>Schedule</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder='Select schedule' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='now'>Send Now</SelectItem>
                  <SelectItem value='schedule'>Schedule for Later</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className='flex justify-end gap-2'>
              <Button variant='outline' onClick={() => setIsCreateCampaignOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsCreateCampaignOpen(false)}>Create Campaign</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
