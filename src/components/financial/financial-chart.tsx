'use client';

import React from 'react';

interface FinancialChartProps {
  data: Array<{
    date: string;
    revenue: number;
    commissions: number;
    payouts: number;
    refunds: number;
    transactionCount: number;
  }>;
}

export function FinancialChart({ data }: FinancialChartProps) {
  return (
    <div className="h-64 flex items-center justify-center border border-gray-200 rounded-lg bg-gray-50">
      <div className="text-center">
        <div className="text-gray-500 mb-2">Financial Chart</div>
        <div className="text-sm text-gray-400">
          Chart component will be implemented with Chart.js or similar library
        </div>
        <div className="text-xs text-gray-400 mt-1">
          Data points: {data.length}
        </div>
      </div>
    </div>
  );
}