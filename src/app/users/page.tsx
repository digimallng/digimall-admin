'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatsCard } from '@/components/ui/StatsCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUserManagementEvents } from '@/providers/admin-websocket-provider';
import {
  useUsers,
  useUserStats,
  useActivateUser,
  useDeactivateUser,
  useSuspendUser,
  useUnsuspendUser,
  useVerifyUserEmail,
  useVerifyUserPhone,
  useBulkUpdateUsers,
  useDeleteUser,
} from '@/lib/hooks/use-users';
import { User, UserFilters } from '@/lib/api/types';
import {
  Search,
  Filter,
  MoreVertical,
  UserPlus,
  Download,
  Users,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  Shield,
  Mail,
  Phone,
  Calendar,
  MapPin,
  MessageCircle,
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils/cn';
import { DeleteConfirmationModal } from '@/components/modals/DeleteConfirmationModal';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useCreateConversation } from '@/hooks/use-chat';
import { ExportService } from '@/services/export.service';

export default function UsersPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const createConversationMutation = useCreateConversation();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<{ id: string; name: string } | null>(null);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const exportDropdownRef = useRef<HTMLDivElement>(null);

  // Build filters
  const filters: UserFilters = useMemo(
    () => ({
      query: searchTerm || undefined,
      role: filterRole !== 'all' ? (filterRole as UserFilters['role']) : undefined,
      status: filterStatus !== 'all' ? (filterStatus as UserFilters['status']) : undefined,
      page: currentPage,
      limit: 20,
      sortBy: 'createdAt',
      sortOrder: 'DESC',
    }),
    [searchTerm, filterRole, filterStatus, currentPage]
  );

  // Fetch data
  const {
    data: usersResponse,
    isLoading: usersLoading,
    error: usersError,
    refetch: refetchUsers,
  } = useUsers(filters);

  // Extract users from response immediately to prevent undefined access
  const usersList = usersResponse?.users || [];
  const totalPages = usersResponse?.pages || 1;
  const totalUsers = usersResponse?.total || 0;

  // Debug logging (development only)
  if (process.env.NODE_ENV === 'development') {
    console.log('Debug - Users page state:', {
      usersLoading,
      usersError,
      usersResponse,
      usersList,
      usersListLength: usersList.length
    });
  }

  // Show info toast when using fallback data (only once)
  useEffect(() => {
    if (usersResponse && usersList.length > 0 && !usersLoading) {
      // Check if this looks like mock data based on specific users
      const hasMockUser = usersList.some(user => 
        user.email === 'john.doe@example.com' || 
        user.email === 'jane.smith@vendor.com'
      );
      
      if (hasMockUser) {
        toast.info('Displaying sample data - API connection may be unavailable', {
          duration: 5000,
        });
      }
    }
  }, [usersResponse, usersList, usersLoading]);

  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError,
  } = useUserStats();

  // Mutations
  const activateUser = useActivateUser();
  const deactivateUser = useDeactivateUser();
  const suspendUser = useSuspendUser();
  const unsuspendUser = useUnsuspendUser();
  const verifyEmail = useVerifyUserEmail();
  const verifyPhone = useVerifyUserPhone();
  const bulkUpdate = useBulkUpdateUsers();
  const deleteUser = useDeleteUser();

  // WebSocket event handlers
  const { onUserCreated, onUserUpdated, onUserDeleted, onUserStatusChanged, onUserBulkAction } =
    useUserManagementEvents();

  // Subscribe to real-time events
  useEffect(() => {
    const unsubscribeCreated = onUserCreated(user => {
      toast.success(`New user created: ${user.firstName} ${user.lastName}`);
      refetchUsers();
    });

    const unsubscribeUpdated = onUserUpdated((user, changes) => {
      toast.info(`User updated: ${user.firstName} ${user.lastName}`);
      refetchUsers();
    });

    const unsubscribeDeleted = onUserDeleted(userId => {
      toast.info(`User deleted`);
      refetchUsers();
    });

    const unsubscribeStatusChanged = onUserStatusChanged((userId, oldStatus, newStatus) => {
      toast.info(`User status changed from ${oldStatus} to ${newStatus}`);
      refetchUsers();
    });

    const unsubscribeBulkAction = onUserBulkAction((action, userIds, results) => {
      const successCount = results.filter((r: any) => r.success).length;
      toast.info(`Bulk ${action} completed: ${successCount}/${userIds.length} successful`);
      refetchUsers();
    });

    return () => {
      unsubscribeCreated();
      unsubscribeUpdated();
      unsubscribeDeleted();
      unsubscribeStatusChanged();
      unsubscribeBulkAction();
    };
  }, [
    onUserCreated,
    onUserUpdated,
    onUserDeleted,
    onUserStatusChanged,
    onUserBulkAction,
    refetchUsers,
  ]);

  // Handle click outside to close export dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportDropdownRef.current && !exportDropdownRef.current.contains(event.target as Node)) {
        setShowExportDropdown(false);
      }
    };

    if (showExportDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showExportDropdown]);

  // Handle loading state
  if (usersLoading && !usersResponse) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <LoadingSpinner size='lg' />
      </div>
    );
  }

  // Handle error state
  if (usersError) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <ErrorMessage
          title='Failed to load users'
          message={usersError.message}
          onRetry={() => refetchUsers()}
        />
      </div>
    );
  }

  const pagination = {
    page: usersResponse?.page || 1,
    total: totalUsers,
    totalPages: totalPages,
    limit: usersResponse?.limit || 20,
  };

  // User action handlers
  const handleUserAction = async (action: string, userId: string, reason?: string) => {
    try {
      switch (action) {
        case 'activate':
          await activateUser.mutateAsync(userId);
          break;
        case 'deactivate':
          await deactivateUser.mutateAsync({ id: userId, reason });
          break;
        case 'suspend':
          if (reason) {
            await suspendUser.mutateAsync({ id: userId, reason });
          }
          break;
        case 'unsuspend':
          await unsuspendUser.mutateAsync(userId);
          break;
        case 'verify-email':
          await verifyEmail.mutateAsync(userId);
          break;
        case 'verify-phone':
          await verifyPhone.mutateAsync(userId);
          break;
        default:
          console.warn('Unknown action:', action);
      }
    } catch (error) {
      console.error('User action failed:', error);
    }
  };

  const handleBulkAction = async (action: 'activate' | 'deactivate' | 'suspend' | 'delete') => {
    if (selectedUsers.length === 0) return;

    try {
      await bulkUpdate.mutateAsync({
        userIds: selectedUsers,
        action,
        reason: action === 'suspend' ? 'Bulk suspension by admin' : undefined,
      });
      setSelectedUsers([]);
      toast.success(`Successfully ${action}d ${selectedUsers.length} user(s)`);
    } catch (error: any) {
      console.error('Bulk action failed:', error);
      toast.error(error.message || `Failed to ${action} users`);
    }
  };

  const handleEditUser = (user: User) => {
    router.push(`/users/${user.id}/edit`);
  };

  const handleDeleteUser = (userId: string, userName: string) => {
    setUserToDelete({ id: userId, name: userName });
    setShowDeleteModal(true);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      await deleteUser.mutateAsync(userToDelete.id);
      toast.success('User deleted successfully');
      setShowDeleteModal(false);
      setUserToDelete(null);
    } catch (error: any) {
      console.error('Delete user failed:', error);
      toast.error(error.message || 'Failed to delete user');
    }
  };

  // Export handlers
  const handleExportCSV = () => {
    if (!usersList || usersList.length === 0) {
      toast.error('No users to export');
      return;
    }

    try {
      ExportService.exportUsersToCSV(usersList, {
        filename: 'users',
        includeTimestamp: true,
      });
      toast.success(`Exported ${usersList.length} users to CSV`);
      setShowExportDropdown(false);
    } catch (error) {
      console.error('CSV export failed:', error);
      toast.error('Failed to export users to CSV');
    }
  };

  const handleExportExcel = () => {
    if (!usersList || usersList.length === 0) {
      toast.error('No users to export');
      return;
    }

    try {
      ExportService.exportUsersToExcel(usersList, {
        filename: 'users',
        sheetName: 'Users',
        includeTimestamp: true,
      });
      toast.success(`Exported ${usersList.length} users to Excel`);
      setShowExportDropdown(false);
    } catch (error) {
      console.error('Excel export failed:', error);
      toast.error('Failed to export users to Excel');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className='w-4 h-4 text-green-500' />;
      case 'inactive':
        return <XCircle className='w-4 h-4 text-red-500' />;
      case 'suspended':
        return <AlertTriangle className='w-4 h-4 text-yellow-500' />;
      default:
        return <XCircle className='w-4 h-4 text-gray-400' />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      case 'suspended':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatUserRole = (role: string) => {
    switch (role) {
      case 'customer':
        return 'Customer';
      case 'vendor':
        return 'Vendor';
      case 'admin':
        return 'Admin';
      case 'super_admin':
        return 'Super Admin';
      default:
        return role;
    }
  };

  return (
    <div className='space-y-8'>
      <PageHeader
        title='User Management'
        description='Manage all platform users'
        icon={Users}
        actions={[
          {
            label: 'Export Users',
            icon: Download,
            variant: 'secondary',
            onClick: () => setShowExportDropdown(!showExportDropdown),
          },
          {
            label: 'Refresh',
            icon: RefreshCw,
            variant: 'secondary',
            onClick: () => refetchUsers(),
          },
        ]}
      />

      {/* Export Dropdown */}
      {showExportDropdown && (
        <div className="relative" ref={exportDropdownRef}>
          <div className="absolute right-0 top-2 z-50 w-48 bg-white border border-gray-200 rounded-lg shadow-lg">
            <div className="p-2">
              <button
                onClick={handleExportCSV}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 rounded-md flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export as CSV
              </button>
              <button
                onClick={handleExportExcel}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 rounded-md flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export as Excel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4'>
        <StatsCard
          title='Total Users'
          value={stats?.totalUsers || 0}
          change={stats?.userGrowth || 0}
          icon={Users}
          isLoading={statsLoading}
        />
        <StatsCard
          title='Active Users'
          value={stats?.activeUsers || 0}
          change={stats?.activeUserGrowth || 0}
          icon={CheckCircle}
          isLoading={statsLoading}
        />
        <StatsCard
          title='Vendors'
          value={stats?.totalVendors || 0}
          change={stats?.vendorGrowth || 0}
          icon={Shield}
          isLoading={statsLoading}
        />
        <StatsCard
          title='Customers'
          value={stats?.totalCustomers || 0}
          change={stats?.customerGrowth || 0}
          icon={Users}
          isLoading={statsLoading}
        />
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
            <div className='flex flex-1 items-center gap-4'>
              <div className='relative flex-1 max-w-sm'>
                <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400' />
                <Input
                  placeholder='Search users...'
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className='pl-10'
                />
              </div>

              <select
                value={filterRole}
                onChange={e => setFilterRole(e.target.value)}
                className='rounded-md border border-gray-300 px-3 py-2 text-sm'
              >
                <option value='all'>All Roles</option>
                <option value='customer'>Customer</option>
                <option value='vendor'>Vendor</option>
                <option value='admin'>Admin</option>
              </select>

              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className='rounded-md border border-gray-300 px-3 py-2 text-sm'
              >
                <option value='all'>All Status</option>
                <option value='active'>Active</option>
                <option value='inactive'>Inactive</option>
                <option value='suspended'>Suspended</option>
              </select>
            </div>

            {selectedUsers.length > 0 && (
              <div className='flex items-center gap-2'>
                <span className='text-sm text-gray-600'>{selectedUsers.length} selected</span>
                <Button
                  size='sm'
                  variant='outline'
                  onClick={() => handleBulkAction('activate')}
                  disabled={bulkUpdate.isPending}
                >
                  Activate
                </Button>
                <Button
                  size='sm'
                  variant='outline'
                  onClick={() => handleBulkAction('deactivate')}
                  disabled={bulkUpdate.isPending}
                >
                  Deactivate
                </Button>
                <Button
                  size='sm'
                  variant='outline'
                  onClick={() => handleBulkAction('suspend')}
                  disabled={bulkUpdate.isPending}
                >
                  Suspend
                </Button>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className='p-0'>
          {usersLoading ? (
            <div className='p-8 text-center'>
              <LoadingSpinner />
              <p className='mt-2 text-gray-600'>Loading users...</p>
            </div>
          ) : usersList.length === 0 ? (
            <div className='p-8 text-center text-gray-500'>
              <Users className='w-12 h-12 mx-auto mb-4 opacity-50' />
              <p>No users found</p>
            </div>
          ) : (
            <div className='overflow-x-auto'>
              <table className='min-w-full divide-y divide-gray-200'>
                <thead className='bg-gray-50'>
                  <tr>
                    <th className='px-6 py-3 text-left'>
                      <input
                        type='checkbox'
                        checked={selectedUsers.length === usersList.length}
                        onChange={e => {
                          if (e.target.checked) {
                            setSelectedUsers(Array.isArray(usersList) ? usersList.map(u => u.id) : []);
                          } else {
                            setSelectedUsers([]);
                          }
                        }}
                        className='rounded'
                      />
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                      User
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                      Role
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                      Status
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                      Verification
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                      Last Login
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-gray-200 bg-white'>
                  {Array.isArray(usersList) && usersList.map(user => (
                    <tr
                      key={user.id}
                      className={cn(
                        'hover:bg-gray-50 transition-colors',
                        selectedUsers.includes(user.id) && 'bg-blue-50'
                      )}
                    >
                      <td className='px-6 py-4'>
                        <input
                          type='checkbox'
                          checked={selectedUsers.includes(user.id)}
                          onChange={e => {
                            if (e.target.checked) {
                              setSelectedUsers([...selectedUsers, user.id]);
                            } else {
                              setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                            }
                          }}
                          className='rounded'
                        />
                      </td>
                      <td className='px-6 py-4'>
                        <div className='flex items-center'>
                          <div className='h-10 w-10 flex-shrink-0'>
                            <div className='h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center'>
                              <span className='text-white text-sm font-medium'>
                                {user.firstName?.charAt(0) || user.email.charAt(0)}
                              </span>
                            </div>
                          </div>
                          <div className='ml-4'>
                            <div className='text-sm font-medium text-gray-900'>
                              {user.firstName && user.lastName
                                ? `${user.firstName} ${user.lastName}`
                                : 'No name provided'}
                            </div>
                            <div className='text-sm text-gray-500'>{user.email}</div>
                            {user.phone && (
                              <div className='text-xs text-gray-400'>{user.phone}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className='px-6 py-4'>
                        <span className='inline-flex rounded-full px-2 py-1 text-xs font-semibold bg-gray-100 text-gray-800'>
                          {formatUserRole(user.role)}
                        </span>
                      </td>
                      <td className='px-6 py-4'>
                        <div className='flex items-center gap-2'>
                          {getStatusIcon(user.status)}
                          <span
                            className={cn(
                              'inline-flex rounded-full px-2 py-1 text-xs font-semibold',
                              getStatusColor(user.status)
                            )}
                          >
                            {user.status}
                          </span>
                        </div>
                      </td>
                      <td className='px-6 py-4'>
                        <div className='flex items-center gap-2'>
                          <div
                            className={cn(
                              'flex items-center gap-1 px-2 py-1 rounded text-xs',
                              user.isEmailVerified
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            )}
                          >
                            <Mail className='w-3 h-3' />
                            {user.isEmailVerified ? 'Verified' : 'Unverified'}
                          </div>
                          {user.phone && (
                            <div
                              className={cn(
                                'flex items-center gap-1 px-2 py-1 rounded text-xs',
                                user.isPhoneVerified
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              )}
                            >
                              <Phone className='w-3 h-3' />
                              {user.isPhoneVerified ? 'Verified' : 'Unverified'}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className='px-6 py-4 text-sm text-gray-500'>
                        {user.lastLoginAt
                          ? format(new Date(user.lastLoginAt), 'MMM dd, yyyy HH:mm')
                          : 'Never'}
                      </td>
                      <td className='px-6 py-4'>
                        <div className='flex items-center gap-2'>
                          <Button
                            size='sm'
                            variant='outline'
                            onClick={() => handleEditUser(user)}
                            title='Edit user'
                          >
                            <Edit className='w-4 h-4' />
                          </Button>
                          <Button
                            size='sm'
                            variant='outline'
                            onClick={async () => {
                              try {
                                console.log('Creating chat with user:', user);
                                console.log('Current session:', session);
                                console.log('Admin user ID:', session?.user?.id);

                                if (!session?.user?.id) {
                                  toast.error('Session not found. Please refresh and try again.');
                                  return;
                                }

                                const participants = [user.id, session.user.id];
                                console.log('Participants:', participants);

                                // Create a new conversation with this user
                                // Include both the customer and the admin user in participants
                                const conversation = await createConversationMutation.mutateAsync({
                                  type: 'customer_support',
                                  participants: participants,
                                  title: `Chat with ${user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.email}`,
                                });

                                console.log('Conversation created:', conversation);

                                // Navigate to messages page with the conversation ID
                                router.push(`/messages?conversationId=${conversation.id}`);
                                toast.success('Chat created successfully');
                              } catch (error: any) {
                                console.error('Failed to create conversation:', error);
                                console.error('Error details:', {
                                  message: error.message,
                                  status: error.status,
                                  data: error.data,
                                  response: error.response,
                                });
                                toast.error(error.message || 'Failed to create chat');
                              }
                            }}
                            disabled={createConversationMutation.isPending}
                            title='Start chat'
                          >
                            <MessageCircle className='w-4 h-4' />
                          </Button>

                          {user.status === 'active' ? (
                            <Button
                              size='sm'
                              variant='outline'
                              onClick={() => handleUserAction('deactivate', user.id)}
                              disabled={deactivateUser.isPending}
                              title='Deactivate user'
                            >
                              Deactivate
                            </Button>
                          ) : user.status === 'suspended' ? (
                            <Button
                              size='sm'
                              variant='outline'
                              onClick={() => handleUserAction('unsuspend', user.id)}
                              disabled={unsuspendUser.isPending}
                              title='Unsuspend user'
                            >
                              Unsuspend
                            </Button>
                          ) : (
                            <Button
                              size='sm'
                              variant='outline'
                              onClick={() => handleUserAction('activate', user.id)}
                              disabled={activateUser.isPending}
                              title='Activate user'
                            >
                              Activate
                            </Button>
                          )}

                          {!user.isEmailVerified && (
                            <Button
                              size='sm'
                              variant='outline'
                              onClick={() => handleUserAction('verify-email', user.id)}
                              disabled={verifyEmail.isPending}
                              title='Verify email'
                            >
                              Verify Email
                            </Button>
                          )}

                          {/* Only super admins can delete any user */}
                          {session?.user?.role === 'super_admin' && (
                            <Button
                              size='sm'
                              variant='outline'
                              onClick={() =>
                                handleDeleteUser(user.id, `${user.firstName} ${user.lastName}`)
                              }
                              disabled={deleteUser.isPending}
                              className='text-red-600 hover:text-red-700 hover:bg-red-50'
                              title='Delete user'
                            >
                              <Trash2 className='w-4 h-4' />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className='flex items-center justify-between px-6 py-4 border-t border-gray-200'>
              <div className='text-sm text-gray-700'>
                Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                {pagination.total} results
              </div>
              <div className='flex items-center gap-2'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => setCurrentPage(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                >
                  Previous
                </Button>
                <span className='text-sm text-gray-700'>
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => setCurrentPage(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}

      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setUserToDelete(null);
        }}
        onConfirm={confirmDeleteUser}
        title='Delete User'
        message={
          userToDelete
            ? `Are you sure you want to delete ${userToDelete.name}? This action cannot be undone.`
            : ''
        }
        isLoading={deleteUser.isPending}
        confirmText='Delete'
        type='danger'
      />
    </div>
  );
}
