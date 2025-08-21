import { AnimatedCard, AnimatedNumber } from '@/components/ui/AnimatedCard';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface MetricCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
    period?: string;
  };
  suffix?: string;
  prefix?: string;
  decimals?: number;
  className?: string;
  delay?: number;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'indigo' | 'pink';
  description?: string;
}

const colorConfig = {
  blue: 'from-blue-500 to-blue-600',
  green: 'from-green-500 to-green-600',
  yellow: 'from-yellow-500 to-yellow-600',
  red: 'from-red-500 to-red-600',
  purple: 'from-purple-500 to-purple-600',
  indigo: 'from-indigo-500 to-indigo-600',
  pink: 'from-pink-500 to-pink-600',
};

export function MetricCard({
  title,
  value,
  icon: Icon,
  trend,
  suffix,
  prefix,
  decimals = 0,
  className,
  delay = 0,
  color = 'blue',
  description,
}: MetricCardProps) {
  return (
    <AnimatedCard delay={delay} className={className}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className={cn(
            'rounded-xl p-3 bg-gradient-to-r text-white',
            colorConfig[color]
          )}>
            <Icon className="h-6 w-6" />
          </div>
          {trend && (
            <div className="flex items-center gap-1">
              {trend.isPositive ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
              <span className={cn(
                'text-sm font-semibold',
                trend.isPositive ? 'text-green-500' : 'text-red-500'
              )}>
                {trend.isPositive ? '+' : ''}{trend.value}%
              </span>
            </div>
          )}
        </div>

        {/* Value */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900">
            {prefix}
            <AnimatedNumber 
              value={value} 
              decimals={decimals}
              suffix={suffix}
            />
          </p>
          {description && (
            <p className="text-xs text-gray-500">{description}</p>
          )}
          {trend?.period && (
            <p className="text-xs text-gray-500">{trend.period}</p>
          )}
        </div>
      </div>
    </AnimatedCard>
  );
}