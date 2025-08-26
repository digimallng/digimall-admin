'use client';

import { useState } from 'react';
import { Plus, Search, Filter, Download, Shield, Users, Activity, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { StaffList } from '@/components/staff/StaffList';
import { StaffAnalytics } from '@/components/staff/StaffAnalytics';
import { StaffSecurityAudit } from '@/components/staff/StaffSecurityAudit';
import { StaffPermissions } from '@/components/staff/StaffPermissions';
import { CreateStaffModal } from '@/components/modals/CreateStaffModal';
import { InviteStaffModal } from '@/components/modals/InviteStaffModal';
import { useStaff, useStaffLimitInfo, useStaffStats } from '@/lib/hooks/use-staff';

export default function StaffPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('staff');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);

  // Build filters for API
  const filters = {
    search: searchTerm || undefined,
    role: roleFilter !== 'all' ? roleFilter : undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    department: departmentFilter !== 'all' ? departmentFilter : undefined,
    page: 1,
    limit: 20,
  };

  const { data: staffData, isLoading, refetch: refetchStaff } = useStaff(filters as any);
  const { data: limitInfo, refetch: refetchLimitInfo } = useStaffLimitInfo();
  const { data: staffStats, refetch: refetchStats } = useStaffStats({
    includeActivityStats: true,
    includePermissionStats: true,
    includeSecurityEvents: true,
  });

  const handleRefresh = async () => {
    await Promise.all([
      refetchStaff(),
      refetchLimitInfo(),
      refetchStats()
    ]);
  };

  const handleExport = () => {
    // Implementation for exporting staff data
    console.log('Exporting staff data...');
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
            Manage staff accounts, permissions, and support agent assignments
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => setShowInviteModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Invite Staff
          </Button>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Staff
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
              {staffData?.summary.byStatus.active || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently online and working
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Support Agents</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {staffData?.summary.byRole.support || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Available for ticket assignment
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Score</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {staffStats?.healthMetrics?.securityCompliance || 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Security compliance rating
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="staff">Staff Members</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="security">Security Audit</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
        </TabsList>

        <TabsContent value="staff" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Filter Staff</CardTitle>
              <CardDescription>
                Filter and search through staff members
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
                    <SelectItem value="moderator">Moderator</SelectItem>
                    <SelectItem value="analyst">Analyst</SelectItem>
                    <SelectItem value="support">Support</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    <SelectItem value="Technology">Technology</SelectItem>
                    <SelectItem value="Operations">Operations</SelectItem>
                    <SelectItem value="Customer Support">Customer Support</SelectItem>
                    <SelectItem value="Analytics">Analytics</SelectItem>
                    <SelectItem value="Security">Security</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Summary badges */}
              {staffData?.summary && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {Object.entries(staffData.summary.byRole).map(([role, count]) => (
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
        </TabsContent>

        <TabsContent value="analytics">
          <StaffAnalytics />
        </TabsContent>

        <TabsContent value="security">
          <StaffSecurityAudit />
        </TabsContent>

        <TabsContent value="permissions">
          <StaffPermissions />
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <CreateStaffModal 
        isOpen={showCreateModal} 
        onClose={() => setShowCreateModal(false)} 
      />
      
      <InviteStaffModal 
        isOpen={showInviteModal} 
        onClose={() => setShowInviteModal(false)} 
      />
    </div>
  );
}