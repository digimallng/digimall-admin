'use client';

import { useState } from 'react';
import {
  MessageCircle,
  ChevronDown,
  User,
  Store,
  UserCheck,
  Phone,
  Mail,
  Search,
  Plus,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface QuickContact {
  id: string;
  name: string;
  email: string;
  type: 'customer' | 'vendor' | 'staff';
  isOnline: boolean;
  lastSeen?: Date;
  avatar?: string;
  role?: string;
  department?: string;
}

interface QuickContactMenuProps {
  className?: string;
}

export function QuickContactMenu({ className }: QuickContactMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [contacts] = useState<QuickContact[]>([
    {
      id: 'customer-1',
      name: 'John Doe',
      email: 'john@example.com',
      type: 'customer',
      isOnline: true,
    },
    {
      id: 'customer-2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      type: 'customer',
      isOnline: false,
      lastSeen: new Date(Date.now() - 3600000),
    },
    {
      id: 'vendor-1',
      name: 'TechStore Nigeria',
      email: 'support@techstore.ng',
      type: 'vendor',
      isOnline: true,
    },
    {
      id: 'vendor-2',
      name: 'Fashion Hub',
      email: 'info@fashionhub.ng',
      type: 'vendor',
      isOnline: false,
      lastSeen: new Date(Date.now() - 7200000),
    },
    {
      id: 'staff-1',
      name: 'Sarah Support',
      email: 'sarah@digimall.ng',
      type: 'staff',
      isOnline: true,
      role: 'Customer Support',
      department: 'Support',
    },
    {
      id: 'staff-2',
      name: 'Mike Manager',
      email: 'mike@digimall.ng',
      type: 'staff',
      isOnline: true,
      role: 'Operations Manager',
      department: 'Operations',
    },
  ]);

  const filteredContacts = contacts.filter(
    contact =>
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getContactIcon = (type: string) => {
    switch (type) {
      case 'customer':
        return <User className='h-4 w-4 text-blue-500' />;
      case 'vendor':
        return <Store className='h-4 w-4 text-purple-500' />;
      case 'staff':
        return <UserCheck className='h-4 w-4 text-green-500' />;
      default:
        return <User className='h-4 w-4 text-gray-500' />;
    }
  };

  const getContactTypeColor = (type: string) => {
    switch (type) {
      case 'customer':
        return 'bg-blue-100 text-blue-800';
      case 'vendor':
        return 'bg-purple-100 text-purple-800';
      case 'staff':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleStartChat = (contact: QuickContact) => {
    if (typeof window !== 'undefined' && (window as any).startChatConversation) {
      (window as any).startChatConversation(
        {
          id: contact.id,
          name: contact.name,
          email: contact.email,
          type: contact.type,
          isOnline: contact.isOnline,
          lastSeen: contact.lastSeen,
          role: contact.role,
          department: contact.department,
        },
        `Hi ${contact.name}, I hope you're doing well. I wanted to reach out to discuss something with you.`
      );
    }
    setIsOpen(false);
  };

  return (
    <div className={cn('relative', className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className='flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl'
      >
        <MessageCircle className='h-5 w-5' />
        <span>Quick Chat</span>
        <ChevronDown
          className={cn(
            'h-4 w-4 transition-transform duration-200',
            isOpen && 'transform rotate-180'
          )}
        />
      </button>

      {isOpen && (
        <div className='absolute top-full left-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50'>
          <div className='p-4 border-b border-gray-200'>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400' />
              <input
                type='text'
                placeholder='Search contacts...'
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
            </div>
          </div>

          <div className='max-h-80 overflow-y-auto'>
            {filteredContacts.length === 0 ? (
              <div className='p-4 text-center text-gray-500'>No contacts found</div>
            ) : (
              filteredContacts.map(contact => (
                <div
                  key={contact.id}
                  className='flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0'
                  onClick={() => handleStartChat(contact)}
                >
                  <div className='relative'>
                    <div className='w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold'>
                      {contact.name?.charAt(0)}
                    </div>
                    <div
                      className={cn(
                        'absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white',
                        contact.isOnline ? 'bg-green-500' : 'bg-gray-400'
                      )}
                    />
                  </div>

                  <div className='flex-1 min-w-0'>
                    <div className='flex items-center gap-2'>
                      <p className='font-medium text-gray-900 truncate'>{contact.name}</p>
                      <span
                        className={cn(
                          'px-2 py-1 text-xs rounded-full',
                          getContactTypeColor(contact.type)
                        )}
                      >
                        {contact.type}
                      </span>
                    </div>
                    <p className='text-sm text-gray-600 truncate'>{contact.email}</p>
                    {contact.role && (
                      <p className='text-xs text-gray-500 truncate'>
                        {contact.role} • {contact.department}
                      </p>
                    )}
                  </div>

                  <div className='flex items-center gap-2'>
                    {getContactIcon(contact.type)}
                    <div className='flex flex-col items-end'>
                      <span
                        className={cn(
                          'text-xs',
                          contact.isOnline ? 'text-green-600' : 'text-gray-500'
                        )}
                      >
                        {contact.isOnline ? 'Online' : 'Offline'}
                      </span>
                      {!contact.isOnline && contact.lastSeen && (
                        <span className='text-xs text-gray-400'>
                          {contact.lastSeen.toLocaleTimeString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className='p-3 border-t border-gray-200'>
            <button className='w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors'>
              <Plus className='h-4 w-4' />
              Add New Contact
            </button>
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && <div className='fixed inset-0 z-40' onClick={() => setIsOpen(false)} />}
    </div>
  );
}
