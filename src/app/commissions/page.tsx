'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DollarSign,
  Search,
  Edit,
  Trash2,
  Plus,
  Settings,
  Download,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  MoreVertical,
  Loader2,
  TrendingUp,
  Target,
  Award,
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils/cn';
import { commissionService } from '@/services/commission.service';
import {
  CommissionRule,
  CommissionFilterDto,
  CommissionRuleType,
  CommissionStatus,
  CreateCommissionRuleDto,
  UpdateCommissionRuleDto,
} from '@/types/commission.types';
import { toast } from 'sonner';
import { CommissionCalculator } from '@/components/commission/CommissionCalculator';
import { CommissionReports } from '@/components/commission/CommissionReports';
import { VendorCommissionView } from '@/components/commission/VendorCommissionView';
import { CategoryCommissionView } from '@/components/commission/CategoryCommissionView';
import { ExportService } from '@/services/export.service';
import { saveAs } from 'file-saver';

export default function CommissionsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<CommissionStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<CommissionRuleType | 'all'>('all');
  const [showRuleDialog, setShowRuleDialog] = useState(false);
  const [editingRule, setEditingRule] = useState<CommissionRule | null>(null);
  const [activeTab, setActiveTab] = useState('rules');
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState<CreateCommissionRuleDto>({
    name: '',
    description: '',
    type: CommissionRuleType.PERCENTAGE,
    value: 5,
    isDefault: false,
  });

  const queryClient = useQueryClient();

  const filter: CommissionFilterDto = {
    page: currentPage,
    limit: 20,
    ...(statusFilter !== 'all' && { status: statusFilter as CommissionStatus }),
    ...(typeFilter !== 'all' && { ruleType: typeFilter as CommissionRuleType }),
  };

  const { data: rulesData, isLoading: rulesLoading } = useQuery({
    queryKey: ['commission-rules', filter],
    queryFn: () => commissionService.getCommissionRules(filter),
    refetchInterval: 30000,
  });

  const { data: analyticsData, isLoading: analyticsLoading } = useQuery({
    queryKey: ['commission-analytics'],
    queryFn: () => commissionService.getCommissionAnalytics(),
    refetchInterval: 60000,
  });

  const createRuleMutation = useMutation({
    mutationFn: (data: CreateCommissionRuleDto) => commissionService.createCommissionRule(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commission-rules'] });
      queryClient.invalidateQueries({ queryKey: ['commission-analytics'] });
      toast.success('Commission rule created successfully');
      setShowRuleDialog(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to create commission rule');
    },
  });

  const updateRuleMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCommissionRuleDto }) =>
      commissionService.updateCommissionRule(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commission-rules'] });
      queryClient.invalidateQueries({ queryKey: ['commission-analytics'] });
      toast.success('Commission rule updated successfully');
      setShowRuleDialog(false);
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to update commission rule');
    },
  });

  const deleteRuleMutation = useMutation({
    mutationFn: commissionService.deleteCommissionRule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commission-rules'] });
      queryClient.invalidateQueries({ queryKey: ['commission-analytics'] });
      toast.success('Commission rule deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to delete commission rule');
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      type: CommissionRuleType.PERCENTAGE,
      value: 5,
      vendorId: '',
      categoryId: '',
      minOrderValue: undefined,
      maxOrderValue: undefined,
      validFrom: undefined,
      validUntil: undefined,
      isDefault: false,
    });
  };

  const filteredRules = rulesData?.rules?.filter((rule) => {
    if (searchTerm) {
      return (
        rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rule.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return true;
  }) || [];

  const handleAddRule = () => {
    setEditingRule(null);
    resetForm();
    setShowRuleDialog(true);
  };

  const handleEditRule = (rule: CommissionRule) => {
    setEditingRule(rule);
    setFormData({
      name: rule.name,
      description: rule.description,
      type: rule.type,
      value: rule.value,
      vendorId: rule.vendorId,
      categoryId: rule.categoryId,
      minOrderValue: rule.minOrderValue,
      maxOrderValue: rule.maxOrderValue,
      validFrom: rule.validFrom ? new Date(rule.validFrom).toISOString().split('T')[0] : undefined,
      validUntil: rule.validUntil ? new Date(rule.validUntil).toISOString().split('T')[0] : undefined,
      isDefault: rule.isDefault,
    });
    setShowRuleDialog(true);
  };

  const handleSaveRule = () => {
    if (!formData.name?.trim()) {
      toast.error('Rule name is required');
      return;
    }

    if (!formData.value || formData.value <= 0) {
      toast.error('Commission value must be greater than 0');
      return;
    }

    if (formData.type === CommissionRuleType.PERCENTAGE && formData.value > 100) {
      toast.error('Percentage commission cannot exceed 100%');
      return;
    }

    if (editingRule) {
      const updateData: UpdateCommissionRuleDto = {
        name: formData.name,
        description: formData.description,
        value: formData.value,
        minOrderValue: formData.minOrderValue,
        maxOrderValue: formData.maxOrderValue,
        validFrom: formData.validFrom,
        validUntil: formData.validUntil,
        isDefault: formData.isDefault,
      };
      updateRuleMutation.mutate({ id: editingRule.id, data: updateData });
    } else {
      const createData: CreateCommissionRuleDto = {
        ...formData,
        name: formData.name.trim(),
        description: formData.description?.trim() || undefined,
        value: Number(formData.value),
      };
      createRuleMutation.mutate(createData);
    }
  };

  const handleDeleteRule = (ruleId: string) => {
    if (confirm('Are you sure you want to delete this commission rule?')) {
      deleteRuleMutation.mutate(ruleId);
    }
  };

  const handleToggleRuleStatus = (rule: CommissionRule) => {
    const newStatus = rule.status === CommissionStatus.ACTIVE
      ? CommissionStatus.INACTIVE
      : CommissionStatus.ACTIVE;

    updateRuleMutation.mutate({
      id: rule.id,
      data: { status: newStatus }
    });
  };

  const handleClientSideExport = (format: 'csv' | 'excel') => {
    if (!filteredRules || filteredRules.length === 0) {
      toast.error('No commission rules to export');
      return;
    }

    try {
      if (format === 'excel') {
        ExportService.exportCommissionRulesToExcel(filteredRules, {
          filename: 'commission-rules',
          includeTimestamp: true,
        });
      } else {
        ExportService.exportCommissionRulesToCSV(filteredRules, {
          filename: 'commission-rules',
          includeTimestamp: true,
        });
      }
      toast.success(`Commission rules exported successfully as ${format.toUpperCase()}`);
    } catch (error) {
      toast.error('Failed to export commission rules');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getTypeColor = (type: CommissionRuleType) => {
    switch (type) {
      case CommissionRuleType.PERCENTAGE:
        return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
      case CommissionRuleType.FIXED:
        return 'bg-purple-100 text-purple-800 hover:bg-purple-100';
      case CommissionRuleType.TIERED:
        return 'bg-green-100 text-green-800 hover:bg-green-100';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
  };

  const stats = {
    totalRules: analyticsData?.totalRules || 0,
    activeRules: analyticsData?.activeRules || 0,
    inactiveRules: analyticsData?.inactiveRules || 0,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Commission Management</h1>
          <p className="text-muted-foreground">
            Manage commission rules and track payments
          </p>
        </div>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleClientSideExport('csv')}>
                Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleClientSideExport('excel')}>
                Export as Excel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button onClick={handleAddRule}>
            <Plus className="w-4 h-4 mr-2" />
            Add Rule
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Rules</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {analyticsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats.totalRules}</div>
                <p className="text-xs text-muted-foreground mt-1">All commission rules</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Rules</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {analyticsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats.activeRules}</div>
                <p className="text-xs text-muted-foreground mt-1">Currently active</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Inactive Rules</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {analyticsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats.inactiveRules}</div>
                <p className="text-xs text-muted-foreground mt-1">Not in use</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="rules">Commission Rules</TabsTrigger>
          <TabsTrigger value="calculator">Calculator</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="vendors">By Vendor</TabsTrigger>
          <TabsTrigger value="categories">By Category</TabsTrigger>
        </TabsList>

        <TabsContent value="rules" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle>Commission Rules</CardTitle>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search rules..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 w-full sm:w-64"
                    />
                  </div>

                  <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as any)}>
                    <SelectTrigger className="w-full sm:w-40">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as any)}>
                    <SelectTrigger className="w-full sm:w-40">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="percentage">Percentage</SelectItem>
                      <SelectItem value="fixed">Fixed</SelectItem>
                      <SelectItem value="tiered">Tiered</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {rulesLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Rule</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Value</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRules.map((rule) => (
                        <TableRow key={rule.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{rule.name}</p>
                              <p className="text-sm text-muted-foreground">{rule.description}</p>
                              {rule.isDefault && (
                                <Badge className="mt-1 bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                                  Default
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getTypeColor(rule.type)}>
                              {rule.type}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {rule.type === CommissionRuleType.PERCENTAGE
                              ? `${rule.value}%`
                              : rule.type === CommissionRuleType.FIXED
                              ? formatCurrency(rule.value)
                              : 'Tiered'}
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={cn(
                                rule.status === CommissionStatus.ACTIVE
                                  ? 'bg-green-100 text-green-800 hover:bg-green-100'
                                  : 'bg-red-100 text-red-800 hover:bg-red-100'
                              )}
                            >
                              {rule.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {format(new Date(rule.createdAt), 'MMM dd, yyyy')}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEditRule(rule)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleToggleRuleStatus(rule)}>
                                  {rule.status === CommissionStatus.ACTIVE ? (
                                    <>
                                      <AlertTriangle className="mr-2 h-4 w-4" />
                                      Deactivate
                                    </>
                                  ) : (
                                    <>
                                      <CheckCircle className="mr-2 h-4 w-4" />
                                      Activate
                                    </>
                                  )}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleDeleteRule(rule.id)}
                                  disabled={rule.isDefault}
                                  className="text-red-600"
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

                  {filteredRules.length === 0 && (
                    <div className="text-center py-12">
                      <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground" />
                      <h3 className="mt-4 text-lg font-semibold">No commission rules found</h3>
                      <p className="text-sm text-muted-foreground">Get started by creating your first rule.</p>
                      <Button onClick={handleAddRule} className="mt-4">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Rule
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calculator">
          <CommissionCalculator />
        </TabsContent>

        <TabsContent value="reports">
          <CommissionReports />
        </TabsContent>

        <TabsContent value="vendors">
          <VendorCommissionView />
        </TabsContent>

        <TabsContent value="categories">
          <CategoryCommissionView />
        </TabsContent>
      </Tabs>

      {/* Commission Rule Dialog */}
      <Dialog open={showRuleDialog} onOpenChange={setShowRuleDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingRule ? 'Edit Commission Rule' : 'Add New Commission Rule'}
            </DialogTitle>
            <DialogDescription>
              Configure commission rules for vendors, categories, or specific order values
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Rule Name *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter rule name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Type *</label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as CommissionRuleType }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={CommissionRuleType.PERCENTAGE}>Percentage</SelectItem>
                    <SelectItem value={CommissionRuleType.FIXED}>Fixed Amount</SelectItem>
                    <SelectItem value={CommissionRuleType.TIERED}>Tiered</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter rule description"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {formData.type === CommissionRuleType.PERCENTAGE ? 'Rate (%)' : 'Amount'} *
                </label>
                <Input
                  type="number"
                  value={formData.value}
                  onChange={(e) => setFormData(prev => ({ ...prev, value: parseFloat(e.target.value) || 0 }))}
                  placeholder={formData.type === CommissionRuleType.PERCENTAGE ? '5.0' : '1000'}
                  step={formData.type === CommissionRuleType.PERCENTAGE ? '0.01' : '1'}
                  min="0"
                  max={formData.type === CommissionRuleType.PERCENTAGE ? '100' : undefined}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Vendor ID</label>
                <Input
                  value={formData.vendorId || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, vendorId: e.target.value || undefined }))}
                  placeholder="Leave empty for all vendors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Minimum Order Value</label>
                <Input
                  type="number"
                  value={formData.minOrderValue || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, minOrderValue: parseFloat(e.target.value) || undefined }))}
                  placeholder="0"
                  min="0"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Maximum Order Value</label>
                <Input
                  type="number"
                  value={formData.maxOrderValue || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, maxOrderValue: parseFloat(e.target.value) || undefined }))}
                  placeholder="Leave empty for no limit"
                  min="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Valid From</label>
                <Input
                  type="date"
                  value={formData.validFrom || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, validFrom: e.target.value || undefined }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Valid Until</label>
                <Input
                  type="date"
                  value={formData.validUntil || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, validUntil: e.target.value || undefined }))}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isDefault"
                checked={formData.isDefault}
                onChange={(e) => setFormData(prev => ({ ...prev, isDefault: e.target.checked }))}
                className="rounded border-gray-300"
              />
              <label htmlFor="isDefault" className="text-sm font-medium">
                Set as Default Rule
              </label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRuleDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveRule}
              disabled={createRuleMutation.isPending || updateRuleMutation.isPending}
            >
              {createRuleMutation.isPending || updateRuleMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              {editingRule ? 'Update Rule' : 'Create Rule'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
