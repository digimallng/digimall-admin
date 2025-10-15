'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  MoreHorizontal,
  Edit,
  Trash2,
  Shield,
  Activity,
  Clock,
  Mail,
  Phone,
  Eye,
  UserX,
  UserCheck,
  Key,
  Users,
  AlertTriangle,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { EmptyState } from '@/components/ui/empty-state';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import {
  useDeleteStaff,
  useUpdateStaff,
  useBulkStaffAction,
  useUpdateAgentStatus,
} from '@/lib/hooks/use-staff';
import { Staff, StaffListResponse } from '@/lib/api/types';
import { toast } from 'sonner';

interface StaffListProps {
  data?: StaffListResponse;
  isLoading: boolean;
  onRefresh: () => void;
}

export function StaffList({ data, isLoading, onRefresh }: StaffListProps) {
  const router = useRouter();
  const [selectedStaff, setSelectedStaff] = useState<string[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState<Staff | null>(null);

  const deleteStaff = useDeleteStaff();
  const updateStaff = useUpdateStaff();
  const bulkAction = useBulkStaffAction();
  const updateAgentStatus = useUpdateAgentStatus();

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedStaff(data?.data.map(s => s.id) || []);
    } else {
      setSelectedStaff([]);
    }
  };

  const handleSelectStaff = (staffId: string, checked: boolean) => {
    if (checked) {
      setSelectedStaff(prev => [...prev, staffId]);
    } else {
      setSelectedStaff(prev => prev.filter(id => id !== staffId));
    }
  };

  const handleDelete = async (staff: Staff) => {
    try {
      await deleteStaff.mutateAsync(staff.id);
      setDeleteConfirm(null);
      onRefresh();
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleStatusChange = async (staff: Staff, newStatus: string) => {
    try {
      await updateStaff.mutateAsync({
        staffId: staff.id,
        data: { status: newStatus as any },
      });
      onRefresh();
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleAgentStatusChange = async (staff: Staff, agentStatus: string) => {
    try {
      await updateAgentStatus.mutateAsync({
        staffId: staff.id,
        status: agentStatus as any,
      });
      onRefresh();
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedStaff.length === 0) {
      toast.error('Please select staff members first');
      return;
    }

    try {
      await bulkAction.mutateAsync({
        staffIds: selectedStaff,
        action: action as any,
      });
      setSelectedStaff([]);
      onRefresh();
    } catch (error) {
      // Error handled by hook
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'suspended':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'admin':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'moderator':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'analyst':
        return 'bg-cyan-100 text-cyan-800 border-cyan-200';
      case 'support':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'viewer':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatLastLogin = (lastLoginAt?: Date) => {
    if (!lastLoginAt) return 'Never';
    
    const now = new Date();
    const diff = now.getTime() - new Date(lastLoginAt).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return 'Recently';
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <LoadingSpinner />
        </CardContent>
      </Card>
    );
  }

  if (!data?.data || data.data.length === 0) {
    return (
      <Card>
        <CardContent>
          <EmptyState
            icon={<Users className="w-6 h-6" />}
            title="No staff members found"
            description="Get started by creating your first staff member"
            action={
              <Button onClick={() => {}}>
                <Plus className="w-4 h-4 mr-2" />
                Create Staff Member
              </Button>
            }
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Bulk Actions */}
      {selectedStaff.length > 0 && (
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  {selectedStaff.length} staff member(s) selected
                </span>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleBulkAction('activate')}
                >
                  <UserCheck className="w-4 h-4 mr-1" />
                  Activate
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleBulkAction('suspend')}
                >
                  <UserX className="w-4 h-4 mr-1" />
                  Suspend
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => handleBulkAction('delete')}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Staff Table */}
      <Card>
        <CardHeader>
          <CardTitle>Staff Members</CardTitle>
          <CardDescription>
            Manage staff accounts and permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Desktop Table */}
          <div className="hidden lg:block">
            <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedStaff.length === data.data.length}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Staff Member</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.data.map((staff) => (
                <TableRow key={staff.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedStaff.includes(staff.id)}
                      onCheckedChange={(checked) => handleSelectStaff(staff.id, checked as boolean)}
                    />
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={staff.profilePicture} />
                        <AvatarFallback>
                          {staff.firstName[0]}{staff.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{staff.fullName}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {staff.email}
                        </div>
                        {staff.phoneNumber && (
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {staff.phoneNumber}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge className={getRoleColor(staff.role)}>
                      <Shield className="w-3 h-3 mr-1" />
                      {staff.role.replace('_', ' ')}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <span className="text-sm">
                      {staff.department || 'Unassigned'}
                    </span>
                    {staff.jobTitle && (
                      <div className="text-xs text-muted-foreground">
                        {staff.jobTitle}
                      </div>
                    )}
                  </TableCell>

                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <Badge className={getStatusColor(staff.status)}>
                        {staff.status}
                      </Badge>
                      {staff.requirePasswordChange && (
                        <Badge variant="outline" className="text-xs">
                          <Key className="w-3 h-3 mr-1" />
                          Password Reset Required
                        </Badge>
                      )}
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <Clock className="w-3 h-3" />
                      {formatLastLogin(staff.lastLogin ? new Date(staff.lastLogin) : undefined)}
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-1">
                      <span className="text-sm">
                        {staff.permissions.length} permissions
                      </span>
                      {staff.permissions.includes('*') && (
                        <Badge variant="destructive" className="text-xs">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Full Access
                        </Badge>
                      )}
                    </div>
                  </TableCell>

                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        
                        <DropdownMenuItem onClick={() => router.push(`/staff/${staff.id}`)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>

                        <DropdownMenuItem onClick={() => router.push(`/staff/${staff.id}/edit`)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Staff
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        {staff.status === 'active' ? (
                          <DropdownMenuItem 
                            onClick={() => handleStatusChange(staff, 'suspended')}
                            className="text-orange-600"
                          >
                            <UserX className="mr-2 h-4 w-4" />
                            Suspend
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem 
                            onClick={() => handleStatusChange(staff, 'active')}
                            className="text-green-600"
                          >
                            <UserCheck className="mr-2 h-4 w-4" />
                            Activate
                          </DropdownMenuItem>
                        )}

                        {staff.role === 'support' && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel>Agent Status</DropdownMenuLabel>
                            <DropdownMenuItem 
                              onClick={() => handleAgentStatusChange(staff, 'available')}
                            >
                              <Activity className="mr-2 h-4 w-4 text-green-500" />
                              Available
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleAgentStatusChange(staff, 'busy')}
                            >
                              <Activity className="mr-2 h-4 w-4 text-orange-500" />
                              Busy
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleAgentStatusChange(staff, 'away')}
                            >
                              <Activity className="mr-2 h-4 w-4 text-yellow-500" />
                              Away
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleAgentStatusChange(staff, 'offline')}
                            >
                              <Activity className="mr-2 h-4 w-4 text-gray-500" />
                              Offline
                            </DropdownMenuItem>
                          </>
                        )}

                        <DropdownMenuSeparator />
                        
                        <DropdownMenuItem 
                          onClick={() => setDeleteConfirm(staff)}
                          className="text-red-600"
                          disabled={staff.metadata?.cannotDelete}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden space-y-4">
            {data.data.map((staff) => (
              <Card key={staff.id} className="p-4">
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={selectedStaff.includes(staff.id)}
                    onCheckedChange={(checked) => handleSelectStaff(staff.id, checked as boolean)}
                  />
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={staff.profilePicture} />
                    <AvatarFallback>
                      {staff.firstName[0]}{staff.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium truncate">{staff.fullName}</div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>

                          <DropdownMenuItem onClick={() => router.push(`/staff/${staff.id}`)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>

                          <DropdownMenuItem onClick={() => router.push(`/staff/${staff.id}/edit`)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Staff
                          </DropdownMenuItem>

                          <DropdownMenuSeparator />

                          {staff.status === 'active' ? (
                            <DropdownMenuItem
                              onClick={() => handleStatusChange(staff, 'suspended')}
                              className="text-orange-600"
                            >
                              <UserX className="mr-2 h-4 w-4" />
                              Suspend
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              onClick={() => handleStatusChange(staff, 'active')}
                              className="text-green-600"
                            >
                              <UserCheck className="mr-2 h-4 w-4" />
                              Activate
                            </DropdownMenuItem>
                          )}

                          <DropdownMenuSeparator />

                          <DropdownMenuItem
                            onClick={() => setDeleteConfirm(staff)}
                            className="text-red-600"
                            disabled={staff.metadata?.cannotDelete}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="w-3 h-3" />
                        <span className="truncate">{staff.email}</span>
                      </div>

                      {staff.phoneNumber && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="w-3 h-3" />
                          <span>{staff.phoneNumber}</span>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2 mt-2">
                        <Badge className={getRoleColor(staff.role)}>
                          <Shield className="w-3 h-3 mr-1" />
                          {staff.role.replace('_', ' ')}
                        </Badge>
                        <Badge className={getStatusColor(staff.status)}>
                          {staff.status}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t">
                        <div className="text-xs text-muted-foreground">
                          {staff.department || 'Unassigned'}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {formatLastLogin(staff.lastLogin ? new Date(staff.lastLogin) : undefined)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {data && data.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Showing {((data.page - 1) * data.limit) + 1} to {Math.min(data.page * data.limit, data.total)} of {data.total} staff members
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  disabled={data.page <= 1}
                >
                  Previous
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  disabled={data.page >= data.totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      {deleteConfirm && (
        <ConfirmDialog
          open={!!deleteConfirm}
          onOpenChange={(open) => !open && setDeleteConfirm(null)}
          onConfirm={() => handleDelete(deleteConfirm)}
          title="Delete Staff Member"
          description={`Are you sure you want to delete ${deleteConfirm.fullName}? This action cannot be undone.`}
          confirmText="Delete"
          destructive={true}
        />
      )}
    </div>
  );
}