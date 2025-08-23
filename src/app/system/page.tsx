'use client';

import { useState } from 'react';
import {
  AnimatedCard,
  GlowingButton,
} from '@/components/ui/AnimatedCard';
import {
  Server,
  Settings,
  Monitor,
  Activity,
  HardDrive,
  Archive,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import { SystemHealthMonitor } from '@/components/system/SystemHealthMonitor';
import { SystemMetricsChart } from '@/components/system/SystemMetricsChart';
import { SystemConfigManager } from '@/components/system/SystemConfigManager';
import { MaintenanceModeToggle } from '@/components/system/MaintenanceModeToggle';
import { CacheManager } from '@/components/system/CacheManager';
import { BackupManager } from '@/components/system/BackupManager';
import { SystemLogsViewer } from '@/components/system/SystemLogsViewer';
import { cn } from '@/lib/utils/cn';

export default function SystemPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'config' | 'maintenance' | 'cache' | 'backup' | 'logs'>('overview');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Monitor, description: 'System health and metrics' },
    { id: 'config', label: 'Configuration', icon: Settings, description: 'System settings' },
    { id: 'maintenance', label: 'Maintenance', icon: AlertTriangle, description: 'Maintenance mode' },
    { id: 'cache', label: 'Cache', icon: HardDrive, description: 'Cache management' },
    { id: 'backup', label: 'Backup', icon: Archive, description: 'System backups' },
    { id: 'logs', label: 'Logs', icon: FileText, description: 'System logs' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-8">
            <SystemHealthMonitor />
            <SystemMetricsChart />
          </div>
        );
      case 'config':
        return <SystemConfigManager />;
      case 'maintenance':
        return <MaintenanceModeToggle />;
      case 'cache':
        return <CacheManager />;
      case 'backup':
        return <BackupManager />;
      case 'logs':
        return <SystemLogsViewer />;
      default:
        return <SystemHealthMonitor />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="relative">
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-pink-600/5 rounded-3xl" />
        <div className="p-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                System Management
              </h1>
              <p className="text-gray-600 mt-2 flex items-center gap-2">
                <Server className="h-4 w-4" />
                Comprehensive system monitoring and administration
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <AnimatedCard>
        <div className="p-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 overflow-x-auto">
              {tabs.map(({ id, label, icon: Icon, description }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id as any)}
                  className={cn(
                    'py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-3 whitespace-nowrap min-w-0',
                    activeTab === id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  )}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <div className="text-left">
                    <div className="font-medium">{label}</div>
                    <div className="text-xs text-gray-500 hidden md:block">{description}</div>
                  </div>
                </button>
              ))}
            </nav>
          </div>
        </div>
      </AnimatedCard>

      {/* Tab Content */}
      <div>
        {renderTabContent()}
      </div>
    </div>
  );
}
