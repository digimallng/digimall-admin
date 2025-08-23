'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AnimatedCard, GlowingButton } from '@/components/ui/AnimatedCard';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Eye,
  Send,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  Mail,
  MessageSquare,
  Smartphone,
  Globe,
  Calendar,
  RefreshCw,
  Download,
  Filter,
  Activity,
  Target,
  Zap,
  AlertTriangle,
  PieChart,
} from 'lucide-react';
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
import { cn } from '@/lib/utils/cn';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { notificationsService } from '@/lib/api/services/notifications.service';

interface DateRange {
  startDate: string;
  endDate: string;
}

const CHART_COLORS = {
  primary: '#3B82F6',
  secondary: '#10B981',
  tertiary: '#F59E0B',
  quaternary: '#EF4444',
  info: '#8B5CF6',
  warning: '#F97316',
};

const CHANNEL_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Green  
  '#F59E0B', // Amber
  '#8B5CF6', // Purple
];

export default function NotificationAnalyticsPage() {
  const [dateRange, setDateRange] = useState<DateRange>(() => {
    const endDate = new Date();
    const startDate = subDays(endDate, 30);
    return {
      startDate: format(startDate, 'yyyy-MM-dd'),
      endDate: format(endDate, 'yyyy-MM-dd'),
    };
  });

  const [selectedMetric, setSelectedMetric] = useState<'sent' | 'delivered' | 'opened' | 'clicked'>('sent');

  // Fetch notification statistics
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useQuery({
    queryKey: ['notification-stats', dateRange],
    queryFn: () => notificationsService.getNotificationStats(dateRange),
    staleTime: 60000, // 1 minute
  });

  // Fetch delivery rate analytics
  const { data: deliveryRates, isLoading: deliveryLoading, refetch: refetchDelivery } = useQuery({
    queryKey: ['notification-delivery-rates', dateRange],
    queryFn: () => notificationsService.getDeliveryRates(dateRange),
    staleTime: 60000,
  });

  // Fetch engagement analytics
  const { data: engagement, isLoading: engagementLoading, refetch: refetchEngagement } = useQuery({
    queryKey: ['notification-engagement', dateRange],
    queryFn: () => notificationsService.getEngagementAnalytics(dateRange),
    staleTime: 60000,
  });

  // Fetch channel performance
  const { data: channelPerformance, isLoading: channelLoading, refetch: refetchChannel } = useQuery({
    queryKey: ['notification-channel-performance', dateRange],
    queryFn: () => notificationsService.getChannelPerformance(dateRange),
    staleTime: 60000,
  });

  const isLoading = statsLoading || deliveryLoading || engagementLoading || channelLoading;

  const refreshAllData = () => {
    refetchStats();
    refetchDelivery();
    refetchEngagement();
    refetchChannel();
  };

  // Transform data for charts
  const dailyTrendsData = stats?.breakdown.daily ? 
    Object.entries(stats.breakdown.daily).map(([date, data]) => ({
      date: format(new Date(date), 'MMM dd'),
      sent: (data as any).sent || 0,
      read: (data as any).read || 0,
      openRate: (data as any).sent > 0 ? ((data as any).read / (data as any).sent) * 100 : 0,
    })).slice(-14) : []; // Show last 14 days

  const typeDistributionData = stats?.breakdown.byType ?
    Object.entries(stats.breakdown.byType).map(([type, count], index) => ({
      name: type.charAt(0).toUpperCase() + type.slice(1),
      value: count as number,
      color: CHANNEL_COLORS[index % CHANNEL_COLORS.length],
    })) : [];

  const channelPerformanceData = channelPerformance?.channels?.map((channel: any) => ({
    name: channel.channel.charAt(0).toUpperCase() + channel.channel.slice(1),
    sent: channel.sent || 0,
    delivered: channel.delivered || 0,
    opened: channel.opened || 0,
    clicked: channel.clicked || 0,
    deliveryRate: channel.deliveryRate || 0,
    openRate: channel.openRate || 0,
    clickRate: channel.clickRate || 0,
  })) || [];

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const getChangeIndicator = (current: number, previous: number) => {
    if (previous === 0) return null;
    const change = ((current - previous) / previous) * 100;
    const isPositive = change > 0;
    
    return (
      <div className={cn(
        'flex items-center gap-1 text-xs',
        isPositive ? 'text-green-600' : 'text-red-600'
      )}>
        {isPositive ? (
          <TrendingUp className='h-3 w-3' />
        ) : (
          <TrendingDown className='h-3 w-3' />
        )}
        {Math.abs(change).toFixed(1)}%
      </div>
    );
  };

  return (
    <div className='space-y-8'>
      {/* Header */}
      <div className='relative'>
        <div className='absolute inset-0 -z-10 bg-gradient-to-r from-purple-600/5 via-blue-600/5 to-indigo-600/5 rounded-3xl' />
        <div className='p-8'>
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent'>
                Notification Analytics
              </h1>
              <p className='text-gray-600 mt-2'>
                Monitor notification performance and engagement metrics
              </p>
            </div>
            <div className='flex items-center gap-3'>
              <div className='flex items-center gap-2'>
                <input
                  type='date'
                  value={dateRange.startDate}
                  onChange={e => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                  className='px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                />
                <span className='text-gray-500'>to</span>
                <input
                  type='date'
                  value={dateRange.endDate}
                  onChange={e => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                  className='px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                />
              </div>
              <GlowingButton
                size='sm'
                variant='secondary'
                onClick={refreshAllData}
                disabled={isLoading}
              >
                <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
                Refresh
              </GlowingButton>
              <GlowingButton size='sm' variant='primary'>
                <Download className='h-4 w-4 mr-2' />
                Export
              </GlowingButton>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        <AnimatedCard className='p-6'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-gray-600'>Total Sent</p>
              <p className='text-2xl font-bold text-gray-900'>
                {formatNumber(stats?.summary.totalNotifications || 0)}
              </p>
              {getChangeIndicator(stats?.summary.totalNotifications || 0, 0)}
            </div>
            <div className='p-3 rounded-full bg-blue-100'>
              <Send className='h-5 w-5 text-blue-600' />
            </div>
          </div>
        </AnimatedCard>

        <AnimatedCard className='p-6'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-gray-600'>Read Rate</p>
              <p className='text-2xl font-bold text-gray-900'>
                {(stats?.summary.readRate || 0).toFixed(1)}%
              </p>
              {getChangeIndicator(stats?.summary.readRate || 0, 0)}
            </div>
            <div className='p-3 rounded-full bg-green-100'>
              <Eye className='h-5 w-5 text-green-600' />
            </div>
          </div>
        </AnimatedCard>

        <AnimatedCard className='p-6'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-gray-600'>Delivered</p>
              <p className='text-2xl font-bold text-gray-900'>
                {formatNumber(deliveryRates?.metrics?.totalRead || 0)}
              </p>
              {getChangeIndicator(deliveryRates?.metrics?.totalRead || 0, 0)}
            </div>
            <div className='p-3 rounded-full bg-purple-100'>
              <CheckCircle className='h-5 w-5 text-purple-600' />
            </div>
          </div>
        </AnimatedCard>

        <AnimatedCard className='p-6'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-gray-600'>Engagement</p>
              <p className='text-2xl font-bold text-gray-900'>
                {(engagement?.insights?.averageEngagement || 0).toFixed(1)}%
              </p>
              {getChangeIndicator(engagement?.insights?.averageEngagement || 0, 0)}
            </div>
            <div className='p-3 rounded-full bg-orange-100'>
              <Target className='h-5 w-5 text-orange-600' />
            </div>
          </div>
        </AnimatedCard>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
        {/* Daily Trends */}
        <AnimatedCard className='p-6'>
          <div className='flex items-center justify-between mb-6'>
            <h2 className='text-lg font-semibold text-gray-900'>Daily Trends</h2>
            <select
              value={selectedMetric}
              onChange={e => setSelectedMetric(e.target.value as typeof selectedMetric)}
              className='px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
            >
              <option value='sent'>Sent</option>
              <option value='read'>Read</option>
              <option value='openRate'>Open Rate</option>
            </select>
          </div>
          {isLoading ? (
            <div className='h-80 flex items-center justify-center'>
              <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
            </div>
          ) : (
            <ResponsiveContainer width='100%' height={320}>
              <AreaChart data={dailyTrendsData}>
                <CartesianGrid strokeDasharray='3 3' stroke='#f0f0f0' />
                <XAxis 
                  dataKey='date' 
                  stroke='#6b7280'
                  fontSize={12}
                />
                <YAxis 
                  stroke='#6b7280'
                  fontSize={12}
                  tickFormatter={formatNumber}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                />
                <Area
                  type='monotone'
                  dataKey={selectedMetric}
                  stroke={CHART_COLORS.primary}
                  fill={CHART_COLORS.primary}
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </AnimatedCard>

        {/* Type Distribution */}
        <AnimatedCard className='p-6'>
          <div className='flex items-center justify-between mb-6'>
            <h2 className='text-lg font-semibold text-gray-900'>Notification Types</h2>
            <PieChart className='h-5 w-5 text-gray-400' />
          </div>
          {isLoading ? (
            <div className='h-80 flex items-center justify-center'>
              <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
            </div>
          ) : (
            <div className='space-y-4'>
              {typeDistributionData.map((item, index) => {
                const total = typeDistributionData.reduce((sum, d) => sum + d.value, 0);
                const percentage = total > 0 ? (item.value / total) * 100 : 0;
                
                return (
                  <div key={item.name} className='flex items-center justify-between'>
                    <div className='flex items-center gap-3'>
                      <div
                        className='w-4 h-4 rounded-full'
                        style={{ backgroundColor: item.color }}
                      />
                      <span className='text-sm font-medium text-gray-900'>{item.name}</span>
                    </div>
                    <div className='text-right'>
                      <div className='text-sm font-semibold text-gray-900'>
                        {formatNumber(item.value)}
                      </div>
                      <div className='text-xs text-gray-500'>
                        {percentage.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </AnimatedCard>
      </div>

      {/* Channel Performance */}
      <AnimatedCard className='p-6'>
        <div className='flex items-center justify-between mb-6'>
          <h2 className='text-lg font-semibold text-gray-900'>Channel Performance</h2>
          <Activity className='h-5 w-5 text-gray-400' />
        </div>
        {isLoading ? (
          <div className='h-80 flex items-center justify-center'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
          </div>
        ) : (
          <div className='overflow-x-auto'>
            <table className='w-full'>
              <thead>
                <tr className='border-b border-gray-200'>
                  <th className='text-left py-3 px-4 text-sm font-semibold text-gray-900'>Channel</th>
                  <th className='text-right py-3 px-4 text-sm font-semibold text-gray-900'>Sent</th>
                  <th className='text-right py-3 px-4 text-sm font-semibold text-gray-900'>Delivered</th>
                  <th className='text-right py-3 px-4 text-sm font-semibold text-gray-900'>Delivery Rate</th>
                  <th className='text-right py-3 px-4 text-sm font-semibold text-gray-900'>Open Rate</th>
                  <th className='text-right py-3 px-4 text-sm font-semibold text-gray-900'>Click Rate</th>
                </tr>
              </thead>
              <tbody>
                {channelPerformanceData.map((channel, index) => {
                  const getChannelIcon = (name: string) => {
                    switch (name.toLowerCase()) {
                      case 'email': return Mail;
                      case 'sms': return MessageSquare;
                      case 'push': return Smartphone;
                      case 'in-app': return Globe;
                      default: return Globe;
                    }
                  };

                  const ChannelIcon = getChannelIcon(channel.name);

                  return (
                    <tr key={channel.name} className='border-b border-gray-100'>
                      <td className='py-3 px-4'>
                        <div className='flex items-center gap-3'>
                          <ChannelIcon className='h-4 w-4 text-gray-600' />
                          <span className='text-sm font-medium text-gray-900'>
                            {channel.name}
                          </span>
                        </div>
                      </td>
                      <td className='py-3 px-4 text-right text-sm text-gray-900'>
                        {formatNumber(channel.sent)}
                      </td>
                      <td className='py-3 px-4 text-right text-sm text-gray-900'>
                        {formatNumber(channel.delivered)}
                      </td>
                      <td className='py-3 px-4 text-right'>
                        <div className='flex items-center justify-end gap-2'>
                          <div className={cn(
                            'w-2 h-2 rounded-full',
                            channel.deliveryRate >= 95 ? 'bg-green-500' :
                            channel.deliveryRate >= 85 ? 'bg-yellow-500' : 'bg-red-500'
                          )} />
                          <span className='text-sm text-gray-900'>
                            {channel.deliveryRate.toFixed(1)}%
                          </span>
                        </div>
                      </td>
                      <td className='py-3 px-4 text-right text-sm text-gray-900'>
                        {channel.openRate.toFixed(1)}%
                      </td>
                      <td className='py-3 px-4 text-right text-sm text-gray-900'>
                        {channel.clickRate.toFixed(1)}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </AnimatedCard>

      {/* Insights */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <AnimatedCard className='p-6'>
          <h3 className='text-lg font-semibold text-gray-900 mb-4'>Performance Insights</h3>
          <div className='space-y-3'>
            <div className='flex items-start gap-3'>
              <div className='p-2 rounded-full bg-green-100 mt-0.5'>
                <TrendingUp className='h-4 w-4 text-green-600' />
              </div>
              <div>
                <div className='font-medium text-gray-900'>Best Performing Type</div>
                <div className='text-sm text-gray-600'>
                  {engagement?.insights?.bestPerformingType || 'N/A'} notifications show highest engagement
                </div>
              </div>
            </div>
            <div className='flex items-start gap-3'>
              <div className='p-2 rounded-full bg-blue-100 mt-0.5'>
                <Target className='h-4 w-4 text-blue-600' />
              </div>
              <div>
                <div className='font-medium text-gray-900'>Average Engagement</div>
                <div className='text-sm text-gray-600'>
                  {(engagement?.insights?.averageEngagement || 0).toFixed(1)}% across all notification types
                </div>
              </div>
            </div>
            <div className='flex items-start gap-3'>
              <div className='p-2 rounded-full bg-purple-100 mt-0.5'>
                <Activity className='h-4 w-4 text-purple-600' />
              </div>
              <div>
                <div className='font-medium text-gray-900'>Total Interactions</div>
                <div className='text-sm text-gray-600'>
                  {formatNumber(engagement?.insights?.totalInteractions || 0)} user interactions recorded
                </div>
              </div>
            </div>
          </div>
        </AnimatedCard>

        <AnimatedCard className='p-6'>
          <h3 className='text-lg font-semibold text-gray-900 mb-4'>Recommendations</h3>
          <div className='space-y-3'>
            <div className='flex items-start gap-3'>
              <div className='p-2 rounded-full bg-yellow-100 mt-0.5'>
                <AlertTriangle className='h-4 w-4 text-yellow-600' />
              </div>
              <div>
                <div className='font-medium text-gray-900'>Optimize Low-Performing Channels</div>
                <div className='text-sm text-gray-600'>
                  Consider A/B testing subject lines for email notifications
                </div>
              </div>
            </div>
            <div className='flex items-start gap-3'>
              <div className='p-2 rounded-full bg-blue-100 mt-0.5'>
                <Clock className='h-4 w-4 text-blue-600' />
              </div>
              <div>
                <div className='font-medium text-gray-900'>Timing Optimization</div>
                <div className='text-sm text-gray-600'>
                  Schedule notifications during peak engagement hours
                </div>
              </div>
            </div>
            <div className='flex items-start gap-3'>
              <div className='p-2 rounded-full bg-green-100 mt-0.5'>
                <Zap className='h-4 w-4 text-green-600' />
              </div>
              <div>
                <div className='font-medium text-gray-900'>Segmentation Strategy</div>
                <div className='text-sm text-gray-600'>
                  Target specific user segments for better engagement
                </div>
              </div>
            </div>
          </div>
        </AnimatedCard>
      </div>
    </div>
  );
}