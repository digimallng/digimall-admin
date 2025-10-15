'use client';

import React from 'react';
import { Card } from '@/components/ui/card';

export function SecuritySettings() {
  return (
    <Card className="p-6">
      <div className="text-center py-12">
        <div className="text-gray-500 mb-2">Security Settings</div>
        <div className="text-sm text-gray-400">
          This component will display security configuration functionality
        </div>
      </div>
    </Card>
  );
}