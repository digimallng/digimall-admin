'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Clock, 
  AlertTriangle, 
  CheckCircle,
  XCircle,
  Calendar,
  BarChart3,
  PieChart,
  LineChart,
  Users,
  Percent,
  Activity
} from 'lucide-react';
import { useEscrowAnalytics } from '@/lib/hooks/use-escrow';
import { Skeleton } from '@/components/ui/skeleton';
import { EscrowStatus } from '@/lib/api/types';

interface EscrowAnalyticsProps {
  className?: string;
}

const timeRanges = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 3 months' },
  { value: '1y', label: 'Last year' },
];

export function EscrowAnalytics({ className }: EscrowAnalyticsProps) {
  const [timeRange, setTimeRange] = useState('30d');
  const [activeChart, setActiveChart] = useState<'volume' | 'success' | 'disputes'>('volume');
  
  const { data: analytics, isLoading, error } = useEscrowAnalytics({
    timeRange,
    includeCharts: true,
    includeComparisons: true,
  });

  const handleExportReport = () => {
    // Export functionality will be implemented
    console.log('Exporting escrow analytics report for', timeRange);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-64" />
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Analytics Unavailable</h3>
          <p className="text-gray-500">Unable to load escrow analytics data.</p>
        </CardContent>
      </Card>
    );
  }

  const metrics = analytics || {
    totalEscrows: 1245,
    totalVolume: 12450000,
    successRate: 94.2,
    averageResolutionTime: 2.3,
    activeEscrows: 156,
    completedEscrows: 1089,
    disputedEscrows: 23,
    expiredEscrows: 8,
    volumeChange: 12.5,
    escrowsChange: -3.2,
    successRateChange: 2.1,
    resolutionTimeChange: -15.3,
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Time Range Selector and Export */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {timeRanges.map((range) => (
                <SelectItem key={range.value} value={range.value}>
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleExportReport} variant="outline">
          Export Report
        </Button>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Volume */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₦{(metrics.totalVolume / 1000000).toFixed(1)}M
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              {metrics.volumeChange >= 0 ? (
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
              )}
              <span className={metrics.volumeChange >= 0 ? 'text-green-500' : 'text-red-500'}>
                {Math.abs(metrics.volumeChange).toFixed(1)}%
              </span>
              <span className="ml-1">vs last period</span>
            </div>
          </CardContent>
        </Card>

        {/* Total Escrows */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Escrows</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalEscrows.toLocaleString()}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {metrics.escrowsChange >= 0 ? (
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
              )}
              <span className={metrics.escrowsChange >= 0 ? 'text-green-500' : 'text-red-500'}>
                {Math.abs(metrics.escrowsChange).toFixed(1)}%
              </span>
              <span className="ml-1">vs last period</span>
            </div>
          </CardContent>
        </Card>

        {/* Success Rate */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.successRate}%</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {metrics.successRateChange >= 0 ? (
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
              )}
              <span className={metrics.successRateChange >= 0 ? 'text-green-500' : 'text-red-500'}>
                {Math.abs(metrics.successRateChange).toFixed(1)}%
              </span>
              <span className="ml-1">vs last period</span>
            </div>
          </CardContent>
        </Card>

        {/* Avg Resolution Time */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Resolution</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.averageResolutionTime}d</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {metrics.resolutionTimeChange <= 0 ? (
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
              )}
              <span className={metrics.resolutionTimeChange <= 0 ? 'text-green-500' : 'text-red-500'}>
                {Math.abs(metrics.resolutionTimeChange).toFixed(1)}%
              </span>
              <span className="ml-1">faster</span>
            </div>
          </CardContent>
        </Card>

        {/* Active Escrows */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <Activity className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{metrics.activeEscrows}</div>
            <p className="text-xs text-muted-foreground">Currently processing</p>
          </CardContent>
        </Card>

        {/* Completed Escrows */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{metrics.completedEscrows}</div>
            <p className="text-xs text-muted-foreground">Successfully released</p>
          </CardContent>
        </Card>

        {/* Disputed Escrows */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disputes</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{metrics.disputedEscrows}</div>
            <p className="text-xs text-muted-foreground">Requiring resolution</p>
          </CardContent>
        </Card>

        {/* Expired Escrows */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expired</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{metrics.expiredEscrows}</div>
            <p className="text-xs text-muted-foreground">Timed out</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <Tabs value={activeChart} onValueChange={(value) => setActiveChart(value as any)}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="volume" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Volume Trends</span>
            </TabsTrigger>
            <TabsTrigger value="success" className="flex items-center space-x-2">
              <PieChart className="h-4 w-4" />
              <span>Success Rates</span>
            </TabsTrigger>
            <TabsTrigger value="disputes" className="flex items-center space-x-2">
              <LineChart className="h-4 w-4" />
              <span>Dispute Analysis</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="volume">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>Volume Trends</span>
              </CardTitle>
              <CardDescription>
                Escrow volume and transaction counts over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <BarChart3 className="mx-auto h-16 w-16 mb-4 opacity-50" />
                  <p>Interactive volume chart will be implemented here</p>
                  <p className="text-sm mt-2">Showing daily/weekly volume trends and patterns</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="success">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <PieChart className="h-5 w-5" />
                <span>Success Rate Analysis</span>
              </CardTitle>
              <CardDescription>
                Breakdown of escrow completion rates by status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <PieChart className="mx-auto h-16 w-16 mb-4 opacity-50" />
                  <p>Success rate pie chart will be implemented here</p>
                  <p className="text-sm mt-2">Showing distribution of escrow outcomes</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="disputes">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <LineChart className="h-5 w-5" />
                <span>Dispute Analysis</span>
              </CardTitle>
              <CardDescription>
                Dispute trends, resolution times, and outcomes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <LineChart className="mx-auto h-16 w-16 mb-4 opacity-50" />
                  <p>Dispute trend chart will be implemented here</p>
                  <p className="text-sm mt-2">Showing dispute frequency and resolution patterns</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Status Distribution */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Percent className="h-5 w-5" />
              <span>Status Distribution</span>
            </CardTitle>
            <CardDescription>
              Current distribution of escrow statuses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { status: EscrowStatus.FUNDED, count: metrics.activeEscrows, color: 'blue' },
                { status: EscrowStatus.RELEASED, count: metrics.completedEscrows, color: 'green' },
                { status: EscrowStatus.DISPUTED, count: metrics.disputedEscrows, color: 'orange' },
                { status: EscrowStatus.EXPIRED, count: metrics.expiredEscrows, color: 'red' },
              ].map(({ status, count, color }) => (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full bg-${color}-500`} />
                    <span className="text-sm font-medium capitalize">{status}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-bold">{count}</span>
                    <span className="text-xs text-muted-foreground">
                      ({((count / metrics.totalEscrows) * 100).toFixed(1)}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Top Performance Metrics</span>
            </CardTitle>
            <CardDescription>
              Key performance indicators and benchmarks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Platform Commission</span>
                <Badge variant="secondary">₦{(metrics.totalVolume * 0.025 / 1000).toFixed(0)}K</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Dispute Rate</span>
                <Badge variant={metrics.disputedEscrows / metrics.totalEscrows < 0.05 ? 'default' : 'destructive'}>
                  {((metrics.disputedEscrows / metrics.totalEscrows) * 100).toFixed(1)}%
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Avg Escrow Value</span>
                <Badge variant="outline">₦{(metrics.totalVolume / metrics.totalEscrows / 1000).toFixed(0)}K</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Monthly Growth</span>
                <Badge variant={metrics.volumeChange >= 0 ? 'default' : 'destructive'}>
                  {metrics.volumeChange >= 0 ? '+' : ''}{metrics.volumeChange.toFixed(1)}%
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}