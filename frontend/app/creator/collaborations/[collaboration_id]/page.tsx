"use client";

import AuthGuard from "@/components/auth/AuthGuard";
import SlidingMenu from "@/components/SlidingMenu";
import {
  getCollaborationWorkspace,
  createDeliverable,
  updateDeliverable,
  sendMessage,
  uploadAsset,
  completeCollaboration,
  submitFeedback,
  type CollaborationWorkspace,
  type CollaborationDeliverable,
  type CollaborationMessage,
} from "@/lib/api/collaborations";
import { getUserProfile } from "@/lib/auth-helpers";
import {
  ArrowLeft,
  Check,
  Clock,
  FileText,
  Link as LinkIcon,
  MessageSquare,
  Plus,
  Send,
  Sparkles,
  Star,
  Upload,
  X,
} from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";

export default function CollaborationWorkspacePage() {
  const router = useRouter();
  const params = useParams();
  const collaborationId = params.collaboration_id as string;

  const [workspace, setWorkspace] = useState<CollaborationWorkspace | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "deliverables" | "messages" | "assets">("overview");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Deliverables state
  const [showAddDeliverable, setShowAddDeliverable] = useState(false);
  const [newDeliverable, setNewDeliverable] = useState({
    description: "",
    due_date: "",
  });

  // Messages state
  const [messageText, setMessageText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Assets state
  const [showAddAsset, setShowAddAsset] = useState(false);
  const [newAsset, setNewAsset] = useState({
    url: "",
    type: "",
  });

  // Feedback state
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState({ rating: 5, feedback: "" });

  useEffect(() => {
    loadWorkspace();
    loadCurrentUser();
  }, [collaborationId]);

  useEffect(() => {
    scrollToBottom();
  }, [workspace?.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

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

  const loadWorkspace = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getCollaborationWorkspace(collaborationId);
      setWorkspace(data);
    } catch (err: any) {
      console.error("Failed to load workspace:", err);
      setError(err?.message || "Failed to load workspace. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateDeliverable = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      await createDeliverable(collaborationId, {
        description: newDeliverable.description,
        due_date: newDeliverable.due_date || undefined,
      });
      setShowAddDeliverable(false);
      setNewDeliverable({
        description: "",
        due_date: "",
      });
      await loadWorkspace();
    } catch (err: any) {
      console.error("Failed to create deliverable:", err);
      setError(err?.message || "Failed to create deliverable. Please try again.");
    }
  };

  const handleUpdateDeliverableStatus = async (deliverableId: string, status: string) => {
    try {
      setError(null);
      await updateDeliverable(collaborationId, deliverableId, { status });
      await loadWorkspace();
    } catch (err: any) {
      console.error("Failed to update deliverable:", err);
      setError(err?.message || "Failed to update deliverable. Please try again.");
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    try {
      setError(null);
      await sendMessage(collaborationId, { message: messageText });
      setMessageText("");
      await loadWorkspace();
    } catch (err: any) {
      console.error("Failed to send message:", err);
      setError(err?.message || "Failed to send message. Please try again.");
    }
  };

  const handleUploadAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      await uploadAsset(collaborationId, {
        url: newAsset.url,
        type: newAsset.type || undefined,
      });
      setShowAddAsset(false);
      setNewAsset({
        url: "",
        type: "",
      });
      await loadWorkspace();
    } catch (err: any) {
      console.error("Failed to upload asset:", err);
      setError(err?.message || "Failed to upload asset. Please try again.");
    }
  };

  const handleComplete = async () => {
    if (!confirm("Are you sure all deliverables are complete? This will mark the collaboration as completed.")) {
      return;
    }
    try {
      setError(null);
      await completeCollaboration(collaborationId);
      await loadWorkspace();
    } catch (err: any) {
      console.error("Failed to complete collaboration:", err);
      setError(err?.message || "Failed to complete collaboration. Please try again.");
    }
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      await submitFeedback(collaborationId, feedback);
      setShowFeedback(false);
      setFeedback({ rating: 5, feedback: "" });
      await loadWorkspace();
    } catch (err: any) {
      console.error("Failed to submit feedback:", err);
      setError(err?.message || "Failed to submit feedback. Please try again.");
    }
  };

  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      in_progress: "bg-blue-100 text-blue-800",
      completed: "bg-green-100 text-green-800",
      approved: "bg-purple-100 text-purple-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString: string | null): string => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString();
  };

  const isMyMessage = (message: CollaborationMessage): boolean => {
    return message.sender_id === currentUserId;
  };

  const canComplete = (): boolean => {
    if (!workspace) return false;
    if (workspace.collaboration.status !== "accepted" && workspace.collaboration.status !== "planning" && workspace.collaboration.status !== "active") {
      return false;
    }
    if (workspace.deliverables.length === 0) return true;
    return workspace.deliverables.every((d) => d.status === "completed");
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

  if (isLoading) {
    return (
      <AuthGuard requiredRole="Creator">
        <div className="min-h-screen bg-linear-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-purple-600"></div>
            <p className="text-gray-600">Loading workspace...</p>
          </div>
        </div>
      </AuthGuard>
    );
  }

  if (!workspace) {
    return (
      <AuthGuard requiredRole="Creator">
        <div className="min-h-screen bg-linear-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600">Workspace not found</p>
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard requiredRole="Creator">
      <div className="min-h-screen bg-linear-to-br from-purple-50 via-white to-blue-50">
        <SlidingMenu role="creator" />

        {/* Header */}
        <header className="border-b border-gray-200 bg-white">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push("/creator/collaborations/manage")}
                className="rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
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
          </div>
        </header>

        {/* Main Content */}
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {error && (
            <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4 text-red-800">
              {error}
            </div>
          )}

          {/* Collaboration Header */}
          <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold text-gray-900">{workspace.collaboration.title}</h2>
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(workspace.collaboration.status)}`}>
                    {workspace.collaboration.status}
                  </span>
                </div>
                <p className="text-gray-600 mb-4">{workspace.collaboration.description || "No description provided."}</p>
                <div className="flex items-center gap-6 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Collaborating with:</span>
                    <div className="flex items-center gap-2">
                      {workspace.other_creator.profile_picture_url ? (
                        <img
                          src={workspace.other_creator.profile_picture_url}
                          alt={workspace.other_creator.display_name}
                          className="h-6 w-6 rounded-full"
                        />
                      ) : (
                        <div className="h-6 w-6 rounded-full bg-purple-100"></div>
                      )}
                      <span>{workspace.other_creator.display_name}</span>
                    </div>
                  </div>
                  <span>Type: {workspace.collaboration.collaboration_type}</span>
                </div>
              </div>
              {canComplete() && workspace.collaboration.status !== "completed" && (
                <button
                  onClick={handleComplete}
                  className="flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                >
                  <Check className="h-4 w-4" />
                  Mark Complete
                </button>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-6 flex gap-2 border-b border-gray-200">
            {["overview", "deliverables", "messages", "assets"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors capitalize ${
                  activeTab === tab
                    ? "border-purple-600 text-purple-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-lg border border-gray-200 bg-white p-4">
                  <div className="text-sm text-gray-500">Total Deliverables</div>
                  <div className="text-2xl font-bold text-gray-900 mt-1">{workspace.deliverables.length}</div>
                </div>
                <div className="rounded-lg border border-gray-200 bg-white p-4">
                  <div className="text-sm text-gray-500">Completed</div>
                  <div className="text-2xl font-bold text-green-600 mt-1">
                    {workspace.deliverables.filter((d) => d.status === "completed").length}
                  </div>
                </div>
                <div className="rounded-lg border border-gray-200 bg-white p-4">
                  <div className="text-sm text-gray-500">Messages</div>
                  <div className="text-2xl font-bold text-gray-900 mt-1">{workspace.messages.length}</div>
                </div>
              </div>

              {workspace.collaboration.status === "completed" && (
                <div className="rounded-lg border border-gray-200 bg-white p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Feedback</h3>
                  {workspace.feedback && workspace.feedback.length > 0 ? (
                    <div className="space-y-4">
                      {workspace.feedback.map((fb) => {
                        const isMyFeedback = fb.from_creator_id === currentUserId;
                        const otherCreatorName = isMyFeedback
                          ? workspace.other_creator.display_name
                          : "You";
                        return (
                          <div key={fb.id} className="border-b border-gray-200 pb-4 last:border-b-0 last:pb-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">
                                {isMyFeedback ? "Your feedback to " : "Feedback from "}
                                {otherCreatorName}:
                              </span>
                              {fb.rating && (
                                <div className="flex">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                      key={star}
                                      className={`h-4 w-4 ${
                                        star <= fb.rating!
                                          ? "text-yellow-400 fill-yellow-400"
                                          : "text-gray-300"
                                      }`}
                                    />
                                  ))}
                                </div>
                              )}
                            </div>
                            {fb.feedback && (
                              <p className="text-sm text-gray-600 mt-1">{fb.feedback}</p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm text-gray-600 mb-4">No feedback submitted yet.</p>
                    </div>
                  )}
                  {!showFeedback && workspace.feedback?.find((fb) => fb.from_creator_id === currentUserId) ? (
                    <p className="text-sm text-gray-500 mt-4">You have already submitted feedback.</p>
                  ) : !showFeedback ? (
                    <button
                      onClick={() => setShowFeedback(true)}
                      className="mt-4 rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700"
                    >
                      Submit Feedback
                    </button>
                  ) : null}

                  {showFeedback && (
                    <form onSubmit={handleSubmitFeedback} className="mt-4 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Rating (1-5)</label>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setFeedback({ ...feedback, rating: star })}
                              className="focus:outline-none"
                            >
                              <Star
                                className={`h-6 w-6 ${
                                  star <= feedback.rating
                                    ? "text-yellow-400 fill-yellow-400"
                                    : "text-gray-300"
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Feedback</label>
                        <textarea
                          value={feedback.feedback}
                          onChange={(e) => setFeedback({ ...feedback, feedback: e.target.value })}
                          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          rows={4}
                          placeholder="Share your thoughts about this collaboration..."
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          className="rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700"
                        >
                          Submit
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowFeedback(false)}
                          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === "deliverables" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Deliverables</h3>
                {workspace.collaboration.status !== "completed" && (
                  <button
                    onClick={() => setShowAddDeliverable(true)}
                    className="flex items-center gap-2 rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700"
                  >
                    <Plus className="h-4 w-4" />
                    Add Deliverable
                  </button>
                )}
              </div>

              {showAddDeliverable && (
                <form onSubmit={handleCreateDeliverable} className="rounded-lg border border-gray-200 bg-white p-6 space-y-4">
                  <h4 className="text-md font-semibold text-gray-900">New Deliverable</h4>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                    <textarea
                      value={newDeliverable.description}
                      onChange={(e) => setNewDeliverable({ ...newDeliverable, description: e.target.value })}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      rows={4}
                      required
                      placeholder="Describe what needs to be delivered..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                    <input
                      type="date"
                      value={newDeliverable.due_date}
                      onChange={(e) => setNewDeliverable({ ...newDeliverable, due_date: e.target.value })}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700"
                    >
                      Create
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddDeliverable(false)}
                      className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {workspace.deliverables.length === 0 ? (
                <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
                  <FileText className="mx-auto mb-4 h-16 w-16 text-gray-400" />
                  <h3 className="text-xl font-semibold text-gray-900">No deliverables</h3>
                  <p className="mt-2 text-gray-600">Add deliverables to track your collaboration progress.</p>
                </div>
              ) : (
                workspace.deliverables.map((deliverable) => (
                  <div
                    key={deliverable.id}
                    className="rounded-lg border border-gray-200 bg-white p-6"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(deliverable.status)}`}>
                            {deliverable.status}
                          </span>
                          {deliverable.due_date && (
                            <span className="flex items-center gap-1 text-sm text-gray-500">
                              <Clock className="h-4 w-4" />
                              Due: {formatDate(deliverable.due_date)}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-900 mb-3">{deliverable.description}</p>
                        {deliverable.submission_url && (
                          <div className="mt-2">
                            <a
                              href={deliverable.submission_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-purple-600 hover:text-purple-700 underline"
                            >
                              View Submission
                            </a>
                          </div>
                        )}
                      </div>
                      {workspace.collaboration.status !== "completed" && (
                        <div className="flex gap-2">
                          {deliverable.status !== "completed" && (
                            <button
                              onClick={() => handleUpdateDeliverableStatus(deliverable.id, "completed")}
                              className="flex items-center gap-2 rounded-md bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700"
                            >
                              <Check className="h-3 w-3" />
                              Mark Complete
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "messages" && (
            <div className="flex flex-col h-[600px] rounded-lg border border-gray-200 bg-white">
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {workspace.messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <div className="text-center">
                      <MessageSquare className="mx-auto mb-4 h-16 w-16 text-gray-400" />
                      <p>No messages yet. Start the conversation!</p>
                    </div>
                  </div>
                ) : (
                  workspace.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${isMyMessage(message) ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          isMyMessage(message)
                            ? "bg-purple-600 text-white"
                            : "bg-gray-100 text-gray-900"
                        }`}
                      >
                        <p className="text-sm">{message.message}</p>
                        <p className={`text-xs mt-1 ${isMyMessage(message) ? "text-purple-200" : "text-gray-500"}`}>
                          {formatDateTime(message.created_at)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>
              {workspace.collaboration.status !== "completed" && workspace.collaboration.status !== "declined" && (
                <form onSubmit={handleSendMessage} className="border-t border-gray-200 p-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Type a message..."
                    />
                    <button
                      type="submit"
                      className="rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {activeTab === "assets" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Shared Assets</h3>
                {workspace.collaboration.status !== "completed" && (
                  <button
                    onClick={() => setShowAddAsset(true)}
                    className="flex items-center gap-2 rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700"
                  >
                    <Upload className="h-4 w-4" />
                    Add Asset
                  </button>
                )}
              </div>

              {showAddAsset && (
                <form onSubmit={handleUploadAsset} className="rounded-lg border border-gray-200 bg-white p-6 space-y-4">
                  <h4 className="text-md font-semibold text-gray-900">Share Asset (URL)</h4>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">URL *</label>
                    <input
                      type="url"
                      value={newAsset.url}
                      onChange={(e) => setNewAsset({ ...newAsset, url: e.target.value })}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="https://..."
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type (Optional)</label>
                    <input
                      type="text"
                      value={newAsset.type}
                      onChange={(e) => setNewAsset({ ...newAsset, type: e.target.value })}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="e.g., image, video, document"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700"
                    >
                      Share
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddAsset(false)}
                      className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {workspace.assets.length === 0 ? (
                <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
                  <Upload className="mx-auto mb-4 h-16 w-16 text-gray-400" />
                  <h3 className="text-xl font-semibold text-gray-900">No assets shared</h3>
                  <p className="mt-2 text-gray-600">Share files, links, or resources with your collaborator.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {workspace.assets.map((asset) => (
                    <div
                      key={asset.id}
                      className="rounded-lg border border-gray-200 bg-white p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          {asset.type && (
                            <span className="inline-block rounded-full bg-purple-100 px-2 py-1 text-xs font-medium text-purple-800 mb-2">
                              {asset.type}
                            </span>
                          )}
                          <a
                            href={asset.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-purple-600 hover:text-purple-700 break-all flex items-center gap-1"
                          >
                            <LinkIcon className="h-4 w-4" />
                            {asset.url}
                          </a>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">{formatDate(asset.created_at)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </AuthGuard>
  );
}

