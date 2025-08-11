import { cn } from '@/lib/utils/cn';

interface CardProps {
  className?: string;
  children: React.ReactNode;
  glass?: boolean;
  gradient?: boolean;
  hover?: boolean;
}

export function Card({
  className,
  children,
  glass = false,
  gradient = false,
  hover = true,
}: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-gray-200/50 bg-white shadow-lg transition-all duration-300',
        hover && 'hover:shadow-xl hover:-translate-y-1',
        glass && 'bg-white/80 backdrop-blur-sm',
        gradient && 'bg-gradient-to-br from-white to-gray-50',
        className
      )}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  className?: string;
  children: React.ReactNode;
}

export function CardHeader({ className, children }: CardHeaderProps) {
  return <div className={cn('mb-6 p-6 pb-0', className)}>{children}</div>;
}

interface CardTitleProps {
  className?: string;
  children: React.ReactNode;
}

export function CardTitle({ className, children }: CardTitleProps) {
  return <h3 className={cn('text-xl font-semibold text-gray-900', className)}>{children}</h3>;
}

interface CardContentProps {
  className?: string;
  children: React.ReactNode;
}

export function CardContent({ className, children }: CardContentProps) {
  return <div className={cn('p-6', className)}>{children}</div>;
}

interface GlassCardProps {
  className?: string;
  children: React.ReactNode;
}

export function GlassCard({ className, children }: GlassCardProps) {
  return (
    <div
      className={cn(
        'glass rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md shadow-xl',
        'transition-all duration-300 hover:bg-white/20 hover:shadow-2xl',
        className
      )}
    >
      {children}
    </div>
  );
}

interface StatsCardProps {
  title: string;
  value: string | number;
  change: number;
  icon: React.ElementType;
  gradient: string;
  className?: string;
}

export function StatsCard({
  title,
  value,
  change,
  icon: Icon,
  gradient,
  className,
}: StatsCardProps) {
  return (
    <Card className={cn('group cursor-pointer', className)}>
      <CardContent>
        <div className='flex items-center justify-between'>
          <div className='space-y-2'>
            <p className='text-sm font-medium text-gray-600'>{title}</p>
            <p className='text-3xl font-bold text-gray-900'>{value}</p>
            <div className='flex items-center gap-2'>
              <div
                className={cn(
                  'flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold',
                  change > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                )}
              >
                <span>
                  {change > 0 ? '+' : ''}
                  {change}%
                </span>
              </div>
              <span className='text-xs text-gray-500'>vs last month</span>
            </div>
          </div>
          <div
            className={cn(
              'rounded-xl p-3 bg-gradient-to-r transition-all duration-300',
              gradient,
              'group-hover:scale-110 group-hover:rotate-3'
            )}
          >
            <Icon className='h-6 w-6 text-white' />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
