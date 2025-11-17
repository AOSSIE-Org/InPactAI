import { authenticatedFetch } from "../auth-helpers";

const API_BASE_URL = "https://in-pact-ai-1k47.vercel.app";

export interface CollaborationIdea {
  title: string;
  description: string;
  collaboration_type: string;
  why_it_works: string;
}

export interface CollaborationIdeasResponse {
  ideas: CollaborationIdea[];
}

/**
 * Generate collaboration ideas between the current creator and a target creator
 */
export async function generateCollaborationIdeas(
  targetCreatorId: string
): Promise<CollaborationIdeasResponse> {
  const url = `${API_BASE_URL}/collaborations/generate-ideas`;
  const response = await authenticatedFetch(url, {
    method: "POST",
    body: JSON.stringify({ target_creator_id: targetCreatorId }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.detail || `Failed to generate collaboration ideas: ${response.statusText}`
    );
  }

  return response.json();
}

export interface CreatorRecommendationForIdea {
  creator_id: string;
  display_name: string;
  profile_picture_url: string | null;
  primary_niche: string;
  match_score: number;
  reasoning: string;
}

export interface RecommendCreatorResponse {
  recommended_creator: CreatorRecommendationForIdea;
  alternatives: CreatorRecommendationForIdea[];
}

/**
 * Recommend the best creator from a list of candidates for a collaboration idea
 */
export async function recommendCreatorForIdea(
  collaborationIdea: string,
  candidateCreatorIds: string[]
): Promise<RecommendCreatorResponse> {
  const url = `${API_BASE_URL}/collaborations/recommend-creator`;
  const response = await authenticatedFetch(url, {
    method: "POST",
    body: JSON.stringify({
      collaboration_idea: collaborationIdea,
      candidate_creator_ids: candidateCreatorIds,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.detail || `Failed to get recommendation: ${response.statusText}`
    );
  }

  return response.json();
}

// ========== Collaboration Types ==========

export interface Collaboration {
  id: string;
  creator1_id: string;
  creator2_id: string;
  collaboration_type: string;
  title: string;
  description: string | null;
  status: string;
  match_score: number | null;
  ai_suggestions: any;
  start_date: string | null;
  end_date: string | null;
  planned_deliverables: any;
  completed_deliverables: any[] | null;
  initiator_id: string | null;
  proposal_message: string | null;
  response_message: string | null;
  total_views: number;
  total_engagement: number;
  audience_growth: any;
  creator1_rating: number | null;
  creator1_feedback: string | null;
  creator2_rating: number | null;
  creator2_feedback: string | null;
  proposed_at: string;
  accepted_at: string | null;
  completed_at: string | null;
}

export interface CollaborationDeliverable {
  id: string;
  collaboration_id: string;
  description: string;
  due_date: string | null;
  status: string;
  submission_url: string | null;
  created_at: string;
}

export interface CollaborationMessage {
  id: string;
  collaboration_id: string;
  sender_id: string;
  message: string;
  created_at: string;
}

export interface CollaborationAsset {
  id: string;
  collaboration_id: string;
  uploaded_by: string;
  url: string;
  type: string | null;
  created_at: string;
}

export interface CollaborationFeedback {
  id: string;
  collaboration_id: string;
  from_creator_id: string;
  to_creator_id: string;
  rating: number | null;
  feedback: string | null;
  created_at: string;
}

export interface CollaborationWorkspace {
  collaboration: Collaboration;
  deliverables: CollaborationDeliverable[];
  messages: CollaborationMessage[];
  assets: CollaborationAsset[];
  feedback: CollaborationFeedback[];
  other_creator: {
    id: string;
    display_name: string;
    profile_picture_url: string | null;
    primary_niche: string;
  };
}

// ========== Collaboration Management ==========

/**
 * Get all collaborations for the current creator
 */
export async function getMyCollaborations(
  status?: string
): Promise<Collaboration[]> {
  const url = `${API_BASE_URL}/collaborations${status ? `?status=${status}` : ""}`;
  const response = await authenticatedFetch(url);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.detail || `Failed to fetch collaborations: ${response.statusText}`
    );
  }

  return response.json();
}

/**
 * Get a single collaboration by ID
 */
export async function getCollaboration(
  collaborationId: string
): Promise<Collaboration> {
  const url = `${API_BASE_URL}/collaborations/${collaborationId}`;
  const response = await authenticatedFetch(url);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.detail || `Failed to fetch collaboration: ${response.statusText}`
    );
  }

  return response.json();
}

/**
 * Propose a collaboration to another creator
 */
