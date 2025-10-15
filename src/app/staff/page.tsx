'use client';

import { useState } from 'react';
import { Plus, Search, Download, Users, Activity, Shield } from 'lucide-react';
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
import { StaffList } from '@/components/staff/StaffList';
import { CreateStaffModal } from '@/components/modals/CreateStaffModal';
import { useStaff, useStaffLimitInfo, useStaffStats } from '@/lib/hooks/use-staff';
import { ExportService } from '@/services/export.service';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';

export default function StaffPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Build filters for API (only backend-supported filters)
  const filters = {
    search: searchTerm || undefined,
    role: roleFilter !== 'all' ? roleFilter : undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    page: 1,
    limit: 20,
  };

  const { data: staffData, isLoading, refetch: refetchStaff } = useStaff(filters as any);
  const { data: limitInfo, refetch: refetchLimitInfo } = useStaffLimitInfo();
  const { data: staffStats, refetch: refetchStats } = useStaffStats();

  const handleRefresh = async () => {
    await Promise.all([
      refetchStaff(),
      refetchLimitInfo(),
      refetchStats()
    ]);
  };

  const handleExport = async (exportFormat: 'csv' | 'excel' = 'csv') => {
    try {
      if (!staffData?.data || staffData.data.length === 0) {
        toast.error('No staff data to export');
        return;
      }

      // Only export fields that exist in backend API response
      const exportData = staffData.data.map(staff => ({
        'Staff ID': staff.id,
        'First Name': staff.firstName || '',
        'Last Name': staff.lastName || '',
        'Email': staff.email,
        'Role': staff.role,
        'Status': staff.status,
        'Phone': staff.phone || '',
        'Department': staff.department || '',
        'Permissions': staff.permissions ? staff.permissions.join(', ') : '',
        'Last Login': staff.lastLogin ? format(new Date(staff.lastLogin), 'yyyy-MM-dd HH:mm:ss') : '',
        'Created At': format(new Date(staff.createdAt), 'yyyy-MM-dd HH:mm:ss'),
        'Updated At': format(new Date(staff.updatedAt), 'yyyy-MM-dd HH:mm:ss'),
      }));

      ExportService.exportData(exportData, exportFormat, 'staff-export', {
        sheetName: 'Staff',
        includeTimestamp: true
      });

      toast.success(`Exported ${exportData.length} staff records to ${exportFormat.toUpperCase()}`);
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Export failed. Please try again.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Staff Management</h1>
          <p className="text-muted-foreground">
            Manage staff accounts and permissions
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
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Staff
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{staffData?.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              {limitInfo && `${limitInfo.availableSlots} slots available`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Staff</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {staffStats?.activeStaff || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive Staff</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {staffStats?.inactiveStaff || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Not currently active
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filter Staff</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search staff..."
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
                <SelectItem value="super_admin">Super Admin</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="staff">Staff</SelectItem>
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

          {/* Role distribution badges */}
          {staffStats?.byRole && (
            <div className="flex flex-wrap gap-2 mt-4">
              {Object.entries(staffStats.byRole).map(([role, count]) => (
                <Badge key={role} variant="secondary">
                  {role.replace('_', ' ')}: {count}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Staff List */}
      <StaffList
        data={staffData}
        isLoading={isLoading}
        onRefresh={handleRefresh}
      />

      {/* Modals */}
      <CreateStaffModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  );
}