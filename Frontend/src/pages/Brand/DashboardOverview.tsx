import React from "react";
import { useNavigate } from "react-router-dom";
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
  ArrowLeft
} from "lucide-react";

const DashboardOverview = () => {
  const navigate = useNavigate();
  
  // Mock data for demonstration
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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
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

      {/* Key Performance Metrics */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          Key Performance Metrics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-sm text-gray-500">Active Campaigns</span>
            </div>
            <div className="text-3xl font-bold text-gray-900">{mockData.kpis.activeCampaigns}</div>
            <div className="flex items-center mt-2 text-green-600">
              <ArrowUpRight className="w-4 h-4 mr-1" />
              <span className="text-sm">+2 from last month</span>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <Eye className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-sm text-gray-500">Total Reach</span>
            </div>
            <div className="text-3xl font-bold text-gray-900">{mockData.kpis.totalReach}</div>
            <div className="flex items-center mt-2 text-green-600">
              <ArrowUpRight className="w-4 h-4 mr-1" />
              <span className="text-sm">+15% from last month</span>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-sm text-gray-500">Engagement Rate</span>
            </div>
            <div className="text-3xl font-bold text-gray-900">{mockData.kpis.engagementRate}%</div>
            <div className="flex items-center mt-2 text-green-600">
              <ArrowUpRight className="w-4 h-4 mr-1" />
              <span className="text-sm">+0.3% from last month</span>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-yellow-600" />
              </div>
              <span className="text-sm text-gray-500">ROI</span>
            </div>
            <div className="text-3xl font-bold text-gray-900">{mockData.kpis.roi}%</div>
            <div className="flex items-center mt-2 text-green-600">
              <ArrowUpRight className="w-4 h-4 mr-1" />
              <span className="text-sm">+25% from last month</span>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-red-600" />
              </div>
              <span className="text-sm text-gray-500">Budget Spent</span>
            </div>
            <div className="text-3xl font-bold text-gray-900">${mockData.kpis.budgetSpent.toLocaleString()}</div>
            <div className="flex items-center mt-2 text-blue-600">
              <span className="text-sm">{mockData.kpis.budgetUtilization}% of allocated budget</span>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Target className="w-6 h-6 text-indigo-600" />
              </div>
              <span className="text-sm text-gray-500">Cost per Engagement</span>
            </div>
            <div className="text-3xl font-bold text-gray-900">${mockData.financial.costPerEngagement}</div>
            <div className="flex items-center mt-2 text-green-600">
              <ArrowDownRight className="w-4 h-4 mr-1" />
              <span className="text-sm">-12% from last month</span>
            </div>
          </div>
        </div>
      </div>

      {/* Campaign Overview & Creator Management */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Campaign Overview */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Recent Campaigns
            </h3>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">View All</button>
          </div>
          <div className="space-y-4">
            {mockData.campaigns.map((campaign) => (
              <div key={campaign.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{campaign.name}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                    {campaign.status}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Reach:</span>
                    <div className="font-medium">{campaign.reach}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Engagement:</span>
                    <div className={`font-medium ${getPerformanceColor(campaign.performance)}`}>
                      {campaign.engagement}%
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500">Deadline:</span>
                    <div className="font-medium">{new Date(campaign.deadline).toLocaleDateString()}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Creator Management */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-green-600" />
              Creator Management
            </h3>
            <button className="text-green-600 hover:text-green-700 text-sm font-medium">View All</button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600">{mockData.creators.totalConnected}</div>
              <div className="text-sm text-gray-600">Connected Creators</div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-yellow-600">{mockData.creators.pendingApplications}</div>
              <div className="text-sm text-gray-600">Pending Applications</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-600">{mockData.creators.topPerformers}</div>
              <div className="text-sm text-gray-600">Top Performers</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-purple-600">{mockData.creators.newRecommendations}</div>
              <div className="text-sm text-gray-600">New Recommendations</div>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Overview & Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Financial Overview */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            Financial Overview
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div>
                <div className="text-sm text-gray-600">Monthly Spend</div>
                <div className="text-2xl font-bold text-green-600">${mockData.financial.monthlySpend.toLocaleString()}</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600">vs Last Month</div>
                <div className="text-green-600 font-medium">+8%</div>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
              <div>
                <div className="text-sm text-gray-600">Pending Payments</div>
                <div className="text-2xl font-bold text-yellow-600">${mockData.financial.pendingPayments.toLocaleString()}</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600">Due This Week</div>
                <div className="text-yellow-600 font-medium">3 payments</div>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div>
                <div className="text-sm text-gray-600">Budget Utilization</div>
                <div className="text-2xl font-bold text-blue-600">{mockData.financial.budgetUtilization}%</div>
              </div>
              <div className="w-24 bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${mockData.financial.budgetUtilization}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Analytics & Insights */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-600" />
            Analytics & Insights
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
              <div>
                <div className="text-sm text-gray-600">Audience Growth</div>
                <div className="text-2xl font-bold text-purple-600">+{mockData.analytics.audienceGrowth}%</div>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
            <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-lg">
              <div>
                <div className="text-sm text-gray-600">Best Content Type</div>
                <div className="text-2xl font-bold text-indigo-600">{mockData.analytics.bestContentType}</div>
              </div>
              <Zap className="w-8 h-8 text-indigo-600" />
            </div>
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div>
                <div className="text-sm text-gray-600">Top Market</div>
                <div className="text-2xl font-bold text-green-600">{mockData.analytics.topGeographicMarket}</div>
              </div>
              <MapPin className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Notifications & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Notifications */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            Notifications
          </h3>
          <div className="space-y-3">
            {mockData.notifications.map((notification) => (
              <div key={notification.id} className="flex items-start gap-3 p-3 rounded-lg border border-gray-200">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  notification.type === 'urgent' ? 'bg-red-500' : 
                  notification.type === 'alert' ? 'bg-yellow-500' : 'bg-blue-500'
                }`}></div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">{notification.message}</div>
                  <div className="text-xs text-gray-500">{notification.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <Zap className="w-5 h-5 text-orange-600" />
            Quick Actions
          </h3>
          <div className="space-y-3">
            <button className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-blue-50 hover:border-blue-300 transition-colors">
              <Plus className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium">Create New Campaign</span>
            </button>
            <button className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-green-50 hover:border-green-300 transition-colors">
              <Search className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium">Find Creators</span>
            </button>
            <button className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-purple-50 hover:border-purple-300 transition-colors">
              <BarChart3 className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium">View Analytics</span>
            </button>
            <button className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-yellow-50 hover:border-yellow-300 transition-colors">
              <FileText className="w-5 h-5 text-yellow-600" />
              <span className="text-sm font-medium">Draft Contract</span>
            </button>
          </div>
        </div>

        {/* Timeline View */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-600" />
            This Week
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <div className="text-sm font-medium">Campaign Deadline</div>
                <div className="text-xs text-gray-500">Summer Collection Launch - Aug 15</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <div className="text-sm font-medium">Payment Due</div>
                <div className="text-xs text-gray-500">Creator Payment - Aug 12</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-yellow-50">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <div className="flex-1">
                <div className="text-sm font-medium">Content Review</div>
                <div className="text-xs text-gray-500">Tech Review Video - Aug 14</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview; 