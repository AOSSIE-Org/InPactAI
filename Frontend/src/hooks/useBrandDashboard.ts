import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { brandApi, DashboardOverview, BrandProfile, Campaign, CreatorMatch, Application, Payment } from '../services/brandApi';

export const useBrandDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dashboard Overview
  const [dashboardOverview, setDashboardOverview] = useState<DashboardOverview | null>(null);
  const [brandProfile, setBrandProfile] = useState<BrandProfile | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [creatorMatches, setCreatorMatches] = useState<CreatorMatch[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);

  // AI Query
  const [aiResponse, setAiResponse] = useState<any>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const brandId = user?.id;

  // Load dashboard overview
  const loadDashboardOverview = useCallback(async () => {
    if (!brandId) return;
    
    try {
      setLoading(true);
      const overview = await brandApi.getDashboardOverview(brandId);
      setDashboardOverview(overview);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard overview');
    } finally {
      setLoading(false);
    }
  }, [brandId]);

  // Load brand profile
  const loadBrandProfile = useCallback(async () => {
    if (!brandId) return;
    
    try {
      const profile = await brandApi.getBrandProfile(brandId);
      setBrandProfile(profile);
    } catch (err) {
      console.error('Failed to load brand profile:', err);
    }
  }, [brandId]);

  // Load campaigns
  const loadCampaigns = useCallback(async () => {
    if (!brandId) return;
    
    try {
      const campaignsData = await brandApi.getBrandCampaigns(brandId);
      setCampaigns(campaignsData);
    } catch (err) {
      console.error('Failed to load campaigns:', err);
    }
  }, [brandId]);

  // Load creator matches
  const loadCreatorMatches = useCallback(async () => {
    if (!brandId) return;
    
    try {
      const matches = await brandApi.getCreatorMatches(brandId);
      setCreatorMatches(matches);
    } catch (err) {
      console.error('Failed to load creator matches:', err);
    }
  }, [brandId]);

  // Load applications
  const loadApplications = useCallback(async () => {
    if (!brandId) return;
    
    try {
      const applicationsData = await brandApi.getBrandApplications(brandId);
      setApplications(applicationsData);
    } catch (err) {
      console.error('Failed to load applications:', err);
    }
  }, [brandId]);

  // Load payments
  const loadPayments = useCallback(async () => {
    if (!brandId) return;
    
    try {
      const paymentsData = await brandApi.getBrandPayments(brandId);
      setPayments(paymentsData);
    } catch (err) {
      console.error('Failed to load payments:', err);
    }
  }, [brandId]);

  // Create campaign
  const createCampaign = useCallback(async (campaignData: {
    title: string;
    description: string;
    required_audience: Record<string, any>;
    budget: number;
    engagement_minimum: number;
  }) => {
    if (!brandId) throw new Error('User not authenticated');
    
    try {
      const newCampaign = await brandApi.createCampaign({
        ...campaignData,
        brand_id: brandId,
      });
      setCampaigns(prev => [...prev, newCampaign]);
      return newCampaign;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to create campaign');
    }
  }, [brandId]);

  // Update campaign
  const updateCampaign = useCallback(async (campaignId: string, updates: Partial<Campaign>) => {
    if (!brandId) throw new Error('User not authenticated');
    
    try {
      const updatedCampaign = await brandApi.updateCampaign(campaignId, updates, brandId);
      setCampaigns(prev => prev.map(campaign => 
        campaign.id === campaignId ? updatedCampaign : campaign
      ));
      return updatedCampaign;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to update campaign');
    }
  }, [brandId]);

  // Delete campaign
  const deleteCampaign = useCallback(async (campaignId: string) => {
    if (!brandId) throw new Error('User not authenticated');
    
    try {
      await brandApi.deleteCampaign(campaignId, brandId);
      setCampaigns(prev => prev.filter(campaign => campaign.id !== campaignId));
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to delete campaign');
    }
  }, [brandId]);

  // Update application status
  const updateApplicationStatus = useCallback(async (
    applicationId: string, 
    status: string, 
    notes?: string
  ) => {
    if (!brandId) throw new Error('User not authenticated');
    
    try {
      const updatedApplication = await brandApi.updateApplicationStatus(
        applicationId, 
        status, 
        notes, 
        brandId
      );
      setApplications(prev => prev.map(app => 
        app.id === applicationId ? updatedApplication : app
      ));
      return updatedApplication;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to update application status');
    }
  }, [brandId]);

  // AI Query
  const queryAI = useCallback(async (query: string) => {
    try {
      setAiLoading(true);
      const response = await brandApi.queryAI(query);
      setAiResponse(response);
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process AI query');
      throw err;
    } finally {
      setAiLoading(false);
    }
  }, []);

  // Search creators
  const searchCreators = useCallback(async (filters?: {
    industry?: string;
    min_engagement?: number;
    location?: string;
  }) => {
    if (!brandId) throw new Error('User not authenticated');
    
    try {
      return await brandApi.searchCreators(brandId, filters);
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to search creators');
    }
  }, [brandId]);

  // Get analytics
  const getCampaignPerformance = useCallback(async () => {
    if (!brandId) throw new Error('User not authenticated');
    
    try {
      return await brandApi.getCampaignPerformance(brandId);
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to get campaign performance');
    }
  }, [brandId]);

  const getRevenueAnalytics = useCallback(async () => {
    if (!brandId) throw new Error('User not authenticated');
    
    try {
      return await brandApi.getRevenueAnalytics(brandId);
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to get revenue analytics');
    }
  }, [brandId]);

  // Load all data on mount
  useEffect(() => {
    if (brandId) {
      Promise.all([
        loadDashboardOverview(),
        loadBrandProfile(),
        loadCampaigns(),
        loadCreatorMatches(),
        loadApplications(),
        loadPayments(),
      ]).catch(err => {
        console.error('Error loading dashboard data:', err);
      });
    }
  }, [brandId, loadDashboardOverview, loadBrandProfile, loadCampaigns, loadCreatorMatches, loadApplications, loadPayments]);

  // Refresh all data
  const refreshData = useCallback(() => {
    if (brandId) {
      Promise.all([
        loadDashboardOverview(),
        loadBrandProfile(),
        loadCampaigns(),
        loadCreatorMatches(),
        loadApplications(),
        loadPayments(),
      ]).catch(err => {
        console.error('Error refreshing dashboard data:', err);
      });
    }
  }, [brandId, loadDashboardOverview, loadBrandProfile, loadCampaigns, loadCreatorMatches, loadApplications, loadPayments]);

  return {
    // State
    loading,
    error,
    dashboardOverview,
    brandProfile,
    campaigns,
    creatorMatches,
    applications,
    payments,
    aiResponse,
    aiLoading,
    
    // Actions
    createCampaign,
    updateCampaign,
    deleteCampaign,
    updateApplicationStatus,
    queryAI,
    searchCreators,
    getCampaignPerformance,
    getRevenueAnalytics,
    refreshData,
    
    // Individual loaders
    loadDashboardOverview,
    loadBrandProfile,
    loadCampaigns,
    loadCreatorMatches,
    loadApplications,
    loadPayments,
  };
}; 