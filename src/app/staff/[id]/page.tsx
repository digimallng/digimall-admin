'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Mail,
  Phone,
  Shield,
  Calendar,
  Clock,
  Activity,
  Monitor,
  AlertCircle,
  CheckCircle,
  XCircle,
  Building,
  Key,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useStaffById, useStaffActivity, useStaffSessions } from '@/lib/hooks/use-staff';
import { format } from 'date-fns';

export default function StaffDetailPage() {
  const params = useParams();
  const router = useRouter();
  const staffId = params.id as string;

  const { data: staff, isLoading: staffLoading, error: staffError } = useStaffById(staffId);
  const { data: activityData, isLoading: activityLoading } = useStaffActivity(staffId, {
    page: 1,
    limit: 20,
  });
  const { data: sessionsData, isLoading: sessionsLoading } = useStaffSessions(staffId);

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
      case 'staff':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'Never';
    try {
      return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
    } catch {
      return 'Invalid date';
    }
  };

  if (staffLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (staffError || !staff) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4">
              <AlertCircle className="w-12 h-12 text-red-500" />
              <div className="text-center">
                <h3 className="text-lg font-semibold">Staff Member Not Found</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  The staff member you're looking for doesn't exist or you don't have permission to view it.
                </p>
              </div>
              <Button onClick={() => router.push('/staff')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Staff List
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.push('/staff')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {staff.firstName} {staff.lastName}
            </h1>
            <p className="text-muted-foreground">{staff.email}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Badge className={getStatusColor(staff.status)}>
            {staff.status === 'active' && <CheckCircle className="w-3 h-3 mr-1" />}
            {staff.status === 'suspended' && <XCircle className="w-3 h-3 mr-1" />}
            {staff.status}
          </Badge>
          <Badge className={getRoleColor(staff.role)}>
            <Shield className="w-3 h-3 mr-1" />
            {staff.role.replace('_', ' ')}
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">Activity Log</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Basic Information</CardTitle>
                <CardDescription>Personal and contact details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">{staff.email}</p>
                  </div>
                </div>

                {staff.phone && (
                  <div className="flex items-start gap-3">
                    <Phone className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Phone</p>
                      <p className="text-sm text-muted-foreground">{staff.phone}</p>
                    </div>
                  </div>
                )}

                {staff.department && (
                  <div className="flex items-start gap-3">
                    <Building className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Department</p>
                      <p className="text-sm text-muted-foreground">{staff.department}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <Shield className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Role</p>
                    <p className="text-sm text-muted-foreground capitalize">
                      {staff.role.replace('_', ' ')}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <AlertCircle className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Status</p>
                    <p className="text-sm text-muted-foreground capitalize">{staff.status}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Account Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Account Details</CardTitle>
                <CardDescription>Account timestamps and activity</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Created At</p>
                    <p className="text-sm text-muted-foreground">{formatDate(staff.createdAt)}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Last Updated</p>
                    <p className="text-sm text-muted-foreground">{formatDate(staff.updatedAt)}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Last Login</p>
                    <p className="text-sm text-muted-foreground">{formatDate(staff.lastLogin)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Permissions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Permissions</CardTitle>
              <CardDescription>
                {staff.permissions.includes('*')
                  ? 'Full access to all platform features'
                  : `${staff.permissions.length} specific permissions`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {staff.permissions.includes('*') ? (
                <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-md border border-purple-200">
                  <Key className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-900">
                    Full Platform Access - All Permissions Granted
                  </span>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {staff.permissions.map((permission) => (
                    <Badge key={permission} variant="outline" className="text-xs">
                      {permission.replace(':', ': ')}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Log Tab */}
        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Activity Log</CardTitle>
              <CardDescription>Recent actions performed by this staff member</CardDescription>
            </CardHeader>
            <CardContent>
              {activityLoading ? (
                <div className="flex items-center justify-center py-8">
                  <LoadingSpinner />
                </div>
              ) : !activityData?.data || activityData.data.length === 0 ? (
                <div className="text-center py-8">
                  <Activity className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground">No activity recorded yet</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Action</TableHead>
                      <TableHead>Resource</TableHead>
                      <TableHead>Details</TableHead>
                      <TableHead>IP Address</TableHead>
                      <TableHead>Timestamp</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activityData.data.map((activity: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">
                          {activity.action.replace('_', ' ')}
                        </TableCell>
                        <TableCell>
                          {activity.resource}
                          {activity.resourceId && (
                            <span className="text-xs text-muted-foreground block">
                              {activity.resourceId}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="max-w-md">
                          {typeof activity.details === 'string'
                            ? activity.details
                            : activity.details
                              ? JSON.stringify(activity.details)
                              : '-'
                          }
                        </TableCell>
                        <TableCell>
                          <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                            {activity.ipAddress || 'N/A'}
                          </code>
                        </TableCell>
                        <TableCell>{formatDate(activity.timestamp)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sessions Tab */}
        <TabsContent value="sessions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Active Sessions</CardTitle>
              <CardDescription>Current login sessions for this staff member</CardDescription>
            </CardHeader>
            <CardContent>
              {sessionsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <LoadingSpinner />
                </div>
              ) : !sessionsData?.data || sessionsData.data.length === 0 ? (
                <div className="text-center py-8">
                  <Monitor className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground">No active sessions</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sessionsData.data.map((session: any) => (
                    <div
                      key={session.sessionId}
                      className="flex items-start gap-4 p-4 border rounded-lg"
                    >
                      <Monitor className="w-5 h-5 text-muted-foreground mt-0.5" />
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-sm font-medium">Session ID</p>
                            <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                              {session.sessionId}
                            </code>
                          </div>
                          {session.isActive && (
                            <Badge className="bg-green-100 text-green-800 border-green-200">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Active
                            </Badge>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">IP Address</p>
                            <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                              {session.ipAddress}
                            </code>
                          </div>
                          <div>
                            <p className="text-muted-foreground">User Agent</p>
                            <p className="text-xs truncate">{session.userAgent}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Created</p>
                            <p className="text-xs">{formatDate(session.createdAt)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Last Activity</p>
                            <p className="text-xs">{formatDate(session.lastActivity)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
