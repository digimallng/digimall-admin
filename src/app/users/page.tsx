'use client';

import { useState } from 'react';
import { Plus, Search, Download, Users, Activity, Shield, RefreshCw, Eye, Trash2, Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { useUsers, useUserStats, useActivateUser, useDeactivateUser, useSuspendUser, useUnsuspendUser, useDeleteUser, useBulkUpdateUsers } from '@/lib/api/hooks/use-users';
import { ExportService } from '@/services/export.service';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { DeleteConfirmationModal } from '@/components/modals/DeleteConfirmationModal';
import { cn } from '@/lib/utils';
import type { User } from '@/lib/api/types';

export default function UsersPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<{ id: string; name: string } | null>(null);

  // Build filters for API
  const filters = {
    search: searchTerm || undefined,
    role: roleFilter !== 'all' ? roleFilter : undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    page: 1,
    limit: 20,
  };

  const { data: usersData, isLoading, refetch: refetchUsers } = useUsers(filters as any);
  const { data: userStats, refetch: refetchStats } = useUserStats();

  const activateUser = useActivateUser();
  const deactivateUser = useDeactivateUser();
  const suspendUser = useSuspendUser();
  const unsuspendUser = useUnsuspendUser();
  const deleteUser = useDeleteUser();
  const bulkUpdate = useBulkUpdateUsers();

  const handleRefresh = async () => {
    await Promise.all([refetchUsers(), refetchStats()]);
  };

  const handleExport = async (exportFormat: 'csv' | 'excel' = 'csv') => {
    try {
      if (!usersData?.data || usersData.data.length === 0) {
        toast.error('No users data to export');
        return;
      }

      const exportData = usersData.data.map(user => ({
        'User ID': user.id,
        'First Name': user.profile?.firstName || '',
        'Last Name': user.profile?.lastName || '',
        'Email': user.email,
        'Role': user.role,
        'Status': user.status,
        'Phone': user.profile?.phone || '',
        'Email Verified': user.emailVerified ? 'Yes' : 'No',
        'Phone Verified': user.phoneVerified ? 'Yes' : 'No',
        'Last Login': user.lastLoginAt ? format(new Date(user.lastLoginAt), 'yyyy-MM-dd HH:mm:ss') : '',
        'Created At': format(new Date(user.createdAt), 'yyyy-MM-dd HH:mm:ss'),
        'Updated At': format(new Date(user.updatedAt), 'yyyy-MM-dd HH:mm:ss'),
      }));

      ExportService.exportData(exportData, exportFormat, 'users-export', {
        sheetName: 'Users',
        includeTimestamp: true
      });

      toast.success(`Exported ${exportData.length} users to ${exportFormat.toUpperCase()}`);
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Export failed. Please try again.');
    }
  };

  const handleUserAction = async (action: string, userId: string) => {
    try {
      switch (action) {
        case 'activate':
          await activateUser.mutateAsync(userId);
          toast.success('User activated successfully');
          break;
        case 'deactivate':
          await deactivateUser.mutateAsync({ id: userId });
          toast.success('User deactivated successfully');
          break;
        case 'suspend':
          await suspendUser.mutateAsync({ id: userId, reason: 'Suspended by admin' });
          toast.success('User suspended successfully');
          break;
        case 'unsuspend':
          await unsuspendUser.mutateAsync(userId);
          toast.success('User unsuspended successfully');
          break;
      }
      refetchUsers();
    } catch (error: any) {
      console.error('User action failed:', error);
      toast.error(error.message || 'Action failed');
    }
  };

  const handleBulkAction = async (action: 'activate' | 'deactivate' | 'suspend') => {
    if (selectedUsers.length === 0) return;

    try {
      await bulkUpdate.mutateAsync({
        userIds: selectedUsers,
        action,
        reason: action === 'suspend' ? 'Bulk suspension by admin' : undefined,
      });
      setSelectedUsers([]);
      toast.success(`Successfully ${action}d ${selectedUsers.length} user(s)`);
      refetchUsers();
    } catch (error: any) {
      console.error('Bulk action failed:', error);
      toast.error(error.message || `Failed to ${action} users`);
    }
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
      refetchUsers();
    } catch (error: any) {
      console.error('Delete user failed:', error);
      toast.error(error.message || 'Failed to delete user');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'suspended':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">
            Manage platform users and their accounts
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleExport('csv')}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={() => handleExport('excel')}>
            <Download className="w-4 h-4 mr-2" />
            Export Excel
          </Button>
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              All registered users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {userStats?.activeUsers || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vendors</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {userStats?.roleDistribution?.vendor || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Vendor accounts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {userStats?.roleDistribution?.customer || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Customer accounts
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filter Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="customer">Customer</SelectItem>
                <SelectItem value="vendor">Vendor</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="super_admin">Super Admin</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Bulk Actions */}
          {selectedUsers.length > 0 && (
            <div className="flex items-center gap-2 mt-4">
              <span className="text-sm text-muted-foreground">
                {selectedUsers.length} selected
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBulkAction('activate')}
                disabled={bulkUpdate.isPending}
              >
                Activate
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBulkAction('deactivate')}
                disabled={bulkUpdate.isPending}
              >
                Deactivate
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBulkAction('suspend')}
                disabled={bulkUpdate.isPending}
              >
                Suspend
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : !usersData?.data || usersData.data.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">No users found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {usersData.data.map((user: User) => (
                <div
                  key={user.id}
                  className={cn(
                    "flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors",
                    selectedUsers.includes(user.id) && "bg-muted"
                  )}
                >
                  <Checkbox
                    checked={selectedUsers.includes(user.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedUsers([...selectedUsers, user.id]);
                      } else {
                        setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                      }
                    }}
                  />

                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">
                          {user.profile?.firstName?.charAt(0) || user.email.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">
                          {user.profile?.firstName && user.profile?.lastName
                            ? `${user.profile.firstName} ${user.profile.lastName}`
                            : 'No name provided'}
                        </p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        {user.profile?.phone && (
                          <p className="text-xs text-muted-foreground">{user.profile.phone}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{user.role}</Badge>
                    <Badge className={getStatusColor(user.status)}>
                      {user.status}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-1">
                    {user.emailVerified && (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        <Mail className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                    {user.phoneVerified && (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        <Phone className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => router.push(`/users/${user.id}`)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>

                    {user.status === 'active' ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUserAction('deactivate', user.id)}
                        disabled={deactivateUser.isPending}
                      >
                        Deactivate
                      </Button>
                    ) : user.status === 'suspended' ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUserAction('unsuspend', user.id)}
                        disabled={unsuspendUser.isPending}
                      >
                        Unsuspend
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUserAction('activate', user.id)}
                        disabled={activateUser.isPending}
                      >
                        Activate
                      </Button>
                    )}

                    {session?.user?.role === 'super_admin' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          handleDeleteUser(
                            user.id,
                            `${user.profile?.firstName || ''} ${user.profile?.lastName || ''}`
                          )
                        }
                        disabled={deleteUser.isPending}
                        className="text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setUserToDelete(null);
        }}
        onConfirm={confirmDeleteUser}
        title="Delete User"
        message={
          userToDelete
            ? `Are you sure you want to delete ${userToDelete.name}? This action cannot be undone.`
            : ''
        }
        isLoading={deleteUser.isPending}
        confirmText="Delete"
        type="danger"
      />
    </div>
  );
}
