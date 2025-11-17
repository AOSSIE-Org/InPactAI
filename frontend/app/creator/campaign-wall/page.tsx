"use client";

import AuthGuard from "@/components/auth/AuthGuard";
import SlidingMenu from "@/components/SlidingMenu";
import {
  fetchPublicCampaigns,
  fetchCampaignRecommendations,
  createCampaignApplication,
  fetchCreatorApplications,
  type CampaignApplication,
  type CampaignApplicationCreate,
} from "@/lib/api/campaignWall";
import { createProposal } from "@/lib/api/proposals";
import { Campaign, PLATFORM_OPTIONS, NICHE_OPTIONS } from "@/types/campaign";
import {
  Search,
  Filter,
  Sparkles,
  DollarSign,
  Calendar,
  Users,
  Target,
  Check,
  Clock,
  X,
  Send,
  Loader2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { formatCurrency, formatDate } from "@/lib/campaignApi";

export default function CampaignWallPage() {
  const [activeTab, setActiveTab] = useState<"browse" | "my-applications">("browse");
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [myApplications, setMyApplications] = useState<CampaignApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingApplications, setLoadingApplications] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [platformFilter, setPlatformFilter] = useState<string>("");
  const [nicheFilter, setNicheFilter] = useState<string>("");
  const [budgetMin, setBudgetMin] = useState<string>("");
  const [budgetMax, setBudgetMax] = useState<string>("");
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [submittingApplication, setSubmittingApplication] = useState(false);
  const [applicationData, setApplicationData] = useState<CampaignApplicationCreate>({
    payment_min: undefined,
    payment_max: undefined,
    timeline_days: undefined,
    timeline_weeks: undefined,
    description: "",
  });
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<CampaignApplication | null>(null);
  const [submittingProposal, setSubmittingProposal] = useState(false);
  const [proposalData, setProposalData] = useState({
    subject: "",
    message: "",
    proposed_amount: "",
    content_ideas: "",
    ideal_pricing: "",
  });

  useEffect(() => {
    if (activeTab === "browse") {
      loadCampaigns();
    } else {
      loadMyApplications();
    }
  }, [activeTab]);

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchPublicCampaigns({
        search: searchTerm || undefined,
        platform: platformFilter || undefined,
        niche: nicheFilter || undefined,
        budget_min: budgetMin ? parseFloat(budgetMin) : undefined,
        budget_max: budgetMax ? parseFloat(budgetMax) : undefined,
      });
      setCampaigns(data);
    } catch (err: any) {
      setError(err.message || "Failed to load campaigns");
    } finally {
      setLoading(false);
    }
  };

  const loadMyApplications = async () => {
    try {
      setLoadingApplications(true);
      setError(null);
      const data = await fetchCreatorApplications();
      setMyApplications(data);
    } catch (err: any) {
      setError(err.message || "Failed to load applications");
    } finally {
      setLoadingApplications(false);
    }
  };

  const loadRecommendations = async () => {
    try {
      setLoadingRecommendations(true);
      setError(null);
      const data = await fetchCampaignRecommendations({ limit: 20, use_ai: true });
      setCampaigns(data);
    } catch (err: any) {
      setError(err.message || "Failed to load recommendations");
    } finally {
      setLoadingRecommendations(false);
    }
  };

  const handleSearch = () => {
    loadCampaigns();
  };

  const handleOpenApplicationModal = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setApplicationData({
      payment_min: campaign.budget_min || undefined,
      payment_max: campaign.budget_max || undefined,
      timeline_days: undefined,
      timeline_weeks: undefined,
      description: "",
    });
    setShowApplicationModal(true);
  };

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCampaign || !applicationData.description.trim()) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      setSubmittingApplication(true);
      setError(null);
      await createCampaignApplication(selectedCampaign.id, applicationData);
      alert("Application submitted successfully!");
      setShowApplicationModal(false);
      setSelectedCampaign(null);
      setApplicationData({
        payment_min: undefined,
        payment_max: undefined,
        timeline_days: undefined,
        timeline_weeks: undefined,
        description: "",
      });
      // Reload campaigns to update applied status
      await loadCampaigns();
      await loadMyApplications();
    } catch (err: any) {
      setError(err.message || "Failed to submit application");
      alert(err.message || "Failed to submit application");
    } finally {
      setSubmittingApplication(false);
    }
  };

  const handleOpenProposalModal = (app: CampaignApplication) => {
    setSelectedApplication(app);
    setProposalData({
      subject: `Proposal for ${app.campaign_title || "Campaign"}`,
      message: app.description || "",
      proposed_amount: app.payment_max?.toString() || app.payment_min?.toString() || "",
      content_ideas: "",
      ideal_pricing: "",
    });
    setShowProposalModal(true);
  };

  const handleSubmitProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApplication || !proposalData.message.trim()) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      setSubmittingProposal(true);
      setError(null);

      // Use the standard proposal creation endpoint
      await createProposal({
        campaign_id: selectedApplication.campaign_id,
        subject: proposalData.subject || `Proposal for ${selectedApplication.campaign_title || "Campaign"}`,
        message: proposalData.message,
        proposed_amount: proposalData.proposed_amount ? parseFloat(proposalData.proposed_amount) : undefined,
        content_ideas: proposalData.content_ideas ? [proposalData.content_ideas] : [],
        ideal_pricing: proposalData.ideal_pricing || undefined,
      });

      alert("Proposal sent successfully!");
      setShowProposalModal(false);
      setSelectedApplication(null);
      setProposalData({
        subject: "",
        message: "",
        proposed_amount: "",
        content_ideas: "",
        ideal_pricing: "",
      });
      // Reload applications
      await loadMyApplications();
    } catch (err: any) {
      setError(err.message || "Failed to send proposal");
      alert(err.message || "Failed to send proposal");
    } finally {
      setSubmittingProposal(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "accepted":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "reviewing":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  const hasApplied = (campaignId: string) => {
    return myApplications.some((app) => app.campaign_id === campaignId);
  };

  return (
    <AuthGuard requiredRole="Creator">
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
        <SlidingMenu role="creator" />

        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Campaign Wall</h1>
            <p className="mt-1 text-gray-600">Browse and apply to open campaigns</p>
          </div>

          {/* Tabs */}
          <div className="mb-6 flex gap-2 border-b border-gray-200">
            <button
              onClick={() => setActiveTab("browse")}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "browse"
                  ? "border-purple-600 text-purple-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Browse Campaigns
            </button>
            <button
              onClick={() => setActiveTab("my-applications")}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "my-applications"
                  ? "border-purple-600 text-purple-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              My Applications ({myApplications.length})
            </button>
          </div>

          {/* Browse Tab */}
          {activeTab === "browse" && (
            <>
              {/* Search and Filters */}
              <div className="mb-6 flex flex-col flex-wrap gap-4 rounded-xl bg-white p-6 shadow-md sm:flex-row">
                <div className="min-w-[200px] flex-1">
                  <div className="relative">
                    <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search campaigns..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                      className="w-full rounded-lg border border-gray-300 py-3 pr-4 pl-10 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none"
                    />
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <div className="relative">
                    <Filter className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <select
                      value={platformFilter}
                      onChange={(e) => setPlatformFilter(e.target.value)}
                      className="min-w-[120px] appearance-none rounded-lg border border-gray-300 py-3 pr-10 pl-10 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none"
                    >
                      <option value="">All Platforms</option>
                      {PLATFORM_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                  <select
                    value={nicheFilter}
                    onChange={(e) => setNicheFilter(e.target.value)}
                    className="min-w-[120px] appearance-none rounded-lg border border-gray-300 py-3 pr-10 pl-4 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none"
                  >
                    <option value="">All Niches</option>
                    {NICHE_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    placeholder="Min Budget"
                    value={budgetMin}
                    onChange={(e) => setBudgetMin(e.target.value)}
                    className="w-28 rounded-lg border border-gray-300 px-3 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none"
                    min={0}
                  />
                  <input
                    type="number"
                    placeholder="Max Budget"
                    value={budgetMax}
                    onChange={(e) => setBudgetMax(e.target.value)}
                    className="w-28 rounded-lg border border-gray-300 px-3 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none"
                    min={0}
                  />
                  <button
                    onClick={handleSearch}
                    className="rounded-lg bg-purple-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-purple-600"
                  >
                    Search
                  </button>
                  <button
                    onClick={loadRecommendations}
                    disabled={loadingRecommendations}
                    className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 px-6 py-3 font-semibold text-white transition-colors hover:from-purple-600 hover:to-blue-600 disabled:opacity-50"
                  >
                    {loadingRecommendations ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4" />
                    )}
                    AI Recommendations
                  </button>
                </div>
              </div>

              {/* Error State */}
              {error && (
                <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4 text-red-800">
                  {error}
                </div>
              )}

              {/* Loading State */}
              {loading && (
                <div className="py-12 text-center">
                  <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-purple-600"></div>
                  <p className="mt-4 text-gray-600">Loading campaigns...</p>
                </div>
              )}

              {/* Campaigns Grid */}
              {!loading && campaigns.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {campaigns.map((campaign) => {
                    const applied = hasApplied(campaign.id);
                    return (
                      <div
                        key={campaign.id}
                        className="overflow-hidden rounded-xl bg-white shadow-md transition-all hover:shadow-lg"
                      >
                        <div className="p-6">
                          <div className="mb-3 flex items-start justify-between">
                            <h3 className="text-xl font-bold text-gray-900 flex-1">{campaign.title}</h3>
                            {applied && (
                              <span className="ml-2 rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-800">
                                Applied
                              </span>
                            )}
                          </div>
                          {campaign.short_description && (
                            <p className="mb-4 text-sm text-gray-600 line-clamp-2">{campaign.short_description}</p>
                          )}
                          <div className="space-y-2 text-sm text-gray-600 mb-4">
                            {campaign.budget_min && campaign.budget_max && (
                              <div className="flex items-center gap-1">
                                <DollarSign className="h-4 w-4" />
                                <span>
                                  {formatCurrency(campaign.budget_min)} - {formatCurrency(campaign.budget_max)}
                                </span>
                              </div>
                            )}
                            {campaign.platforms.length > 0 && (
                              <div className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                <span>{campaign.platforms.join(", ")}</span>
                              </div>
                            )}
                            {campaign.preferred_creator_niches.length > 0 && (
                              <div className="flex items-center gap-1">
                                <Target className="h-4 w-4" />
                                <span>{campaign.preferred_creator_niches.join(", ")}</span>
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => handleOpenApplicationModal(campaign)}
                            disabled={applied}
                            className={`w-full rounded-lg px-4 py-2 font-semibold text-white transition-colors ${
                              applied
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
                            }`}
                          >
                            {applied ? "Already Applied" : "Apply Now"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Empty State */}
              {!loading && campaigns.length === 0 && (
                <div className="rounded-xl bg-white p-12 text-center shadow-md">
                  <Target className="mx-auto mb-4 h-16 w-16 text-gray-400" />
                  <h3 className="mb-2 text-xl font-semibold text-gray-900">No campaigns found</h3>
                  <p className="text-gray-600">Try adjusting your filters or check back later</p>
                </div>
              )}
            </>
          )}

          {/* My Applications Tab */}
          {activeTab === "my-applications" && (
            <>
              {loadingApplications ? (
                <div className="py-12 text-center">
                  <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-purple-600"></div>
                  <p className="mt-4 text-gray-600">Loading applications...</p>
                </div>
              ) : myApplications.length > 0 ? (
                <div className="space-y-4">
                  {myApplications.map((app) => (
                    <div key={app.id} className="rounded-xl bg-white shadow-md p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 mb-2">{app.campaign_title || "Campaign"}</h3>
                          <p className="text-sm text-gray-600">
                            Applied on {new Date(app.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(app.status)}`}>
                          {app.status}
                        </span>
                      </div>
                      {app.description && (
                        <p className="text-sm text-gray-700 mb-4">{app.description}</p>
                      )}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        {app.payment_min && app.payment_max && (
                          <div>
                            <span className="text-gray-500">Payment: </span>
                            <span className="font-medium">
                              ₹{app.payment_min.toLocaleString()} - ₹{app.payment_max.toLocaleString()}
                            </span>
                          </div>
                        )}
                        {app.timeline_days && (
                          <div>
                            <span className="text-gray-500">Timeline: </span>
                            <span className="font-medium">{app.timeline_days} days</span>
                          </div>
                        )}
                        {app.timeline_weeks && (
                          <div>
                            <span className="text-gray-500">Timeline: </span>
                            <span className="font-medium">{app.timeline_weeks} weeks</span>
                          </div>
                        )}
                      </div>
                      {app.status === "accepted" && (
                        <div className="mt-4">
                          <button
                            onClick={() => handleOpenProposalModal(app)}
                            className="w-full rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 px-4 py-2 font-semibold text-white transition-colors hover:from-purple-600 hover:to-purple-700"
                          >
                            Create & Send Proposal
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl bg-white p-12 text-center shadow-md">
                  <Send className="mx-auto mb-4 h-16 w-16 text-gray-400" />
                  <h3 className="mb-2 text-xl font-semibold text-gray-900">No applications yet</h3>
                  <p className="text-gray-600">Start applying to campaigns to see them here</p>
                </div>
              )}
            </>
          )}

          {/* Application Modal */}
          {showApplicationModal && selectedCampaign && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
              <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-900">Apply to Campaign</h2>
                  <p className="mt-1 text-gray-600">{selectedCampaign.title}</p>
                </div>
                <form onSubmit={handleSubmitApplication} className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Payment Range (INR) *
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="number"
                        placeholder="Min"
                        value={applicationData.payment_min || ""}
                        onChange={(e) =>
                          setApplicationData({
                            ...applicationData,
                            payment_min: e.target.value ? parseFloat(e.target.value) : undefined,
                          })
                        }
                        className="rounded-lg border border-gray-300 px-3 py-2 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none"
                        min={0}
                      />
                      <input
                        type="number"
                        placeholder="Max"
                        value={applicationData.payment_max || ""}
                        onChange={(e) =>
                          setApplicationData({
                            ...applicationData,
                            payment_max: e.target.value ? parseFloat(e.target.value) : undefined,
                          })
                        }
                        className="rounded-lg border border-gray-300 px-3 py-2 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none"
                        min={0}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Timeline *
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="number"
                        placeholder="Days"
                        value={applicationData.timeline_days || ""}
                        onChange={(e) =>
                          setApplicationData({
                            ...applicationData,
                            timeline_days: e.target.value ? parseInt(e.target.value) : undefined,
                            timeline_weeks: undefined,
                          })
                        }
                        className="rounded-lg border border-gray-300 px-3 py-2 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none"
                        min={1}
                      />
                      <input
                        type="number"
                        placeholder="Weeks"
                        value={applicationData.timeline_weeks || ""}
                        onChange={(e) =>
                          setApplicationData({
                            ...applicationData,
                            timeline_weeks: e.target.value ? parseInt(e.target.value) : undefined,
                            timeline_days: undefined,
                          })
                        }
                        className="rounded-lg border border-gray-300 px-3 py-2 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none"
                        min={1}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Why should you be chosen? *
                    </label>
                    <textarea
                      value={applicationData.description}
                      onChange={(e) =>
                        setApplicationData({ ...applicationData, description: e.target.value })
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none"
                      rows={6}
                      placeholder="Describe your experience, why you're a good fit, and any relevant details..."
                      required
                    />
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      disabled={submittingApplication}
                      className="flex-1 rounded-lg bg-purple-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-purple-700 disabled:opacity-50"
                    >
                      {submittingApplication ? "Submitting..." : "Submit Application"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowApplicationModal(false);
                        setSelectedCampaign(null);
                      }}
                      className="rounded-lg border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Proposal Modal */}
          {showProposalModal && selectedApplication && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
              <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-900">Create Proposal</h2>
                  <p className="mt-1 text-gray-600">Send a proposal for {selectedApplication.campaign_title || "Campaign"}</p>
                </div>
                <form onSubmit={handleSubmitProposal} className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Subject *
                    </label>
                    <input
                      type="text"
                      value={proposalData.subject}
                      onChange={(e) => setProposalData({ ...proposalData, subject: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none"
                      required
                      placeholder="Proposal subject..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Message *
                    </label>
                    <textarea
                      value={proposalData.message}
                      onChange={(e) => setProposalData({ ...proposalData, message: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none"
                      rows={6}
                      placeholder="Write your proposal message..."
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Proposed Amount (INR)
                    </label>
                    <input
                      type="number"
                      value={proposalData.proposed_amount}
                      onChange={(e) => setProposalData({ ...proposalData, proposed_amount: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none"
                      placeholder="Amount"
                      min={0}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Content Ideas
                    </label>
                    <textarea
                      value={proposalData.content_ideas}
                      onChange={(e) => setProposalData({ ...proposalData, content_ideas: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none"
                      rows={3}
                      placeholder="Describe your content ideas..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ideal Pricing
                    </label>
                    <input
                      type="text"
                      value={proposalData.ideal_pricing}
                      onChange={(e) => setProposalData({ ...proposalData, ideal_pricing: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none"
                      placeholder="Describe your ideal pricing structure..."
                    />
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      disabled={submittingProposal}
                      className="flex-1 rounded-lg bg-purple-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-purple-700 disabled:opacity-50"
                    >
                      {submittingProposal ? "Sending..." : "Send Proposal"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowProposalModal(false);
                        setSelectedApplication(null);
                      }}
                      className="rounded-lg border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </AuthGuard>
  );
}

