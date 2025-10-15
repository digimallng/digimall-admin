'use client';

import { useState, useEffect } from 'react';
import { Shield, Save, RotateCcw, Info, Users, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRolePermissions, useUpdateRolePermissions } from '@/lib/hooks/use-staff';
import { StaffRole } from '@/lib/api/services/staff.service';

interface StaffPermissionsProps {
  className?: string;
}

const PERMISSION_CATEGORIES = {
  'User Management': {
    icon: Users,
    permissions: [
      'users:view',
      'users:create', 
      'users:edit',
      'users:delete',
      'users:ban',
      'users:unban',
      'users:verify'
    ]
  },
  'Staff Management': {
    icon: Shield,
    permissions: [
      'staff:view',
      'staff:create',
      'staff:edit', 
      'staff:delete',
      'staff:roles:manage',
      'staff:permissions:manage',
      'staff:sessions:manage'
    ]
  },
  'Support System': {
    icon: Settings,
    permissions: [
      'support:tickets:view',
      'support:tickets:assign',
      'support:tickets:respond',
      'support:tickets:close',
      'support:tickets:escalate',
      'support:knowledge:manage'
    ]
  },
  'System Administration': {
    icon: Settings,
    permissions: [
      'system:config:view',
      'system:config:edit',
      'system:logs:view',
      'system:analytics:view',
      'system:reports:generate',
      'system:maintenance:perform'
    ]
  }
} as const;

const ROLE_DESCRIPTIONS = {
  super_admin: 'Complete system access with all permissions',
  admin: 'Administrative access with most permissions',
  moderator: 'Content and user moderation capabilities', 
  analyst: 'Read-only access for analytics and reporting',
  support: 'Customer support and ticket management',
  viewer: 'View-only access to basic information'
} as const;

