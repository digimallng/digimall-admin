'use client';

import { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Clock,
  Shield,
  Users,
  Activity,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { 
  useStaffAnalytics, 
  useStaffProductivity, 
  useStaff, 
  useStaffStats 
} from '@/lib/hooks/use-staff';

interface StaffAnalyticsProps {
  className?: string;
}

export function StaffAnalytics({ className = '' }: StaffAnalyticsProps) {
  const [timeRange, setTimeRange] = useState('7d');

  // Calculate date range based on selection
  const getDateRange = (range: string) => {
    const endDate = new Date();
    const startDate = new Date();
    
    switch (range) {
      case '1d':
        startDate.setDate(endDate.getDate() - 1);
        break;
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
    }
    
    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    };
  };

  const { startDate, endDate } = getDateRange(timeRange);

  // Fetch real data from API
  const { data: analyticsData, isLoading: analyticsLoading } = useStaffAnalytics({
    startDate,
    endDate
  });
  
  const { data: productivityData, isLoading: productivityLoading } = useStaffProductivity({
    startDate,
    endDate
  });
  
  const { data: staffData, isLoading: staffLoading } = useStaff();
  
  const { data: statsData, isLoading: statsLoading } = useStaffStats({
    startDate,
    endDate,
    groupBy: timeRange === '1d' ? 'day' : timeRange === '7d' ? 'day' : 'week',
    includeActivityStats: true,
    includePermissionStats: true
  });

  const isLoading = analyticsLoading || productivityLoading || staffLoading || statsLoading;

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-12">
          <LoadingSpinner />
        </CardContent>
      </Card>
    );
  }

  // Use real data or fallback to sensible defaults
  const overview = {
    totalStaff: staffData?.total || 0,
    activeToday: staffData?.summary?.byStatus?.active || 0,
    avgResponseTime: analyticsData?.averageResponseTime || '0 hours',
    productivity: Math.round((productivityData?.overallScore || 0) * 100)
  };

  const performance = {
    ticketsResolved: analyticsData?.ticketsResolved || 0,
    avgResolutionTime: analyticsData?.averageResolutionTime || '0 hours',
    satisfactionScore: analyticsData?.satisfactionScore || 0,
    escalationRate: `${Math.round((analyticsData?.escalationRate || 0) * 100)}%`
  };

  const activity = statsData?.recentActivity || [];
  const topPerformers = productivityData?.topPerformers || [];
  const departments = analyticsData?.departmentBreakdown || [];

  const getWorkloadColor = (workload: string) => {
    switch (workload) {
      case 'High':
        return 'destructive';
      case 'Medium':
        return 'warning';
      case 'Low':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Staff Analytics</h2>
          <p className="text-sm text-muted-foreground">
            Monitor staff performance and activity metrics
          </p>
        </div>
        
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1d">Last 24 hours</SelectItem>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 3 months</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.totalStaff}</div>
            <p className="text-xs text-muted-foreground">
              Total registered staff
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Today</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.activeToday}</div>
            <p className="text-xs text-muted-foreground">
              {overview.totalStaff > 0 ? Math.round((overview.activeToday / overview.totalStaff) * 100) : 0}% of total staff
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.avgResponseTime}</div>
            <p className="text-xs text-muted-foreground">
              Average response time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Productivity Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.productivity}%</div>
            <p className="text-xs text-muted-foreground">
              Overall productivity rating
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="departments">Departments</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          {/* Performance Metrics */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Performance Overview</CardTitle>
                <CardDescription>Key performance indicators</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Tickets Resolved</span>
                  <Badge variant="secondary">{performance.ticketsResolved}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Avg Resolution Time</span>
                  <Badge variant="outline">{performance.avgResolutionTime}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Satisfaction Score</span>
                  <Badge className="bg-green-100 text-green-800">{performance.satisfactionScore}/5</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Escalation Rate</span>
                  <Badge variant="destructive">{performance.escalationRate}</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Top Performers</CardTitle>
                <CardDescription>Staff members with highest performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topPerformers.length > 0 ? topPerformers.slice(0, 4).map((performer, index) => (
                    <div key={performer.name || `performer-${index}`} className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">{performer.name || 'Unknown'}</div>
                        <div className="text-xs text-muted-foreground">{performer.role || 'Staff'}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold">{performer.tickets || performer.score || 0}</div>
                        <div className="text-xs text-green-600">{(performer.satisfaction || performer.rating || 0)}★</div>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center text-muted-foreground py-4">
                      No performance data available
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Activity Overview
              </CardTitle>
              <CardDescription>Daily staff activity for the last 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activity.length > 0 ? activity.slice(0, 7).map((day, index) => (
                  <div key={day.date || `day-${index}`} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">
                        {day.date ? new Date(day.date).toLocaleDateString('en-US', { 
                          weekday: 'short', 
                          month: 'short', 
                          day: 'numeric' 
                        }) : `Day ${index + 1}`}
                      </span>
                      <div className="flex gap-4 text-xs text-muted-foreground">
                        <span>{day.logins || day.loginCount || 0} logins</span>
                        <span>{day.tickets || day.activityCount || 0} activities</span>
                        <span>{day.avgSession || day.averageSession || 0}h avg</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                        style={{ width: `${Math.min(((day.tickets || day.activityCount || 0) / 60) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                )) : (
                  <div className="text-center text-muted-foreground py-8">
                    No activity data available for the selected period
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="departments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Department Overview</CardTitle>
              <CardDescription>Staff distribution and workload by department</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {departments.length > 0 ? departments.map((dept, index) => (
                  <div key={dept.name || `dept-${index}`} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Users className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <div className="font-medium">{dept.name || 'Unknown Department'}</div>
                        <div className="text-sm text-muted-foreground">
                          {dept.activeStaff || dept.active || 0}/{dept.totalStaff || dept.staff || 0} staff active
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={getWorkloadColor(dept.workload || 'Low') as any}>
                        {dept.workload || 'Low'} Load
                      </Badge>
                      {(dept.workload === 'High' || (dept.utilization && dept.utilization > 0.8)) && (
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                  </div>
                )) : (
                  <div className="text-center text-muted-foreground py-8">
                    No department data available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}