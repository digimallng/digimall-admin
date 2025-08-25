'use client';

import { useState } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  Shield, 
  Calendar, 
  Activity, 
  Clock, 
  Key,
  MapPin,
  Monitor,
  Smartphone,
  Globe,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { 
  useStaffActivity, 
  useStaffSessions, 
  useStaffWorkload,
  useRevokeStaffSession,
} from '@/lib/hooks/use-staff';
import { Staff, staffService } from '@/lib/api/services/staff.service';

interface StaffDetailsModalProps {
  staff: Staff;
  isOpen: boolean;
  onClose: () => void;
}

export function StaffDetailsModal({ staff, isOpen, onClose }: StaffDetailsModalProps) {
  const [activeTab, setActiveTab] = useState('overview');

  const { data: activityData, isLoading: activityLoading } = useStaffActivity(staff.id, {
    limit: 20,
  });
  const { data: sessionsData, isLoading: sessionsLoading } = useStaffSessions(staff.id);
  const { data: workloadData, isLoading: workloadLoading } = useStaffWorkload(staff.id);
  const revokeSession = useRevokeStaffSession();

  const handleRevokeSession = async (sessionId: string) => {
    try {
      await revokeSession.mutateAsync({ sessionId });
    } catch (error) {
      // Error handled by hook
    }
  };

  const formatDate = (date?: Date) => {
    if (!date) return 'Not set';
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={staff.profilePicture} />
              <AvatarFallback>
                {staff.firstName[0]}{staff.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="text-xl font-semibold">{staff.fullName}</div>
              <div className="text-sm text-muted-foreground">{staff.email}</div>
            </div>
          </DialogTitle>
          <DialogDescription>
            Detailed information about {staff.firstName} {staff.lastName}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="permissions">Permissions</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{staff.fullName}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{staff.email}</span>
                  </div>
                  
                  {staff.phoneNumber && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{staff.phoneNumber}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-muted-foreground" />
                    <Badge className={getRoleColor(staff.role)}>
                      {staff.role.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-muted-foreground" />
                    <Badge className={getStatusColor(staff.status)}>
                      {staff.status.toUpperCase()}
                    </Badge>
                  </div>

                  {staff.department && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Department:</span>
                      <span className="text-sm">{staff.department}</span>
                    </div>
                  )}

                  {staff.jobTitle && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Job Title:</span>
                      <span className="text-sm">{staff.jobTitle}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Account Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Account Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm font-medium">Created</div>
                      <div className="text-sm text-muted-foreground">
                        {formatDate(staff.createdAt)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm font-medium">Last Login</div>
                      <div className="text-sm text-muted-foreground">
                        {formatDate(staff.lastLoginAt)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm font-medium">Login Count</div>
                      <div className="text-sm text-muted-foreground">
                        {staff.loginCount} total logins
                      </div>
                    </div>
                  </div>

                  {staff.requirePasswordChange && (
                    <div className="flex items-center gap-2 p-2 bg-yellow-50 rounded-md">
                      <Key className="w-4 h-4 text-yellow-600" />
                      <span className="text-sm text-yellow-800">
                        Password change required
                      </span>
                    </div>
                  )}

                  {staff.allowedIps.length > 0 && (
                    <div>
                      <div className="text-sm font-medium mb-1">Allowed IPs</div>
                      <div className="space-y-1">
                        {staff.allowedIps.map((ip, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            <MapPin className="w-3 h-3 mr-1" />
                            {ip}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Support Agent Workload (if applicable) */}
            {staff.role === 'support' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Support Agent Workload</CardTitle>
                </CardHeader>
                <CardContent>
                  {workloadLoading ? (
                    <LoadingSpinner />
                  ) : workloadData ? (
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {workloadData.activeTickets}
                        </div>
                        <div className="text-sm text-muted-foreground">Active Tickets</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {workloadData.resolvedToday}
                        </div>
                        <div className="text-sm text-muted-foreground">Resolved Today</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">
                          {workloadData.avgResponseTime}
                        </div>
                        <div className="text-sm text-muted-foreground">Avg Response Time</div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground">
                      No workload data available
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Notes */}
            {staff.notes && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{staff.notes}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="permissions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Assigned Permissions</CardTitle>
                <CardDescription>
                  Permissions granted to this staff member
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2 md:grid-cols-2">
                  {staff.permissions.map((permission) => (
                    <div
                      key={permission}
                      className="flex items-center gap-2 p-2 bg-gray-50 rounded-md"
                    >
                      <Shield className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">
                        {permission === '*' ? 'Full Access' : permission.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                      {permission === '*' && (
                        <Badge variant="destructive" className="text-xs ml-auto">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Full Access
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Recent Activity</CardTitle>
                <CardDescription>
                  Latest actions performed by this staff member
                </CardDescription>
              </CardHeader>
              <CardContent>
                {activityLoading ? (
                  <LoadingSpinner />
                ) : activityData?.activities?.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Action</TableHead>
                        <TableHead>Resource</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead>IP Address</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activityData.activities.map((activity: any) => (
                        <TableRow key={activity.id}>
                          <TableCell>
                            <span className="font-medium">{activity.action}</span>
                          </TableCell>
                          <TableCell>
                            {activity.entityType && (
                              <div>
                                <div className="text-sm">{activity.entityType}</div>
                                {activity.entityId && (
                                  <div className="text-xs text-muted-foreground">
                                    ID: {activity.entityId}
                                  </div>
                                )}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {formatDate(activity.timestamp)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm font-mono">
                              {activity.ipAddress}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No recent activity found
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sessions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Active Sessions</CardTitle>
                <CardDescription>
                  Current login sessions for this staff member
                </CardDescription>
              </CardHeader>
              <CardContent>
                {sessionsLoading ? (
                  <LoadingSpinner />
                ) : sessionsData?.sessions?.length > 0 ? (
                  <div className="space-y-4">
                    {sessionsData.sessions.map((session) => (
                      <div 
                        key={session.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gray-100 rounded-md">
                            {session.userAgent?.includes('Mobile') ? (
                              <Smartphone className="w-4 h-4" />
                            ) : (
                              <Monitor className="w-4 h-4" />
                            )}
                          </div>
                          
                          <div>
                            <div className="font-medium text-sm">
                              {session.userAgent?.split('/')[0] || 'Unknown Browser'}
                            </div>
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                              <Globe className="w-3 h-3" />
                              {session.ipAddress}
                              {session.location && ` • ${session.location}`}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Created: {formatDate(session.createdAt)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Last accessed: {formatDate(session.lastAccessedAt)}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Badge 
                            className={session.isActive ? 
                              'bg-green-100 text-green-800' : 
                              'bg-gray-100 text-gray-800'
                            }
                          >
                            {session.isActive ? 'Active' : 'Expired'}
                          </Badge>
                          
                          {session.isActive && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRevokeSession(session.id)}
                              disabled={revokeSession.isPending}
                            >
                              Revoke
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No active sessions found
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}