'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import {
  LayoutDashboard,
  Users,
  Store,
  Package,
  ShoppingCart,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Zap,
  Bell,
  Shield,
  FileText,
  Gavel,
  Monitor,
  HeadphonesIcon,
  MessageCircle,
  Tag,
  CreditCard,
  Wallet,
  DollarSign,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useUnreadMessages } from '@/hooks/use-unread-messages';

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    gradient: 'from-blue-500 to-purple-600',
  },
  {
    name: 'Messages',
    href: '/messages',
    icon: MessageCircle,
    gradient: 'from-green-500 to-teal-600',
  },
  { name: 'Users', href: '/users', icon: Users, gradient: 'from-green-500 to-emerald-600' },
  { name: 'Vendors', href: '/vendors', icon: Store, gradient: 'from-orange-500 to-red-600' },
  {
    name: 'Vendor Performance',
    href: '/vendor-performance',
    icon: BarChart3,
    gradient: 'from-pink-500 to-rose-600',
  },
  { name: 'Products', href: '/products', icon: Package, gradient: 'from-purple-500 to-pink-600' },
  { name: 'Categories', href: '/categories', icon: Tag, gradient: 'from-indigo-500 to-purple-600' },
  { name: 'Orders', href: '/orders', icon: ShoppingCart, gradient: 'from-blue-500 to-cyan-600' },
  { name: 'Plans', href: '/plans', icon: CreditCard, gradient: 'from-emerald-500 to-teal-600' },
  { name: 'Escrow', href: '/escrow', icon: Wallet, gradient: 'from-blue-500 to-indigo-600' },
  {
    name: 'Commission',
    href: '/commissions',
    icon: DollarSign,
    gradient: 'from-green-500 to-emerald-600',
  },
  {
    name: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
    gradient: 'from-indigo-500 to-purple-600',
  },
  { name: 'Reports', href: '/reports', icon: FileText, gradient: 'from-cyan-500 to-blue-600' },
  { name: 'Disputes', href: '/disputes', icon: Gavel, gradient: 'from-red-500 to-pink-600' },
  { name: 'Security', href: '/security', icon: Shield, gradient: 'from-indigo-500 to-purple-600' },
  { name: 'System', href: '/system', icon: Monitor, gradient: 'from-teal-500 to-cyan-600' },
  {
    name: 'Support',
    href: '/support',
    icon: HeadphonesIcon,
    gradient: 'from-violet-500 to-purple-600',
  },
  {
    name: 'Notifications',
    href: '/notifications',
    icon: Bell,
    gradient: 'from-yellow-500 to-orange-600',
  },
  { name: 'Settings', href: '/settings', icon: Settings, gradient: 'from-gray-500 to-gray-700' },
];

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

function LogoutButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await signOut({ callbackUrl: '/auth/login' });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isLoading}
      className='group flex w-full items-center rounded-xl px-3 py-3 text-sm font-medium text-gray-300 transition-all duration-200 hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50 disabled:cursor-not-allowed'
    >
      <div className='mr-3 rounded-lg bg-gray-800 p-2 transition-all duration-200 group-hover:bg-red-500/20 flex items-center justify-center'>
        {isLoading ? (
          <div className='w-4 h-4 border-2 border-gray-400/30 border-t-gray-400 rounded-full animate-spin' />
        ) : (
          <LogOut className='h-4 w-4 flex-shrink-0' />
        )}
      </div>
      <span className='flex-1 text-left'>{isLoading ? 'Signing out...' : 'Sign out'}</span>
    </button>
  );
}

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { totalUnreadCount, getFormattedCount } = useUnreadMessages();

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className='fixed inset-0 z-20 bg-black/50 backdrop-blur-sm lg:hidden'
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-30 flex h-full w-64 flex-col transition-transform duration-300 ease-in-out lg:static lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full',
          'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900',
          'border-r border-slate-700/50 shadow-2xl lg:shadow-none'
        )}
      >
        {/* Header */}
        <div className='flex h-16 items-center justify-between px-6 border-b border-slate-700/50'>
          <div className='flex items-center space-x-3'>
            <img src={'icon.svg'} alt='Logo' className='h-8 w-8 rounded-full' />
            <h1 className='text-xl font-bold text-white'>digiMall</h1>
          </div>
          <button
            onClick={onToggle}
            className='rounded-lg p-2 text-gray-400 hover:bg-gray-800 hover:text-white lg:hidden transition-colors'
          >
            <X className='h-5 w-5' />
          </button>
        </div>

        {/* Navigation */}
        <nav className='flex-1 space-y-1 px-3 py-4 overflow-y-auto'>
          {navigation.map((item, index) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => onToggle()}
                className={cn(
                  'group relative flex items-center rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200',
                  'hover:bg-white/5 hover:backdrop-blur-sm',
                  isActive ? 'bg-white/10 text-white shadow-lg' : 'text-gray-300 hover:text-white'
                )}
                style={{
                  animationDelay: `${index * 50}ms`,
                }}
              >
                {/* Active indicator */}
                {isActive && (
                  <div
                    className={cn(
                      'absolute left-0 top-0 h-full w-1 rounded-r-full bg-gradient-to-b',
                      item.gradient
                    )}
                  />
                )}

                {/* Icon background */}
                <div
                  className={cn(
                    'mr-3 rounded-lg p-2 transition-all duration-200 flex items-center justify-center',
                    isActive
                      ? `bg-gradient-to-r ${item.gradient} shadow-lg`
                      : 'bg-gray-800 group-hover:bg-gray-700'
                  )}
                >
                  <item.icon className='h-4 w-4 text-white flex-shrink-0' />
                </div>

                <span className='truncate flex-1'>{item.name}</span>

                {/* Unread badge for Messages */}
                {item.name === 'Messages' && totalUnreadCount > 0 && (
                  <span className='ml-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium bg-blue-500 text-white rounded-full min-w-[20px]'>
                    {getFormattedCount(totalUnreadCount)}
                  </span>
                )}

                {/* Hover effect */}
                <div
                  className={cn(
                    'absolute inset-0 rounded-xl bg-gradient-to-r opacity-0 transition-opacity duration-200',
                    'group-hover:opacity-5',
                    item.gradient
                  )}
                />
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className='border-t border-gray-700/50 p-4 mt-auto'>
          <div className='mb-4 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-600/10 p-3 border border-blue-500/20'>
            <div className='flex items-center space-x-3'>
              <div className='h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center'>
                <span className='text-white font-bold text-sm'>
                  {session?.user?.firstName?.charAt(0) || session?.user?.name?.charAt(0) || 'A'}
                </span>
              </div>
              <div className='min-w-0 flex-1'>
                <p className='truncate text-sm font-medium text-white'>
                  {session?.user?.name || `${session?.user?.firstName} ${session?.user?.lastName}`}
                </p>
                <p className='truncate text-xs text-gray-400'>{session?.user?.email}</p>
                <div className='flex items-center mt-1'>
                  <span className='inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-500/20 text-blue-300'>
                    {session?.user?.role}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <LogoutButton />
        </div>
      </div>
    </>
  );
}

export function MobileMenuButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className='rounded-lg p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 lg:hidden'
    >
      <Menu className='h-6 w-6' />
    </button>
  );
}
