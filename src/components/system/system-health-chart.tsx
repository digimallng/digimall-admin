'use client';

import React from 'react';

interface SystemHealthChartProps {
  data: {
    cpu: Array<{ timestamp: string; value: number }>;
    memory: Array<{ timestamp: string; value: number }>;
    disk: Array<{ timestamp: string; value: number }>;
    network: {
      in: Array<{ timestamp: string; value: number }>;
      out: Array<{ timestamp: string; value: number }>;
    };
    requests: Array<{ timestamp: string; value: number }>;
    errors: Array<{ timestamp: string; value: number }>;
  };
}

export function SystemHealthChart({ data }: SystemHealthChartProps) {
  return (
    <div className="h-64 flex items-center justify-center border border-gray-200 rounded-lg bg-gray-50">
      <div className="text-center">
        <div className="text-gray-500 mb-2">System Health Chart</div>
        <div className="text-sm text-gray-400">
          Chart component will be implemented with Chart.js or similar library
        </div>
        <div className="text-xs text-gray-400 mt-1">
          CPU points: {data.cpu.length} | Memory points: {data.memory.length}
        </div>
      </div>
    </div>
  );
}