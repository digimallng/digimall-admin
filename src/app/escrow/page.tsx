'use client';

import { useState } from 'react';
import { useEscrowDashboardData } from '@/lib/hooks/use-escrow';
import { EscrowList } from '@/components/escrow/EscrowList';
import { EscrowDetails } from '@/components/escrow/EscrowDetails';
import { EscrowStats } from '@/components/escrow/EscrowStats';
import { EscrowActionModal } from '@/components/escrow/EscrowActionModal';
import { EscrowAnalytics } from '@/components/escrow/EscrowAnalytics';
// import { EscrowDisputeManagement } from '@/components/escrow/EscrowDisputeManagement';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  TrendingUp, 
  AlertTriangle, 
  Clock,
  Eye,
  BarChart3,
  List,
  RefreshCw,
  Download
} from 'lucide-react';
import { format } from 'date-fns';

export default function EscrowPage() {
  const [selectedEscrowId, setSelectedEscrowId] = useState<string | null>(null);
  const [actionModal, setActionModal] = useState<{ 
    isOpen: boolean; 
    escrow: any | null; 
    action: string | null 
  }>({
    isOpen: false,
    escrow: null,
    action: null,
  });
  const [activeTab, setActiveTab] = useState('overview');

  const {
    dashboard,
    statistics,
    expiringSoon,
    activeDisputes,
    isLoading,
    error,
    refetch
  } = useEscrowDashboardData();

  const handleViewEscrow = (escrowId: string) => {
    setSelectedEscrowId(escrowId);
    setActiveTab('details');
  };

  const handleEscrowAction = (escrowId: string, action: string) => {
    // In a real implementation, fetch the escrow data here
    setActionModal({
      isOpen: true,
      escrow: { id: escrowId, amount: 100000, currency: 'NGN', status: 'funded', reference: `ESC-${escrowId}` },
      action,
    });
  };

  const closeActionModal = () => {
    setActionModal({
      isOpen: false,
      escrow: null,
      action: null,
    });
  };

  const handleActionSuccess = () => {
    refetch();
    closeActionModal();
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Escrow Management</h1>
        </div>
        
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Failed to load escrow data. Please try refreshing the page.
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="ml-2"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Escrow Management</h1>
          <p className="text-gray-600 mt-1">
            Monitor and manage escrow transactions across the platform
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <EscrowStats statistics={statistics} loading={isLoading} />

      {/* Alert Cards for Critical Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Expiring Soon */}
        {expiringSoon && expiringSoon.length > 0 && (
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-orange-800 flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>Expiring Soon</span>
                <Badge variant="outline" className="text-orange-600 border-orange-300">
                  {expiringSoon.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {expiringSoon.slice(0, 3).map((escrow) => (
                  <div key={escrow.id} className="flex items-center justify-between text-sm">
                    <div>
                      <div className="font-medium text-orange-900">{escrow.reference}</div>
                      <div className="text-orange-700 text-xs">{escrow.customerName}</div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewEscrow(escrow.id)}
                      className="text-orange-700 border-orange-300 hover:bg-orange-100"
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
                {expiringSoon.length > 3 && (
                  <div className="text-xs text-orange-600 pt-2 border-t border-orange-200">
                    +{expiringSoon.length - 3} more expiring soon
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Active Disputes - temporarily disabled, backend endpoint not available */}
        {/* {activeDisputes && activeDisputes.length > 0 && ( */}
        {/*   <Card className="border-red-200 bg-red-50"> */}
        {/*     <CardHeader className="pb-3"> */}
        {/*       <CardTitle className="text-sm font-medium text-red-800 flex items-center space-x-2"> */}
        {/*         <AlertTriangle className="h-4 w-4" /> */}
        {/*         <span>Active Disputes</span> */}
        {/*         <Badge variant="outline" className="text-red-600 border-red-300"> */}
        {/*           {activeDisputes.length} */}
        {/*         </Badge> */}
        {/*       </CardTitle> */}
        {/*     </CardHeader> */}
        {/*     <CardContent> */}
        {/*       <div className="space-y-2 max-h-32 overflow-y-auto"> */}
        {/*         {activeDisputes.slice(0, 3).map((escrow) => ( */}
        {/*           <div key={escrow.id} className="flex items-center justify-between text-sm"> */}
        {/*             <div> */}
        {/*               <div className="font-medium text-red-900">{escrow.reference}</div> */}
        {/*               <div className="text-red-700 text-xs"> */}
        {/*                 {escrow.dispute?.reason || 'No reason specified'} */}
        {/*               </div> */}
        {/*             </div> */}
        {/*             <Button */}
        {/*               variant="outline" */}
        {/*               size="sm" */}
        {/*               onClick={() => handleViewEscrow(escrow.id)} */}
        {/*               className="text-red-700 border-red-300 hover:bg-red-100" */}
        {/*             > */}
        {/*               <Eye className="h-3 w-3" /> */}
        {/*             </Button> */}
        {/*           </div> */}
        {/*         ))} */}
        {/*         {activeDisputes.length > 3 && ( */}
        {/*           <div className="text-xs text-red-600 pt-2 border-t border-red-200"> */}
        {/*             +{activeDisputes.length - 3} more disputes */}
        {/*           </div> */}
        {/*         )} */}
        {/*       </div> */}
        {/*     </CardContent> */}
        {/*   </Card> */}
        {/* )} */}
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="escrows" className="flex items-center space-x-2">
            <List className="h-4 w-4" />
            <span>All Escrows</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="details" className="flex items-center space-x-2">
            <Eye className="h-4 w-4" />
            <span>Details</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Recent Escrow Activity</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {dashboard?.recentActivity ? (
                  <div className="space-y-3">
                    {dashboard.recentActivity.slice(0, 5).map((activity, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <div>
                          <div className="font-medium">{activity.reference}</div>
                          <div className="text-gray-500 text-xs">{activity.action}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-gray-900">{activity.amount}</div>
                          <div className="text-gray-500 text-xs">
                            {format(new Date(activity.timestamp), 'MMM dd, HH:mm')}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    No recent activity
                  </div>
                )}
              </CardContent>
            </Card>

            {/* System Health */}
            <Card>
              <CardHeader>
                <CardTitle>System Health</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Processing Rate</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium">98.5%</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Average Resolution Time</span>
                    <span className="text-sm font-medium">
                      {statistics?.averageProcessingTime || 0}h
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Success Rate</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium">
                        {statistics?.successRate?.toFixed(1) || 0}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Active Disputes</span>
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${
                        (statistics?.disputedEscrows || 0) > 10 ? 'bg-red-500' : 
                        (statistics?.disputedEscrows || 0) > 5 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}></div>
                      <span className="text-sm font-medium">
                        {statistics?.disputedEscrows || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="escrows" className="mt-6">
          <EscrowList 
            onViewEscrow={handleViewEscrow}
            onEscrowAction={handleEscrowAction}
          />
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <EscrowAnalytics />
        </TabsContent>

        {/* Disputes tab temporarily disabled - backend endpoint not available */}
        {/* <TabsContent value="disputes" className="mt-6"> */}
        {/*   <EscrowDisputeManagement /> */}
        {/* </TabsContent> */}

        <TabsContent value="details" className="mt-6">
          {selectedEscrowId ? (
            <EscrowDetails
              escrowId={selectedEscrowId}
              onClose={() => {
                setSelectedEscrowId(null);
                setActiveTab('escrows');
              }}
              onActionComplete={handleActionSuccess}
            />
          ) : (
            <div className="text-center py-12">
              <Eye className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Escrow Selected</h3>
              <p className="text-gray-500 mb-4">
                Select an escrow from the list to view its details.
              </p>
              <Button onClick={() => setActiveTab('escrows')}>
                <List className="h-4 w-4 mr-2" />
                Browse Escrows
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Action Modal */}
      {actionModal.isOpen && actionModal.escrow && actionModal.action && (
        <EscrowActionModal
          isOpen={actionModal.isOpen}
          onClose={closeActionModal}
          escrow={actionModal.escrow}
          action={actionModal.action}
          onSuccess={handleActionSuccess}
        />
      )}
    </div>
  );
}
