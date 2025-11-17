import { authenticatedFetch } from "@/lib/auth-helpers";
import {
  AcceptNegotiationResponse,
  Contract,
  ContractChatMessage,
  ContractVersion,
  ContractVersionCreate,
  Deliverable,
  DeliverableCreate,
  Proposal,
} from "@/types/proposals";

const API_BASE_URL = "https://in-pact-ai-1k47.vercel.app";

async function parseJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let detail = "Request failed";
    try {
      const errorBody = await response.json();
      detail = errorBody.detail || errorBody.error || detail;
    } catch {
      // ignore JSON parse errors
    }
    throw new Error(detail);
  }
  return response.json();
}

function buildQuery(params?: Record<string, string | number | undefined>) {
  if (!params) return "";
  const query = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== "")
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join("&");
  return query ? `?${query}` : "";
}

export async function createProposal(payload: {
  campaign_id: string;
  creator_id?: string; // Optional: required for brands, auto-filled for creators
  subject: string;
  message: string;
  proposed_amount?: number;
  content_ideas?: string[];
  ideal_pricing?: string;
}): Promise<Proposal> {
  const response = await authenticatedFetch(`${API_BASE_URL}/proposals`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return parseJson<Proposal>(response);
}

export async function fetchSentProposals(params?: {
  status?: string;
  negotiationStatus?: string;
  limit?: number;
  offset?: number;
}): Promise<Proposal[]> {
  const query = buildQuery({
    status: params?.status,
    negotiation_status: params?.negotiationStatus,
    limit: params?.limit,
    offset: params?.offset,
  });
  const response = await authenticatedFetch(
    `${API_BASE_URL}/proposals/sent${query}`
  );
  return parseJson<Proposal[]>(response);
}

export async function fetchReceivedProposals(params?: {
  status?: string;
  negotiationStatus?: string;
  limit?: number;
  offset?: number;
}): Promise<Proposal[]> {
  const query = buildQuery({
    status: params?.status,
    negotiation_status: params?.negotiationStatus,
    limit: params?.limit,
    offset: params?.offset,
  });
  const response = await authenticatedFetch(
    `${API_BASE_URL}/proposals/received${query}`
  );
  return parseJson<Proposal[]>(response);
}

export async function fetchNegotiations(params?: {
  status?: string;
}): Promise<Proposal[]> {
  const query = buildQuery({
    status: params?.status,
  });
  const response = await authenticatedFetch(
    `${API_BASE_URL}/proposals/negotiations${query}`
  );
  return parseJson<Proposal[]>(response);
}

export async function postProposalStatus(
  proposalId: string,
  status: string
): Promise<Proposal> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/proposals/${proposalId}/status`,
    {
      method: "PUT",
      body: JSON.stringify({ status }),
    }
  );
  return parseJson<Proposal>(response);
}

export async function deleteProposal(proposalId: string): Promise<void> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/proposals/${proposalId}`,
    {
      method: "DELETE",
    }
  );
  if (!response.ok && response.status !== 204) {
    let detail = "Failed to delete proposal";
    try {
      const errorBody = await response.json();
      detail = errorBody.detail || detail;
    } catch {
      // ignore JSON parse errors
    }
    throw new Error(detail);
  }
}

export async function startNegotiation(
  proposalId: string,
  payload: { initial_message?: string; proposed_terms?: Record<string, any> }
): Promise<Proposal> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/proposals/${proposalId}/negotiation/start`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
  return parseJson<Proposal>(response);
}

export async function postNegotiationMessage(
  proposalId: string,
  message: string
): Promise<Proposal> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/proposals/${proposalId}/negotiation/messages`,
    {
      method: "POST",
      body: JSON.stringify({ message }),
    }
  );
  return parseJson<Proposal>(response);
}

export async function updateNegotiationTerms(
  proposalId: string,
  payload: { terms: Record<string, any>; note?: string }
): Promise<Proposal> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/proposals/${proposalId}/negotiation/terms`,
    {
      method: "PUT",
      body: JSON.stringify(payload),
    }
  );
  return parseJson<Proposal>(response);
}

export async function acceptNegotiation(
  proposalId: string,
  payload?: { message?: string }
): Promise<AcceptNegotiationResponse> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/proposals/${proposalId}/negotiation/accept`,
    {
      method: "POST",
      body: JSON.stringify(payload || {}),
    }
  );
  return parseJson<AcceptNegotiationResponse>(response);
}

