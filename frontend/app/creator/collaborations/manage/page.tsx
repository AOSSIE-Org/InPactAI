"use client";

import AuthGuard from "@/components/auth/AuthGuard";
import SlidingMenu from "@/components/SlidingMenu";
import {
  getMyCollaborations,
  acceptCollaboration,
  declineCollaboration,
  type Collaboration,
} from "@/lib/api/collaborations";
import { getUserProfile } from "@/lib/auth-helpers";
import { Check, X, Clock, Users, Sparkles, MessageSquare, FileText } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ManageCollaborationsPage() {
  const router = useRouter();
  const [collaborations, setCollaborations] = useState<Collaboration[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<Collaboration[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<Collaboration[]>([]);
  const [proposedCollaborations, setProposedCollaborations] = useState<Collaboration[]>([]);
  const [activeCollaborations, setActiveCollaborations] = useState<Collaboration[]>([]);
  const [completedCollaborations, setCompletedCollaborations] = useState<Collaboration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"proposed" | "incoming" | "outgoing" | "active" | "completed">("proposed");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    loadCollaborations();
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    try {
      const profile = await getUserProfile();
      if (profile?.id) {
        setCurrentUserId(profile.id);
      }
    } catch (err) {
      console.error("Failed to load user profile:", err);
    }
  };

  const loadCollaborations = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getMyCollaborations();
      setCollaborations(data);

      // Determine current creator ID from collaborations
      // The current creator is either creator1_id or creator2_id in each collaboration
      // We'll use the first collaboration to determine which one we are
      let currentCreatorId: string | null = null;
      if (data.length > 0) {
        const firstCollab = data[0];
        // We need to determine which creator we are
        // We'll check if we're the initiator of any collaboration
        // If we're the initiator, we know our creator ID
        const initiatorCollab = data.find(c => c.initiator_id);
        if (initiatorCollab && initiatorCollab.initiator_id) {
          // Check if we're creator1 or creator2
          if (initiatorCollab.creator1_id === initiatorCollab.initiator_id) {
            currentCreatorId = initiatorCollab.creator1_id;
          } else if (initiatorCollab.creator2_id === initiatorCollab.initiator_id) {
            currentCreatorId = initiatorCollab.creator2_id;
          }
        }
        // If we couldn't determine from initiator, use creator1_id from first collab
        // (This is a fallback - in practice, we should get creator ID from backend)
        if (!currentCreatorId) {
          currentCreatorId = firstCollab.creator1_id;
        }
      }

      setCurrentUserId(currentCreatorId);

      // Filter collaborations based on initiator_id
      const incoming = data.filter(
        (collab) => collab.status === "proposed" && collab.initiator_id && collab.initiator_id !== currentCreatorId
      );
      const outgoing = data.filter(
        (collab) => collab.status === "proposed" && collab.initiator_id === currentCreatorId
      );
      const proposed = data.filter((collab) => collab.status === "proposed");
      const active = data.filter((collab) =>
        ["accepted", "planning", "active"].includes(collab.status)
      );
      const completed = data.filter((collab) => collab.status === "completed");

      setIncomingRequests(incoming);
      setOutgoingRequests(outgoing);
      setProposedCollaborations(proposed);
      setActiveCollaborations(active);
      setCompletedCollaborations(completed);
    } catch (err: any) {
      console.error("Failed to load collaborations:", err);
      setError(err?.message || "Failed to load collaborations. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = async (collaborationId: string) => {
    try {
      setError(null);
      await acceptCollaboration(collaborationId);
      await loadCollaborations();
    } catch (err: any) {
      console.error("Failed to accept collaboration:", err);
      setError(err?.message || "Failed to accept collaboration. Please try again.");
    }
  };

  const handleDecline = async (collaborationId: string) => {
    if (!confirm("Are you sure you want to decline this collaboration?")) {
      return;
    }
    try {
      setError(null);
      await declineCollaboration(collaborationId);
      await loadCollaborations();
    } catch (err: any) {
      console.error("Failed to decline collaboration:", err);
      setError(err?.message || "Failed to decline collaboration. Please try again.");
    }
  };

  const handleOpenWorkspace = (collaborationId: string) => {
    router.push(`/creator/collaborations/${collaborationId}`);
  };

  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      proposed: "bg-yellow-100 text-yellow-800",
      accepted: "bg-blue-100 text-blue-800",
      planning: "bg-purple-100 text-purple-800",
      active: "bg-green-100 text-green-800",
      completed: "bg-gray-100 text-gray-800",
      declined: "bg-red-100 text-red-800",
      cancelled: "bg-gray-100 text-gray-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
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

  const renderCollaborationCard = (collab: Collaboration, showActions: boolean = false) => {
    const isInitiator = currentUserId === collab.initiator_id;

    return (
      <div
        key={collab.id}
        className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-semibold text-gray-900">{collab.title}</h3>
              <span className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(collab.status)}`}>
                {collab.status}
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-3">{collab.description || "No description provided."}</p>
            <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                Proposed: {formatDate(collab.proposed_at)}
              </span>
              {collab.accepted_at && (
                <span className="flex items-center gap-1">
                  <Check className="h-4 w-4" />
                  Accepted: {formatDate(collab.accepted_at)}
                </span>
              )}
              {collab.start_date && (
                <span>Start: {formatDate(collab.start_date)}</span>
              )}
              {collab.end_date && (
                <span>End: {formatDate(collab.end_date)}</span>
              )}
            </div>
            {collab.proposal_message && (
              <div className="mb-3 p-3 bg-gray-50 rounded-md">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Message: </span>
                  {collab.proposal_message}
                </p>
              </div>
            )}
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-600">Type:</span>
              <span className="text-xs text-gray-500">{collab.collaboration_type}</span>
            </div>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2">
          {showActions && !isInitiator && collab.status === "proposed" && (
            <>
              <button
                onClick={() => handleAccept(collab.id)}
                className="flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
              >
                <Check className="h-4 w-4" />
                Accept
              </button>
              <button
                onClick={() => handleDecline(collab.id)}
                className="flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                <X className="h-4 w-4" />
                Decline
              </button>
            </>
          )}
          {!showActions && (collab.status === "accepted" || collab.status === "planning" || collab.status === "active") && (
            <button
              onClick={() => handleOpenWorkspace(collab.id)}
              className="flex items-center gap-2 rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700"
            >
              <MessageSquare className="h-4 w-4" />
              Open Workspace
            </button>
          )}
          {collab.status === "completed" && (
            <button
              onClick={() => handleOpenWorkspace(collab.id)}
              className="flex items-center gap-2 rounded-md bg-gray-600 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
            >
              <FileText className="h-4 w-4" />
              View Details
            </button>
          )}
        </div>
      </div>
    );
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
            <h2 className="text-3xl font-bold text-gray-900">Manage Collaborations</h2>
            <p className="mt-2 text-gray-600">View and manage your collaboration requests and active collaborations</p>
          </div>

          {error && (
            <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4 text-red-800">
              {error}
            </div>
          )}

          {/* Tabs */}
          <div className="mb-6 flex gap-2 border-b border-gray-200 overflow-x-auto">
            <button
              onClick={() => setActiveTab("proposed")}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === "proposed"
                  ? "border-purple-600 text-purple-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Proposed ({proposedCollaborations.length})
            </button>
            <button
              onClick={() => setActiveTab("incoming")}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === "incoming"
                  ? "border-purple-600 text-purple-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Incoming ({incomingRequests.length})
            </button>
            <button
              onClick={() => setActiveTab("outgoing")}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === "outgoing"
                  ? "border-purple-600 text-purple-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Outgoing ({outgoingRequests.length})
            </button>
            <button
              onClick={() => setActiveTab("active")}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === "active"
                  ? "border-purple-600 text-purple-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Active ({activeCollaborations.length})
            </button>
            <button
              onClick={() => setActiveTab("completed")}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === "completed"
                  ? "border-purple-600 text-purple-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Completed ({completedCollaborations.length})
            </button>
          </div>

          {/* Content */}
          {isLoading ? (
            <div className="flex min-h-[60vh] items-center justify-center">
              <div className="text-center">
                <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-purple-600"></div>
                <p className="text-gray-600">Loading collaborations...</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {activeTab === "proposed" && (
                <>
                  {proposedCollaborations.length === 0 ? (
                    <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
                      <Clock className="mx-auto mb-4 h-16 w-16 text-gray-400" />
                      <h3 className="text-xl font-semibold text-gray-900">No proposed collaborations</h3>
                      <p className="mt-2 text-gray-600">You don't have any pending collaboration proposals.</p>
                      <button
                        onClick={() => router.push("/creator/collaborations")}
                        className="mt-4 rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700"
                      >
                        Find Creators to Collaborate
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Incoming Section */}
                      {incomingRequests.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-3">Incoming Requests</h3>
                          <div className="space-y-4 mb-6">
                            {incomingRequests.map((collab) => renderCollaborationCard(collab, true))}
                          </div>
                        </div>
                      )}
                      {/* Outgoing Section */}
                      {outgoingRequests.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-3">Outgoing Requests</h3>
                          <div className="space-y-4">
                            {outgoingRequests.map((collab) => renderCollaborationCard(collab, false))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}

              {activeTab === "incoming" && (
                <>
                  {incomingRequests.length === 0 ? (
                    <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
                      <Users className="mx-auto mb-4 h-16 w-16 text-gray-400" />
                      <h3 className="text-xl font-semibold text-gray-900">No incoming requests</h3>
                      <p className="mt-2 text-gray-600">You don't have any pending collaboration requests.</p>
                    </div>
                  ) : (
                    incomingRequests.map((collab) => renderCollaborationCard(collab, true))
                  )}
                </>
              )}

              {activeTab === "outgoing" && (
                <>
                  {outgoingRequests.length === 0 ? (
                    <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
                      <Clock className="mx-auto mb-4 h-16 w-16 text-gray-400" />
                      <h3 className="text-xl font-semibold text-gray-900">No outgoing requests</h3>
                      <p className="mt-2 text-gray-600">You haven't sent any collaboration proposals yet.</p>
                    </div>
                  ) : (
                    outgoingRequests.map((collab) => renderCollaborationCard(collab, false))
                  )}
                </>
              )}

              {activeTab === "active" && (
                <>
                  {activeCollaborations.length === 0 ? (
                    <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
                      <MessageSquare className="mx-auto mb-4 h-16 w-16 text-gray-400" />
                      <h3 className="text-xl font-semibold text-gray-900">No active collaborations</h3>
                      <p className="mt-2 text-gray-600">You don't have any active collaborations at the moment.</p>
                    </div>
                  ) : (
                    activeCollaborations.map((collab) => renderCollaborationCard(collab, false))
                  )}
                </>
              )}

              {activeTab === "completed" && (
                <>
                  {completedCollaborations.length === 0 ? (
                    <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
                      <FileText className="mx-auto mb-4 h-16 w-16 text-gray-400" />
                      <h3 className="text-xl font-semibold text-gray-900">No completed collaborations</h3>
                      <p className="mt-2 text-gray-600">You haven't completed any collaborations yet.</p>
                    </div>
                  ) : (
                    completedCollaborations.map((collab) => renderCollaborationCard(collab, false))
                  )}
                </>
              )}
            </div>
          )}
        </main>
      </div>
    </AuthGuard>
  );
}

