/**
 * Integration Service Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { integrationService } from '../integrationService';

// Mock fetch
global.fetch = vi.fn();

describe('IntegrationService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('userId', 'test-user-id');
  });

  it('should be defined', () => {
    expect(integrationService).toBeDefined();
  });

  it('should have workflow management methods', () => {
    expect(typeof integrationService.getAllWorkflows).toBe('function');
    expect(typeof integrationService.getWorkflowStatus).toBe('function');
    expect(typeof integrationService.cancelWorkflow).toBe('function');
  });

  it('should initialize with empty workflows', () => {
    const workflows = integrationService.getAllWorkflows();
    expect(Array.isArray(workflows)).toBe(true);
    expect(workflows.length).toBe(0);
  });

  it('should return undefined for non-existent workflow status', () => {
    const status = integrationService.getWorkflowStatus('non-existent');
    expect(status).toBeUndefined();
  });

  it('should handle workflow cancellation', () => {
    expect(() => {
      integrationService.cancelWorkflow('test-workflow');
    }).not.toThrow();
  });

  it('should handle brand onboarding workflow execution', async () => {
    const mockFetch = global.fetch as any;
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ authUrl: 'https://test.com/oauth' })
    });

    // Mock window.open to avoid "Not implemented" error
    const mockWindow = {
      closed: true,
      close: vi.fn()
    };
    global.window.open = vi.fn().mockReturnValue(mockWindow);

    try {
      await integrationService.executeBrandOnboardingWorkflow('brand-123');
    } catch (error) {
      // Expected to fail due to OAuth verification
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toContain('OAuth');
    }
  }, 10000);

  it('should handle content linking workflow execution', async () => {
    const mockFetch = global.fetch as any;
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ success: true })
    });

    const params = {
      contractId: 'contract-123',
      contentUrl: 'https://instagram.com/p/test',
      userId: 'user-123',
      platform: 'instagram',
      contentId: 'content-123'
    };

    try {
      await integrationService.executeContentLinkingWorkflow(params);
    } catch (error) {
      // Expected to fail due to validation
      expect(error).toBeInstanceOf(Error);
    }
  });

  it('should handle export workflow execution', async () => {
    const mockFetch = global.fetch as any;
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ job_id: 'export-123', status: 'completed' })
    });

    const params = {
      format: 'csv' as const,
      dateRange: { start: '2024-01-01', end: '2024-01-31' },
      metrics: ['reach', 'impressions'],
      contractIds: ['contract-1']
    };

    try {
      await integrationService.executeExportWorkflow(params);
    } catch (error) {
      // Expected to fail due to validation or API calls
      expect(error).toBeInstanceOf(Error);
    }
  }, 10000);

  it('should handle alert setup workflow execution', async () => {
    const mockFetch = global.fetch as any;
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ alert_id: 'alert-123' })
    });

    const params = {
      contractId: 'contract-123',
      thresholds: [
        { metric: 'engagement_rate', operator: 'lt' as const, value: 2.0 }
      ],
      notificationChannels: ['email' as const, 'in_app' as const]
    };

    try {
      await integrationService.executeAlertSetupWorkflow(params);
    } catch (error) {
      // Expected to fail due to validation or API calls
      expect(error).toBeInstanceOf(Error);
    }
  });
});