'use client';

import React from 'react';
import { Card } from '@/components/ui/card';

export function SystemSettings() {
  return (
    <Card className="p-6">
      <div className="text-center py-12">
        <div className="text-gray-500 mb-2">System Settings</div>
        <div className="text-sm text-gray-400">
          This component will display system configuration functionality
        </div>
      </div>
    </Card>
  );
}