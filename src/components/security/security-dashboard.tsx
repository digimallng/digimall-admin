'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { StatsCard } from '@/components/ui/StatsCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSecurityScore, useRecentSecurityEvents, useSecurityAlerts } from '@/lib/hooks/useSecurity';
import { formatDate, formatNumber } from '@/lib/utils/formatters';
import { 
  Shield, 
  AlertTriangle, 
  Eye, 
  Users, 
  Lock, 
  RefreshCw, 
  Download,
  Activity,
  UserCheck,
  Clock,
  Bug
} from 'lucide-react';
import { SecurityAlertsTable } from './security-alerts-table';
import { AuditLogsTable } from './audit-logs-table';
import { UserSessionsTable } from './user-sessions-table';
import { SecuritySettings } from './security-settings';

export function SecurityDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'alerts' | 'audit' | 'sessions' | 'settings'>('overview');

  const { data: securityScore, isLoading: scoreLoading, refetch: refetchScore } = useSecurityScore();
  const { data: recentEvents, isLoading: eventsLoading } = useRecentSecurityEvents(10);
  const { data: alerts } = useSecurityAlerts({ 
    filter: { status: 'open' },
    limit: 5
  });

  const handleRunAssessment = async () => {
    try {
      // This would trigger a security assessment
      await refetchScore();
    } catch (error) {
      console.error('Assessment failed:', error);
    }
  };

  const getScoreColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreGrade = (grade: string) => {
    const gradeConfig = {
      'A+': 'bg-green-100 text-green-800 border-green-200',
      'A': 'bg-green-100 text-green-800 border-green-200',
      'B+': 'bg-blue-100 text-blue-800 border-blue-200',
      'B': 'bg-blue-100 text-blue-800 border-blue-200',
      'C+': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'C': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'D': 'bg-red-100 text-red-800 border-red-200',
      'F': 'bg-red-100 text-red-800 border-red-200',
    } as const;

    return gradeConfig[grade as keyof typeof gradeConfig] || gradeConfig['F'];
  };

  const getSeverityBadge = (severity: string) => {
    const severityConfig = {
      low: { variant: 'outline', className: 'border-green-300 text-green-700 bg-green-50' },
      medium: { variant: 'outline', className: 'border-yellow-300 text-yellow-700 bg-yellow-50' },
      high: { variant: 'outline', className: 'border-orange-300 text-orange-700 bg-orange-50' },
      critical: { variant: 'outline', className: 'border-red-300 text-red-700 bg-red-50' },
    } as const;

    const config = severityConfig[severity as keyof typeof severityConfig] || severityConfig.low;
    
    return (
      <Badge variant={config.variant} className={config.className}>
        {severity.charAt(0).toUpperCase() + severity.slice(1)}
      </Badge>
    );
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Security Score */}
      <Card className="p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Security Score</h3>
            <p className="text-gray-600">Overall security posture assessment</p>
          </div>
          <Button
            variant="outline"
            onClick={handleRunAssessment}
            disabled={scoreLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${scoreLoading ? 'animate-spin' : ''}`} />
            Run Assessment
          </Button>
        </div>

        {securityScore && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Overall Score */}
            <div className="text-center">
              <div className={`text-4xl font-bold mb-2 ${getScoreColor(securityScore.overallScore, securityScore.maxScore)}`}>
                {securityScore.overallScore}/{securityScore.maxScore}
              </div>
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getScoreGrade(securityScore.grade)}`}>
                Grade: {securityScore.grade}
              </div>
              <div className="text-xs text-gray-500 mt-2">
                Last assessed: {formatDate(securityScore.lastAssessment)}
              </div>
            </div>

            {/* Component Breakdown */}
            <div className="space-y-3">
              {Object.entries(securityScore.components).map(([component, data]) => (
                <div key={component} className="flex justify-between items-center">
                  <span className="capitalize text-sm font-medium">{component.replace(/([A-Z])/g, ' $1')}</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${getScoreColor(data.score, data.maxScore)}`}>
                      {data.score}/{data.maxScore}
                    </span>
                    {data.issues > 0 && (
                      <Badge variant="outline" className="text-xs border-red-300 text-red-700 bg-red-50">
                        {data.issues} issues
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        {securityScore?.recommendations && securityScore.recommendations.length > 0 && (
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="font-medium text-yellow-800 mb-2">Security Recommendations</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              {securityScore.recommendations.slice(0, 3).map((rec, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="w-1 h-1 bg-yellow-600 rounded-full mt-2 flex-shrink-0"></span>
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        )}
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Open Alerts"
          value={formatNumber(alerts?.data.filter(a => a.status === 'open').length || 0)}
          icon={AlertTriangle}
          className="bg-gradient-to-r from-red-50 to-pink-50 border-red-200"
        />
        <StatsCard
          title="Active Sessions"
          value="24"
          icon={Users}
          className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200"
        />
        <StatsCard
          title="Failed Logins (24h)"
          value="12"
          icon={Lock}
          className="bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200"
        />
        <StatsCard
          title="Vulnerabilities"
          value="3"
          icon={Bug}
          className="bg-gradient-to-r from-purple-50 to-violet-50 border-purple-200"
        />
      </div>

      {/* Recent Security Events */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Security Events</h3>
        <div className="space-y-3">
          {eventsLoading ? (
            [...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg animate-pulse">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))
          ) : recentEvents?.length ? (
            recentEvents.map((event) => (
              <div key={event.id} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  event.severity === 'critical' ? 'bg-red-100 text-red-600' :
                  event.severity === 'high' ? 'bg-orange-100 text-orange-600' :
                  event.severity === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                  'bg-green-100 text-green-600'
                }`}>
                  <Activity className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{event.description}</span>
                    {getSeverityBadge(event.severity)}
                  </div>
                  <div className="text-xs text-gray-500 flex items-center gap-2">
                    <Clock className="w-3 h-3" />
                    {formatDate(event.timestamp)}
                    {event.userId && (
                      <>
                        <span>•</span>
                        <UserCheck className="w-3 h-3" />
                        User: {event.userId}
                      </>
                    )}
                    {event.ipAddress && (
                      <>
                        <span>•</span>
                        IP: {event.ipAddress}
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              No recent security events
            </div>
          )}
        </div>
      </Card>

      {/* Active Alerts */}
      {alerts?.data && alerts.data.length > 0 && (
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Active Security Alerts</h3>
            <Button variant="outline" size="sm">
              <Eye className="w-4 h-4 mr-2" />
              View All
            </Button>
          </div>
          <div className="space-y-3">
            {alerts.data.slice(0, 3).map((alert) => (
              <div key={alert.id} className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <div>
                    <div className="font-medium text-red-900">{alert.title}</div>
                    <div className="text-sm text-red-700">{alert.description}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getSeverityBadge(alert.severity)}
                  <Button variant="outline" size="sm" className="text-red-700 border-red-300">
                    Investigate
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );

  const tabs = [
    { id: 'overview', label: 'Overview', count: null },
    { id: 'alerts', label: 'Security Alerts', count: alerts?.data.filter(a => a.status === 'open').length },
    { id: 'audit', label: 'Audit Logs', count: null },
    { id: 'sessions', label: 'User Sessions', count: null },
    { id: 'settings', label: 'Settings', count: null },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Security Management</h1>
          <p className="text-gray-600">Monitor security events, alerts, and system health</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => refetchScore()}
            disabled={scoreLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${scoreLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
              {tab.count !== null && (
                <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
                  {formatNumber(tab.count)}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="min-h-96">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'alerts' && <SecurityAlertsTable />}
        {activeTab === 'audit' && <AuditLogsTable />}
        {activeTab === 'sessions' && <UserSessionsTable />}
        {activeTab === 'settings' && <SecuritySettings />}
      </div>
    </div>
  );
}