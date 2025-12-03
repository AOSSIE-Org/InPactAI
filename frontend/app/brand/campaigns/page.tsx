"use client";

import AuthGuard from "@/components/auth/AuthGuard";
import SlidingMenu from "@/components/SlidingMenu";
import {
  fetchCampaigns,
  formatCurrency,
  formatDate,
  getStatusColor,
} from "@/lib/campaignApi";
import {
  Campaign,
  CampaignStatus,
  PLATFORM_OPTIONS,
  STATUS_OPTIONS,
} from "@/types/campaign";
import {
  Calendar,
  ChevronDown,
  ChevronUp,
  DollarSign,
  Filter,
  Plus,
  Search,
  Target,
  Users,
  Check,
  X,
  Clock,
  UserCheck,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { updateCampaign } from "@/lib/campaignApi";
import {
  fetchCampaignApplications,
  updateApplicationStatus,
  type CampaignApplication,
} from "@/lib/api/campaignWall";

export default function CampaignsPage() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<CampaignStatus | "">("");
  const [platformFilter, setPlatformFilter] = useState<string>("");
  const [budgetMin, setBudgetMin] = useState<string>("");
  const [budgetMax, setBudgetMax] = useState<string>("");
  const [startsAfter, setStartsAfter] = useState<string>("");
  const [endsBefore, setEndsBefore] = useState<string>("");
  const [expandedCampaign, setExpandedCampaign] = useState<string | null>(null);
  const [openCampaignsFilter, setOpenCampaignsFilter] = useState<boolean>(false);
  const [applications, setApplications] = useState<Record<string, CampaignApplication[]>>({});
  const [loadingApplications, setLoadingApplications] = useState<Record<string, boolean>>({});
  const [updatingCampaign, setUpdatingCampaign] = useState<string | null>(null);

  useEffect(() => {
    loadCampaigns();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    statusFilter,
    platformFilter,
    budgetMin,
    budgetMax,
    startsAfter,
    endsBefore,
  ]);

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      setError(null);
      const filters = {
        status: statusFilter || undefined,
        search: searchTerm || undefined,
        platform: platformFilter || undefined,
        budget_min: budgetMin ? parseFloat(budgetMin) : undefined,
        budget_max: budgetMax ? parseFloat(budgetMax) : undefined,
        starts_after: startsAfter || undefined,
        ends_before: endsBefore || undefined,
      };
      const data = await fetchCampaigns(filters);
      setCampaigns(data);
    } catch (err: any) {
      setError(err.message || "Failed to load campaigns");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    loadCampaigns();
  };

  const toggleExpand = async (campaignId: string) => {
    if (expandedCampaign === campaignId) {
      setExpandedCampaign(null);
    } else {
      setExpandedCampaign(campaignId);
      // Load applications when expanding
      await loadApplications(campaignId);
    }
  };

  const loadApplications = async (campaignId: string) => {
    if (loadingApplications[campaignId]) return;
    try {
      setLoadingApplications((prev) => ({ ...prev, [campaignId]: true }));
      const apps = await fetchCampaignApplications(campaignId);
      setApplications((prev) => ({ ...prev, [campaignId]: apps }));
    } catch (err: any) {
      console.error("Failed to load applications:", err);
      setError(err.message || "Failed to load applications");
    } finally {
      setLoadingApplications((prev) => ({ ...prev, [campaignId]: false }));
    }
  };

  const handleToggleCampaignWall = async (campaign: Campaign, field: "is_open_for_applications" | "is_on_campaign_wall") => {
    try {
      setUpdatingCampaign(campaign.id);
      const newValue = !campaign[field];
      await updateCampaign(campaign.id, { [field]: newValue });
      // Reload campaigns to reflect changes
      await loadCampaigns();
    } catch (err: any) {
      console.error("Failed to update campaign:", err);
      setError(err.message || "Failed to update campaign");
    } finally {
      setUpdatingCampaign(null);
    }
  };

  const handleApplicationStatusChange = async (
    campaignId: string,
    applicationId: string,
    newStatus: "reviewing" | "accepted" | "rejected"
  ) => {
    try {
      await updateApplicationStatus(campaignId, applicationId, newStatus);
      // Reload applications
      await loadApplications(campaignId);
      if (newStatus === "accepted") {
        alert("Application accepted! You can now create a proposal.");
      }
    } catch (err: any) {
      console.error("Failed to update application status:", err);
      setError(err.message || "Failed to update application status");
    }
  };

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const filteredCampaigns = campaigns.filter((campaign) => {
    // Filter by open campaigns if enabled
    if (openCampaignsFilter && !campaign.is_open_for_applications) {
      return false;
    }
    // Filter by search term
    if (!normalizedSearch) return true;
    return (
      campaign.title.toLowerCase().includes(normalizedSearch) ||
      (campaign.short_description ?? "")
        .toLowerCase()
        .includes(normalizedSearch) ||
      (campaign.description ?? "").toLowerCase().includes(normalizedSearch)
    );
  });

  return (
    <AuthGuard requiredRole="Brand">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <SlidingMenu role="brand" />

        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Campaigns</h1>
              <p className="mt-1 text-gray-600">
                Manage and track all your campaigns
              </p>
            </div>
            <button
              onClick={() => router.push("/brand/campaigns/create")}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:shadow-xl"
            >
              <Plus className="h-5 w-5" />
              Create Campaign
            </button>
          </div>

          {/* Search and Filters */}
          <div className="mb-6 flex flex-col flex-wrap gap-4 rounded-xl bg-white p-6 shadow-md sm:flex-row">
            <div className="min-w-[200px] flex-1">
              <div className="relative">
                <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search campaigns by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  className="w-full rounded-lg border border-gray-300 py-3 pr-4 pl-10 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <div className="relative">
                <Filter className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(e.target.value as CampaignStatus | "")
                  }
                  className="appearance-none rounded-lg border border-gray-300 py-3 pr-10 pl-10 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                >
                  <option value="">All Statuses</option>
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="relative">
                <select
                  value={platformFilter}
                  onChange={(e) => setPlatformFilter(e.target.value)}
                  className="min-w-[120px] appearance-none rounded-lg border border-gray-300 py-3 pr-10 pl-4 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                >
                  <option value="">All Platforms</option>
                  {PLATFORM_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <input
                type="number"
                placeholder="Min Budget"
                value={budgetMin}
                onChange={(e) => setBudgetMin(e.target.value)}
                className="w-28 rounded-lg border border-gray-300 px-3 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                min={0}
              />
              <input
                type="number"
                placeholder="Max Budget"
                value={budgetMax}
                onChange={(e) => setBudgetMax(e.target.value)}
                className="w-28 rounded-lg border border-gray-300 px-3 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                min={0}
              />
              <input
                type="date"
                placeholder="Starts After"
                value={startsAfter}
                onChange={(e) => setStartsAfter(e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
              />
              <input
                type="date"
                placeholder="Ends Before"
                value={endsBefore}
                onChange={(e) => setEndsBefore(e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
              />
              <button
                onClick={handleSearch}
                className="rounded-lg bg-blue-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-600"
              >
                Search
              </button>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={openCampaignsFilter}
                  onChange={(e) => setOpenCampaignsFilter(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-sm font-medium text-gray-700">Open for Applications</span>
              </label>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="py-12 text-center">
              <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-500"></div>
              <p className="mt-4 text-gray-600">Loading campaigns...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="rounded-lg bg-red-50 p-6 text-center">
              <p className="text-red-600">{error}</p>
              <button
                onClick={loadCampaigns}
                className="mt-4 text-blue-600 hover:underline"
              >
                Try again
              </button>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && filteredCampaigns.length === 0 && (
            <div className="rounded-xl bg-white p-12 text-center shadow-md">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                <Target className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-gray-900">
                No campaigns found
              </h3>
              <p className="mb-6 text-gray-600">
                {searchTerm || statusFilter
                  ? "Try adjusting your filters"
                  : "Get started by creating your first campaign"}
              </p>
              {!searchTerm && !statusFilter && (
                <button
                  onClick={() => router.push("/brand/campaigns/create")}
                  className="inline-flex items-center gap-2 rounded-lg bg-purple-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-purple-600"
                >
                  <Plus className="h-5 w-5" />
                  Create Your First Campaign
                </button>
              )}
            </div>
          )}

          {/* Campaigns List */}
          {!loading && !error && filteredCampaigns.length > 0 && (
            <div className="space-y-4">
              {filteredCampaigns.map((campaign) => (
                <div
                  key={campaign.id}
                  className="overflow-hidden rounded-xl bg-white shadow-md transition-all hover:shadow-lg"
                >
                  {/* Campaign Summary */}
                  <div
                    onClick={() => toggleExpand(campaign.id)}
                    className="cursor-pointer p-6 transition-colors hover:bg-gray-50"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="mb-2 flex items-center gap-3">
                          <h3 className="text-xl font-bold text-gray-900">
                            {campaign.title}
                          </h3>
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(
                              campaign.status
                            )}`}
                          >
                            {campaign.status.toUpperCase()}
                          </span>
                        </div>
                        {campaign.short_description && (
                          <p className="mb-4 text-gray-600">
                            {campaign.short_description}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>
                              Created: {formatDate(campaign.created_at)}
                            </span>
                          </div>
                          {campaign.budget_min && campaign.budget_max && (
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4" />
                              <span>
                                {formatCurrency(campaign.budget_min)} -{" "}
                                {formatCurrency(campaign.budget_max)}
                              </span>
                            </div>
                          )}
                          {campaign.platforms.length > 0 && (
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              <span>{campaign.platforms.join(", ")}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <button className="ml-4 text-gray-400 hover:text-gray-600">
                        {expandedCampaign === campaign.id ? (
                          <ChevronUp className="h-6 w-6" />
                        ) : (
                          <ChevronDown className="h-6 w-6" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expandedCampaign === campaign.id && (
                    <div className="border-t border-gray-200 bg-gray-50 p-6">
                      <div className="grid gap-6 md:grid-cols-2">
                        {/* Description */}
                        {campaign.description && (
                          <div className="md:col-span-2">
                            <h4 className="mb-2 font-semibold text-gray-900">
                              Description
                            </h4>
                            <p className="whitespace-pre-line text-gray-700">
                              {campaign.description}
                            </p>
                          </div>
                        )}

                        {/* Dates */}
                        {(campaign.starts_at || campaign.ends_at) && (
                          <div>
                            <h4 className="mb-2 font-semibold text-gray-900">
                              Campaign Duration
                            </h4>
                            <div className="space-y-1 text-gray-700">
                              {campaign.starts_at && (
                                <p>Start: {formatDate(campaign.starts_at)}</p>
                              )}
                              {campaign.ends_at && (
                                <p>End: {formatDate(campaign.ends_at)}</p>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Budget */}
                        {(campaign.budget_min || campaign.budget_max) && (
                          <div>
                            <h4 className="mb-2 font-semibold text-gray-900">
                              Budget Range
                            </h4>
                            <p className="text-gray-700">
                              {campaign.budget_min &&
                                formatCurrency(campaign.budget_min)}
                              {campaign.budget_min &&
                                campaign.budget_max &&
                                " - "}
                              {campaign.budget_max &&
                                formatCurrency(campaign.budget_max)}
                            </p>
                          </div>
                        )}

                        {/* Platforms */}
                        {campaign.platforms.length > 0 && (
                          <div>
                            <h4 className="mb-2 font-semibold text-gray-900">
                              Platforms
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {campaign.platforms.map((platform) => (
                                <span
                                  key={platform}
                                  className="rounded-lg bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800"
                                >
                                  {platform}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Creator Preferences */}
                        {campaign.preferred_creator_niches.length > 0 && (
                          <div>
                            <h4 className="mb-2 font-semibold text-gray-900">
                              Preferred Creator Niches
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {campaign.preferred_creator_niches.map(
                                (niche) => (
                                  <span
                                    key={niche}
                                    className="rounded-lg bg-purple-100 px-3 py-1 text-sm font-medium text-purple-800"
                                  >
                                    {niche}
                                  </span>
                                )
                              )}
                            </div>
                          </div>
                        )}

                        {/* Follower Range */}
                        {campaign.preferred_creator_followers_range && (
                          <div>
                            <h4 className="mb-2 font-semibold text-gray-900">
                              Creator Follower Range
                            </h4>
                            <p className="text-gray-700">
                              {campaign.preferred_creator_followers_range}
                            </p>
                          </div>
                        )}

                        {/* Deliverables */}
                        {campaign.deliverables &&
                          Array.isArray(campaign.deliverables) &&
                          campaign.deliverables.length > 0 && (
                            <div className="md:col-span-2">
                              <h4 className="mb-2 font-semibold text-gray-900">
                                Deliverables
                              </h4>
                              <div className="space-y-2">
                                {campaign.deliverables.map(
                                  (deliverable, idx) => (
                                    <div
                                      key={idx}
                                      className="rounded-lg bg-white p-3 shadow-sm"
                                    >
                                      <div className="flex items-center justify-between">
                                        <div>
                                          <span className="font-medium">
                                            {deliverable.platform} -{" "}
                                            {deliverable.content_type}
                                          </span>
                                          <span className="ml-2 text-gray-600">
                                            (Qty: {deliverable.quantity})
                                          </span>
                                        </div>
                                        {deliverable.required && (
                                          <span className="rounded bg-red-100 px-2 py-1 text-xs font-semibold text-red-800">
                                            Required
                                          </span>
                                        )}
                                      </div>
                                      {deliverable.guidance && (
                                        <p className="mt-1 text-sm text-gray-600">
                                          {deliverable.guidance}
                                        </p>
                                      )}
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          )}
                      </div>

                      {/* Campaign Wall Settings */}
                      <div className="md:col-span-2 mt-4 p-4 bg-white rounded-lg border border-gray-200">
                        <h4 className="mb-4 font-semibold text-gray-900">Campaign Wall Settings</h4>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <label className="text-sm font-medium text-gray-700">Open for Applications</label>
                              <p className="text-xs text-gray-500 mt-1">Allow creators to apply to this campaign</p>
                            </div>
                            <button
                              onClick={() => handleToggleCampaignWall(campaign, "is_open_for_applications")}
                              disabled={updatingCampaign === campaign.id}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                campaign.is_open_for_applications ? "bg-purple-600" : "bg-gray-300"
                              } ${updatingCampaign === campaign.id ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                  campaign.is_open_for_applications ? "translate-x-6" : "translate-x-1"
                                }`}
                              />
                            </button>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <label className="text-sm font-medium text-gray-700">Show on Campaign Wall</label>
                              <p className="text-xs text-gray-500 mt-1">Display this campaign on the public campaign wall</p>
                            </div>
                            <button
                              onClick={() => handleToggleCampaignWall(campaign, "is_on_campaign_wall")}
                              disabled={updatingCampaign === campaign.id || !campaign.is_open_for_applications}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                campaign.is_on_campaign_wall && campaign.is_open_for_applications ? "bg-purple-600" : "bg-gray-300"
                              } ${updatingCampaign === campaign.id || !campaign.is_open_for_applications ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                  campaign.is_on_campaign_wall && campaign.is_open_for_applications ? "translate-x-6" : "translate-x-1"
                                }`}
                              />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Applications Section */}
                      {campaign.is_open_for_applications && (
                        <div className="md:col-span-2 mt-4">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                              <UserCheck className="h-5 w-5" />
                              Applications ({applications[campaign.id]?.length || 0})
                            </h4>
                            <button
                              onClick={() => loadApplications(campaign.id)}
                              className="text-sm text-purple-600 hover:text-purple-700"
                            >
                              Refresh
                            </button>
                          </div>
                          {loadingApplications[campaign.id] ? (
                            <div className="text-center py-8">
                              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-purple-600"></div>
                              <p className="mt-2 text-sm text-gray-600">Loading applications...</p>
                            </div>
                          ) : applications[campaign.id]?.length > 0 ? (
                            <div className="space-y-4">
                              {applications[campaign.id].map((app) => (
                                <div key={app.id} className="bg-white rounded-lg border border-gray-200 p-4">
                                  <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                      {app.creator_profile_picture ? (
                                        <img
                                          src={app.creator_profile_picture}
                                          alt={app.creator_name || "Creator"}
                                          className="h-10 w-10 rounded-full"
                                        />
                                      ) : (
                                        <div className="h-10 w-10 rounded-full bg-purple-100"></div>
                                      )}
                                      <div>
                                        <p className="font-medium text-gray-900">{app.creator_name || "Unknown Creator"}</p>
                                        <p className="text-xs text-gray-500">{new Date(app.created_at).toLocaleDateString()}</p>
                                      </div>
                                    </div>
                                    <span
                                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                                        app.status === "accepted"
                                          ? "bg-green-100 text-green-800"
                                          : app.status === "rejected"
                                          ? "bg-red-100 text-red-800"
                                          : app.status === "reviewing"
                                          ? "bg-yellow-100 text-yellow-800"
                                          : "bg-blue-100 text-blue-800"
                                      }`}
                                    >
                                      {app.status}
                                    </span>
                                  </div>
                                  {app.description && (
                                    <p className="text-sm text-gray-700 mb-3">{app.description}</p>
                                  )}
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
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
                                  {(app.status === "applied" || app.status === "reviewing") && (
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() => handleApplicationStatusChange(campaign.id, app.id, "accepted")}
                                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-green-600 rounded hover:bg-green-700"
                                      >
                                        <Check className="h-3 w-3" />
                                        Accept
                                      </button>
                                      {app.status === "applied" && (
                                        <button
                                          onClick={() => handleApplicationStatusChange(campaign.id, app.id, "reviewing")}
                                          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                                        >
                                          <Clock className="h-3 w-3" />
                                          Review
                                        </button>
                                      )}
                                      <button
                                        onClick={() => handleApplicationStatusChange(campaign.id, app.id, "rejected")}
                                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-red-600 rounded hover:bg-red-700"
                                      >
                                        <X className="h-3 w-3" />
                                        Reject
                                      </button>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-8 bg-gray-50 rounded-lg">
                              <UserCheck className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                              <p className="text-sm text-gray-600">No applications yet</p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="mt-6 flex gap-3">
                        <button
                          onClick={() =>
                            router.push(`/brand/campaigns/edit/${campaign.id}`)
                          }
                          className="rounded-lg bg-blue-500 px-6 py-2 font-semibold text-white transition-colors hover:bg-blue-600"
                        >
                          Edit Campaign
                        </button>
                        <button
                          onClick={() =>
                            router.push(`/brand/campaigns/${campaign.id}/find-creators`)
                          }
                          className="rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-2 font-semibold text-white transition-colors hover:from-purple-600 hover:to-purple-700"
                        >
                          Find Creators
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </AuthGuard>
  );
}
