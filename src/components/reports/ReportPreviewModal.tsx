'use client';

/**
 * Report Preview Modal Component
 *
 * Preview report data before downloading. Shows report summary, charts,
 * and key metrics in a modal dialog.
 */

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { reportsCompleteService } from '@/lib/api/services/reports-complete.service';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Loader2, Download, FileText, TrendingUp, TrendingDown, X } from 'lucide-react';
import { toast } from 'sonner';
import type { ReportType, ReportFormat, ReportPeriod } from '@/lib/api/types/reports.types';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface ReportPreviewModalProps {
  open: boolean;
  onClose: () => void;
  reportType: ReportType;
  format: ReportFormat;
  period: ReportPeriod;
  startDate?: string;
  endDate?: string;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export function ReportPreviewModal({
  open,
  onClose,
  reportType,
  format,
  period,
  startDate,
  endDate,
}: ReportPreviewModalProps) {
  const [activeTab, setActiveTab] = useState('summary');

  // Fetch report preview data
  const { data: previewData, isLoading, error } = useQuery({
    queryKey: ['report-preview', reportType, period, startDate, endDate],
    queryFn: () =>
      reportsCompleteService.generateReport({
        type: reportType,
        format: 'pdf', // Preview always uses internal format
        period: startDate && endDate ? undefined : period,
        startDate,
        endDate,
      }),
    enabled: open,
  });

  const handleDownload = async () => {
    try {
      const response = await reportsCompleteService.generateReport({
        type: reportType,
        format,
        period: startDate && endDate ? undefined : period,
        startDate,
        endDate,
      });

      // Trigger download
      const link = document.createElement('a');
      link.href = response.data.downloadUrl;
      link.download = response.data.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Report downloaded successfully');
      onClose();
    } catch (error) {
      toast.error('Failed to download report');
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

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-NG').format(value);
  };

  const getReportTitle = () => {
    const titles: Record<ReportType, string> = {
      sales: 'Sales Report',
      revenue: 'Revenue Report',
      products: 'Products Report',
      vendors: 'Vendors Report',
      customers: 'Customers Report',
      orders: 'Orders Report',
      analytics: 'Analytics Report',
      financial: 'Financial Report',
      performance: 'Performance Report',
      inventory: 'Inventory Report',
    };
    return titles[reportType] || 'Report';
  };

  const getPeriodLabel = () => {
    if (startDate && endDate) {
      return `${startDate} to ${endDate}`;
    }
    const labels: Record<ReportPeriod, string> = {
      today: 'Today',
      week: 'This Week',
      month: 'This Month',
      quarter: 'This Quarter',
      year: 'This Year',
      custom: 'Custom Period',
    };
    return labels[period];
  };

  // Mock data for preview - in production, this would come from the API
  const mockSummary = {
    totalRevenue: 15420000,
    totalOrders: 1250,
    totalCustomers: 890,
    averageOrderValue: 12336,
    growth: 15.5,
  };

  const mockChartData = [
    { name: 'Mon', value: 2400 },
    { name: 'Tue', value: 1398 },
    { name: 'Wed', value: 9800 },
    { name: 'Thu', value: 3908 },
    { name: 'Fri', value: 4800 },
    { name: 'Sat', value: 3800 },
    { name: 'Sun', value: 4300 },
  ];

  const mockPieData = [
    { name: 'Electronics', value: 400 },
    { name: 'Fashion', value: 300 },
    { name: 'Home', value: 200 },
    { name: 'Books', value: 100 },
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>{getReportTitle()} - Preview</DialogTitle>
              <DialogDescription className="mt-1">
                Preview your report before downloading
              </DialogDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center p-12">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">Generating preview...</p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center p-12">
            <FileText className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Failed to generate preview</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {(error as Error).message || 'An error occurred'}
            </p>
            <Button onClick={onClose}>Close</Button>
          </div>
        ) : (
          <>
            {/* Report Info */}
            <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Report Type:</span>
                  <Badge variant="outline">{reportType}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Period:</span>
                  <span className="text-sm font-medium">{getPeriodLabel()}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Export Format</p>
                <Badge variant="default">{format.toUpperCase()}</Badge>
              </div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="charts">Charts</TabsTrigger>
                <TabsTrigger value="data">Data</TabsTrigger>
              </TabsList>

              {/* Summary Tab */}
              <TabsContent value="summary" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card className="p-4">
                    <p className="text-xs text-muted-foreground mb-1">Total Revenue</p>
                    <p className="text-2xl font-bold">{formatCurrency(mockSummary.totalRevenue)}</p>
                    <div className="flex items-center gap-1 mt-2">
                      <TrendingUp className="h-3 w-3 text-green-500" />
                      <span className="text-xs text-green-500">+{mockSummary.growth}%</span>
                    </div>
                  </Card>

                  <Card className="p-4">
                    <p className="text-xs text-muted-foreground mb-1">Total Orders</p>
                    <p className="text-2xl font-bold">{formatNumber(mockSummary.totalOrders)}</p>
                    <p className="text-xs text-muted-foreground mt-2">This period</p>
                  </Card>

                  <Card className="p-4">
                    <p className="text-xs text-muted-foreground mb-1">Customers</p>
                    <p className="text-2xl font-bold">{formatNumber(mockSummary.totalCustomers)}</p>
                    <p className="text-xs text-muted-foreground mt-2">Active users</p>
                  </Card>

                  <Card className="p-4">
                    <p className="text-xs text-muted-foreground mb-1">Avg Order Value</p>
                    <p className="text-2xl font-bold">{formatCurrency(mockSummary.averageOrderValue)}</p>
                    <p className="text-xs text-muted-foreground mt-2">Per order</p>
                  </Card>
                </div>

                {/* Key Insights */}
                <Card className="p-4">
                  <h3 className="font-semibold mb-3">Key Insights</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <TrendingUp className="h-4 w-4 text-green-500 mt-0.5" />
                      <span>Revenue increased by {mockSummary.growth}% compared to previous period</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <TrendingUp className="h-4 w-4 text-green-500 mt-0.5" />
                      <span>Order volume grew by 12% with improved conversion rates</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <TrendingUp className="h-4 w-4 text-green-500 mt-0.5" />
                      <span>Customer retention rate improved to 78%</span>
                    </li>
                  </ul>
                </Card>
              </TabsContent>

              {/* Charts Tab */}
              <TabsContent value="charts" className="space-y-6 mt-4">
                <Card className="p-4">
                  <h3 className="font-semibold mb-4">Daily Trend</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={mockChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="p-4">
                    <h3 className="font-semibold mb-4">Category Distribution</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={mockPieData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={(entry) => entry.name}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {mockPieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </Card>

                  <Card className="p-4">
                    <h3 className="font-semibold mb-4">Performance Comparison</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={mockChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="#10B981" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Card>
                </div>
              </TabsContent>

              {/* Data Tab */}
              <TabsContent value="data" className="mt-4">
                <Card className="p-4">
                  <h3 className="font-semibold mb-4">Sample Data Preview</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2">Date</th>
                          <th className="text-left py-2">Orders</th>
                          <th className="text-left py-2">Revenue</th>
                          <th className="text-left py-2">Customers</th>
                        </tr>
                      </thead>
                      <tbody>
                        {mockChartData.map((row, index) => (
                          <tr key={index} className="border-b">
                            <td className="py-2">{row.name}</td>
                            <td className="py-2">{Math.floor(row.value / 10)}</td>
                            <td className="py-2">{formatCurrency(row.value * 1000)}</td>
                            <td className="py-2">{Math.floor(row.value / 20)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-xs text-muted-foreground mt-4">
                    This is a sample preview. The actual report will contain complete data.
                  </p>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleDownload} disabled={isLoading || !!error}>
            <Download className="mr-2 h-4 w-4" />
            Download Report
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
