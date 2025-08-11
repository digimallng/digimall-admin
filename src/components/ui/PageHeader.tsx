'use client';

import { LucideIcon } from 'lucide-react';
import { GlowingButton } from './AnimatedCard';

interface PageHeaderAction {
  label: string;
  icon: LucideIcon;
  variant?: 'primary' | 'secondary';
  onClick?: () => void;
  loading?: boolean;
  disabled?: boolean;
}

interface PageHeaderProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  actions?: PageHeaderAction[];
  gradient?: string;
}

export function PageHeader({
  title,
  description,
  icon: Icon,
  actions = [],
  gradient = 'from-blue-600/5 via-purple-600/5 to-pink-600/5',
}: PageHeaderProps) {
  return (
    <div className='relative'>
      <div
        className={`absolute inset-0 -z-10 bg-gradient-to-r ${gradient} rounded-2xl sm:rounded-3xl`}
      />
      <div className='p-4 lg:p-0'>
        <div className='space-y-4'>
          {/* Title and Description */}
          <div className='space-y-2'>
            <h1 className='text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent sm:text-2xl lg:text-3xl'>
              {title}
            </h1>
            <div className='flex items-start gap-2 text-gray-600'>
              {Icon && <Icon className='h-4 w-4 flex-shrink-0 mt-0.5' />}
              <p className='text-sm sm:text-base leading-relaxed'>{description}</p>
            </div>
          </div>

          {/* Actions */}
          {actions.length > 0 && (
            <div className='pt-2'>
              <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end'>
                {actions.map((action, index) => (
                  <GlowingButton
                    key={index}
                    size='sm'
                    variant={action.variant || 'secondary'}
                    icon={<action.icon className='h-4 w-4' />}
                    onClick={action.onClick}
                    loading={action.loading}
                    disabled={action.disabled}
                    className='w-full sm:w-auto justify-center sm:justify-start'
                  >
                    {action.label}
                  </GlowingButton>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
