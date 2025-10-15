import { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: number;
  change: number;
  icon: LucideIcon;
  iconBg: string;
  formatter: (value: number) => string;
}

export const MetricCard = memo(function MetricCard({
  title,
  value,
  change,
  icon: Icon,
  iconBg,
  formatter,
}: MetricCardProps) {
  return (
    <Card className='overflow-hidden'>
      <CardHeader className='flex flex-row items-center justify-between pb-2'>
        <CardTitle className='text-sm font-medium text-muted-foreground'>
          {title}
        </CardTitle>
        <div className={cn('p-2 rounded-lg', iconBg)}>
          <Icon className='h-4 w-4 text-white' />
        </div>
      </CardHeader>
      <CardContent>
        <div className='text-2xl font-bold'>{formatter(value)}</div>
        <div className='flex items-center gap-1 mt-1'>
          {change >= 0 ? (
            <>
              <TrendingUp className='h-4 w-4 text-green-500' />
              <span className='text-xs text-green-500 font-medium'>
                +{Math.abs(change).toFixed(1)}%
              </span>
            </>
          ) : (
            <>
              <TrendingDown className='h-4 w-4 text-red-500' />
              <span className='text-xs text-red-500 font-medium'>
                {change.toFixed(1)}%
              </span>
            </>
          )}
          <span className='text-xs text-muted-foreground ml-1'>
            from last month
          </span>
        </div>
        <Progress
          value={Math.min(Math.abs(change) * 10, 100)}
          className='mt-3 h-1'
        />
      </CardContent>
    </Card>
  );
});
