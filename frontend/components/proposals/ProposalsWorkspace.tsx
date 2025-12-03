"use client";

import {
    acceptNegotiation,
    analyzeNegotiationSentiment,
    deleteProposal,
    draftNegotiationMessage,
    fetchNegotiations,
    fetchReceivedProposals,
    fetchSentProposals,
    getDealProbability,
    postNegotiationMessage,
    postProposalStatus,
    startNegotiation,
    translateNegotiationMessage,
    updateNegotiationTerms,
    type DealProbability,
    type MessageDraft,
    type SentimentAnalysis,
    type Translation,
} from "@/lib/api/proposals";
import { generateGeminiText } from "@/lib/geminiApi";
import {
    AcceptNegotiationResponse,
    NegotiationEntry,
    Proposal,
} from "@/types/proposals";
import {
    AlertTriangle,
    BarChart3,
    Check,
    CheckCircle,
    Clock,
    FileText,
    Languages,
    Loader2,
    Mail,
    MessageCircle,
    MessageSquare,
    PlusCircle,
    Send,
    Shield,
    Sparkles,
    TrendingUp,
    X,
    XCircle
} from "lucide-react";
import { useEffect, useMemo, useState, type ReactElement } from "react";
import ReactMarkdown from "react-markdown";

export type TabKey = "proposals" | "negotiations";

interface ProposalsWorkspaceProps {
  role: "Brand" | "Creator";
  initialTab?: TabKey;
  aiLoading?: boolean;
  setAiLoading?: (loading: boolean) => void;
  aiProgress?: number;
  aiStatusIdx?: number;
  aiStatusMessages?: string[];
}

interface NegotiationModalState {
  open: boolean;
  proposal: Proposal | null;
  message: string;
  termsText: string;
  submitting: boolean;
  error: string | null;
}

interface AiReviewState {
  open: boolean;
  proposal: Proposal | null;
  loading: boolean;
  feedback: string | null;
  error: string | null;
}

const statusIconMap: Record<string, ReactElement> = {
  accepted: <CheckCircle className="h-5 w-5 text-green-500" />,
  declined: <XCircle className="h-5 w-5 text-red-500" />,
  withdrawn: <XCircle className="h-5 w-5 text-gray-500" />,
};

