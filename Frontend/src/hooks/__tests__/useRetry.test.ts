import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useRetry, useApiWithRetry } from '../useRetry';

// Mock timers
vi.useFakeTimers();

describe('useRetry', () => {
  beforeEach(() => {
    vi.clearAllTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    vi.useFakeTimers();
  });

  it('should initialize with correct default state', () => {
    const mockOperation = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => useRetry(mockOperation));

    expect(result.current.state.isRetrying).toBe(false);
    expect(result.current.state.retryCount).toBe(0);
    expect(result.current.state.lastError).toBe(null);
    expect(result.current.state.canRetry).toBe(true);
  });

  it('should execute operation successfully on first try', async () => {
    const mockOperation = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => useRetry(mockOperation));

    await act(async () => {
      await result.current.retry();
    });

    expect(mockOperation).toHaveBeenCalledTimes(1);
    expect(result.current.state.isRetrying).toBe(false);
    expect(result.current.state.retryCount).toBe(0);
    expect(result.current.state.lastError).toBe(null);
    expect(result.current.state.canRetry).toBe(true);
  });

  it('should retry on failure with exponential backoff', async () => {
    const error = new Error('Test error');
    const mockOperation = vi.fn()
      .mockRejectedValueOnce(error)
      .mockRejectedValueOnce(error)
      .mockResolvedValueOnce(undefined);

    const onRetry = vi.fn();
    const { result } = renderHook(() => 
      useRetry(mockOperation, { maxRetries: 3, baseDelay: 1000, onRetry })
    );

    // Start the retry process
    act(() => {
      result.current.retry();
    });

    // Wait for first failure
    await act(async () => {
      await vi.runOnlyPendingTimersAsync();
    });

    expect(result.current.state.retryCount).toBe(1);
    expect(result.current.state.lastError).toBe(error);
    expect(onRetry).toHaveBeenCalledWith(1);

    // Wait for first retry (after 1000ms delay)
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    await act(async () => {
      await vi.runOnlyPendingTimersAsync();
    });

    expect(result.current.state.retryCount).toBe(2);
    expect(onRetry).toHaveBeenCalledWith(2);

    // Wait for second retry (after 2000ms delay)
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    await act(async () => {
      await vi.runOnlyPendingTimersAsync();
    });

    // Should succeed on third attempt
    expect(result.current.state.retryCount).toBe(0);
    expect(result.current.state.lastError).toBe(null);
    expect(result.current.state.canRetry).toBe(true);
  });

  it('should stop retrying after max retries reached', async () => {
    const error = new Error('Test error');
    const mockOperation = vi.fn().mockRejectedValue(error);
    const onMaxRetriesReached = vi.fn();

    const { result } = renderHook(() => 
      useRetry(mockOperation, { maxRetries: 2, baseDelay: 100, onMaxRetriesReached })
    );

    // Start the retry process
    act(() => {
      result.current.retry();
    });

    // Wait for all retries to complete
    await act(async () => {
      vi.advanceTimersByTime(1000);
      await vi.runOnlyPendingTimersAsync();
    });

    expect(mockOperation).toHaveBeenCalledTimes(3); // Initial + 2 retries
    expect(result.current.state.canRetry).toBe(false);
    expect(result.current.state.retryCount).toBe(2);
    expect(onMaxRetriesReached).toHaveBeenCalled();
  });

  it('should reset state correctly', async () => {
    const error = new Error('Test error');
    const mockOperation = vi.fn().mockRejectedValue(error);

    const { result } = renderHook(() => useRetry(mockOperation));

    // Trigger a failure
    act(() => {
      result.current.retry();
    });

    await act(async () => {
      await vi.runOnlyPendingTimersAsync();
    });

    expect(result.current.state.retryCount).toBe(1);
    expect(result.current.state.lastError).toBe(error);

    // Reset
    act(() => {
      result.current.reset();
    });

    expect(result.current.state.retryCount).toBe(0);
    expect(result.current.state.lastError).toBe(null);
    expect(result.current.state.canRetry).toBe(true);
    expect(result.current.state.isRetrying).toBe(false);
  });

  it('should respect max delay configuration', async () => {
    const error = new Error('Test error');
    const mockOperation = vi.fn().mockRejectedValue(error);

    const { result } = renderHook(() => 
      useRetry(mockOperation, { 
        maxRetries: 5, 
        baseDelay: 1000, 
        backoffMultiplier: 2,
        maxDelay: 3000 
      })
    );

    act(() => {
      result.current.retry();
    });

    // First retry should be after 1000ms
    await act(async () => {
      vi.advanceTimersByTime(1000);
      await vi.runOnlyPendingTimersAsync();
    });

    // Second retry should be after 2000ms
    await act(async () => {
      vi.advanceTimersByTime(2000);
      await vi.runOnlyPendingTimersAsync();
    });

    // Third retry should be capped at 3000ms (not 4000ms)
    await act(async () => {
      vi.advanceTimersByTime(3000);
      await vi.runOnlyPendingTimersAsync();
    });

    expect(mockOperation).toHaveBeenCalledTimes(4); // Initial + 3 retries
  });
});

