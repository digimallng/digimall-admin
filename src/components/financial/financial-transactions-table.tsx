'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/button';
import { usePayments } from '@/lib/hooks/useFinancial';
import { formatCurrency, formatDate } from '@/lib/utils/formatters';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Download, Eye, RefreshCw } from 'lucide-react';

export function FinancialTransactionsTable() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [methodFilter, setMethodFilter] = useState<string>('all');

  const { data, isLoading, refetch } = usePayments({
    page,
    limit: 20,
    search: search || undefined,
    filter: {
      ...(statusFilter !== 'all' && { status: statusFilter }),
      ...(methodFilter !== 'all' && { method: methodFilter }),
    }
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: 'outline', className: 'border-yellow-300 text-yellow-700 bg-yellow-50' },
      processing: { variant: 'outline', className: 'border-blue-300 text-blue-700 bg-blue-50' },
      completed: { variant: 'outline', className: 'border-green-300 text-green-700 bg-green-50' },
      failed: { variant: 'outline', className: 'border-red-300 text-red-700 bg-red-50' },
      cancelled: { variant: 'outline', className: 'border-gray-300 text-gray-700 bg-gray-50' },
      refunded: { variant: 'outline', className: 'border-purple-300 text-purple-700 bg-purple-50' },
    } as const;

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    
    return (
      <Badge variant={config.variant} className={config.className}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getMethodBadge = (method: string) => {
    const methodConfig = {
      paystack: { icon: '💳', color: 'bg-blue-100 text-blue-800' },
      bank_transfer: { icon: '🏦', color: 'bg-green-100 text-green-800' },
      wallet: { icon: '👛', color: 'bg-purple-100 text-purple-800' },
      crypto: { icon: '₿', color: 'bg-orange-100 text-orange-800' },
    } as const;

    const config = methodConfig[method as keyof typeof methodConfig] || { icon: '💳', color: 'bg-gray-100 text-gray-800' };

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <span>{config.icon}</span>
        {method.replace('_', ' ').charAt(0).toUpperCase() + method.replace('_', ' ').slice(1)}
      </span>
    );
  };

  return (
    <Card className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Payment Transactions</h3>
        <div className="flex gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button size="sm" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex-1 min-w-64">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by reference, customer, or vendor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
          <option value="cancelled">Cancelled</option>
          <option value="refunded">Refunded</option>
        </select>

        <select
          value={methodFilter}
          onChange={(e) => setMethodFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Methods</option>
          <option value="paystack">Paystack</option>
          <option value="bank_transfer">Bank Transfer</option>
          <option value="wallet">Wallet</option>
          <option value="crypto">Crypto</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-medium text-gray-700">Reference</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">Amount</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">Method</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">Customer</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">Date</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              // Loading skeleton
              [...Array(5)].map((_, i) => (
                <tr key={i} className="border-b border-gray-100">
                  <td className="py-4 px-4">
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="h-6 w-20 bg-gray-200 rounded animate-pulse"></div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
                  </td>
                </tr>
              ))
            ) : data?.data.length ? (
              data.data.map((transaction) => (
                <tr key={transaction.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div className="font-mono text-sm text-blue-600">
                      {transaction.reference}
                    </div>
                    {transaction.providerReference && (
                      <div className="text-xs text-gray-500 mt-1">
                        Provider: {transaction.providerReference}
                      </div>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    <div className="font-semibold">
                      {formatCurrency(transaction.amount, transaction.currency)}
                    </div>
                    <div className="text-xs text-gray-500 capitalize">{transaction.type}</div>
                  </td>
                  <td className="py-4 px-4">
                    {getMethodBadge(transaction.method)}
                  </td>
                  <td className="py-4 px-4">
                    {getStatusBadge(transaction.status)}
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-sm">{transaction.customerId}</div>
                    <div className="text-xs text-gray-500">Vendor: {transaction.vendorId}</div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-sm">{formatDate(transaction.createdAt)}</div>
                    {transaction.processedAt && (
                      <div className="text-xs text-gray-500">
                        Processed: {formatDate(transaction.processedAt)}
                      </div>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1"
                    >
                      <Eye className="w-3 h-3" />
                      View
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="py-8 text-center text-gray-500">
                  No transactions found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {data?.pagination && (
        <div className="flex justify-between items-center mt-6">
          <div className="text-sm text-gray-600">
            Showing {((data.pagination.page - 1) * data.pagination.limit) + 1} to{' '}
            {Math.min(data.pagination.page * data.pagination.limit, data.pagination.total)} of{' '}
            {data.pagination.total} results
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={page >= data.pagination.totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}