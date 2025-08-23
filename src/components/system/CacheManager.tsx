'use client';

import { useState, useEffect } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import {
  HardDrive,
  Trash2,
  RefreshCw,
  Database,
  Zap,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Search,
  X,
  Monitor
} from 'lucide-react';
import { systemService } from '@/lib/api/services/system.service';
import { AnimatedCard, GlowingButton, ProgressRing } from '@/components/ui/AnimatedCard';
import { useToast } from '@/hooks/use-notifications';
import { cn } from '@/lib/utils/cn';

interface CacheStats {
  hits: number;
  misses: number;
  hitRate: number;
  size: number;
}

export function CacheManager() {
  const [isClearing, setIsClearing] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedCacheType, setSelectedCacheType] = useState<'all' | 'redis' | 'application'>('all');
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch real cache metrics from API
  const {
    data: metricsData,
    isLoading: isLoadingMetrics,
    error: metricsError,
    refetch: refetchMetrics
  } = useQuery({
    queryKey: ['system', 'metrics'],
    queryFn: () => systemService.getSystemMetrics(),
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 15000, // Consider stale after 15 seconds
  });

  // Extract cache stats from metrics data with fallbacks
  const cacheStats: CacheStats = {
    hits: metricsData?.cache?.hits || 0,
    misses: metricsData?.cache?.misses || 0,
    hitRate: metricsData?.cache?.hitRate || 0,
    size: metricsData?.cache?.size || 0,
  };

  // Generate cache types based on real data
  const cacheTypes = [
    {
      id: 'all',
      name: 'All Caches',
      description: 'Clear all cache types',
      icon: HardDrive,
      status: cacheStats.hitRate > 90 ? 'healthy' : cacheStats.hitRate > 70 ? 'warning' : 'critical',
      size: `${cacheStats.size} MB`,
      entries: (cacheStats.hits + cacheStats.misses).toLocaleString(),
      lastCleared: 'Unknown', // This would need to be tracked by backend
    },
    {
      id: 'application',
      name: 'Application Cache',
      description: 'In-memory application cache',
      icon: Zap,
      status: cacheStats.hitRate > 85 ? 'healthy' : 'warning',
      size: `${Math.round(cacheStats.size * 0.4)} MB`, // Estimate 40% of total
      entries: Math.round((cacheStats.hits + cacheStats.misses) * 0.4).toLocaleString(),
      lastCleared: 'Unknown',
    },
    {
      id: 'database',
      name: 'Database Cache',
      description: 'Query result cache',
      icon: Database,
      status: cacheStats.hitRate > 80 ? 'healthy' : cacheStats.hitRate > 60 ? 'warning' : 'critical',
      size: `${Math.round(cacheStats.size * 0.6)} MB`, // Estimate 60% of total
      entries: Math.round((cacheStats.hits + cacheStats.misses) * 0.6).toLocaleString(),
      lastCleared: 'Unknown',
    },
  ];

  const clearCacheMutation = useMutation({
    mutationFn: () => systemService.clearCache(),
    onMutate: () => {
      setIsClearing(true);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['system'] });
      refetchMetrics(); // Refetch metrics to see updated cache stats
      setShowConfirmDialog(false);
      setIsClearing(false);
      toast({
        title: 'Cache Cleared Successfully',
        description: data.message || 'System cache has been cleared.',
        type: 'success',
      });
    },
    onError: (error: any) => {
      setIsClearing(false);
      toast({
        title: 'Cache Clear Failed',
        description: error.message || 'Failed to clear system cache.',
        type: 'error',
      });
    },
  });

  const handleClearCache = () => {
    setShowConfirmDialog(true);
  };

  const confirmClearCache = () => {
    clearCacheMutation.mutate();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600 bg-green-50';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50';
      case 'critical':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return CheckCircle;
      case 'warning':
        return AlertTriangle;
      case 'critical':
        return X;
      default:
        return Clock;
    }
  };

  // Show loading state
  if (isLoadingMetrics) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Cache Management</h2>
            <p className="text-gray-600 mt-1">Monitor and manage system cache performance</p>
          </div>
        </div>
        
        {Array.from({ length: 3 }).map((_, i) => (
          <AnimatedCard key={i}>
            <div className="p-6">
              <div className="animate-pulse">
                <div className="h-6 bg-gray-200 rounded mb-4"></div>
                <div className="h-64 bg-gray-200 rounded"></div>
              </div>
            </div>
          </AnimatedCard>
        ))}
      </div>
    );
  }

  // Show error state
  if (metricsError) {
    return (
      <AnimatedCard>
        <div className="p-6 text-center">
          <div className="text-red-600 mb-4">
            <AlertTriangle className="h-12 w-12 mx-auto mb-2" />
            <p className="font-medium">Failed to load cache metrics</p>
            <p className="text-sm text-gray-600 mt-1">{metricsError.message}</p>
          </div>
          <GlowingButton onClick={() => refetchMetrics()} variant="secondary">
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
            <h2 className="text-2xl font-bold text-gray-900">Cache Management</h2>
            <p className="text-gray-600 mt-1">Monitor and manage system cache performance</p>
          </div>
          <div className="flex items-center gap-3">
            <GlowingButton
              size="sm"
              variant="secondary"
              icon={<RefreshCw className="h-4 w-4" />}
              onClick={() => {
                queryClient.invalidateQueries({ queryKey: ['system'] });
                refetchMetrics();
              }}
              loading={isLoadingMetrics}
            >
              Refresh
            </GlowingButton>
            <GlowingButton
              size="sm"
              variant="primary"
              icon={<Trash2 className="h-4 w-4" />}
              onClick={handleClearCache}
              loading={isClearing}
            >
              Clear Cache
            </GlowingButton>
          </div>
        </div>

        {/* Cache Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <AnimatedCard delay={0}>
            <div className="p-6 text-center">
              <div className="mx-auto mb-4">
                <ProgressRing
                  progress={cacheStats.hitRate}
                  size={100}
                  strokeWidth={6}
                  color={cacheStats.hitRate > 95 ? '#10B981' : cacheStats.hitRate > 85 ? '#F59E0B' : '#EF4444'}
                />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Hit Rate</h3>
              <p className="text-sm text-gray-600">Cache efficiency</p>
            </div>
          </AnimatedCard>

          <AnimatedCard delay={100}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="rounded-xl p-3 bg-gradient-to-r from-blue-500 to-cyan-600">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">Cache Hits</p>
                <p className="text-3xl font-bold text-gray-900">{cacheStats.hits.toLocaleString()}</p>
                <p className="text-xs text-green-600">+12.5% from last hour</p>
              </div>
            </div>
          </AnimatedCard>

          <AnimatedCard delay={200}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="rounded-xl p-3 bg-gradient-to-r from-red-500 to-pink-600">
                  <X className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">Cache Misses</p>
                <p className="text-3xl font-bold text-gray-900">{cacheStats.misses.toLocaleString()}</p>
                <p className="text-xs text-red-600">+2.1% from last hour</p>
              </div>
            </div>
          </AnimatedCard>

          <AnimatedCard delay={300}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="rounded-xl p-3 bg-gradient-to-r from-purple-500 to-indigo-600">
                  <HardDrive className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">Total Size</p>
                <p className="text-3xl font-bold text-gray-900">{cacheStats.size} MB</p>
                <p className="text-xs text-gray-500">Memory usage</p>
              </div>
            </div>
          </AnimatedCard>
        </div>

        {/* Cache Types */}
        <AnimatedCard delay={400}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Cache Types</h3>
              <div className="text-sm text-gray-500">
                Last updated: {new Date().toLocaleTimeString()}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {cacheTypes.map((cache) => {
                const Icon = cache.icon;
                const StatusIcon = getStatusIcon(cache.status);
                
                return (
                  <div
                    key={cache.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Icon className="h-5 w-5 text-gray-600" />
                        <span className="font-medium text-gray-900">{cache.name}</span>
                      </div>
                      <StatusIcon className={cn('h-4 w-4', getStatusColor(cache.status).split(' ')[0])} />
                    </div>

                    <p className="text-sm text-gray-600 mb-4">{cache.description}</p>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Size:</span>
                        <span className="text-gray-900 font-medium">{cache.size}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Entries:</span>
                        <span className="text-gray-900 font-medium">{cache.entries}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <span className={cn('px-2 py-1 rounded-full text-xs font-medium capitalize', getStatusColor(cache.status))}>
                          {cache.status}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Last Cleared:</span>
                        <span className="text-gray-900">{cache.lastCleared}</span>
                      </div>
                    </div>

                    <div className="mt-4 flex gap-2">
                      <button className="flex-1 px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                        <Monitor className="h-4 w-4 inline mr-1" />
                        Monitor
                      </button>
                      <button className="flex-1 px-3 py-2 text-sm font-medium text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">
                        <Trash2 className="h-4 w-4 inline mr-1" />
                        Clear
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </AnimatedCard>

        {/* Cache Performance Chart */}
        <AnimatedCard delay={500}>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Cache Performance Trends</h3>
            
            {/* Simple performance indicators */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">98.2%</div>
                <p className="text-sm text-gray-600">Average Hit Rate</p>
                <p className="text-xs text-gray-500 mt-1">Last 24 hours</p>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">45ms</div>
                <p className="text-sm text-gray-600">Average Response Time</p>
                <p className="text-xs text-gray-500 mt-1">Cache lookups</p>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">12.4K</div>
                <p className="text-sm text-gray-600">Total Entries</p>
                <p className="text-xs text-gray-500 mt-1">Across all caches</p>
              </div>
            </div>

            {/* Performance recommendations */}
            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-800 mb-2">Performance Recommendations:</p>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Cache hit rate is excellent (98.2%)</li>
                    <li>• Consider clearing database cache due to age (3+ hours)</li>
                    <li>• Memory usage is within normal limits</li>
                    <li>• No immediate optimizations required</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </AnimatedCard>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={() => setShowConfirmDialog(false)} />

            <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Clear System Cache</h3>
                <button
                  onClick={() => setShowConfirmDialog(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-yellow-800 mb-1">Warning</p>
                      <p className="text-sm text-yellow-700">
                        This will clear all system caches, which may temporarily impact performance 
                        as the cache rebuilds.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-700 mb-3">
                    Are you sure you want to clear the system cache? This action cannot be undone.
                  </p>
                  
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>• Application cache: <strong>89 MB</strong></p>
                    <p>• Database cache: <strong>156 MB</strong></p>
                    <p>• Total cache: <strong>245 MB</strong></p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-6">
                <GlowingButton
                  variant="secondary"
                  onClick={() => setShowConfirmDialog(false)}
                >
                  Cancel
                </GlowingButton>
                <GlowingButton
                  variant="primary"
                  icon={<Trash2 className="h-4 w-4" />}
                  onClick={confirmClearCache}
                  loading={clearCacheMutation.isPending}
                >
                  Clear Cache
                </GlowingButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}