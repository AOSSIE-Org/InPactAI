/**
 * Tests for useEmailPreferences hook - Simple YES/NO toggle functionality
 */

import { renderHook, act } from '@testing-library/react';
import { useEmailPreferences } from '../useEmailPreferences';
import { emailPreferencesService } from '../../services/emailPreferencesService';

// Mock the service
jest.mock('../../services/emailPreferencesService');

const mockEmailPreferencesService = emailPreferencesService as jest.Mocked<typeof emailPreferencesService>;

describe('useEmailPreferences', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    console.error = jest.fn(); // Mock console.error to avoid noise in tests
  });

  it('should initialize with default values', () => {
    mockEmailPreferencesService.getEmailPreference.mockResolvedValue({
      email_notifications_enabled: true
    });

    const { result } = renderHook(() => useEmailPreferences());

    expect(result.current.emailNotificationsEnabled).toBe(true);
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBe(null);
  });

  it('should fetch email preference on mount', async () => {
    mockEmailPreferencesService.getEmailPreference.mockResolvedValue({
      email_notifications_enabled: false
    });

    const { result } = renderHook(() => useEmailPreferences());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(mockEmailPreferencesService.getEmailPreference).toHaveBeenCalledTimes(1);
    expect(result.current.emailNotificationsEnabled).toBe(false);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('should handle fetch error', async () => {
    const errorMessage = 'Failed to fetch preference';
    mockEmailPreferencesService.getEmailPreference.mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useEmailPreferences());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(errorMessage);
    expect(result.current.emailNotificationsEnabled).toBe(true); // Should remain default
  });

  it('should update email preference successfully', async () => {
    mockEmailPreferencesService.getEmailPreference.mockResolvedValue({
      email_notifications_enabled: true
    });
    mockEmailPreferencesService.updateEmailPreference.mockResolvedValue({
      email_notifications_enabled: false
    });

    const { result } = renderHook(() => useEmailPreferences());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    await act(async () => {
      await result.current.updateEmailPreference(false);
    });

    expect(mockEmailPreferencesService.updateEmailPreference).toHaveBeenCalledWith(false);
    expect(result.current.emailNotificationsEnabled).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('should handle update error', async () => {
    mockEmailPreferencesService.getEmailPreference.mockResolvedValue({
      email_notifications_enabled: true
    });
    const errorMessage = 'Failed to update preference';
    mockEmailPreferencesService.updateEmailPreference.mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useEmailPreferences());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    await act(async () => {
      try {
        await result.current.updateEmailPreference(false);
      } catch (error) {
        // Expected to throw
      }
    });

    expect(result.current.error).toBe(errorMessage);
    expect(result.current.emailNotificationsEnabled).toBe(true); // Should remain unchanged
  });

  it('should refetch data when refetch is called', async () => {
    mockEmailPreferencesService.getEmailPreference
      .mockResolvedValueOnce({ email_notifications_enabled: true })
      .mockResolvedValueOnce({ email_notifications_enabled: false });

    const { result } = renderHook(() => useEmailPreferences());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.emailNotificationsEnabled).toBe(true);

    await act(async () => {
      await result.current.refetch();
    });

    expect(mockEmailPreferencesService.getEmailPreference).toHaveBeenCalledTimes(2);
    expect(result.current.emailNotificationsEnabled).toBe(false);
  });

  it('should handle string error messages', async () => {
    mockEmailPreferencesService.getEmailPreference.mockRejectedValue('String error');

    const { result } = renderHook(() => useEmailPreferences());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.error).toBe('Failed to fetch email preference');
  });

  it('should clear error on successful operations', async () => {
    // First call fails
    mockEmailPreferencesService.getEmailPreference.mockRejectedValueOnce(new Error('Initial error'));
    
    const { result } = renderHook(() => useEmailPreferences());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.error).toBe('Initial error');

    // Second call succeeds
    mockEmailPreferencesService.getEmailPreference.mockResolvedValue({
      email_notifications_enabled: true
    });

    await act(async () => {
      await result.current.refetch();
    });

    expect(result.current.error).toBe(null);
  });
});