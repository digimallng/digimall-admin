'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { GlowingButton } from '@/components/ui/AnimatedCard';
import { 
  FileBarChart, 
  Download, 
  Loader2, 
  Calendar, 
  TrendingUp, 
  DollarSign,
  Users,
  BarChart3,
  Building,
  Package
} from 'lucide-react';
import { commissionService } from '@/services/commission.service';
import { CommissionReportDto, CommissionReport } from '@/types/commission.types';
import { useToast } from '@/hooks/use-toast';
import { format, subDays } from 'date-fns';

export function CommissionReports() {
  const [formData, setFormData] = useState<CommissionReportDto>({
    startDate: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
    vendorId: '',
    categoryId: '',
    includeBreakdown: true,
  });
  const [report, setReport] = useState<CommissionReport | null>(null);
  
  const { toast } = useToast();

  const generateReportMutation = useMutation({
    mutationFn: (data: CommissionReportDto) => commissionService.generateCommissionReport(data),
    onSuccess: (data) => {
      setReport(data);
      toast({
        title: 'Success',
        description: 'Commission report generated successfully',
        type: 'success',
      });
    },
    onError: (error: any) => {
      setReport(null);
      toast({
        title: 'Error',
        description: error?.message || 'Failed to generate commission report',
        type: 'error',
      });
    },
  });

  const handleGenerateReport = () => {
    if (!formData.startDate || !formData.endDate) {
      toast({
        title: 'Validation Error',
        description: 'Please select both start and end dates',
        type: 'error',
      });
      return;
    }

    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      toast({
        title: 'Validation Error',
        description: 'Start date cannot be after end date',
        type: 'error',
      });
      return;
    }

    const reportData = {
      startDate: formData.startDate,
      endDate: formData.endDate,
      ...(formData.vendorId && { vendorId: formData.vendorId }),
      ...(formData.categoryId && { categoryId: formData.categoryId }),
      includeBreakdown: formData.includeBreakdown,
    };

    generateReportMutation.mutate(reportData);
  };

  const handleExportReport = () => {
    if (!report) return;

    // Create CSV content
    const csvData = [];
    csvData.push(['Commission Report']);
    csvData.push(['Period', `${report.period.startDate} to ${report.period.endDate}`]);
    csvData.push([]);
    csvData.push(['Summary']);
    csvData.push(['Total Commissions', report.summary.totalCommissions]);
    csvData.push(['Total Order Value', report.summary.totalOrderValue]);
    csvData.push(['Average Commission Rate', `${report.summary.averageCommissionRate.toFixed(2)}%`]);
    csvData.push(['Order Count', report.summary.orderCount]);
    csvData.push([]);

    if (report.breakdown) {
      // Vendor breakdown
      if (report.breakdown.byVendor) {
        csvData.push(['Vendor Breakdown']);
        csvData.push(['Vendor', 'Total Commissions', 'Order Count', 'Total Order Value']);
        Object.entries(report.breakdown.byVendor).forEach(([vendorId, data]: [string, any]) => {
          csvData.push([
            data.vendorName || vendorId,
            data.totalCommissions,
            data.orderCount,
            data.totalOrderValue,
          ]);
        });
        csvData.push([]);
      }

      // Rule breakdown
      if (report.breakdown.byRule) {
        csvData.push(['Rule Breakdown']);
        csvData.push(['Rule', 'Type', 'Total Commissions', 'Order Count']);
        Object.entries(report.breakdown.byRule).forEach(([ruleId, data]: [string, any]) => {
          csvData.push([
            data.ruleName || ruleId,
            data.ruleType,
            data.totalCommissions,
            data.orderCount,
          ]);
        });
      }
    }

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `commission-report-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast({
      title: 'Success',
      description: 'Report exported successfully',
      type: 'success',
    });
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
    <div className="space-y-6">
      {/* Report Generation Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileBarChart className="h-5 w-5" />
            Generate Commission Report
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date *
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={e => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date *
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={e => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vendor ID (Optional)
              </label>
              <input
                type="text"
                value={formData.vendorId || ''}
                onChange={e => setFormData(prev => ({ ...prev, vendorId: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="All vendors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category ID (Optional)
              </label>
              <input
                type="text"
                value={formData.categoryId || ''}
                onChange={e => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="All categories"
              />
            </div>
          </div>

          <div className="mt-4 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="includeBreakdown"
                checked={formData.includeBreakdown}
                onChange={e => setFormData(prev => ({ ...prev, includeBreakdown: e.target.checked }))}
              />
              <label htmlFor="includeBreakdown" className="text-sm text-gray-700">
                Include detailed breakdown
              </label>
            </div>

            <div className="flex gap-3 ml-auto">
              <GlowingButton
                variant="primary"
                onClick={handleGenerateReport}
                disabled={generateReportMutation.isPending}
              >
                {generateReportMutation.isPending && (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                )}
                Generate Report
              </GlowingButton>

              {report && (
                <GlowingButton
                  variant="secondary"
                  onClick={handleExportReport}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </GlowingButton>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Results */}
      {report && (
        <div className="space-y-6">
          {/* Report Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Report Summary
                {report.period && (
                  <span className="text-sm font-normal text-gray-500 ml-2">
                    {format(new Date(report.period.startDate), 'MMM dd, yyyy')} - 
                    {format(new Date(report.period.endDate), 'MMM dd, yyyy')}
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="bg-green-100 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(report.summary?.totalCommissions || 0)}
                  </p>
                  <p className="text-sm text-gray-600">Total Commissions</p>
                </div>

                <div className="text-center">
                  <div className="bg-blue-100 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-blue-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(report.summary?.totalOrderValue || 0)}
                  </p>
                  <p className="text-sm text-gray-600">Total Order Value</p>
                </div>

                <div className="text-center">
                  <div className="bg-purple-100 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                    <BarChart3 className="h-6 w-6 text-purple-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {(report.summary?.averageCommissionRate || 0).toFixed(2)}%
                  </p>
                  <p className="text-sm text-gray-600">Avg Commission Rate</p>
                </div>

                <div className="text-center">
                  <div className="bg-orange-100 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                    <Package className="h-6 w-6 text-orange-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {(report.summary?.orderCount || 0).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">Orders</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Breakdowns */}
          {report.breakdown && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Vendor Breakdown */}
              {report.breakdown.byVendor && Object.keys(report.breakdown.byVendor).length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building className="h-5 w-5" />
                      Top Vendors by Commission
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(report.breakdown.byVendor)
                        .sort(([, a], [, b]) => (b as any).totalCommissions - (a as any).totalCommissions)
                        .slice(0, 5)
                        .map(([vendorId, data]: [string, any]) => (
                          <div key={vendorId} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium text-gray-900">
                                {data.vendorName || vendorId}
                              </p>
                              <p className="text-sm text-gray-600">
                                {data.orderCount} orders
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-green-600">
                                {formatCurrency(data.totalCommissions)}
                              </p>
                              <p className="text-sm text-gray-600">
                                {formatCurrency(data.totalOrderValue)} total
                              </p>
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Rule Breakdown */}
              {report.breakdown.byRule && Object.keys(report.breakdown.byRule).length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Commission Rules Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(report.breakdown.byRule)
                        .sort(([, a], [, b]) => (b as any).totalCommissions - (a as any).totalCommissions)
                        .map(([ruleId, data]: [string, any]) => (
                          <div key={ruleId} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium text-gray-900">
                                {data.ruleName || ruleId}
                              </p>
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-0.5 text-xs rounded-full capitalize ${
                                  data.ruleType === 'percentage'
                                    ? 'bg-blue-100 text-blue-800'
                                    : data.ruleType === 'fixed'
                                    ? 'bg-purple-100 text-purple-800'
                                    : 'bg-green-100 text-green-800'
                                }`}>
                                  {data.ruleType}
                                </span>
                                <span className="text-sm text-gray-600">
                                  {data.orderCount} orders
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-green-600">
                                {formatCurrency(data.totalCommissions)}
                              </p>
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!report && !generateReportMutation.isPending && (
        <Card>
          <CardContent className="text-center py-12">
            <FileBarChart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">
              Configure your report parameters above and click "Generate Report" to see detailed commission analytics.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}