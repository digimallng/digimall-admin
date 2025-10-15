'use client';

import { useState } from 'react';
import {
  useEscrows,
  useEscrowStatistics,
  useExpiringSoonEscrows,
  useDisputedEscrows,
} from '@/lib/hooks/use-escrow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import {
  Shield,
  AlertTriangle,
  Clock,
  RefreshCw,
  Search,
  DollarSign,
  CheckCircle,
  XCircle,
  Eye,
} from 'lucide-react';
import { format } from 'date-fns';
import type { EscrowStatus, EscrowAccount } from '@/lib/api/types/escrow.types';
import { EscrowDetailModal } from '@/components/modals/EscrowDetailModal';

export default function EscrowPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedEscrow, setSelectedEscrow] = useState<EscrowAccount | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  // Fetch data using new hooks
  const {
    data: escrowsData,
    isLoading: escrowsLoading,
    error: escrowsError,
    refetch: refetchEscrows,
  } = useEscrows({
    page: currentPage,
    limit: 20,
    status: filterStatus !== 'all' ? (filterStatus as EscrowStatus) : undefined,
    searchTerm: searchTerm || undefined,
  });

  const {
    data: statistics,
    isLoading: statsLoading,
  } = useEscrowStatistics();

  const {
    data: expiringSoonData,
  } = useExpiringSoonEscrows({ hours: 24, limit: 5 });

  const {
    data: disputedData,
  } = useDisputedEscrows({ limit: 5 });

  const escrows = escrowsData?.data || [];
  const total = escrowsData?.total || 0;
  const expiringSoon = expiringSoonData?.data || [];
  const disputed = disputedData?.data || [];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount / 100); // Convert from kobo to naira
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'released':
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle className="w-3 h-3 mr-1" />
            Released
          </Badge>
        );
      case 'refunded':
        return (
          <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">
            <XCircle className="w-3 h-3 mr-1" />
            Refunded
          </Badge>
        );
      case 'disputed':
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Disputed
          </Badge>
        );
      case 'funded':
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            <DollarSign className="w-3 h-3 mr-1" />
            Funded
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">
            <Clock className="w-3 h-3 mr-1" />
            {status}
          </Badge>
        );
    }
  };

  if (escrowsError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Escrow Management</h1>
          <p className="text-muted-foreground">Monitor and manage platform escrow accounts</p>
        </div>
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Shield className="mx-auto h-12 w-12 text-destructive mb-4" />
              <p className="text-lg font-medium mb-4">Failed to load escrow data</p>
              <Button onClick={() => refetchEscrows()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Escrow Management</h1>
          <p className="text-muted-foreground">Monitor and manage platform escrow accounts</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetchEscrows()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Escrows</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold">{statistics?.totalEscrows || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">All time</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Amount</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">{formatCurrency(statistics?.totalAmount || 0)}</div>
                <p className="text-xs text-muted-foreground mt-1">In escrow</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Funded</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold">{statistics?.statusBreakdown?.funded || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">Active</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Disputed</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold">{statistics?.disputedEscrows || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">Needs attention</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Expiring Soon</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold">{statistics?.expiringInNext24Hours || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">Next 24 hours</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {expiringSoon.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-orange-800 flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>Escrows Expiring in Next 24 Hours</span>
              <Badge variant="outline" className="text-orange-600 border-orange-300">
                {expiringSoon.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {expiringSoon.slice(0, 3).map((escrow) => (
                <div key={escrow._id} className="flex items-center justify-between text-sm">
                  <div>
                    <div className="font-medium text-orange-900">{escrow.escrowId}</div>
                    <div className="text-orange-700 text-xs">
                      {escrow.customerId.firstName} {escrow.customerId.lastName}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{formatCurrency(escrow.amount)}</div>
                    <div className="text-xs text-orange-700">
                      {escrow.expiresAt && format(new Date(escrow.expiresAt), 'MMM dd, HH:mm')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filter Escrows</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by escrow ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="funded">Funded</SelectItem>
                <SelectItem value="released">Released</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
                <SelectItem value="disputed">Disputed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Escrows Table */}
      <Card>
        <CardContent className="p-0">
          {escrowsLoading ? (
            <div className="p-6 space-y-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex items-center gap-4">
                  <Skeleton className="h-12 w-32" />
                  <Skeleton className="h-12 flex-1" />
                  <Skeleton className="h-12 w-24" />
                  <Skeleton className="h-12 w-24" />
                </div>
              ))}
            </div>
          ) : escrows.length === 0 ? (
            <div className="p-12 text-center">
              <Shield className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-2">No escrows found</p>
              <p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Escrow ID</TableHead>
                      <TableHead>Order</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Vendor</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Expires</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {escrows.map((escrow) => (
                      <TableRow key={escrow._id}>
                        <TableCell className="font-medium">{escrow.escrowId}</TableCell>
                        <TableCell>{escrow.orderId.orderNumber}</TableCell>
                        <TableCell>
                          {escrow.customerId.firstName} {escrow.customerId.lastName}
                        </TableCell>
                        <TableCell>{escrow.vendorId.businessInfo.businessName}</TableCell>
                        <TableCell className="font-medium">{formatCurrency(escrow.amount)}</TableCell>
                        <TableCell>{getStatusBadge(escrow.status)}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {escrow.expiresAt ? format(new Date(escrow.expiresAt), 'MMM dd, yyyy') : '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedEscrow(escrow);
                              setDetailModalOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex items-center justify-between p-4 border-t">
                <p className="text-sm text-muted-foreground">
                  Showing {(currentPage - 1) * 20 + 1} to {Math.min(currentPage * 20, total)} of {total} results
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1 || escrowsLoading}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => prev + 1)}
                    disabled={currentPage === (escrowsData?.totalPages || 1) || escrowsLoading}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Escrow Detail Modal */}
      <EscrowDetailModal
        escrow={selectedEscrow}
        open={detailModalOpen}
        onOpenChange={(open) => {
          setDetailModalOpen(open);
          if (!open) {
            setSelectedEscrow(null);
          }
        }}
      />
    </div>
  );
}
