'use client';

import { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import {
  Database,
  Download,
  RefreshCw,
  Plus,
  Archive,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Calendar,
  HardDrive,
  FileText,
  Settings,
  Trash2,
  Play,
  X,
  Info,
  Loader
} from 'lucide-react';
import { systemService } from '@/lib/api/services/system.service';
import { AnimatedCard, GlowingButton } from '@/components/ui/AnimatedCard';
import { useToast } from '@/hooks/use-notifications';
import { cn } from '@/lib/utils/cn';

interface BackupItem {
  id: string;
  type: 'full' | 'database' | 'files' | 'configuration';
  status: 'running' | 'completed' | 'failed';
  size: string;
  createdAt: string;
  completedAt?: string;
  description?: string;
  progress?: number;
}

export function BackupManager() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [backupType, setBackupType] = useState<'full' | 'database' | 'files' | 'configuration'>('full');
  const [backupDescription, setBackupDescription] = useState('');
  const [selectedBackup, setSelectedBackup] = useState<BackupItem | null>(null);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch backup data from API
  const {
    data: backupData,
    isLoading: isLoadingBackups,
    error: backupsError,
    refetch: refetchBackups
  } = useQuery({
    queryKey: ['system', 'backups'],
    queryFn: async () => {
      // Use the real backup endpoint
      const response = await fetch('/api/proxy/system/backups');
      if (!response.ok) {
        throw new Error('Failed to fetch backups');
      }
      return response.json();
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Use real backup data or fallback to empty array
  const backups: BackupItem[] = backupData?.backups || [];

  const createBackupMutation = useMutation({
    mutationFn: async ({ type, description }: { type: string; description?: string }) => {
      const response = await fetch('/api/proxy/system/backup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type, description }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create backup');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['system'] });
      refetchBackups(); // Refetch backup list
      setShowCreateModal(false);
      setBackupDescription('');
      toast({
        title: 'Backup Initiated',
        description: data.backup 
          ? `${data.backup.id} has been started and will complete in approximately ${data.backup.estimatedTime}.`
          : 'Backup process has been initiated.',
        type: 'success',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Backup Failed',
        description: error.message || 'Failed to initiate backup.',
        type: 'error',
      });
    },
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return CheckCircle;
      case 'running':
        return Loader;
      case 'failed':
        return XCircle;
      default:
        return Clock;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50';
      case 'running':
        return 'text-blue-600 bg-blue-50';
      case 'failed':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'full':
        return Archive;
      case 'database':
        return Database;
      case 'files':
        return HardDrive;
      case 'configuration':
        return Settings;
      default:
        return FileText;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'full':
        return 'bg-gradient-to-r from-purple-500 to-indigo-600';
      case 'database':
        return 'bg-gradient-to-r from-blue-500 to-cyan-600';
      case 'files':
        return 'bg-gradient-to-r from-green-500 to-emerald-600';
      case 'configuration':
        return 'bg-gradient-to-r from-orange-500 to-red-600';
      default:
        return 'bg-gradient-to-r from-gray-500 to-gray-600';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getBackupTypeDescription = (type: string) => {
    switch (type) {
      case 'full':
        return 'Complete system backup including database, files, and configuration';
      case 'database':
        return 'Database-only backup with all tables and data';
      case 'files':
        return 'File system backup including uploads and static files';
      case 'configuration':
        return 'System configuration and settings backup';
      default:
        return 'System backup';
    }
  };

  const handleCreateBackup = () => {
    createBackupMutation.mutate({
      type: backupType,
      description: backupDescription.trim() || undefined,
    });
  };

  const backupStats = {
    total: backups.length,
    completed: backups.filter(b => b.status === 'completed').length,
    running: backups.filter(b => b.status === 'running').length,
    failed: backups.filter(b => b.status === 'failed').length,
    totalSize: '2.6 GB'
  };

  // Show loading state
  if (isLoadingBackups) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Backup Management</h2>
            <p className="text-gray-600 mt-1">Create and manage system backups</p>
          </div>
        </div>
        
        {Array.from({ length: 2 }).map((_, i) => (
          <AnimatedCard key={i}>
            <div className="p-6">
              <div className="animate-pulse">
                <div className="h-6 bg-gray-200 rounded mb-4"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
            </div>
          </AnimatedCard>
        ))}
      </div>
    );
  }

  // Show error state
  if (backupsError) {
    return (
      <AnimatedCard>
        <div className="p-6 text-center">
          <div className="text-red-600 mb-4">
            <XCircle className="h-12 w-12 mx-auto mb-2" />
            <p className="font-medium">Failed to load backups</p>
            <p className="text-sm text-gray-600 mt-1">{backupsError.message}</p>
          </div>
          <GlowingButton onClick={() => refetchBackups()} variant="secondary">
            Retry
          </GlowingButton>
        </div>
      </AnimatedCard>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Backup Management</h2>
            <p className="text-gray-600 mt-1">Create and manage system backups</p>
          </div>
          <div className="flex items-center gap-3">
            <GlowingButton
              size="sm"
              variant="secondary"
              icon={<RefreshCw className="h-4 w-4" />}
              onClick={() => {
                queryClient.invalidateQueries({ queryKey: ['system'] });
                refetchBackups();
              }}
              loading={isLoadingBackups}
            >
              Refresh
            </GlowingButton>
            <GlowingButton
              size="sm"
              variant="primary"
              icon={<Plus className="h-4 w-4" />}
              onClick={() => setShowCreateModal(true)}
            >
              Create Backup
            </GlowingButton>
          </div>
        </div>

        {/* Backup Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <AnimatedCard delay={0}>
            <div className="p-6 text-center">
              <div className="rounded-xl p-3 bg-gradient-to-r from-gray-500 to-gray-600 mb-4 inline-block">
                <Archive className="h-6 w-6 text-white" />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">Total Backups</p>
                <p className="text-3xl font-bold text-gray-900">{backupStats.total}</p>
              </div>
            </div>
          </AnimatedCard>

          <AnimatedCard delay={100}>
            <div className="p-6 text-center">
              <div className="rounded-xl p-3 bg-gradient-to-r from-green-500 to-emerald-600 mb-4 inline-block">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-3xl font-bold text-gray-900">{backupStats.completed}</p>
              </div>
            </div>
          </AnimatedCard>

          <AnimatedCard delay={200}>
            <div className="p-6 text-center">
              <div className="rounded-xl p-3 bg-gradient-to-r from-blue-500 to-cyan-600 mb-4 inline-block">
                <Play className="h-6 w-6 text-white" />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">Running</p>
                <p className="text-3xl font-bold text-gray-900">{backupStats.running}</p>
              </div>
            </div>
          </AnimatedCard>

          <AnimatedCard delay={300}>
            <div className="p-6 text-center">
              <div className="rounded-xl p-3 bg-gradient-to-r from-red-500 to-pink-600 mb-4 inline-block">
                <XCircle className="h-6 w-6 text-white" />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">Failed</p>
                <p className="text-3xl font-bold text-gray-900">{backupStats.failed}</p>
              </div>
            </div>
          </AnimatedCard>

          <AnimatedCard delay={400}>
            <div className="p-6 text-center">
              <div className="rounded-xl p-3 bg-gradient-to-r from-purple-500 to-indigo-600 mb-4 inline-block">
                <HardDrive className="h-6 w-6 text-white" />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">Total Size</p>
                <p className="text-3xl font-bold text-gray-900">{backupStats.totalSize}</p>
              </div>
            </div>
          </AnimatedCard>
        </div>

        {/* Backup List */}
        <AnimatedCard delay={500}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Recent Backups</h3>
              <div className="text-sm text-gray-500">
                Last updated: {new Date().toLocaleTimeString()}
              </div>
            </div>

            <div className="space-y-4">
              {backups.length === 0 ? (
                <div className="text-center py-12">
                  <Archive className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Backups Found</h3>
                  <p className="text-gray-600 mb-4">
                    No backup records are currently available. Create your first backup to get started.
                  </p>
                  <GlowingButton
                    variant="primary"
                    icon={<Plus className="h-4 w-4" />}
                    onClick={() => setShowCreateModal(true)}
                  >
                    Create First Backup
                  </GlowingButton>
                </div>
              ) : (
                backups.map((backup) => {
                const StatusIcon = getStatusIcon(backup.status);
                const TypeIcon = getTypeIcon(backup.type);
                
                return (
                  <div
                    key={backup.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className={cn('rounded-lg p-2', getTypeColor(backup.type))}>
                          <TypeIcon className="h-5 w-5 text-white" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-sm font-medium text-gray-900 capitalize">
                              {backup.type} Backup
                            </h4>
                            <span className={cn('px-2 py-1 rounded-full text-xs font-medium capitalize', getStatusColor(backup.status))}>
                              {backup.status}
                            </span>
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-2">
                            {backup.description || getBackupTypeDescription(backup.type)}
                          </p>
                          
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Created: {formatDate(backup.createdAt)}
                            </span>
                            {backup.completedAt && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Completed: {formatDate(backup.completedAt)}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <HardDrive className="h-3 w-3" />
                              Size: {backup.size}
                            </span>
                          </div>

                          {backup.status === 'running' && backup.progress && (
                            <div className="mt-2">
                              <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                                <span>Progress</span>
                                <span>{backup.progress}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="h-2 rounded-full bg-blue-600 transition-all duration-500"
                                  style={{ width: `${backup.progress}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <StatusIcon className={cn('h-5 w-5', getStatusColor(backup.status).split(' ')[0])} />
                        
                        <div className="flex gap-2">
                          {backup.status === 'completed' && (
                            <button className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors">
                              <Download className="h-4 w-4" />
                            </button>
                          )}
                          
                          {backup.status === 'failed' && (
                            <button className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors">
                              <RefreshCw className="h-4 w-4" />
                            </button>
                          )}
                          
                          <button className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
                })
              )}
            </div>
          </div>
        </AnimatedCard>
      </div>

      {/* Create Backup Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={() => setShowCreateModal(false)} />

            <div className="inline-block w-full max-w-lg p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Create New Backup</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <Info className="h-4 w-4 text-blue-600 mt-0.5" />
                    <p className="text-sm text-blue-700">
                      Creating a backup will temporarily increase system load. Consider scheduling during low-traffic periods.
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Backup Type
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: 'full', label: 'Full Backup', desc: 'Complete system backup' },
                      { id: 'database', label: 'Database Only', desc: 'Database tables and data' },
                      { id: 'files', label: 'Files Only', desc: 'File system and uploads' },
                      { id: 'configuration', label: 'Configuration', desc: 'Settings and config' },
                    ].map((type) => (
                      <button
                        key={type.id}
                        onClick={() => setBackupType(type.id as any)}
                        className={cn(
                          'p-3 text-left border rounded-lg transition-colors',
                          backupType === type.id
                            ? 'border-primary bg-primary/5'
                            : 'border-gray-300 hover:border-gray-400'
                        )}
                      >
                        <div className="font-medium text-sm">{type.label}</div>
                        <div className="text-xs text-gray-600 mt-1">{type.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    value={backupDescription}
                    onChange={(e) => setBackupDescription(e.target.value)}
                    rows={3}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                    placeholder="Enter a description for this backup..."
                  />
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="text-sm text-yellow-700">
                    <p className="font-medium mb-1">Estimated backup details:</p>
                    <ul className="space-y-1 text-xs">
                      <li>• Estimated time: {backupType === 'full' ? '15-30 minutes' : backupType === 'database' ? '5-10 minutes' : '2-5 minutes'}</li>
                      <li>• Estimated size: {backupType === 'full' ? '~2.5 GB' : backupType === 'database' ? '~800 MB' : '~50 MB'}</li>
                      <li>• Storage location: Encrypted cloud storage</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-6">
                <GlowingButton
                  variant="secondary"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </GlowingButton>
                <GlowingButton
                  variant="primary"
                  icon={<Archive className="h-4 w-4" />}
                  onClick={handleCreateBackup}
                  loading={createBackupMutation.isPending}
                >
                  Create Backup
                </GlowingButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}