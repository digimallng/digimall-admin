'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { GlowingButton } from '@/components/ui/AnimatedCard';
import { Calculator, Loader2, TrendingUp, Percent } from 'lucide-react';
import { commissionService } from '@/services/commission.service';
import { 
  CommissionCalculationDto, 
  CommissionCalculationResult, 
  CommissionRuleType 
} from '@/types/commission.types';
import { useToast } from '@/hooks/use-toast';

export function CommissionCalculator() {
  const [formData, setFormData] = useState<CommissionCalculationDto>({
    orderValue: 0,
    vendorId: '',
    categoryId: '',
  });
  const [result, setResult] = useState<CommissionCalculationResult | null>(null);
  
  const { toast } = useToast();

  const calculateMutation = useMutation({
    mutationFn: (data: CommissionCalculationDto) => commissionService.calculateCommission(data),
    onSuccess: (data) => {
      setResult(data);
      toast({
        title: 'Success',
        description: 'Commission calculated successfully',
        type: 'success',
      });
    },
    onError: (error: any) => {
      setResult(null);
      toast({
        title: 'Error',
        description: error?.message || 'Failed to calculate commission',
        type: 'error',
      });
    },
  });

  const handleCalculate = () => {
    if (formData.orderValue <= 0) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a valid order value',
        type: 'error',
      });
      return;
    }

    const calculationData = {
      orderValue: formData.orderValue,
      ...(formData.vendorId && { vendorId: formData.vendorId }),
      ...(formData.categoryId && { categoryId: formData.categoryId }),
    };

    calculateMutation.mutate(calculationData);
  };

  const handleReset = () => {
    setFormData({
      orderValue: 0,
      vendorId: '',
      categoryId: '',
    });
    setResult(null);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getCommissionPercentage = () => {
    if (!result) return 0;
    return ((result.commissionAmount / result.orderValue) * 100);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Calculator Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Commission Calculator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Order Value (₦) *
              </label>
              <input
                type="number"
                value={formData.orderValue || ''}
                onChange={e => setFormData(prev => ({ 
                  ...prev, 
                  orderValue: parseFloat(e.target.value) || 0 
                }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Enter order value"
                min="0"
                step="100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vendor ID (Optional)
              </label>
              <input
                type="text"
                value={formData.vendorId || ''}
                onChange={e => setFormData(prev => ({ 
                  ...prev, 
                  vendorId: e.target.value 
                }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Enter vendor ID"
              />
              <p className="text-xs text-gray-500 mt-1">
                Leave empty to use default/global rules
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category ID (Optional)
              </label>
              <input
                type="text"
                value={formData.categoryId || ''}
                onChange={e => setFormData(prev => ({ 
                  ...prev, 
                  categoryId: e.target.value 
                }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Enter category ID"
              />
              <p className="text-xs text-gray-500 mt-1">
                Leave empty to use vendor/default rules
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <GlowingButton
                variant="primary"
                onClick={handleCalculate}
                disabled={calculateMutation.isPending || formData.orderValue <= 0}
                className="flex-1"
              >
                {calculateMutation.isPending && (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                )}
                Calculate
              </GlowingButton>
              
              <GlowingButton
                variant="secondary"
                onClick={handleReset}
                disabled={calculateMutation.isPending}
              >
                Reset
              </GlowingButton>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calculation Result */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Calculation Result
          </CardTitle>
        </CardHeader>
        <CardContent>
          {result ? (
            <div className="space-y-4">
              {/* Order Summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-800 mb-3">Order Summary</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Order Value:</span>
                    <span className="font-medium">{formatCurrency(result.orderValue)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Commission Amount:</span>
                    <span className="font-bold text-green-600">
                      {formatCurrency(result.commissionAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Commission Rate:</span>
                    <span className="font-medium text-blue-600 flex items-center gap-1">
                      <Percent className="h-3 w-3" />
                      {getCommissionPercentage().toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Applied Rule */}
              {result.appliedRule ? (
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-800 mb-3">Applied Rule</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Rule Name:</span>
                      <span className="font-medium">{result.appliedRule.name || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Rule Type:</span>
                      <span className={`px-2 py-1 text-xs rounded-full capitalize ${
                        result.appliedRule.type === CommissionRuleType.PERCENTAGE
                          ? 'bg-blue-100 text-blue-800'
                          : result.appliedRule.type === CommissionRuleType.FIXED
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {result.appliedRule.type}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Rule ID:</span>
                      <span className="font-mono text-xs text-gray-500">
                        {result.appliedRule.id || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-yellow-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-800 mb-2">Applied Rule</h4>
                  <p className="text-sm text-gray-600">No specific rule information available</p>
                </div>
              )}

              {/* Breakdown */}
              <div className="bg-green-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-800 mb-3">Breakdown</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Vendor Receives:</span>
                    <span className="font-bold text-gray-800">
                      {formatCurrency(result.orderValue - result.commissionAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Platform Commission:</span>
                    <span className="font-bold text-green-600">
                      {formatCurrency(result.commissionAmount)}
                    </span>
                  </div>
                  <hr className="my-2" />
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Total Order Value:</span>
                    <span className="font-bold text-gray-900">
                      {formatCurrency(result.orderValue)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              {(formData.vendorId || formData.categoryId) && (
                <div className="text-xs text-gray-500 bg-gray-100 rounded p-2">
                  <p className="font-medium mb-1">Search Context:</p>
                  {formData.vendorId && <p>• Vendor ID: {formData.vendorId}</p>}
                  {formData.categoryId && <p>• Category ID: {formData.categoryId}</p>}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Calculator className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Enter order details and click Calculate to see commission breakdown</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}