"use client";

import AuthGuard from "@/components/auth/AuthGuard";
import SlidingMenu from "@/components/SlidingMenu";
import { authenticatedFetch } from "@/lib/auth-helpers";
import { fetchCampaignById } from "@/lib/campaignApi";
import { Campaign } from "@/types/campaign";
import {
  ChevronDown,
  ChevronUp,
  Loader2,
  Search,
  Sparkles,
  User,
  Users,
  TrendingUp,
  Award,
  Send,
  X,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface CreatorMatch {
  id: string;
  display_name: string;
  tagline: string | null;
  bio: string | null;
  profile_picture_url: string | null;
  primary_niche: string;
  secondary_niches: string[];
  total_followers: number;
  engagement_rate: number | null;
  top_platforms: string[] | null;
  match_score: number;
  match_reasoning: string;
  full_details: any;
}

export default function FindCreatorsPage() {
  const params = useParams<{ campaign_id?: string | string[] }>();
  const router = useRouter();
  const campaignIdValue = Array.isArray(params?.campaign_id)
    ? params?.campaign_id[0]
    : params?.campaign_id;
  const campaignId = campaignIdValue ?? "";

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [creators, setCreators] = useState<CreatorMatch[]>([]);
  const [manualCreators, setManualCreators] = useState<CreatorMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCreator, setExpandedCreator] = useState<string | null>(null);
  const [showProposalModal, setShowProposalModal] = useState<string | null>(null);
  const [proposalData, setProposalData] = useState({
    subject: "",
    message: "",
    proposed_amount: "",
    content_idea: "",
    ideal_pricing: "",
  });
  const [draftingProposal, setDraftingProposal] = useState(false);
  const [sendingProposal, setSendingProposal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchingCreator, setSearchingCreator] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [multipleMatches, setMultipleMatches] = useState<any[] | null>(null);

  useEffect(() => {
    if (!campaignId) return;
    loadData();
  }, [campaignId]);

  const loadData = async () => {
    if (!campaignId) {
      setError("Campaign ID is missing. Please return to campaigns and try again.");
      return;
    }
    try {
      setLoading(true);
      setError(null);

      // Load campaign
      const campaignData = await fetchCampaignById(campaignId);
      setCampaign(campaignData);

      // Load matching creators
      const url = `${API_BASE_URL}/campaigns/${campaignId}/find-creators?limit=4`;
      const response = await authenticatedFetch(url);

      if (!response.ok) {
        throw new Error("Failed to find creators");
      }

      const creatorsData = await response.json();
      setCreators(creatorsData);
    } catch (err: any) {
      setError(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleDraftProposal = async (creatorId: string) => {
    try {
      setDraftingProposal(true);
      if (!campaignId) {
        alert("Campaign ID is missing. Please go back and try again.");
        return;
      }
      let url = `${API_BASE_URL}/proposals/draft?campaign_id=${campaignId}&creator_id=${creatorId}`;
      if (proposalData.content_idea) {
        url += `&content_idea=${encodeURIComponent(proposalData.content_idea)}`;
      }
      if (proposalData.ideal_pricing) {
        url += `&ideal_pricing=${encodeURIComponent(proposalData.ideal_pricing)}`;
      }

      const response = await authenticatedFetch(url);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "Failed to draft proposal");
      }

      const draft = await response.json();
      setProposalData({
        ...proposalData,
        subject: draft.subject || "",
        message: draft.message || "",
      });
    } catch (err: any) {
      alert("Failed to draft proposal: " + err.message);
    } finally {
      setDraftingProposal(false);
    }
  };

  const handleSearchCreator = async () => {
    if (!searchQuery.trim()) {
      setSearchError("Please enter a creator ID or name");
      return;
    }

    try {
      if (!campaignId) {
        setSearchError("Campaign ID missing. Please go back and try again.");
        return;
      }
      setSearchingCreator(true);
      setSearchError(null);
      setMultipleMatches(null);

      const url = `${API_BASE_URL}/campaigns/${campaignId}/search-creator?query=${encodeURIComponent(searchQuery.trim())}`;
      const response = await authenticatedFetch(url);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "Failed to search creator");
      }

      const result = await response.json();

      if (result.multiple_matches && result.creators) {
        // Show multiple matches for user to choose
        setMultipleMatches(result.creators);
      } else {
        // Single creator found
        const creatorMatch: CreatorMatch = {
          id: result.id,
          display_name: result.display_name,
          tagline: result.tagline,
          bio: result.bio,
          profile_picture_url: result.profile_picture_url,
          primary_niche: result.primary_niche,
          secondary_niches: result.secondary_niches,
          total_followers: result.total_followers,
          engagement_rate: result.engagement_rate,
          top_platforms: result.top_platforms,
          match_score: 0, // Manual search doesn't have a match score
          match_reasoning: "Manually searched creator",
          full_details: result.full_details,
        };

        // Add to manual creators list if not already there
        setManualCreators((prev) => {
          if (prev.some((c) => c.id === creatorMatch.id)) {
            return prev;
          }
          return [...prev, creatorMatch];
        });

        setSearchQuery("");
      }
    } catch (err: any) {
      setSearchError(err.message || "Failed to search creator");
    } finally {
      setSearchingCreator(false);
    }
  };

  const handleSelectFromMatches = (creator: any) => {
    const creatorMatch: CreatorMatch = {
      id: creator.id,
      display_name: creator.display_name,
      tagline: creator.tagline,
      bio: null,
      profile_picture_url: creator.profile_picture_url,
      primary_niche: creator.primary_niche,
      secondary_niches: [],
      total_followers: creator.total_followers,
      engagement_rate: creator.engagement_rate,
      top_platforms: null,
      match_score: 0,
      match_reasoning: "Manually searched creator",
      full_details: creator,
    };

    setManualCreators((prev) => {
      if (prev.some((c) => c.id === creatorMatch.id)) {
        return prev;
      }
      return [...prev, creatorMatch];
    });

    setMultipleMatches(null);
    setSearchQuery("");
  };

  const handleSendProposal = async (creatorId: string) => {
    try {
      if (!campaignId) {
        alert("Campaign ID is missing. Please go back and try again.");
        return;
      }
      setSendingProposal(true);
      const url = `${API_BASE_URL}/proposals`;
      const response = await authenticatedFetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          campaign_id: campaignId,
          creator_id: creatorId,
          subject: proposalData.subject,
          message: proposalData.message,
          proposed_amount: proposalData.proposed_amount
            ? parseFloat(proposalData.proposed_amount)
            : null,
          content_ideas: proposalData.content_idea
            ? [proposalData.content_idea]
            : [],
          ideal_pricing: proposalData.ideal_pricing || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "Failed to send proposal");
      }

      alert("Proposal sent successfully!");
      setShowProposalModal(null);
      setProposalData({
        subject: "",
        message: "",
        proposed_amount: "",
        content_idea: "",
        ideal_pricing: "",
      });
    } catch (err: any) {
      alert("Failed to send proposal: " + err.message);
    } finally {
      setSendingProposal(false);
    }
  };

  if (!campaignId) {
    return (
      <AuthGuard requiredRole="Brand">
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4">
          <div className="max-w-md text-center">
            <h1 className="text-2xl font-semibold text-gray-900">Invalid campaign</h1>
            <p className="mt-3 text-gray-600">
              We couldn&apos;t determine which campaign you&apos;re trying to manage. Please return to the campaigns list and try again.
            </p>
            <button
              onClick={() => router.push("/brand/campaigns")}
              className="mt-6 rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white transition-colors hover:bg-blue-700"
            >
              Go to campaigns
            </button>
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard requiredRole="Brand">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <SlidingMenu role="brand" />

        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => router.push("/brand/campaigns")}
              className="mb-4 text-blue-600 hover:text-blue-800"
            >
              ← Back to Campaigns
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Find Creators</h1>
            {campaign && (
              <p className="mt-2 text-gray-600">
                Matching creators for: <strong>{campaign.title}</strong>
              </p>
            )}
          </div>

          {/* Loading State */}
          {loading && (
            <div className="py-12 text-center">
              <Loader2 className="mx-auto h-12 w-12 animate-spin text-blue-500" />
              <p className="mt-4 text-gray-600">Finding matching creators...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="rounded-lg bg-red-50 p-6 text-center">
              <p className="text-red-600">{error}</p>
              <button
                onClick={loadData}
                className="mt-4 text-blue-600 hover:underline"
              >
                Try again
              </button>
            </div>
          )}

          {/* Manual Creator Search Section */}
          {!loading && !error && (
            <div className="mb-8 rounded-xl bg-white p-6 shadow-md">
              <h2 className="mb-4 text-xl font-bold text-gray-900">
                Search Creator by ID or Name
              </h2>
              <div className="flex gap-3">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setSearchError(null);
                      }}
                      onKeyPress={(e) => e.key === "Enter" && handleSearchCreator()}
                      placeholder="Enter creator ID (UUID) or display name"
                      className="w-full rounded-lg border border-gray-300 py-3 pr-4 pl-10 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                    />
                  </div>
                  {searchError && (
                    <p className="mt-2 text-sm text-red-600">{searchError}</p>
                  )}
                </div>
                <button
                  onClick={handleSearchCreator}
                  disabled={searchingCreator || !searchQuery.trim()}
                  className="rounded-lg bg-blue-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-600 disabled:opacity-50"
                >
                  {searchingCreator ? (
                    <>
                      <Loader2 className="mr-2 inline h-4 w-4 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    "Search"
                  )}
                </button>
              </div>

              {/* Multiple Matches Modal */}
              {multipleMatches && multipleMatches.length > 0 && (
                <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <p className="mb-3 text-sm font-semibold text-gray-700">
                    Multiple creators found. Select one:
                  </p>
                  <div className="space-y-2">
                    {multipleMatches.map((creator) => (
                      <button
                        key={creator.id}
                        onClick={() => handleSelectFromMatches(creator)}
                        className="w-full rounded-lg border border-gray-300 bg-white p-3 text-left transition-colors hover:bg-gray-50"
                      >
                        <div className="flex items-center gap-3">
                          {creator.profile_picture_url && (
                            <img
                              src={creator.profile_picture_url}
                              alt={creator.display_name}
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          )}
                          <div>
                            <p className="font-semibold text-gray-900">
                              {creator.display_name}
                            </p>
                            {creator.tagline && (
                              <p className="text-sm text-gray-600">
                                {creator.tagline}
                              </p>
                            )}
                            <p className="text-xs text-gray-500">
                              {creator.total_followers.toLocaleString()} followers
                              {creator.engagement_rate &&
                                ` • ${creator.engagement_rate.toFixed(1)}% engagement`}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => {
                      setMultipleMatches(null);
                      setSearchQuery("");
                    }}
                    className="mt-3 text-sm text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          )}

          {/* AI Matched Creators Section */}
          {!loading && !error && creators.length > 0 && (
            <div className="mb-8">
              <h2 className="mb-4 text-xl font-bold text-gray-900">
                AI Matched Creators
              </h2>
              <div className="space-y-6">
                {creators.map((creator) => (
                <div
                  key={creator.id}
                  className="overflow-hidden rounded-xl bg-white shadow-md transition-all hover:shadow-lg"
                >
                  {/* Creator Summary */}
                  <div className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-full bg-gray-200">
                        {creator.profile_picture_url ? (
                          <img
                            src={creator.profile_picture_url}
                            alt={creator.display_name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <User className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900">
                              {creator.display_name}
                            </h3>
                            {creator.tagline && (
                              <p className="mt-1 text-gray-600">{creator.tagline}</p>
                            )}
                            <div className="mt-2 flex flex-wrap gap-2">
                              <span className="rounded-lg bg-purple-100 px-3 py-1 text-sm font-medium text-purple-800">
                                {creator.primary_niche}
                              </span>
                              {creator.top_platforms &&
                                creator.top_platforms.map((platform) => (
                                  <span
                                    key={platform}
                                    className="rounded-lg bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800"
                                  >
                                    {platform}
                                  </span>
                                ))}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-2">
                              <TrendingUp className="h-5 w-5 text-green-500" />
                              <span className="text-lg font-bold text-green-600">
                                {creator.match_score}% Match
                              </span>
                            </div>
                            <p className="mt-1 text-sm text-gray-600">
                              {creator.total_followers.toLocaleString()} followers
                            </p>
                            {creator.engagement_rate && (
                              <p className="text-sm text-gray-600">
                                {creator.engagement_rate.toFixed(1)}% engagement
                              </p>
                            )}
                          </div>
                        </div>
                        <p className="mt-3 text-sm text-gray-700">
                          {creator.match_reasoning}
                        </p>
                        <div className="mt-4 flex gap-3">
                          <button
                            onClick={() =>
                              setExpandedCreator(
                                expandedCreator === creator.id ? null : creator.id
                              )
                            }
                            className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                          >
                            {expandedCreator === creator.id ? (
                              <>
                                <ChevronUp className="h-4 w-4" />
                                Hide Details
                              </>
                            ) : (
                              <>
                                <ChevronDown className="h-4 w-4" />
                                View Details
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => {
                              setShowProposalModal(creator.id);
                              setProposalData({
                                subject: "",
                                message: "",
                                proposed_amount: "",
                                content_idea: "",
                                ideal_pricing: "",
                              });
                            }}
                            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:from-purple-600 hover:to-purple-700"
                          >
                            <Send className="h-4 w-4" />
                            Send Proposal
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expandedCreator === creator.id && creator.full_details && (
                    <div className="border-t border-gray-200 bg-gray-50 p-6">
                      <div className="grid gap-6 md:grid-cols-2">
                        <div>
                          <h4 className="mb-2 font-semibold text-gray-900">Bio</h4>
                          <p className="text-gray-700">
                            {creator.full_details.bio || "No bio available"}
                          </p>
                        </div>
                        <div>
                          <h4 className="mb-2 font-semibold text-gray-900">
                            Why They Fit
                          </h4>
                          <p className="text-gray-700">{creator.match_reasoning}</p>
                        </div>
                        {creator.full_details.secondary_niches &&
                          creator.full_details.secondary_niches.length > 0 && (
                            <div>
                              <h4 className="mb-2 font-semibold text-gray-900">
                                Secondary Niches
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {creator.full_details.secondary_niches.map(
                                  (niche: string) => (
                                    <span
                                      key={niche}
                                      className="rounded-lg bg-purple-100 px-2 py-1 text-xs text-purple-800"
                                    >
                                      {niche}
                                    </span>
                                  )
                                )}
                              </div>
                            </div>
                          )}
                        {creator.full_details.years_of_experience && (
                          <div>
                            <h4 className="mb-2 font-semibold text-gray-900">
                              Experience
                            </h4>
                            <p className="text-gray-700">
                              {creator.full_details.years_of_experience} years
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              </div>
            </div>
          )}

          {/* Manually Searched Creators Section */}
          {manualCreators.length > 0 && (
            <div className="mb-8">
              <h2 className="mb-4 text-xl font-bold text-gray-900">
                Manually Searched Creators
              </h2>
              <div className="space-y-6">
                {manualCreators.map((creator) => (
                  <div
                    key={creator.id}
                    className="overflow-hidden rounded-xl bg-white shadow-md transition-all hover:shadow-lg"
                  >
                    {/* Creator Summary */}
                    <div className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-full bg-gray-200">
                          {creator.profile_picture_url ? (
                            <img
                              src={creator.profile_picture_url}
                              alt={creator.display_name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <User className="h-8 w-8 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-xl font-bold text-gray-900">
                                {creator.display_name}
                              </h3>
                              {creator.tagline && (
                                <p className="mt-1 text-gray-600">{creator.tagline}</p>
                              )}
                              <div className="mt-2 flex flex-wrap gap-2">
                                <span className="rounded-lg bg-purple-100 px-3 py-1 text-sm font-medium text-purple-800">
                                  {creator.primary_niche}
                                </span>
                                {creator.top_platforms &&
                                  creator.top_platforms.map((platform) => (
                                    <span
                                      key={platform}
                                      className="rounded-lg bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800"
                                    >
                                      {platform}
                                    </span>
                                  ))}
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="mt-1 text-sm text-gray-600">
                                {creator.total_followers.toLocaleString()} followers
                              </p>
                              {creator.engagement_rate && (
                                <p className="text-sm text-gray-600">
                                  {creator.engagement_rate.toFixed(1)}% engagement
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="mt-4 flex gap-3">
                            <button
                              onClick={() =>
                                setExpandedCreator(
                                  expandedCreator === creator.id ? null : creator.id
                                )
                              }
                              className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                            >
                              {expandedCreator === creator.id ? (
                                <>
                                  <ChevronUp className="h-4 w-4" />
                                  Hide Details
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="h-4 w-4" />
                                  View Details
                                </>
                              )}
                            </button>
                            <button
                              onClick={() => {
                                setShowProposalModal(creator.id);
                                setProposalData({
                                  subject: "",
                                  message: "",
                                  proposed_amount: "",
                                  content_idea: "",
                                  ideal_pricing: "",
                                });
                              }}
                              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:from-purple-600 hover:to-purple-700"
                            >
                              <Send className="h-4 w-4" />
                              Send Proposal
                            </button>
                            <button
                              onClick={() => {
                                setManualCreators((prev) =>
                                  prev.filter((c) => c.id !== creator.id)
                                );
                              }}
                              className="flex items-center gap-2 rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
                            >
                              <X className="h-4 w-4" />
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {expandedCreator === creator.id && creator.full_details && (
                      <div className="border-t border-gray-200 bg-gray-50 p-6">
                        <div className="grid gap-6 md:grid-cols-2">
                          <div>
                            <h4 className="mb-2 font-semibold text-gray-900">Bio</h4>
                            <p className="text-gray-700">
                              {creator.full_details.bio || "No bio available"}
                            </p>
                          </div>
                          {creator.full_details.secondary_niches &&
                            creator.full_details.secondary_niches.length > 0 && (
                              <div>
                                <h4 className="mb-2 font-semibold text-gray-900">
                                  Secondary Niches
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                  {creator.full_details.secondary_niches.map(
                                    (niche: string) => (
                                      <span
                                        key={niche}
                                        className="rounded-lg bg-purple-100 px-2 py-1 text-xs text-purple-800"
                                      >
                                        {niche}
                                      </span>
                                    )
                                  )}
                                </div>
                              </div>
                            )}
                          {creator.full_details.years_of_experience && (
                            <div>
                              <h4 className="mb-2 font-semibold text-gray-900">
                                Experience
                              </h4>
                              <p className="text-gray-700">
                                {creator.full_details.years_of_experience} years
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && creators.length === 0 && manualCreators.length === 0 && (
            <div className="rounded-xl bg-white p-12 text-center shadow-md">
              <Search className="mx-auto h-16 w-16 text-gray-400" />
              <h3 className="mt-4 text-xl font-semibold text-gray-900">
                No matching creators found
              </h3>
              <p className="mt-2 text-gray-600">
                Try adjusting your campaign requirements or check back later.
              </p>
            </div>
          )}
        </main>

        {/* Proposal Modal */}
        {showProposalModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-xl">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Send Proposal</h2>
                <button
                  onClick={() => setShowProposalModal(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Content Idea (optional)
                  </label>
                  <input
                    type="text"
                    value={proposalData.content_idea}
                    onChange={(e) =>
                      setProposalData({ ...proposalData, content_idea: e.target.value })
                    }
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                    placeholder="Brief content idea or concept"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Ideal Pricing (optional)
                  </label>
                  <input
                    type="text"
                    value={proposalData.ideal_pricing}
                    onChange={(e) =>
                      setProposalData({
                        ...proposalData,
                        ideal_pricing: e.target.value,
                      })
                    }
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                    placeholder="e.g., 50,000 - 75,000 INR"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleDraftProposal(showProposalModal)}
                    disabled={draftingProposal}
                    className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
                  >
                    {draftingProposal ? (
                      <>
                        <Loader2 className="mr-2 inline h-4 w-4 animate-spin" />
                        Drafting...
                      </>
                    ) : (
                      "AI Draft Proposal"
                    )}
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Subject *
                  </label>
                  <input
                    type="text"
                    value={proposalData.subject}
                    onChange={(e) =>
                      setProposalData({ ...proposalData, subject: e.target.value })
                    }
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Message *
                  </label>
                  <textarea
                    value={proposalData.message}
                    onChange={(e) =>
                      setProposalData({ ...proposalData, message: e.target.value })
                    }
                    rows={8}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Proposed Amount (INR, optional)
                  </label>
                  <input
                    type="number"
                    value={proposalData.proposed_amount}
                    onChange={(e) =>
                      setProposalData({
                        ...proposalData,
                        proposed_amount: e.target.value,
                      })
                    }
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                    placeholder="50000"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowProposalModal(null)}
                    className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleSendProposal(showProposalModal)}
                    disabled={
                      sendingProposal ||
                      !proposalData.subject ||
                      !proposalData.message
                    }
                    className="flex-1 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 px-4 py-2 font-semibold text-white transition-colors hover:from-purple-600 hover:to-purple-700 disabled:opacity-50"
                  >
                    {sendingProposal ? (
                      <>
                        <Loader2 className="mr-2 inline h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      "Send Proposal"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}

