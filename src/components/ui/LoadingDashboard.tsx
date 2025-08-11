'use client';

import { Activity } from 'lucide-react';

export function LoadingDashboard() {
  return (
    <div className='space-y-8 animate-pulse'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          <div className='w-8 h-8 bg-gray-200 rounded-lg'></div>
          <div>
            <div className='h-6 bg-gray-200 rounded w-48 mb-2'></div>
            <div className='h-4 bg-gray-200 rounded w-32'></div>
          </div>
        </div>
        <div className='w-32 h-9 bg-gray-200 rounded-lg'></div>
      </div>

      {/* Metrics Cards */}
      <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4'>
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className='bg-white rounded-xl border border-gray-200 p-6'>
            <div className='flex items-center justify-between mb-4'>
              <div className='w-12 h-12 bg-gray-200 rounded-xl'></div>
              <div className='w-16 h-6 bg-gray-200 rounded'></div>
            </div>
            <div className='space-y-2'>
              <div className='h-4 bg-gray-200 rounded w-24'></div>
              <div className='h-8 bg-gray-200 rounded w-20'></div>
              <div className='h-3 bg-gray-200 rounded w-16'></div>
            </div>
            <div className='mt-4 h-2 bg-gray-200 rounded-full'></div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className='grid grid-cols-1 gap-8 lg:grid-cols-3'>
        {/* Revenue Chart */}
        <div className='lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6'>
          <div className='flex items-center justify-between mb-6'>
            <div>
              <div className='h-5 bg-gray-200 rounded w-32 mb-2'></div>
              <div className='h-4 bg-gray-200 rounded w-24'></div>
            </div>
          </div>
          <div className='h-80 bg-gray-200 rounded-lg'></div>
        </div>

        {/* Performance Ring */}
        <div className='bg-white rounded-xl border border-gray-200 p-6'>
          <div className='text-center mb-6'>
            <div className='h-5 bg-gray-200 rounded w-24 mx-auto mb-2'></div>
            <div className='h-4 bg-gray-200 rounded w-32 mx-auto'></div>
          </div>
          <div className='flex justify-center mb-6'>
            <div className='w-35 h-35 bg-gray-200 rounded-full'></div>
          </div>
          <div className='space-y-3'>
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className='flex items-center justify-between'>
                <div className='h-4 bg-gray-200 rounded w-12'></div>
                <div className='flex items-center gap-2'>
                  <div className='w-16 h-2 bg-gray-200 rounded-full'></div>
                  <div className='h-4 bg-gray-200 rounded w-8'></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Categories and Recent Orders */}
      <div className='grid grid-cols-1 gap-8 lg:grid-cols-2'>
        {/* Categories */}
        <div className='bg-white rounded-xl border border-gray-200 p-6'>
          <div className='flex items-center justify-between mb-6'>
            <div>
              <div className='h-5 bg-gray-200 rounded w-36 mb-2'></div>
              <div className='h-4 bg-gray-200 rounded w-32'></div>
            </div>
          </div>
          <div className='space-y-4'>
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className='flex items-center justify-between'>
                <div className='flex items-center gap-3'>
                  <div className='w-3 h-3 bg-gray-200 rounded-full'></div>
                  <div className='h-4 bg-gray-200 rounded w-24'></div>
                </div>
                <div className='flex items-center gap-3'>
                  <div className='w-24 h-2 bg-gray-200 rounded-full'></div>
                  <div className='h-4 bg-gray-200 rounded w-8'></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        <div className='bg-white rounded-xl border border-gray-200 p-6'>
          <div className='flex items-center justify-between mb-6'>
            <div>
              <div className='h-5 bg-gray-200 rounded w-28 mb-2'></div>
              <div className='h-4 bg-gray-200 rounded w-32'></div>
            </div>
            <div className='w-20 h-8 bg-gray-200 rounded-lg'></div>
          </div>
          <div className='space-y-4'>
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className='flex items-center justify-between p-4 bg-gray-50 rounded-xl'
              >
                <div className='flex items-center gap-3'>
                  <div className='w-10 h-10 bg-gray-200 rounded-full'></div>
                  <div>
                    <div className='h-4 bg-gray-200 rounded w-24 mb-1'></div>
                    <div className='h-3 bg-gray-200 rounded w-16'></div>
                  </div>
                </div>
                <div className='text-right'>
                  <div className='h-4 bg-gray-200 rounded w-16 mb-1'></div>
                  <div className='h-6 bg-gray-200 rounded-full w-12'></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
