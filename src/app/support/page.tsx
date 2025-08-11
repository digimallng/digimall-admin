'use client';

import { useState, useEffect } from 'react';
import { AnimatedCard, GlowingButton, AnimatedNumber } from '@/components/ui/AnimatedCard';
import {
  MessageCircle,
  Phone,
  Mail,
  Clock,
  CheckCircle,
  AlertTriangle,
  User,
  Calendar,
  Star,
  Search,
  Filter,
  Eye,
  MessageSquare,
  HeadphonesIcon,
  Settings,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Zap,
  Target,
  Award,
  ThumbsUp,
  ThumbsDown,
  FileText,
  Download,
  RefreshCw,
  Plus,
  ArrowRight,
  Activity,
  Gauge,
  Timer,
  UserCheck,
  Headphones,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import { format } from 'date-fns';
import { cn } from '@/lib/utils/cn';

interface SupportTicket {
  id: string;
  ticketNumber: string;
  subject: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  category: 'technical' | 'billing' | 'general' | 'complaint' | 'feature_request';
  channel: 'email' | 'phone' | 'chat' | 'social';
  customerId: string;
  customerName: string;
  customerEmail: string;
  assignedTo?: string;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  firstResponseTime?: number; // minutes
  resolutionTime?: number; // minutes
  satisfactionRating?: number;
  tags: string[];
}

interface SupportAgent {
  id: string;
  name: string;
  email: string;
  department: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  activeTickets: number;
  resolvedToday: number;
  avgResponseTime: number;
  satisfactionScore: number;
  specialties: string[];
  lastActive: Date;
}

const mockSupportTickets: SupportTicket[] = [
  {
    id: '1',
    ticketNumber: 'TKT-2024-001',
    subject: 'Unable to process payment',
    description: 'Customer experiencing issues with payment processing during checkout',
    priority: 'high',
    status: 'in_progress',
    category: 'technical',
    channel: 'email',
    customerId: 'CUST-001',
    customerName: 'John Doe',
    customerEmail: 'john.doe@example.com',
    assignedTo: 'Sarah Johnson',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
    firstResponseTime: 15,
    tags: ['payment', 'checkout', 'urgent'],
  },
  {
    id: '2',
    ticketNumber: 'TKT-2024-002',
    subject: 'Refund request for order #12345',
    description: 'Customer requesting refund for damaged product',
    priority: 'medium',
    status: 'open',
    category: 'billing',
    channel: 'chat',
    customerId: 'CUST-002',
    customerName: 'Jane Smith',
    customerEmail: 'jane.smith@example.com',
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
    tags: ['refund', 'damaged', 'order'],
  },
  {
    id: '3',
    ticketNumber: 'TKT-2024-003',
    subject: 'Account login issues',
    description: 'Customer unable to login to their account',
    priority: 'medium',
    status: 'resolved',
    category: 'technical',
    channel: 'phone',
    customerId: 'CUST-003',
    customerName: 'Mike Johnson',
    customerEmail: 'mike.johnson@example.com',
    assignedTo: 'David Wilson',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 20 * 60 * 60 * 1000),
    resolvedAt: new Date(Date.now() - 20 * 60 * 60 * 1000),
    firstResponseTime: 8,
    resolutionTime: 240,
    satisfactionRating: 5,
    tags: ['login', 'account', 'resolved'],
  },
  {
    id: '4',
    ticketNumber: 'TKT-2024-004',
    subject: 'Feature request: Dark mode',
    description: 'Customer requesting dark mode feature for better user experience',
    priority: 'low',
    status: 'open',
    category: 'feature_request',
    channel: 'email',
    customerId: 'CUST-004',
    customerName: 'Sarah Williams',
    customerEmail: 'sarah.williams@example.com',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    tags: ['feature', 'ui', 'enhancement'],
  },
];