export function StaffPermissions({ className = '' }: StaffPermissionsProps) {
  const [selectedRole, setSelectedRole] = useState<StaffRole>('support');
  const [permissionMatrix, setPermissionMatrix] = useState<Record<StaffRole, string[]>>({});
  const [hasChanges, setHasChanges] = useState(false);

  const { data: rolePermissions, isLoading } = useRolePermissions();
  const updateRolePermissions = useUpdateRolePermissions();

  useEffect(() => {
    if (rolePermissions) {
      const matrix: Record<StaffRole, string[]> = {} as Record<StaffRole, string[]>;
      Object.entries(rolePermissions.roles).forEach(([role, data]) => {
        matrix[role as StaffRole] = [...data.permissions];
      });
      setPermissionMatrix(matrix);
    }
  }, [rolePermissions]);

  const togglePermission = (role: StaffRole, permission: string) => {
    setPermissionMatrix(prev => {
      const rolePerms = prev[role] || [];
      const hasPermission = rolePerms.includes(permission);
      
      const updatedPerms = hasPermission
        ? rolePerms.filter(p => p !== permission)
        : [...rolePerms, permission];

      const newMatrix = {
        ...prev,
        [role]: updatedPerms
      };

      setHasChanges(true);
      return newMatrix;
    });
  };

  const hasPermission = (role: StaffRole, permission: string): boolean => {
    const rolePerms = permissionMatrix[role] || [];
    return rolePerms.includes('*') || rolePerms.includes(permission);
  };

  const getPermissionCount = (role: StaffRole): number => {
    const rolePerms = permissionMatrix[role] || [];
    if (rolePerms.includes('*')) return rolePermissions?.allPermissions.length || 0;
    return rolePerms.length;
  };

  const handleSaveChanges = async () => {
    try {
      for (const [role, permissions] of Object.entries(permissionMatrix)) {
        await updateRolePermissions.mutateAsync({
          role: role as StaffRole,
          permissions
        });
      }
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to save permission changes:', error);
    }
  };

  const handleResetChanges = () => {
    if (rolePermissions) {
      const matrix: Record<StaffRole, string[]> = {} as Record<StaffRole, string[]>;
      Object.entries(rolePermissions.roles).forEach(([role, data]) => {
        matrix[role as StaffRole] = [...data.permissions];
      });
      setPermissionMatrix(matrix);
      setHasChanges(false);
    }
  };

  const copyPermissionsFromRole = (fromRole: StaffRole, toRole: StaffRole) => {
    setPermissionMatrix(prev => ({
      ...prev,
      [toRole]: [...(prev[fromRole] || [])]
    }));
    setHasChanges(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="w-6 h-6 text-primary" />
          <div>
            <h2 className="text-xl font-semibold">Staff Permissions Management</h2>
            <p className="text-sm text-muted-foreground">
              Configure role-based permissions for staff members
            </p>
          </div>
        </div>
        
        {hasChanges && (
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleResetChanges}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
            <Button 
              onClick={handleSaveChanges}
              disabled={updateRolePermissions.isPending}
            >
              <Save className="w-4 h-4 mr-2" />
              {updateRolePermissions.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        )}
      </div>

      <Tabs defaultValue="matrix" className="space-y-4">
        <TabsList>
          <TabsTrigger value="matrix">Permission Matrix</TabsTrigger>
          <TabsTrigger value="role-editor">Role Editor</TabsTrigger>
          <TabsTrigger value="overview">Roles Overview</TabsTrigger>
        </TabsList>

        {/* Permission Matrix View */}
        <TabsContent value="matrix" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Permission Matrix</CardTitle>
              <CardDescription>
                View and edit permissions across all roles. Changes are highlighted and can be saved or reset.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-64">Permission</TableHead>
                      <TableHead className="text-center">Super Admin</TableHead>
                      <TableHead className="text-center">Admin</TableHead>
                      <TableHead className="text-center">Moderator</TableHead>
                      <TableHead className="text-center">Analyst</TableHead>
                      <TableHead className="text-center">Support</TableHead>
                      <TableHead className="text-center">Viewer</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(PERMISSION_CATEGORIES).map(([category, { icon: Icon, permissions }]) => (
                      <>
                        <TableRow key={category} className="bg-muted/50">
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <Icon className="w-4 h-4" />
                              {category}
                            </div>
                          </TableCell>
                          <TableCell colSpan={6}></TableCell>
                        </TableRow>
                        {permissions.map(permission => (
                          <TableRow key={permission}>
                            <TableCell className="pl-8">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <div className="flex items-center gap-2">
                                      <Info className="w-3 h-3 text-muted-foreground" />
                                      <span className="text-sm">{permission.replace(':', ': ')}</span>
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Permission: {permission}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </TableCell>
                            {(['super_admin', 'admin', 'moderator', 'analyst', 'support', 'viewer'] as StaffRole[]).map(role => (
                              <TableCell key={role} className="text-center">
                                <Switch
                                  checked={hasPermission(role, permission)}
                                  onCheckedChange={() => togglePermission(role, permission)}
                                  disabled={role === 'super_admin'} // Super admin always has all permissions
                                />
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Role Editor View */}
        <TabsContent value="role-editor" className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Label htmlFor="role-select">Select Role:</Label>
              <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value as StaffRole)}>
                <SelectTrigger id="role-select" className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="super_admin">Super Administrator</SelectItem>
                  <SelectItem value="admin">Administrator</SelectItem>
                  <SelectItem value="moderator">Moderator</SelectItem>
                  <SelectItem value="analyst">Business Analyst</SelectItem>
                  <SelectItem value="support">Customer Support</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-2">
              <Label>Copy from:</Label>
              <Select onValueChange={(value) => copyPermissionsFromRole(value as StaffRole, selectedRole)}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Copy permissions from..." />
                </SelectTrigger>
                <SelectContent>
                  {(['super_admin', 'admin', 'moderator', 'analyst', 'support', 'viewer'] as StaffRole[])
                    .filter(role => role !== selectedRole)
                    .map(role => (
                      <SelectItem key={role} value={role}>
                        {rolePermissions?.roles[role]?.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                {rolePermissions?.roles[selectedRole]?.name}
              </CardTitle>
              <CardDescription>
                {ROLE_DESCRIPTIONS[selectedRole]}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {Object.entries(PERMISSION_CATEGORIES).map(([category, { icon: Icon, permissions }]) => (
                <div key={category} className="space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b">
                    <Icon className="w-4 h-4" />
                    <h4 className="font-medium">{category}</h4>
                    <Badge variant="outline" className="ml-auto">
                      {permissions.filter(p => hasPermission(selectedRole, p)).length} / {permissions.length}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {permissions.map(permission => (
                      <div key={permission} className="flex items-center space-x-2">
                        <Switch
                          id={`${selectedRole}-${permission}`}
                          checked={hasPermission(selectedRole, permission)}
                          onCheckedChange={() => togglePermission(selectedRole, permission)}
                          disabled={selectedRole === 'super_admin'}
                        />
                        <Label htmlFor={`${selectedRole}-${permission}`} className="text-sm">
                          {permission.replace(':', ': ')}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Roles Overview */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rolePermissions && Object.entries(rolePermissions.roles).map(([role, data]) => (
              <Card key={role}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    {data.name}
                  </CardTitle>
                  <CardDescription>{data.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Permissions:</span>
                    <Badge variant="secondary">
                      {getPermissionCount(role as StaffRole)}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    {Object.entries(PERMISSION_CATEGORIES).map(([category, { icon: Icon, permissions }]) => {
                      const categoryPerms = permissions.filter(p => hasPermission(role as StaffRole, p));
                      if (categoryPerms.length === 0) return null;
                      
                      return (
                        <div key={category} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1">
                            <Icon className="w-3 h-3" />
                            {category}
                          </div>
                          <span className="text-muted-foreground">
                            {categoryPerms.length}/{permissions.length}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}