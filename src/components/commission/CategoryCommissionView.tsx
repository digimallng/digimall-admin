'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GlowingButton } from '@/components/ui/AnimatedCard';
import { 
  Search, 
  Package, 
  Loader2, 
  AlertCircle, 
  DollarSign,
  TrendingUp,
  Tag,
  Calendar,
  Settings,
  CheckCircle,
  Layers
} from 'lucide-react';
import { commissionService } from '@/services/commission.service';
import { CommissionRule, CommissionRuleType, CommissionStatus } from '@/types/commission.types';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { cn } from '@/lib/utils/cn';

export function CategoryCommissionView() {
  const [categoryId, setCategoryId] = useState('');
  const [searchInput, setSearchInput] = useState('');
  
  const { toast } = useToast();

  // Fetch category commission rules
  const {
    data: categoryRules,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['category-commission-rules', categoryId],
    queryFn: () => commissionService.getCommissionRulesByCategory(categoryId),
    enabled: !!categoryId,
    retry: false,
  });

  const handleSearch = () => {
    if (!searchInput.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a category ID',
        type: 'error',
      });
      return;
    }
    setCategoryId(searchInput.trim());
  };

  const handleClear = () => {
    setCategoryId('');
    setSearchInput('');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getTypeColor = (type: CommissionRuleType) => {
    switch (type) {
      case CommissionRuleType.PERCENTAGE:
        return 'bg-blue-100 text-blue-800';
      case CommissionRuleType.FIXED:
        return 'bg-purple-100 text-purple-800';
      case CommissionRuleType.TIERED:
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: CommissionStatus) => {
    switch (status) {
      case CommissionStatus.ACTIVE:
        return 'bg-green-100 text-green-800';
      case CommissionStatus.INACTIVE:
        return 'bg-red-100 text-red-800';
      case CommissionStatus.EXPIRED:
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const activeRules = categoryRules?.filter(rule => rule.status === CommissionStatus.ACTIVE) || [];
  const defaultRules = categoryRules?.filter(rule => rule.isDefault) || [];
  const categorySpecificRules = categoryRules?.filter(rule => rule.categoryId === categoryId) || [];
  const vendorRules = categoryRules?.filter(rule => rule.vendorId && !rule.categoryId) || [];

  return (
    <div className="space-y-6">
      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Category Commission Rules Lookup
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category ID
              </label>
              <input
                type="text"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Enter category ID to view commission rules"
              />
            </div>
            <div className="flex items-end gap-2">
              <GlowingButton
                variant="primary"
                onClick={handleSearch}
                disabled={isLoading || !searchInput.trim()}
              >
                {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                <Search className="h-4 w-4 mr-2" />
                Search
              </GlowingButton>
              {categoryId && (
                <GlowingButton
                  variant="secondary"
                  onClick={handleClear}
                >
                  Clear
                </GlowingButton>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Section */}
      {categoryId && (
        <>
          {isLoading && (
            <Card>
              <CardContent className="text-center py-12">
                <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500">Loading category commission rules...</p>
              </CardContent>
            </Card>
          )}

          {error && (
            <Card>
              <CardContent className="text-center py-12">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-400" />
                <p className="text-red-600 mb-2">Failed to load category commission rules</p>
                <p className="text-sm text-gray-500 mb-4">{(error as any)?.message}</p>
                <GlowingButton variant="primary" onClick={() => refetch()}>
                  Try Again
                </GlowingButton>
              </CardContent>
            </Card>
          )}

          {categoryRules && !isLoading && !error && (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Total Rules</p>
                        <p className="text-2xl font-bold text-gray-900">{categoryRules.length}</p>
                      </div>
                      <Settings className="h-8 w-8 text-gray-400" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Active Rules</p>
                        <p className="text-2xl font-bold text-green-600">{activeRules.length}</p>
                      </div>
                      <CheckCircle className="h-8 w-8 text-green-400" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Category Specific</p>
                        <p className="text-2xl font-bold text-blue-600">{categorySpecificRules.length}</p>
                      </div>
                      <Tag className="h-8 w-8 text-blue-400" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Default Rules</p>
                        <p className="text-2xl font-bold text-purple-600">{defaultRules.length}</p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-purple-400" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Rules Breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Category-Specific Rules */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5 text-blue-600" />
                      Category-Specific Rules
                      <span className="text-sm font-normal text-gray-500">
                        ({categorySpecificRules.length})
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {categorySpecificRules.length > 0 ? (
                      <div className="space-y-3">
                        {categorySpecificRules.map(rule => (
                          <div key={rule.id} className="border rounded-lg p-3 bg-blue-50">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-medium text-gray-900">{rule.name}</h4>
                              <span className={cn('px-2 py-1 text-xs rounded-full', getStatusColor(rule.status))}>
                                {rule.status}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{rule.description}</p>
                            <div className="flex justify-between items-center">
                              <span className={cn('px-2 py-1 text-xs rounded-full', getTypeColor(rule.type))}>
                                {rule.type}
                              </span>
                              <span className="font-medium text-gray-900">
                                {rule.type === CommissionRuleType.PERCENTAGE
                                  ? `${rule.value}%`
                                  : rule.type === CommissionRuleType.FIXED
                                  ? formatCurrency(rule.value)
                                  : 'Tiered'}
                              </span>
                            </div>
                            {(rule.minOrderValue || rule.maxOrderValue) && (
                              <div className="mt-2 text-xs text-gray-500">
                                Order range: {rule.minOrderValue ? formatCurrency(rule.minOrderValue) : '₦0'} - {
                                  rule.maxOrderValue ? formatCurrency(rule.maxOrderValue) : 'No limit'
                                }
                              </div>
                            )}
                            <div className="mt-2 text-xs text-gray-500">
                              Created: {format(new Date(rule.createdAt), 'MMM dd, yyyy')}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Tag className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>No category-specific rules found</p>
                        <p className="text-sm">This category uses default commission rules</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Default/Global Rules */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-purple-600" />
                      Default & Global Rules
                      <span className="text-sm font-normal text-gray-500">
                        ({defaultRules.length})
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {defaultRules.length > 0 ? (
                      <div className="space-y-3">
                        {defaultRules.map(rule => (
                          <div key={rule.id} className="border rounded-lg p-3 bg-purple-50">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-medium text-gray-900">{rule.name}</h4>
                              <div className="flex gap-1">
                                {rule.isDefault && (
                                  <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                                    Default
                                  </span>
                                )}
                                <span className={cn('px-2 py-1 text-xs rounded-full', getStatusColor(rule.status))}>
                                  {rule.status}
                                </span>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{rule.description}</p>
                            <div className="flex justify-between items-center">
                              <span className={cn('px-2 py-1 text-xs rounded-full', getTypeColor(rule.type))}>
                                {rule.type}
                              </span>
                              <span className="font-medium text-gray-900">
                                {rule.type === CommissionRuleType.PERCENTAGE
                                  ? `${rule.value}%`
                                  : rule.type === CommissionRuleType.FIXED
                                  ? formatCurrency(rule.value)
                                  : 'Tiered'}
                              </span>
                            </div>
                            <div className="mt-2 text-xs text-gray-500">
                              Created: {format(new Date(rule.createdAt), 'MMM dd, yyyy')}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>No default rules found</p>
                        <p className="text-sm">Please configure default commission rules</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Vendor Rules in Category (if any) */}
              {vendorRules.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Layers className="h-5 w-5 text-green-600" />
                      Vendor Rules That May Apply
                      <span className="text-sm font-normal text-gray-500">
                        ({vendorRules.length})
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-yellow-50 rounded-lg p-4 mb-4">
                      <p className="text-sm text-yellow-800">
                        <strong>Note:</strong> These are vendor-specific rules that may override category rules 
                        for specific vendors in this category.
                      </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {vendorRules.map(rule => (
                        <div key={rule.id} className="border rounded-lg p-3 bg-green-50">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium text-gray-900">{rule.name}</h4>
                            <span className={cn('px-2 py-1 text-xs rounded-full', getStatusColor(rule.status))}>
                              {rule.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            Vendor: {rule.vendorId}
                          </p>
                          <div className="flex justify-between items-center">
                            <span className={cn('px-2 py-1 text-xs rounded-full', getTypeColor(rule.type))}>
                              {rule.type}
                            </span>
                            <span className="font-medium text-gray-900">
                              {rule.type === CommissionRuleType.PERCENTAGE
                                ? `${rule.value}%`
                                : rule.type === CommissionRuleType.FIXED
                                ? formatCurrency(rule.value)
                                : 'Tiered'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Rule Hierarchy Explanation */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Commission Rule Priority for Categories
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-medium text-blue-800 mb-2">How Category Commission Rules Work</h4>
                    <div className="text-sm text-blue-700 space-y-2">
                      <p><strong>1. Vendor-Specific Rules:</strong> Applied first if a vendor has specific rules</p>
                      <p><strong>2. Category-Specific Rules:</strong> Applied to all products in this category</p>
                      <p><strong>3. Default Rules:</strong> Used as fallback when no specific rules apply</p>
                      <p><strong>4. Order Value Constraints:</strong> Rules may have minimum/maximum order values</p>
                      <p><strong>5. Date Validity:</strong> Rules may have validity periods</p>
                    </div>
                    <div className="mt-4 p-3 bg-blue-100 rounded border border-blue-200">
                      <p className="text-sm text-blue-800">
                        <strong>For Category ID: {categoryId}</strong><br />
                        {categorySpecificRules.length > 0 
                          ? `This category has ${categorySpecificRules.length} specific rule(s) that will apply to all products in this category.`
                          : 'This category relies on default commission rules for all transactions.'
                        }
                        {vendorRules.length > 0 && (
                          <><br />Additionally, {vendorRules.length} vendor(s) have specific rules that may override category rules.</>
                        )}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </>
      )}

      {/* Initial State */}
      {!categoryId && (
        <Card>
          <CardContent className="text-center py-12">
            <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 mb-2">Enter a category ID to view commission rules</p>
            <p className="text-sm text-gray-400">
              This will show category-specific rules, vendor overrides, and default rules that apply to the category.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}