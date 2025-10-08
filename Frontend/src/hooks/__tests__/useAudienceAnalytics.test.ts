import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useAudienceAnalytics } from '../useAudienceAnalytics';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(() => 'mock-token'),
  setItem: vi.fn(),
  removeItem: vi.fn()
};
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

const mockAudienceData = {
  demographics: {
    ageGroups: {
      '18-24': 28.5,
      '25-34': 35.2,
      '35-44': 22.1,
      '45-54': 10.8,
      '55+': 3.4
    },
    locations: {
      'United States': 45.2,
      'United Kingdom': 18.7,
      'Canada': 12.3
    },
    interests: {
      'Fashion': 32.1,
      'Technology': 24.8,
      'Travel': 18.5
    },
    genders: {
      'Female': 62.3,
      'Male': 35.7,
      'Other': 2.0
    }
  },
  engagementPatterns: {
    timeOfDay: [
      { hour: 9, engagement: 5.2, impressions: 3500 },
      { hour: 12, engagement: 6.8, impressions: 4200 },
      { hour: 18, engagement: 7.9, impressions: 5100 }
    ],
    dayOfWeek: [
      { day: 'Monday', engagement: 4.2, reach: 12000 },
      { day: 'Tuesday', engagement: 3.8, reach: 11500 },
      { day: 'Friday', engagement: 6.2, reach: 16500 }
    ],
    contentType: [
      { type: 'photo', engagement: 4.8, count: 45 },
      { type: 'video', engagement: 6.2, count: 23 },
      { type: 'reel', engagement: 7.1, count: 12 }
    ]
  },
  audienceHistory: [
    {
      date: '2024-01-01',
      demographics: {
        ageGroups: { '18-24': 25.0, '25-34': 35.0 },
        locations: { 'United States': 40.0, 'United Kingdom': 20.0 },
        interests: { 'Fashion': 30.0, 'Technology': 25.0 },
        genders: { 'Female': 60.0, 'Male': 38.0, 'Other': 2.0 }
      },
      totalAudience: 48000
    },
    {
      date: '2024-01-02',
      demographics: {
        ageGroups: { '18-24': 28.5, '25-34': 35.2 },
        locations: { 'United States': 45.2, 'United Kingdom': 18.7 },
        interests: { 'Fashion': 32.1, 'Technology': 24.8 },
        genders: { 'Female': 62.3, 'Male': 35.7, 'Other': 2.0 }
      },
      totalAudience: 52000
    }
  ],
  dataLimitations: {
    hasInsufficientData: false,
    missingPlatforms: [],
    dataQualityScore: 85,
    lastUpdated: '2024-01-15T10:00:00Z'
  }
};

