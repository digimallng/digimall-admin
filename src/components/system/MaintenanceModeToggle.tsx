'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Settings,
  Power,
  AlertTriangle,
  Clock,
  Users,
  Globe,
  Calendar,
  MessageSquare,
  Save,
  X,
  Check,
  Info
} from 'lucide-react';
import { systemService } from '@/lib/api/services/system.service';
import { AnimatedCard, GlowingButton } from '@/components/ui/AnimatedCard';
import { useToast } from '@/hooks/use-notifications';
import { cn } from '@/lib/utils/cn';

interface MaintenanceStatus {
  enabled: boolean;
  message: string;
  startTime?: string;
  endTime?: string;
  allowedIPs?: string[];
}

export function MaintenanceModeToggle() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [maintenanceData, setMaintenanceData] = useState<MaintenanceStatus>({
    enabled: false,
    message: '',
    startTime: '',
    endTime: '',
    allowedIPs: [],
  });
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const {
    data: currentConfig,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['system', 'config'],
    queryFn: () => systemService.getSystemConfig(),
  });

  const toggleMaintenanceMutation = useMutation({
    mutationFn: ({ enabled, message }: { enabled: boolean; message?: string }) =>
      systemService.toggleMaintenanceMode(enabled, message),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['system', 'config'] });
      setIsModalOpen(false);
      toast({
        title: data.maintenance.enabled ? 'Maintenance Mode Enabled' : 'Maintenance Mode Disabled',
        description: data.maintenance.enabled 
          ? 'The system is now in maintenance mode.' 
          : 'The system is back online.',
        type: 'success',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Operation Failed',
        description: error.message || 'Failed to toggle maintenance mode.',
        type: 'error',
      });
    },
  });

  useEffect(() => {
    if (currentConfig?.maintenance) {
      setMaintenanceData({
        enabled: currentConfig.maintenance.enabled || false,
        message: currentConfig.maintenance.message || '',
        startTime: currentConfig.maintenance.startTime || '',
        endTime: currentConfig.maintenance.endTime || '',
        allowedIPs: currentConfig.maintenance.allowedIPs || [],
      });
    }
  }, [currentConfig]);

  const handleToggleMaintenance = (enabled: boolean) => {
    if (enabled) {
      setIsModalOpen(true);
    } else {
      toggleMaintenanceMutation.mutate({ enabled: false });
    }
  };

  const handleSaveMaintenance = () => {
    toggleMaintenanceMutation.mutate({
      enabled: true,
      message: maintenanceData.message,
    });
  };

  const getMaintenanceStatusInfo = () => {
    if (!currentConfig?.maintenance) return null;
    
    const { enabled, message } = currentConfig.maintenance;
    
    return {
      status: enabled ? 'active' : 'inactive',
      statusText: enabled ? 'Active' : 'Inactive',
      statusColor: enabled ? 'text-red-600 bg-red-50' : 'text-green-600 bg-green-50',
      icon: enabled ? AlertTriangle : Check,
      message: message || 'No maintenance message set',
    };
  };

  const predefinedMessages = [
    'We are currently performing scheduled maintenance. Please check back shortly.',
    'The system is temporarily unavailable for maintenance. We apologize for any inconvenience.',
    'Maintenance in progress. Expected completion time: 30 minutes.',
    'System upgrade in progress. Service will be restored shortly.',
    'Emergency maintenance required. We will be back online as soon as possible.',
  ];

  if (isLoading) {
    return (
      <AnimatedCard>
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded mb-4 w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded mb-6 w-3/4"></div>
            <div className="h-10 bg-gray-200 rounded w-1/3"></div>
          </div>
        </div>
      </AnimatedCard>
    );
  }

  if (error) {
    return (
      <AnimatedCard>
        <div className="p-6 text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to Load Maintenance Status</h3>
          <p className="text-gray-600 mb-4">{error.message}</p>
          <GlowingButton onClick={() => refetch()} variant="secondary">
            Try Again
          </GlowingButton>
        </div>
      </AnimatedCard>
    );
  }

  const statusInfo = getMaintenanceStatusInfo();
  if (!statusInfo) return null;

  return (
    <>
      <AnimatedCard>
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="rounded-xl p-3 bg-gradient-to-r from-orange-500 to-red-600">
                  <Settings className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Maintenance Mode</h3>
                  <p className="text-sm text-gray-600">Control system access during maintenance</p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Current Status */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <statusInfo.icon className={cn('h-5 w-5', statusInfo.statusColor.split(' ')[0])} />
                    <div>
                      <span className="text-sm font-medium text-gray-900">Status:</span>
                      <span className={cn('ml-2 px-2 py-1 rounded-full text-xs font-medium', statusInfo.statusColor)}>
                        {statusInfo.statusText}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Toggle Mode:</span>
                    <button
                      onClick={() => handleToggleMaintenance(!maintenanceData.enabled)}
                      disabled={toggleMaintenanceMutation.isPending}
                      className={cn(
                        'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                        maintenanceData.enabled ? 'bg-red-600' : 'bg-gray-200',
                        toggleMaintenanceMutation.isPending && 'opacity-50 cursor-not-allowed'
                      )}
                    >
                      <span
                        className={cn(
                          'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                          maintenanceData.enabled ? 'translate-x-6' : 'translate-x-1'
                        )}
                      />
                    </button>
                  </div>
                </div>

                {/* Current Message */}
                {maintenanceData.enabled && maintenanceData.message && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <MessageSquare className="h-5 w-5 text-yellow-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-yellow-800">Current Maintenance Message:</p>
                        <p className="text-sm text-yellow-700 mt-1">{maintenanceData.message}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* System Impact Warning */}
                {maintenanceData.enabled && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-red-800">System Impact:</p>
                        <ul className="text-sm text-red-700 mt-1 space-y-1">
                          <li>• All user access will be restricted</li>
                          <li>• Only admin users can access the system</li>
                          <li>• API endpoints will return maintenance responses</li>
                          <li>• Background jobs will continue processing</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {maintenanceData.enabled ? '🔒' : '🟢'}
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      {maintenanceData.enabled ? 'Restricted' : 'Online'}
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">24/7</div>
                    <p className="text-xs text-gray-600 mt-1">Monitoring</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AnimatedCard>

      {/* Maintenance Configuration Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={() => setIsModalOpen(false)} />

            <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Enable Maintenance Mode</h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <Info className="h-4 w-4 text-yellow-600 mt-0.5" />
                    <p className="text-sm text-yellow-700">
                      This will restrict access to all users except administrators.
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maintenance Message
                  </label>
                  <textarea
                    value={maintenanceData.message}
                    onChange={(e) => setMaintenanceData(prev => ({ ...prev, message: e.target.value }))}
                    rows={3}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                    placeholder="Enter a message to display to users..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quick Messages
                  </label>
                  <div className="space-y-2">
                    {predefinedMessages.slice(0, 3).map((message, index) => (
                      <button
                        key={index}
                        onClick={() => setMaintenanceData(prev => ({ ...prev, message }))}
                        className="w-full text-left p-2 text-sm text-gray-700 hover:bg-gray-50 rounded border transition-colors"
                      >
                        {message}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="text-sm text-primary hover:text-primary/80 font-medium"
                >
                  {showAdvanced ? 'Hide' : 'Show'} Advanced Options
                </button>

                {showAdvanced && (
                  <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Start Time (Optional)
                        </label>
                        <input
                          type="datetime-local"
                          value={maintenanceData.startTime}
                          onChange={(e) => setMaintenanceData(prev => ({ ...prev, startTime: e.target.value }))}
                          className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          End Time (Optional)
                        </label>
                        <input
                          type="datetime-local"
                          value={maintenanceData.endTime}
                          onChange={(e) => setMaintenanceData(prev => ({ ...prev, endTime: e.target.value }))}
                          className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Allowed IP Addresses (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="192.168.1.1, 10.0.0.1"
                        className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Comma-separated IP addresses that can bypass maintenance mode
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 mt-6">
                <GlowingButton
                  variant="secondary"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </GlowingButton>
                <GlowingButton
                  variant="primary"
                  icon={<Save className="h-4 w-4" />}
                  onClick={handleSaveMaintenance}
                  loading={toggleMaintenanceMutation.isPending}
                  disabled={!maintenanceData.message.trim()}
                >
                  Enable Maintenance
                </GlowingButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}