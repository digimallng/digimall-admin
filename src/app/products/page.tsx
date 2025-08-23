'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatsCard } from '@/components/ui/StatsCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { productService, type Product, type ProductStats, type ProductQuery } from '@/lib/api/services';
import {
  Search,
  Filter,
  MoreVertical,
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
  StarOff,
  Trash2,
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<ProductStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const limit = 20;

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const query: ProductQuery = {
        search: searchTerm || undefined,
        status: filterStatus === 'all' ? undefined : filterStatus,
        page,
        limit,
        sortBy: 'createdAt',
        sortOrder: 'DESC',
      };
      
      const [productsData, statsData] = await Promise.all([
        productService.findAll(query),
        productService.getStats(),
      ]);
      
      setProducts(productsData.products);
      setTotal(productsData.total);
      setStats(statsData);
    } catch (err) {
      setError('Failed to load products. Please try again.');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [searchTerm, filterStatus, page]);

  const handleProductAction = async (action: string, productId: string, productName: string) => {
    try {
      setActionLoading(productId);
      
      switch (action) {
        case 'approve':
          await productService.approveProduct(productId);
          toast.success(`Product "${productName}" approved successfully`);
          break;
        case 'suspend':
          await productService.suspendProduct(productId, 'Admin action');
          toast.success(`Product "${productName}" suspended successfully`);
          break;
        case 'feature':
          await productService.featureProduct(productId);
          toast.success(`Product "${productName}" featured successfully`);
          break;
        case 'unfeature':
          await productService.unfeatureProduct(productId);
          toast.success(`Product "${productName}" unfeatured successfully`);
          break;
        case 'delete':
          if (window.confirm(`Are you sure you want to delete "${productName}"?`)) {
            await productService.deleteProduct(productId);
            toast.success(`Product "${productName}" deleted successfully`);
          }
          break;
        default:
          return;
      }
      
      await fetchProducts();
    } catch (err) {
      toast.error(`Failed to ${action} product. Please try again.`);
      console.error(`Error ${action}ing product:`, err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedProducts.length === 0) {
      toast.error('Please select products first');
      return;
    }

    try {
      setActionLoading('bulk');
      
      switch (action) {
        case 'approve':
          await productService.bulkUpdateStatus(selectedProducts, 'ACTIVE');
          toast.success(`${selectedProducts.length} products approved`);
          break;
        case 'suspend':
          await productService.bulkUpdateStatus(selectedProducts, 'INACTIVE', 'Bulk admin action');
          toast.success(`${selectedProducts.length} products suspended`);
          break;
        case 'delete':
          if (window.confirm(`Delete ${selectedProducts.length} selected products?`)) {
            await productService.bulkDelete(selectedProducts);
            toast.success(`${selectedProducts.length} products deleted`);
          }
          break;
      }
      
      setSelectedProducts([]);
      await fetchProducts();
    } catch (err) {
      toast.error(`Bulk ${action} failed. Please try again.`);
      console.error(`Bulk ${action} error:`, err);
    } finally {
      setActionLoading(null);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'DRAFT':
        return 'bg-yellow-100 text-yellow-800';
      case 'INACTIVE':
        return 'bg-red-100 text-red-800';
      case 'OUT_OF_STOCK':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const totalPages = Math.ceil(total / limit);

  if (loading && !products.length) {
    return (
      <div className='space-y-8'>
        <PageHeader
          title='Products Management'
          description='Manage product listings and inventory'
          icon={Package}
        />
        <LoadingSpinner />;
      </div>
    );
  }

  if (error) {
    return (
      <div className='space-y-8'>
        <PageHeader
          title='Products Management'
          description='Manage product listings and inventory'
          icon={Package}
        />
        <ErrorMessage message={error} onRetry={fetchProducts} />
      </div>
    );
  }

  return (
    <div className='space-y-8'>
      <PageHeader
        title='Products Management'
        description='Manage product listings and inventory'
        icon={Package}
        actions={[
          {
            label: 'Export',
            icon: Download,
            variant: 'secondary',
          },
          {
            label: 'Add Product',
            icon: Plus,
            variant: 'primary',
          },
        ]}
      />

      <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5'>
        <StatsCard
          title='Total Products'
          value={stats?.total || 0}
          icon={Package}
          gradient='from-blue-500 to-purple-600'
          delay={0}
        />
        <StatsCard
          title='Active'
          value={stats?.active || 0}
          icon={CheckCircle}
          gradient='from-green-500 to-emerald-600'
          delay={100}
        />
        <StatsCard
          title='Draft'
          value={stats?.draft || 0}
          icon={AlertTriangle}
          gradient='from-yellow-500 to-orange-600'
          delay={150}
        />
        <StatsCard
          title='Total Views'
          value={stats?.totalViews || 0}
          icon={Eye}
          gradient='from-purple-500 to-pink-600'
          delay={200}
        />
        <StatsCard
          title='Total Sales'
          value={stats?.totalSales || 0}
          icon={ShoppingCart}
          gradient='from-orange-500 to-red-600'
          delay={300}
        />
      </div>

      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <div>
              <CardTitle>All Products</CardTitle>
              {selectedProducts.length > 0 && (
                <div className='mt-2 flex items-center gap-2'>
                  <span className='text-sm text-gray-600'>
                    {selectedProducts.length} selected
                  </span>
                  <button
                    onClick={() => handleBulkAction('approve')}
                    disabled={actionLoading === 'bulk'}
                    className='rounded bg-green-600 px-3 py-1 text-xs text-white hover:bg-green-700 disabled:opacity-50'
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleBulkAction('suspend')}
                    disabled={actionLoading === 'bulk'}
                    className='rounded bg-red-600 px-3 py-1 text-xs text-white hover:bg-red-700 disabled:opacity-50'
                  >
                    Suspend
                  </button>
                  <button
                    onClick={() => handleBulkAction('delete')}
                    disabled={actionLoading === 'bulk'}
                    className='rounded bg-gray-600 px-3 py-1 text-xs text-white hover:bg-gray-700 disabled:opacity-50'
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
            <div className='flex items-center gap-4'>
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400' />
                <input
                  type='search'
                  placeholder='Search products...'
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className='w-64 rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
                />
              </div>

              <div className='flex items-center gap-2'>
                <Filter className='h-4 w-4 text-gray-500' />
                <select
                  value={filterStatus}
                  onChange={e => setFilterStatus(e.target.value)}
                  className='rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
                >
                  <option value='all'>All Status</option>
                  <option value='ACTIVE'>Active</option>
                  <option value='DRAFT'>Draft</option>
                  <option value='INACTIVE'>Inactive</option>
                  <option value='OUT_OF_STOCK'>Out of Stock</option>
                </select>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className='overflow-x-auto'>
            <table className='w-full text-sm'>
              <thead>
                <tr className='border-b'>
                  <th className='pb-3 text-left font-medium text-gray-600'>
                    <input
                      type='checkbox'
                      checked={selectedProducts.length === products.length && products.length > 0}
                      onChange={toggleSelectAll}
                      className='rounded border-gray-300'
                    />
                  </th>
                  <th className='pb-3 text-left font-medium text-gray-600'>Product</th>
                  <th className='pb-3 text-left font-medium text-gray-600'>Vendor</th>
                  <th className='pb-3 text-left font-medium text-gray-600'>Category</th>
                  <th className='pb-3 text-left font-medium text-gray-600'>Price</th>
                  <th className='pb-3 text-left font-medium text-gray-600'>Stock</th>
                  <th className='pb-3 text-left font-medium text-gray-600'>Status</th>
                  <th className='pb-3 text-left font-medium text-gray-600'>Views</th>
                  <th className='pb-3 text-left font-medium text-gray-600'>Sales</th>
                  <th className='pb-3 text-left font-medium text-gray-600'>Actions</th>
                </tr>
              </thead>
              <tbody className='divide-y'>
                {products.map(product => (
                  <tr key={product.id} className='hover:bg-gray-50'>
                    <td className='py-4'>
                      <input
                        type='checkbox'
                        checked={selectedProducts.includes(product.id)}
                        onChange={() => toggleProductSelection(product.id)}
                        className='rounded border-gray-300'
                      />
                    </td>
                    <td className='py-4'>
                      <div className='flex items-center space-x-3'>
                        {product.images?.[0] && (
                          <img
                            src={product.images[0].url}
                            alt={product.name}
                            className='h-10 w-10 rounded-lg object-cover'
                          />
                        )}
                        <div>
                          <div className='font-medium text-gray-900'>{product.name}</div>
                          <div className='text-xs text-gray-500'>SKU: {product.sku}</div>
                          {product.isFeatured && (
                            <Star className='h-3 w-3 fill-yellow-400 text-yellow-400' />
                          )}
                        </div>
                      </div>
                    </td>
                    <td className='py-4'>
                      <div>
                        <div className='text-gray-900'>{product.vendor?.businessName}</div>
                        <div className='text-xs text-gray-500'>{product.vendor?.email}</div>
                      </div>
                    </td>
                    <td className='py-4 text-gray-600'>{product.category?.name}</td>
                    <td className='py-4 text-gray-900'>{formatCurrency(product.price)}</td>
                    <td className='py-4'>
                      <span className={`text-gray-600`}>
                        {product.trackInventory ? product.stockQuantity : '∞'}
                      </span>
                      {product.trackInventory && product.stockQuantity <= (product.lowStockThreshold || 5) && (
                        <AlertTriangle className='ml-1 inline h-3 w-3 text-orange-500' />
                      )}
                    </td>
                    <td className='py-4'>
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusColor(product.status)}`}>
                        {product.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className='py-4 text-gray-600'>{formatNumber(product.viewCount)}</td>
                    <td className='py-4 text-gray-600'>{formatNumber(product.soldQuantity)}</td>
                    <td className='py-4'>
                      <div className='flex items-center space-x-2'>
                        {product.status === 'DRAFT' && (
                          <button
                            onClick={() => handleProductAction('approve', product.id, product.name)}
                            disabled={actionLoading === product.id}
                            className='rounded p-1 text-green-600 hover:bg-green-100 disabled:opacity-50'
                            title='Approve Product'
                          >
                            <Check className='h-4 w-4' />
                          </button>
                        )}
                        {product.status === 'ACTIVE' && (
                          <button
                            onClick={() => handleProductAction('suspend', product.id, product.name)}
                            disabled={actionLoading === product.id}
                            className='rounded p-1 text-red-600 hover:bg-red-100 disabled:opacity-50'
                            title='Suspend Product'
                          >
                            <X className='h-4 w-4' />
                          </button>
                        )}
                        {product.isFeatured ? (
                          <button
                            onClick={() => handleProductAction('unfeature', product.id, product.name)}
                            disabled={actionLoading === product.id}
                            className='rounded p-1 text-yellow-600 hover:bg-yellow-100 disabled:opacity-50'
                            title='Remove from Featured'
                          >
                            <StarOff className='h-4 w-4' />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleProductAction('feature', product.id, product.name)}
                            disabled={actionLoading === product.id}
                            className='rounded p-1 text-yellow-600 hover:bg-yellow-100 disabled:opacity-50'
                            title='Add to Featured'
                          >
                            <Star className='h-4 w-4' />
                          </button>
                        )}
                        <button
                          onClick={() => handleProductAction('delete', product.id, product.name)}
                          disabled={actionLoading === product.id}
                          className='rounded p-1 text-red-600 hover:bg-red-100 disabled:opacity-50'
                          title='Delete Product'
                        >
                          <Trash2 className='h-4 w-4' />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className='mt-4 flex items-center justify-between'>
            <p className='text-sm text-gray-600'>
              Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, total)} of {total} results
            </p>
            <div className='flex gap-2'>
              <button
                onClick={() => setPage(prev => Math.max(1, prev - 1))}
                disabled={page === 1 || loading}
                className='rounded border border-gray-300 px-3 py-1 text-sm hover:bg-gray-50 disabled:opacity-50'
              >
                Previous
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    disabled={loading}
                    className={`rounded px-3 py-1 text-sm ${
                      page === pageNum
                        ? 'bg-blue-600 text-white'
                        : 'border border-gray-300 hover:bg-gray-50'
                    } disabled:opacity-50`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                disabled={page === totalPages || loading}
                className='rounded border border-gray-300 px-3 py-1 text-sm hover:bg-gray-50 disabled:opacity-50'
              >
                Next
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
