export type NegotiationStatus = "none" | "open" | "finalized" | "declined";

export type NegotiationEntryType =
  | "message"
  | "terms_update"
  | "terms_proposal"
  | "acceptance";

export interface NegotiationEntry {
  id: string;
  sender_id: string;
  sender_role: "Brand" | "Creator";
  message: string;
  timestamp: string;
  type: NegotiationEntryType;
  meta?: Record<string, any>;
}

export interface Proposal {
  id: string;
  campaign_id: string;
  brand_id: string;
  creator_id: string;
  subject: string;
  message: string;
  proposed_amount: number | null;
  content_ideas: string[] | null;
  ideal_pricing: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  campaign_title: string | null;
  brand_name: string | null;
  creator_name: string | null;
  negotiation_status: NegotiationStatus;
  negotiation_thread?: NegotiationEntry[];
  current_terms?: Record<string, any>;
  version?: number;
  contract_id?: string | null;
}

export interface Contract {
  id: string;
  proposal_id: string;
  brand_id: string;
  creator_id: string;
  terms: Record<string, any>;
  status: string;
  created_at: string;
  updated_at: string;
  brand_name: string | null;
  creator_name: string | null;
  proposal?: Proposal | null;
  negotiation_thread?: NegotiationEntry[] | null;
  unsigned_contract_link?: string | null;
  signed_contract_link?: string | null;
  unsigned_contract_downloaded_by_creator?: boolean;
  signed_contract_downloaded_by_brand?: boolean;
  pending_status_change?: {
    requested_status: string;
    requesting_party: "Brand" | "Creator";
    requested_at: string;
  } | null;
}

export interface AcceptNegotiationResponse {
  proposal: Proposal;
  contract: Contract;
}

export interface ContractChatMessage {
  id: string;
  contract_id: string;
  sender_id: string;
  sender_role: "Brand" | "Creator";
  message: string;
  created_at: string;
}

export interface Deliverable {
  id: string;
  contract_id: string;
  description: string;
  due_date: string | null;
  status: "pending" | "under_review" | "rejected" | "completed";
  submission_url: string | null;
  review_comment: string | null;
  rejection_reason: string | null;
  brand_approval: boolean;
  creator_approval: boolean;
  created_at: string;
  updated_at: string;
}

export interface DeliverableCreate {
  description: string;
  due_date: string | null;
}

export interface ContractVersion {
  id: string;
  contract_id: string;
  version_number: number;
  file_url: string;
  uploaded_by: string | null;
  uploaded_at: string;
  status: "pending" | "approved" | "rejected" | "final";
  brand_approval: boolean;
  creator_approval: boolean;
  change_reason: string | null;
  is_current: boolean;
}

export interface ContractVersionCreate {
  file_url: string;
  change_reason?: string | null;
}

