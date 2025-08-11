'use client';

import { Bell, Search, User, Sun, Moon, Command } from 'lucide-react';
import { MobileMenuButton } from './Sidebar';

interface HeaderProps {
  onMenuToggle: () => void;
}

export function Header({ onMenuToggle }: HeaderProps) {
  return (
    <header className='sticky top-0 z-10 flex h-16 items-center justify-between border-b border-gray-200/50 bg-white/80 px-4 backdrop-blur-md lg:px-6'>
      <div className='flex flex-1 items-center space-x-4'>
        <MobileMenuButton onClick={onMenuToggle} />

        <div className='relative w-full max-w-md'>
          <div className='absolute inset-y-0 left-0 flex items-center pl-3'>
            <Search className='h-4 w-4 text-gray-400' />
          </div>
          <input
            type='search'
            placeholder='Search anything...'
            className='w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 pl-10 pr-4 text-sm transition-all duration-200 placeholder:text-gray-500 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20'
          />
          <div className='absolute inset-y-0 right-0 flex items-center pr-3'>
            <kbd className='inline-flex items-center rounded border border-gray-200 bg-white px-2 py-1 text-xs font-medium text-gray-500'>
              <Command className='mr-1 h-3 w-3' />K
            </kbd>
          </div>
        </div>
      </div>

      <div className='flex items-center space-x-2'>
        {/* Theme Toggle */}
        <button className='relative rounded-xl p-2.5 text-gray-600 transition-all duration-200 hover:bg-gray-100 hover:text-gray-900'>
          <Sun className='h-5 w-5' />
        </button>

        {/* Notifications */}
        <button className='relative rounded-xl p-2.5 text-gray-600 transition-all duration-200 hover:bg-gray-100 hover:text-gray-900'>
          <Bell className='h-5 w-5' />
          <span className='absolute right-1 top-1 h-2 w-2 rounded-full bg-gradient-to-r from-red-500 to-pink-500'>
            <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75'></span>
          </span>
        </button>

        {/* User Profile */}
        <div className='ml-3 flex items-center space-x-3 rounded-xl bg-gray-50/50 p-2 transition-all duration-200 hover:bg-gray-100/50'>
          <div className='relative'>
            <div className='h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 p-0.5'>
              <div className='flex h-full w-full items-center justify-center rounded-full bg-white/20'>
                <User className='h-4 w-4 text-white' />
              </div>
            </div>
            <div className='absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-green-500'></div>
          </div>
          <div className='hidden text-sm sm:block'>
            <p className='font-medium text-gray-900'>Admin User</p>
            <p className='text-gray-500'>admin@digimall.ng</p>
          </div>
        </div>
      </div>
    </header>
  );
}
