'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils/cn';

interface AnimatedCardProps {
  className?: string;
  children: React.ReactNode;
  delay?: number;
  gradient?: string;
  hover?: boolean;
}

export function AnimatedCard({
  className,
  children,
  delay = 0,
  gradient,
  hover = true,
}: AnimatedCardProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border border-gray-200/50 bg-white/80 backdrop-blur-sm shadow-xl',
        'transition-all duration-300 ease-out',
        hover && 'hover:shadow-2xl hover:-translate-y-1',
        gradient && 'bg-gradient-to-br',
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4',
        className
      )}
      style={{
        transitionDelay: `${delay}ms`,
      }}
    >
      {gradient && <div className={cn('absolute inset-0 opacity-5', gradient)} />}
      <div className='relative z-10'>{children}</div>
    </div>
  );
}

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export function AnimatedNumber({
  value,
  duration = 2000,
  prefix = '',
  suffix = '',
  className,
}: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationId: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function for smooth animation
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.floor(easeOut * value);

      setDisplayValue(currentValue);

      if (progress < 1) {
        animationId = requestAnimationFrame(animate);
      }
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [value, duration]);

  return (
    <span className={className}>
      {prefix}
      {displayValue.toLocaleString()}
      {suffix}
    </span>
  );
}

interface GlowingButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export function GlowingButton({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  className,
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
}: GlowingButtonProps) {
  const variants = {
    primary: 'bg-gradient-to-r from-orange-500 to-orange-600 shadow-orange-500/25',
    secondary: 'bg-gradient-to-r from-blue-500 to-blue-600 shadow-gray-500/25',
    success: 'bg-gradient-to-r from-green-500 to-emerald-600 shadow-green-500/25',
    danger: 'bg-gradient-to-r from-red-500 to-pink-600 shadow-red-500/25',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm min-h-[36px]',
    md: 'px-6 py-3 text-base min-h-[44px]',
    lg: 'px-8 py-4 text-lg min-h-[52px]',
  };

  return (
    <button
      onClick={loading ? undefined : onClick}
      disabled={disabled || loading}
      className={cn(
        'relative overflow-hidden rounded-lg font-medium text-white transition-all duration-300',
        'flex items-center justify-center gap-2 whitespace-nowrap',
        'hover:shadow-lg hover:scale-105 active:scale-95',
        'before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/20 before:to-transparent',
        'before:translate-x-[-100%] before:transition-transform before:duration-500',
        'hover:before:translate-x-[100%]',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100',
        variants[variant],
        sizes[size],
        className
      )}
    >
      <span className='relative z-10 flex items-center justify-center gap-2'>
        {loading ? (
          <div className='h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white' />
        ) : icon && iconPosition === 'left' ? (
          <span className='flex items-center justify-center'>{icon}</span>
        ) : null}
        <span className='flex items-center'>{children}</span>
        {!loading && icon && iconPosition === 'right' && (
          <span className='flex items-center justify-center'>{icon}</span>
        )}
      </span>
    </button>
  );
}

interface ProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  className?: string;
}

export function ProgressRing({
  progress,
  size = 120,
  strokeWidth = 8,
  color = '#3b82f6',
  className,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg width={size} height={size} className='transform -rotate-90'>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke='currentColor'
          strokeWidth={strokeWidth}
          fill='none'
          className='text-gray-200'
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill='none'
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap='round'
          className='transition-all duration-1000 ease-out'
        />
      </svg>
      <div className='absolute inset-0 flex items-center justify-center'>
        <span className='text-xl font-bold'>{progress}%</span>
      </div>
    </div>
  );
}
