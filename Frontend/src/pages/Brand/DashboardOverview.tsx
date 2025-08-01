import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Calendar, 
  BarChart3, 
  MessageSquare, 
  FileText, 
  Eye, 
  Target, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Plus,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  MapPin,
  Star,
  Zap,
  ArrowLeft,
  Loader2
} from "lucide-react";

const DashboardOverview = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<any>(null);
  
  // Modal states
  const [campaignsModalOpen, setCampaignsModalOpen] = useState(false);
  const [creatorsModalOpen, setCreatorsModalOpen] = useState(false);
  const [paymentsModalOpen, setPaymentsModalOpen] = useState(false);
  const [analyticsModalOpen, setAnalyticsModalOpen] = useState(false);
  const [notificationsModalOpen, setNotificationsModalOpen] = useState(false);
  
  // Brand ID for testing (in production, this would come from auth context)
  const brandId = "6dbfcdd5-795f-49c1-8f7a-a5538b8c6f6f"; // Test brand ID
  
  // Theme colors matching brand homepage
  const PRIMARY = "#0B00CF";
  const SECONDARY = "#300A6E";
  const ACCENT = "#FF2D2B";
  
  // Mock data for demonstration (fallback)
  const mockData = {
    // Key Performance Metrics
    kpis: {
      activeCampaigns: 12,
      totalReach: "2.4M",
      engagementRate: 4.8,
      roi: 320,
      budgetSpent: 45000,
      budgetAllocated: 75000
    },
    
    // Campaign Overview
    campaigns: [
      { id: 1, name: "Summer Collection Launch", status: "active", performance: "excellent", reach: "850K", engagement: 5.2, deadline: "2024-08-15" },
      { id: 2, name: "Tech Review Series", status: "active", performance: "good", reach: "620K", engagement: 4.1, deadline: "2024-08-20" },
      { id: 3, name: "Fitness Challenge", status: "pending", performance: "pending", reach: "0", engagement: 0, deadline: "2024-09-01" }
    ],
    
    // Creator Management
    creators: {
      totalConnected: 28,
      pendingApplications: 5,
      topPerformers: 8,
      newRecommendations: 12
    },
    
    // Financial Overview
    financial: {
      monthlySpend: 18500,
      pendingPayments: 3200,
      costPerEngagement: 0.85,
      budgetUtilization: 62
    },
    
    // Analytics & Insights
    analytics: {
      audienceGrowth: 12.5,
      bestContentType: "Video",
      topGeographicMarket: "United States",
      trendingTopics: ["Sustainability", "Tech Reviews", "Fitness"]
    },
    
    // Notifications
    notifications: [
      { id: 1, type: "urgent", message: "3 applications need review", time: "2 hours ago" },
      { id: 2, type: "alert", message: "Campaign 'Tech Review' underperforming", time: "4 hours ago" },
      { id: 3, type: "info", message: "New creator recommendations available", time: "1 day ago" }
    ]
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "text-green-500 bg-green-100";
      case "pending": return "text-yellow-500 bg-yellow-100";
      case "completed": return "text-blue-500 bg-blue-100";
      default: return "text-gray-500 bg-gray-100";
    }
  };

  const getPerformanceColor = (performance: string) => {
    switch (performance) {
      case "excellent": return "text-green-600";
      case "good": return "text-blue-600";
      case "average": return "text-yellow-600";
      case "poor": return "text-red-600";
      default: return "text-gray-600";
    }
  };

  // Fetch dashboard data from API
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch KPIs data
        const kpisResponse = await fetch(`http://localhost:8000/api/brand/dashboard/kpis?brand_id=${brandId}`);
        if (!kpisResponse.ok) throw new Error('Failed to fetch KPIs data');
        const kpisData = await kpisResponse.json();
        
        // Fetch campaigns data
        const campaignsResponse = await fetch(`http://localhost:8000/api/brand/dashboard/campaigns/overview?brand_id=${brandId}`);
        if (!campaignsResponse.ok) throw new Error('Failed to fetch campaigns data');
        const campaignsData = await campaignsResponse.json();
        
        // Fetch analytics data
        const analyticsResponse = await fetch(`http://localhost:8000/api/brand/dashboard/analytics?brand_id=${brandId}`);
        if (!analyticsResponse.ok) throw new Error('Failed to fetch analytics data');
        const analyticsData = await analyticsResponse.json();
        
        // Fetch notifications data
        const notificationsResponse = await fetch(`http://localhost:8000/api/brand/dashboard/notifications?brand_id=${brandId}`);
        if (!notificationsResponse.ok) throw new Error('Failed to fetch notifications data');
        const notificationsData = await notificationsResponse.json();
        
        // Combine all data
        setDashboardData({
          kpis: kpisData.kpis,
          creators: kpisData.creators,
          financial: kpisData.financial,
          analytics: analyticsData.analytics,
          campaigns: campaignsData.campaigns,
          notifications: notificationsData.notifications
        });
        
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
        // Use mock data as fallback
        setDashboardData(mockData);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [brandId]);

  // Use API data if available, otherwise fall back to mock data
  const data = dashboardData || mockData;

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            <span className="text-lg text-gray-600">Loading dashboard data...</span>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back</span>
            </button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Overview</h1>
          <p className="text-gray-600">At a glance view of your brand performance and campaigns</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-red-800 font-medium">Error loading dashboard data</span>
          </div>
          <p className="text-red-600 mt-1">{error}</p>
          <p className="text-red-500 text-sm mt-2">Using fallback data for demonstration.</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      style={{
        minHeight: "100vh",
        background: "#0f0f0f",
        padding: "24px",
        color: "#ffffff",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: "32px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "16px" }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 16px",
              color: "#a0a0a0",
              background: "transparent",
              border: "none",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: "500",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#fff";
              e.currentTarget.style.background = "rgba(42, 42, 42, 0.8)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#a0a0a0";
              e.currentTarget.style.background = "transparent";
            }}
          >
            <ArrowLeft size={20} />
            <span>Back</span>
          </button>
        </div>
        <h1 style={{ 
          fontSize: "32px", 
          fontWeight: "700", 
          color: "#fff", 
          marginBottom: "8px",
          letterSpacing: "-0.02em",
        }}>
          Dashboard Overview
        </h1>
        <p style={{ color: "#a0a0a0", fontSize: "16px" }}>
          At a glance view of your brand performance and campaigns
        </p>
      </div>

      {/* Key Performance Metrics */}
      <div style={{ marginBottom: "32px" }}>
        <h2 style={{ 
          fontSize: "20px", 
          fontWeight: "600", 
          color: "#fff", 
          marginBottom: "16px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}>
          <TrendingUp size={20} style={{ color: PRIMARY }} />
          Key Performance Metrics
        </h2>
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", 
          gap: "24px" 
        }}>
          <div style={{
            background: "rgba(26, 26, 26, 0.8)",
            backdropFilter: "blur(20px)",
            borderRadius: "16px",
            padding: "24px",
            border: "1px solid rgba(42, 42, 42, 0.6)",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
              <div style={{
                padding: "12px",
                background: "rgba(11, 0, 207, 0.2)",
                borderRadius: "12px",
              }}>
                <Users size={24} style={{ color: PRIMARY }} />
              </div>
              <span style={{ fontSize: "14px", color: "#a0a0a0" }}>Active Campaigns</span>
            </div>
            <div style={{ fontSize: "32px", fontWeight: "700", color: "#fff" }}>{data.kpis.activeCampaigns}</div>
            <div style={{ display: "flex", alignItems: "center", marginTop: "8px", color: "#10b981" }}>
              <ArrowUpRight size={16} style={{ marginRight: "4px" }} />
              <span style={{ fontSize: "14px" }}>+2 from last month</span>
            </div>
          </div>

          <div style={{
            background: "rgba(26, 26, 26, 0.8)",
            backdropFilter: "blur(20px)",
            borderRadius: "16px",
            padding: "24px",
            border: "1px solid rgba(42, 42, 42, 0.6)",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
              <div style={{
                padding: "12px",
                background: "rgba(16, 185, 129, 0.2)",
                borderRadius: "12px",
              }}>
                <Eye size={24} style={{ color: "#10b981" }} />
              </div>
              <span style={{ fontSize: "14px", color: "#a0a0a0" }}>Total Reach</span>
            </div>
            <div style={{ fontSize: "32px", fontWeight: "700", color: "#fff" }}>{data.kpis.totalReach}</div>
            <div style={{ display: "flex", alignItems: "center", marginTop: "8px", color: "#10b981" }}>
              <ArrowUpRight size={16} style={{ marginRight: "4px" }} />
              <span style={{ fontSize: "14px" }}>+15% from last month</span>
            </div>
          </div>

          <div style={{
            background: "rgba(26, 26, 26, 0.8)",
            backdropFilter: "blur(20px)",
            borderRadius: "16px",
            padding: "24px",
            border: "1px solid rgba(42, 42, 42, 0.6)",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
              <div style={{
                padding: "12px",
                background: "rgba(147, 51, 234, 0.2)",
                borderRadius: "12px",
              }}>
                <BarChart3 size={24} style={{ color: "#9333ea" }} />
              </div>
              <span style={{ fontSize: "14px", color: "#a0a0a0" }}>Engagement Rate</span>
            </div>
            <div style={{ fontSize: "32px", fontWeight: "700", color: "#fff" }}>{data.kpis.engagementRate}%</div>
            <div style={{ display: "flex", alignItems: "center", marginTop: "8px", color: "#10b981" }}>
              <ArrowUpRight size={16} style={{ marginRight: "4px" }} />
              <span style={{ fontSize: "14px" }}>+0.3% from last month</span>
            </div>
          </div>

          <div style={{
            background: "rgba(26, 26, 26, 0.8)",
            backdropFilter: "blur(20px)",
            borderRadius: "16px",
            padding: "24px",
            border: "1px solid rgba(42, 42, 42, 0.6)",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
              <div style={{
                padding: "12px",
                background: "rgba(245, 158, 11, 0.2)",
                borderRadius: "12px",
              }}>
                <DollarSign size={24} style={{ color: "#f59e0b" }} />
              </div>
              <span style={{ fontSize: "14px", color: "#a0a0a0" }}>ROI</span>
            </div>
            <div style={{ fontSize: "32px", fontWeight: "700", color: "#fff" }}>{data.kpis.roi}%</div>
            <div style={{ display: "flex", alignItems: "center", marginTop: "8px", color: "#10b981" }}>
              <ArrowUpRight size={16} style={{ marginRight: "4px" }} />
              <span style={{ fontSize: "14px" }}>+25% from last month</span>
            </div>
          </div>

          <div style={{
            background: "rgba(26, 26, 26, 0.8)",
            backdropFilter: "blur(20px)",
            borderRadius: "16px",
            padding: "24px",
            border: "1px solid rgba(42, 42, 42, 0.6)",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
              <div style={{
                padding: "12px",
                background: "rgba(239, 68, 68, 0.2)",
                borderRadius: "12px",
              }}>
                <DollarSign size={24} style={{ color: "#ef4444" }} />
              </div>
              <span style={{ fontSize: "14px", color: "#a0a0a0" }}>Budget Spent</span>
            </div>
            <div style={{ fontSize: "32px", fontWeight: "700", color: "#fff" }}>${data.kpis.budgetSpent.toLocaleString()}</div>
            <div style={{ display: "flex", alignItems: "center", marginTop: "8px", color: PRIMARY }}>
              <span style={{ fontSize: "14px" }}>{data.kpis.budgetUtilization}% of allocated budget</span>
            </div>
          </div>

          <div style={{
            background: "rgba(26, 26, 26, 0.8)",
            backdropFilter: "blur(20px)",
            borderRadius: "16px",
            padding: "24px",
            border: "1px solid rgba(42, 42, 42, 0.6)",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
              <div style={{
                padding: "12px",
                background: "rgba(99, 102, 241, 0.2)",
                borderRadius: "12px",
              }}>
                <Target size={24} style={{ color: "#6366f1" }} />
              </div>
              <span style={{ fontSize: "14px", color: "#a0a0a0" }}>Cost per Engagement</span>
            </div>
            <div style={{ fontSize: "32px", fontWeight: "700", color: "#fff" }}>${data.financial.costPerEngagement}</div>
            <div style={{ display: "flex", alignItems: "center", marginTop: "8px", color: "#10b981" }}>
              <ArrowDownRight size={16} style={{ marginRight: "4px" }} />
              <span style={{ fontSize: "14px" }}>-12% from last month</span>
            </div>
          </div>
        </div>
      </div>

      {/* Campaign Overview & Creator Management */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Campaign Overview */}
        <div style={{
          background: "rgba(26, 26, 26, 0.8)",
          backdropFilter: "blur(20px)",
          borderRadius: "16px",
          padding: "24px",
          border: "1px solid rgba(42, 42, 42, 0.6)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
            <h3 style={{ 
              fontSize: "18px", 
              fontWeight: "600", 
              color: "#fff",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}>
              <Calendar size={20} style={{ color: PRIMARY }} />
              Recent Campaigns
            </h3>
            <button 
              onClick={() => setCampaignsModalOpen(true)}
              style={{
                color: PRIMARY,
                fontSize: "14px",
                fontWeight: "500",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                transition: "color 0.2s ease",
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = "#0a00b3"}
              onMouseLeave={(e) => e.currentTarget.style.color = PRIMARY}
            >
              View All
            </button>
          </div>
          <div style={{ display: "grid", gap: "16px" }}>
            {data.campaigns.map((campaign) => (
              <div key={campaign.id} style={{
                background: "rgba(42, 42, 42, 0.6)",
                borderRadius: "12px",
                padding: "16px",
                border: "1px solid rgba(42, 42, 42, 0.8)",
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                  <h4 style={{ fontSize: "16px", fontWeight: "600", color: "#fff" }}>{campaign.name}</h4>
                  <span style={{
                    padding: "4px 12px",
                    borderRadius: "20px",
                    fontSize: "12px",
                    fontWeight: "500",
                    background: campaign.status === "active" ? "rgba(16, 185, 129, 0.2)" : "rgba(245, 158, 11, 0.2)",
                    color: campaign.status === "active" ? "#10b981" : "#f59e0b",
                  }}>
                    {campaign.status}
                  </span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
                  <div>
                    <span style={{ fontSize: "12px", color: "#a0a0a0" }}>Reach:</span>
                    <div style={{ fontSize: "14px", fontWeight: "600", color: "#fff" }}>{campaign.reach}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: "12px", color: "#a0a0a0" }}>Engagement:</span>
                    <div style={{ 
                      fontSize: "14px", 
                      fontWeight: "600", 
                      color: campaign.performance === "excellent" ? "#10b981" : campaign.performance === "good" ? "#3b82f6" : "#f59e0b"
                    }}>
                      {campaign.engagement}%
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: "12px", color: "#a0a0a0" }}>Deadline:</span>
                    <div style={{ fontSize: "14px", fontWeight: "600", color: "#fff" }}>
                      {new Date(campaign.deadline).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Creator Management */}
        <div style={{
          background: "rgba(26, 26, 26, 0.8)",
          backdropFilter: "blur(20px)",
          borderRadius: "16px",
          padding: "24px",
          border: "1px solid rgba(42, 42, 42, 0.6)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
            <h3 style={{ 
              fontSize: "18px", 
              fontWeight: "600", 
              color: "#fff",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}>
              <Users size={20} style={{ color: "#10b981" }} />
              Creator Management
            </h3>
            <button 
              onClick={() => setCreatorsModalOpen(true)}
              style={{
                color: "#10b981",
                fontSize: "14px",
                fontWeight: "500",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                transition: "color 0.2s ease",
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = "#059669"}
              onMouseLeave={(e) => e.currentTarget.style.color = "#10b981"}
            >
              View All
            </button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px" }}>
            <div style={{
              background: "rgba(11, 0, 207, 0.2)",
              borderRadius: "12px",
              padding: "20px",
              border: "1px solid rgba(11, 0, 207, 0.3)",
            }}>
              <div style={{ fontSize: "24px", fontWeight: "700", color: PRIMARY }}>{data.creators.totalConnected}</div>
              <div style={{ fontSize: "14px", color: "#a0a0a0", marginTop: "8px" }}>Connected Creators</div>
            </div>
            <div style={{
              background: "rgba(245, 158, 11, 0.2)",
              borderRadius: "12px",
              padding: "20px",
              border: "1px solid rgba(245, 158, 11, 0.3)",
            }}>
              <div style={{ fontSize: "24px", fontWeight: "700", color: "#f59e0b" }}>{data.creators.pendingApplications}</div>
              <div style={{ fontSize: "14px", color: "#a0a0a0", marginTop: "8px" }}>Pending Applications</div>
            </div>
            <div style={{
              background: "rgba(16, 185, 129, 0.2)",
              borderRadius: "12px",
              padding: "20px",
              border: "1px solid rgba(16, 185, 129, 0.3)",
            }}>
              <div style={{ fontSize: "24px", fontWeight: "700", color: "#10b981" }}>{data.creators.topPerformers}</div>
              <div style={{ fontSize: "14px", color: "#a0a0a0", marginTop: "8px" }}>Top Performers</div>
            </div>
            <div style={{
              background: "rgba(147, 51, 234, 0.2)",
              borderRadius: "12px",
              padding: "20px",
              border: "1px solid rgba(147, 51, 234, 0.3)",
            }}>
              <div style={{ fontSize: "24px", fontWeight: "700", color: "#9333ea" }}>{data.creators.newRecommendations}</div>
              <div style={{ fontSize: "14px", color: "#a0a0a0", marginTop: "8px" }}>New Recommendations</div>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Overview & Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Financial Overview */}
        <div style={{
          background: "rgba(26, 26, 26, 0.8)",
          backdropFilter: "blur(20px)",
          borderRadius: "16px",
          padding: "24px",
          border: "1px solid rgba(42, 42, 42, 0.6)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
            <h3 style={{ 
              fontSize: "18px", 
              fontWeight: "600", 
              color: "#fff",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}>
              <DollarSign size={20} style={{ color: "#10b981" }} />
              Financial Overview
            </h3>
            <button 
              onClick={() => setPaymentsModalOpen(true)}
              style={{
                color: "#10b981",
                fontSize: "14px",
                fontWeight: "500",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                transition: "color 0.2s ease",
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = "#059669"}
              onMouseLeave={(e) => e.currentTarget.style.color = "#10b981"}
            >
              View All
            </button>
          </div>
                      <div style={{ display: "grid", gap: "16px" }}>
              <div style={{
                background: "rgba(16, 185, 129, 0.2)",
                borderRadius: "12px",
                padding: "20px",
                border: "1px solid rgba(16, 185, 129, 0.3)",
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontSize: "14px", color: "#a0a0a0" }}>Monthly Spend</div>
                    <div style={{ fontSize: "24px", fontWeight: "700", color: "#10b981" }}>
                      ${data.financial.monthlySpend.toLocaleString()}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "14px", color: "#a0a0a0" }}>vs Last Month</div>
                    <div style={{ fontSize: "16px", fontWeight: "600", color: "#10b981" }}>+8%</div>
                  </div>
                </div>
              </div>
              <div style={{
                background: "rgba(245, 158, 11, 0.2)",
                borderRadius: "12px",
                padding: "20px",
                border: "1px solid rgba(245, 158, 11, 0.3)",
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontSize: "14px", color: "#a0a0a0" }}>Pending Payments</div>
                    <div style={{ fontSize: "24px", fontWeight: "700", color: "#f59e0b" }}>
                      ${data.financial.pendingPayments.toLocaleString()}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "14px", color: "#a0a0a0" }}>Due This Week</div>
                    <div style={{ fontSize: "16px", fontWeight: "600", color: "#f59e0b" }}>3 payments</div>
                  </div>
                </div>
              </div>
              <div style={{
                background: "rgba(11, 0, 207, 0.2)",
                borderRadius: "12px",
                padding: "20px",
                border: "1px solid rgba(11, 0, 207, 0.3)",
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontSize: "14px", color: "#a0a0a0" }}>Budget Utilization</div>
                    <div style={{ fontSize: "24px", fontWeight: "700", color: PRIMARY }}>
                      {data.financial.budgetUtilization}%
                    </div>
                  </div>
                  <div style={{ width: "100px", background: "rgba(42, 42, 42, 0.6)", borderRadius: "10px", height: "8px" }}>
                    <div style={{ 
                      background: PRIMARY, 
                      height: "8px", 
                      borderRadius: "10px",
                      width: `${data.financial.budgetUtilization}%`
                    }}></div>
                  </div>
                </div>
              </div>
            </div>
        </div>

        {/* Analytics & Insights */}
        <div style={{
          background: "rgba(26, 26, 26, 0.8)",
          backdropFilter: "blur(20px)",
          borderRadius: "16px",
          padding: "24px",
          border: "1px solid rgba(42, 42, 42, 0.6)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
            <h3 style={{ 
              fontSize: "18px", 
              fontWeight: "600", 
              color: "#fff",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}>
              <BarChart3 size={20} style={{ color: "#9333ea" }} />
              Analytics & Insights
            </h3>
            <button 
              onClick={() => setAnalyticsModalOpen(true)}
              style={{
                color: "#9333ea",
                fontSize: "14px",
                fontWeight: "500",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                transition: "color 0.2s ease",
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = "#7c3aed"}
              onMouseLeave={(e) => e.currentTarget.style.color = "#9333ea"}
            >
              View All
            </button>
          </div>
          <div style={{ display: "grid", gap: "16px" }}>
            <div style={{
              background: "rgba(147, 51, 234, 0.2)",
              borderRadius: "12px",
              padding: "20px",
              border: "1px solid rgba(147, 51, 234, 0.3)",
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontSize: "14px", color: "#a0a0a0" }}>Audience Growth</div>
                  <div style={{ fontSize: "24px", fontWeight: "700", color: "#9333ea" }}>
                    +{data.analytics.audienceGrowth}%
                  </div>
                </div>
                <TrendingUp size={32} style={{ color: "#9333ea" }} />
              </div>
            </div>
            <div style={{
              background: "rgba(99, 102, 241, 0.2)",
              borderRadius: "12px",
              padding: "20px",
              border: "1px solid rgba(99, 102, 241, 0.3)",
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontSize: "14px", color: "#a0a0a0" }}>Best Content Type</div>
                  <div style={{ fontSize: "24px", fontWeight: "700", color: "#6366f1" }}>
                    {data.analytics.bestContentType}
                  </div>
                </div>
                <Zap size={32} style={{ color: "#6366f1" }} />
              </div>
            </div>
            <div style={{
              background: "rgba(16, 185, 129, 0.2)",
              borderRadius: "12px",
              padding: "20px",
              border: "1px solid rgba(16, 185, 129, 0.3)",
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontSize: "14px", color: "#a0a0a0" }}>Top Market</div>
                  <div style={{ fontSize: "24px", fontWeight: "700", color: "#10b981" }}>
                    {data.analytics.topGeographicMarket}
                  </div>
                </div>
                <MapPin size={32} style={{ color: "#10b981" }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Notifications */}
        <div style={{
          background: "rgba(26, 26, 26, 0.8)",
          backdropFilter: "blur(20px)",
          borderRadius: "16px",
          padding: "24px",
          border: "1px solid rgba(42, 42, 42, 0.6)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
            <h3 style={{ 
              fontSize: "18px", 
              fontWeight: "600", 
              color: "#fff",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}>
              <AlertCircle size={20} style={{ color: "#ef4444" }} />
              Notifications
            </h3>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Badge variant="outline" style={{
                fontSize: "12px",
                color: "#f97316",
                border: "1px solid #fed7aa",
                background: "#fff7ed",
                padding: "2px 8px",
                borderRadius: "4px",
              }}>
                Still mock data
              </Badge>
              <button 
                onClick={() => setNotificationsModalOpen(true)}
                style={{
                  color: "#ef4444",
                  fontSize: "14px",
                  fontWeight: "500",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  transition: "color 0.2s ease",
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = "#dc2626"}
                onMouseLeave={(e) => e.currentTarget.style.color = "#ef4444"}
              >
                View All
              </button>
            </div>
          </div>
          <div style={{ display: "grid", gap: "12px" }}>
            {data.notifications.map((notification) => (
              <div key={notification.id} style={{
                background: "rgba(42, 42, 42, 0.6)",
                borderRadius: "12px",
                padding: "16px",
                border: "1px solid rgba(42, 42, 42, 0.8)",
              }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                  <div style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    marginTop: "6px",
                    background: notification.type === 'urgent' ? '#ef4444' : 
                              notification.type === 'alert' ? '#f59e0b' : '#3b82f6'
                  }}></div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "14px", fontWeight: "600", color: "#fff", marginBottom: "4px" }}>
                      {notification.message}
                    </div>
                    <div style={{ fontSize: "12px", color: "#a0a0a0" }}>
                      {notification.time}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{
          background: "rgba(26, 26, 26, 0.8)",
          backdropFilter: "blur(20px)",
          borderRadius: "16px",
          padding: "24px",
          border: "1px solid rgba(42, 42, 42, 0.6)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
        }}>
          <h3 style={{ 
            fontSize: "18px", 
            fontWeight: "600", 
            color: "#fff",
            marginBottom: "24px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}>
            <Zap size={20} style={{ color: "#f97316" }} />
            Quick Actions
          </h3>
          <div style={{ display: "grid", gap: "12px" }}>
            <button style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid rgba(42, 42, 42, 0.8)",
              background: "rgba(42, 42, 42, 0.6)",
              color: "#fff",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(59, 130, 246, 0.2)";
              e.currentTarget.style.borderColor = "#3b82f6";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(42, 42, 42, 0.6)";
              e.currentTarget.style.borderColor = "rgba(42, 42, 42, 0.8)";
            }}>
              <Plus size={20} style={{ color: "#3b82f6" }} />
              <span style={{ fontSize: "14px", fontWeight: "500" }}>Create New Campaign</span>
            </button>
            <button style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid rgba(42, 42, 42, 0.8)",
              background: "rgba(42, 42, 42, 0.6)",
              color: "#fff",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(16, 185, 129, 0.2)";
              e.currentTarget.style.borderColor = "#10b981";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(42, 42, 42, 0.6)";
              e.currentTarget.style.borderColor = "rgba(42, 42, 42, 0.8)";
            }}>
              <Search size={20} style={{ color: "#10b981" }} />
              <span style={{ fontSize: "14px", fontWeight: "500" }}>Find Creators</span>
            </button>
            <button style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid rgba(42, 42, 42, 0.8)",
              background: "rgba(42, 42, 42, 0.6)",
              color: "#fff",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(147, 51, 234, 0.2)";
              e.currentTarget.style.borderColor = "#9333ea";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(42, 42, 42, 0.6)";
              e.currentTarget.style.borderColor = "rgba(42, 42, 42, 0.8)";
            }}>
              <BarChart3 size={20} style={{ color: "#9333ea" }} />
              <span style={{ fontSize: "14px", fontWeight: "500" }}>View Analytics</span>
            </button>
            <button style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid rgba(42, 42, 42, 0.8)",
              background: "rgba(42, 42, 42, 0.6)",
              color: "#fff",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(245, 158, 11, 0.2)";
              e.currentTarget.style.borderColor = "#f59e0b";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(42, 42, 42, 0.6)";
              e.currentTarget.style.borderColor = "rgba(42, 42, 42, 0.8)";
            }}>
              <FileText size={20} style={{ color: "#f59e0b" }} />
              <span style={{ fontSize: "14px", fontWeight: "500" }}>Draft Contract</span>
            </button>
          </div>
        </div>

        {/* Timeline View */}
        <div style={{
          background: "rgba(26, 26, 26, 0.8)",
          backdropFilter: "blur(20px)",
          borderRadius: "16px",
          padding: "24px",
          border: "1px solid rgba(42, 42, 42, 0.6)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
        }}>
          <h3 style={{ 
            fontSize: "18px", 
            fontWeight: "600", 
            color: "#fff",
            marginBottom: "24px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}>
            <Clock size={20} style={{ color: "#6366f1" }} />
            This Week
          </h3>
          <div style={{ display: "grid", gap: "12px" }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "12px",
              borderRadius: "8px",
              background: "rgba(59, 130, 246, 0.2)",
              border: "1px solid rgba(59, 130, 246, 0.3)",
            }}>
              <div style={{ width: "8px", height: "8px", background: "#3b82f6", borderRadius: "50%" }}></div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "14px", fontWeight: "600", color: "#fff" }}>Campaign Deadline</div>
                <div style={{ fontSize: "12px", color: "#a0a0a0" }}>Summer Collection Launch - Aug 15</div>
              </div>
            </div>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "12px",
              borderRadius: "8px",
              background: "rgba(16, 185, 129, 0.2)",
              border: "1px solid rgba(16, 185, 129, 0.3)",
            }}>
              <div style={{ width: "8px", height: "8px", background: "#10b981", borderRadius: "50%" }}></div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "14px", fontWeight: "600", color: "#fff" }}>Payment Due</div>
                <div style={{ fontSize: "12px", color: "#a0a0a0" }}>Creator Payment - Aug 12</div>
              </div>
            </div>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "12px",
              borderRadius: "8px",
              background: "rgba(245, 158, 11, 0.2)",
              border: "1px solid rgba(245, 158, 11, 0.3)",
            }}>
              <div style={{ width: "8px", height: "8px", background: "#f59e0b", borderRadius: "50%" }}></div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "14px", fontWeight: "600", color: "#fff" }}>Content Review</div>
                <div style={{ fontSize: "12px", color: "#a0a0a0" }}>Tech Review Video - Aug 14</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Components */}
      
      {/* Campaigns Modal */}
      {campaignsModalOpen && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0, 0, 0, 0.8)",
          backdropFilter: "blur(8px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
        }}>
          <div style={{
            background: "rgba(26, 26, 26, 0.95)",
            backdropFilter: "blur(20px)",
            borderRadius: "20px",
            padding: "32px",
            maxWidth: "800px",
            width: "90%",
            maxHeight: "80vh",
            overflow: "auto",
            border: "1px solid rgba(42, 42, 42, 0.6)",
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
              <h2 style={{ fontSize: "24px", fontWeight: "700", color: "#fff" }}>All Campaigns</h2>
              <button 
                onClick={() => setCampaignsModalOpen(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#a0a0a0",
                  cursor: "pointer",
                  fontSize: "24px",
                  padding: "4px",
                }}
              >
                ×
              </button>
            </div>
            <div style={{ display: "grid", gap: "16px" }}>
              {data.campaigns.map((campaign) => (
                <div key={campaign.id} style={{
                  background: "rgba(42, 42, 42, 0.6)",
                  borderRadius: "12px",
                  padding: "20px",
                  border: "1px solid rgba(42, 42, 42, 0.8)",
                }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                    <h3 style={{ fontSize: "18px", fontWeight: "600", color: "#fff" }}>{campaign.name}</h3>
                    <span style={{
                      padding: "4px 12px",
                      borderRadius: "20px",
                      fontSize: "12px",
                      fontWeight: "500",
                      background: campaign.status === "active" ? "rgba(16, 185, 129, 0.2)" : "rgba(245, 158, 11, 0.2)",
                      color: campaign.status === "active" ? "#10b981" : "#f59e0b",
                    }}>
                      {campaign.status}
                    </span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
                    <div>
                      <span style={{ fontSize: "12px", color: "#a0a0a0" }}>Reach:</span>
                      <div style={{ fontSize: "16px", fontWeight: "600", color: "#fff" }}>{campaign.reach}</div>
                    </div>
                    <div>
                      <span style={{ fontSize: "12px", color: "#a0a0a0" }}>Engagement:</span>
                      <div style={{ 
                        fontSize: "16px", 
                        fontWeight: "600", 
                        color: campaign.performance === "excellent" ? "#10b981" : campaign.performance === "good" ? "#3b82f6" : "#f59e0b"
                      }}>
                        {campaign.engagement}%
                      </div>
                    </div>
                    <div>
                      <span style={{ fontSize: "12px", color: "#a0a0a0" }}>Deadline:</span>
                      <div style={{ fontSize: "16px", fontWeight: "600", color: "#fff" }}>
                        {new Date(campaign.deadline).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Creators Modal */}
      {creatorsModalOpen && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0, 0, 0, 0.8)",
          backdropFilter: "blur(8px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
        }}>
          <div style={{
            background: "rgba(26, 26, 26, 0.95)",
            backdropFilter: "blur(20px)",
            borderRadius: "20px",
            padding: "32px",
            maxWidth: "800px",
            width: "90%",
            maxHeight: "80vh",
            overflow: "auto",
            border: "1px solid rgba(42, 42, 42, 0.6)",
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
              <h2 style={{ fontSize: "24px", fontWeight: "700", color: "#fff" }}>Creator Management</h2>
              <button 
                onClick={() => setCreatorsModalOpen(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#a0a0a0",
                  cursor: "pointer",
                  fontSize: "24px",
                  padding: "4px",
                }}
              >
                ×
              </button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "20px" }}>
              <div style={{
                background: "rgba(11, 0, 207, 0.2)",
                borderRadius: "12px",
                padding: "24px",
                border: "1px solid rgba(11, 0, 207, 0.3)",
              }}>
                <div style={{ fontSize: "32px", fontWeight: "700", color: PRIMARY }}>{data.creators.totalConnected}</div>
                <div style={{ fontSize: "14px", color: "#a0a0a0", marginTop: "8px" }}>Connected Creators</div>
              </div>
              <div style={{
                background: "rgba(245, 158, 11, 0.2)",
                borderRadius: "12px",
                padding: "24px",
                border: "1px solid rgba(245, 158, 11, 0.3)",
              }}>
                <div style={{ fontSize: "32px", fontWeight: "700", color: "#f59e0b" }}>{data.creators.pendingApplications}</div>
                <div style={{ fontSize: "14px", color: "#a0a0a0", marginTop: "8px" }}>Pending Applications</div>
              </div>
              <div style={{
                background: "rgba(16, 185, 129, 0.2)",
                borderRadius: "12px",
                padding: "24px",
                border: "1px solid rgba(16, 185, 129, 0.3)",
              }}>
                <div style={{ fontSize: "32px", fontWeight: "700", color: "#10b981" }}>{data.creators.topPerformers}</div>
                <div style={{ fontSize: "14px", color: "#a0a0a0", marginTop: "8px" }}>Top Performers</div>
              </div>
              <div style={{
                background: "rgba(147, 51, 234, 0.2)",
                borderRadius: "12px",
                padding: "24px",
                border: "1px solid rgba(147, 51, 234, 0.3)",
              }}>
                <div style={{ fontSize: "32px", fontWeight: "700", color: "#9333ea" }}>{data.creators.newRecommendations}</div>
                <div style={{ fontSize: "14px", color: "#a0a0a0", marginTop: "8px" }}>New Recommendations</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payments Modal */}
      {paymentsModalOpen && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0, 0, 0, 0.8)",
          backdropFilter: "blur(8px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
        }}>
          <div style={{
            background: "rgba(26, 26, 26, 0.95)",
            backdropFilter: "blur(20px)",
            borderRadius: "20px",
            padding: "32px",
            maxWidth: "800px",
            width: "90%",
            maxHeight: "80vh",
            overflow: "auto",
            border: "1px solid rgba(42, 42, 42, 0.6)",
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
              <h2 style={{ fontSize: "24px", fontWeight: "700", color: "#fff" }}>Financial Overview</h2>
              <button 
                onClick={() => setPaymentsModalOpen(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#a0a0a0",
                  cursor: "pointer",
                  fontSize: "24px",
                  padding: "4px",
                }}
              >
                ×
              </button>
            </div>
            <div style={{ display: "grid", gap: "16px" }}>
              <div style={{
                background: "rgba(16, 185, 129, 0.2)",
                borderRadius: "12px",
                padding: "20px",
                border: "1px solid rgba(16, 185, 129, 0.3)",
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontSize: "14px", color: "#a0a0a0" }}>Monthly Spend</div>
                    <div style={{ fontSize: "24px", fontWeight: "700", color: "#10b981" }}>
                      ${data.financial.monthlySpend.toLocaleString()}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "14px", color: "#a0a0a0" }}>vs Last Month</div>
                    <div style={{ fontSize: "16px", fontWeight: "600", color: "#10b981" }}>+8%</div>
                  </div>
                </div>
              </div>
              <div style={{
                background: "rgba(245, 158, 11, 0.2)",
                borderRadius: "12px",
                padding: "20px",
                border: "1px solid rgba(245, 158, 11, 0.3)",
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontSize: "14px", color: "#a0a0a0" }}>Pending Payments</div>
                    <div style={{ fontSize: "24px", fontWeight: "700", color: "#f59e0b" }}>
                      ${data.financial.pendingPayments.toLocaleString()}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "14px", color: "#a0a0a0" }}>Due This Week</div>
                    <div style={{ fontSize: "16px", fontWeight: "600", color: "#f59e0b" }}>3 payments</div>
                  </div>
                </div>
              </div>
              <div style={{
                background: "rgba(11, 0, 207, 0.2)",
                borderRadius: "12px",
                padding: "20px",
                border: "1px solid rgba(11, 0, 207, 0.3)",
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontSize: "14px", color: "#a0a0a0" }}>Budget Utilization</div>
                    <div style={{ fontSize: "24px", fontWeight: "700", color: PRIMARY }}>
                      {data.financial.budgetUtilization}%
                    </div>
                  </div>
                  <div style={{ width: "100px", background: "rgba(42, 42, 42, 0.6)", borderRadius: "10px", height: "8px" }}>
                    <div style={{ 
                      background: PRIMARY, 
                      height: "8px", 
                      borderRadius: "10px",
                      width: `${data.financial.budgetUtilization}%`
                    }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Modal */}
      {analyticsModalOpen && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0, 0, 0, 0.8)",
          backdropFilter: "blur(8px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
        }}>
          <div style={{
            background: "rgba(26, 26, 26, 0.95)",
            backdropFilter: "blur(20px)",
            borderRadius: "20px",
            padding: "32px",
            maxWidth: "800px",
            width: "90%",
            maxHeight: "80vh",
            overflow: "auto",
            border: "1px solid rgba(42, 42, 42, 0.6)",
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
              <h2 style={{ fontSize: "24px", fontWeight: "700", color: "#fff" }}>Analytics & Insights</h2>
              <button 
                onClick={() => setAnalyticsModalOpen(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#a0a0a0",
                  cursor: "pointer",
                  fontSize: "24px",
                  padding: "4px",
                }}
              >
                ×
              </button>
            </div>
            <div style={{ display: "grid", gap: "16px" }}>
              <div style={{
                background: "rgba(147, 51, 234, 0.2)",
                borderRadius: "12px",
                padding: "20px",
                border: "1px solid rgba(147, 51, 234, 0.3)",
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontSize: "14px", color: "#a0a0a0" }}>Audience Growth</div>
                    <div style={{ fontSize: "24px", fontWeight: "700", color: "#9333ea" }}>
                      +{data.analytics.audienceGrowth}%
                    </div>
                  </div>
                  <TrendingUp size={32} style={{ color: "#9333ea" }} />
                </div>
              </div>
              <div style={{
                background: "rgba(99, 102, 241, 0.2)",
                borderRadius: "12px",
                padding: "20px",
                border: "1px solid rgba(99, 102, 241, 0.3)",
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontSize: "14px", color: "#a0a0a0" }}>Best Content Type</div>
                    <div style={{ fontSize: "24px", fontWeight: "700", color: "#6366f1" }}>
                      {data.analytics.bestContentType}
                    </div>
                  </div>
                  <Zap size={32} style={{ color: "#6366f1" }} />
                </div>
              </div>
              <div style={{
                background: "rgba(16, 185, 129, 0.2)",
                borderRadius: "12px",
                padding: "20px",
                border: "1px solid rgba(16, 185, 129, 0.3)",
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontSize: "14px", color: "#a0a0a0" }}>Top Market</div>
                    <div style={{ fontSize: "24px", fontWeight: "700", color: "#10b981" }}>
                      {data.analytics.topGeographicMarket}
                    </div>
                  </div>
                  <MapPin size={32} style={{ color: "#10b981" }} />
                </div>
              </div>
              <div style={{
                background: "rgba(239, 68, 68, 0.2)",
                borderRadius: "12px",
                padding: "20px",
                border: "1px solid rgba(239, 68, 68, 0.3)",
              }}>
                <div>
                  <div style={{ fontSize: "14px", color: "#a0a0a0", marginBottom: "8px" }}>Trending Topics</div>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {data.analytics.trendingTopics.map((topic, index) => (
                      <span key={index} style={{
                        background: "rgba(239, 68, 68, 0.3)",
                        color: "#ef4444",
                        padding: "4px 12px",
                        borderRadius: "20px",
                        fontSize: "12px",
                        fontWeight: "500",
                      }}>
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Modal */}
      {notificationsModalOpen && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0, 0, 0, 0.8)",
          backdropFilter: "blur(8px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
        }}>
          <div style={{
            background: "rgba(26, 26, 26, 0.95)",
            backdropFilter: "blur(20px)",
            borderRadius: "20px",
            padding: "32px",
            maxWidth: "800px",
            width: "90%",
            maxHeight: "80vh",
            overflow: "auto",
            border: "1px solid rgba(42, 42, 42, 0.6)",
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
              <h2 style={{ fontSize: "24px", fontWeight: "700", color: "#fff" }}>All Notifications</h2>
              <button 
                onClick={() => setNotificationsModalOpen(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#a0a0a0",
                  cursor: "pointer",
                  fontSize: "24px",
                  padding: "4px",
                }}
              >
                ×
              </button>
            </div>
            <div style={{ display: "grid", gap: "16px" }}>
              {data.notifications.map((notification) => (
                <div key={notification.id} style={{
                  background: "rgba(42, 42, 42, 0.6)",
                  borderRadius: "12px",
                  padding: "20px",
                  border: "1px solid rgba(42, 42, 42, 0.8)",
                }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                    <div style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      marginTop: "6px",
                      background: notification.type === 'urgent' ? '#ef4444' : 
                                notification.type === 'alert' ? '#f59e0b' : '#3b82f6'
                    }}></div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "16px", fontWeight: "600", color: "#fff", marginBottom: "4px" }}>
                        {notification.message}
                      </div>
                      <div style={{ fontSize: "14px", color: "#a0a0a0" }}>
                        {notification.time}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardOverview; 