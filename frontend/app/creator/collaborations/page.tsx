"use client";

import AuthGuard from "@/components/auth/AuthGuard";
import SlidingMenu from "@/components/SlidingMenu";
import { generateCollaborationIdeas, recommendCreatorForIdea, proposeCollaboration, type CollaborationIdea, type RecommendCreatorResponse } from "@/lib/api/collaborations";
import { getCreatorDetails, getCreatorRecommendations, listCreators, type CreatorBasic, type CreatorFull, type CreatorRecommendation } from "@/lib/api/creators";
import { getUserProfile } from "@/lib/auth-helpers";
import { ChevronDown, ChevronUp, ExternalLink, Facebook, Globe, Instagram, Lightbulb, Linkedin, Search, Sparkles, Twitch, Twitter, Users, X, Youtube, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function CollaborationsPage() {
  const router = useRouter();
  const [creators, setCreators] = useState<CreatorBasic[]>([]);
  const [recommended, setRecommended] = useState<CreatorRecommendation[]>([]);
  const [expandedCreator, setExpandedCreator] = useState<string | null>(null);
  const [expandedDetails, setExpandedDetails] = useState<CreatorFull | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingRecommended, setIsLoadingRecommended] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [collaborationIdeas, setCollaborationIdeas] = useState<CollaborationIdea[]>([]);
  const [isLoadingIdeas, setIsLoadingIdeas] = useState(false);
  const [showIdeasPopup, setShowIdeasPopup] = useState(false);
  const [activeTab, setActiveTab] = useState<"browse" | "ai">("browse");
  const [collabIdeaInput, setCollabIdeaInput] = useState("");
  const [isLoadingRecommendation, setIsLoadingRecommendation] = useState(false);
  const [ideaRecommendation, setIdeaRecommendation] = useState<RecommendCreatorResponse | null>(null);
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [selectedIdea, setSelectedIdea] = useState<CollaborationIdea | null>(null);
  const [selectedCreatorId, setSelectedCreatorId] = useState<string | null>(null);
  const [proposalData, setProposalData] = useState({
    title: "",
    description: "",
    proposal_message: "",
    start_date: "",
    end_date: "",
  });
  const [isSubmittingProposal, setIsSubmittingProposal] = useState(false);

  useEffect(() => {
    loadCreators();
  }, []);

  useEffect(() => {
    if (activeTab === "ai") {
      loadRecommendations();
    }
  }, [activeTab]);

  const loadCreators = async (search?: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await listCreators({ search, limit: 100 });
      setCreators(data);
    } catch (err: any) {
      console.error("Failed to load creators:", err);
      const errorMessage = err?.message || "Failed to load creators. Please try again.";

      // Check if it's an authentication error
      if (errorMessage.includes("Unauthorized") || errorMessage.includes("authentication token")) {
        // Don't redirect automatically - let AuthGuard handle it
        // This could be a backend configuration issue (JWT secret not set)
        setError("Authentication failed. This might be a backend configuration issue. Please check if SUPABASE_JWT_SECRET is set in the backend .env file.");
      } else if (errorMessage.includes("Creator profile not found")) {
        setError("Please complete your creator onboarding first.");
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loadRecommendations = async () => {
    try {
      setIsLoadingRecommended(true);
      setError(null);
      const data = await getCreatorRecommendations(4);
      setRecommended(data);
    } catch (err: any) {
      console.error("Failed to load recommendations:", err);
      setError(err?.message || "Failed to load recommendations. Please try again.");
    } finally {
      setIsLoadingRecommended(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadCreators(searchQuery);
  };

  const handleExpand = async (creatorId: string) => {
    if (expandedCreator === creatorId) {
      // Collapse
      setExpandedCreator(null);
      setExpandedDetails(null);
      setCollaborationIdeas([]);
    } else {
      // Expand
      setExpandedCreator(creatorId);
      setIsLoadingDetails(true);
      setCollaborationIdeas([]);
      try {
        const details = await getCreatorDetails(creatorId);
        setExpandedDetails(details);
      } catch (err) {
        console.error("Failed to load creator details:", err);
        setError("Failed to load creator details.");
    } finally {
        setIsLoadingDetails(false);
      }
    }
  };

  const handleGenerateIdeas = async (targetCreatorId: string) => {
    setIsLoadingIdeas(true);
    setError(null);
    try {
      const response = await generateCollaborationIdeas(targetCreatorId);
      setCollaborationIdeas(response.ideas);
    } catch (err: any) {
      console.error("Failed to generate collaboration ideas:", err);
      setError(err?.message || "Failed to generate collaboration ideas. Please try again.");
    } finally {
      setIsLoadingIdeas(false);
    }
  };

  const formatNumber = (num: number | null | undefined): string => {
    if (!num) return "0";
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getSocialIcon = (platform: string) => {
    const icons: Record<string, any> = {
      youtube: Youtube,
      instagram: Instagram,
      twitter: Twitter,
      facebook: Facebook,
      linkedin: Linkedin,
      twitch: Twitch,
    };
    return icons[platform.toLowerCase()] || ExternalLink;
  };

  const getScoreColor = (score: number): string => {
    if (score >= 70) return "bg-green-500";
    if (score >= 40) return "bg-yellow-500";
    return "bg-red-500";
  };

  const handleLogoClick = async () => {
    try {
      const profile = await getUserProfile();
      if (profile) {
        if (profile.role === "Creator") {
          router.push("/creator/home");
        } else if (profile.role === "Brand") {
          router.push("/brand/home");
        }
      }
    } catch (err) {
      console.error("Failed to get user profile:", err);
    }
  };

  const handleGetRecommendation = async () => {
    if (!collabIdeaInput.trim() || recommended.length === 0) {
      setError("Please enter a collaboration idea first.");
      return;
    }

    setIsLoadingRecommendation(true);
    setError(null);
    setIdeaRecommendation(null);

    try {
      const candidateIds = recommended.map((r) => r.id);
      const response = await recommendCreatorForIdea(collabIdeaInput, candidateIds);
      setIdeaRecommendation(response);
    } catch (err: any) {
      console.error("Failed to get recommendation:", err);
      setError(err?.message || "Failed to get recommendation. Please try again.");
    } finally {
      setIsLoadingRecommendation(false);
    }
  };

  const handleProposeCollaboration = (idea: CollaborationIdea, creatorId: string) => {
    setSelectedIdea(idea);
    setSelectedCreatorId(creatorId);
    setProposalData({
      title: idea.title,
      description: idea.description,
      proposal_message: `Hi! I'd love to collaborate on "${idea.title}". ${idea.description}`,
      start_date: "",
      end_date: "",
    });
    setShowProposalModal(true);
  };

  const handleSubmitProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCreatorId || !selectedIdea) return;

    setIsSubmittingProposal(true);
    setError(null);

    try {
      await proposeCollaboration({
        target_creator_id: selectedCreatorId,
        collaboration_type: selectedIdea.collaboration_type,
        title: proposalData.title,
        description: proposalData.description,
        proposal_message: proposalData.proposal_message,
        start_date: proposalData.start_date || undefined,
        end_date: proposalData.end_date || undefined,
      });
      setShowProposalModal(false);
      setSelectedIdea(null);
      setSelectedCreatorId(null);
      setProposalData({
        title: "",
        description: "",
        proposal_message: "",
        start_date: "",
        end_date: "",
      });
      alert("Collaboration proposal sent successfully!");
    } catch (err: any) {
      console.error("Failed to propose collaboration:", err);
      setError(err?.message || "Failed to send proposal. Please try again.");
    } finally {
      setIsSubmittingProposal(false);
    }
  };

  return (
    <AuthGuard requiredRole="Creator">
      <div className="min-h-screen bg-linear-to-br from-purple-50 via-white to-blue-50">
        <SlidingMenu role="creator" />

        {/* Header */}
        <header className="border-b border-gray-200 bg-white">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
            <button
              onClick={handleLogoClick}
              className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
            >
              <Sparkles className="h-6 w-6 text-purple-600" />
              <h1 className="bg-linear-to-r from-purple-600 to-blue-600 bg-clip-text text-2xl font-bold text-transparent">
                InPactAI
              </h1>
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Page Title */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Find Creators</h2>
            <p className="mt-2 text-gray-600">Discover and connect with other creators for collaborations</p>
                </div>

          {/* Tabs */}
          <div className="mb-6 flex gap-2">
            <button
              onClick={() => setActiveTab("browse")}
              className={`rounded-md px-4 py-2 text-sm font-medium ${activeTab === "browse" ? "bg-purple-600 text-white" : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"}`}
            >
              Browse
            </button>
            <button
              onClick={() => setActiveTab("ai")}
              className={`rounded-md px-4 py-2 text-sm font-medium ${activeTab === "ai" ? "bg-purple-600 text-white" : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"}`}
            >
              AI Matches
            </button>
          </div>

          {error && (
            <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4 text-red-800">
              {error}
            </div>
          )}

          {activeTab === "browse" && (
          <>
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, niche, or bio..."
                className="w-full rounded-lg border border-gray-300 bg-white py-3 pl-12 pr-4 text-gray-900 placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700"
              >
                Search
              </button>
                </div>
          </form>
          {/* Loading State */}
          {isLoading ? (
            <div className="flex min-h-[60vh] items-center justify-center">
              <div className="text-center">
                <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-purple-600"></div>
                <p className="text-gray-600">Loading creators...</p>
              </div>
            </div>
          ) : creators.length === 0 ? (
            <div className="flex min-h-[60vh] items-center justify-center">
              <div className="text-center">
                <Users className="mx-auto mb-4 h-16 w-16 text-gray-400" />
                <h3 className="text-xl font-semibold text-gray-900">No creators found</h3>
                <p className="mt-2 text-gray-600">
                  {searchQuery ? "Try adjusting your search query." : "No creators available at the moment."}
                </p>
              </div>
            </div>
          ) : (
            /* Creators Grid */
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {creators.map((creator) => (
                <div
                  key={creator.id}
                  className={`rounded-lg border bg-white shadow-sm transition-all ${
                    expandedCreator === creator.id
                      ? "border-purple-500 shadow-lg"
                      : "border-gray-200 hover:shadow-md"
                  }`}
                >
                  {/* Basic Card Content */}
                  <div className="p-6">
                    <div className="flex items-start gap-4">
                      {/* Profile Picture */}
                      <div className="flex-shrink-0">
                        {creator.profile_picture_url ? (
                          <img
                            src={creator.profile_picture_url}
                            alt={creator.display_name}
                            className="h-16 w-16 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 text-purple-600">
                            <Users className="h-8 w-8" />
                          </div>
                        )}
            </div>

                      {/* Basic Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold text-gray-900 truncate">
                            {creator.display_name}
                          </h3>
                          {creator.is_verified_creator && (
                            <span className="flex-shrink-0 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                              Verified
                            </span>
                          )}
                </div>
                        {creator.tagline && (
                          <p className="mt-1 text-sm text-gray-600 line-clamp-2">{creator.tagline}</p>
                        )}
                        <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                          <span className="inline-flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {formatNumber(creator.total_followers)}
                          </span>
                          {creator.engagement_rate && (
                            <span>{creator.engagement_rate.toFixed(1)}% engagement</span>
                          )}
                </div>
                        <div className="mt-2">
                          <span className="inline-block rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-800">
                            {creator.primary_niche}
                          </span>
              </div>
            </div>
          </div>

                    {/* Expand/Collapse Button */}
              <button
                      onClick={() => handleExpand(creator.id)}
                      className="mt-4 flex w-full items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
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
                  </div>

                  {/* Expanded Details */}
                  {expandedCreator === creator.id && (
                    <div className="border-t border-gray-200 bg-gray-50 p-6">
                      {isLoadingDetails ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-purple-600"></div>
                        </div>
                      ) : expandedDetails ? (
                        <div className="space-y-6">
                          {/* Bio */}
                          {expandedDetails.bio && (
                            <div>
                              <h4 className="text-sm font-semibold text-gray-900">About</h4>
                              <p className="mt-1 text-sm text-gray-600">{expandedDetails.bio}</p>
                            </div>
                          )}

                          {/* Niches */}
                          <div>
                            <h4 className="text-sm font-semibold text-gray-900">Niches</h4>
                            <div className="mt-2 flex flex-wrap gap-2">
                              <span className="inline-block rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-800">
                                {expandedDetails.primary_niche}
                              </span>
                              {expandedDetails.secondary_niches?.map((niche, idx) => (
                                <span
                                  key={idx}
                                  className="inline-block rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700"
                                >
                                  {niche}
                                </span>
                              ))}
            </div>
          </div>

                          {/* Social Platforms */}
            <div>
                            <h4 className="text-sm font-semibold text-gray-900 mb-2">Social Platforms</h4>
                            <div className="grid grid-cols-2 gap-3">
                              {expandedDetails.youtube_handle && (
                                <a
                                  href={expandedDetails.youtube_url || "#"}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 rounded-md border border-gray-200 bg-white p-2 text-sm hover:bg-gray-50"
                                >
                                  <Youtube className="h-4 w-4 text-red-600" />
                                  <span className="flex-1 truncate">YouTube</span>
                                  {expandedDetails.youtube_subscribers && (
                                    <span className="text-xs text-gray-500">
                                      {formatNumber(expandedDetails.youtube_subscribers)}
                                    </span>
                                  )}
                                </a>
                              )}
                              {expandedDetails.instagram_handle && (
                                <a
                                  href={expandedDetails.instagram_url || "#"}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 rounded-md border border-gray-200 bg-white p-2 text-sm hover:bg-gray-50"
                                >
                                  <Instagram className="h-4 w-4 text-pink-600" />
                                  <span className="flex-1 truncate">Instagram</span>
                                  {expandedDetails.instagram_followers && (
                                    <span className="text-xs text-gray-500">
                                      {formatNumber(expandedDetails.instagram_followers)}
                                    </span>
                                  )}
                                </a>
                              )}
                              {expandedDetails.tiktok_handle && (
                                <a
                                  href={expandedDetails.tiktok_url || "#"}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 rounded-md border border-gray-200 bg-white p-2 text-sm hover:bg-gray-50"
                                >
                                  <span className="text-lg">🎵</span>
                                  <span className="flex-1 truncate">TikTok</span>
                                  {expandedDetails.tiktok_followers && (
                                    <span className="text-xs text-gray-500">
                                      {formatNumber(expandedDetails.tiktok_followers)}
                                    </span>
                                  )}
                                </a>
                              )}
                              {expandedDetails.twitter_handle && (
                                <a
                                  href={expandedDetails.twitter_url || "#"}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 rounded-md border border-gray-200 bg-white p-2 text-sm hover:bg-gray-50"
                                >
                                  <Twitter className="h-4 w-4 text-blue-400" />
                                  <span className="flex-1 truncate">Twitter</span>
                                  {expandedDetails.twitter_followers && (
                                    <span className="text-xs text-gray-500">
                                      {formatNumber(expandedDetails.twitter_followers)}
                                    </span>
                                  )}
                                </a>
                              )}
                              {expandedDetails.website_url && (
                                <a
                                  href={expandedDetails.website_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 rounded-md border border-gray-200 bg-white p-2 text-sm hover:bg-gray-50"
                                >
                                  <Globe className="h-4 w-4 text-gray-600" />
                                  <span className="flex-1 truncate">Website</span>
                                </a>
                              )}
                            </div>
                          </div>

                          {/* Stats */}
                          <div className="grid grid-cols-2 gap-4">
                            {expandedDetails.total_reach && (
                              <div className="rounded-md bg-white p-3">
                                <p className="text-xs text-gray-500">Total Reach</p>
                                <p className="mt-1 text-lg font-semibold text-gray-900">
                                  {formatNumber(expandedDetails.total_reach)}
                </p>
              </div>
                            )}
                            {expandedDetails.average_views && (
                              <div className="rounded-md bg-white p-3">
                                <p className="text-xs text-gray-500">Avg Views</p>
                                <p className="mt-1 text-lg font-semibold text-gray-900">
                                  {formatNumber(expandedDetails.average_views)}
                  </p>
                </div>
                            )}
                            {expandedDetails.posting_frequency && (
                              <div className="rounded-md bg-white p-3">
                                <p className="text-xs text-gray-500">Posting Frequency</p>
                                <p className="mt-1 text-sm font-semibold text-gray-900">
                                  {expandedDetails.posting_frequency}
                  </p>
                </div>
                            )}
                            {expandedDetails.years_of_experience && (
                              <div className="rounded-md bg-white p-3">
                                <p className="text-xs text-gray-500">Experience</p>
                                <p className="mt-1 text-sm font-semibold text-gray-900">
                                  {expandedDetails.years_of_experience} years
                                </p>
                </div>
              )}
            </div>

                          {/* Content Types */}
                          {expandedDetails.content_types && expandedDetails.content_types.length > 0 && (
                            <div>
                              <h4 className="text-sm font-semibold text-gray-900">Content Types</h4>
                              <div className="mt-2 flex flex-wrap gap-2">
                                {expandedDetails.content_types.map((type, idx) => (
                                  <span
                                    key={idx}
                                    className="inline-block rounded-md bg-blue-50 px-2 py-1 text-xs text-blue-700"
                                  >
                                    {type}
                            </span>
                      ))}
                    </div>
                  </div>
                )}

                          {/* Collaboration Types */}
                          {expandedDetails.collaboration_types && expandedDetails.collaboration_types.length > 0 && (
                <div>
                              <h4 className="text-sm font-semibold text-gray-900">Open to Collaborations</h4>
                              <div className="mt-2 flex flex-wrap gap-2">
                                {expandedDetails.collaboration_types.map((type, idx) => (
                                  <span
                                    key={idx}
                                    className="inline-block rounded-md bg-green-50 px-2 py-1 text-xs text-green-700"
                                  >
                                    {type}
                          </span>
                    ))}
                  </div>
                </div>
              )}

                          {/* Generate Collaboration Ideas Button */}
                          <div className="mt-6">
                            <button
                              onClick={() => handleGenerateIdeas(expandedDetails.id)}
                              disabled={isLoadingIdeas}
                              className="flex w-full items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              style={{ backgroundColor: "#FFC61A" }}
                            >
                              {isLoadingIdeas ? (
                                <>
                                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                  Generating Ideas...
                                </>
                              ) : (
                                <>
                                  <Lightbulb className="h-4 w-4" />
                                  Generate Collaboration Ideas
                                </>
                              )}
                            </button>
                          </div>

                          {/* Display First Idea */}
                          {collaborationIdeas.length > 0 && (
                            <div className="mt-6 rounded-lg border border-gray-200 bg-white p-4">
                              <div className="mb-2 flex items-center gap-2">
                                <Lightbulb className="h-4 w-4" style={{ color: "#FFC61A" }} />
                                <h4 className="text-sm font-semibold text-gray-900">Collaboration Idea</h4>
                              </div>
                              <h5 className="text-base font-semibold text-gray-900">
                                {collaborationIdeas[0].title}
                              </h5>
                              <p className="mt-2 text-sm text-gray-600">
                                {collaborationIdeas[0].description}
                              </p>
                              <div className="mt-3 flex items-center gap-2">
                                <span className="inline-block rounded-full bg-purple-100 px-2 py-1 text-xs font-medium text-purple-800">
                                  {collaborationIdeas[0].collaboration_type}
                                </span>
                              </div>
                              <p className="mt-2 text-xs text-gray-500 italic">
                                {collaborationIdeas[0].why_it_works}
                              </p>
                              <div className="mt-4 flex gap-2">
                                <button
                                  onClick={() => handleProposeCollaboration(collaborationIdeas[0], expandedDetails.id)}
                                  className="flex-1 flex items-center justify-center gap-2 rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700"
                                >
                                  <Send className="h-4 w-4" />
                                  Propose Collaboration
                                </button>
                                {collaborationIdeas.length > 1 && (
                                  <button
                                    onClick={() => setShowIdeasPopup(true)}
                                    className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                  >
                                    More Ideas ({collaborationIdeas.length - 1})
                                  </button>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : null}
                  </div>
                )}
                </div>
              ))}
            </div>
          )}
          </>)}

          {activeTab === "ai" && (
            <div>
              {/* Info text */}
              <div className="mb-4 text-sm text-gray-600">
                Top collaborators selected for you using profile and audience compatibility. Click the yellow bulb to generate tailored collab ideas.
              </div>

              {/* Collaboration Idea Input */}
              {recommended.length > 0 && (
                <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Have a collaboration idea? Get AI recommendation for the best creator match:
                  </label>
                  <div className="flex gap-2">
                    <textarea
                      value={collabIdeaInput}
                      onChange={(e) => setCollabIdeaInput(e.target.value)}
                      placeholder="E.g., I want to create a fitness challenge series targeting millennials..."
                      className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      rows={3}
                    />
                    <button
                      onClick={handleGetRecommendation}
                      disabled={isLoadingRecommendation || !collabIdeaInput.trim()}
                      className="rounded-md px-4 py-2 text-sm font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      style={{ backgroundColor: "#FFC61A" }}
                    >
                      {isLoadingRecommendation ? "Analyzing..." : "Get Recommendation"}
                    </button>
                  </div>
                  {ideaRecommendation && (
                    <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-4">
                      <div className="mb-2 flex items-center gap-2">
                        <Lightbulb className="h-4 w-4 text-green-600" />
                        <h4 className="text-sm font-semibold text-green-900">Best Match</h4>
                      </div>
                      <div className="flex items-start gap-3">
                        {ideaRecommendation.recommended_creator.profile_picture_url ? (
                          <img
                            src={ideaRecommendation.recommended_creator.profile_picture_url}
                            alt={ideaRecommendation.recommended_creator.display_name}
                            className="h-12 w-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-purple-600">
                            <Users className="h-6 w-6" />
                          </div>
                        )}
                        <div className="flex-1">
                          <h5 className="font-semibold text-gray-900">
                            {ideaRecommendation.recommended_creator.display_name}
                          </h5>
                          <p className="mt-1 text-sm text-gray-700">
                            {ideaRecommendation.recommended_creator.reasoning}
                          </p>
                          <div className="mt-2 flex items-center gap-2">
                            <span className="text-xs font-medium text-gray-600">Match Score:</span>
                            <span className="text-xs font-semibold text-gray-900">
                              {ideaRecommendation.recommended_creator.match_score.toFixed(0)}
                            </span>
                            <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${getScoreColor(ideaRecommendation.recommended_creator.match_score)}`}
                                style={{ width: `${Math.min(ideaRecommendation.recommended_creator.match_score, 100)}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      {ideaRecommendation.alternatives.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-green-200">
                          <p className="text-xs font-medium text-green-900 mb-2">Other options:</p>
                          <div className="space-y-2">
                            {ideaRecommendation.alternatives.map((alt) => (
                              <div key={alt.creator_id} className="text-xs text-gray-600">
                                <span className="font-medium">{alt.display_name}</span> - {alt.reasoning.substring(0, 100)}...
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
              {/* Loading State */}
              {isLoadingRecommended ? (
                <div className="flex min-h-[40vh] items-center justify-center">
                  <div className="text-center">
                    <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-b-2 border-purple-600"></div>
                    <p className="text-gray-600">Loading AI matches...</p>
                  </div>
                </div>
              ) : recommended.length === 0 ? (
                <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-gray-600">
                  No AI matches found right now. Try updating your profile or expanding your niches.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2">
                  {recommended.map((rec) => (
                    <div key={rec.id} className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          {rec.profile_picture_url ? (
                            <img
                              src={rec.profile_picture_url}
                              alt={rec.display_name}
                              className="h-16 w-16 rounded-full object-cover"
                            />
                          ) : (
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 text-purple-600">
                              <Users className="h-8 w-8" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="truncate text-lg font-semibold text-gray-900">{rec.display_name}</h3>
                            <div className="ml-auto flex items-center gap-2">
                              <span className="text-xs font-semibold text-gray-700">{rec.match_score.toFixed(0)}</span>
                              <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className={`h-full ${getScoreColor(rec.match_score)} transition-all`}
                                  style={{ width: `${Math.min(rec.match_score, 100)}%` }}
                                />
                              </div>
                            </div>
                          </div>
                          {rec.primary_niche && (
                            <div className="mt-1">
                              <span className="inline-block rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-800">
                                {rec.primary_niche}
                              </span>
                            </div>
                          )}
                          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-500">
                            <span className="inline-flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              {formatNumber(rec.total_followers || 0)}
                            </span>
                            {rec.engagement_rate != null && (
                              <span>{rec.engagement_rate.toFixed(1)}% engagement</span>
                            )}
                            {rec.top_platforms && rec.top_platforms.length > 0 && (
                              <span className="truncate">{rec.top_platforms.join(" · ")}</span>
                            )}
                          </div>
                          <p className="mt-3 line-clamp-3 text-sm text-gray-700">
                            {rec.reason}
                          </p>
                          <div className="mt-4 grid grid-cols-2 gap-2">
                            <button
                              onClick={() => handleGenerateIdeas(rec.id)}
                              disabled={isLoadingIdeas}
                              className="flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
                              style={{ backgroundColor: "#FFC61A" }}
                            >
                              <Lightbulb className="h-4 w-4" />
                              {isLoadingIdeas ? "Generating..." : "Generate Ideas"}
                            </button>
                            <button
                              onClick={() => handleExpand(rec.id)}
                              className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                              {expandedCreator === rec.id ? (
                                <>
                                  <ChevronUp className="h-4 w-4 inline mr-1" />
                                  Hide
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="h-4 w-4 inline mr-1" />
                                  View Details
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                      {/* Expanded Details for AI Matches */}
                      {expandedCreator === rec.id && (
                        <div className="mt-4 border-t border-gray-200 pt-4">
                          {isLoadingDetails ? (
                            <div className="flex items-center justify-center py-4">
                              <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-purple-600"></div>
                            </div>
                          ) : expandedDetails ? (
                            <div className="space-y-4">
                              {expandedDetails.bio && (
                                <div>
                                  <h4 className="text-sm font-semibold text-gray-900">About</h4>
                                  <p className="mt-1 text-sm text-gray-600">{expandedDetails.bio}</p>
                                </div>
                              )}
                              <div>
                                <h4 className="text-sm font-semibold text-gray-900">Niches</h4>
                                <div className="mt-2 flex flex-wrap gap-2">
                                  <span className="inline-block rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-800">
                                    {expandedDetails.primary_niche}
                                  </span>
                                  {expandedDetails.secondary_niches?.map((niche, idx) => (
                                    <span
                                      key={idx}
                                      className="inline-block rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700"
                                    >
                                      {niche}
                                    </span>
                                  ))}
                                </div>
                              </div>
                              {expandedDetails.content_types && expandedDetails.content_types.length > 0 && (
                                <div>
                                  <h4 className="text-sm font-semibold text-gray-900">Content Types</h4>
                                  <div className="mt-2 flex flex-wrap gap-2">
                                    {expandedDetails.content_types.map((type, idx) => (
                                      <span
                                        key={idx}
                                        className="inline-block rounded-md bg-blue-50 px-2 py-1 text-xs text-blue-700"
                                      >
                                        {type}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {/* Generate Collaboration Ideas Button */}
                              <div className="mt-4">
                                <button
                                  onClick={() => handleGenerateIdeas(expandedDetails.id)}
                                  disabled={isLoadingIdeas}
                                  className="flex w-full items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                  style={{ backgroundColor: "#FFC61A" }}
                                >
                                  {isLoadingIdeas ? (
                                    <>
                                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                      Generating Ideas...
                                    </>
                                  ) : (
                                    <>
                                      <Lightbulb className="h-4 w-4" />
                                      Generate Collaboration Ideas
                                    </>
                                  )}
                                </button>
                              </div>
                              {/* Display First Idea */}
                              {collaborationIdeas.length > 0 && (
                                <div className="mt-4 rounded-lg border border-gray-200 bg-white p-4">
                                  <div className="mb-2 flex items-center gap-2">
                                    <Lightbulb className="h-4 w-4" style={{ color: "#FFC61A" }} />
                                    <h4 className="text-sm font-semibold text-gray-900">Collaboration Idea</h4>
                                  </div>
                                  <h5 className="text-base font-semibold text-gray-900">
                                    {collaborationIdeas[0].title}
                                  </h5>
                                  <p className="mt-2 text-sm text-gray-600">
                                    {collaborationIdeas[0].description}
                                  </p>
                                  <div className="mt-3 flex items-center gap-2">
                                    <span className="inline-block rounded-full bg-purple-100 px-2 py-1 text-xs font-medium text-purple-800">
                                      {collaborationIdeas[0].collaboration_type}
                                    </span>
                                  </div>
                                  <p className="mt-2 text-xs text-gray-500 italic">
                                    {collaborationIdeas[0].why_it_works}
                                  </p>
                                  <div className="mt-4 flex gap-2">
                                    <button
                                      onClick={() => handleProposeCollaboration(collaborationIdeas[0], expandedDetails.id)}
                                      className="flex-1 flex items-center justify-center gap-2 rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700"
                                    >
                                      <Send className="h-4 w-4" />
                                      Propose Collaboration
                                    </button>
                                    {collaborationIdeas.length > 1 && (
                                      <button
                                        onClick={() => setShowIdeasPopup(true)}
                                        className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                      >
                                        More Ideas ({collaborationIdeas.length - 1})
                                      </button>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : null}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>

        {/* Collaboration Ideas Popup Modal */}
        {showIdeasPopup && collaborationIdeas.length > 0 && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white shadow-xl">
              {/* Header */}
              <div className="sticky top-0 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" style={{ color: "#FFC61A" }} />
                  <h2 className="text-xl font-bold text-gray-900">Collaboration Ideas</h2>
                </div>
                <button
                  onClick={() => setShowIdeasPopup(false)}
                  className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Ideas List */}
              <div className="p-6">
                <div className="space-y-6">
                  {collaborationIdeas.map((idea, idx) => (
                    <div
                      key={idx}
                      className="rounded-lg border border-gray-200 bg-gray-50 p-5"
                    >
                      <div className="mb-2 flex items-center gap-2">
                        <span
                          className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white"
                          style={{ backgroundColor: "#FFC61A" }}
                        >
                          {idx + 1}
                        </span>
                        <h3 className="text-lg font-semibold text-gray-900">{idea.title}</h3>
                      </div>
                      <p className="mt-2 text-sm text-gray-700">{idea.description}</p>
                      <div className="mt-3 flex items-center gap-2">
                        <span className="inline-block rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-800">
                          {idea.collaboration_type}
                        </span>
                      </div>
                      <div className="mt-3 rounded-md bg-blue-50 p-3">
                        <p className="text-xs font-medium text-blue-900">Why it works:</p>
                        <p className="mt-1 text-xs text-blue-800">{idea.why_it_works}</p>
                      </div>
                      <button
                        onClick={() => {
                          const creatorId = expandedCreator || recommended.find(r => r.id === expandedCreator)?.id;
                          if (creatorId) {
                            handleProposeCollaboration(idea, creatorId);
                            setShowIdeasPopup(false);
                          }
                        }}
                        className="mt-4 w-full flex items-center justify-center gap-2 rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700"
                      >
                        <Send className="h-4 w-4" />
                        Propose This Collaboration
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 border-t border-gray-200 bg-gray-50 px-6 py-4">
                <button
                  onClick={() => setShowIdeasPopup(false)}
                  className="w-full rounded-md px-4 py-2 text-sm font-medium text-white transition-colors"
                  style={{ backgroundColor: "#FFC61A" }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Proposal Modal */}
        {showProposalModal && selectedIdea && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white shadow-xl">
              {/* Header */}
              <div className="sticky top-0 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
                <div className="flex items-center gap-2">
                  <Send className="h-5 w-5 text-purple-600" />
                  <h2 className="text-xl font-bold text-gray-900">Propose Collaboration</h2>
                </div>
                <button
                  onClick={() => setShowProposalModal(false)}
                  className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmitProposal} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                  <input
                    type="text"
                    value={proposalData.title}
                    onChange={(e) => setProposalData({ ...proposalData, title: e.target.value })}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={proposalData.description}
                    onChange={(e) => setProposalData({ ...proposalData, description: e.target.value })}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    rows={4}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message to Creator *</label>
                  <textarea
                    value={proposalData.proposal_message}
                    onChange={(e) => setProposalData({ ...proposalData, proposal_message: e.target.value })}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    rows={4}
                    required
                    placeholder="Introduce yourself and explain why you'd like to collaborate..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date (Optional)</label>
                    <input
                      type="date"
                      value={proposalData.start_date}
                      onChange={(e) => setProposalData({ ...proposalData, start_date: e.target.value })}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date (Optional)</label>
                    <input
                      type="date"
                      value={proposalData.end_date}
                      onChange={(e) => setProposalData({ ...proposalData, end_date: e.target.value })}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <button
                    type="submit"
                    disabled={isSubmittingProposal}
                    className="flex-1 rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmittingProposal ? "Sending..." : "Send Proposal"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowProposalModal(false)}
                    className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
