/**
 * Integration Hook
 * 
 * Provides React components with access to integrated workflows
 * and real-time status updates for end-to-end processes.
 */

import { useState, useEffect, useCallback } from 'react';
import { integrationService, IntegrationWorkflow, ContentLinkingWorkflow, ExportWorkflow, AlertIntegration } from '../services/integrationService';
import { toast } from 'sonner';

export interface UseIntegrationReturn {
  // Workflow execution
  executeBrandOnboarding: (brandId: string) => Promise<string>;
  executeContentLinking: (params: ContentLinkingWorkflow) => Promise<string>;
  executeExport: (params: ExportWorkflow) => Promise<string>;
  executeAlertSetup: (params: AlertIntegration) => Promise<string>;
  
  // Workflow monitoring
  workflows: IntegrationWorkflow[];
  activeWorkflows: IntegrationWorkflow[];
  getWorkflowStatus: (workflowId: string) => IntegrationWorkflow | undefined;
  cancelWorkflow: (workflowId: string) => void;
  
  // State
  isExecuting: boolean;
  error: string | null;
  
  // Utilities
  refreshWorkflows: () => void;
  clearError: () => void;
}

export const useIntegration = (): UseIntegrationReturn => {
  const [workflows, setWorkflows] = useState<IntegrationWorkflow[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refresh workflows from service
  const refreshWorkflows = useCallback(() => {
    setWorkflows(integrationService.getAllWorkflows());
  }, []);

  // Auto-refresh workflows every 2 seconds when there are active workflows
  useEffect(() => {
    const activeWorkflows = workflows.filter(w => w.status === 'running');
    
    if (activeWorkflows.length > 0) {
      const interval = setInterval(refreshWorkflows, 2000);
      return () => clearInterval(interval);
    }
  }, [workflows, refreshWorkflows]);

  // Initial load
  useEffect(() => {
    refreshWorkflows();
  }, [refreshWorkflows]);

  // Execute brand onboarding workflow
  const executeBrandOnboarding = useCallback(async (brandId: string): Promise<string> => {
    setIsExecuting(true);
    setError(null);
    
    try {
      const workflowId = await integrationService.executeBrandOnboardingWorkflow(brandId);
      refreshWorkflows();
      toast.success('Brand onboarding workflow started');
      return workflowId;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start brand onboarding';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsExecuting(false);
    }
  }, [refreshWorkflows]);

  // Execute content linking workflow
  const executeContentLinking = useCallback(async (params: ContentLinkingWorkflow): Promise<string> => {
    setIsExecuting(true);
    setError(null);
    
    try {
      const workflowId = await integrationService.executeContentLinkingWorkflow(params);
      refreshWorkflows();
      toast.success('Content linking workflow started');
      return workflowId;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start content linking';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsExecuting(false);
    }
  }, [refreshWorkflows]);

  // Execute export workflow
  const executeExport = useCallback(async (params: ExportWorkflow): Promise<string> => {
    setIsExecuting(true);
    setError(null);
    
    try {
      const workflowId = await integrationService.executeExportWorkflow(params);
      refreshWorkflows();
      toast.success('Export workflow started');
      return workflowId;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start export';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsExecuting(false);
    }
  }, [refreshWorkflows]);

  // Execute alert setup workflow
  const executeAlertSetup = useCallback(async (params: AlertIntegration): Promise<string> => {
    setIsExecuting(true);
    setError(null);
    
    try {
      const workflowId = await integrationService.executeAlertSetupWorkflow(params);
      refreshWorkflows();
      toast.success('Alert setup workflow started');
      return workflowId;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start alert setup';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsExecuting(false);
    }
  }, [refreshWorkflows]);

  // Get workflow status
  const getWorkflowStatus = useCallback((workflowId: string): IntegrationWorkflow | undefined => {
    return integrationService.getWorkflowStatus(workflowId);
  }, []);

  // Cancel workflow
  const cancelWorkflow = useCallback((workflowId: string): void => {
    integrationService.cancelWorkflow(workflowId);
    refreshWorkflows();
    toast.info('Workflow cancelled');
  }, [refreshWorkflows]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Computed values
  const activeWorkflows = workflows.filter(w => w.status === 'running');

  return {
    // Workflow execution
    executeBrandOnboarding,
    executeContentLinking,
    executeExport,
    executeAlertSetup,
    
    // Workflow monitoring
    workflows,
    activeWorkflows,
    getWorkflowStatus,
    cancelWorkflow,
    
    // State
    isExecuting,
    error,
    
    // Utilities
    refreshWorkflows,
    clearError
  };
};

// Specialized hooks for specific workflows

export const useContentLinkingIntegration = (contractId: string) => {
  const integration = useIntegration();
  
  const linkContent = useCallback(async (contentUrl: string, userId: string) => {
    const params: ContentLinkingWorkflow = {
      contractId,
      contentUrl,
      userId,
      platform: contentUrl.includes('instagram') ? 'instagram' : 'youtube',
      contentId: '' // Will be extracted by the service
    };
    
    return integration.executeContentLinking(params);
  }, [contractId, integration]);

  return {
    ...integration,
    linkContent
  };
};

export const useAnalyticsExportIntegration = () => {
  const integration = useIntegration();
  
  const exportAnalytics = useCallback(async (
    contractIds: string[],
    metrics: string[],
    dateRange: { start: string; end: string },
    format: 'csv' | 'pdf' = 'csv'
  ) => {
    const params: ExportWorkflow = {
      format,
      dateRange,
      metrics,
      contractIds
    };
    
    return integration.executeExport(params);
  }, [integration]);

  return {
    ...integration,
    exportAnalytics
  };
};

export const useAlertIntegration = (contractId: string) => {
  const integration = useIntegration();
  
  const setupAlerts = useCallback(async (
    thresholds: Array<{
      metric: string;
      operator: 'gt' | 'lt' | 'eq';
      value: number;
    }>,
    notificationChannels: ('email' | 'in_app')[] = ['email', 'in_app']
  ) => {
    const params: AlertIntegration = {
      contractId,
      thresholds,
      notificationChannels
    };
    
    return integration.executeAlertSetup(params);
  }, [contractId, integration]);

  return {
    ...integration,
    setupAlerts
  };
};