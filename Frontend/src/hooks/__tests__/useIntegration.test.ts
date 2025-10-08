/**
 * Integration Hook Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useIntegration } from '../useIntegration';

// Mock the integration service
vi.mock('../../services/integrationService', () => ({
  integrationService: {
    getAllWorkflows: vi.fn(() => []),
    getWorkflowStatus: vi.fn(() => undefined),
    cancelWorkflow: vi.fn(),
    executeBrandOnboardingWorkflow: vi.fn(() => Promise.resolve('workflow-1')),
    executeContentLinkingWorkflow: vi.fn(() => Promise.resolve('workflow-2')),
    executeExportWorkflow: vi.fn(() => Promise.resolve('workflow-3')),
    executeAlertSetupWorkflow: vi.fn(() => Promise.resolve('workflow-4'))
  }
}));

// Mock sonner
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn()
  }
}));

describe('useIntegration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('userId', 'test-user-id');
  });

  it('should initialize with empty workflows', () => {
    const { result } = renderHook(() => useIntegration());

    expect(result.current.workflows).toEqual([]);
    expect(result.current.activeWorkflows).toEqual([]);
    expect(result.current.isExecuting).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('should provide workflow execution functions', () => {
    const { result } = renderHook(() => useIntegration());

    expect(typeof result.current.executeBrandOnboarding).toBe('function');
    expect(typeof result.current.executeContentLinking).toBe('function');
    expect(typeof result.current.executeExport).toBe('function');
    expect(typeof result.current.executeAlertSetup).toBe('function');
  });

  it('should provide workflow monitoring functions', () => {
    const { result } = renderHook(() => useIntegration());

    expect(typeof result.current.getWorkflowStatus).toBe('function');
    expect(typeof result.current.cancelWorkflow).toBe('function');
    expect(typeof result.current.refreshWorkflows).toBe('function');
  });

  it('should handle brand onboarding execution', async () => {
    const { result } = renderHook(() => useIntegration());

    await act(async () => {
      const workflowId = await result.current.executeBrandOnboarding('brand-123');
      expect(workflowId).toBe('workflow-1');
    });
  });

  it('should handle content linking execution', async () => {
    const { result } = renderHook(() => useIntegration());

    const params = {
      contractId: 'contract-123',
      contentUrl: 'https://instagram.com/p/test',
      userId: 'user-123',
      platform: 'instagram' as const,
      contentId: 'content-123'
    };

    await act(async () => {
      const workflowId = await result.current.executeContentLinking(params);
      expect(workflowId).toBe('workflow-2');
    });
  });

  it('should handle export execution', async () => {
    const { result } = renderHook(() => useIntegration());

    const params = {
      format: 'csv' as const,
      dateRange: { start: '2024-01-01', end: '2024-01-31' },
      metrics: ['reach', 'impressions'],
      contractIds: ['contract-1']
    };

    await act(async () => {
      const workflowId = await result.current.executeExport(params);
      expect(workflowId).toBe('workflow-3');
    });
  });

  it('should handle alert setup execution', async () => {
    const { result } = renderHook(() => useIntegration());

    const params = {
      contractId: 'contract-123',
      thresholds: [
        { metric: 'engagement_rate', operator: 'lt' as const, value: 2.0 }
      ],
      notificationChannels: ['email' as const, 'in_app' as const]
    };

    await act(async () => {
      const workflowId = await result.current.executeAlertSetup(params);
      expect(workflowId).toBe('workflow-4');
    });
  });

  it('should handle workflow status retrieval', () => {
    const { result } = renderHook(() => useIntegration());

    const status = result.current.getWorkflowStatus('workflow-123');
    expect(status).toBeUndefined();
  });

  it('should handle workflow cancellation', () => {
    const { result } = renderHook(() => useIntegration());

    expect(() => {
      result.current.cancelWorkflow('workflow-123');
    }).not.toThrow();
  });

  it('should handle error clearing', () => {
    const { result } = renderHook(() => useIntegration());

    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBe(null);
  });
});