describe('useAudienceAnalytics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Data Fetching', () => {
    it('should fetch audience data successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockAudienceData
      });

      const { result } = renderHook(() => useAudienceAnalytics());

      expect(result.current.loading).toBe(true);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.data).toEqual(mockAudienceData);
      expect(result.current.error).toBeNull();
      expect(result.current.lastUpdated).toBeInstanceOf(Date);
    });

    it('should handle API errors gracefully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Internal Server Error'
      });

      const { result } = renderHook(() => useAudienceAnalytics());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe('Failed to fetch audience data: Internal Server Error');
      expect(result.current.data).toBeTruthy(); // Should fallback to mock data
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useAudienceAnalytics());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe('Network error');
      expect(result.current.data).toBeTruthy(); // Should fallback to mock data
    });
  });

  describe('Options Handling', () => {
    it('should include contractId in API request when provided', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockAudienceData
      });

      renderHook(() => useAudienceAnalytics({ contractId: 'contract-123' }));

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('contractId=contract-123'),
          expect.any(Object)
        );
      });
    });

    it('should include timeRange in API request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockAudienceData
      });

      renderHook(() => useAudienceAnalytics({ timeRange: '7d' }));

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('timeRange=7d'),
          expect.any(Object)
        );
      });
    });

    it('should use default timeRange when not provided', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockAudienceData
      });

      renderHook(() => useAudienceAnalytics());

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('timeRange=30d'),
          expect.any(Object)
        );
      });
    });
  });

  describe('Data Refresh', () => {
    it('should refresh data when refreshData is called', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockAudienceData
      });

      const { result } = renderHook(() => useAudienceAnalytics());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Clear previous calls
      mockFetch.mockClear();

      // Call refresh
      await result.current.refreshData();

      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should set loading state during refresh', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockAudienceData
      });

      const { result } = renderHook(() => useAudienceAnalytics());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Start refresh
      const refreshPromise = result.current.refreshData();
      
      expect(result.current.loading).toBe(true);

      await refreshPromise;
      
      expect(result.current.loading).toBe(false);
    });
  });

  describe('Auto Refresh', () => {
    it('should auto-refresh data at specified intervals', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockAudienceData
      });

      renderHook(() => useAudienceAnalytics({ refreshInterval: 1000 }));

      // Initial call
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(1);
      });

      // Advance timer
      vi.advanceTimersByTime(1000);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(2);
      });
    });

    it('should not auto-refresh when refreshInterval is 0', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockAudienceData
      });

      renderHook(() => useAudienceAnalytics({ refreshInterval: 0 }));

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(1);
      });

      // Advance timer
      vi.advanceTimersByTime(10000);

      // Should still be only 1 call (initial)
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('Audience Changes Calculation', () => {
    it('should calculate demographic changes correctly', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockAudienceData
      });

      const { result } = renderHook(() => useAudienceAnalytics());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const changes = result.current.audienceChanges;
      
      expect(changes).toBeTruthy();
      expect(changes?.ageGroups).toBeTruthy();
      expect(changes?.locations).toBeTruthy();
      expect(changes?.interests).toBeTruthy();
      expect(changes?.genders).toBeTruthy();
      
      // Check specific calculations
      // 18-24: from 25.0 to 28.5 = +14% change
      expect(changes?.ageGroups['18-24']).toBeCloseTo(14, 0);
      
      // United States: from 40.0 to 45.2 = +13% change
      expect(changes?.locations['United States']).toBeCloseTo(13, 0);
    });

    it('should return null when insufficient history data', async () => {
      const dataWithLimitedHistory = {
        ...mockAudienceData,
        audienceHistory: [mockAudienceData.audienceHistory[0]] // Only one data point
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => dataWithLimitedHistory
      });

      const { result } = renderHook(() => useAudienceAnalytics());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.audienceChanges).toBeNull();
    });
  });

  describe('Engagement Insights', () => {
    it('should calculate engagement insights correctly', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockAudienceData
      });

      const { result } = renderHook(() => useAudienceAnalytics());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const insights = result.current.engagementInsights;
      
      expect(insights).toBeTruthy();
      expect(insights?.peakHour).toBe(18); // Highest engagement at 18:00 (7.9%)
      expect(insights?.peakDay).toBe('Friday'); // Highest engagement on Friday (6.2%)
      expect(insights?.bestContentType).toBe('reel'); // Highest engagement for reels (7.1%)
      expect(insights?.averageEngagement).toBeCloseTo(6.63, 1); // Average of 5.2, 6.8, 7.9
    });

    it('should return null when no engagement data available', async () => {
      const dataWithoutEngagement = {
        ...mockAudienceData,
        engagementPatterns: {
          timeOfDay: [],
          dayOfWeek: [],
          contentType: []
        }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => dataWithoutEngagement
      });

      const { result } = renderHook(() => useAudienceAnalytics());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.engagementInsights).toBeNull();
    });
  });

  describe('Authentication', () => {
    it('should include authorization header in requests', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockAudienceData
      });

      renderHook(() => useAudienceAnalytics());

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            headers: expect.objectContaining({
              'Authorization': 'Bearer mock-token'
            })
          })
        );
      });
    });
  });

  describe('Mock Data Fallback', () => {
    it('should provide realistic mock data structure', async () => {
      mockFetch.mockRejectedValueOnce(new Error('API unavailable'));

      const { result } = renderHook(() => useAudienceAnalytics());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const data = result.current.data;
      
      expect(data).toBeTruthy();
      expect(data?.demographics).toBeTruthy();
      expect(data?.engagementPatterns).toBeTruthy();
      expect(data?.audienceHistory).toBeTruthy();
      expect(data?.dataLimitations).toBeTruthy();
      
      // Check data structure
      expect(data?.demographics.ageGroups).toBeTruthy();
      expect(data?.demographics.locations).toBeTruthy();
      expect(data?.demographics.interests).toBeTruthy();
      expect(data?.demographics.genders).toBeTruthy();
      
      expect(data?.engagementPatterns.timeOfDay).toHaveLength(24);
      expect(data?.engagementPatterns.dayOfWeek).toHaveLength(7);
      expect(data?.engagementPatterns.contentType.length).toBeGreaterThan(0);
      
      expect(data?.audienceHistory.length).toBeGreaterThan(0);
    });
  });
});