const mockSupportAgents: SupportAgent[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@digimall.ng',
    department: 'Technical Support',
    status: 'online',
    activeTickets: 5,
    resolvedToday: 8,
    avgResponseTime: 12,
    satisfactionScore: 4.8,
    specialties: ['payments', 'technical', 'api'],
    lastActive: new Date(),
  },
  {
    id: '2',
    name: 'David Wilson',
    email: 'david.wilson@digimall.ng',
    department: 'Customer Success',
    status: 'busy',
    activeTickets: 3,
    resolvedToday: 6,
    avgResponseTime: 18,
    satisfactionScore: 4.6,
    specialties: ['billing', 'accounts', 'refunds'],
    lastActive: new Date(Date.now() - 30 * 60 * 1000),
  },
  {
    id: '3',
    name: 'Emily Davis',
    email: 'emily.davis@digimall.ng',
    department: 'General Support',
    status: 'away',
    activeTickets: 2,
    resolvedToday: 4,
    avgResponseTime: 25,
    satisfactionScore: 4.4,
    specialties: ['general', 'orders', 'shipping'],
    lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
];

export default function SupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>(mockSupportTickets);
  const [agents, setAgents] = useState<SupportAgent[]>(mockSupportAgents);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [channelFilter, setChannelFilter] = useState<string>('all');
  const [showTicketDetails, setShowTicketDetails] = useState(false);
  const [activeTab, setActiveTab] = useState<'tickets' | 'agents' | 'analytics'>('tickets');

  const supportMetrics = [
    { time: '00:00', tickets: 12, resolved: 8, pending: 4 },
    { time: '04:00', tickets: 8, resolved: 6, pending: 2 },
    { time: '08:00', tickets: 25, resolved: 18, pending: 7 },
    { time: '12:00', tickets: 35, resolved: 28, pending: 7 },
    { time: '16:00', tickets: 42, resolved: 35, pending: 7 },
    { time: '20:00', tickets: 28, resolved: 24, pending: 4 },
  ];

  const channelData = [
    { name: 'Email', count: 45, percentage: 35 },
    { name: 'Chat', count: 38, percentage: 30 },
    { name: 'Phone', count: 32, percentage: 25 },
    { name: 'Social', count: 13, percentage: 10 },
  ];

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch =
      ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
    const matchesChannel = channelFilter === 'all' || ticket.channel === channelFilter;

    return matchesSearch && matchesStatus && matchesPriority && matchesChannel;
  });

  const stats = {
    totalTickets: tickets.length,
    openTickets: tickets.filter(t => t.status === 'open').length,
    inProgressTickets: tickets.filter(t => t.status === 'in_progress').length,
    resolvedTickets: tickets.filter(t => t.status === 'resolved').length,
    avgResponseTime:
      tickets
        .filter(t => t.firstResponseTime)
        .reduce((sum, t) => sum + (t.firstResponseTime || 0), 0) /
        tickets.filter(t => t.firstResponseTime).length || 0,
    avgResolutionTime:
      tickets.filter(t => t.resolutionTime).reduce((sum, t) => sum + (t.resolutionTime || 0), 0) /
        tickets.filter(t => t.resolutionTime).length || 0,
    satisfactionScore:
      tickets
        .filter(t => t.satisfactionRating)
        .reduce((sum, t) => sum + (t.satisfactionRating || 0), 0) /
        tickets.filter(t => t.satisfactionRating).length || 0,
    agentsOnline: agents.filter(a => a.status === 'online').length,
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getAgentStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-100 text-green-800';
      case 'away':
        return 'bg-yellow-100 text-yellow-800';
      case 'busy':
        return 'bg-orange-100 text-orange-800';
      case 'offline':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'email':
        return Mail;
      case 'phone':
        return Phone;
      case 'chat':
        return MessageCircle;
      case 'social':
        return MessageSquare;
      default:
        return MessageCircle;
    }
  };

  const handleTicketStatusUpdate = (ticketId: string, newStatus: string) => {
    setTickets(prev =>
      prev.map(ticket =>
        ticket.id === ticketId
          ? {
              ...ticket,
              status: newStatus as any,
              updatedAt: new Date(),
              resolvedAt: newStatus === 'resolved' ? new Date() : undefined,
            }
          : ticket
      )
    );
  };

  return (
    <div className='space-y-8'>
      {/* Header */}
      <div className='relative'>
        <div className='absolute inset-0 -z-10 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-pink-600/5 rounded-3xl' />
        <div className='p-8'>
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent'>
                Customer Support Dashboard
              </h1>
              <p className='text-gray-600 mt-2 flex items-center gap-2'>
                <Headphones className='h-4 w-4' />
                Platform-wide customer support oversight and management
              </p>
            </div>
            <div className='flex items-center gap-3'>
              <GlowingButton size='sm' variant='secondary' icon={<Download className='h-4 w-4' />}>
                Export Report
              </GlowingButton>
              <GlowingButton size='sm' variant='primary' icon={<Plus className='h-4 w-4' />}>
                New Ticket
              </GlowingButton>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        <AnimatedCard delay={0}>
          <div className='p-6'>
            <div className='flex items-center justify-between mb-4'>
              <div className='rounded-xl p-3 bg-gradient-to-r from-blue-500 to-purple-600'>
                <MessageCircle className='h-6 w-6 text-white' />
              </div>
              <div className='flex items-center gap-1'>
                <TrendingUp className='h-4 w-4 text-green-500' />
                <span className='text-sm font-semibold text-green-500'>+5.2%</span>
              </div>
            </div>
            <div className='space-y-2'>
              <p className='text-sm font-medium text-gray-600'>Total Tickets</p>
              <p className='text-3xl font-bold text-gray-900'>
                <AnimatedNumber value={stats.totalTickets} />
              </p>
              <p className='text-xs text-gray-500'>All time</p>
            </div>
          </div>
        </AnimatedCard>

        <AnimatedCard delay={100}>
          <div className='p-6'>
            <div className='flex items-center justify-between mb-4'>
              <div className='rounded-xl p-3 bg-gradient-to-r from-yellow-500 to-orange-600'>
                <Clock className='h-6 w-6 text-white' />
              </div>
            </div>
            <div className='space-y-2'>
              <p className='text-sm font-medium text-gray-600'>Open Tickets</p>
              <p className='text-3xl font-bold text-gray-900'>
                <AnimatedNumber value={stats.openTickets} />
              </p>
              <p className='text-xs text-gray-500'>Awaiting response</p>
            </div>
          </div>
        </AnimatedCard>

        <AnimatedCard delay={200}>
          <div className='p-6'>
            <div className='flex items-center justify-between mb-4'>
              <div className='rounded-xl p-3 bg-gradient-to-r from-green-500 to-emerald-600'>
                <CheckCircle className='h-6 w-6 text-white' />
              </div>
            </div>
            <div className='space-y-2'>
              <p className='text-sm font-medium text-gray-600'>Resolved Today</p>
              <p className='text-3xl font-bold text-gray-900'>
                <AnimatedNumber value={stats.resolvedTickets} />
              </p>
              <p className='text-xs text-gray-500'>Successfully closed</p>
            </div>
          </div>
        </AnimatedCard>

        <AnimatedCard delay={300}>
          <div className='p-6'>
            <div className='flex items-center justify-between mb-4'>
              <div className='rounded-xl p-3 bg-gradient-to-r from-purple-500 to-pink-600'>
                <Timer className='h-6 w-6 text-white' />
              </div>
            </div>
            <div className='space-y-2'>
              <p className='text-sm font-medium text-gray-600'>Avg Response Time</p>
              <p className='text-3xl font-bold text-gray-900'>
                <AnimatedNumber value={stats.avgResponseTime} decimals={1} suffix='m' />
              </p>
              <p className='text-xs text-gray-500'>Minutes</p>
            </div>
          </div>
        </AnimatedCard>
      </div>

      {/* Additional Metrics */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        <AnimatedCard delay={400}>
          <div className='p-6'>
            <div className='flex items-center justify-between mb-4'>
              <div className='rounded-xl p-3 bg-gradient-to-r from-indigo-500 to-blue-600'>
                <Target className='h-6 w-6 text-white' />
              </div>
            </div>
            <div className='space-y-2'>
              <p className='text-sm font-medium text-gray-600'>Avg Resolution Time</p>
              <p className='text-3xl font-bold text-gray-900'>
                <AnimatedNumber value={stats.avgResolutionTime} decimals={0} suffix='m' />
              </p>
              <p className='text-xs text-gray-500'>Minutes to resolve</p>
            </div>
          </div>
        </AnimatedCard>

        <AnimatedCard delay={500}>
          <div className='p-6'>
            <div className='flex items-center justify-between mb-4'>
              <div className='rounded-xl p-3 bg-gradient-to-r from-pink-500 to-rose-600'>
                <Star className='h-6 w-6 text-white' />
              </div>
            </div>
            <div className='space-y-2'>
              <p className='text-sm font-medium text-gray-600'>Satisfaction Score</p>
              <p className='text-3xl font-bold text-gray-900'>
                <AnimatedNumber value={stats.satisfactionScore} decimals={1} suffix='/5' />
              </p>
              <p className='text-xs text-gray-500'>Customer rating</p>
            </div>
          </div>
        </AnimatedCard>

        <AnimatedCard delay={600}>
          <div className='p-6'>
            <div className='flex items-center justify-between mb-4'>
              <div className='rounded-xl p-3 bg-gradient-to-r from-teal-500 to-cyan-600'>
                <UserCheck className='h-6 w-6 text-white' />
              </div>
            </div>
            <div className='space-y-2'>
              <p className='text-sm font-medium text-gray-600'>Agents Online</p>
              <p className='text-3xl font-bold text-gray-900'>
                <AnimatedNumber value={stats.agentsOnline} />
              </p>
              <p className='text-xs text-gray-500'>Currently available</p>
            </div>
          </div>
        </AnimatedCard>
      </div>

      {/* Tab Navigation */}
      <div className='flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit'>
        <button
          onClick={() => setActiveTab('tickets')}
          className={cn(
            'px-4 py-2 rounded-md text-sm font-medium transition-colors',
            activeTab === 'tickets'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          )}
        >
          Support Tickets
        </button>
        <button
          onClick={() => setActiveTab('agents')}
          className={cn(
            'px-4 py-2 rounded-md text-sm font-medium transition-colors',
            activeTab === 'agents'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          )}
        >
          Support Agents
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={cn(
            'px-4 py-2 rounded-md text-sm font-medium transition-colors',
            activeTab === 'analytics'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          )}
        >
          Analytics
        </button>
      </div>

      {/* Support Tickets Tab */}
      {activeTab === 'tickets' && (
        <div className='space-y-6'>
          {/* Filters */}
          <div className='flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between'>
            <div className='flex flex-wrap items-center gap-4'>
              <div className='flex items-center gap-2'>
                <Filter className='h-4 w-4 text-gray-500' />
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className='rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
                >
                  <option value='all'>All Status</option>
                  <option value='open'>Open</option>
                  <option value='in_progress'>In Progress</option>
                  <option value='resolved'>Resolved</option>
                  <option value='closed'>Closed</option>
                </select>
              </div>

              <select
                value={priorityFilter}
                onChange={e => setPriorityFilter(e.target.value)}
                className='rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
              >
                <option value='all'>All Priorities</option>
                <option value='urgent'>Urgent</option>
                <option value='high'>High</option>
                <option value='medium'>Medium</option>
                <option value='low'>Low</option>
              </select>

              <select
                value={channelFilter}
                onChange={e => setChannelFilter(e.target.value)}
                className='rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
              >
                <option value='all'>All Channels</option>
                <option value='email'>Email</option>
                <option value='phone'>Phone</option>
                <option value='chat'>Chat</option>
                <option value='social'>Social</option>
              </select>
            </div>

            <div className='relative'>
              <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400' />
              <input
                type='search'
                placeholder='Search tickets...'
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className='w-64 rounded-lg border border-gray-300 py-2 pl-10 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
              />
            </div>
          </div>

          {/* Tickets List */}
          <div className='space-y-4'>
            {filteredTickets.map((ticket, index) => {
              const ChannelIcon = getChannelIcon(ticket.channel);

              return (
                <AnimatedCard key={ticket.id} delay={index * 50}>
                  <div className='p-6'>
                    <div className='flex items-start justify-between'>
                      <div className='flex-1'>
                        <div className='flex items-center gap-3 mb-2'>
                          <div className='rounded-lg bg-gray-100 p-2'>
                            <ChannelIcon className='h-4 w-4 text-gray-600' />
                          </div>
                          <div>
                            <h3 className='font-semibold text-gray-900'>{ticket.subject}</h3>
                            <p className='text-sm text-gray-600'>{ticket.ticketNumber}</p>
                          </div>
                          <span
                            className={cn(
                              'inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold',
                              getPriorityColor(ticket.priority)
                            )}
                          >
                            {ticket.priority}
                          </span>
                          <span
                            className={cn(
                              'inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold',
                              getStatusColor(ticket.status)
                            )}
                          >
                            {ticket.status.replace('_', ' ')}
                          </span>
                        </div>
                        <p className='text-sm text-gray-600 mb-3'>{ticket.description}</p>
                        <div className='flex items-center gap-4 text-xs text-gray-500'>
                          <span>Customer: {ticket.customerName}</span>
                          <span>Channel: {ticket.channel}</span>
                          <span>Created: {format(ticket.createdAt, 'MMM dd, HH:mm')}</span>
                          {ticket.assignedTo && <span>Assigned: {ticket.assignedTo}</span>}
                        </div>
                      </div>
                      <div className='flex items-center gap-2'>
                        <button
                          onClick={() => {
                            setSelectedTicket(ticket);
                            setShowTicketDetails(true);
                          }}
                          className='text-blue-600 hover:text-blue-800 font-medium'
                        >
                          View Details
                        </button>
                        {ticket.status === 'open' && (
                          <button
                            onClick={() => handleTicketStatusUpdate(ticket.id, 'in_progress')}
                            className='text-yellow-600 hover:text-yellow-800 font-medium'
                          >
                            Take
                          </button>
                        )}
                        {ticket.status === 'in_progress' && (
                          <button
                            onClick={() => handleTicketStatusUpdate(ticket.id, 'resolved')}
                            className='text-green-600 hover:text-green-800 font-medium'
                          >
                            Resolve
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </AnimatedCard>
              );
            })}
          </div>

          {filteredTickets.length === 0 && (
            <div className='text-center py-12'>
              <MessageCircle className='h-12 w-12 text-gray-400 mx-auto mb-4' />
              <h3 className='text-lg font-semibold text-gray-900 mb-2'>No tickets found</h3>
              <p className='text-gray-600'>Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      )}

      {/* Support Agents Tab */}
      {activeTab === 'agents' && (
        <div className='space-y-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {agents.map((agent, index) => (
              <AnimatedCard key={agent.id} delay={index * 100}>
                <div className='p-6'>
                  <div className='flex items-center justify-between mb-4'>
                    <div className='flex items-center gap-3'>
                      <div className='w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold'>
                        {agent.name
                          .split(' ')
                          .map(n => n[0])
                          .join('')}
                      </div>
                      <div>
                        <h3 className='font-semibold text-gray-900'>{agent.name}</h3>
                        <p className='text-sm text-gray-600'>{agent.department}</p>
                      </div>
                    </div>
                    <span
                      className={cn(
                        'inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold',
                        getAgentStatusColor(agent.status)
                      )}
                    >
                      {agent.status}
                    </span>
                  </div>

                  <div className='space-y-3'>
                    <div className='grid grid-cols-2 gap-4'>
                      <div>
                        <p className='text-xs text-gray-500'>Active Tickets</p>
                        <p className='text-lg font-bold text-gray-900'>{agent.activeTickets}</p>
                      </div>
                      <div>
                        <p className='text-xs text-gray-500'>Resolved Today</p>
                        <p className='text-lg font-bold text-green-600'>{agent.resolvedToday}</p>
                      </div>
                    </div>

                    <div className='grid grid-cols-2 gap-4'>
                      <div>
                        <p className='text-xs text-gray-500'>Avg Response</p>
                        <p className='text-sm font-medium text-gray-900'>
                          {agent.avgResponseTime}m
                        </p>
                      </div>
                      <div>
                        <p className='text-xs text-gray-500'>Satisfaction</p>
                        <div className='flex items-center gap-1'>
                          <Star className='h-4 w-4 text-yellow-400 fill-current' />
                          <span className='text-sm font-medium text-gray-900'>
                            {agent.satisfactionScore}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <p className='text-xs text-gray-500 mb-2'>Specialties</p>
                      <div className='flex flex-wrap gap-1'>
                        {agent.specialties.map(specialty => (
                          <span
                            key={specialty}
                            className='inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800'
                          >
                            {specialty}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </AnimatedCard>
            ))}
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className='space-y-8'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
            <AnimatedCard delay={0}>
              <div className='p-6'>
                <div className='flex items-center justify-between mb-6'>
                  <div>
                    <h3 className='text-lg font-semibold text-gray-900'>Support Volume</h3>
                    <p className='text-sm text-gray-600'>Daily ticket volume and resolution rate</p>
                  </div>
                </div>
                <ResponsiveContainer width='100%' height={300}>
                  <AreaChart data={supportMetrics}>
                    <defs>
                      <linearGradient id='colorTickets' x1='0' y1='0' x2='0' y2='1'>
                        <stop offset='5%' stopColor='#3B82F6' stopOpacity={0.3} />
                        <stop offset='95%' stopColor='#3B82F6' stopOpacity={0.05} />
                      </linearGradient>
                      <linearGradient id='colorResolved' x1='0' y1='0' x2='0' y2='1'>
                        <stop offset='5%' stopColor='#10B981' stopOpacity={0.3} />
                        <stop offset='95%' stopColor='#10B981' stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray='3 3' stroke='#f0f0f0' />
                    <XAxis dataKey='time' axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Area
                      type='monotone'
                      dataKey='tickets'
                      stroke='#3B82F6'
                      fill='url(#colorTickets)'
                      strokeWidth={2}
                    />
                    <Area
                      type='monotone'
                      dataKey='resolved'
                      stroke='#10B981'
                      fill='url(#colorResolved)'
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </AnimatedCard>

            <AnimatedCard delay={200}>
              <div className='p-6'>
                <div className='flex items-center justify-between mb-6'>
                  <div>
                    <h3 className='text-lg font-semibold text-gray-900'>Channel Distribution</h3>
                    <p className='text-sm text-gray-600'>Tickets by communication channel</p>
                  </div>
                </div>
                <ResponsiveContainer width='100%' height={300}>
                  <PieChart>
                    <Pie
                      data={channelData}
                      cx='50%'
                      cy='50%'
                      outerRadius={80}
                      fill='#8884d8'
                      dataKey='count'
                      label={entry => `${entry.name}: ${entry.percentage}%`}
                    >
                      {channelData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </AnimatedCard>
          </div>
        </div>
      )}

      {/* Ticket Details Modal */}
      {showTicketDetails && selectedTicket && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
          <div className='bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto'>
            <div className='p-6 border-b'>
              <div className='flex items-center justify-between'>
                <h2 className='text-xl font-semibold'>
                  Ticket Details - {selectedTicket.ticketNumber}
                </h2>
                <button
                  onClick={() => setShowTicketDetails(false)}
                  className='text-gray-500 hover:text-gray-700'
                >
                  <X className='h-6 w-6' />
                </button>
              </div>
            </div>

            <div className='p-6 space-y-6'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div>
                  <h3 className='font-semibold text-gray-900 mb-3'>Ticket Information</h3>
                  <div className='space-y-2'>
                    <p>
                      <strong>Subject:</strong> {selectedTicket.subject}
                    </p>
                    <p>
                      <strong>Status:</strong>
                      <span
                        className={cn(
                          'ml-2 inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold',
                          getStatusColor(selectedTicket.status)
                        )}
                      >
                        {selectedTicket.status.replace('_', ' ')}
                      </span>
                    </p>
                    <p>
                      <strong>Priority:</strong>
                      <span
                        className={cn(
                          'ml-2 inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold',
                          getPriorityColor(selectedTicket.priority)
                        )}
                      >
                        {selectedTicket.priority}
                      </span>
                    </p>
                    <p>
                      <strong>Category:</strong> {selectedTicket.category.replace('_', ' ')}
                    </p>
                    <p>
                      <strong>Channel:</strong> {selectedTicket.channel}
                    </p>
                    <p>
                      <strong>Assigned to:</strong> {selectedTicket.assignedTo || 'Unassigned'}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className='font-semibold text-gray-900 mb-3'>Customer Information</h3>
                  <div className='space-y-2'>
                    <p>
                      <strong>Name:</strong> {selectedTicket.customerName}
                    </p>
                    <p>
                      <strong>Email:</strong> {selectedTicket.customerEmail}
                    </p>
                    <p>
                      <strong>Customer ID:</strong> {selectedTicket.customerId}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className='font-semibold text-gray-900 mb-3'>Description</h3>
                <p className='text-gray-700 bg-gray-50 p-4 rounded-lg'>
                  {selectedTicket.description}
                </p>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div>
                  <h3 className='font-semibold text-gray-900 mb-3'>Timeline</h3>
                  <div className='space-y-2'>
                    <p>
                      <strong>Created:</strong>{' '}
                      {format(selectedTicket.createdAt, 'MMM dd, yyyy HH:mm')}
                    </p>
                    <p>
                      <strong>Updated:</strong>{' '}
                      {format(selectedTicket.updatedAt, 'MMM dd, yyyy HH:mm')}
                    </p>
                    {selectedTicket.resolvedAt && (
                      <p>
                        <strong>Resolved:</strong>{' '}
                        {format(selectedTicket.resolvedAt, 'MMM dd, yyyy HH:mm')}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className='font-semibold text-gray-900 mb-3'>Performance Metrics</h3>
                  <div className='space-y-2'>
                    {selectedTicket.firstResponseTime && (
                      <p>
                        <strong>First Response:</strong> {selectedTicket.firstResponseTime} minutes
                      </p>
                    )}
                    {selectedTicket.resolutionTime && (
                      <p>
                        <strong>Resolution Time:</strong> {selectedTicket.resolutionTime} minutes
                      </p>
                    )}
                    {selectedTicket.satisfactionRating && (
                      <p>
                        <strong>Satisfaction:</strong> {selectedTicket.satisfactionRating}/5
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className='flex justify-end gap-3'>
                <GlowingButton variant='secondary' onClick={() => setShowTicketDetails(false)}>
                  Close
                </GlowingButton>
                <GlowingButton variant='primary' icon={<ArrowRight className='h-4 w-4' />}>
                  Take Action
                </GlowingButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
