'use client';

import { LucideIcon } from 'lucide-react';
import { AnimatedCard, AnimatedNumber } from './AnimatedCard';

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  gradient?: string;
  change?: number;
  changeLabel?: string;
  prefix?: string;
  suffix?: string;
  delay?: number;
  format?: 'number' | 'currency' | 'percentage';
  isLoading?: boolean;
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  gradient = 'from-blue-500 to-purple-600',
  change,
  changeLabel,
  prefix,
  suffix,
  delay = 0,
  format = 'number',
  isLoading = false,
}: StatsCardProps) {
  const formatValue = (val: number | string) => {
    // Handle undefined, null, or invalid values
    if (val === undefined || val === null) return '0';
    if (typeof val === 'string') return val;
    if (typeof val !== 'number' || isNaN(val)) return '0';

    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-NG', {
          style: 'currency',
          currency: 'NGN',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(val);
      case 'percentage':
        return `${val}%`;
      default:
        return val.toLocaleString();
    }
  };

  return (
    <AnimatedCard delay={delay} className='group cursor-pointer'>
      <div className='p-6'>
        <div className='flex items-center justify-between mb-4'>
          <div
            className={`rounded-xl p-3 bg-gradient-to-r ${gradient} transition-all duration-300 group-hover:scale-110 group-hover:rotate-3`}
          >
            <Icon className='h-6 w-6 text-white' />
          </div>
          {change !== undefined && (
            <div className='flex items-center gap-1'>
              <span
                className={`text-sm font-semibold ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}
              >
                {change >= 0 ? '+' : ''}
                {change}%
              </span>
            </div>
          )}
        </div>
        <div className='space-y-2'>
          <p className='text-sm font-medium text-gray-600'>{title}</p>
          <p className='text-3xl font-bold text-gray-900'>
            {isLoading ? (
              <div className='animate-pulse bg-gray-200 h-8 w-16 rounded' />
            ) : typeof value === 'number' && format !== 'currency' ? (
              <>
                {prefix}
                <AnimatedNumber value={value || 0} />
                {suffix}
              </>
            ) : (
              formatValue(value)
            )}
          </p>
          {changeLabel && <p className='text-xs text-gray-500'>{changeLabel}</p>}
        </div>
      </div>
    </AnimatedCard>
  );
}
