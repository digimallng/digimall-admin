'use client';

/**
 * Generate Report Modal Component
 *
 * Comprehensive modal for generating custom reports with multiple formats,
 * date ranges, and report types. Supports scheduling and export options.
 */

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { reportsCompleteService } from '@/lib/api/services/reports-complete.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, FileDown, Calendar, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { ReportPreviewModal } from './ReportPreviewModal';
import type { ReportType, ReportFormat, ReportPeriod } from '@/lib/api/types/reports.types';

interface GenerateReportModalProps {
  open: boolean;
  onClose: () => void;
}

export function GenerateReportModal({ open, onClose }: GenerateReportModalProps) {
  const [reportType, setReportType] = useState<ReportType>('sales');
  const [format, setFormat] = useState<ReportFormat>('pdf');
  const [period, setPeriod] = useState<ReportPeriod>('month');
  const [customDateRange, setCustomDateRange] = useState({
    startDate: '',
    endDate: '',
  });
  const [schedule, setSchedule] = useState(false);
  const [scheduleFrequency, setScheduleFrequency] = useState<'daily' | 'weekly' | 'monthly'>('monthly');
  const [showPreview, setShowPreview] = useState(false);

  // Generate report mutation
  const { mutate: generateReport, isPending } = useMutation({
    mutationFn: () => {
      const params = {
        type: reportType,
        format,
        period: customDateRange.startDate && customDateRange.endDate ? undefined : period,
        startDate: customDateRange.startDate || undefined,
        endDate: customDateRange.endDate || undefined,
      };

      return reportsCompleteService.generateReport(params);
    },
    onSuccess: (data) => {
      toast.success('Report generated successfully');

      // Trigger download
      const link = document.createElement('a');
      link.href = data.data.downloadUrl;
      link.download = data.data.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      handleClose();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to generate report');
    },
  });

  const handleClose = () => {
    setReportType('sales');
    setFormat('pdf');
    setPeriod('month');
    setCustomDateRange({ startDate: '', endDate: '' });
    setSchedule(false);
    setScheduleFrequency('monthly');
    setShowPreview(false);
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (customDateRange.startDate && customDateRange.endDate) {
      const start = new Date(customDateRange.startDate);
      const end = new Date(customDateRange.endDate);

      if (end <= start) {
        toast.error('End date must be after start date');
        return;
      }
    }

    generateReport();
  };

  const handlePreview = () => {
    // Validation
    if (customDateRange.startDate && customDateRange.endDate) {
      const start = new Date(customDateRange.startDate);
      const end = new Date(customDateRange.endDate);

      if (end <= start) {
        toast.error('End date must be after start date');
        return;
      }
    }

    setShowPreview(true);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Generate Report</DialogTitle>
          <DialogDescription>
            Create a custom report with your preferred format and parameters
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Report Type */}
          <div className="space-y-2">
            <Label htmlFor="reportType">Report Type *</Label>
            <Select
              value={reportType}
              onValueChange={(value) => setReportType(value as ReportType)}
            >
              <SelectTrigger id="reportType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sales">Sales Report</SelectItem>
                <SelectItem value="revenue">Revenue Report</SelectItem>
                <SelectItem value="products">Products Report</SelectItem>
                <SelectItem value="vendors">Vendors Report</SelectItem>
                <SelectItem value="customers">Customers Report</SelectItem>
                <SelectItem value="orders">Orders Report</SelectItem>
                <SelectItem value="analytics">Analytics Report</SelectItem>
                <SelectItem value="financial">Financial Report</SelectItem>
                <SelectItem value="performance">Performance Report</SelectItem>
                <SelectItem value="inventory">Inventory Report</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Select the type of report you want to generate
            </p>
          </div>

          {/* Report Format */}
          <div className="space-y-2">
            <Label htmlFor="format">Export Format *</Label>
            <Select value={format} onValueChange={(value) => setFormat(value as ReportFormat)}>
              <SelectTrigger id="format">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF Document</SelectItem>
                <SelectItem value="excel">Excel Spreadsheet</SelectItem>
                <SelectItem value="csv">CSV File</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Choose how you want to export the report
            </p>
          </div>

          {/* Period Selection */}
          <div className="space-y-2">
            <Label htmlFor="period">Time Period</Label>
            <Select
              value={period}
              onValueChange={(value) => {
                setPeriod(value as ReportPeriod);
                if (value !== 'custom') {
                  setCustomDateRange({ startDate: '', endDate: '' });
                }
              }}
            >
              <SelectTrigger id="period">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Custom Date Range */}
          {period === 'custom' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={customDateRange.startDate}
                  onChange={(e) =>
                    setCustomDateRange((prev) => ({ ...prev, startDate: e.target.value }))
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">End Date *</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={customDateRange.endDate}
                  onChange={(e) =>
                    setCustomDateRange((prev) => ({ ...prev, endDate: e.target.value }))
                  }
                  required
                />
              </div>
            </div>
          )}

          {/* Schedule Report */}
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-0.5">
                <Label>Schedule Report</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically generate this report on a recurring basis
                </p>
              </div>
              <Switch checked={schedule} onCheckedChange={setSchedule} />
            </div>

            {schedule && (
              <div className="space-y-2 pl-4">
                <Label htmlFor="frequency">Frequency</Label>
                <Select
                  value={scheduleFrequency}
                  onValueChange={(value) => setScheduleFrequency(value as 'daily' | 'weekly' | 'monthly')}
                >
                  <SelectTrigger id="frequency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Report will be emailed to your registered email address
                </p>
              </div>
            )}
          </div>

          {/* Report Preview Info */}
          <div className="p-4 bg-muted/50 rounded-lg space-y-2">
            <Label>Report Summary</Label>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-muted-foreground">Type</p>
                <p className="font-medium capitalize">{reportType}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Format</p>
                <p className="font-medium uppercase">{format}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Period</p>
                <p className="font-medium capitalize">
                  {period === 'custom' && customDateRange.startDate && customDateRange.endDate
                    ? `${customDateRange.startDate} to ${customDateRange.endDate}`
                    : period}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Schedule</p>
                <p className="font-medium">
                  {schedule ? `${scheduleFrequency} ` : 'One-time'}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isPending}>
              Cancel
            </Button>
            <Button type="button" variant="secondary" onClick={handlePreview}>
              <Eye className="mr-2 h-4 w-4" />
              Preview
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FileDown className="mr-2 h-4 w-4" />
                  Generate Report
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>

      {/* Preview Modal */}
      <ReportPreviewModal
        open={showPreview}
        onClose={() => setShowPreview(false)}
        reportType={reportType}
        format={format}
        period={period}
        startDate={customDateRange.startDate}
        endDate={customDateRange.endDate}
      />
    </Dialog>
  );
}
