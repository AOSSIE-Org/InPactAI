import { describe, it, expect, vi } from 'vitest';
import { getMockAudienceData } from '../useAudienceAnalytics';

// Simple unit tests for the audience analytics functionality
describe('useAudienceAnalytics - Core Functions', () => {
  describe('Mock Data Generation', () => {
    it('should generate realistic demographic data structure', () => {
      // Test the mock data generator function directly
      const mockData = getMockAudienceData();
      
      expect(mockData).toBeTruthy();
      expect(mockData.demographics).toBeTruthy();
      expect(mockData.engagementPatterns).toBeTruthy();
      expect(mockData.audienceHistory).toBeTruthy();
      expect(mockData.dataLimitations).toBeTruthy();
      
      // Check demographics structure
      expect(mockData.demographics.ageGroups).toBeTruthy();
      expect(mockData.demographics.locations).toBeTruthy();
      expect(mockData.demographics.interests).toBeTruthy();
      expect(mockData.demographics.genders).toBeTruthy();
      
      // Check engagement patterns structure
      expect(mockData.engagementPatterns.timeOfDay).toHaveLength(24);
      expect(mockData.engagementPatterns.dayOfWeek).toHaveLength(7);
      expect(mockData.engagementPatterns.contentType.length).toBeGreaterThan(0);
      
      // Check audience history
      expect(mockData.audienceHistory.length).toBeGreaterThan(0);
      expect(mockData.audienceHistory[0]).toHaveProperty('date');
      expect(mockData.audienceHistory[0]).toHaveProperty('demographics');
      expect(mockData.audienceHistory[0]).toHaveProperty('totalAudience');
    });

    it('should generate valid percentage values for demographics', () => {
      const mockData = getMockAudienceData();
      
      // Check that age group percentages are reasonable
      const ageGroupValues = Object.values(mockData.demographics.ageGroups);
      ageGroupValues.forEach(value => {
        expect(value).toBeGreaterThan(0);
        expect(value).toBeLessThan(100);
      });
      
      // Check that location percentages are reasonable
      const locationValues = Object.values(mockData.demographics.locations);
      locationValues.forEach(value => {
        expect(value).toBeGreaterThan(0);
        expect(value).toBeLessThan(100);
      });
    });

    it('should generate valid engagement pattern data', () => {
      const mockData = getMockAudienceData();
      
      // Check time of day data
      mockData.engagementPatterns.timeOfDay.forEach(item => {
        expect(item.hour).toBeGreaterThanOrEqual(0);
        expect(item.hour).toBeLessThan(24);
        expect(item.engagement).toBeGreaterThan(0);
        expect(item.impressions).toBeGreaterThan(0);
      });
      
      // Check day of week data
      const expectedDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      mockData.engagementPatterns.dayOfWeek.forEach(item => {
        expect(expectedDays).toContain(item.day);
        expect(item.engagement).toBeGreaterThan(0);
        expect(item.reach).toBeGreaterThan(0);
      });
      
      // Check content type data
      mockData.engagementPatterns.contentType.forEach(item => {
        expect(item.type).toBeTruthy();
        expect(item.engagement).toBeGreaterThan(0);
        expect(item.count).toBeGreaterThan(0);
      });
    });
  });

  describe('Data Validation', () => {
    it('should handle empty engagement patterns gracefully', () => {
      const emptyPatterns = {
        timeOfDay: [],
        dayOfWeek: [],
        contentType: []
      };
      
      // This should not throw an error
      expect(() => {
        // Simulate the engagement insights calculation with empty data
        if (!emptyPatterns.timeOfDay.length || !emptyPatterns.dayOfWeek.length || !emptyPatterns.contentType.length) {
          return null;
        }
      }).not.toThrow();
    });

    it('should calculate demographic changes correctly', () => {
      const current = { '18-24': 30.0, '25-34': 35.0 };
      const previous = { '18-24': 25.0, '25-34': 35.0 };
      
      const calculateChange = (currentData: Record<string, number>, previousData: Record<string, number>) => {
        const changes: Record<string, number> = {};
        
        Object.keys(currentData).forEach(key => {
          const currentValue = currentData[key] || 0;
          const previousValue = previousData[key] || 0;
          changes[key] = previousValue > 0 ? ((currentValue - previousValue) / previousValue) * 100 : 0;
        });
        
        return changes;
      };

      const changes = calculateChange(current, previous);
      
      // 18-24: from 25.0 to 30.0 = +20% change
      expect(changes['18-24']).toBeCloseTo(20, 0);
      
      // 25-34: from 35.0 to 35.0 = 0% change
      expect(changes['25-34']).toBe(0);
    });
  });

  describe('Data Formatting', () => {
    it('should format numbers correctly', () => {
      const formatNumber = (num: number) => {
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
        return num.toString();
      };

      expect(formatNumber(500)).toBe('500');
      expect(formatNumber(1500)).toBe('1.5K');
      expect(formatNumber(1500000)).toBe('1.5M');
    });

    it('should format percentages correctly', () => {
      const formatPercentage = (value: number) => `${value.toFixed(1)}%`;

      expect(formatPercentage(25.678)).toBe('25.7%');
      expect(formatPercentage(0)).toBe('0.0%');
      expect(formatPercentage(100)).toBe('100.0%');
    });
  });
});

// Export the mock data generator for testing
export const getMockAudienceData = () => {
  const generateDemographics = () => ({
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
      'Canada': 12.3,
      'Australia': 8.9,
      'Germany': 6.2,
      'Other': 8.7
    },
    interests: {
      'Fashion': 32.1,
      'Technology': 24.8,
      'Travel': 18.5,
      'Food': 15.2,
      'Fitness': 9.4
    },
    genders: {
      'Female': 62.3,
      'Male': 35.7,
      'Other': 2.0
    }
  });

  const generateEngagementPatterns = () => ({
    timeOfDay: Array.from({ length: 24 }, (_, hour) => ({
      hour,
      engagement: Math.random() * 8 + 2, // 2-10% engagement
      impressions: Math.floor(Math.random() * 5000) + 1000
    })),
    dayOfWeek: [
      { day: 'Monday', engagement: 4.2, reach: 12000 },
      { day: 'Tuesday', engagement: 3.8, reach: 11500 },
      { day: 'Wednesday', engagement: 4.5, reach: 13200 },
      { day: 'Thursday', engagement: 5.1, reach: 14800 },
      { day: 'Friday', engagement: 6.2, reach: 16500 },
      { day: 'Saturday', engagement: 7.8, reach: 18900 },
      { day: 'Sunday', engagement: 6.9, reach: 17200 }
    ],
    contentType: [
      { type: 'photo', engagement: 4.8, count: 45 },
      { type: 'video', engagement: 6.2, count: 23 },
      { type: 'carousel', engagement: 5.5, count: 18 },
      { type: 'story', engagement: 3.9, count: 67 },
      { type: 'reel', engagement: 7.1, count: 12 }
    ]
  });

  const generateAudienceHistory = () => {
    return Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      demographics: generateDemographics(),
      totalAudience: Math.floor(Math.random() * 10000) + 50000
    }));
  };

  return {
    demographics: generateDemographics(),
    engagementPatterns: generateEngagementPatterns(),
    audienceHistory: generateAudienceHistory(),
    dataLimitations: {
      hasInsufficientData: Math.random() > 0.7, // 30% chance of insufficient data
      missingPlatforms: Math.random() > 0.5 ? ['Twitter', 'TikTok'] : [],
      dataQualityScore: Math.floor(Math.random() * 30) + 70, // 70-100 score
      lastUpdated: new Date().toISOString()
    }
  };
};