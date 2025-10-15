'use client';

import { useState } from 'react';
import {
  usePlatformConfig,
  useUpdatePlatformConfig,
  useUpdateMaintenanceMode,
  type PlatformConfig,
} from '@/lib/hooks/use-settings';
import {
  Settings,
  DollarSign,
  Bell,
  Shield,
  User,
  Save,
  Search,
  AlertTriangle,
  Info,
  Loader2,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/Textarea';
import { toast } from 'sonner';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'general' | 'commission' | 'notifications' | 'security' | 'profile'>('general');
  const [searchTerm, setSearchTerm] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<Record<string, any>>({});

  // Fetch data
  const {
    data: configs,
    isLoading: configsLoading,
    error: configsError,
  } = usePlatformConfig();

  const updateConfigMutation = useUpdatePlatformConfig();
  const updateMaintenanceMutation = useUpdateMaintenanceMode();

  // Loading states
  if (configsLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    );
  }

  // Error states
  if (configsError && !configs) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Failed to load settings</h3>
              <p className="text-muted-foreground">{configsError?.message || 'Unable to connect to admin services'}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const safeConfigs = configs || [];

  // Category mapping for tabs
  const getCategoryForTab = (tab: string): string[] => {
    switch (tab) {
      case 'general':
        return ['general'];
      case 'commission':
        return ['commission', 'payments'];
      case 'notifications':
        return ['notifications'];
      case 'security':
        return ['security'];
      case 'profile':
        return ['vendor']; // Using vendor category as placeholder for profile
      default:
        return [];
    }
  };

  const filteredConfigs = safeConfigs.filter(config => {
    const categories = getCategoryForTab(activeTab);
    const matchesCategory = categories.includes(config.category);
    const matchesSearch =
      config.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      config.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleConfigChange = (configId: string, newValue: any) => {
    setHasUnsavedChanges(true);
    setPendingChanges(prev => ({
      ...prev,
      [configId]: newValue
    }));
  };

  const handleSaveChanges = async () => {
    try {
      // Save all pending changes
      for (const [configId, value] of Object.entries(pendingChanges)) {
        await updateConfigMutation.mutateAsync({ id: configId, value });
      }

      toast.success('Settings saved successfully');
      setHasUnsavedChanges(false);
      setPendingChanges({});
    } catch (error: any) {
      toast.error(error.message || 'Failed to save settings');
    }
  };

  const handleCancelChanges = () => {
    setPendingChanges({});
    setHasUnsavedChanges(false);
    toast.info('Changes cancelled');
  };

  const handleToggleMaintenanceMode = async (enabled: boolean) => {
    try {
      await updateMaintenanceMutation.mutateAsync({
        enabled,
        message: enabled ? 'Platform under maintenance' : undefined
      });
      toast.success(`Maintenance mode ${enabled ? 'enabled' : 'disabled'}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to toggle maintenance mode');
    }
  };

  const getConfigValue = (config: PlatformConfig) => {
    return pendingChanges[config.id] !== undefined ? pendingChanges[config.id] : config.value;
  };

  const renderConfigInput = (config: PlatformConfig) => {
    const currentValue = getConfigValue(config);

    if (!config.editable) {
      return (
        <div className="px-3 py-2 bg-gray-50 dark:bg-gray-900 rounded border text-sm text-muted-foreground">
          {String(config.value)} (read-only)
        </div>
      );
    }

    switch (config.type) {
      case 'boolean':
        return (
          <div className="flex items-center space-x-2">
            <Switch
              checked={currentValue as boolean}
              onCheckedChange={(checked) => handleConfigChange(config.id, checked)}
            />
            <span className="text-sm">{currentValue ? 'Enabled' : 'Disabled'}</span>
          </div>
        );
      case 'select':
        return (
          <Select
            value={currentValue as string}
            onValueChange={(value) => handleConfigChange(config.id, value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {config.options?.map(option => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case 'textarea':
        return (
          <Textarea
            value={currentValue as string}
            onChange={(e) => handleConfigChange(config.id, e.target.value)}
            placeholder={config.description}
            rows={4}
          />
        );
      case 'number':
        return (
          <Input
            type="number"
            value={currentValue as number}
            onChange={(e) => handleConfigChange(config.id, parseFloat(e.target.value) || 0)}
            placeholder={config.description}
          />
        );
      default:
        return (
          <Input
            type="text"
            value={currentValue as string}
            onChange={(e) => handleConfigChange(config.id, e.target.value)}
            placeholder={config.description}
          />
        );
    }
  };

  // Find maintenance mode config
  const maintenanceConfig = safeConfigs.find(c => c.key === 'platform.maintenanceMode');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Platform Settings</h1>
          <p className="text-muted-foreground">
            Configure and manage platform settings
          </p>
        </div>
        <div className="flex gap-2">
          {hasUnsavedChanges && (
            <>
              <Button variant="outline" onClick={handleCancelChanges}>
                Cancel
              </Button>
              <Button onClick={handleSaveChanges} disabled={updateConfigMutation.isPending}>
                {updateConfigMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save Changes
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Unsaved Changes Warning */}
      {hasUnsavedChanges && (
        <Card className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <div className="flex-1">
                <p className="font-medium text-yellow-900 dark:text-yellow-100">Unsaved Changes</p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  You have unsaved changes. Click "Save Changes" to apply them.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Maintenance Mode Alert */}
      {maintenanceConfig && maintenanceConfig.value === true && (
        <Card className="border-red-500 bg-red-50 dark:bg-red-950/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <div>
                  <p className="font-medium text-red-900 dark:text-red-100">Maintenance Mode Active</p>
                  <p className="text-sm text-red-700 dark:text-red-300">
                    The platform is currently in maintenance mode
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleToggleMaintenanceMode(false)}
                disabled={updateMaintenanceMutation.isPending}
              >
                Disable
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Search settings..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Tab Navigation */}
      <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 max-w-3xl">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="commission" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Commission
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
        </TabsList>

        {/* General Settings Tab */}
        <TabsContent value="general" className="space-y-4">
          {/* Maintenance Mode Card */}
          {maintenanceConfig && (
            <Card>
              <CardHeader>
                <CardTitle>Maintenance Mode</CardTitle>
                <CardDescription>
                  Enable maintenance mode to temporarily disable platform access
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="maintenance-mode">Maintenance Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      When enabled, users will see a maintenance message
                    </p>
                  </div>
                  <Switch
                    id="maintenance-mode"
                    checked={maintenanceConfig.value as boolean}
                    onCheckedChange={handleToggleMaintenanceMode}
                    disabled={updateMaintenanceMutation.isPending}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Platform Configuration Cards */}
          {filteredConfigs.length > 0 ? (
            filteredConfigs.map((config) => (
              <Card key={config.id}>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-base font-medium">{config.label}</h3>
                        {config.required && (
                          <Badge variant="destructive" className="text-xs">Required</Badge>
                        )}
                        {!config.editable && (
                          <Badge variant="secondary" className="text-xs">Read-only</Badge>
                        )}
                        {config.encrypted && (
                          <Badge variant="outline" className="text-xs">Encrypted</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{config.description}</p>
                    </div>
                    <div className="max-w-md">
                      {renderConfigInput(config)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <Settings className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No settings found</h3>
                  <p className="text-muted-foreground">
                    {searchTerm ? 'Try adjusting your search terms' : 'No settings available for this category'}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Commission & Payments Tab */}
        <TabsContent value="commission" className="space-y-4">
          {filteredConfigs.length > 0 ? (
            filteredConfigs.map((config) => (
              <Card key={config.id}>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-base font-medium">{config.label}</h3>
                        {config.required && (
                          <Badge variant="destructive" className="text-xs">Required</Badge>
                        )}
                        {!config.editable && (
                          <Badge variant="secondary" className="text-xs">Read-only</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{config.description}</p>
                    </div>
                    <div className="max-w-md">
                      {renderConfigInput(config)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <DollarSign className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No commission settings found</h3>
                  <p className="text-muted-foreground">
                    Commission and payment settings will appear here
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Configure how the platform sends notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <div className="flex gap-2">
                    <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-blue-900 dark:text-blue-100">Email & SMS Configuration</p>
                      <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                        Email and SMS notification settings are configured through environment variables.
                        Contact your system administrator to update notification service providers.
                      </p>
                    </div>
                  </div>
                </div>

                {filteredConfigs.map((config) => (
                  <Card key={config.id}>
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-sm font-medium">{config.label}</h4>
                            {!config.editable && (
                              <Badge variant="secondary" className="text-xs">Read-only</Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">{config.description}</p>
                        </div>
                        <div className="max-w-md">
                          {renderConfigInput(config)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {filteredConfigs.length === 0 && (
                  <div className="text-center py-8">
                    <Bell className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No notification settings</h3>
                    <p className="text-muted-foreground">
                      Notification preferences will appear here
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-4">
          {filteredConfigs.length > 0 ? (
            filteredConfigs.map((config) => (
              <Card key={config.id}>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-base font-medium">{config.label}</h3>
                        {config.required && (
                          <Badge variant="destructive" className="text-xs">Required</Badge>
                        )}
                        {config.encrypted && (
                          <Badge variant="outline" className="text-xs">Encrypted</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{config.description}</p>
                    </div>
                    <div className="max-w-md">
                      {renderConfigInput(config)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <Shield className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No security settings found</h3>
                  <p className="text-muted-foreground">
                    Security configuration settings will appear here
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Admin Profile Settings</CardTitle>
              <CardDescription>
                Manage your personal admin account preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <User className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Profile Settings Coming Soon</h3>
                <p className="text-muted-foreground">
                  Admin profile management features are under development
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
