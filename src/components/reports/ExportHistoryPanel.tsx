'use client';

/**
 * Export History Panel Component
 *
 * Display history of generated reports and exports with download links,
 * filters, and search functionality.
 */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
import { Loader2, Download, FileText, Search, Filter, Calendar, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

interface ExportHistoryItem {
  id: string;
  reportType: string;
  format: string;
  period: string;
  createdAt: string;
  downloadUrl: string;
  filename: string;
  size?: number;
  status: 'completed' | 'failed' | 'processing';
}

export function ExportHistoryPanel() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterFormat, setFilterFormat] = useState<string>('all');

  // Mock data - in production, this would come from the API
  const mockHistory: ExportHistoryItem[] = [
    {
      id: '1',
      reportType: 'Sales Report',
      format: 'pdf',
      period: 'This Month',
      createdAt: new Date().toISOString(),
      downloadUrl: '#',
      filename: 'sales-report-2025-01.pdf',
      size: 2456789,
      status: 'completed',
    },
    {
      id: '2',
      reportType: 'Revenue Report',
      format: 'excel',
      period: 'Last Week',
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      downloadUrl: '#',
      filename: 'revenue-report-week-50.xlsx',
      size: 1234567,
      status: 'completed',
    },
    {
      id: '3',
      reportType: 'Products Report',
      format: 'csv',
      period: 'This Quarter',
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      downloadUrl: '#',
      filename: 'products-report-q4-2024.csv',
      size: 876543,
      status: 'completed',
    },
  ];

  const { data: historyData, isLoading } = useQuery({
    queryKey: ['export-history', searchQuery, filterType, filterFormat],
    queryFn: async () => {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      return mockHistory;
    },
  });

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  const handleDownload = (item: ExportHistoryItem) => {
    // Trigger download
    const link = document.createElement('a');
    link.href = item.downloadUrl;
    link.download = item.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredHistory = (historyData || []).filter((item) => {
    const matchesSearch = item.reportType.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.filename.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || item.reportType.includes(filterType);
    const matchesFormat = filterFormat === 'all' || item.format === filterFormat;

    return matchesSearch && matchesType && matchesFormat;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold">Export History</h2>
        <p className="text-sm text-muted-foreground mt-1">
          View and download your previously generated reports
        </p>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search reports..."
                className="pl-10"
              />
            </div>
          </div>

          {/* Report Type Filter */}
          <div className="space-y-2">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger>
                <SelectValue placeholder="All Report Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Report Types</SelectItem>
                <SelectItem value="Sales">Sales Reports</SelectItem>
                <SelectItem value="Revenue">Revenue Reports</SelectItem>
                <SelectItem value="Products">Products Reports</SelectItem>
                <SelectItem value="Vendors">Vendors Reports</SelectItem>
                <SelectItem value="Orders">Orders Reports</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Format Filter */}
          <div className="space-y-2">
            <Select value={filterFormat} onValueChange={setFilterFormat}>
              <SelectTrigger>
                <SelectValue placeholder="All Formats" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Formats</SelectItem>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="excel">Excel</SelectItem>
                <SelectItem value="csv">CSV</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* History Table */}
      {isLoading ? (
        <Card className="p-12">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </Card>
      ) : filteredHistory.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No export history found</h3>
            <p className="text-sm text-muted-foreground">
              {searchQuery || filterType !== 'all' || filterFormat !== 'all'
                ? 'Try adjusting your filters'
                : 'Generate your first report to see it here'}
            </p>
          </div>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Report</TableHead>
                  <TableHead>Format</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHistory.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{item.reportType}</p>
                          <p className="text-xs text-muted-foreground">{item.filename}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{item.format.toUpperCase()}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {item.period}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(item.createdAt), 'MMM d, yyyy h:mm a')}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatFileSize(item.size)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          item.status === 'completed'
                            ? 'default'
                            : item.status === 'failed'
                            ? 'destructive'
                            : 'secondary'
                        }
                      >
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownload(item)}
                          disabled={item.status !== 'completed'}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {/* Summary */}
      {filteredHistory.length > 0 && (
        <div className="text-sm text-muted-foreground text-center">
          Showing {filteredHistory.length} {filteredHistory.length === 1 ? 'export' : 'exports'}
        </div>
      )}
    </div>
  );
}
