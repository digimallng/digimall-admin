'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { EmptyState } from '@/components/ui/empty-state';
import { useProducts, useProductStatistics, useApproveRejectProduct, useBulkProductAction } from '@/lib/api/hooks/use-products';
import type { Product } from '@/lib/api/types';
import {
  Search,
  Filter,
  Package,
  Download,
  Eye,
  ShoppingCart,
  Plus,
  CheckCircle,
  AlertTriangle,
  Check,
  X,
  Star,
  Trash2,
  RefreshCw,
  MoreVertical,
  Edit,
  Archive,
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import { ExportService } from '@/services/export.service';

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterApprovalStatus, setFilterApprovalStatus] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [showExportDropdown, setShowExportDropdown] = useState(false);

  const limit = 20;

  // Fetch products using React Query
  const {
    data: productsData,
    isLoading: productsLoading,
    error: productsError,
    refetch: refetchProducts,
  } = useProducts({
    searchTerm: searchTerm || undefined,
    status: filterStatus === 'all' ? undefined : (filterStatus as 'active' | 'inactive' | 'archived'),
    approvalStatus: filterApprovalStatus === 'all' ? undefined : (filterApprovalStatus as 'pending' | 'approved' | 'rejected'),
    page,
    limit,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  // Fetch statistics using React Query
  const {
    data: statistics,
    isLoading: statsLoading,
    error: statsError,
    refetch: refetchStats,
  } = useProductStatistics();

  const products = productsData?.data || [];
  const total = productsData?.meta?.total || 0;
  const isLoading = productsLoading || statsLoading;
  const hasError = productsError || statsError;

  // Debug logging (can be removed in production)
  if (process.env.NODE_ENV === 'development') {
    console.log('=== Products Page Debug Info ===');
    console.log('Products Data:', {
      productsData,
      products,
      productsLength: products.length,
      total,
      productsLoading,
      productsError: productsError ? {
        message: productsError.message,
        name: productsError.name,
      } : null,
    });
    console.log('Statistics Data:', {
      statistics,
      statsLoading,
      statsError: statsError ? {
        message: statsError.message,
        name: statsError.name,
      } : null,
    });
    console.log('================================');
  }

  // Mutations
  const approveRejectMutation = useApproveRejectProduct();
  const bulkActionMutation = useBulkProductAction();

  const handleRefresh = () => {
    refetchProducts();
    refetchStats();
  };

  const handleProductAction = async (action: string, productId: string, productName: string) => {
    try {
      switch (action) {
        case 'approve':
          await approveRejectMutation.mutateAsync({
            id: productId,
            data: { status: 'approved', sendNotification: true },
          });
          toast.success(`Product "${productName}" approved successfully`);
          break;
        case 'reject':
          await approveRejectMutation.mutateAsync({
            id: productId,
            data: { status: 'rejected', reason: 'Admin action', sendNotification: true },
          });
          toast.success(`Product "${productName}" rejected successfully`);
          break;
        case 'feature':
        case 'unfeature':
        case 'activate':
        case 'deactivate':
        case 'archive':
        case 'delete':
          if (action === 'delete' && !window.confirm(`Are you sure you want to delete "${productName}"?`)) {
            return;
          }
          await bulkActionMutation.mutateAsync({
            productIds: [productId],
            action: action as any,
          });
          toast.success(`Product "${productName}" ${action}d successfully`);
          break;
        default:
          return;
      }
    } catch (err) {
      toast.error(`Failed to ${action} product. Please try again.`);
      console.error(`Error ${action}ing product:`, err);
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedProducts.length === 0) {
      toast.error('Please select products first');
      return;
    }

    try {
      if (action === 'delete' && !window.confirm(`Delete ${selectedProducts.length} selected products?`)) {
        return;
      }

      await bulkActionMutation.mutateAsync({
        productIds: selectedProducts,
        action: action as any,
        reason: 'Bulk admin action',
      });

      toast.success(`${selectedProducts.length} products ${action}d successfully`);
      setSelectedProducts([]);
    } catch (err) {
      toast.error(`Bulk ${action} failed. Please try again.`);
      console.error(`Bulk ${action} error:`, err);
    }
  };

  const toggleProductSelection = (productId: string) => {
    setSelectedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const toggleSelectAll = () => {
    setSelectedProducts(prev =>
      prev.length === products.length
        ? []
        : products.map(p => p.id)
    );
  };

  const handleExport = async (exportFormat: 'csv' | 'excel' = 'csv') => {
    try {
      if (!products.length) {
        toast.error('No products to export');
        return;
      }

      const exportData = products.map(product => ({
        'Product ID': product.id,
        'Product Name': product.name,
        'SKU': product.sku || '',
        'Vendor': product.vendor?.businessName || '',
        'Category': product.category?.name || '',
        'Price': product.price,
        'Currency': 'NGN',
        'Stock': product.stock,
        'Status': product.status,
        'Approval Status': product.approvalStatus,
        'Rating': product.rating || 0,
        'Review Count': product.reviewCount || 0,
        'Sales': product.sales || 0,
        'Views': product.views || 0,
        'Created At': format(new Date(product.createdAt), 'yyyy-MM-dd HH:mm:ss'),
        'Updated At': format(new Date(product.updatedAt), 'yyyy-MM-dd HH:mm:ss'),
      }));

      ExportService.exportData(exportData, exportFormat, `products-${searchTerm ? 'filtered-' : ''}export`, {
        sheetName: 'Products',
        includeTimestamp: true
      });

      toast.success(`Exported ${exportData.length} products to ${exportFormat.toUpperCase()}`);
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Export failed. Please try again.');
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">{status}</Badge>;
      case 'inactive':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">{status}</Badge>;
      case 'archived':
        return <Badge variant="secondary">{status}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getApprovalStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">{status}</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">{status}</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">{status}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const totalPages = Math.ceil(total / limit);

  if (isLoading && !statistics) {
    return (
      <div className='space-y-6'>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products Management</h1>
          <p className="text-muted-foreground">Manage product listings and inventory</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (hasError) {
    const errorDetails = productsError || statsError;
    const errorMessage = errorDetails instanceof Error ? errorDetails.message : String(errorDetails);

    return (
      <div className='space-y-6'>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products Management</h1>
          <p className="text-muted-foreground">Manage product listings and inventory</p>
        </div>
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">
                Failed to load product data
              </h3>
              <p className="text-muted-foreground mb-2">
                {errorMessage || 'An error occurred'}
              </p>
              {productsError && (
                <p className="text-xs text-muted-foreground mb-2">
                  Products API: {productsError instanceof Error ? productsError.message : 'Unknown error'}
                </p>
              )}
              {statsError && (
                <p className="text-xs text-muted-foreground mb-4">
                  Statistics API: {statsError instanceof Error ? statsError.message : 'Unknown error'}
                </p>
              )}
              <div className="mt-4">
                <Button onClick={handleRefresh}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products Management</h1>
          <p className="text-muted-foreground">Manage product listings and inventory</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleExport('csv')}>
                <Download className="w-4 h-4 mr-2" />
                Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('excel')}>
                <Download className="w-4 h-4 mr-2" />
                Export as Excel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-5'>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Products
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics?.totalProducts ?? 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                All products
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Products
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics?.activeProducts ?? 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Currently active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending Approval
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics?.pendingApproval ?? 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Awaiting review
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Views
              </CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(statistics?.totalViews ?? 0)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Product views
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Sales
              </CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(statistics?.totalSales ?? 0)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Units sold
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filter Products</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
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
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterApprovalStatus} onValueChange={setFilterApprovalStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by approval" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Approvals</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {selectedProducts.length > 0 && (
            <div className="flex items-center gap-2 mt-4 pt-4 border-t">
              <span className="text-sm text-muted-foreground">
                {selectedProducts.length} selected
              </span>
              <Button
                size="sm"
                variant="outline"
                className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                onClick={() => handleBulkAction('approve')}
                disabled={bulkActionMutation.isPending}
              >
                <Check className="h-4 w-4 mr-1" />
                Approve
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100"
                onClick={() => handleBulkAction('reject')}
                disabled={bulkActionMutation.isPending}
              >
                <X className="h-4 w-4 mr-1" />
                Reject
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                onClick={() => handleBulkAction('deactivate')}
                disabled={bulkActionMutation.isPending}
              >
                Deactivate
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBulkAction('delete')}
                disabled={bulkActionMutation.isPending}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardContent className="p-0">
          {!productsLoading && products.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={<Package className="h-6 w-6 text-muted-foreground" />}
                title="No products found"
                description={
                  searchTerm || filterStatus !== 'all' || filterApprovalStatus !== 'all'
                    ? "No products match your current filters. Try adjusting your search or filters."
                    : "There are no products in the system yet. Products will appear here once vendors start adding them."
                }
                action={
                  searchTerm || filterStatus !== 'all' || filterApprovalStatus !== 'all' ? (
                    <Button
                      onClick={() => {
                        setSearchTerm('');
                        setFilterStatus('all');
                        setFilterApprovalStatus('all');
                        setPage(1);
                      }}
                    >
                      Clear Filters
                    </Button>
                  ) : null
                }
              />
            </div>
          ) : (
            <>
              <div className='overflow-x-auto'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedProducts.length === products.length && products.length > 0}
                          onCheckedChange={toggleSelectAll}
                        />
                      </TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Vendor</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Approval</TableHead>
                      <TableHead>Views</TableHead>
                      <TableHead>Sales</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map(product => (
                      <TableRow key={product.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedProducts.includes(product.id)}
                            onCheckedChange={() => toggleProductSelection(product.id)}
                          />
                        </TableCell>
                        <TableCell>
                          <div className='flex items-center gap-3'>
                            {product.images?.[0] ? (
                              <img
                                src={product.images[0].url}
                                alt={product.name}
                                className='h-10 w-10 rounded-lg object-cover'
                              />
                            ) : (
                              <div className='h-10 w-10 rounded-lg bg-muted flex items-center justify-center'>
                                <Package className='h-5 w-5 text-muted-foreground' />
                              </div>
                            )}
                            <div>
                              <div className='font-medium'>{product.name}</div>
                              <div className='text-xs text-muted-foreground'>SKU: {product.sku}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{product.vendor?.businessName || 'N/A'}</TableCell>
                        <TableCell className="text-muted-foreground">{product.category?.name || 'N/A'}</TableCell>
                        <TableCell className="font-medium">{formatCurrency(product.price)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <span>{product.stock}</span>
                            {product.stock <= (product.lowStockThreshold || 5) && (
                              <AlertTriangle className='h-3 w-3 text-orange-500' />
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(product.status)}
                        </TableCell>
                        <TableCell>
                          {getApprovalStatusBadge(product.approvalStatus)}
                        </TableCell>
                        <TableCell className="text-muted-foreground">{formatNumber(product.views || 0)}</TableCell>
                        <TableCell className="text-muted-foreground">{formatNumber(product.sales || 0)}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {product.approvalStatus === 'pending' && (
                                <>
                                  <DropdownMenuItem
                                    onClick={() => handleProductAction('approve', product.id, product.name)}
                                    disabled={approveRejectMutation.isPending}
                                  >
                                    <Check className="h-4 w-4 mr-2" />
                                    Approve
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleProductAction('reject', product.id, product.name)}
                                    disabled={approveRejectMutation.isPending}
                                  >
                                    <X className="h-4 w-4 mr-2" />
                                    Reject
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                </>
                              )}
                              {product.status === 'active' && (
                                <DropdownMenuItem
                                  onClick={() => handleProductAction('deactivate', product.id, product.name)}
                                  disabled={bulkActionMutation.isPending}
                                >
                                  <X className="h-4 w-4 mr-2" />
                                  Deactivate
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                onClick={() => handleProductAction('archive', product.id, product.name)}
                                disabled={bulkActionMutation.isPending}
                              >
                                <Archive className="h-4 w-4 mr-2" />
                                Archive
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleProductAction('delete', product.id, product.name)}
                                disabled={bulkActionMutation.isPending}
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {products.length > 0 && (
                <div className='flex items-center justify-between p-4 border-t'>
                  <p className='text-sm text-muted-foreground'>
                    Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, total)} of {total} results
                  </p>
                  <div className='flex gap-2'>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(prev => Math.max(1, prev - 1))}
                      disabled={page === 1 || productsLoading}
                    >
                      Previous
                    </Button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = i + 1;
                      return (
                        <Button
                          key={pageNum}
                          variant={page === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => setPage(pageNum)}
                          disabled={productsLoading}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={page === totalPages || productsLoading}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
