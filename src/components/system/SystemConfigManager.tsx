'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Settings,
  Save,
  RotateCcw,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Download,
  Upload,
  Info
} from 'lucide-react';
import { systemService } from '@/lib/api/services/system.service';
import { AnimatedCard, GlowingButton } from '@/components/ui/AnimatedCard';
import { useToast } from '@/hooks/use-notifications';
import { cn } from '@/lib/utils/cn';

interface ConfigSection {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  settings: ConfigSetting[];
}

interface ConfigSetting {
  key: string;
  label: string;
  type: 'text' | 'number' | 'boolean' | 'select' | 'password' | 'textarea';
  value: any;
  default?: any;
  description?: string;
  options?: { label: string; value: any }[];
  required?: boolean;
  sensitive?: boolean;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

export function SystemConfigManager() {
  const [activeSection, setActiveSection] = useState('general');
  const [editedConfig, setEditedConfig] = useState<Record<string, any>>({});
  const [showSensitive, setShowSensitive] = useState<Record<string, boolean>>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const {
    data: config,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['system', 'config'],
    queryFn: () => systemService.getSystemConfig(),
  });

  const updateConfigMutation = useMutation({
    mutationFn: (configData: any) => systemService.updateSystemConfig(configData),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['system', 'config'] });
      setEditedConfig({});
      setHasUnsavedChanges(false);
      toast({
        title: 'Configuration Updated',
        description: 'System configuration has been successfully updated.',
        type: 'success',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Update Failed',
        description: error.message || 'Failed to update system configuration.',
        type: 'error',
      });
    },
  });

  // Transform config data into sections
  const configSections: ConfigSection[] = config ? [
    {
      id: 'general',
      title: 'General Settings',
      description: 'Basic system configuration and platform settings',
      icon: Settings,
      settings: [
        {
          key: 'environment',
          label: 'Environment',
          type: 'text',
          value: config.environment,
          description: 'Current deployment environment'
        },
        {
          key: 'version',
          label: 'Version',
          type: 'text',
          value: config.version,
          description: 'Current system version'
        },
        {
          key: 'maintenance.enabled',
          label: 'Maintenance Mode',
          type: 'boolean',
          value: config.maintenance?.enabled,
          description: 'Enable maintenance mode to restrict access'
        },
        {
          key: 'maintenance.message',
          label: 'Maintenance Message',
          type: 'textarea',
          value: config.maintenance?.message,
          description: 'Message to display during maintenance'
        },
      ]
    },
    {
      id: 'features',
      title: 'Feature Flags',
      description: 'Enable or disable system features',
      icon: CheckCircle,
      settings: [
        {
          key: 'features.emailVerification',
          label: 'Email Verification',
          type: 'boolean',
          value: config.features?.emailVerification,
          description: 'Require email verification for new users'
        },
        {
          key: 'features.phoneVerification',
          label: 'Phone Verification',
          type: 'boolean',
          value: config.features?.phoneVerification,
          description: 'Require phone verification for new users'
        },
        {
          key: 'features.twoFactorAuth',
          label: 'Two-Factor Authentication',
          type: 'boolean',
          value: config.features?.twoFactorAuth,
          description: 'Enable two-factor authentication'
        },
        {
          key: 'features.vendorVerification',
          label: 'Vendor Verification',
          type: 'boolean',
          value: config.features?.vendorVerification,
          description: 'Require manual vendor verification'
        },
      ]
    },
    {
      id: 'limits',
      title: 'System Limits',
      description: 'Configure system resource limits and thresholds',
      icon: AlertTriangle,
      settings: [
        {
          key: 'limits.maxFileSize',
          label: 'Max File Size (bytes)',
          type: 'number',
          value: config.limits?.maxFileSize,
          description: 'Maximum file size for uploads',
          validation: { min: 1024, max: 104857600 } // 1KB to 100MB
        },
        {
          key: 'limits.maxFilesPerUpload',
          label: 'Max Files Per Upload',
          type: 'number',
          value: config.limits?.maxFilesPerUpload,
          description: 'Maximum number of files per upload',
          validation: { min: 1, max: 50 }
        },
        {
          key: 'limits.sessionTimeout',
          label: 'Session Timeout (seconds)',
          type: 'number',
          value: config.limits?.sessionTimeout,
          description: 'User session timeout duration',
          validation: { min: 300, max: 86400 } // 5 minutes to 24 hours
        },
      ]
    },
  ] : [];

  const handleConfigChange = (key: string, value: any) => {
    setEditedConfig(prev => ({ ...prev, [key]: value }));
    setHasUnsavedChanges(true);
  };

  const getNestedValue = (obj: any, path: string) => {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  };

  const getCurrentValue = (setting: ConfigSetting) => {
    return editedConfig[setting.key] !== undefined 
      ? editedConfig[setting.key] 
      : getNestedValue(config, setting.key) ?? setting.default;
  };

  const handleSave = () => {
    const configToSave = { ...config };
    
    // Apply edited values
    Object.entries(editedConfig).forEach(([key, value]) => {
      const keys = key.split('.');
      let current = configToSave;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
    });
    
    updateConfigMutation.mutate(configToSave);
  };

  const handleReset = () => {
    setEditedConfig({});
    setHasUnsavedChanges(false);
  };

  const toggleSensitiveVisibility = (key: string) => {
    setShowSensitive(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const renderSetting = (setting: ConfigSetting) => {
    const currentValue = getCurrentValue(setting);
    
    return (
      <div key={setting.key} className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-900">
              {setting.label}
              {setting.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {setting.description && (
              <p className="text-xs text-gray-600 mt-1">{setting.description}</p>
            )}
          </div>
          {setting.sensitive && (
            <button
              onClick={() => toggleSensitiveVisibility(setting.key)}
              className="ml-2 p-1 text-gray-400 hover:text-gray-600"
            >
              {showSensitive[setting.key] ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          )}
        </div>

        <div className="mt-2">
          {setting.type === 'boolean' ? (
            <div className="flex items-center">
              <button
                onClick={() => handleConfigChange(setting.key, !currentValue)}
                className={cn(
                  'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                  currentValue ? 'bg-primary' : 'bg-gray-200'
                )}
              >
                <span
                  className={cn(
                    'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                    currentValue ? 'translate-x-6' : 'translate-x-1'
                  )}
                />
              </button>
              <span className="ml-3 text-sm text-gray-600">
                {currentValue ? 'Enabled' : 'Disabled'}
              </span>
            </div>
          ) : setting.type === 'select' ? (
            <select
              value={currentValue || ''}
              onChange={(e) => handleConfigChange(setting.key, e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
            >
              {setting.options?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          ) : setting.type === 'textarea' ? (
            <textarea
              value={currentValue || ''}
              onChange={(e) => handleConfigChange(setting.key, e.target.value)}
              rows={3}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
              placeholder={setting.description}
            />
          ) : (
            <input
              type={setting.sensitive && !showSensitive[setting.key] ? 'password' : setting.type}
              value={currentValue || ''}
              onChange={(e) => {
                const value = setting.type === 'number' 
                  ? parseFloat(e.target.value) || 0 
                  : e.target.value;
                handleConfigChange(setting.key, value);
              }}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
              placeholder={setting.description}
              min={setting.validation?.min}
              max={setting.validation?.max}
            />
          )}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <AnimatedCard>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </AnimatedCard>
    );
  }

  if (error) {
    return (
      <AnimatedCard>
        <div className="p-6 text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to Load Configuration</h3>
          <p className="text-gray-600 mb-4">{error.message}</p>
          <GlowingButton onClick={() => refetch()} variant="secondary">
            Try Again
          </GlowingButton>
        </div>
      </AnimatedCard>
    );
  }

  const currentSection = configSections.find(section => section.id === activeSection);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">System Configuration</h2>
          <p className="text-gray-600 mt-1">Manage system settings and preferences</p>
        </div>
        <div className="flex items-center gap-3">
          {hasUnsavedChanges && (
            <div className="flex items-center gap-2 text-yellow-600 text-sm">
              <Info className="h-4 w-4" />
              <span>You have unsaved changes</span>
            </div>
          )}
          <GlowingButton
            size="sm"
            variant="secondary"
            icon={<RefreshCw className="h-4 w-4" />}
            onClick={() => refetch()}
          >
            Refresh
          </GlowingButton>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Section Navigation */}
        <div className="lg:col-span-1">
          <nav className="space-y-1">
            {configSections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={cn(
                    'w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    activeSection === section.id
                      ? 'bg-primary text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    {section.title}
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Configuration Form */}
        <div className="lg:col-span-3">
          {currentSection && (
            <AnimatedCard>
              <div className="p-6">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <currentSection.icon className="h-5 w-5" />
                    {currentSection.title}
                  </h3>
                  <p className="text-gray-600 mt-1">{currentSection.description}</p>
                </div>

                <div className="space-y-6">
                  {currentSection.settings.map(renderSetting)}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t">
                  <GlowingButton
                    variant="secondary"
                    icon={<RotateCcw className="h-4 w-4" />}
                    onClick={handleReset}
                    disabled={!hasUnsavedChanges}
                  >
                    Reset
                  </GlowingButton>
                  <GlowingButton
                    variant="primary"
                    icon={<Save className="h-4 w-4" />}
                    onClick={handleSave}
                    disabled={!hasUnsavedChanges || updateConfigMutation.isPending}
                    loading={updateConfigMutation.isPending}
                  >
                    Save Changes
                  </GlowingButton>
                </div>
              </div>
            </AnimatedCard>
          )}
        </div>
      </div>
    </div>
  );
}