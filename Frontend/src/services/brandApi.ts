// Brand Dashboard API Service
// Handles all API calls to the backend for brand dashboard functionality

const API_BASE_URL = 'http://localhost:8000/api/brand';

// Types for API responses
export interface DashboardOverview {
  total_campaigns: number;
  active_campaigns: number;
  total_revenue: number;
  total_creators_matched: number;
  recent_activity: any[];
}

export interface BrandProfile {
  id: string;
  user_id: string;
  company_name?: string;
  website?: string;
  industry?: string;
  contact_person?: string;
  contact_email?: string;
  created_at: string;
}

export interface Campaign {
  id: string;
  brand_id: string;
  title: string;
  description: string;
  required_audience: Record<string, any>;
  budget: number;
  engagement_minimum: number;
  status: string;
  created_at: string;
}

export interface CreatorMatch {
  id: string;
  brand_id: string;
  creator_id: string;
  match_score?: number;
  matched_at: string;
}

export interface Application {
  id: string;
  creator_id: string;
  sponsorship_id: string;
  post_id?: string;
  proposal: string;
  status: string;
  applied_at: string;
  creator?: any;
  campaign?: any;
}

export interface Payment {
  id: string;
  creator_id: string;
  brand_id: string;
  sponsorship_id: string;
  amount: number;
  status: string;
  transaction_date: string;
  creator?: any;
  campaign?: any;
}

// API Service Class
class BrandApiService {
  private async makeRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      throw error;
    }
  }

  // Dashboard Overview
  async getDashboardOverview(brandId: string): Promise<DashboardOverview> {
    return this.makeRequest<DashboardOverview>(`/dashboard/overview?brand_id=${brandId}`);
  }

  // Brand Profile
  async getBrandProfile(userId: string): Promise<BrandProfile> {
    return this.makeRequest<BrandProfile>(`/profile/${userId}`);
  }

  async createBrandProfile(profile: Omit<BrandProfile, 'id' | 'created_at'>): Promise<BrandProfile> {
    return this.makeRequest<BrandProfile>('/profile', {
      method: 'POST',
      body: JSON.stringify(profile),
    });
  }

  async updateBrandProfile(userId: string, updates: Partial<BrandProfile>): Promise<BrandProfile> {
    return this.makeRequest<BrandProfile>(`/profile/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  // Campaigns
  async getBrandCampaigns(brandId: string): Promise<Campaign[]> {
    return this.makeRequest<Campaign[]>(`/campaigns?brand_id=${brandId}`);
  }

  async getCampaignDetails(campaignId: string, brandId: string): Promise<Campaign> {
    return this.makeRequest<Campaign>(`/campaigns/${campaignId}?brand_id=${brandId}`);
  }

  async createCampaign(campaign: {
    brand_id: string;
    title: string;
    description: string;
    required_audience: Record<string, any>;
    budget: number;
    engagement_minimum: number;
  }): Promise<Campaign> {
    return this.makeRequest<Campaign>('/campaigns', {
      method: 'POST',
      body: JSON.stringify(campaign),
    });
  }

  async updateCampaign(campaignId: string, updates: Partial<Campaign>, brandId: string): Promise<Campaign> {
    return this.makeRequest<Campaign>(`/campaigns/${campaignId}?brand_id=${brandId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteCampaign(campaignId: string, brandId: string): Promise<void> {
    return this.makeRequest<void>(`/campaigns/${campaignId}?brand_id=${brandId}`, {
      method: 'DELETE',
    });
  }

  // Creator Matches
  async getCreatorMatches(brandId: string): Promise<CreatorMatch[]> {
    return this.makeRequest<CreatorMatch[]>(`/creators/matches?brand_id=${brandId}`);
  }

  async searchCreators(
    brandId: string,
    filters?: {
      industry?: string;
      min_engagement?: number;
      location?: string;
    }
  ): Promise<any[]> {
    const params = new URLSearchParams({ brand_id: brandId });
    if (filters?.industry) params.append('industry', filters.industry);
    if (filters?.min_engagement) params.append('min_engagement', filters.min_engagement.toString());
    if (filters?.location) params.append('location', filters.location);

    return this.makeRequest<any[]>(`/creators/search?${params.toString()}`);
  }

  async getCreatorProfile(creatorId: string, brandId: string): Promise<any> {
    return this.makeRequest<any>(`/creators/${creatorId}/profile?brand_id=${brandId}`);
  }

  // Analytics
  async getCampaignPerformance(brandId: string): Promise<any> {
    return this.makeRequest<any>(`/analytics/performance?brand_id=${brandId}`);
  }

  async getRevenueAnalytics(brandId: string): Promise<any> {
    return this.makeRequest<any>(`/analytics/revenue?brand_id=${brandId}`);
  }

  // Applications
  async getBrandApplications(brandId: string): Promise<Application[]> {
    return this.makeRequest<Application[]>(`/applications?brand_id=${brandId}`);
  }

  async getApplicationDetails(applicationId: string, brandId: string): Promise<Application> {
    return this.makeRequest<Application>(`/applications/${applicationId}?brand_id=${brandId}`);
  }

  async updateApplicationStatus(
    applicationId: string,
    status: string,
    notes?: string,
    brandId?: string
  ): Promise<Application> {
    return this.makeRequest<Application>(`/applications/${applicationId}?brand_id=${brandId}`, {
      method: 'PUT',
      body: JSON.stringify({ status, notes }),
    });
  }

  async getApplicationsSummary(brandId: string): Promise<any> {
    return this.makeRequest<any>(`/applications/summary?brand_id=${brandId}`);
  }

  // Payments
  async getBrandPayments(brandId: string): Promise<Payment[]> {
    return this.makeRequest<Payment[]>(`/payments?brand_id=${brandId}`);
  }

  async getPaymentDetails(paymentId: string, brandId: string): Promise<Payment> {
    return this.makeRequest<Payment>(`/payments/${paymentId}?brand_id=${brandId}`);
  }

  async updatePaymentStatus(
    paymentId: string,
    status: string,
    brandId: string
  ): Promise<Payment> {
    return this.makeRequest<Payment>(`/payments/${paymentId}/status?brand_id=${brandId}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async getPaymentAnalytics(brandId: string): Promise<any> {
    return this.makeRequest<any>(`/payments/analytics?brand_id=${brandId}`);
  }


}

// Export singleton instance
export const brandApi = new BrandApiService(); 