'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';

export function PayoutsTable() {
  return (
    <Card className="p-6">
      <div className="text-center py-12">
        <div className="text-gray-500 mb-2">Payouts Table</div>
        <div className="text-sm text-gray-400">
          This component will display payout management functionality
        </div>
      </div>
    </Card>
  );
}