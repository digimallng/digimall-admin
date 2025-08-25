'use client';

import { useState } from 'react';
import { auditService } from '@/services/audit.service';
import { toast } from 'sonner';

export default function TestExportPage() {
  const [isExporting, setIsExporting] = useState(false);

  const testExport = async (format: 'csv' | 'xlsx') => {
    setIsExporting(true);
    try {
      await auditService.exportAuditLogs(undefined, format);
      toast({
        title: 'Export Successful',
        description: `Test export completed for ${format.toUpperCase()}`,
      });
    } catch (error) {
      console.error('Export failed:', error);
      toast({
        title: 'Export Failed',
        description: 'Test export failed. Check console for details.',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Export Functionality</h1>
      <div className="space-x-4">
        <button
          onClick={() => testExport('csv')}
          disabled={isExporting}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {isExporting ? 'Exporting...' : 'Test CSV Export'}
        </button>
        <button
          onClick={() => testExport('xlsx')}
          disabled={isExporting}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
        >
          {isExporting ? 'Exporting...' : 'Test Excel Export'}
        </button>
      </div>
      <div className="mt-4">
        <p className="text-gray-600">
          Click the buttons above to test the CSV and Excel export functionality.
          This will attempt to export audit logs through the backend API.
        </p>
      </div>
    </div>
  );
}