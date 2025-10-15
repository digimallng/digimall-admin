import { EscrowStatistics } from '@/lib/api/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Shield, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  Clock,
  DollarSign,
  Activity,
  CheckCircle
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface EscrowStatsProps {
  statistics?: EscrowStatistics;
  loading?: boolean;
}

export function EscrowStats({ statistics, loading }: EscrowStatsProps) {
  if (loading || !statistics) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-full"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value?: number) => {
    if (value === undefined || value === null) return '0.0%';
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const getTrendIcon = (value?: number) => {
    if (!value) return Activity;
    return value > 0 ? TrendingUp : value < 0 ? TrendingDown : Activity;
  };

  const getTrendColor = (value?: number) => {
    if (!value) return 'text-gray-600';
    return value > 0 ? 'text-green-600' : value < 0 ? 'text-red-600' : 'text-gray-600';
  };

  const stats = [
    {
      title: 'Total Escrows',
      value: (statistics.totalEscrows || 0).toLocaleString(),
      change: statistics.totalEscrowsChange,
      icon: Shield,
      description: 'All time escrows',
    },
    {
      title: 'Total Volume',
      value: formatCurrency(statistics.totalVolume || 0),
      change: statistics.totalVolumeChange,
      icon: DollarSign,
      description: 'All time volume',
    },
    {
      title: 'Active Escrows',
      value: (statistics.activeEscrows || 0).toLocaleString(),
      change: statistics.activeEscrowsChange,
      icon: Activity,
      description: 'Currently active',
    },
    {
      title: 'Completed Today',
      value: (statistics.completedToday || 0).toLocaleString(),
      change: statistics.completedTodayChange,
      icon: CheckCircle,
      description: 'Released or refunded',
    },
    {
      title: 'Disputed',
      value: (statistics.disputedEscrows || 0).toLocaleString(),
      change: statistics.disputedEscrowsChange,
      icon: AlertTriangle,
      description: 'Requiring attention',
      highlight: (statistics.disputedEscrows || 0) > 0,
    },
    {
      title: 'Expiring Soon',
      value: (statistics.expiringSoon || 0).toLocaleString(),
      change: statistics.expiringSoonChange,
      icon: Clock,
      description: 'Within 24 hours',
      highlight: (statistics.expiringSoon || 0) > 0,
    },
    {
      title: 'Avg. Processing Time',
      value: `${statistics.averageProcessingTime || 0}h`,
      change: statistics.averageProcessingTimeChange,
      icon: Clock,
      description: 'Hours to complete',
    },
    {
      title: 'Success Rate',
      value: `${(statistics.successRate || 0).toFixed(1)}%`,
      change: statistics.successRateChange,
      icon: CheckCircle,
      description: 'Non-disputed escrows',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        const TrendIcon = getTrendIcon(stat.change);
        const trendColor = getTrendColor(stat.change);

        return (
          <Card key={index} className={`relative ${stat.highlight ? 'ring-2 ring-red-200' : ''}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <Icon className="h-4 w-4 text-gray-400" />
            </CardHeader>
            
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {stat.description}
                  </p>
                </div>
                
                {stat.change !== undefined && (
                  <div className={`flex items-center space-x-1 ${trendColor}`}>
                    <TrendIcon className="h-3 w-3" />
                    <span className="text-xs font-medium">
                      {formatPercentage(stat.change)}
                    </span>
                  </div>
                )}
              </div>
              
              {stat.highlight && (
                <Badge 
                  variant="outline" 
                  className="absolute top-2 right-2 text-xs text-red-600 border-red-200"
                >
                  Action Required
                </Badge>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}