function formatCurrency(amount: number | null | undefined) {
  if (amount === null || amount === undefined) return "Not specified";
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${amount}`;
  }
}

function renderStatusBadge(status: string) {
  let classes =
    "bg-yellow-100 text-yellow-800 border border-yellow-200 px-3 py-1 rounded-full text-xs font-semibold";
  if (status === "accepted") {
    classes =
      "bg-green-100 text-green-800 border border-green-200 px-3 py-1 rounded-full text-xs font-semibold";
  } else if (status === "declined") {
    classes =
      "bg-red-100 text-red-800 border border-red-200 px-3 py-1 rounded-full text-xs font-semibold";
  } else if (status === "withdrawn") {
    classes =
      "bg-gray-100 text-gray-800 border border-gray-200 px-3 py-1 rounded-full text-xs font-semibold";
  }
  return <span className={classes}>{status.toUpperCase()}</span>;
}

function formatDate(value: string) {
  try {
    return new Date(value).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return value;
  }
}

function formatDateTime(value: string) {
  try {
    return new Date(value).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return value;
  }
}

function prettyPrintJson(data?: Record<string, any> | null) {
  if (!data || Object.keys(data).length === 0) {
    return "No terms specified yet.";
  }
  return JSON.stringify(data, null, 2);
}

function getThreadIcon(type: string) {
  switch (type) {
    case "terms_update":
    case "terms_proposal":
      return <FileText className="h-5 w-5 text-blue-500" />;
    case "acceptance":
      return <Check className="h-5 w-5 text-green-500" />;
    default:
      return <MessageCircle className="h-5 w-5 text-purple-500" />;
  }
}

export function ProposalsWorkspace({
  role,
  initialTab = "proposals",
  aiLoading,
  setAiLoading,
  aiProgress,
  aiStatusIdx,
  aiStatusMessages,
}: ProposalsWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<TabKey>(initialTab);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [negotiations, setNegotiations] = useState<Proposal[]>([]);
  const [selectedNegotiationId, setSelectedNegotiationId] = useState<
    string | null
  >(null);

  const [loadingStates, setLoadingStates] = useState({
    proposals: false,
    negotiations: false,
  });

  const [globalError, setGlobalError] = useState<string | null>(null);
  const [globalSuccess, setGlobalSuccess] = useState<string | null>(null);

  const [negotiationModal, setNegotiationModal] =
    useState<NegotiationModalState>({
      open: false,
      proposal: null,
      message: "",
      termsText: "",
      submitting: false,
      error: null,
    });

  const [aiReview, setAiReview] = useState<AiReviewState>({
    open: false,
    proposal: null,
    loading: false,
    feedback: null,
    error: null,
  });

  const [messageDraft, setMessageDraft] = useState<string>("");
  const [messageSubmitting, setMessageSubmitting] = useState(false);
  const [termsDraft, setTermsDraft] = useState<string>("");
  const [termsNote, setTermsNote] = useState<string>("");
  const [termsSubmitting, setTermsSubmitting] = useState(false);
  const [acceptSubmitting, setAcceptSubmitting] = useState(false);
  const [acceptMessage, setAcceptMessage] = useState<string>("");

  // AI Features State
  const [sentimentAnalysis, setSentimentAnalysis] = useState<SentimentAnalysis | null>(null);
  const [loadingSentiment, setLoadingSentiment] = useState(false);
  const [dealProbability, setDealProbability] = useState<DealProbability | null>(null);
  const [loadingProbability, setLoadingProbability] = useState(false);
  const [messageDraftResult, setMessageDraftResult] = useState<MessageDraft | null>(null);
  const [loadingDraft, setLoadingDraft] = useState(false);
  const [draftContext, setDraftContext] = useState("");
  const [draftTone, setDraftTone] = useState<"professional" | "polite" | "persuasive" | "friendly">("professional");
  const [translationResult, setTranslationResult] = useState<Translation | null>(null);
  const [loadingTranslation, setLoadingTranslation] = useState(false);
  const [translationText, setTranslationText] = useState("");
  const [targetLanguage, setTargetLanguage] = useState("es");

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    void loadProposals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  useEffect(() => {
    if (activeTab === "negotiations") {
      void loadNegotiations();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, role]);


  const selectedNegotiation = useMemo(
    () =>
      negotiations.find((item) => item.id === selectedNegotiationId) || null,
    [negotiations, selectedNegotiationId]
  );

  // Reset AI state when switching negotiations
  useEffect(() => {
    setSentimentAnalysis(null);
    setDealProbability(null);
    setMessageDraftResult(null);
    setTranslationResult(null);
    setDraftContext("");
    setTranslationText("");
  }, [selectedNegotiationId]);


  useEffect(() => {
    setMessageDraft("");
    setTermsDraft("");
    setTermsNote("");
    setAcceptMessage("");
  }, [selectedNegotiationId]);

  useEffect(() => {
    if (selectedNegotiation && role === "Brand") {
      if (
        selectedNegotiation.current_terms &&
        Object.keys(selectedNegotiation.current_terms).length > 0
      ) {
        setTermsDraft(
          JSON.stringify(selectedNegotiation.current_terms, null, 2)
        );
      }
    }
  }, [selectedNegotiation, role]);

  async function loadProposals() {
    setLoadingStates((prev) => ({ ...prev, proposals: true }));
    setGlobalError(null);
    try {
      const data =
        role === "Brand"
          ? await fetchSentProposals({ negotiationStatus: "none" })
          : await fetchReceivedProposals({ negotiationStatus: "none" });
      setProposals(data);
    } catch (error: any) {
      setGlobalError(error?.message || "Failed to load proposals");
    } finally {
      setLoadingStates((prev) => ({ ...prev, proposals: false }));
    }
  }

  async function loadNegotiations() {
    setLoadingStates((prev) => ({ ...prev, negotiations: true }));
    setGlobalError(null);
    try {
      const data = await fetchNegotiations({ status: "open" });
      setNegotiations(data);
      if (data.length > 0) {
        setSelectedNegotiationId((current) => current || data[0].id);
      } else {
        setSelectedNegotiationId(null);
      }
    } catch (error: any) {
      setGlobalError(error?.message || "Failed to load negotiations");
    } finally {
      setLoadingStates((prev) => ({ ...prev, negotiations: false }));
    }
  }


  async function handleDeleteProposal(proposalId: string) {
    if (
      !window.confirm(
        "Are you sure you want to delete this proposal? This action cannot be undone."
      )
    ) {
      return;
    }
    try {
      await deleteProposal(proposalId);
      setGlobalSuccess("Proposal deleted");
      // Wait 1 second before reloading to avoid errors from accessing deleted data
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // Force a hard reload
      window.location.href = window.location.href;
    } catch (error: any) {
      setGlobalError(error?.message || "Failed to delete proposal");
      // Still reload after error to refresh the page state
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // Force a hard reload
      window.location.href = window.location.href;
    }
  }

  async function handleProposalStatus(
    proposalId: string,
    status: string,
    successMessage: string
  ) {
    try {
      await postProposalStatus(proposalId, status);
      setGlobalSuccess(successMessage);
      await loadProposals();
    } catch (error: any) {
      setGlobalError(error?.message || "Failed to update proposal");
    }
  }

  function openNegotiationModal(proposal: Proposal) {
    setNegotiationModal({
      open: true,
      proposal,
      message:
        "Hi! I'm interested in this collaboration and would love to discuss the terms further.",
      termsText: proposal.current_terms
        ? JSON.stringify(proposal.current_terms, null, 2)
        : "",
      submitting: false,
      error: null,
    });
  }

  async function submitNegotiationStart() {
    if (!negotiationModal.proposal) return;
    if (
      !negotiationModal.message.trim() &&
      !negotiationModal.termsText.trim()
    ) {
      setNegotiationModal((prev) => ({
        ...prev,
        error:
          "Provide a greeting or propose updated terms to start negotiation.",
      }));
      return;
    }

    let parsedTerms: Record<string, any> | undefined;
    if (negotiationModal.termsText.trim()) {
      try {
        parsedTerms = JSON.parse(negotiationModal.termsText);
      } catch {
        setNegotiationModal((prev) => ({
          ...prev,
          error: "Terms must be valid JSON.",
        }));
        return;
      }
    }

    setNegotiationModal((prev) => ({ ...prev, submitting: true, error: null }));
    try {
      await startNegotiation(negotiationModal.proposal.id, {
        initial_message: negotiationModal.message.trim()
          ? negotiationModal.message.trim()
          : undefined,
        proposed_terms: parsedTerms,
      });
      setNegotiationModal({
        open: false,
        proposal: null,
        message: "",
        termsText: "",
        submitting: false,
        error: null,
      });
      setGlobalSuccess("Negotiation started");
      await loadProposals();
      await loadNegotiations();
      setActiveTab("negotiations");
    } catch (error: any) {
      setNegotiationModal((prev) => ({
        ...prev,
        error: error?.message || "Failed to start negotiation",
        submitting: false,
      }));
    }
  }

  async function handleSendMessage() {
    if (!selectedNegotiation || !messageDraft.trim()) return;
    setMessageSubmitting(true);
    try {
      const updated = await postNegotiationMessage(
        selectedNegotiation.id,
        messageDraft.trim()
      );
      setNegotiations((prev) =>
        prev.map((item) => (item.id === updated.id ? updated : item))
      );
      setMessageDraft("");
      setGlobalSuccess("Message sent");
    } catch (error: any) {
      setGlobalError(error?.message || "Failed to send message");
    } finally {
      setMessageSubmitting(false);
    }
  }

  async function handleTermsUpdate() {
    if (!selectedNegotiation) return;
    if (!termsDraft.trim()) {
      setGlobalError("Provide updated terms in JSON format.");
      return;
    }
    let parsedTerms: Record<string, any>;
    try {
      parsedTerms = JSON.parse(termsDraft);
    } catch {
      setGlobalError("Updated terms must be valid JSON.");
      return;
    }
    setTermsSubmitting(true);
    try {
      const updated = await updateNegotiationTerms(selectedNegotiation.id, {
        terms: parsedTerms,
        note: termsNote.trim() ? termsNote.trim() : undefined,
      });
      setNegotiations((prev) =>
        prev.map((item) => (item.id === updated.id ? updated : item))
      );
      setTermsDraft("");
      setTermsNote("");
      setGlobalSuccess("Terms updated");
    } catch (error: any) {
      setGlobalError(error?.message || "Failed to update terms");
    } finally {
      setTermsSubmitting(false);
    }
  }

  async function handleAcceptDeal() {
    if (!selectedNegotiation) return;
    setAcceptSubmitting(true);
    try {
      const result: AcceptNegotiationResponse = await acceptNegotiation(
        selectedNegotiation.id,
        acceptMessage.trim() ? { message: acceptMessage.trim() } : undefined
      );
      setAcceptMessage("");
      setGlobalSuccess("Deal accepted! Contract created.");
      await loadNegotiations();
      await loadProposals();
    } catch (error: any) {
      setGlobalError(error?.message || "Failed to accept deal");
    } finally {
      setAcceptSubmitting(false);
    }
  }

  // AI Feature Handlers
  async function handleAnalyzeSentiment() {
    if (!selectedNegotiation) return;
    setLoadingSentiment(true);
    setSentimentAnalysis(null);
    try {
      const result = await analyzeNegotiationSentiment(selectedNegotiation.id);
      setSentimentAnalysis(result);
    } catch (error: any) {
      setGlobalError(error?.message || "Failed to analyze sentiment");
    } finally {
      setLoadingSentiment(false);
    }
  }

  async function handleGetDealProbability() {
    if (!selectedNegotiation) return;
    setLoadingProbability(true);
    setDealProbability(null);
    try {
      const result = await getDealProbability(selectedNegotiation.id);
      setDealProbability(result);
    } catch (error: any) {
      setGlobalError(error?.message || "Failed to predict deal probability");
    } finally {
      setLoadingProbability(false);
    }
  }

  async function handleDraftMessage() {
    if (!selectedNegotiation || !draftContext.trim()) {
      setGlobalError("Please provide context for the message");
      return;
    }
    setLoadingDraft(true);
    setMessageDraftResult(null);
    try {
      const result = await draftNegotiationMessage(selectedNegotiation.id, {
        context: draftContext,
        tone: draftTone,
      });
      setMessageDraftResult(result);
    } catch (error: any) {
      setGlobalError(error?.message || "Failed to draft message");
    } finally {
      setLoadingDraft(false);
    }
  }

  async function handleTranslate() {
    if (!selectedNegotiation || !translationText.trim()) {
      setGlobalError("Please provide text to translate");
      return;
    }
    setLoadingTranslation(true);
    setTranslationResult(null);
    try {
      const result = await translateNegotiationMessage(selectedNegotiation.id, {
        text: translationText,
        target_language: targetLanguage,
      });
      setTranslationResult(result);
    } catch (error: any) {
      setGlobalError(error?.message || "Failed to translate");
    } finally {
      setLoadingTranslation(false);
    }
  }


  async function openAiReview(proposal: Proposal) {
    setAiReview({
      open: true,
      proposal,
      loading: true,
      feedback: null,
      error: null,
    });
    try {
      const prompt = `
You are an expert influencer marketing analyst. Review the following brand proposal for a creator.

Proposal:
Subject: ${proposal.subject}
Message: ${proposal.message}
Proposed Amount: ${proposal.proposed_amount}
Content Ideas: ${proposal.content_ideas?.join(", ") || "None"}
Ideal Pricing: ${proposal.ideal_pricing || "Not specified"}

Provide feedback on:
- How compelling is this proposal?
- Is the compensation fair?
- Key strengths and weaknesses.
- Recommendations for the creator.

Respond with succinct, actionable advice.`;
      const result = await generateGeminiText(prompt);
      let feedback = "";
      if (
        result &&
        result.candidates &&
        result.candidates[0]?.content?.parts?.[0]?.text
      ) {
        feedback = result.candidates[0].content.parts[0].text;
      } else if (result?.text) {
        feedback = result.text;
      } else {
        feedback = JSON.stringify(result, null, 2);
      }
      setAiReview((prev) => ({
        ...prev,
        loading: false,
        feedback,
      }));
    } catch (error: any) {
      setAiReview((prev) => ({
        ...prev,
        loading: false,
        error: error?.message || "Failed to generate AI review",
      }));
    }
  }

  function closeAiReview() {
    setAiReview({
      open: false,
      proposal: null,
      loading: false,
      feedback: null,
      error: null,
    });
  }

  function renderProposalCard(proposal: Proposal) {
    const icon = statusIconMap[proposal.status] || (
      <Clock className="h-5 w-5 text-yellow-500" />
    );
    return (
      <div
        key={proposal.id}
        className="rounded-xl bg-white p-6 shadow-md transition hover:shadow-lg"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3">
              {icon}
              <h3 className="text-xl font-bold text-gray-900">
                {proposal.subject}
              </h3>
              {renderStatusBadge(proposal.status)}
            </div>
            <div className="mt-3 grid grid-cols-1 gap-2 text-sm text-gray-600 md:grid-cols-2">
              <p>
                <strong>{role === "Brand" ? "To" : "From"}:</strong>{" "}
                {role === "Brand"
                  ? proposal.creator_name || "Unknown Creator"
                  : proposal.brand_name || "Unknown Brand"}
              </p>
              <p>
                <strong>Campaign:</strong>{" "}
                {proposal.campaign_title || "Unknown Campaign"}
              </p>
              <p>
                <strong>{role === "Brand" ? "Sent" : "Received"}:</strong>{" "}
                {formatDate(proposal.created_at)}
              </p>
              {proposal.proposed_amount !== null && (
                <p>
                  <strong>Amount:</strong>{" "}
                  {formatCurrency(proposal.proposed_amount)}
                </p>
              )}
              {proposal.ideal_pricing && (
                <p>
                  <strong>Ideal Pricing:</strong> {proposal.ideal_pricing}
                </p>
              )}
            </div>
            <div className="mt-4 rounded-lg bg-gray-50 p-4">
              <p className="text-sm whitespace-pre-wrap text-gray-700">
                {proposal.message}
              </p>
            </div>
            {proposal.content_ideas && proposal.content_ideas.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-semibold text-gray-900">
                  Content Ideas:
                </p>
                <ul className="mt-1 list-disc pl-5 text-sm text-gray-600">
                  {proposal.content_ideas.map((idea, idx) => (
                    <li key={idx}>{idea}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          {role === "Brand" && proposal.status === "pending" && (
            <button
              onClick={() => handleDeleteProposal(proposal.id)}
              className="rounded-lg border border-red-300 bg-white px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
            >
              Delete
            </button>
          )}
        </div>
        {role === "Creator" && proposal.status === "pending" && (
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() =>
                handleProposalStatus(
                  proposal.id,
                  "declined",
                  "Proposal declined"
                )
              }
              className="flex items-center gap-2 rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
            >
              <X className="h-4 w-4" />
              Not Interested
            </button>
            <button
              onClick={() => openNegotiationModal(proposal)}
              className="flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-600"
            >
              <PlusCircle className="h-4 w-4" />
              Interested
            </button>
            <button
              onClick={() => openAiReview(proposal)}
              className="flex items-center gap-2 rounded-lg border border-purple-300 bg-white px-4 py-2 text-sm font-semibold text-purple-600 transition hover:bg-purple-50"
            >
              <Shield className="h-4 w-4" />
              Review with AI
            </button>
          </div>
        )}
      </div>
    );
  }

  function renderNegotiations() {
    if (loadingStates.negotiations) {
      return (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
          <p className="mt-4 text-gray-600">Loading negotiations...</p>
        </div>
      );
    }

    if (negotiations.length === 0) {
      return (
        <div className="rounded-xl bg-white p-12 text-center shadow-md">
          <MessageCircle className="mx-auto h-14 w-14 text-gray-400" />
          <h3 className="mt-4 text-xl font-semibold text-gray-900">
            No active negotiations
          </h3>
          <p className="mt-2 text-gray-600">
            {role === "Creator"
              ? "Express interest in a proposal to start negotiating."
              : "Wait for creators to express interest or respond to their messages."}
          </p>
        </div>
      );
    }

    return (
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-1">
          {negotiations.map((item) => (
            <button
              key={item.id}
              onClick={() => setSelectedNegotiationId(item.id)}
              className={`w-full rounded-xl border p-4 text-left transition ${selectedNegotiationId === item.id ? "border-blue-500 bg-blue-50" : "border-gray-200 bg-white hover:border-blue-300"}`}
            >
              <div className="flex items-center justify-between gap-2">
                <h4 className="font-semibold text-gray-900">{item.subject}</h4>
                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800">
                  OPEN
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-600">
                {role === "Brand"
                  ? item.creator_name || "Unknown Creator"
                  : item.brand_name || "Unknown Brand"}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Updated {formatDate(item.updated_at)}
              </p>
            </button>
          ))}
        </div>
        <div className="lg:col-span-2">
          {selectedNegotiation ? (
            <div className="space-y-4 rounded-xl bg-white p-6 shadow-md">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {selectedNegotiation.subject}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Campaign:{" "}
                    {selectedNegotiation.campaign_title || "Unknown Campaign"}
                  </p>
                </div>
                <div className="text-right text-sm text-gray-500">
                  <p>
                    Version{" "}
                    <span className="font-semibold">
                      {selectedNegotiation.version || 1}
                    </span>
                  </p>
                  <p>Opened {formatDate(selectedNegotiation.created_at)}</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-800">
                  Negotiation Thread
                </h4>
                <div className="mt-3 max-h-80 space-y-3 overflow-y-auto rounded-lg border border-gray-200 bg-gray-50 p-4">
                  {(selectedNegotiation.negotiation_thread || []).map(
                    (entry: NegotiationEntry) => (
                      <div
                        key={entry.id}
                        className="rounded-lg bg-white p-3 shadow-sm"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            {getThreadIcon(entry.type)}
                            <span className="text-sm font-semibold text-gray-800">
                              {entry.sender_role}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500">
                            {formatDateTime(entry.timestamp)}
                          </span>
                        </div>
                        <p className="mt-2 text-sm whitespace-pre-wrap text-gray-700">
                          {entry.message}
                        </p>
                        {entry.meta?.terms && (
                          <div className="mt-2 rounded border border-blue-100 bg-blue-50 p-2">
                            <p className="text-xs font-semibold text-blue-800">
                              Terms Snapshot
                            </p>
                            <pre className="mt-1 max-h-40 overflow-y-auto text-xs whitespace-pre-wrap text-blue-900">
                              {JSON.stringify(entry.meta.terms, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    )
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-800">Latest Terms</h4>
                <div className="mt-2 rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <pre className="max-h-64 overflow-y-auto text-sm whitespace-pre-wrap text-gray-700">
                    {prettyPrintJson(selectedNegotiation.current_terms)}
                  </pre>
                </div>
              </div>

              {/* AI Features Section */}
              <div className="rounded-lg border border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50 p-4">
                <h4 className="mb-3 flex items-center gap-2 font-semibold text-purple-900">
                  <Sparkles className="h-5 w-5" />
                  AI Negotiation Assistant
                </h4>
                <div className="grid gap-3 sm:grid-cols-2">
                  {/* Sentiment Analysis */}
                  <div className="rounded-lg border border-purple-200 bg-white p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-purple-600" />
                        <span className="text-sm font-semibold text-gray-800">Sentiment Analysis</span>
                      </div>
                      <button
                        onClick={handleAnalyzeSentiment}
                        disabled={loadingSentiment}
                        className="rounded bg-purple-100 px-3 py-1 text-xs font-medium text-purple-700 hover:bg-purple-200 disabled:opacity-50"
                      >
                        {loadingSentiment ? <Loader2 className="h-3 w-3 animate-spin" /> : "Analyze"}
                      </button>
                    </div>
                    {sentimentAnalysis && (
                      <div className="mt-2 space-y-1 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Sentiment:</span>
                          <span className={`rounded px-2 py-0.5 ${
                            sentimentAnalysis.overall_sentiment === "positive" ? "bg-green-100 text-green-800" :
                            sentimentAnalysis.overall_sentiment === "negative" ? "bg-red-100 text-red-800" :
                            "bg-gray-100 text-gray-800"
                          }`}>
                            {sentimentAnalysis.overall_sentiment}
                          </span>
                          <span className="text-gray-600">
                            ({(sentimentAnalysis.sentiment_score * 100).toFixed(0)}%)
                          </span>
                        </div>
                        {sentimentAnalysis.detected_tone.length > 0 && (
                          <div>
                            <span className="font-medium">Tones:</span> {sentimentAnalysis.detected_tone.join(", ")}
                          </div>
                        )}
                        {sentimentAnalysis.alerts.length > 0 && (
                          <div className="flex items-start gap-1 text-red-600">
                            <AlertTriangle className="h-3 w-3 mt-0.5" />
                            <span>{sentimentAnalysis.alerts[0]}</span>
                          </div>
                        )}
                        <p className="text-gray-600">{sentimentAnalysis.guidance}</p>
                      </div>
                    )}
                  </div>

                  {/* Deal Probability */}
                  <div className="rounded-lg border border-blue-200 bg-white p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-semibold text-gray-800">Deal Probability</span>
                      </div>
                      <button
                        onClick={handleGetDealProbability}
                        disabled={loadingProbability}
                        className="rounded bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 hover:bg-blue-200 disabled:opacity-50"
                      >
                        {loadingProbability ? <Loader2 className="h-3 w-3 animate-spin" /> : "Predict"}
                      </button>
                    </div>
                    {dealProbability && (
                      <div className="mt-2 space-y-1 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Probability:</span>
                          <div className="flex-1 rounded-full bg-gray-200 h-2">
                            <div
                              className={`h-2 rounded-full ${
                                dealProbability.probability > 0.7 ? "bg-green-500" :
                                dealProbability.probability > 0.4 ? "bg-yellow-500" :
                                "bg-red-500"
                              }`}
                              style={{ width: `${dealProbability.probability * 100}%` }}
                            />
                          </div>
                          <span className="font-semibold">{(dealProbability.probability * 100).toFixed(0)}%</span>
                        </div>
                        <div>
                          <span className="font-medium">Confidence:</span> {dealProbability.confidence}
                        </div>
                        {dealProbability.factors.length > 0 && (
                          <div className="text-gray-600">
                            <span className="font-medium">Key Factors:</span> {dealProbability.factors.slice(0, 2).join(", ")}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Message Drafting */}
                <div className="mt-3 rounded-lg border border-green-200 bg-white p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-semibold text-gray-800">AI Message Drafting</span>
                  </div>
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={draftContext}
                      onChange={(e) => setDraftContext(e.target.value)}
                      placeholder="What do you want to say? (e.g., 'Ask about payment terms')"
                      className="w-full rounded border border-gray-300 px-2 py-1 text-xs focus:border-green-500 focus:outline-none"
                    />
                    <div className="flex items-center gap-2">
                      <select
                        value={draftTone}
                        onChange={(e) => setDraftTone(e.target.value as any)}
                        className="rounded border border-gray-300 px-2 py-1 text-xs focus:border-green-500 focus:outline-none"
                      >
                        <option value="professional">Professional</option>
                        <option value="polite">Polite</option>
                        <option value="persuasive">Persuasive</option>
                        <option value="friendly">Friendly</option>
                      </select>
                      <button
                        onClick={handleDraftMessage}
                        disabled={loadingDraft || !draftContext.trim()}
                        className="flex-1 rounded bg-green-100 px-3 py-1 text-xs font-medium text-green-700 hover:bg-green-200 disabled:opacity-50"
                      >
                        {loadingDraft ? <Loader2 className="h-3 w-3 animate-spin mx-auto" /> : "Draft Message"}
                      </button>
                    </div>
                    {messageDraftResult && (
                      <div className="mt-2 rounded border border-green-200 bg-green-50 p-2">
                        <p className="text-xs text-gray-700 whitespace-pre-wrap">{messageDraftResult.draft}</p>
                        <button
                          onClick={() => {
                            setMessageDraft(messageDraftResult.draft);
                            setMessageDraftResult(null);
                            setDraftContext("");
                          }}
                          className="mt-2 text-xs text-green-700 hover:underline"
                        >
                          Use this draft
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Translation */}
                <div className="mt-3 rounded-lg border border-orange-200 bg-white p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Languages className="h-4 w-4 text-orange-600" />
                    <span className="text-sm font-semibold text-gray-800">Language Translation</span>
                  </div>
                  <div className="space-y-2">
                    <textarea
                      value={translationText}
                      onChange={(e) => setTranslationText(e.target.value)}
                      placeholder="Enter text to translate..."
                      rows={2}
                      className="w-full rounded border border-gray-300 px-2 py-1 text-xs focus:border-orange-500 focus:outline-none"
                    />
                    <div className="flex items-center gap-2">
                      <select
                        value={targetLanguage}
                        onChange={(e) => setTargetLanguage(e.target.value)}
                        className="rounded border border-gray-300 px-2 py-1 text-xs focus:border-orange-500 focus:outline-none"
                      >
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                        <option value="de">German</option>
                        <option value="zh">Chinese</option>
                        <option value="ja">Japanese</option>
                        <option value="ko">Korean</option>
                        <option value="pt">Portuguese</option>
                        <option value="it">Italian</option>
                        <option value="hi">Hindi</option>
                        <option value="ar">Arabic</option>
                      </select>
                      <button
                        onClick={handleTranslate}
                        disabled={loadingTranslation || !translationText.trim()}
                        className="flex-1 rounded bg-orange-100 px-3 py-1 text-xs font-medium text-orange-700 hover:bg-orange-200 disabled:opacity-50"
                      >
                        {loadingTranslation ? <Loader2 className="h-3 w-3 animate-spin mx-auto" /> : "Translate"}
                      </button>
                    </div>
                    {translationResult && (
                      <div className="mt-2 rounded border border-orange-200 bg-orange-50 p-2">
                        <p className="text-xs text-gray-700 whitespace-pre-wrap">{translationResult.translated_text}</p>
                        {translationResult.detected_language && (
                          <p className="mt-1 text-xs text-gray-500">
                            Detected: {translationResult.detected_language}
                          </p>
                        )}
                        <button
                          onClick={() => {
                            setMessageDraft(translationResult.translated_text);
                            setTranslationResult(null);
                            setTranslationText("");
                          }}
                          className="mt-2 text-xs text-orange-700 hover:underline"
                        >
                          Use translation
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700">
                    Message
                  </label>
                  <textarea
                    value={messageDraft}
                    onChange={(event) => setMessageDraft(event.target.value)}
                    rows={3}
                    className="mt-2 w-full rounded-lg border border-gray-300 p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                    placeholder="Share an update or ask a question..."
                  />
                  <div className="mt-2 flex justify-end">
                    <button
                      onClick={handleSendMessage}
                      disabled={messageSubmitting || !messageDraft.trim()}
                      className="inline-flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:opacity-50"
                    >
                      {messageSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          Send Message
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {role === "Brand" ? (
                  <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
                    <h5 className="text-sm font-semibold text-purple-900">
                      Update Proposal Terms
                    </h5>
                    <textarea
                      value={termsDraft}
                      onChange={(event) => setTermsDraft(event.target.value)}
                      rows={6}
                      className="mt-2 w-full rounded-lg border border-purple-200 p-3 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none"
                      placeholder='Paste JSON, e.g. {"deliverables": "...", "amount": ...}'
                    />
                    <textarea
                      value={termsNote}
                      onChange={(event) => setTermsNote(event.target.value)}
                      rows={2}
                      className="mt-2 w-full rounded-lg border border-purple-200 p-3 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none"
                      placeholder="Optional note to accompany this update"
                    />
                    <div className="mt-3 flex justify-end">
                      <button
                        onClick={handleTermsUpdate}
                        disabled={termsSubmitting || !termsDraft.trim()}
                        className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-purple-700 disabled:opacity-50"
                      >
                        {termsSubmitting ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Updating...
                          </>
                        ) : (
                          <>
                            <FileText className="h-4 w-4" />
                            Update Terms
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                    <h5 className="text-sm font-semibold text-green-900">
                      Accept Deal
                    </h5>
                    <textarea
                      value={acceptMessage}
                      onChange={(event) => setAcceptMessage(event.target.value)}
                      rows={3}
                      className="mt-2 w-full rounded-lg border border-green-200 p-3 text-sm focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none"
                      placeholder="Optional message to send along with acceptance"
                    />
                    <div className="mt-3 flex justify-end">
                      <button
                        onClick={handleAcceptDeal}
                        disabled={
                          acceptSubmitting ||
                          !selectedNegotiation.current_terms ||
                          Object.keys(selectedNegotiation.current_terms || {})
                            .length === 0
                        }
                        className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700 disabled:opacity-50"
                      >
                        {acceptSubmitting ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Finalizing...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4" />
                            Accept Deal
                          </>
                        )}
                      </button>
                    </div>
                    {!selectedNegotiation.current_terms ||
                    Object.keys(selectedNegotiation.current_terms).length ===
                      0 ? (
                      <p className="mt-2 text-xs text-green-800">
                        The brand needs to share updated terms before you can
                        accept.
                      </p>
                    ) : null}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-xl bg-white p-6 shadow">
              <p className="text-gray-600">
                Select a negotiation to view the conversation and take action.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }


  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          {role === "Brand" ? "My Proposals" : "Proposals"}
        </h1>
        <p className="mt-1 text-gray-600">
          {role === "Brand"
            ? "Manage proposals and negotiations with creators."
            : "Keep track of proposals from brands and manage negotiations."}
        </p>
      </div>

      {(globalError || globalSuccess) && (
        <div
          className={`rounded-lg border px-4 py-3 text-sm ${
            globalError
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-green-200 bg-green-50 text-green-700"
          }`}
        >
          <div className="flex items-center justify-between gap-4">
            <span>{globalError || globalSuccess}</span>
            <button
              onClick={() => {
                setGlobalError(null);
                setGlobalSuccess(null);
              }}
              className="text-xs font-semibold tracking-wide uppercase"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        {(["proposals", "negotiations"] as TabKey[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
              activeTab === tab
                ? "bg-blue-600 text-white shadow"
                : "bg-white text-gray-700 shadow-sm hover:bg-blue-50"
            }`}
          >
            {tab === "proposals" ? "Proposals" : "Negotiations"}
          </button>
        ))}
      </div>

      {activeTab === "proposals" && (
        <div className="space-y-4">
          {loadingStates.proposals ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
              <p className="mt-4 text-gray-600">Loading proposals...</p>
            </div>
          ) : proposals.length > 0 ? (
            <div className="space-y-4">
              {proposals.map((proposal) => renderProposalCard(proposal))}
            </div>
          ) : (
            <div className="rounded-xl bg-white p-12 text-center shadow-md">
              <Mail className="mx-auto h-14 w-14 text-gray-400" />
              <h3 className="mt-4 text-xl font-semibold text-gray-900">
                No proposals found
              </h3>
              <p className="mt-2 text-gray-600">
                {role === "Brand"
                  ? "You haven't sent any proposals yet."
                  : "You haven't received any proposals yet."}
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === "negotiations" && renderNegotiations()}

      {negotiationModal.open && negotiationModal.proposal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="relative w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-700"
              onClick={() =>
                setNegotiationModal({
                  open: false,
                  proposal: null,
                  message: "",
                  termsText: "",
                  submitting: false,
                  error: null,
                })
              }
            >
              <X className="h-6 w-6" />
            </button>
            <h2 className="text-xl font-bold text-blue-900">
              Start Negotiation
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Let the brand know you're interested and share initial thoughts on
              terms.
            </p>
            <label className="mt-4 block text-sm font-semibold text-gray-700">
              Message
            </label>
            <textarea
              value={negotiationModal.message}
              onChange={(event) =>
                setNegotiationModal((prev) => ({
                  ...prev,
                  message: event.target.value,
                }))
              }
              rows={4}
              className="mt-2 w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
              placeholder="Share your excitement or highlight areas you'd like to adjust."
            />
            <label className="mt-4 block text-sm font-semibold text-gray-700">
              Proposed Terms (optional, JSON)
            </label>
            <textarea
              value={negotiationModal.termsText}
              onChange={(event) =>
                setNegotiationModal((prev) => ({
                  ...prev,
                  termsText: event.target.value,
                }))
              }
              rows={6}
              className="mt-2 w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
              placeholder='e.g. {"deliverables": "2 reels + 1 story", "amount": 25000}'
            />
            {negotiationModal.error && (
              <div className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                {negotiationModal.error}
              </div>
            )}
            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() =>
                  setNegotiationModal({
                    open: false,
                    proposal: null,
                    message: "",
                    termsText: "",
                    submitting: false,
                    error: null,
                  })
                }
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={submitNegotiationStart}
                disabled={negotiationModal.submitting}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
              >
                {negotiationModal.submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Starting...
                  </>
                ) : (
                  <>
                    <MessageCircle className="h-4 w-4" />
                    Start Negotiation
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {aiReview.open && aiReview.proposal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="animate-fade-in relative w-full max-w-xl rounded-2xl bg-white p-8 shadow-2xl">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"
              onClick={closeAiReview}
            >
              <X className="h-7 w-7" />
            </button>
            <h2 className="mb-1 text-2xl font-bold text-purple-900">
              AI Feedback
            </h2>
            <p className="mb-4 text-sm text-gray-600">
              Insights to help you evaluate this proposal.
            </p>
            <div
              className={`relative flex min-h-[320px] flex-col overflow-y-auto rounded-xl bg-gradient-to-br from-purple-50 via-white to-blue-50 p-6 ${
                (aiLoading ?? aiReview.loading) || (!aiReview.feedback && !aiReview.error)
                  ? "items-center justify-center"
                  : "items-start"
              }`}
              style={{ maxHeight: "70vh" }}
            >
              {(aiLoading ?? aiReview.loading) ? (
                <>
                  {/* Animated Icon */}
                  <div className="mb-4 flex flex-col items-center">
                    <span className="inline-block animate-pulse">
                      <svg
                        width="40"
                        height="40"
                        viewBox="0 0 24 24"
                        fill="none"
                        className="text-purple-500"
                      >
                        <path
                          d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <circle
                          cx="12"
                          cy="12"
                          r="5"
                          fill="currentColor"
                          className="opacity-20"
                        />
                      </svg>
                    </span>
                  </div>
                  {/* Progress Bar with Shimmer */}
                  <div className="relative mb-2 h-5 w-full max-w-md overflow-hidden rounded-full bg-purple-200">
                    <div
                      className="h-5 rounded-full bg-gradient-to-r from-purple-500 via-purple-400 to-blue-400 transition-all duration-500"
                      style={{ width: `${Math.min(aiProgress ?? 0, 100)}%` }}
                    ></div>
                    <div
                      className="animate-shimmer absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent"
                      style={{ backgroundSize: "200% 100%" }}
                    ></div>
                  </div>
                  {/* Main Status Message with Loader */}
                  <div className="mt-2 flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin text-purple-700" />
                    <span className="text-base font-semibold text-purple-800">
                      {aiStatusMessages && aiStatusIdx !== undefined
                        ? aiStatusMessages[aiStatusIdx]
                        : "Analyzing proposal..."}
                    </span>
                  </div>
                  {/* Fun/Engaging Sub-message */}
                  <div className="mt-2 text-xs font-medium text-blue-500">
                    {aiProgress !== undefined &&
                      aiProgress < 30 &&
                      "Warming up the AI engines..."}
                    {aiProgress !== undefined &&
                      aiProgress >= 30 &&
                      aiProgress < 70 &&
                      "AI is thinking hard!"}
                    {aiProgress !== undefined &&
                      aiProgress >= 70 &&
                      aiProgress < 100 &&
                      "Almost there..."}
                    {aiProgress !== undefined &&
                      aiProgress === 100 &&
                      "Finalizing feedback..."}
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    {aiProgress ?? 0}%
                  </div>
                </>
              ) : aiReview.error ? (
                <p className="animate-fade-in text-sm text-red-600">
                  {aiReview.error}
                </p>
              ) : aiReview.feedback ? (
                <div className="prose prose-sm animate-fade-in max-w-none w-full">
                  <ReactMarkdown>{aiReview.feedback}</ReactMarkdown>
                </div>
              ) : (
                <p className="animate-fade-in text-sm text-gray-600">
                  Running the proposal through AI...
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
