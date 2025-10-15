'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GlowingButton } from '@/components/ui/AnimatedCard';
import { 
  Search, 
  Store, 
  Loader2, 
  AlertCircle, 
  DollarSign,
  TrendingUp,
  Users,
  Calendar,
  Settings,
  CheckCircle
} from 'lucide-react';
import { commissionService } from '@/services/commission.service';
import { CommissionRule, CommissionRuleType, CommissionStatus } from '@/types/commission.types';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { cn } from '@/lib/utils/cn';

export function VendorCommissionView() {
  const [vendorId, setVendorId] = useState('');
  const [searchInput, setSearchInput] = useState('');
  
  const { toast } = useToast();

  // Fetch vendor commission rules
  const {
    data: vendorRules,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['vendor-commission-rules', vendorId],
    queryFn: () => commissionService.getCommissionRulesByVendor(vendorId),
    enabled: !!vendorId,
    retry: false,
  });

  const handleSearch = () => {
    if (!searchInput.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a vendor ID',
        type: 'error',
      });
      return;
    }
    setVendorId(searchInput.trim());
  };

  const handleClear = () => {
    setVendorId('');
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

  const activeRules = vendorRules?.filter(rule => rule.status === CommissionStatus.ACTIVE) || [];
  const defaultRules = vendorRules?.filter(rule => rule.isDefault) || [];
  const vendorSpecificRules = vendorRules?.filter(rule => rule.vendorId === vendorId) || [];

  return (
    <div className="space-y-6">
      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="h-5 w-5" />
            Vendor Commission Rules Lookup
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vendor ID
              </label>
              <input
                type="text"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Enter vendor ID to view their commission rules"
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
              {vendorId && (
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
      {vendorId && (
        <>
          {isLoading && (
            <Card>
              <CardContent className="text-center py-12">
                <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500">Loading vendor commission rules...</p>
              </CardContent>
            </Card>
          )}

          {error && (
            <Card>
              <CardContent className="text-center py-12">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-400" />
                <p className="text-red-600 mb-2">Failed to load vendor commission rules</p>
                <p className="text-sm text-gray-500 mb-4">{(error as any)?.message}</p>
                <GlowingButton variant="primary" onClick={() => refetch()}>
                  Try Again
                </GlowingButton>
              </CardContent>
            </Card>
          )}

          {vendorRules && !isLoading && !error && (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Total Rules</p>
                        <p className="text-2xl font-bold text-gray-900">{vendorRules.length}</p>
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
                        <p className="text-sm text-gray-600">Vendor Specific</p>
                        <p className="text-2xl font-bold text-blue-600">{vendorSpecificRules.length}</p>
                      </div>
                      <Users className="h-8 w-8 text-blue-400" />
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
                {/* Vendor-Specific Rules */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Store className="h-5 w-5 text-blue-600" />
                      Vendor-Specific Rules
                      <span className="text-sm font-normal text-gray-500">
                        ({vendorSpecificRules.length})
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {vendorSpecificRules.length > 0 ? (
                      <div className="space-y-3">
                        {vendorSpecificRules.map(rule => (
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
                        <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>No vendor-specific rules found</p>
                        <p className="text-sm">This vendor uses default commission rules</p>
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

              {/* Rule Hierarchy Explanation */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Commission Rule Priority
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-medium text-blue-800 mb-2">How Commission Rules Work</h4>
                    <div className="text-sm text-blue-700 space-y-2">
                      <p><strong>1. Vendor-Specific Rules:</strong> Applied first if available for this vendor</p>
                      <p><strong>2. Category Rules:</strong> Applied if no vendor-specific rules exist</p>
                      <p><strong>3. Default Rules:</strong> Used as fallback when no specific rules apply</p>
                      <p><strong>4. Order Value Constraints:</strong> Rules may have minimum/maximum order values</p>
                      <p><strong>5. Date Validity:</strong> Rules may have validity periods</p>
                    </div>
                    <div className="mt-4 p-3 bg-blue-100 rounded border border-blue-200">
                      <p className="text-sm text-blue-800">
                        <strong>For Vendor ID: {vendorId}</strong><br />
                        {vendorSpecificRules.length > 0 
                          ? `This vendor has ${vendorSpecificRules.length} specific rule(s) that will take priority over default rules.`
                          : 'This vendor relies on default commission rules for all transactions.'
                        }
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
      {!vendorId && (
        <Card>
          <CardContent className="text-center py-12">
            <Store className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 mb-2">Enter a vendor ID to view their commission rules</p>
            <p className="text-sm text-gray-400">
              This will show both vendor-specific rules and default rules that apply to the vendor.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}