export async function fetchContracts(params?: {
  status?: string;
}): Promise<Contract[]> {
  const query = buildQuery({
    status: params?.status,
  });
  const response = await authenticatedFetch(
    `${API_BASE_URL}/contracts${query}`
  );
  return parseJson<Contract[]>(response);
}

export async function fetchContractDetail(contractId: string): Promise<Contract> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/contracts/${contractId}`
  );
  return parseJson<Contract>(response);
}

export async function updateUnsignedContractLink(
  contractId: string,
  link: string
): Promise<Contract> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/contracts/${contractId}/unsigned-link`,
    {
      method: "PUT",
      body: JSON.stringify({ link }),
    }
  );
  return parseJson<Contract>(response);
}

export async function updateSignedContractLink(
  contractId: string,
  link: string
): Promise<Contract> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/contracts/${contractId}/signed-link`,
    {
      method: "PUT",
      body: JSON.stringify({ link }),
    }
  );
  return parseJson<Contract>(response);
}

export async function trackUnsignedContractDownload(
  contractId: string
): Promise<Contract> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/contracts/${contractId}/track-unsigned-download`,
    {
      method: "POST",
    }
  );
  return parseJson<Contract>(response);
}

export async function trackSignedContractDownload(
  contractId: string
): Promise<Contract> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/contracts/${contractId}/track-signed-download`,
    {
      method: "POST",
    }
  );
  return parseJson<Contract>(response);
}

export async function requestContractStatusChange(
  contractId: string,
  newStatus: string
): Promise<Contract> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/contracts/${contractId}/request-status-change`,
    {
      method: "POST",
      body: JSON.stringify({ new_status: newStatus }),
    }
  );
  return parseJson<Contract>(response);
}

export async function respondToStatusChangeRequest(
  contractId: string,
  approved: boolean
): Promise<Contract> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/contracts/${contractId}/respond-status-change?approved=${approved}`,
    {
      method: "POST",
    }
  );
  return parseJson<Contract>(response);
}

export async function fetchContractChatMessages(
  contractId: string
): Promise<ContractChatMessage[]> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/contracts/${contractId}/chat`
  );
  return parseJson<ContractChatMessage[]>(response);
}

export async function postContractChatMessage(
  contractId: string,
  message: string
): Promise<ContractChatMessage> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/contracts/${contractId}/chat`,
    {
      method: "POST",
      body: JSON.stringify({ message }),
    }
  );
  return parseJson<ContractChatMessage>(response);
}

// ============================================================================
// DELIVERABLES API FUNCTIONS
// ============================================================================

export async function fetchContractDeliverables(
  contractId: string
): Promise<Deliverable[]> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/contracts/${contractId}/deliverables`
  );
  return parseJson<Deliverable[]>(response);
}

export async function createOrUpdateDeliverablesList(
  contractId: string,
  deliverables: DeliverableCreate[]
): Promise<Deliverable[]> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/contracts/${contractId}/deliverables`,
    {
      method: "POST",
      body: JSON.stringify({ deliverables }),
    }
  );
  return parseJson<Deliverable[]>(response);
}

export async function approveDeliverablesList(
  contractId: string,
  approved: boolean
): Promise<Deliverable[]> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/contracts/${contractId}/deliverables/approve`,
    {
      method: "POST",
      body: JSON.stringify({ approved }),
    }
  );
  return parseJson<Deliverable[]>(response);
}

export async function submitDeliverable(
  contractId: string,
  deliverableId: string,
  submissionUrl: string
): Promise<Deliverable> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/contracts/${contractId}/deliverables/${deliverableId}/submit`,
    {
      method: "POST",
      body: JSON.stringify({ submission_url: submissionUrl }),
    }
  );
  return parseJson<Deliverable>(response);
}

export async function reviewDeliverable(
  contractId: string,
  deliverableId: string,
  approved: boolean,
  reviewComment?: string,
  rejectionReason?: string
): Promise<Deliverable> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/contracts/${contractId}/deliverables/${deliverableId}/review`,
    {
      method: "POST",
      body: JSON.stringify({
        approved,
        review_comment: reviewComment || null,
        rejection_reason: rejectionReason || null,
      }),
    }
  );
  return parseJson<Deliverable>(response);
}

// ============================================================================
// CONTRACT VERSIONING API FUNCTIONS
// ============================================================================

