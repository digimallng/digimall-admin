'use client';

import React from 'react';
import { Card } from '@/components/ui/card';

export function SecurityAlertsTable() {
  return (
    <Card className="p-6">
      <div className="text-center py-12">
        <div className="text-gray-500 mb-2">Security Alerts Table</div>
        <div className="text-sm text-gray-400">
          This component will display security alerts management functionality
        </div>
      </div>
    </Card>
  );
}