describe('useApiWithRetry', () => {
  beforeEach(() => {
    vi.clearAllTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    vi.useFakeTimers();
  });

  it('should handle successful API call', async () => {
    const mockData = { id: 1, name: 'Test' };
    const mockApiCall = vi.fn().mockResolvedValue(mockData);
    const onSuccess = vi.fn();

    const { result } = renderHook(() => 
      useApiWithRetry(mockApiCall, { onSuccess })
    );

    await act(async () => {
      await result.current.execute();
    });

    expect(result.current.data).toEqual(mockData);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(onSuccess).toHaveBeenCalledWith(mockData);
  });

  it('should handle API call failure', async () => {
    const error = new Error('API Error');
    const mockApiCall = vi.fn().mockRejectedValue(error);
    const onError = vi.fn();

    const { result } = renderHook(() => 
      useApiWithRetry(mockApiCall, { onError })
    );

    await act(async () => {
      await result.current.execute();
    });

    expect(result.current.data).toBe(null);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(error);
    expect(onError).toHaveBeenCalledWith(error);
  });

  it('should show loading state during execution', async () => {
    const mockApiCall = vi.fn().mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve('data'), 100))
    );

    const { result } = renderHook(() => useApiWithRetry(mockApiCall));

    act(() => {
      result.current.execute();
    });

    expect(result.current.loading).toBe(true);

    await act(async () => {
      vi.advanceTimersByTime(100);
      await vi.runOnlyPendingTimersAsync();
    });

    expect(result.current.loading).toBe(false);
  });

  it('should retry failed API calls', async () => {
    const error = new Error('API Error');
    const mockData = { id: 1, name: 'Test' };
    const mockApiCall = vi.fn()
      .mockRejectedValueOnce(error)
      .mockResolvedValueOnce(mockData);

    const { result } = renderHook(() => 
      useApiWithRetry(mockApiCall, { maxRetries: 2 })
    );

    act(() => {
      result.current.execute();
    });

    // Wait for initial failure and first retry
    await act(async () => {
      vi.advanceTimersByTime(2000);
      await vi.runOnlyPendingTimersAsync();
    });

    expect(mockApiCall).toHaveBeenCalledTimes(2);
    expect(result.current.data).toEqual(mockData);
    expect(result.current.error).toBe(null);
  });

  it('should allow manual retry', async () => {
    const error = new Error('API Error');
    const mockApiCall = vi.fn().mockRejectedValue(error);

    const { result } = renderHook(() => useApiWithRetry(mockApiCall));

    await act(async () => {
      await result.current.execute();
    });

    expect(result.current.error).toBe(error);

    // Manual retry
    await act(async () => {
      await result.current.retry();
    });

    expect(mockApiCall).toHaveBeenCalledTimes(2);
  });

  it('should reset state correctly', async () => {
    const error = new Error('API Error');
    const mockApiCall = vi.fn().mockRejectedValue(error);

    const { result } = renderHook(() => useApiWithRetry(mockApiCall));

    await act(async () => {
      await result.current.execute();
    });

    expect(result.current.error).toBe(error);

    act(() => {
      result.current.reset();
    });

    expect(result.current.error).toBe(null);
    expect(result.current.data).toBe(null);
    expect(result.current.retryState.retryCount).toBe(0);
  });
});