export async function proposeCollaboration(data: {
  target_creator_id: string;
  collaboration_type: string;
  title: string;
  description?: string;
  proposal_message?: string;
  start_date?: string;
  end_date?: string;
  planned_deliverables?: any;
}): Promise<Collaboration> {
  const url = `${API_BASE_URL}/collaborations/propose`;
  const response = await authenticatedFetch(url, {
    method: "POST",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.detail || `Failed to propose collaboration: ${response.statusText}`
    );
  }

  return response.json();
}

/**
 * Accept a collaboration proposal
 */
export async function acceptCollaboration(
  collaborationId: string,
  responseMessage?: string
): Promise<Collaboration> {
  const url = `${API_BASE_URL}/collaborations/${collaborationId}/accept`;
  const response = await authenticatedFetch(url, {
    method: "POST",
    body: JSON.stringify({ response_message: responseMessage }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.detail || `Failed to accept collaboration: ${response.statusText}`
    );
  }

  return response.json();
}

/**
 * Decline a collaboration proposal
 */
export async function declineCollaboration(
  collaborationId: string,
  responseMessage?: string
): Promise<Collaboration> {
  const url = `${API_BASE_URL}/collaborations/${collaborationId}/decline`;
  const response = await authenticatedFetch(url, {
    method: "POST",
    body: JSON.stringify({ response_message: responseMessage }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.detail || `Failed to decline collaboration: ${response.statusText}`
    );
  }

  return response.json();
}

/**
 * Get collaboration workspace (full details with deliverables, messages, assets)
 */
export async function getCollaborationWorkspace(
  collaborationId: string
): Promise<CollaborationWorkspace> {
  const url = `${API_BASE_URL}/collaborations/${collaborationId}/workspace`;
  const response = await authenticatedFetch(url);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.detail || `Failed to fetch workspace: ${response.statusText}`
    );
  }

  return response.json();
}

// ========== Deliverables ==========

/**
 * Create a new deliverable
 */
export async function createDeliverable(
  collaborationId: string,
  data: {
    description: string;
    due_date?: string;
  }
): Promise<CollaborationDeliverable> {
  const url = `${API_BASE_URL}/collaborations/${collaborationId}/deliverables`;
  const response = await authenticatedFetch(url, {
    method: "POST",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.detail || `Failed to create deliverable: ${response.statusText}`
    );
  }

  return response.json();
}

/**
 * Update a deliverable
 */
export async function updateDeliverable(
  collaborationId: string,
  deliverableId: string,
  data: {
    description?: string;
    due_date?: string;
    status?: string;
    submission_url?: string;
  }
): Promise<CollaborationDeliverable> {
  const url = `${API_BASE_URL}/collaborations/${collaborationId}/deliverables/${deliverableId}`;
  const response = await authenticatedFetch(url, {
    method: "PATCH",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.detail || `Failed to update deliverable: ${response.statusText}`
    );
  }

  return response.json();
}

// ========== Messages ==========

/**
 * Send a message in a collaboration
 */
export async function sendMessage(
  collaborationId: string,
  data: {
    message: string;
  }
): Promise<CollaborationMessage> {
  const url = `${API_BASE_URL}/collaborations/${collaborationId}/messages`;
  const response = await authenticatedFetch(url, {
    method: "POST",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.detail || `Failed to send message: ${response.statusText}`
    );
  }

  return response.json();
}

// ========== Assets ==========

/**
 * Upload/share an asset (file URL) in a collaboration
 */
export async function uploadAsset(
  collaborationId: string,
  data: {
    url: string;
    type?: string;
  }
): Promise<CollaborationAsset> {
  const url = `${API_BASE_URL}/collaborations/${collaborationId}/assets`;
  const response = await authenticatedFetch(url, {
    method: "POST",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.detail || `Failed to upload asset: ${response.statusText}`
    );
  }

  return response.json();
}

// ========== Completion & Feedback ==========

/**
 * Mark a collaboration as complete
 */
export async function completeCollaboration(
  collaborationId: string
): Promise<Collaboration> {
  const url = `${API_BASE_URL}/collaborations/${collaborationId}/complete`;
  const response = await authenticatedFetch(url, {
    method: "POST",
    body: JSON.stringify({}),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.detail || `Failed to complete collaboration: ${response.statusText}`
    );
  }

  return response.json();
}

/**
 * Submit feedback and rating for a completed collaboration
 */
export async function submitFeedback(
  collaborationId: string,
  data: {
    rating: number;
    feedback?: string;
  }
): Promise<CollaborationFeedback> {
  const url = `${API_BASE_URL}/collaborations/${collaborationId}/feedback`;
  const response = await authenticatedFetch(url, {
    method: "POST",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.detail || `Failed to submit feedback: ${response.statusText}`
    );
  }

  return response.json();
}

