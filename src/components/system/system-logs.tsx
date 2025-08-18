'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';

export function SystemLogs() {
  return (
    <Card className="p-6">
      <div className="text-center py-12">
        <div className="text-gray-500 mb-2">System Logs</div>
        <div className="text-sm text-gray-400">
          This component will display system logs functionality
        </div>
      </div>
    </Card>
  );
}