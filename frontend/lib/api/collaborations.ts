import { authenticatedFetch } from "../auth-helpers";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

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