export async function fetchContractVersions(
  contractId: string
): Promise<ContractVersion[]> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/contracts/${contractId}/versions`
  );
  return parseJson<ContractVersion[]>(response);
}

// ============================================================================
// NEGOTIATION AI FEATURES API FUNCTIONS
// ============================================================================

export interface SentimentAnalysis {
  overall_sentiment: string;
  sentiment_score: number;
  detected_tone: string[];
  guidance: string;
  alerts: string[];
}

export async function analyzeNegotiationSentiment(
  proposalId: string
): Promise<SentimentAnalysis> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/proposals/${proposalId}/negotiation/analyze-sentiment`,
    {
      method: "POST",
    }
  );
  return parseJson<SentimentAnalysis>(response);
}

export interface MessageDraftRequest {
  context: string;
  tone?: "professional" | "polite" | "persuasive" | "friendly";
  current_negotiation_state?: string;
}

export interface MessageDraft {
  draft: string;
  suggestions: string[];
}

export async function draftNegotiationMessage(
  proposalId: string,
  payload: MessageDraftRequest
): Promise<MessageDraft> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/proposals/${proposalId}/negotiation/draft-message`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
  return parseJson<MessageDraft>(response);
}

export interface DealProbability {
  probability: number;
  confidence: string;
  factors: string[];
  recommendations: string[];
}

export async function getDealProbability(
  proposalId: string
): Promise<DealProbability> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/proposals/${proposalId}/negotiation/deal-probability`
  );
  return parseJson<DealProbability>(response);
}

export interface TranslationRequest {
  text: string;
  target_language: string;
  source_language?: string;
}

export interface Translation {
  translated_text: string;
  detected_language?: string;
  confidence?: number;
}

export async function translateNegotiationMessage(
  proposalId: string,
  payload: TranslationRequest
): Promise<Translation> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/proposals/${proposalId}/negotiation/translate`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
  return parseJson<Translation>(response);
}

// ============================================================================
// CONTRACT AI FEATURES API FUNCTIONS
// ============================================================================

export interface ContractQuestion {
  question: string;
}

export interface ContractQuestionAnswer {
  answer: string;
  relevant_clauses: string[];
}

export async function askContractQuestion(
  contractId: string,
  payload: ContractQuestion
): Promise<ContractQuestionAnswer> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/contracts/${contractId}/ask-question`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
  return parseJson<ContractQuestionAnswer>(response);
}

export interface ContractTemplateRequest {
  deal_type: string;
  deliverables?: string[];
  payment_amount?: number;
  duration?: string;
  additional_requirements?: string;
}

export interface ContractTemplate {
  template: Record<string, any>;
  suggestions: string[];
}

export async function generateContractTemplate(
  payload: ContractTemplateRequest
): Promise<ContractTemplate> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/contracts/generate-template`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
  return parseJson<ContractTemplate>(response);
}

export interface ContractTranslationRequest {
  target_language: string;
}

export interface ContractTranslation {
  translated_terms: Record<string, any>;
  detected_language?: string;
}

export async function translateContract(
  contractId: string,
  payload: ContractTranslationRequest
): Promise<ContractTranslation> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/contracts/${contractId}/translate`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
  return parseJson<ContractTranslation>(response);
}

export interface ClauseExplanationRequest {
  clause_text: string;
  clause_context?: string;
}

export interface ClauseExplanation {
  explanation: string;
  key_points: string[];
  implications: string[];
}

export async function explainContractClause(
  contractId: string,
  payload: ClauseExplanationRequest
): Promise<ClauseExplanation> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/contracts/${contractId}/explain-clause`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
  return parseJson<ClauseExplanation>(response);
}

export interface ContractSummary {
  summary: string;
  key_terms: Record<string, any>;
  obligations: {
    brand: string[];
    creator: string[];
  };
  important_dates: string[];
}

export async function summarizeContract(
  contractId: string
): Promise<ContractSummary> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/contracts/${contractId}/summarize`
  );
  return parseJson<ContractSummary>(response);
}

export async function fetchCurrentContractVersion(
  contractId: string
): Promise<ContractVersion> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/contracts/${contractId}/versions/current`
  );
  return parseJson<ContractVersion>(response);
}

export async function createContractVersion(
  contractId: string,
  payload: ContractVersionCreate
): Promise<ContractVersion> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/contracts/${contractId}/versions`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
  return parseJson<ContractVersion>(response);
}

export async function approveContractVersion(
  contractId: string,
  versionId: string,
  approved: boolean
): Promise<ContractVersion> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/contracts/${contractId}/versions/${versionId}/approve`,
    {
      method: "POST",
      body: JSON.stringify({ approved }),
    }
  );
  return parseJson<ContractVersion>(response);
}

